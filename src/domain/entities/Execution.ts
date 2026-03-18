export interface ExecutionRequest {
  providerId: string;
  providerName: string;
  payload: Record<string, unknown>;
}

export interface ExecutionResponse {
  status: "success" | "error";
  data: any;
  timestamp: string;
  requestId?: string;
}
