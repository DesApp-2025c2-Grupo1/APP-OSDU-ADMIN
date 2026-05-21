export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9002';

/**
 * Wrapper de fetch que siempre envía la cookie JWT (credentials: 'include').
 * Usar en lugar de fetch() en todos los servicios.
 */
export const apiFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(options.headers);
  headers.set('X-Session-Allowed-Roles', 'ADMIN');
  return fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });
};
