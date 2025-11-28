
export const SOCKET_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SOCKET_URL)
  ? import.meta.env.VITE_SOCKET_URL
  : (typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'https' : 'http'}://${window.location.hostname}:5000`
    : 'http://localhost:5000');

export const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000';

export default {
  SOCKET_URL,
  API_URL,
};
