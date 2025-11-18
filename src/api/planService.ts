import { API_BASE_URL } from "../config/api";

export interface Plan {
  idPlan: number;
  nombre: string;
}

/**
 * Obtiene la lista completa de planes desde el backend
 */
export const fetchPlans = async (): Promise<Plan[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/plans`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener planes: ${response.status}`);
    }

    const data = await response.json();
    
    // El backend devuelve un array directo
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error en fetchPlans:", error);
    throw error;
  }
};

/**
 * Obtiene un plan específico por ID
 */
export const fetchPlanById = async (id: number): Promise<Plan | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/plans/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error al obtener plan: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en fetchPlanById:", error);
    throw error;
  }
};
