import type { Prestador, ProviderFilters, ProviderPage } from "../model/Provider.model";
import { API_BASE_URL, apiFetch } from "../config/api";

const buildProviderQuery = (filters: ProviderFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "todos") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
};

/**
 * Obtiene la lista completa de prestadores desde el back-end
 */
export const fetchProviders = async (filters: ProviderFilters = {}): Promise<Prestador[]> => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/prestadores${buildProviderQuery(filters)}`);

    if (!response.ok) {
      throw new Error(`Error al obtener prestadores: ${response.status}`);
    }

    const data = await response.json();

    // El back-end devuelve un array directo o un objeto con propiedad 'prestadores'
    const providers = Array.isArray(data) ? data : data.prestadores || [];

    return providers;
  } catch (error) {
    throw error;
  }
};

export const fetchProvidersPage = async (filters: ProviderFilters = {}): Promise<ProviderPage> => {
  const response = await apiFetch(`${API_BASE_URL}/prestadores${buildProviderQuery(filters)}`);

  if (!response.ok) {
    throw new Error(`Error al obtener prestadores: ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    return {
      data,
      total: data.length,
      page: Number(filters.page || 1),
      limit: Number(filters.limit || data.length || 20),
      totalPages: 1,
    };
  }

  return data;
};

export async function checkProviderSpecialtyAgendas(
  cuitCuil: string,
  specialtyId: number
): Promise<{ agendas: any[]; count: number }> {
  try {
    const response = await apiFetch(
      `${API_BASE_URL}/prestadores/${cuitCuil}/agendas-by-specialty?specialtyId=${specialtyId}`
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
    const response = await apiFetch(
      `${API_BASE_URL}/prestadores/${cuitCuil}/agendas-by-places`
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
 * Obtiene un prestador específico por CUIT/CUIL
 */
export const fetchProviderByCuit = async (cuitCuil: string): Promise<Prestador> => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/prestadores/${cuitCuil}`);

    if (!response.ok) {
      throw new Error(`Prestador no encontrado: ${cuitCuil}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Crea un nuevo prestador
 */
export const createProvider = async (provider: Omit<Prestador, "lugarAtencion"> & { lugarAtencion?: any }): Promise<Prestador> => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/prestadores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(provider),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const details = Array.isArray(errorData.details)
        ? `: ${errorData.details.map((d: any) => d.message).join(", ")}`
        : "";
      throw new Error(`${errorData.error || errorData.message || `Error al crear prestador`}${details}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza un prestador existente
 */
export const updateProvider = async (cuitCuil: string, updates: Partial<Prestador>): Promise<Prestador> => {
  try {

    const response = await apiFetch(`${API_BASE_URL}/prestadores/${cuitCuil}`, {
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

      throw new Error(errorData.error || errorData.message || `Error al actualizar prestador (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Da de baja un prestador
 */
export const deleteProvider = async (cuitCuil: string, motivo: string): Promise<void> => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/prestadores/${cuitCuil}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });

    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Error al dar de baja prestador: ${cuitCuil}`);
    }
  } catch (error) {
    throw error;
  }
};

async function providerAction(cuitCuil: string, action: string, body?: unknown) {
  const response = await apiFetch(`${API_BASE_URL}/prestadores/${cuitCuil}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Error en acción de prestador (${response.status})`);
  }

  return response.json();
}

async function providerPutAction(cuitCuil: string, action: string, body?: unknown): Promise<Prestador> {
  const response = await apiFetch(`${API_BASE_URL}/prestadores/${cuitCuil}/${action}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Error en acción de prestador (${response.status})`);
  }

  return response.json();
}

export const suspendProvider = (cuitCuil: string, motivo?: string): Promise<Prestador> =>
  providerPutAction(cuitCuil, "suspend", { motivo });

export const reactivateProvider = (cuitCuil: string): Promise<Prestador> =>
  providerPutAction(cuitCuil, "reactivate");

export const resetProviderPassword = (cuitCuil: string): Promise<{ message: string; temporaryPassword?: string }> =>
  providerAction(cuitCuil, "reset-password");

export const resendProviderCredentials = (cuitCuil: string): Promise<{ message: string }> =>
  providerAction(cuitCuil, "resend-credentials");

export const forceProviderPasswordChange = (cuitCuil: string): Promise<Prestador> =>
  providerAction(cuitCuil, "force-password-change");
