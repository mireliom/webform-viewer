import { ReactElement } from "react";

export interface ProviderTemplate {
  id: string;
  filename: string;
  providerName: string;
  billerId: string;
  serviceUrl: string;
  specificConfig: Record<string, unknown>;
}

export interface StatusMeta {
  icon: ReactElement;
  label: string;
  color: string;
  bg: string;
}
