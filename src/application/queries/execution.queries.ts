import { ExecutionRepository } from "@/domain/entities/execution/execution-repository";

export class ExecutionQueries {
  constructor(private readonly repository: ExecutionRepository) {}

  /**
   * Generates a stream of logs using polling.
   * This replaces the need for EventSource/SSE.
   */
  async *streamLogs(requestId: string) {
    const seenEvents = new Set<string>();
    let nextToken: string | undefined = undefined;
    let attempts = 0;
    const maxAttempts = 40; // Increased for direct browser polling
    let finished = false;

    while (!finished && attempts < maxAttempts) {
      attempts++;

      try {
        const result = await this.repository.fetchLogs(requestId, nextToken);
        nextToken = result.nextToken;

        if (result.events.length > 0) {
          for (const event of result.events) {
            if (!event.eventId || seenEvents.has(event.eventId)) continue;

            seenEvents.add(event.eventId);
            yield { message: event.message };

            if (
              event.message.includes("REPORT RequestId:") ||
              event.message.includes("END RequestId:")
            ) {
              finished = true;
            }
          }
        }

        if (!finished) {
          await new Promise((resolve) => setTimeout(resolve, 1500)); // Wait before next poll
        }
      } catch (error) {
        yield { error: "Error fetching logs from AWS" };
        break;
      }
    }
    yield { done: true };
  }
}
