import React from 'react';
import { X, MapPin, Bed, Bath, Maximize, Euro, Calendar, Edit2, Lock } from 'lucide-react';
import { Property } from '../../types';

interface PropertyProfileProps {
  property: Property;
  onClose: () => void;
  onEdit: (property: Property) => void;
}

export const PropertyProfile: React.FC<PropertyProfileProps> = ({ property, onClose, onEdit }) => {
  return (
    <div className="fixed inset-y-0 right-0 z-[100] w-full md:w-[480px] bg-obsidian-bg border-l border-obsidian-border shadow-2xl flex flex-col transform transition-transform duration-300">
      <div className="flex items-center justify-between p-6 border-b border-obsidian-border bg-white/5">
        <h2 className="text-xl font-bold">Detalles de Propiedad</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(property)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-obsidian-muted hover:text-white">
            <Edit2 className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-obsidian-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Cover Photo */}
        <div className="relative h-64 w-full">
          <img 
            src={property.coverPhoto} 
            alt={property.address} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md border bg-black/40 text-white border-white/30">
              {property.status === 'active' ? 'Activa' : 
               property.status === 'reserved' ? 'Reservada' : 
               property.status === 'sold' ? 'Vendida' : 'Retirada'}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-obsidian-bg to-transparent" />
        </div>

        <div className="p-6 space-y-8 -mt-12 relative z-10">
          {/* Header Info */}
          <div>
            <h3 className="text-2xl font-bold">{property.address}</h3>
            <div className="flex items-center gap-2 mt-2 text-obsidian-muted text-sm">
              <MapPin className="w-4 h-4" />
              <span>{property.zone}</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-obsidian-primary">
                {property.price.toLocaleString()} €
              </span>
              <span className="text-sm text-obsidian-muted uppercase tracking-wider">
                {property.operation === 'sale' ? 'Venta' : property.operation === 'rental' ? 'Alquiler' : 'Exclusiva'}
              </span>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4 flex flex-col items-center justify-center gap-2">
              <Bed className="w-6 h-6 text-obsidian-muted" />
              <span className="font-bold">{property.bedrooms}</span>
              <span className="text-[10px] uppercase tracking-wider text-obsidian-muted">Hab.</span>
            </div>
            <div className="glass-card p-4 flex flex-col items-center justify-center gap-2">
              <Bath className="w-6 h-6 text-obsidian-muted" />
              <span className="font-bold">{property.bathrooms}</span>
              <span className="text-[10px] uppercase tracking-wider text-obsidian-muted">Baños</span>
            </div>
            <div className="glass-card p-4 flex flex-col items-center justify-center gap-2">
              <Maximize className="w-6 h-6 text-obsidian-muted" />
              <span className="font-bold">{property.sqm}</span>
              <span className="text-[10px] uppercase tracking-wider text-obsidian-muted">m²</span>
            </div>
          </div>

          {/* Additional Features */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium border border-obsidian-border">
              Tipo: <span className="capitalize">{property.type}</span>
            </span>
            {property.hasElevator && (
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium border border-obsidian-border">
                Ascensor
              </span>
            )}
            {property.hasGarage && (
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium border border-obsidian-border">
                Garaje
              </span>
            )}
            {property.usableSqm > 0 && (
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium border border-obsidian-border">
                Útiles: {property.usableSqm} m²
              </span>
            )}
            {property.floor > 0 && (
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium border border-obsidian-border">
                Planta {property.floor}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-obsidian-muted">Descripción</h4>
            <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
              {property.description || 'Sin descripción pública.'}
            </p>
          </div>

          {/* Private Notes */}
          <div className="glass-card p-5 space-y-3 border-amber-500/30 bg-amber-500/5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Notas Privadas
            </h4>
            <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
              {property.privateNotes || 'No hay notas privadas.'}
            </p>
            {property.minPrice > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-500/20 flex items-center justify-between">
                <span className="text-xs text-amber-500/70">Precio Mínimo Aceptado</span>
                <span className="font-bold text-amber-500">{property.minPrice.toLocaleString()} €</span>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-obsidian-muted pt-4 border-t border-obsidian-border">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Añadida: {property.createdAt instanceof Date ? property.createdAt.toLocaleDateString() : property.createdAt?.toDate().toLocaleDateString()}</span>
            </div>
            <span>ID: {property.id.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
