import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Property } from '@/types';

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    // TODO: Sheets API fetch
    // Mock data for now
    setProperties([
      {
        id: '1',
        title: 'Casa Moderna en San Benito',
        price: 350000,
        location: 'San Benito, San Salvador',
        description: 'Hermosa casa con acabados modernos...',
        bedrooms: 3,
        bathrooms: 3.5,
        area: 250,
        whatsapp: '50370000000',
        photos: ['https://picsum.photos/seed/house1/200/200'],
        isActive: true,
      },
      {
        id: '2',
        title: 'Apartamento con Vista',
        price: 180000,
        location: 'Escalón, San Salvador',
        description: 'Apartamento en nivel alto...',
        bedrooms: 2,
        bathrooms: 2,
        area: 120,
        whatsapp: '50370000000',
        photos: [],
        isActive: false,
      }
    ]);
  }, []);

  const toggleStatus = (id: string) => {
    // TODO: Sheets API update status
    setProperties(properties.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const handleDelete = (id: string) => {
    // Note: In a real app we'd use a custom modal instead of window.confirm
    // but for the sake of the prototype, we'll just delete it directly or use a simple state.
    // TODO: Sheets API delete
    setProperties(properties.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-brand-primary">Mis Propiedades</h1>
        <Link 
          to="/agregar" 
          className="bg-brand-accent hover:bg-brand-accent-hover text-brand-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Agregar Propiedad
        </Link>
      </div>

      <div className="bg-brand-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                <th className="p-4 font-medium">Foto</th>
                <th className="p-4 font-medium">Título</th>
                <th className="p-4 font-medium">Precio</th>
                <th className="p-4 font-medium">Ubicación</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    {property.photos.length > 0 ? (
                      <img 
                        src={property.photos[0]} 
                        alt={property.title} 
                        className="w-16 h-16 object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-brand-primary">{property.title}</td>
                  <td className="p-4 text-gray-600">
                    ${property.price.toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-600">{property.location}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(property.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        property.isActive ? 'bg-brand-accent' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          property.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/editar/${property.id}`}
                        className="p-2 text-gray-400 hover:text-brand-accent transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No tienes propiedades publicadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
