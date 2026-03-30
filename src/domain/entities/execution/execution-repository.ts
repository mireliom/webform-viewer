import { IApiResponse, IBackendResponse } from "@/domain/shared/api-response";
import { IExecutionPayload, IExecutionResult } from "./execution-model";

export interface ILogEvent {
  message: string;
  timestamp?: number;
  eventId?: string;
}

export interface ILogResponse {
  events: ILogEvent[];
  nextToken?: string;
}

export interface ExecutionRepository {
  executeLambda(
    payload: any,
  ): Promise<IApiResponse<IBackendResponse<IExecutionResult>>>;
  fetchLogs(requestId: string, nextToken?: string): Promise<ILogResponse>;
}
