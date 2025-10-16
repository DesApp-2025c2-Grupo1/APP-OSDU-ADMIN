// Enum de días (0=Domingo ... 6=Sábado) compatible con Date.getDay()
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HorarioAtencion = {
  dias: DiaSemana[];        // p.ej. [1,2,3,4] = L a J
  desde: string;            // "08:00"
  hasta: string;            // "13:00"
  especialidadId?: string;  // opcional: horario específico para una especialidad
};

export type DireccionAtencion = {
  etiqueta?: string;        // "Sede Central", "Consultorio 1", etc.
  calle: string;
  numero?: string;
  localidad?: string;
  provincia?: string;
  cp: string;               // código postal
  horarios: HorarioAtencion[];
};

export type PrestadorTipo = "profesional" | "centro";

export type Prestador = {
  id: string;                         // interno (uuid/string)
  cuilCuit: string;
  nombreCompleto: string;             // un solo campo para simplificar búsqueda
  tipo: PrestadorTipo;

  // Especialidades por ID (sugerido mantener un catálogo)
  especialidades: string[];

  // Relación centro-profesional
  integraCentroMedico?: { id: string; nombre: string } | null; // solo profesionales

  // Datos de contacto (múltiples)
  telefonos: string[];
  emails: string[];

  // Lugares de atención (múltiples) + horarios por sede
  direcciones: DireccionAtencion[];
};

// Catálogo de especialidades (IDs y labels)
export type Especialidad = { id: string; nombre: string };
