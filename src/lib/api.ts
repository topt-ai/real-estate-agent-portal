import { supabase } from './supabase';
import { Property } from '../types';

type ListingRow = {
  id: string;
  titulo: string;
  precio: string;
  ubicacion: string;
  descripcion: string;
  habitaciones: string;
  banos: string;
  metros: string;
  whatsapp: string;
  tipo: string;
  status: string;
  featured: boolean;
  agent_id: string;
  listing_images: { url: string; order_index: number }[];
};

function rowToProperty(row: ListingRow): Property {
  const images = (row.listing_images ?? [])
    .sort((a, b) => a.order_index - b.order_index)
    .map((img) => img.url);
  return {
    id: row.id,
    titulo: row.titulo,
    precio: row.precio,
    ubicacion: row.ubicacion,
    descripcion: row.descripcion,
    habitaciones: row.habitaciones,
    banos: row.banos,
    metros: row.metros,
    whatsapp: row.whatsapp,
    tipo: (row.tipo === 'alquiler' ? 'alquiler' : 'venta') as Property['tipo'],
    status: (row.status as Property['status']) ?? 'publicado',
    featured: row.featured ?? false,
    fotos: images,
    agent_id: row.agent_id,
  };
}

export async function fetchListings(agentId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_images(url, order_index)')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchListings error:', error);
    return [];
  }
  return (data as ListingRow[]).map(rowToProperty);
}

export async function addListing(
  agentId: string,
  data: Omit<Property, 'id' | 'agent_id' | 'fotos'>,
  imageUrls: string[]
): Promise<string | null> {
  const { data: row, error } = await supabase
    .from('listings')
    .insert({
      titulo: data.titulo,
      precio: data.precio,
      ubicacion: data.ubicacion,
      descripcion: data.descripcion,
      habitaciones: data.habitaciones,
      banos: data.banos,
      metros: data.metros,
      whatsapp: data.whatsapp,
      tipo: data.tipo,
      status: data.status,
      featured: data.featured,
      agent_id: agentId,
    })
    .select('id')
    .single();

  if (error || !row) {
    console.error('addListing error:', error);
    return null;
  }

  if (imageUrls.length > 0) {
    await supabase.from('listing_images').insert(
      imageUrls.map((url, i) => ({ listing_id: row.id, url, order_index: i }))
    );
  }

  return row.id;
}

export async function updateListing(
  listingId: string,
  agentId: string,
  data: Omit<Property, 'id' | 'agent_id' | 'fotos'>,
  imageUrls: string[]
): Promise<boolean> {
  const { error } = await supabase
    .from('listings')
    .update({
      titulo: data.titulo,
      precio: data.precio,
      ubicacion: data.ubicacion,
      descripcion: data.descripcion,
      habitaciones: data.habitaciones,
      banos: data.banos,
      metros: data.metros,
      whatsapp: data.whatsapp,
      tipo: data.tipo,
      status: data.status,
      featured: data.featured,
    })
    .eq('id', listingId)
    .eq('agent_id', agentId);

  if (error) {
    console.error('updateListing error:', error);
    return false;
  }

  await supabase.from('listing_images').delete().eq('listing_id', listingId);
  if (imageUrls.length > 0) {
    await supabase.from('listing_images').insert(
      imageUrls.map((url, i) => ({ listing_id: listingId, url, order_index: i }))
    );
  }

  return true;
}

export async function deleteListing(listingId: string, agentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('agent_id', agentId);

  if (error) {
    console.error('deleteListing error:', error);
    return false;
  }
  return true;
}

export async function toggleListingStatus(
  listingId: string,
  agentId: string,
  status: Property['status']
): Promise<boolean> {
  const { error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', listingId)
    .eq('agent_id', agentId);

  if (error) {
    console.error('toggleListingStatus error:', error);
    return false;
  }
  return true;
}

export async function uploadImage(userId: string, file: File): Promise<string | null> {
  const path = `${userId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('property-images').upload(path, file);
  if (error) {
    console.error('uploadImage error:', error);
    return null;
  }
  const { data } = supabase.storage.from('property-images').getPublicUrl(path);
  return data.publicUrl;
}
