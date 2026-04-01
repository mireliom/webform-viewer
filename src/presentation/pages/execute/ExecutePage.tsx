"use client";

import { useEffect, useState, useCallback } from "react";
import { IProviderTemplate } from "@/domain/entities/provider/provider-model";
import { IExecutionResult } from "@/domain/entities/execution/execution-model";
import { ProviderController } from "@/infrastructure/controllers/provider-controller";
import { ExecutionController } from "@/infrastructure/controllers/execution-controller";
import { getStatusMeta, buildFinalPayload } from "@/presentation/utils/utils";
import { saveProviderDraft } from "@/infrastructure/http/graphql-client";
import { sendRequest } from "@/infrastructure/http/api-client";

import RunnerNavbar from "@components/RunnerNavbar";
import RunnerStats from "@components/RunnerStats";
import ProvidersTable from "@components/ProvidersTable";
import OutputConsole from "@components/OutputConsole";
import PayloadModal from "@components/PayloadModal";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";

const GRAPHQL_ENDPOINT =
  "https://oaf42l7xx5atti3snt3plejg4y.appsync-api.us-east-1.amazonaws.com/graphql";

// Keys that MUST be stripped out before sending to production API
const DUMMY_KEYS_TO_REMOVE = [
  "env",
  "provider_name",
  "username",
  "account_number",
  "partner",
  "first_name",
  "last_name",
  "full_name",
  "password",
  "contact_phone",
  "reply_to",
  "shark_email",
  "short_code",
  "email",
  "last_4",
  "shark_name",
  "zip_code",
  "street",
  "state",
  "city",
  "customer_dob",
  "cancel_method_order",
];

// Keys to force a visual order when editing
const BASE_KEYS_ORDER = [
  "id",
  ...DUMMY_KEYS_TO_REMOVE,
  "biller_id",
  "service_url",
];

// GraphQL Mutation to delete the draft after successful merge
const DELETE_DRAFT_MUTATION = `
  mutation DeleteProviderDraft($input: DeleteProviderDraftInput!) {
    deleteProviderDraft(input: $input) {
      id
    }
  }
`;

export function ExecutePage() {
  const [providers, setProviders] = useState<IProviderTemplate[]>([]);
  const [response, setResponse] = useState<IExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableJson, setEditableJson] = useState("");
  const [originalJson, setOriginalJson] = useState("");
  const [editingFilename, setEditingFilename] = useState<string | null>(null);
  const [selectedProviderName, setSelectedProviderName] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Merge & Dialog State
  const [isMergeAlertOpen, setIsMergeAlertOpen] = useState(false);
  const [providerToMerge, setProviderToMerge] =
    useState<IProviderTemplate | null>(null);
  const [isMerging, setIsMerging] = useState(false);

  // Logs state
  const [logs, setLogs] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Fetch providers logic wrapped in useCallback to reuse it after saving
  const fetchProviders = useCallback(async () => {
    const res = await ProviderController.getAllProviders();
    if (res.success && res.data?.data) {
      setProviders(res.data.data);
    } else {
      console.error("Failed to fetch providers", res.error);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleQuickExecute = async (provider: IProviderTemplate) => {
    setActiveProvider(provider.filename);
    setLoading(true);
    setResponse(null);
    setLogs([]);
    setIsStreaming(false);

    try {
      // Use the config as it is (if it's a draft, it already has the base payload)
      const payload = provider.isEdited
        ? provider.specificConfig
        : buildFinalPayload(provider.specificConfig);
      const res = await ExecutionController.execute(payload);

      if (!res.success || !res.data?.data)
        throw new Error(res.error || "Execution failed");

      const executionData = res.data.data;
      setResponse(executionData.data);

      if (executionData.requestId) {
        setIsStreaming(true);
        const logStream = ExecutionController.getLogStream(
          executionData.requestId,
        );
        for await (const log of logStream) {
          if (log?.done) {
            setIsStreaming(false);
            break;
          }
          if (log?.message) setLogs((prev) => [...prev, log.message]);
        }
      }
    } catch (e: any) {
      setResponse({ status: "error", data: e.message || "Failed to connect" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (provider: IProviderTemplate) => {
    // 1. Get the object
    let rawConfig = provider.isEdited
      ? provider.specificConfig
      : (buildFinalPayload(provider.specificConfig) as Record<string, any>);

    // 2. Reconstruct the object to force visual order
    const orderedConfig: Record<string, any> = {};

    // First, insert the base keys in the defined order
    BASE_KEYS_ORDER.forEach((key) => {
      if (key in rawConfig) {
        orderedConfig[key] = rawConfig[key];
      }
    });

    // Next, insert the rest of the keys NOT in the base
    Object.keys(rawConfig).forEach((key) => {
      if (!BASE_KEYS_ORDER.includes(key)) {
        orderedConfig[key] = rawConfig[key];
      }
    });

    // 3. Convert to string with indentation
    const jsonString = JSON.stringify(orderedConfig, null, 2);

    setEditableJson(jsonString);
    setOriginalJson(jsonString);
    setEditingFilename(provider.filename);
    setSelectedProviderName(provider.providerName);
    setIsModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editableJson === originalJson) {
      setIsModalOpen(false);
      return;
    }

    setIsSavingDraft(true);
    try {
      const parsedConfig = JSON.parse(editableJson);
      const currentProvider = providers.find(
        (p) => p.filename === editingFilename,
      );

      const result = await saveProviderDraft(
        {
          id: editingFilename!,
          providerName: selectedProviderName,
          billerId: currentProvider?.billerId || "N/A",
          config: parsedConfig,
        },
        GRAPHQL_ENDPOINT,
      );

      if (result) {
        // Refresh the list from the source to ensure everything is synced
        await fetchProviders();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Error saving to DB. Check JSON format.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Triggers the confirmation dialog
  const handleMergeToProduction = (provider: IProviderTemplate) => {
    setProviderToMerge(provider);
    setIsMergeAlertOpen(true);
  };

  // Executes the actual merge after user confirms
  const handleConfirmMerge = async () => {
    if (!providerToMerge) return;
    setIsMerging(true);

    try {
      // 1. Clone the specific config so we don't mutate state directly
      const payloadToProd = { ...providerToMerge.specificConfig };

      // 2. Strip out all dummy execution keys before sending to prod
      DUMMY_KEYS_TO_REMOVE.forEach((key) => {
        if (key in payloadToProd) {
          delete payloadToProd[key];
        }
      });

      // 3. Call API Gateway to update Production using the custom api-client
      const mergeResponse = await sendRequest<any>(
        `/webform-settings/${providerToMerge.filename}`,
        {
          method: "PATCH",
          body: JSON.stringify(payloadToProd),
        },
      );

      if (!mergeResponse.success) {
        throw new Error(mergeResponse.error || "Failed to update production");
      }

      console.log("Merge successful in Production:", mergeResponse.data);

      // 4. If Prod update is successful, delete the Draft from AppSync
      try {
        await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "mbv2", // Ensure this matches your AppSync auth
          },
          body: JSON.stringify({
            query: DELETE_DRAFT_MUTATION,
            variables: {
              input: {
                id: providerToMerge.filename,
              },
            },
          }),
        });
        console.log("Draft successfully deleted from AppSync.");
      } catch (graphqlError) {
        console.error(
          "Prod updated, but failed to delete draft from AppSync:",
          graphqlError,
        );
      }

      // 5. Sync local state to reflect the deletion
      await fetchProviders();
    } catch (error) {
      console.error("Error merging to prod:", error);
      alert("Error updating production. Check the console for details.");
    } finally {
      setIsMerging(false);
      setIsMergeAlertOpen(false);
      setProviderToMerge(null);
    }
  };

  const statusMeta = getStatusMeta(response);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <RunnerNavbar />
      <main className="max-w-7xl mx-auto p-8 space-y-8">
        <RunnerStats
          providersCount={providers.length}
          activeProvider={activeProvider}
          statusMeta={statusMeta}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProvidersTable
            providers={providers}
            search={search}
            onSearchChange={setSearch}
            loading={loading}
            onOpenEdit={handleOpenEdit}
            onQuickExecute={handleQuickExecute}
            onMerge={handleMergeToProduction}
          />
          <OutputConsole
            response={response}
            loading={loading}
            statusMeta={statusMeta}
            isStreaming={isStreaming}
            logs={logs}
          />
        </div>
      </main>
      <PayloadModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedProviderName={selectedProviderName}
        editableJson={editableJson}
        onJsonChange={setEditableJson}
        onSave={handleSaveEdit}
        isSaving={isSavingDraft}
      />

      {/* Merge Confirmation Dialog */}
      <AlertDialog open={isMergeAlertOpen} onOpenChange={setIsMergeAlertOpen}>
        <AlertDialogContent className="bg-gray-50">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to merge?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the configuration for{" "}
              <strong>{providerToMerge?.providerName}</strong> in production.
              Execution metadata will be automatically stripped before sending.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMerging}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmMerge();
              }}
              disabled={isMerging}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isMerging ? "Merging to Prod..." : "Confirm & Merge"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
