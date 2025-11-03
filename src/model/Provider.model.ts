export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HorarioAtencion = {
  dias: DiaSemana[];       
  desde: string;            
  hasta: string;            
  especialidadId?: string;
};

export type DireccionAtencion = {
  etiqueta?: string;        
  calle: string;
  numero?: string;
  localidad?: string;
  provincia?: string;
  cp: string;             
  horarios: HorarioAtencion[];
};

export type PrestadorTipo = "profesional" | "centro";

export type Prestador = {
  id: string;                         
  cuilCuit: string;
  nombreCompleto: string;             
  tipo: PrestadorTipo;

  
  especialidades: string[];


  integraCentroMedico?: { id: string; nombre: string } | null; 


  telefonos: string[];
  emails: string[];


  direcciones: DireccionAtencion[];
};


export type Especialidad = { id: string; nombre: string };
