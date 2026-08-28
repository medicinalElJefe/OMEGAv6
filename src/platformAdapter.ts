export type OmegaTruthState =
  | 'LIVE'
  | 'NOT_CONFIGURED'
  | 'DEVICE_PROOF_REQUIRED'
  | 'AUTH_REQUIRED'
  | 'EXTERNAL_DEGRADED'
  | 'NOT_TESTABLE'
  | 'IN_PROGRESS';

export type ApiResult<T> = { data: T; status: number; ok: boolean };

export class OmegaApiError extends Error {
  status: number;
  code?: string;
  payload?: unknown;
  constructor(message: string, status: number, code?: string, payload?: unknown) {
    super(message);
    this.name = 'OmegaApiError';
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      credentials: 'same-origin',
      signal: controller.signal
    });
    const contentType = response.headers.get('content-type') || '';
    const payload: unknown = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : await response.text();
    if (!response.ok) {
      const obj = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
      throw new OmegaApiError(
        String(obj.reply || obj.message || obj.code || `OMEGA request failed (${response.status})`),
        response.status,
        typeof obj.code === 'string' ? obj.code : undefined,
        payload
      );
    }
    return { data: payload as T, status: response.status, ok: true };
  } catch (error) {
    if (error instanceof OmegaApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new OmegaApiError('OMEGA request timed out.', 408, 'TIMEOUT');
    }
    throw new OmegaApiError(error instanceof Error ? error.message : String(error), 0, 'NETWORK_ERROR');
  } finally {
    window.clearTimeout(timeout);
  }
}

export const api = {
  get<T = unknown>(url: string): Promise<ApiResult<T>> { return request<T>('GET', url); },
  post<T = unknown>(url: string, body?: unknown): Promise<ApiResult<T>> { return request<T>('POST', url, body); },
  put<T = unknown>(url: string, body?: unknown): Promise<ApiResult<T>> { return request<T>('PUT', url, body); },
  delete<T = unknown>(url: string, body?: unknown): Promise<ApiResult<T>> { return request<T>('DELETE', url, body); }
};

export const platformCapabilities = Object.freeze({
  provider: 'NOT_CONFIGURED' as OmegaTruthState,
  realtime: 'NOT_TESTABLE' as OmegaTruthState,
  nativeHost: 'DEVICE_PROOF_REQUIRED' as OmegaTruthState,
  earthExternalFeeds: 'EXTERNAL_DEGRADED' as OmegaTruthState,
  authentication: 'NOT_TESTABLE' as OmegaTruthState,
  restoration: 'IN_PROGRESS' as OmegaTruthState
});

export const localState = {
  read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  write<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

export async function getRuntimeStatus<T = unknown>(): Promise<T> {
  return (await api.get<T>('/api/status')).data;
}

export async function getRestorationStatus<T = unknown>(): Promise<T> {
  return (await api.get<T>('/api/restoration')).data;
}

export async function previewRoute<T = unknown>(text: string): Promise<T> {
  return (await api.post<T>('/api/route-preview', { text })).data;
}

export async function sendChat<T = unknown>(text: string): Promise<T> {
  return (await api.post<T>('/api/chat', { text })).data;
}

export const auth = Object.freeze({
  isSignedIn: () => false,
  async getUser(): Promise<null> { return null; },
  async signIn(): Promise<never> {
    throw new OmegaApiError('Cloudflare sovereign migration does not have an identity provider bound.', 503, 'AUTH_NOT_BOUND');
  },
  async signOut(): Promise<void> { return; }
});

export const realtime = Object.freeze({
  state: 'NOT_TESTABLE' as OmegaTruthState,
  reason: 'Realtime donor transport is not yet bound on the full-restore branch.'
});
