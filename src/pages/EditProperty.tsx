import { useParams } from 'react-router-dom';
import PropertyForm from '@/components/PropertyForm';

export default function EditProperty() {
  const { id } = useParams();
  
  // TODO: Sheets API fetch property by ID
  // Mocking initial data for the prototype
  const mockData = {
    id,
    title: 'Casa Moderna en San Benito',
    price: 350000,
    location: 'San Benito, San Salvador',
    description: 'Hermosa casa con acabados modernos...',
    bedrooms: 3,
    bathrooms: 3.5,
    area: 250,
    whatsapp: '50370000000',
    photos: ['https://picsum.photos/seed/house1/400/400'],
    isActive: true,
  };

  return <PropertyForm initialData={mockData} isEditing />;
}
