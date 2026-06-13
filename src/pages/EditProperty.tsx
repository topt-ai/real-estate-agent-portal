import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropertyForm from '@/components/PropertyForm';
import { fetchListings } from '@/lib/api';
import { Property } from '@/types';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function EditProperty() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (user && id) {
        setLoading(true);
        const data = await fetchListings(user.id);
        const found = data.find(p => p.id === id);
        setProperty(found ?? null);
        setLoading(false);
      }
    };
    loadData();
  }, [user, id]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-brand-accent h-12 w-12" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl text-gray-600">Propiedad no encontrada</h2>
      </div>
    );
  }

  return <PropertyForm initialData={property} isEditing />;
}
