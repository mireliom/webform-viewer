import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { LambdaPort } from "@domain/ports/LambdaPort";
import {
  ExecutionRequest,
  ExecutionResponse,
} from "@domain/entities/Execution";

export class AwsLambdaAdapter implements LambdaPort {
  private client: LambdaClient;

  constructor() {
    this.client = new LambdaClient({
      region: process.env.AWS_REGION || "us-east-1",
    });
  }

  async invokeProviderLambda(
    request: ExecutionRequest,
  ): Promise<ExecutionResponse> {
    const command = new InvokeCommand({
      FunctionName:
        process.env.NEXT_PUBLIC_LAMBDA_NAME || process.env.EXISTING_LAMBDA_NAME,
      /*InvocationType: "Event",*/
      Payload: Buffer.from(JSON.stringify(request)),
    });

    try {
      const response = await this.client.send(command);
      const rawPayload = response.Payload
        ? new TextDecoder().decode(response.Payload)
        : "{}";
      const parsedPayload = JSON.parse(rawPayload);

      const body = parsedPayload.body ? JSON.parse(parsedPayload.body) : {};
      console.log(
        `[LAMBDA] Invoked successfully. RequestID: ${response.$metadata.requestId}`,
      );

      return {
        status: "success",
        data: body,
        timestamp: new Date().toISOString(),
        requestId: response.$metadata.requestId,
      };
    } catch (error: any) {
      console.error("[LAMBDA] Invocation error:", error.message);
      return {
        status: "error",
        data: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
