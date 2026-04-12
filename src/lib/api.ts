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

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

export async function addProperty(data: any): Promise<boolean> {
  if (!APPS_SCRIPT_URL) return false;
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: "add", data })
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error adding property:', error);
    return false;
  }
}

export async function updateProperty(rowIndex: number, data: any): Promise<boolean> {
  if (!APPS_SCRIPT_URL) return false;
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: "update", rowIndex, data })
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error updating property:', error);
    return false;
  }
}

export async function deleteProperty(rowIndex: number): Promise<boolean> {
  if (!APPS_SCRIPT_URL) return false;
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: "delete", rowIndex })
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting property:', error);
    return false;
  }
}
