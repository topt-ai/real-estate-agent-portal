import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import PropertyForm from '@/components/PropertyForm';
import { fetchListings } from '@/lib/api';
import { Property } from '@/types';
import { useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

export default function EditProperty() {
  const { id } = useParams();
  const location = useLocation();
  const rowIndex = location.state?.rowIndex;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const sheetId = user?.publicMetadata?.sheetId as string;

  useEffect(() => {
    const loadData = async () => {
      if (sheetId && id) {
        setLoading(true);
        const data = await fetchListings(sheetId);
        const found = data.find(p => p.id === id);
        if (found) {
          setProperty(found);
        }
        setLoading(false);
      }
    };
    loadData();
  }, [sheetId, id]);

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

  return <PropertyForm initialData={property} isEditing rowIndex={rowIndex} />;
}
