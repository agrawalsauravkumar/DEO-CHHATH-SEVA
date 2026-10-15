import { apiUrl } from './apiUrl';

const AUTH_SESSION_KEYS = [
  'deo_admin_current_session_v1',
  'deo_auth_current_user_v1',
];

type ApiSession = 'admin' | 'user';

function getStoredToken(sessionType: ApiSession): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const key = sessionType === 'admin' ? AUTH_SESSION_KEYS[0] : AUTH_SESSION_KEYS[1];
  try {
    const stored = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (!stored) return undefined;
    const session: unknown = JSON.parse(stored);
    if (
      typeof session === 'object' &&
      session !== null &&
      'token' in session &&
      typeof session.token === 'string'
    ) {
      return session.token;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export async function apiRequest<T>(
  path: `/api/${string}`,
  init: RequestInit = {},
  authenticated = false,
  sessionType: ApiSession = 'admin'
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getStoredToken(sessionType);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (authenticated && !token) {
    throw new Error('सुरक्षित कार्रवाई के लिए कृपया दोबारा लॉगिन करें।');
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path), { ...init, headers });
  } catch {
    throw new Error('सर्वर से संपर्क नहीं हो सका। इंटरनेट कनेक्शन जाँचकर पुनः प्रयास करें।');
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('सर्वर ने मान्य JSON जवाब नहीं दिया। कृपया सही API सर्वर से जुड़ें।');
  }
  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : `सर्वर अनुरोध असफल (${response.status})`;
    throw new Error(message);
  }
  if (payload === null || typeof payload !== 'object') {
    throw new Error('सर्वर जवाब का प्रारूप मान्य नहीं है।');
  }
  return payload as T;
}
