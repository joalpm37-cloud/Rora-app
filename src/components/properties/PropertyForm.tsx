import React, { useState, useRef } from 'react';
import { X, Save, Upload, Image as ImageIcon, ChevronRight, ChevronLeft, Check, Sparkles, Video, Eye } from 'lucide-react';
import { addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { collections } from '../../lib/collections';
import { storage } from '../../lib/firebase';
import { Property, PropertyType, PropertyOperation, PropertyStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../../lib/error-handling';
import { sendEventToMake } from '../../services/makeIntegration';
import { getApiUrl } from '../../lib/api-client';

interface PropertyFormProps {
  property?: Property | null;
  onClose: () => void;
}

const STEPS = [
  { id: 1, title: 'Básico', description: 'Info general' },
  { id: 2, title: 'Técnico', description: 'Detalles y m²' },
  { id: 3, title: 'Marketing', description: 'Lumen AI Vibe' },
  { id: 4, title: 'Galería', description: 'Fotos HD' }
];

export const PropertyForm: React.FC<PropertyFormProps> = ({ property, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
  const [renderingVideo, setRenderingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    address: property?.address || '',
    zone: property?.zone || '',
    type: property?.type || 'apartment' as PropertyType,
    operation: property?.operation || 'sale' as PropertyOperation,
    status: property?.status || 'active' as PropertyStatus,
    price: property?.price || 0,
    minPrice: property?.minPrice || 0,
    sqm: property?.sqm || 0,
    usableSqm: property?.usableSqm || 0,
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    floor: property?.floor || 0,
    hasElevator: property?.hasElevator || false,
    hasGarage: property?.hasGarage || false,
    description: property?.description || '',
    privateNotes: property?.privateNotes || '',
    coverPhoto: property?.coverPhoto || '',
    photos: property?.photos || [],
    // New marketing fields
    videoStyle: property?.videoStyle || 'cinematic',
    targetAudience: property?.targetAudience || '',
    usp: property?.usp || ''
  });

  const validateStep = () => {
    if (step === 1) {
      return formData.address && formData.zone && formData.price > 0;
    }
    if (step === 2) {
      return formData.sqm > 0;
    }
    if (step === 4) {
      return formData.photos.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    } else {
      alert("Por favor, completa los campos requeridos (*)");
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;
    
    const remainingSlots = 10 - formData.photos.length;
    if (remainingSlots <= 0) return;

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploadingImage(true);

    try {
      const newPhotos = [...formData.photos];
      for (const file of filesToUpload as any) {
        const storageRef = ref(storage, `properties/${user.agencyId || 'default'}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        newPhotos.push(downloadURL);
      }
      
      setFormData(prev => ({ 
        ...prev, 
        photos: newPhotos,
        coverPhoto: prev.coverPhoto || newPhotos[0]
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newPhotos = prev.photos.filter((_, i) => i !== index);
      return {
        ...prev,
        photos: newPhotos,
        coverPhoto: prev.coverPhoto === prev.photos[index] ? (newPhotos[0] || '') : prev.coverPhoto
      };
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let finalId = property?.id;
      const dataToSave = {
        ...formData,
        updatedAt: Timestamp.now(),
        agencyId: user.agencyId || 'default-agency',
        agentId: user.uid,
      };

      if (property) {
        const propertyRef = doc(collections.properties, property.id);
        await updateDoc(propertyRef, dataToSave);
      } else {
        // Use Server API for creation to ensure consistency
        const response = await fetch(getApiUrl('/api/properties'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...dataToSave,
            createdAt: Timestamp.now(),
          })
        });

        if (!response.ok) throw new Error('Error saving property');
        const resData = await response.json();
        finalId = resData.id;

        await sendEventToMake({
          type: "property.created",
          payload: { propertyId: finalId, ...formData }
        });
      }

      setCreatedPropertyId(finalId || null);
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      alert('Error al guardar la propiedad.');
    } finally {
      setLoading(false);
    }
  };

  const handleRenderVideo = async () => {
    if (!createdPropertyId) return;
    setRenderingVideo(true);
    try {
      const response = await fetch(getApiUrl('/api/video/render'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propiedadId: createdPropertyId,
          type: 'LUMEN_VIDEO_RENDER'
        })
      });
      if (response.ok) {
        alert("¡Renderizado iniciado! Podrás ver el progreso en el perfil de la propiedad.");
        onClose();
      } else {
        throw new Error("Error al iniciar el renderizado");
      }
    } catch (error) {
      console.error(error);
      alert("Error al contactar con el motor de video.");
    } finally {
      setRenderingVideo(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-obsidian-bg border border-obsidian-border rounded-3xl p-8 max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">¡Propiedad Guardada!</h2>
            <p className="text-obsidian-muted">El inventario se ha actualizado correctamente.</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={handleRenderVideo}
              disabled={renderingVideo}
              className="flex items-center justify-center gap-2 w-full py-4 bg-obsidian-primary text-obsidian-bg rounded-2xl font-bold hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {renderingVideo ? (
                <div className="w-5 h-5 border-2 border-obsidian-bg/30 border-t-obsidian-bg rounded-full animate-spin" />
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  Generar Video con Lumen AI
                </>
              )}
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 text-obsidian-muted hover:text-white transition-colors"
            >
              Cerrar y volver
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-obsidian-bg border border-obsidian-border rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header & Stepper */}
        <div className="p-6 border-b border-obsidian-border bg-obsidian-card/50">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-obsidian-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{property ? 'Editar Propiedad' : 'Captación de Propiedad'}</h2>
                <p className="text-xs text-obsidian-muted">Completa los pasos para activar el motor de marketing.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between px-4 sm:px-12 relative">
            <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-obsidian-border -translate-y-1/2 -z-10" />
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  step >= s.id ? 'bg-obsidian-primary border-obsidian-primary text-obsidian-bg font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-obsidian-bg border-obsidian-border text-obsidian-muted'
                }`}>
                  {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                </div>
                <div className="hidden sm:block text-center">
                  <p className={`text-[10px] font-bold uppercase tracking-tighter ${step >= s.id ? 'text-white' : 'text-obsidian-muted'}`}>{s.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-obsidian-muted">Título o Dirección *</label>
                      <input 
                        required
                        type="text" 
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full bg-obsidian-card border border-obsidian-border rounded-2xl px-5 py-3.5 outline-none focus:border-obsidian-primary transition-all shadow-inner"
                        placeholder="Ej: Ático Duplex en Puerto Banús"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-obsidian-muted">Zona / Ubicación *</label>
                      <input 
                        required
                        type="text" 
                        value={formData.zone}
                        onChange={e => setFormData({...formData, zone: e.target.value})}
                        className="w-full bg-obsidian-card border border-obsidian-border rounded-2xl px-5 py-3.5 outline-none focus:border-obsidian-primary transition-all"
                        placeholder="Ej: Marbella, Málaga"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-obsidian-muted">Precio de Venta (€) *</label>
                      <input 
                        required
                        type="number" 
                        value={formData.price || ''}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full bg-obsidian-card border border-obsidian-border rounded-2xl px-5 py-3.5 outline-none focus:border-obsidian-primary text-xl font-bold text-obsidian-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-obsidian-muted">Tipo</label>
                        <select 
                          value={formData.type}
                          onChange={e => setFormData({...formData, type: e.target.value as PropertyType})}
                          className="w-full bg-obsidian-card border border-obsidian-border rounded-2xl px-4 py-3.5 outline-none focus:border-obsidian-primary appearance-none capitalize"
                        >
                          <option value="apartment">Apartamento</option>
                          <option value="house">Chalet / Villa</option>
                          <option value="office">Oficina</option>
                          <option value="commercial">Local</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-obsidian-muted">Operación</label>
                        <select 
                          value={formData.operation}
                          onChange={e => setFormData({...formData, operation: e.target.value as PropertyOperation})}
                          className="w-full bg-obsidian-card border border-obsidian-border rounded-2xl px-4 py-3.5 outline-none focus:border-obsidian-primary appearance-none capitalize"
                        >
                          <option value="sale">Venta</option>
                          <option value="rental">Alquiler</option>
                          <option value="exclusive">Exclusiva</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-obsidian-muted">Sup. (m²) *</label>
                      <input 
                        type="number" 
                        value={formData.sqm || ''}
                        onChange={e => setFormData({...formData, sqm: Number(e.target.value)})}
                        className="w-full bg-obsidian-card border border-obsidian-border rounded-2xl px-5 py-3.5 outline-none focus:border-obsidian-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-obsidian-muted">Habitaciones</label>
                      <input 
                        type="number" 
                        value={formData.bedrooms || ''}
                        onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})}
                        className="w-full bg-obsidian-card border border-obsidian-border rounded-2xl px-5 py-3.5 outline-none focus:border-obsidian-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-obsidian-muted">Baños</label>
                      <input 
                        type="number" 
                        value={formData.bathrooms || ''}
                        onChange={e => setFormData({...formData, bathrooms: Number(e.target.value)})}
                        className="w-full bg-obsidian-card border border-obsidian-border rounded-2xl px-5 py-3.5 outline-none focus:border-obsidian-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-obsidian-muted">Planta</label>
                      <input 
                         type="number" 
                         value={formData.floor || ''}
                         onChange={e => setFormData({...formData, floor: Number(e.target.value)})}
                         className="w-full bg-obsidian-card border border-obsidian-border rounded-2xl px-5 py-3.5 outline-none focus:border-obsidian-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-8 p-6 bg-white/5 rounded-2xl">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${formData.hasElevator ? 'bg-obsidian-primary border-obsidian-primary' : 'border-obsidian-border group-hover:border-obsidian-primary/50'}`}>
                        {formData.hasElevator && <Check className="w-4 h-4 text-obsidian-bg" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={formData.hasElevator}
                        onChange={e => setFormData({...formData, hasElevator: e.target.checked})}
                      />
                      <span className="font-medium text-white">Ascensor</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${formData.hasGarage ? 'bg-obsidian-primary border-obsidian-primary' : 'border-obsidian-border group-hover:border-obsidian-primary/50'}`}>
                        {formData.hasGarage && <Check className="w-4 h-4 text-obsidian-bg" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={formData.hasGarage}
                        onChange={e => setFormData({...formData, hasGarage: e.target.checked})}
                      />
                      <span className="font-medium text-white">Garaje</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-obsidian-muted">Descripción Corta</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe los puntos fuertes de la propiedad..."
                      className="w-full bg-obsidian-card border border-obsidian-border rounded-2xl px-5 py-3.5 outline-none focus:border-obsidian-primary resize-none"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-obsidian-muted">Estilo de Video (Lumen AI)</label>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { id: 'cinematic', label: 'Cinematográfico', desc: 'Lento, elegante y con transiciones suaves' },
                            { id: 'fast', label: 'Dinámico / Reels', desc: 'Rápido, ideal para redes sociales' },
                            { id: 'luxury', label: 'Ultra Lujo', desc: 'Enfoque en detalles y acabados premium' }
                          ].map((style) => (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => setFormData({...formData, videoStyle: style.id})}
                              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                formData.videoStyle === style.id ? 'bg-obsidian-primary/10 border-obsidian-primary' : 'bg-obsidian-card border-obsidian-border hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-white">{style.label}</span>
                                {formData.videoStyle === style.id && <Check className="w-4 h-4 text-obsidian-primary" />}
                              </div>
                              <p className="text-xs text-obsidian-muted leading-relaxed">{style.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-obsidian-muted">Público Objetivo</label>
                        <input 
                          type="text" 
                          value={formData.targetAudience}
                          onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                          className="w-full bg-obsidian-card border border-obsidian-border rounded-2xl px-5 py-3.5 outline-none focus:border-obsidian-primary"
                          placeholder="Ej: Inversores internacionales, familias..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-obsidian-muted">Propuesta Única de Venta (USP)</label>
                        <textarea 
                          rows={5}
                          value={formData.usp}
                          onChange={e => setFormData({...formData, usp: e.target.value})}
                          placeholder="¿Qué hace que esta propiedad sea especial a diferencia del resto?"
                          className="w-full bg-obsidian-card border border-obsidian-border rounded-2xl px-5 py-3.5 outline-none focus:border-obsidian-primary resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <div 
                    className="aspect-[21/9] bg-obsidian-card border-2 border-dashed border-obsidian-border rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-obsidian-primary transition-all group overflow-hidden relative"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-obsidian-primary/30 border-t-obsidian-primary rounded-full animate-spin" />
                        <span className="text-sm font-bold text-obsidian-primary">Subiendo imágenes...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-obsidian-muted group-hover:text-obsidian-primary" />
                        </div>
                        <h4 className="text-lg font-bold">Haz clic para subir fotos</h4>
                        <p className="text-sm text-obsidian-muted text-center max-w-md px-4 mt-2">
                          Sube hasta 10 imágenes en alta resolución. La primera imagen será seleccionada como portada automáticamente.
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {formData.photos.map((photo: string, index: number) => (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={index} 
                        className="relative group aspect-square bg-obsidian-card border border-obsidian-border rounded-2xl overflow-hidden shadow-lg"
                      >
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-2 bg-rose-500 text-white rounded-xl hover:scale-110 transition-transform"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {formData.coverPhoto !== photo && (
                            <button 
                              type="button"
                              onClick={() => setFormData({...formData, coverPhoto: photo})}
                              className="p-2 bg-obsidian-primary text-obsidian-bg rounded-xl hover:scale-110 transition-transform"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {formData.coverPhoto === photo && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-obsidian-primary text-obsidian-bg text-[10px] font-bold rounded-lg uppercase shadow-lg">
                            Portada
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <input 
                    type="file" 
                    multiple
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Footer controls */}
        <div className="p-6 border-t border-obsidian-border flex justify-between items-center bg-obsidian-card/30">
          <div>
            {step > 1 && (
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-white/5 transition-colors border border-transparent hover:border-obsidian-border"
              >
                <ChevronLeft className="w-4 h-4" />
                Atrás
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {step < 4 ? (
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3.5 bg-white text-black rounded-2xl text-sm font-bold hover:bg-obsidian-primary transition-all shadow-xl shadow-obsidian-primary/10"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading || uploadingImage || formData.photos.length === 0}
                className="flex items-center gap-2 px-10 py-3.5 bg-obsidian-primary text-obsidian-bg rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-xl shadow-obsidian-primary/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Sincronizando...' : 'Publicar Propiedad'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
