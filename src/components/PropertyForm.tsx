import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X } from 'lucide-react';
import { Property } from '@/types';

interface PropertyFormProps {
  initialData?: Partial<Property>;
  isEditing?: boolean;
}

export default function PropertyForm({ initialData, isEditing }: PropertyFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    price: 0,
    location: '',
    description: '',
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    whatsapp: '',
    photos: [],
    isActive: true,
    ...initialData,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleToggleActive = () => {
    setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Sheets API create/update
    console.log('Submitting:', formData);
    navigate('/dashboard');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // TODO: Cloudinary upload
    console.log('Files dropped');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-primary">
          {isEditing ? 'Editar Propiedad' : 'Agregar Propiedad'}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Estado:</span>
          <button
            type="button"
            onClick={handleToggleActive}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              formData.isActive ? 'bg-brand-accent' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm font-medium">
            {formData.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      <div className="bg-brand-white rounded-xl shadow-sm p-6 space-y-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              placeholder="Ej. Casa Moderna en San Benito"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
            <input
              type="number"
              name="price"
              required
              min="0"
              value={formData.price || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              placeholder="0"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Ubicación</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              placeholder="Ej. San Benito, San Salvador"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all resize-none"
              placeholder="Describe la propiedad..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Habitaciones</label>
            <input
              type="number"
              name="bedrooms"
              min="0"
              value={formData.bedrooms || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Baños</label>
            <input
              type="number"
              name="bathrooms"
              min="0"
              step="0.5"
              value={formData.bathrooms || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Metros Cuadrados</label>
            <input
              type="number"
              name="area"
              min="0"
              value={formData.area || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">WhatsApp de Contacto</label>
            <input
              type="text"
              name="whatsapp"
              required
              value={formData.whatsapp}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              placeholder="Ej. 50370000000"
            />
          </div>
        </div>
      </div>

      <div className="bg-brand-white rounded-xl shadow-sm p-6 space-y-4 border border-gray-100">
        <h2 className="text-lg font-medium text-gray-900">Fotos</h2>
        
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => {
            // TODO: Trigger file input
          }}
        >
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">Arrastra tus fotos aquí</p>
          <p className="text-sm text-gray-400 mt-1">o haz clic para seleccionar</p>
        </div>

        {formData.photos && formData.photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={photo} 
                  alt={`Preview ${index}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      photos: prev.photos?.filter((_, i) => i !== index)
                    }))
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-brand-accent hover:bg-brand-accent-hover text-brand-white font-medium rounded-lg transition-colors cursor-pointer"
        >
          Publicar Propiedad
        </button>
      </div>
    </form>
  );
}
