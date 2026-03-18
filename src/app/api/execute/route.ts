import { ExecutionController } from "@infrastructure/controllers/ExecutionController";

export async function POST(req: Request) {
  return ExecutionController.handle(req);
}
