import React, { useState, useRef } from 'react';
import { X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collections } from '../../lib/collections';
import { storage } from '../../lib/firebase';
import { Property, PropertyType, PropertyOperation, PropertyStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../../lib/error-handling';

interface PropertyFormProps {
  property?: Property | null;
  onClose: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ property, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `properties/${user.agencyId || 'default'}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setFormData(prev => ({ ...prev, coverPhoto: downloadURL }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error al subir la imagen. Verifica los permisos de Storage.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const finalCoverPhoto = formData.coverPhoto || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800';
      
      if (property) {
        // Update
        const propertyRef = doc(collections.properties, property.id);
        await updateDoc(propertyRef, {
          ...formData,
          coverPhoto: finalCoverPhoto
        });
      } else {
        // Create
        await addDoc(collections.properties, {
          ...formData,
          coverPhoto: finalCoverPhoto,
          agencyId: user.agencyId || 'default-agency',
          agentId: user.uid,
          photos: [finalCoverPhoto],
          matchedLeads: [],
          createdAt: Timestamp.now(),
        });
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, property ? OperationType.UPDATE : OperationType.CREATE, 'properties');
      alert('Error al guardar la propiedad. Revisa los permisos de Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-obsidian-bg border border-obsidian-border rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-obsidian-border">
          <h2 className="text-xl font-bold">{property ? 'Editar Propiedad' : 'Nueva Propiedad'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* Foto Principal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-obsidian-primary mb-4">Foto Principal</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div 
                className="w-full md:w-48 h-32 bg-obsidian-card border-2 border-dashed border-obsidian-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-obsidian-primary transition-colors overflow-hidden relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.coverPhoto ? (
                  <img src={formData.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-obsidian-muted mb-2" />
                    <span className="text-xs text-obsidian-muted font-medium">Subir Imagen</span>
                  </>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-obsidian-muted">
                  Sube una foto representativa de la propiedad. Esta imagen se mostrará en las tarjetas y listados.
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-4 py-2 bg-obsidian-card border border-obsidian-border rounded-xl text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingImage ? 'Subiendo...' : 'Seleccionar Archivo'}
                </button>
              </div>
            </div>
          </div>

          {/* Ubicación y Tipo */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-obsidian-primary mb-4">Ubicación y Tipo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-obsidian-muted">Dirección / Título *</label>
                <input 
                  required
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary"
                  placeholder="Ej: Villa Marítima"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-obsidian-muted">Zona / Ciudad *</label>
                <input 
                  required
                  type="text" 
                  value={formData.zone}
                  onChange={e => setFormData({...formData, zone: e.target.value})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary"
                  placeholder="Ej: Marbella, España"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-obsidian-muted">Tipo de Propiedad</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as PropertyType})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary appearance-none"
                >
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa / Chalet</option>
                  <option value="office">Oficina</option>
                  <option value="commercial">Local Comercial</option>
                  <option value="land">Terreno</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-obsidian-muted">Operación</label>
                <select 
                  value={formData.operation}
                  onChange={e => setFormData({...formData, operation: e.target.value as PropertyOperation})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary appearance-none"
                >
                  <option value="sale">Venta</option>
                  <option value="rental">Alquiler</option>
                  <option value="exclusive">Exclusiva</option>
                </select>
              </div>
            </div>
          </div>

          {/* Precios y Estado */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-obsidian-primary mb-4">Precios y Estado</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-obsidian-muted">Precio (€) *</label>
                <input 
                  required
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-obsidian-muted">Precio Mínimo (€)</label>
                <input 
                  type="number" 
                  value={formData.minPrice}
                  onChange={e => setFormData({...formData, minPrice: Number(e.target.value)})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-obsidian-muted">Estado</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as PropertyStatus})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary appearance-none"
                >
                  <option value="active">Activa (Publicada)</option>
                  <option value="reserved">Reservada</option>
                  <option value="sold">Vendida / Alquilada</option>
                  <option value="withdrawn">Retirada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Características */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-obsidian-primary mb-4">Características</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-obsidian-muted">Sup. Total (m²)</label>
                <input 
                  type="number" 
                  value={formData.sqm}
                  onChange={e => setFormData({...formData, sqm: Number(e.target.value)})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-obsidian-muted">Sup. Útil (m²)</label>
                <input 
                  type="number" 
                  value={formData.usableSqm}
                  onChange={e => setFormData({...formData, usableSqm: Number(e.target.value)})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-obsidian-muted">Habitaciones</label>
                <input 
                  type="number" 
                  value={formData.bedrooms}
                  onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-obsidian-muted">Baños</label>
                <input 
                  type="number" 
                  value={formData.bathrooms}
                  onChange={e => setFormData({...formData, bathrooms: Number(e.target.value)})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary"
                />
              </div>
            </div>
            <div className="flex gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.hasElevator}
                  onChange={e => setFormData({...formData, hasElevator: e.target.checked})}
                  className="w-4 h-4 rounded border-obsidian-border text-obsidian-primary focus:ring-obsidian-primary bg-obsidian-card"
                />
                <span className="text-sm text-obsidian-muted">Ascensor</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.hasGarage}
                  onChange={e => setFormData({...formData, hasGarage: e.target.checked})}
                  className="w-4 h-4 rounded border-obsidian-border text-obsidian-primary focus:ring-obsidian-primary bg-obsidian-card"
                />
                <span className="text-sm text-obsidian-muted">Garaje</span>
              </label>
            </div>
          </div>

          {/* Descripciones */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-obsidian-primary mb-4">Descripciones</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-obsidian-muted">Descripción Pública</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-obsidian-muted">Notas Privadas (Solo Agencia)</label>
                <textarea 
                  rows={2}
                  value={formData.privateNotes}
                  onChange={e => setFormData({...formData, privateNotes: e.target.value})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary resize-none"
                />
              </div>
            </div>
          </div>
        </form>
        
        <div className="p-6 border-t border-obsidian-border flex justify-end gap-3 bg-white/5">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || uploadingImage}
            className="flex items-center gap-2 px-4 py-2 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Propiedad'}
          </button>
        </div>
      </div>
    </div>
  );
};
