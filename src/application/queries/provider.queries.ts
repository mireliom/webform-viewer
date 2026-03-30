import { ProviderRepository } from "@/domain/entities/provider/provider-repository";
import { IApiResponse, IBackendResponse } from "@/domain/shared/api-response";
import { IProviderTemplate } from "@/domain/entities/provider/provider-model";

// Handles read operations for Providers
export class ProviderQueries {
  constructor(private readonly providerRepository: ProviderRepository) {}

  async getAllProviders(): Promise<
    IApiResponse<IBackendResponse<IProviderTemplate[]>>
  > {
    return this.providerRepository.getProviders();
  }
}
