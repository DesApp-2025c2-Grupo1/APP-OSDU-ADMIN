export type DiaSemana = "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo";

export type HorarioAgrupado = {
  desde: string;            
  hasta: string;            
  dias: DiaSemana[];       
};

export type LugarAtencion = {
  idLugar?: number | string;
  calle: string;
  localidad?: string;
  provincia?: string;
  cp: string;             
  horarios: HorarioAgrupado[];
};

export type PrestadorTipo = "profesional" | "centro_medico";
export type PrestadorEstado = "activo" | "suspendido" | "baja";

export type Especialidad = {
  id: number;
  nombre: string;
};

export type Prestador = {
  id?: number | string;
  userId?: number;
  cuitCuil: string;
  nombreCompleto: string;             
  tipoPrestador: PrestadorTipo;
  estado?: PrestadorEstado;
  status?: boolean;
  telefonos: string[];
  mails: string[];
  emailPrincipal?: string;
  telefonoPrincipal?: string;
  especialidades: Especialidad[];
  lugaresAtencion: LugarAtencion[];
  centroMedicoId?: string | null;  // CUIT del centro médico si es profesional
  centroMedico?: {
    id: number;
    cuitCuil: string;
    nombreCompleto: string;
  } | null;
  cuenta?: {
    id: number;
    email: string;
      rol: string;
      debeCambiarPassword: boolean;
      credencialesEnviadasAt?: string;
      passwordReseteadaAt?: string;
  } | null;
  agendas?: {
    id: number;
    especialidad?: string;
    lugar?: string;
    duracionTurno?: number;
    fechaInicio?: string;
    fechaFin?: string;
    estaActivo: boolean;
    bloques?: HorarioAgrupado[];
  }[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProviderFilters = {
  search?: string;
  nombre?: string;
  cuitCuil?: string;
  especialidad?: string;
  tipoPrestador?: PrestadorTipo | "todos";
  localidad?: string;
  estado?: PrestadorEstado | "todos";
  centroMedicoId?: string;
  page?: number;
  limit?: number;
};

export type ProviderPage = {
  data: Prestador[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
