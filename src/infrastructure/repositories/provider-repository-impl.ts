import { ProviderRepository } from "@/domain/entities/provider/provider-repository";
import { IApiResponse, IBackendResponse } from "@/domain/shared/api-response";
import { IProviderTemplate } from "@/domain/entities/provider/provider-model";
import { sendRequest } from "../http/api-client";

export class ProviderRepositoryImpl implements ProviderRepository {
  async getProviders(): Promise<
    IApiResponse<IBackendResponse<IProviderTemplate[]>>
  > {
    const response = await sendRequest<any>("/webform-settings");

    if (!response.success || !response.data.data) {
      return {
        success: false,
        data: { data: [] },
        error: response.error || "No data received",
      };
    }

    const rawList = response.data.data.webform_settings;

    if (!Array.isArray(rawList)) {
      return {
        success: false,
        data: { data: [] },
        error: "Invalid data format",
      };
    }

    const mappedProviders: IProviderTemplate[] = rawList.map((item: any) => {
      // Extract a clean name from the service_url for the UI
      let displayName = "PROVIDER";
      try {
        if (item.service_url) {
          const host = new URL(item.service_url).hostname;
          displayName = host
            .replace(/^(www\.|ayuda\.|help\.|support\.)/, "")
            .split(".")[0]
            .toUpperCase();
        }
      } catch (e) {
        displayName = "UNKNOWN";
      }

      return {
        // Unique key for the table rows
        filename: item.id,
        // Display name in the first column
        providerName: displayName,
        // Used in the second column and for filtering in ProvidersTable
        billerId: item.biller_id || "N/A",
        // Full object stored for the visual editor/execution
        specificConfig: item,
      } as IProviderTemplate;
    });

    return {
      success: true,
      data: { data: mappedProviders },
    };
  }
}
