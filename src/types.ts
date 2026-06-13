export interface Property {
  id: string;
  titulo: string;
  precio: string;
  ubicacion: string;
  descripcion: string;
  habitaciones: string;
  banos: string;
  metros: string;
  fotos: string[];
  whatsapp: string;
  status: 'publicado' | 'borrador' | 'archivado';
  featured: boolean;
  tipo: 'venta' | 'alquiler';
  agent_id?: string;
}
