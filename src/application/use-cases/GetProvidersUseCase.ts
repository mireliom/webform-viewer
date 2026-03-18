import {
  ProviderTemplate,
  ProviderRepositoryPort,
} from "@domain/entities/ProviderTemplate";

export class GetProvidersUseCase {
  constructor(private repository: ProviderRepositoryPort) {}

  // Retrieves all available provider templates
  public async execute(): Promise<ProviderTemplate[]> {
    return await this.repository.getProviders();
  }
}
