import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import {
  ExecutionRepository,
  ILogResponse,
} from "@/domain/entities/execution/execution-repository";
import { IApiResponse, IBackendResponse } from "@/domain/shared/api-response";
import {
  IExecutionPayload,
  IExecutionResult,
} from "@/domain/entities/execution/execution-model";

export class ExecutionRepositoryImpl implements ExecutionRepository {
  private lambdaClient: LambdaClient;
  private cwClient: CloudWatchLogsClient;
  private logGroupName: string;
  private functionName: string;

  constructor() {
    const credentials = {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
    };
    const region = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";

    this.lambdaClient = new LambdaClient({ region, credentials });
    this.cwClient = new CloudWatchLogsClient({ region, credentials });

    // We use the same name as the lambda or a specific env var
    this.functionName =
      process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_NAME || "screenshot-function";
    this.logGroupName = `/aws/lambda/${this.functionName}`;
  }

  async executeLambda(
    payload: IExecutionPayload,
  ): Promise<IApiResponse<IBackendResponse<IExecutionResult>>> {
    try {
      const command = new InvokeCommand({
        FunctionName: this.functionName,
        Payload: JSON.stringify(payload) as any,
        /*InvocationType: "RequestResponse",*/
      });

      const response = await this.lambdaClient.send(command);

      if (response.Payload) {
        const resultString = new TextDecoder().decode(response.Payload);
        const resultData = JSON.parse(resultString);

        // Map Lambda response to our domain model
        return {
          success: true,
          data: {
            data: {
              requestId: response.$metadata.requestId || "n/a",
              status: "success",
              data: resultData,
            } as IExecutionResult,
          },
        };
      }

      throw new Error("Lambda returned an empty payload");
    } catch (error: any) {
      return {
        success: false,
        data: { data: null as any },
        error: error.message || "AWS Lambda Execution Error",
      };
    }
  }

  async fetchLogs(
    requestId: string,
    nextToken?: string,
  ): Promise<ILogResponse> {
    const command = new FilterLogEventsCommand({
      logGroupName: this.logGroupName,
      filterPattern: `"${requestId}"`,
      startTime: Date.now() - 1000 * 60 * 5, // Last 5 minutes
      nextToken,
      interleaved: true,
    });

    const response = await this.cwClient.send(command);

    return {
      events: (response.events || []).map((e) => ({
        message: e.message || "",
        timestamp: e.timestamp,
        eventId: e.eventId,
      })),
      nextToken: response.nextToken,
    };
  }
}
