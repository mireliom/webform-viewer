import { ExecutionRepositoryImpl } from "../repositories/execution-repository-impl";
import { ExecutionMutations } from "@/application/mutations/execution.mutations";
import { ExecutionQueries } from "@/application/queries/execution.queries";
import { IExecutionPayload } from "@/domain/entities/execution/execution-model";

// Static orchestrator for Execution operations
export class ExecutionController {
  static async execute(payload: IExecutionPayload) {
    const repository = new ExecutionRepositoryImpl();
    const mutations = new ExecutionMutations(repository);
    return mutations.runExecution(payload);
  }

  static async *getLogStream(requestId: string) {
    const repository = new ExecutionRepositoryImpl();
    const queries = new ExecutionQueries(repository);
    yield* queries.streamLogs(requestId);
  }
}
