import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Property } from '@/types';
import { fetchListings, updateProperty, deleteProperty } from '@/lib/api';
import { useUser } from '@clerk/clerk-react';

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const { user } = useUser();
  const sheetId = user?.publicMetadata?.sheetId as string;

  const loadProperties = async () => {
    if (sheetId) {
      const data = await fetchListings(sheetId);
      setProperties(data);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [sheetId]);

  const toggleStatus = async (id: string, index: number) => {
    const property = properties.find(p => p.id === id);
    if (!property) return;
    
    const newStatus = !property.activo;
    
    // Optimistic update
    setProperties(properties.map(p => 
      p.id === id ? { ...p, activo: newStatus } : p
    ));

    const success = await updateProperty(index + 2, { activo: newStatus });
    if (!success) {
      // Revert if failed
      setProperties(properties.map(p => 
        p.id === id ? { ...p, activo: !newStatus } : p
      ));
    }
  };

  const handleDelete = async (id: string, index: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) return;

    const success = await deleteProperty(index + 2);
    if (success) {
      setProperties(properties.filter(p => p.id !== id));
    } else {
      alert('Error eliminando propiedad');
    }
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
              {properties.map((property, index) => (
                <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    {property.fotos && property.fotos.length > 0 ? (
                      <img 
                        src={property.fotos[0]} 
                        alt={property.titulo} 
                        className="w-16 h-16 object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-brand-primary">{property.titulo}</td>
                  <td className="p-4 text-gray-600">
                    ${Number(property.precio || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-600">{property.ubicacion}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(property.id, index)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        property.activo ? 'bg-brand-accent' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          property.activo ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/editar/${property.id}`}
                        state={{ rowIndex: index + 2 }}
                        className="p-2 text-gray-400 hover:text-brand-accent transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(property.id, index)}
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
