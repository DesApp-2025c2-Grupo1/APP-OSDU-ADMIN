export interface ReintegroAdmin {
  id: number;
  nro: string;
  afiliado: string | null;
  credencial: string | null;
  fechaPrestacion: string;
  medico: string;
  especialidad: string;
  lugarAtencion: string;
  factura: { cuit: string; valorTotal: number };
  formaPago: string;
  cbu: string | null;
  observaciones: string;
  estado: string;
  estadoRaw: string;
  motivoEstado: string | null;
  fechaEstado: string;
  mensajeObservacion: string | null;
}

export interface ReintegrosPageResponse {
  data: ReintegroAdmin[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ReintegroFilters {
  status?: string;
  page?: number;
  limit?: number;
}
