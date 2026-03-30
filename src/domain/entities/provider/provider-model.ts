export interface IProviderTemplate {
  id: string;
  filename: string;
  providerName: string;
  billerId: string;
  serviceUrl: string;
  specificConfig: Record<string, any>;
}
