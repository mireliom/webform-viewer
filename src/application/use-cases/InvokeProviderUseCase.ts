import { LambdaPort } from "@domain/ports/LambdaPort";
import {
  ExecutionRequest,
  ExecutionResponse,
} from "@domain/entities/Execution";

export class InvokeProviderUseCase {
  constructor(private lambdaPort: LambdaPort) {}

  async execute(request: ExecutionRequest): Promise<ExecutionResponse> {
    return await this.lambdaPort.invokeProviderLambda(request);
  }
}
