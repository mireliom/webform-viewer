export interface ProviderDraft {
  id: string;
  providerName: string;
  config: any;
  updatedAt?: string;
  createdAt?: string;
}

export interface ListProviderDraftsResponse {
  items: ProviderDraft[];
  nextToken: string | null;
}

// --- CORE FETCH FUNCTION ---
export const graphqlfetch = async <T>({
  query,
  queryResult,
  variables,
  apiUrl,
}: {
  query: string;
  queryResult: string;
  variables: Record<string, any>;
  apiUrl: string;
}): Promise<T | null> => {
  try {
    let allItems: any[] = [];
    let nextToken: string | null = null;
    let initialResult: any = null;

    do {
      const currentVariables: Record<string, any> = {
        ...variables,
        nextToken: nextToken,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Custom authorization header as defined in your Amplify project
          Authorization: "mbv2",
        },
        body: JSON.stringify({
          query,
          variables: currentVariables,
        }),
      });

      if (!response.ok) {
        console.error(
          `🚀 ~ HTTP Error: ${response.status} ${response.statusText}`,
        );
        return null;
      }

      const body = await response.json();

      if (body.errors) {
        console.error("🚀 ~ GraphQL Errors:", JSON.stringify(body.errors));
        return null;
      }

      const data = body.data ? body.data[queryResult] : null;

      if (!data) return null;

      if (!initialResult) {
        initialResult = data;
      }

      // If it's a list operation, accumulate items and check for nextToken
      if (Array.isArray(data.items)) {
        allItems = [...allItems, ...data.items];
        nextToken = data.nextToken || null;
      } else {
        // For single item operations (get, create, update), return immediately
        return data as T;
      }
    } while (nextToken);

    // Return the combined result for list operations
    return {
      ...initialResult,
      items: allItems,
      nextToken: null,
    } as T;
  } catch (error) {
    console.error("Error on query execution:", error);
    return null;
  }
};

// --- QUERIES & MUTATIONS ---

/**
 * Retrieves all provider drafts from the database.
 */
export const listProviderDrafts = async (apiUrl: string) => {
  const query = `
    query ListProviderDrafts($limit: Int, $nextToken: String) {
      listProviderDrafts(limit: $limit, nextToken: $nextToken) {
        items {
          id
          providerName
          config          
          updatedAt
        }
        nextToken
      }
    }
  `;

  return await graphqlfetch<ListProviderDraftsResponse>({
    query,
    queryResult: "listProviderDrafts",
    variables: { limit: 1000 },
    apiUrl,
  });
};

/**
 * Helper to handle the "Upsert" logic (Try Create, fallback to Update)
 */
export const saveProviderDraft = async (
  draft: {
    id: string;
    providerName: string;
    billerId: string;
    config: any;
  },
  apiUrl: string,
) => {
  const updateMutation = `
    mutation UpdateProviderDraft($input: UpdateProviderDraftInput!) {
      updateProviderDraft(input: $input) {
        id
        providerName
        config
        updatedAt
      }
    }
  `;

  const createMutation = `
    mutation CreateProviderDraft($input: CreateProviderDraftInput!) {
      createProviderDraft(input: $input) {
        id
        providerName
        config
        updatedAt
      }
    }
  `;

  const sanitizedInput = {
    id: draft.id,
    providerName: draft.providerName,
    billerId: draft.billerId,
    config: JSON.stringify(draft.config),
  };

  // 1. TRY UPDATE FIRST
  // This is safer because if it fails with ConditionalCheckFailed,
  // we know for sure we need to Create it.
  let result = await graphqlfetch<any>({
    query: updateMutation,
    queryResult: "updateProviderDraft",
    variables: { input: sanitizedInput },
    apiUrl,
  });

  // 2. IF UPDATE FAILED (null result), TRY CREATE
  if (!result) {
    console.log("Update failed or record doesn't exist, attempting Create...");
    result = await graphqlfetch<any>({
      query: createMutation,
      queryResult: "createProviderDraft",
      variables: { input: sanitizedInput },
      apiUrl,
    });
  }

  return result;
};

/**
 * Deletes a draft (useful for discarding changes or after a successful deploy)
 */
export const deleteProviderDraft = async (id: string, apiUrl: string) => {
  const query = `
    mutation DeleteProviderDraft($input: DeleteProviderDraftInput!) {
      deleteProviderDraft(input: $input) {
        id
      }
    }
  `;

  return await graphqlfetch<any>({
    query,
    queryResult: "deleteProviderDraft",
    variables: { input: { id } },
    apiUrl,
  });
};
