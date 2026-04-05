import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import { collections } from '../lib/collections';
import { Property } from '../types';
import { PropertyForm } from '../components/properties/PropertyForm';
import { PropertyProfile } from '../components/properties/PropertyProfile';
import { handleFirestoreError, OperationType } from '../lib/error-handling';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);

  useEffect(() => {
    const q = query(collections.properties, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const propertiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
      setProperties(propertiesData);
      setLoading(false);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'properties');
      } catch (e) {
        // Handled by error boundary or logged
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProperties = properties.filter(prop => {
    const matchesSearch = prop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prop.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCreateNew = () => {
    setPropertyToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (property: Property) => {
    setPropertyToEdit(property);
    setIsFormOpen(true);
    setSelectedProperty(null); // Close profile if open
  };

  return (
    <div className="space-y-8 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Propiedades</h1>
          <p className="text-obsidian-muted mt-1 text-sm md:text-base">Gestiona tu catálogo de propiedades de lujo.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nueva Propiedad
        </button>
      </header>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por dirección o zona..." 
            className="w-full bg-obsidian-card border border-obsidian-border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-obsidian-primary transition-colors"
          />
        </div>
        <button className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-obsidian-card border border-obsidian-border rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-obsidian-muted">Cargando propiedades...</div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12 text-obsidian-muted">No se encontraron propiedades.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div 
              key={property.id} 
              className="glass-card group cursor-pointer"
              onClick={() => setSelectedProperty(property)}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={property.coverPhoto || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'} 
                  alt={property.address} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full backdrop-blur-md border",
                    property.status === 'active' ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : 
                    property.status === 'reserved' ? "bg-amber-500/20 text-amber-500 border-amber-500/30" : 
                    "bg-white/20 text-white border-white/30"
                  )}>
                    {property.status === 'active' ? 'Activa' : 
                     property.status === 'reserved' ? 'Reservada' : 
                     property.status === 'sold' ? 'Vendida' : 'Retirada'}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(property); }}
                    className="p-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white border border-white/10 hover:bg-black/60 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg truncate pr-2">{property.address}</h3>
                    <span className="text-obsidian-primary font-bold whitespace-nowrap">
                      {property.price.toLocaleString()} €
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-obsidian-muted">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{property.zone}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-obsidian-border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-obsidian-muted">
                      <Bed className="w-4 h-4" />
                      <span className="font-bold text-white">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-obsidian-muted">
                      <Bath className="w-4 h-4" />
                      <span className="font-bold text-white">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-obsidian-muted">
                      <Maximize className="w-4 h-4" />
                      <span className="font-bold text-white">{property.sqm}m²</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-obsidian-muted group-hover:text-obsidian-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals & Slide-overs */}
      {isFormOpen && (
        <PropertyForm 
          property={propertyToEdit} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}

      {selectedProperty && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]" 
            onClick={() => setSelectedProperty(null)}
          />
          <PropertyProfile 
            property={selectedProperty} 
            onClose={() => setSelectedProperty(null)} 
            onEdit={handleEdit}
          />
        </>
      )}
    </div>
  );
};
