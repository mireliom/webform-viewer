"use client";

import { useEffect, useState } from "react";
import { ProviderTemplate } from "@presentation/interfaces/types";
import { getStatusMeta, buildFinalPayload } from "@presentation/utils/utils";

import RunnerNavbar from "@components/RunnerNavbar";
import RunnerStats from "@components/RunnerStats";
import ProvidersTable from "@components/ProvidersTable";
import OutputConsole from "@components/OutputConsole";
import PayloadModal from "@components/PayloadModal";

export default function LambdaRunnerPage() {
  // Global App State
  const [providers, setProviders] = useState<ProviderTemplate[]>([]);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableJson, setEditableJson] = useState("");
  const [editingFilename, setEditingFilename] = useState<string | null>(null);
  const [selectedProviderName, setSelectedProviderName] = useState("");

  //CloudWatch logs
  const [logs, setLogs] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch("/api/providers");
        const data = await res.json();
        setProviders(data);
      } catch (error) {
        console.error("Failed to fetch providers", error);
      }
    };
    fetchProviders();
  }, []);

  // Execution Handler
  const handleQuickExecute = async (provider: ProviderTemplate) => {
    setActiveProvider(provider.filename);
    setLoading(true);
    setResponse(null);
    setLogs([]);
    setIsStreaming(false);
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildFinalPayload(provider.specificConfig)),
      });
      const data = await res.json();
      setResponse(data);
      // Once we have the response and the requestId, start streaming logs
      if (data.requestId) {
        setIsStreaming(true);
        const eventSource = new EventSource(
          `/api/logs/stream?requestId=${data.requestId}`,
        );

        eventSource.onmessage = (event) => {
          const parsedData = JSON.parse(event.data);

          if (parsedData.done) {
            // End of execution stream marker
            eventSource.close();
            setIsStreaming(false);
          } else if (parsedData.error) {
            setLogs((prev) => [...prev, `[STREAM ERROR] ${parsedData.error}`]);
            eventSource.close();
            setIsStreaming(false);
          } else if (parsedData.message) {
            // Append new log lines to the state
            setLogs((prev) => [...prev, parsedData.message]);
          }
        };

        eventSource.onerror = (error) => {
          console.error("EventSource failed:", error);
          eventSource.close();
          setIsStreaming(false);
        };
      }
    } catch (e) {
      setResponse({ status: "error", data: "Failed to connect" });
    } finally {
      setLoading(false);
    }
  };

  // Modal Open Handler
  const handleOpenEdit = (provider: ProviderTemplate) => {
    setEditableJson(
      JSON.stringify(buildFinalPayload(provider.specificConfig), null, 2),
    );
    setEditingFilename(provider.filename);
    setSelectedProviderName(provider.providerName);
    setIsModalOpen(true);
  };

  // Modal Save Handler
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
