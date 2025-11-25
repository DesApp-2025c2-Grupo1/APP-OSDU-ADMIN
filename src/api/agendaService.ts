import { API_BASE_URL } from "../config/api";

export interface AgendaPayload {
  cuitCuil: string;
  idEspecialidad: number;
  idLugar: number;
  duracionTurno: number;
  bloques: {
    dias: string[]; // 'Lunes', 'Martes', etc.
    desde: string; // 'HH:MM'
    hasta: string; // 'HH:MM'
  }[];
  fechaInicio?: string;
  fechaFin?: string;
}

export interface AgendaResponse {
  id: string;
  prestador: string;
  cuitCuil: string;
  tipoPrestador: string;
  especialidad: string;
  idEspecialidad: number;
  lugar: string;
  idLugar: number;
  lugarCompleto: {
    idLugar: number;
    direccion: string;
    localidad: string;
    provincia: string;
    codigoPostal: string;
  } | null;
  dias: string[];
  diasCompletos: string[];
  horario: string;
  bloques: {
    dias: string[];
    desde: string;
    hasta: string;
  }[];
  duracion: number;
  fechaInicio: string;
  fechaFin: string | null;
  estaActivo: boolean;
}

/**
 * Obtiene todas las agendas (con filtros opcionales)
 */
export const fetchAgendas = async (filters?: {
  cuitCuil?: string;
  idEspecialidad?: number;
}): Promise<AgendaResponse[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.cuitCuil) params.append('cuitCuil', filters.cuitCuil);
    if (filters?.idEspecialidad) params.append('idEspecialidad', filters.idEspecialidad.toString());
    
    const url = params.toString() ? `/agendas?${params.toString()}` : '/agendas';
    const response = await fetch(`${API_BASE_URL}${url}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener agendas: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error en fetchAgendas:', error);
    throw error;
  }
};

/**
 * Obtiene una agenda específica por ID
 */
export const fetchAgendaById = async (id: string): Promise<AgendaResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agendas/${id}`);
    
    if (!response.ok) {
      throw new Error(`Agenda no encontrada: ${id}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en fetchAgendaById:', error);
    throw error;
  }
};

/**
 * Crea una nueva agenda
 */
export const createAgenda = async (payload: AgendaPayload): Promise<AgendaResponse> => {
  try {
    console.log('📤 POST /agendas:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/agendas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log(`📊 Respuesta HTTP: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ Error del servidor (${response.status}):`, errorData);
      throw new Error(errorData.error || errorData.message || 'Error al crear agenda');
    }

    const data = await response.json();
    console.log('✅ Agenda creada:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en createAgenda:', error);
    throw error;
  }
};

/**
 * Actualiza una agenda existente
 */
export const updateAgenda = async (
  id: string,
  updates: Partial<AgendaPayload>
): Promise<AgendaResponse> => {
  try {
    console.log(`📤 PUT /agendas/${id}:`, JSON.stringify(updates, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/agendas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    console.log(`📊 Respuesta HTTP: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ Error del servidor (${response.status}):`, errorData);
      throw new Error(errorData.error || errorData.message || 'Error al actualizar agenda');
    }

    const data = await response.json();
    console.log('✅ Agenda actualizada:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en updateAgenda:', error);
    throw error;
  }
};

/**
 * Elimina una agenda (soft delete)
 */
export const deleteAgenda = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/agendas/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar agenda: ${id}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en deleteAgenda:', error);
    throw error;
  }
};