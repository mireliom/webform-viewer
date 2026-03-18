import { AwsCloudWatchAdapter } from "@infrastructure/adapters/AwsCloudWatchAdapter";

export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("requestId");

  if (!requestId) {
    return new Response("Missing requestId", { status: 400 });
  }

  const adapter = new AwsCloudWatchAdapter();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const seenEvents = new Set<string>();

      let nextToken: string | undefined = undefined;
      let attempts = 0;
      let executionFinished = false;
      let isClosed = false;

      const maxAttempts = 30;

      const safeEnqueue = (data: any) => {
        if (!isClosed) {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
            );
          } catch (e) {
            isClosed = true;
          }
        }
      };

      console.log(`[LOGS] Fetching finished logs for RequestId: ${requestId}`);

      await sleep(1000);

      try {
        while (!executionFinished && attempts < maxAttempts && !isClosed) {
          attempts++;

          const result = await adapter.getLogsByRequestId(requestId, nextToken);
          const events = result.events ?? [];

          if (events.length > 0) {
            for (const event of events) {
              if (!event.eventId || seenEvents.has(event.eventId)) continue;

              seenEvents.add(event.eventId);
              const msg = event.message ?? "";

              safeEnqueue({ message: msg });

              if (
                msg.includes("REPORT RequestId:") ||
                msg.includes(`END RequestId: ${requestId}`)
              ) {
                console.log(`[LOGS] End of logs found for ${requestId}`);
                executionFinished = true;
              }
            }
          }

          nextToken = result.nextToken;

          if (!executionFinished) {
            await sleep(1000);
          }
        }

        if (!executionFinished && !isClosed) {
          console.warn(`[LOGS] Reached end of polling for ${requestId}`);
        }

        safeEnqueue({ done: true });
      } catch (error: any) {
        console.error(`[LOGS] Stream Error:`, error.message);
        safeEnqueue({ error: "Error al recuperar logs" });
      } finally {
        if (!isClosed) {
          isClosed = true;
          controller.close();
        }
      }
    },
    cancel() {
      console.log("[LOGS] Client disconnected from stream.");
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
