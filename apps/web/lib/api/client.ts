export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string = 'API_ERROR', status: number = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    status: number;
    details?: Record<string, unknown>;
  };
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || 'same-origin',
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  if (!isJson) {
    if (!response.ok) {
      throw new ApiError(`HTTP error ${response.status}: ${response.statusText}`, 'HTTP_ERROR', response.status);
    }
    return (await response.text()) as unknown as T;
  }

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success) {
    const errorMsg = result.error?.message || response.statusText || 'Request failed';
    const errorCode = result.error?.code || `HTTP_${response.status}`;
    throw new ApiError(errorMsg, errorCode, response.status, result.error?.details);
  }

  return result.data as T;
}
