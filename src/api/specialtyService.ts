import { API_BASE_URL } from "../config/api";
import type { Especialidad } from "../model/Provider.model";

/**
 * Obtiene la lista completa de especialidades desde el backend
 */
export const fetchSpecialties = async (): Promise<Especialidad[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/specialties`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener especialidades: ${response.status}`);
    }

    const data = await response.json();
    
    // El backend devuelve un array directo
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error en fetchSpecialties:", error);
    throw error;
  }
};

/**
 * Obtiene una especialidad específica por ID
 */
export const fetchSpecialtyById = async (id: number): Promise<Especialidad | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/specialties/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error al obtener especialidad: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en fetchSpecialtyById:", error);
    throw error;
  }
};
