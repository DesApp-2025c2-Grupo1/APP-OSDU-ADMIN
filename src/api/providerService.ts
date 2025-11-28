import type { Prestador } from "../model/Provider.model";
import { API_BASE_URL } from "../config/api";

/**
 * Obtiene la lista completa de proveedores desde el back-end
 */
export const fetchProviders = async (): Promise<Prestador[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/providers`);

    if (!response.ok) {
      throw new Error(`Error al obtener proveedores: ${response.status}`);
    }

    const data = await response.json();

    // El back-end devuelve un array directo o un objeto con propiedad 'prestadores'
    const providers = Array.isArray(data) ? data : data.prestadores || [];

    return providers;
  } catch (error) {
    throw error;
  }
};

export async function checkProviderSpecialtyAgendas(
  cuitCuil: string,
  specialtyId: number
): Promise<{ agendas: any[]; count: number }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/providers/${cuitCuil}/agendas-by-specialty?specialtyId=${specialtyId}`
    );

    if (!response.ok) {
      throw new Error('Error al verificar agendas');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function checkProviderPlaceAgendas(
  cuitCuil: string
): Promise<{ agendas: any[]; count: number }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/providers/${cuitCuil}/agendas-by-places`
    );

    if (!response.ok) {
      throw new Error('Error al verificar agendas de lugares');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}


/**
 * Obtiene un proveedor específico por CUIT/CUIL
 */
export const fetchProviderByCuit = async (cuitCuil: string): Promise<Prestador> => {
  try {
    const response = await fetch(`${API_BASE_URL}/providers/${cuitCuil}`);

    if (!response.ok) {
      throw new Error(`Proveedor no encontrado: ${cuitCuil}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Crea un nuevo proveedor
 */
export const createProvider = async (provider: Omit<Prestador, "lugarAtencion"> & { lugarAtencion?: any }): Promise<Prestador> => {
  try {
    const response = await fetch(`${API_BASE_URL}/providers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(provider),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al crear proveedor`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza un proveedor existente
 */
export const updateProvider = async (cuitCuil: string, updates: Partial<Prestador>): Promise<Prestador> => {
  try {

    const response = await fetch(`${API_BASE_URL}/providers/${cuitCuil}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });


    if (!response.ok) {
      const errorData = await response.json();

      // Mostrar errores específicos si existen
      if (errorData.errores && Array.isArray(errorData.errores)) {
        const errorMessages = errorData.errores.map((e: any) => e.mensaje || e.message || JSON.stringify(e)).join(', ');
        throw new Error(`Error de validación: ${errorMessages}`);
      }

      throw new Error(errorData.error || errorData.message || `Error al actualizar proveedor (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina un proveedor
 */
export const deleteProvider = async (cuitCuil: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/providers/${cuitCuil}`, {
      method: "DELETE",
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Error al eliminar proveedor: ${cuitCuil}`);
    }
  } catch (error) {
    throw error;
  }
};
