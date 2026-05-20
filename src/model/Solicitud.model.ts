export interface SolicitudAdmin {
  id: number;
  nro: string;
  prestador: string | null;
  prestadorCuit: string | null;
  afiliado: string | null;
  credencial: string | null;
  tipo: string;
  estado: string;
  motivoEstado: string | null;
  fecha: string;
  fechaEstado: string;
  descripcion: string;
  adjunto: { nombre: string; tipo: string; tamanio: number } | null;
}

export interface SolicitudesPageResponse {
  data: SolicitudAdmin[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SolicitudFilters {
  estado?: string;
  page?: number;
  limit?: number;
}
