// Configuración de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Para casos donde se necesita sin el /api
export const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
