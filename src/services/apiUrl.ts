import { Capacitor } from '@capacitor/core';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const apiUrl = (path: `/api/${string}`): string => {
  if (!configuredApiBaseUrl) {
    if (Capacitor.isNativePlatform()) {
      console.warn('⚠️ [API URL]: Android app running without explicit VITE_API_BASE_URL. Using fallback path and cached offline data.');
    }
    return path;
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(configuredApiBaseUrl);
  } catch {
    throw new Error('VITE_API_BASE_URL एक मान्य absolute HTTPS URL होना चाहिए।');
  }

  const isLocalDevelopmentUrl = baseUrl.protocol === 'http:' && baseUrl.hostname === 'localhost';
  if (
    (!Capacitor.isNativePlatform() && baseUrl.protocol !== 'https:' && !isLocalDevelopmentUrl) ||
    (Capacitor.isNativePlatform() && baseUrl.protocol !== 'https:')
  ) {
    throw new Error('VITE_API_BASE_URL में HTTPS API URL होना चाहिए।');
  }

  if (baseUrl.username || baseUrl.password || baseUrl.search || baseUrl.hash || baseUrl.pathname !== '/') {
    throw new Error('VITE_API_BASE_URL में केवल backend का origin दें, जैसे https://api.example.org।');
  }

  return new URL(path, baseUrl.toString().replace(/\/?$/, '/')).toString();
};
