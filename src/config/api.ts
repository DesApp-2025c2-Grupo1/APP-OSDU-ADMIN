// Configuración de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9002';

// Para casos donde se necesita sin el /api (obsoleto ahora que quitamos /api)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9002';

// Export API_PORTAL_URL mapping to the same base url
export const API_PORTAL_URL = API_BASE_URL;

/**
 * Wrapper de fetch que siempre envía la cookie JWT (credentials: 'include').
 * Usar en lugar de fetch() en todos los servicios.
 */
export const apiFetch = (url: string, options: RequestInit = {}): Promise<Response> =>
  fetch(url, { credentials: 'include', ...options });
