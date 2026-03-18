// Entity representing the specific configuration of a provider
export interface ProviderTemplate {
  filename: string;
  providerName: string;
  billerId: string;
  serviceUrl: string;
  specificConfig: Record<string, unknown>;
}

// Interface for reading templates from any source (Local FS, S3, DB)
export interface ProviderRepositoryPort {
  getProviders(): Promise<ProviderTemplate[]>;
}
