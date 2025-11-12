export interface Telephone {
  idTelefono?: number;
  telefono: string;
}

export interface Plan {
  idPlan: number;
  nombre: string;
}

export interface Affiliate {
  grupoFamiliar?: string;
  tipoDocumento: string;
  apellido: string;
  credencial: string;
  fecha_nacimiento: string;
  direccion: string;
  dni: string;
  email: string;
  nombre: string;
  parentesco: string;
  telefonos: Telephone[];
  plan: Plan;
}
