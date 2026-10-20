/* Backend base URL. NestJS runs on port 8000 by default with the global
   `/api` prefix. Override with VITE_API_URL for deployment. */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const BASE_URL = API_BASE_URL.replace('/api', '');
