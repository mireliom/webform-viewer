import {
  Terminal,
  Loader2,
  ImageIcon,
  Copy,
  Check,
  ExternalLink,
  ArrowDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { StatusMeta } from "@presentation/interfaces/types";
import { useState, useRef, useEffect } from "react";

interface OutputConsoleProps {
  response: any;
  loading: boolean;
  statusMeta: StatusMeta | null;
  logs: string[];
  isStreaming: boolean;
}

export default function OutputConsole({
  response,
  loading,
  statusMeta,
  logs,
  isStreaming,
}: OutputConsoleProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Logic to combine all available screenshots
  const screenshots = (() => {
    const list = [];

    // Final/Global Screenshot
    if (response?.data?.screenshot?.screenshot) {
      list.push({
        name: "Final Confirmation",
        data: response.data.screenshot.screenshot,
      });
    }

    // Intermediate/Flow Screenshots
    const intermediates =
      response?.data?.screenshot?.automationResult?.formResult
        ?.intermediate_screenshots || [];

    return [...list, ...intermediates];
  })();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isStreaming]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleViewImage = (base64: string) => {
    const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const blob = new Blob([byteArray], { type: "image/png" });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");
  };

  return (
    <Card className="shadow-xl border-slate-100 bg-white overflow-hidden flex flex-col">
      <CardHeader className="border-b px-6 py-4 flex flex-row justify-between items-center bg-white">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-500" /> CloudWatch Logs
        </CardTitle>
        <div className="flex items-center gap-3">
          {isStreaming && (
            <span className="flex items-center text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />{" "}
              Retrieving logs from CloudWatch...
            </span>
          )}
          {statusMeta && (
            <Badge
              className={`${statusMeta.bg} ${statusMeta.color} border-current shadow-none`}
            >
              {statusMeta.label}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 bg-[#0d0d0d]">
        <div
          ref={scrollRef}
          className="h-[500px] overflow-y-auto p-6 font-mono text-[11px] leading-relaxed text-slate-300"
        >
          {!loading && logs.length === 0 && !response && (
            <div className="h-full flex items-center justify-center text-slate-700 opacity-30 italic font-sans text-sm">
              Ready for execution...
            </div>
          )}

          {loading && logs.length === 0 && (
            <div className="flex items-center text-blue-400 mb-4 font-sans text-sm">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Executing
              Lambda...
            </div>
          )}

          {/* Logs */}
          <div className="space-y-1">
            {logs.map((log, index) => {
              let colorClass = "text-slate-300";
              if (log.includes("ERROR")) colorClass = "text-red-400";
              else if (log.includes("WARN")) colorClass = "text-amber-400";
              else if (
                log.includes("START") ||
                log.includes("END") ||
                log.includes("REPORT")
              )
                colorClass = "text-emerald-500/60";

              return (
                <div
                  key={index}
                  className={`break-words whitespace-pre-wrap ${colorClass}`}
                >
                  {log.trim()}
                </div>
              );
            })}
          </div>

          {/*Screenshot Actions*/}
          {!isStreaming && screenshots.length > 0 && (
            <div className="mt-8 border-t border-slate-800 pt-6 space-y-3">
              <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-2">
                <ArrowDown className="w-3 h-3" /> Screenshots available (
                {screenshots.length})
              </p>

              {screenshots.map((s: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-900/50 border border-slate-800 p-3 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-200 text-[11px] font-bold truncate max-w-[150px]">
                      {s.name || `Screenshot_${idx + 1}`}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(s.data, idx)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-all flex items-center gap-1"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedIndex === idx ? "Copiado" : "Base64"}
                    </button>

                    <button
                      onClick={() => handleViewImage(s.data)}
                      className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded transition-all font-bold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver Imagen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
