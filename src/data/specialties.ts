import type { Especialidad } from "../model/Provider.model";
import { fetchSpecialties } from "../api/specialtyService";

// Array de especialidades con valores por defecto
export let SPECIALTIES: Especialidad[] = [
  { id: 1, nombre: "Clínica" },
  { id: 2, nombre: "Pediatría" },
  { id: 3, nombre: "Cardiología" },
  { id: 4, nombre: "Dermatología" },
  { id: 5, nombre: "Oftalmología" },
  { id: 6, nombre: "Otorrinolaringología" },
  { id: 7, nombre: "Ginecología" },
  { id: 8, nombre: "Resonancias" },
];

// Función para cargar las especialidades desde el backend
export const loadSpecialties = async (): Promise<Especialidad[]> => {
  try {
    SPECIALTIES = await fetchSpecialties();
    return SPECIALTIES;
  } catch (error) {
    return SPECIALTIES;
  }
};
