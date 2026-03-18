import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
  FilterLogEventsCommandOutput,
} from "@aws-sdk/client-cloudwatch-logs";

export class AwsCloudWatchAdapter {
  private client: CloudWatchLogsClient;
  private logGroupName: string;

  constructor() {
    this.client = new CloudWatchLogsClient({
      region: process.env.AWS_REGION || "us-east-1",
    });

    const lambdaName =
      process.env.EXISTING_LAMBDA_NAME || "screenshot-function";
    this.logGroupName = `/aws/lambda/${lambdaName}`;
  }

  public async getLogsByRequestId(
    requestId: string,
    nextToken?: string,
  ): Promise<FilterLogEventsCommandOutput> {
    const command = new FilterLogEventsCommand({
      logGroupName: this.logGroupName,
      filterPattern: `"${requestId}"`,
      startTime: Date.now() - 1000 * 60 * 10,
      nextToken,
      interleaved: true,
    });

    try {
      console.log(
        `[AWS SDK] Polling Group: ${this.logGroupName} | Pattern: "${requestId}"`,
      );
      return await this.client.send(command);
    } catch (error) {
      console.error("CloudWatch fetch error:", error);
      throw error;
    }
  }
}
