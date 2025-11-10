export type DiaSemana = "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo";

export type HorarioAgrupado = {
  desde: string;            
  hasta: string;            
  dias: DiaSemana[];       
};

export type LugarAtencion = {
  idLugar?: number;
  calle: string;
  localidad?: string;
  provincia?: string;
  cp: string;             
  horarios: HorarioAgrupado[];
};

export type PrestadorTipo = "profesional" | "centro_medico";

export type Especialidad = {
  id: number;
  nombre: string;
};

export type Prestador = {
  cuitCuil: string;
  nombreCompleto: string;             
  tipoPrestador: PrestadorTipo;
  telefonos: string[];
  mails: string[];
  especialidades: Especialidad[];
  lugaresAtencion: LugarAtencion[];
  centroMedicoId?: string | null;  // Opcional: CUIT del centro médico si es profesional
};

