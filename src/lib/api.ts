import { Property } from '../types';

export async function fetchListings(sheetId: string): Promise<Property[]> {
  if (!sheetId) return [];

  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const data = JSON.parse(text.substring(47).slice(0, -2));
    const rows = data.table.rows;
    
    const listings: Property[] = rows.map((row: any) => {
      const c = row.c;
      const activoVal = c[10]?.v;
      const isActivo = activoVal === true || activoVal === 'TRUE' || activoVal === 'true' || activoVal === 'Activo' || activoVal === 1;
      
      const idStr = c[0]?.v?.toString() || '';
      
      if (!idStr) return null;

      return {
        id: idStr,
        titulo: c[1]?.v?.toString() || '',
        precio: c[2]?.v?.toString() || '',
        ubicacion: c[3]?.v?.toString() || '',
        descripcion: c[4]?.v?.toString() || '',
        habitaciones: c[5]?.v?.toString() || '',
        banos: c[6]?.v?.toString() || '',
        metros: c[7]?.v?.toString() || '',
        fotos: c[8]?.v?.toString().split(',').map((url: string) => url.trim()).filter(Boolean) || [],
        whatsapp: c[9]?.v?.toString() || '',
        activo: isActivo,
        tipo: c[11]?.v?.toString()?.toLowerCase() === 'alquiler' ? 'alquiler' : 'venta',
      };
    }).filter(Boolean);
    
    return listings;
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return [];
  }
}

const WEBHOOK_URL = import.meta.env.VITE_DEV_MODE === "true"
  ? import.meta.env.VITE_N8N_WEBHOOK_URL_TEST
  : import.meta.env.VITE_N8N_WEBHOOK_URL;

export async function addProperty(data: any, sheetId: string): Promise<boolean> {
  if (!WEBHOOK_URL || !sheetId) return false;
  try {
    data.id = Date.now().toString();
    
    // Ensure all data fields are in correct order and format
    const formattedData = {
      id: data.id,
      titulo: data.titulo || '',
      precio: data.precio || '',
      ubicacion: data.ubicacion || '',
      descripcion: data.descripcion || '',
      habitaciones: data.habitaciones || '',
      banos: data.banos || '',
      metros: data.metros || '',
      fotos: data.fotos || '',
      whatsapp: data.whatsapp || '',
      activo: data.activo === true || data.activo === 'true' || data.activo === 'Activo',
      tipo: data.tipo || 'venta'
    };

    console.log('Sending addProperty request to:', WEBHOOK_URL, 'with data:', JSON.stringify({ action: "add", sheetId, data: formattedData }));
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: "add", sheetId, data: formattedData })
    });
    console.log('Successfully completed addProperty fetch call');
    return true;
  } catch (error) {
    console.error('Error adding property:', error);
    return false;
  }
}

export async function updateProperty(rowIndex: number, data: any, sheetId: string): Promise<boolean> {
  if (!WEBHOOK_URL || !sheetId) return false;
  try {
    const formattedData = {
      id: data.id,
      titulo: data.titulo || '',
      precio: data.precio || '',
      ubicacion: data.ubicacion || '',
      descripcion: data.descripcion || '',
      habitaciones: data.habitaciones || '',
      banos: data.banos || '',
      metros: data.metros || '',
      fotos: data.fotos || '',
      whatsapp: data.whatsapp || '',
      activo: data.activo === true || data.activo === 'true' || data.activo === 'Activo',
      tipo: data.tipo || 'venta'
    };

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: "update", sheetId, rowIndex, data: formattedData })
    });
    return true;
  } catch (error) {
    console.error('Error updating property:', error);
    return false;
  }
}

export async function deleteProperty(rowIndex: number, sheetId: string): Promise<boolean> {
  if (!WEBHOOK_URL || !sheetId) return false;
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: "delete", sheetId, rowIndex })
    });
    return true;
  } catch (error) {
    console.error('Error deleting property:', error);
    return false;
  }
}
