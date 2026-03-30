// Define standard API response wrappers ensuring consistency across the app
export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface IBackendResponse<T, M = any> {
  data: T;
  meta?: M;
}
