import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { Property } from '@/types';
import { addProperty, updateProperty } from '@/lib/api';

interface PropertyFormProps {
  initialData?: Partial<Property>;
  isEditing?: boolean;
  rowIndex?: number;
}

export default function PropertyForm({ initialData, isEditing, rowIndex }: PropertyFormProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Property>>({
    titulo: '',
    precio: '',
    ubicacion: '',
    descripcion: '',
    habitaciones: '',
    banos: '',
    metros: '',
    whatsapp: '',
    fotos: [],
    activo: true,
    tipo: 'venta',
    ...initialData,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? value.toString() : value
    }));
  };

  const handleToggleActive = () => {
    setFormData(prev => ({ ...prev, activo: !prev.activo }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Formatting data array corresponding to Google Sheet columns
    // Columns: id, titulo, precio, ubicacion, descripcion, habitaciones, baños, metros, fotos, whatsapp, activo, tipo
    const dataObj = {
      id: formData.id || crypto.randomUUID(),
      titulo: formData.titulo || '',
      precio: formData.precio || '',
      ubicacion: formData.ubicacion || '',
      descripcion: formData.descripcion || '',
      habitaciones: formData.habitaciones || '',
      banos: formData.banos || '',
      metros: formData.metros || '',
      fotos: formData.fotos?.join(',') || '',
      whatsapp: formData.whatsapp || '',
      activo: formData.activo ? 'Activo' : 'Inactivo',
      tipo: formData.tipo || 'venta'
    };

    let success = false;
    if (isEditing && rowIndex !== undefined) {
      success = await updateProperty(rowIndex, dataObj);
    } else {
      success = await addProperty(dataObj);
    }

    setIsSubmitting(false);

    if (success) {
      navigate('/dashboard');
    } else {
      alert('Error guardando la propiedad. Por favor, intenta de nuevo.');
    }
  };

  const uploadImagesToCloudinary = async (files: File[]) => {
    setIsUploading(true);
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Missing Cloudinary configuration in .env");
      setIsUploading(false);
      return;
    }

    const uploadPromises = files.map(file => {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', uploadPreset);

      return fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: data,
      }).then(res => res.json());
    });

    try {
      const results = await Promise.all(uploadPromises);
      const urls = results.map(result => result.secure_url).filter(Boolean);
      setFormData(prev => ({
        ...prev,
        fotos: [...(prev.fotos || []), ...urls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error subiendo imágenes al servidor');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = (Array.from(e.dataTransfer.files) as File[]).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      uploadImagesToCloudinary(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = (Array.from(e.target.files) as File[]).filter(file => file.type.startsWith('image/'));
      if (files.length > 0) {
        uploadImagesToCloudinary(files);
      }
    }
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
              formData.activo ? 'bg-brand-accent' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.activo ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm font-medium">
            {formData.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      <div className="bg-brand-white rounded-xl shadow-sm p-6 space-y-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <input
              type="text"
              name="titulo"
              required
              value={formData.titulo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              placeholder="Ej. Casa Moderna en San Benito"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              name="tipo"
              required
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
            >
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
            <input
              type="number"
              name="precio"
              required
              min="0"
              value={formData.precio || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              placeholder="0"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Ubicación</label>
            <input
              type="text"
              name="ubicacion"
              required
              value={formData.ubicacion}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              placeholder="Ej. San Benito, San Salvador"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="descripcion"
              required
              rows={4}
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all resize-none"
              placeholder="Describe la propiedad..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Habitaciones</label>
            <input
              type="number"
              name="habitaciones"
              min="0"
              value={formData.habitaciones || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Baños</label>
            <input
              type="number"
              name="banos"
              min="0"
              step="0.5"
              value={formData.banos || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Metros Cuadrados</label>
            <input
              type="number"
              name="metros"
              min="0"
              value={formData.metros || ''}
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
        
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />

        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
             <div className="flex flex-col items-center justify-center">
               <Loader2 className="animate-spin text-brand-accent h-12 w-12 mb-4" />
               <p className="text-gray-600 font-medium">Subiendo imágenes...</p>
             </div>
          ) : (
            <>
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">Arrastra tus fotos aquí</p>
              <p className="text-sm text-gray-400 mt-1">o haz clic para seleccionar</p>
            </>
          )}
        </div>

        {formData.fotos && formData.fotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
            {formData.fotos.map((photo, index) => (
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
                      fotos: prev.fotos?.filter((_, i) => i !== index)
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
          disabled={isSubmitting || isUploading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="px-6 py-3 bg-brand-accent hover:bg-brand-accent-hover text-brand-white font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="animate-spin h-4 w-4" />}
          {isEditing ? 'Guardar Cambios' : 'Publicar Propiedad'}
        </button>
      </div>
    </form>
  );
}
