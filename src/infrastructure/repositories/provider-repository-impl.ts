import { ProviderRepository } from "@/domain/entities/provider/provider-repository";
import { IApiResponse, IBackendResponse } from "@/domain/shared/api-response";
import { IProviderTemplate } from "@/domain/entities/provider/provider-model";
import { sendRequest } from "../http/api-client";
import { graphqlfetch } from "@/infrastructure/http/graphql-client";

const GRAPHQL_ENDPOINT =
  "https://oaf42l7xx5atti3snt3plejg4y.appsync-api.us-east-1.amazonaws.com/graphql";

const LIST_DRAFTS_QUERY = `
  query ListProviderDrafts {
    listProviderDrafts {
      items {
        id
        config        
        updatedAt
      }
    }
  }
`;

export class ProviderRepositoryImpl implements ProviderRepository {
  async getProviders(): Promise<
    IApiResponse<IBackendResponse<IProviderTemplate[]>>
  > {
    const [prodResponse, draftsData] = await Promise.all([
      sendRequest<any>("/webform-settings"),
      graphqlfetch<any>({
        query: LIST_DRAFTS_QUERY,
        queryResult: "listProviderDrafts",
        variables: {},
        apiUrl: GRAPHQL_ENDPOINT,
      }),
    ]);

    if (!prodResponse.success || !prodResponse.data.data) {
      return {
        success: false,
        data: { data: [] },
        error: "No production data",
      };
    }

    const rawList = prodResponse.data.data.webform_settings;
    const drafts = draftsData?.items || [];

    const mappedProviders: IProviderTemplate[] = rawList.map((item: any) => {
      // 1. Identificar si hay borrador
      const draft = drafts.find((d: any) => d.id === item.id);

      // 2. Normalizar la configuración (Asegurar que sea Objeto)
      let finalConfig = draft ? draft.config : item;

      // RECURSIVE PARSE: AppSync a veces devuelve el JSON como string, o doble-stringificado
      while (typeof finalConfig === "string") {
        try {
          finalConfig = JSON.parse(finalConfig);
        } catch (e) {
          console.error("Error final parsing config", e);
          break;
        }
      }

      // 3. Generar nombre de visualización
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
        filename: item.id,
        providerName: displayName,
        billerId: item.biller_id || "N/A",
        specificConfig: finalConfig,
        isEdited: !!draft,
        updatedAt: draft?.updatedAt,
      } as IProviderTemplate;
    });

    return { success: true, data: { data: mappedProviders } };
  }
}
