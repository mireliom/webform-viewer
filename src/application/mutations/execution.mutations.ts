import { ExecutionRepository } from "@/domain/entities/execution/execution-repository";
import { IApiResponse, IBackendResponse } from "@/domain/shared/api-response";
import {
  IExecutionPayload,
  IExecutionResult,
} from "@/domain/entities/execution/execution-model";

// Handles write/execute operations for Executions
export class ExecutionMutations {
  constructor(private readonly executionRepository: ExecutionRepository) {}

  async runExecution(
    payload: IExecutionPayload,
  ): Promise<IApiResponse<IBackendResponse<IExecutionResult>>> {
    return this.executionRepository.executeLambda(payload);
  }
}
