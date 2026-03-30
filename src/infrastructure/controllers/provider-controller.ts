import { ProviderRepositoryImpl } from "../repositories/provider-repository-impl";
import { ProviderQueries } from "@/application/queries/provider.queries";

// Static orchestrator for Provider operations
export class ProviderController {
  static async getAllProviders() {
    const repository = new ProviderRepositoryImpl();
    const queries = new ProviderQueries(repository);
    return queries.getAllProviders();
  }
}
