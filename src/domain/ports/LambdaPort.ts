import { ExecutionRequest, ExecutionResponse } from "../entities/Execution";

export interface LambdaPort {
  invokeProviderLambda(request: ExecutionRequest): Promise<ExecutionResponse>;
}
