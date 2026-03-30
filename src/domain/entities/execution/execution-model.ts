// Core interfaces for Execution payloads and results
export interface IExecutionPayload {
  [key: string]: any;
}

export interface IExecutionResult {
  requestId?: string;
  status?: string;
  data?: any;
}
