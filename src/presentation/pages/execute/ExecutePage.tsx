"use client";

import { useEffect, useState } from "react";
import { IProviderTemplate } from "@/domain/entities/provider/provider-model";
import { IExecutionResult } from "@/domain/entities/execution/execution-model";
import { ProviderController } from "@/infrastructure/controllers/provider-controller";
import { ExecutionController } from "@/infrastructure/controllers/execution-controller";

import { getStatusMeta, buildFinalPayload } from "@/presentation/utils/utils";
import RunnerNavbar from "@components/RunnerNavbar";
import RunnerStats from "@components/RunnerStats";
import ProvidersTable from "@components/ProvidersTable";
import OutputConsole from "@components/OutputConsole";
import PayloadModal from "@components/PayloadModal";

export function ExecutePage() {
  // Global App State
  const [providers, setProviders] = useState<IProviderTemplate[]>([]);
  const [response, setResponse] = useState<IExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableJson, setEditableJson] = useState("");
  const [editingFilename, setEditingFilename] = useState<string | null>(null);
  const [selectedProviderName, setSelectedProviderName] = useState("");

  // CloudWatch logs
  const [logs, setLogs] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Initial Data Fetch using the Hexagonal Controller
  useEffect(() => {
    const fetchProviders = async () => {
      const res = await ProviderController.getAllProviders();
      // Enforcing the response.data.data access pattern from the skill
      if (res.success && res.data?.data) {
        setProviders(res.data.data);
      } else {
        console.error("Failed to fetch providers", res.error);
      }
    };
    fetchProviders();
  }, []);

  // Execution Handler
  const handleQuickExecute = async (provider: IProviderTemplate) => {
    setActiveProvider(provider.filename);
    setLoading(true);
    setResponse(null);
    setLogs([]);
    setIsStreaming(false);

    try {
      const payload = buildFinalPayload(provider.specificConfig);
      const res = await ExecutionController.execute(payload);

      if (!res.success || !res.data?.data) {
        throw new Error(res.error || "Execution failed");
      }

      const executionData = res.data.data;
      console.log("🚀 ~ handleQuickExecute ~ executionData:", executionData);
      setResponse(executionData.data);

      // NUEVA LÓGICA DE LOGS SIN ENDPOINTS
      if (executionData.requestId) {
        setIsStreaming(true);

        // Consumimos el generador asíncrono del controlador
        const logStream = ExecutionController.getLogStream(
          executionData.requestId,
        );

        for await (const log of logStream) {
          if (log?.done) {
            setIsStreaming(false);
            break;
          }
          if (log?.error) {
            setLogs((prev) => [...prev, `[AWS ERROR] ${log.error}`]);
            setIsStreaming(false);
            break;
          }
          if (log?.message) {
            setLogs((prev) => [...prev, log.message]);
          }
        }
      }
    } catch (e: any) {
      setResponse({ status: "error", data: e.message || "Failed to connect" });
    } finally {
      setLoading(false);
    }
  };

  // Modal Handlers
  const handleOpenEdit = (provider: IProviderTemplate) => {
    setEditableJson(
      JSON.stringify(buildFinalPayload(provider.specificConfig), null, 2),
    );
    setEditingFilename(provider.filename);
    setSelectedProviderName(provider.providerName);
    setIsModalOpen(true);
  };

  const handleSaveEdit = () => {
    try {
      const parsed = JSON.parse(editableJson);
      setProviders((prev) =>
        prev.map((p) =>
          p.filename === editingFilename ? { ...p, specificConfig: parsed } : p,
        ),
      );
      setIsModalOpen(false);
    } catch {
      alert("Invalid JSON format");
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
      />
    </div>
  );
}
