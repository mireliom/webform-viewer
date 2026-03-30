import { IApiResponse, IBackendResponse } from "@/domain/shared/api-response";
import { IProviderTemplate } from "./provider-model";

// Outbound port for Provider data access
export interface ProviderRepository {
  getProviders(): Promise<IApiResponse<IBackendResponse<IProviderTemplate[]>>>;
}
