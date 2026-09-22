import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/config';

/** Field name -> message, as returned by the PHP validator. */
export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  status: number;
  fieldErrors: FieldErrors;

  constructor(message: string, status = 0, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  errors?: FieldErrors;
  data?: T;
  count?: number;
};

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const url = new URL(`${base}/${path.replace(/^\/+/, '')}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Performs one API call and unwraps the `data` field.
 * Every failure path ends up as an ApiError with a message worth showing.
 */
export async function request<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    query?: Record<string, string | number | undefined>;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const { method = 'GET', body, query, signal } = options;

  if (API_BASE_URL.includes('CHANGE-ME')) {
    throw new ApiError(
      'The API address has not been set yet. Open src/config.ts and set API_BASE_URL to your backend URL.',
    );
  }

  // Our own timeout, plus the caller's cancellation if they passed one.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onCallerAbort = () => controller.abort();
  signal?.addEventListener('abort', onCallerAbort);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    // The caller cancelled on purpose (screen unmounted, new search typed).
    if (signal?.aborted) throw error;

    if (controller.signal.aborted) {
      throw new ApiError('The server took too long to respond. Please try again.');
    }
    throw new ApiError(
      'Could not reach the server. Check your internet connection and that API_BASE_URL is correct.',
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onCallerAbort);
  }

  const raw = await response.text();

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = raw ? (JSON.parse(raw) as ApiEnvelope<T>) : null;
  } catch {
    // Shared hosts love to answer with an HTML error or "under construction"
    // page. Saying so is far more useful than "Unexpected token <".
    throw new ApiError(
      `The server replied with something that is not JSON (HTTP ${response.status}). ` +
        'Open your API URL in a browser to see what it is returning.',
      response.status,
    );
  }

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message ?? `Request failed with HTTP ${response.status}.`,
      response.status,
      payload?.errors ?? {},
    );
  }

  return payload.data as T;
}
