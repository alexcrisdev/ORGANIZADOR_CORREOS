export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiEndpoint = (path: string) => `${API_URL}${path}`;
