import { Search, FileEdit, Play, GitMerge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { ProviderTemplate } from "@presentation/interfaces/types";

interface ProvidersTableProps {
  providers: ProviderTemplate[];
  search: string;
  onSearchChange: (val: string) => void;
  loading: boolean;
  onOpenEdit: (provider: ProviderTemplate) => void;
  onQuickExecute: (provider: ProviderTemplate) => void;
  onMerge: (provider: ProviderTemplate) => void;
}

export default function ProvidersTable({
  providers,
  search,
  onSearchChange,
  loading,
  onOpenEdit,
  onQuickExecute,
  onMerge,
}: ProvidersTableProps) {
  const filteredProviders = providers.filter(
    (p) =>
      p.providerName.toLowerCase().includes(search.toLowerCase()) ||
      p.billerId.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card className="shadow-xl border-slate-100 bg-white flex flex-col overflow-hidden">
      <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between bg-white">
        <CardTitle className="text-sm font-bold">Templates</CardTitle>
        <div className="relative w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Filter..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-9 text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent text-[10px] uppercase tracking-wider">
                <TableHead className="sticky top-0 bg-white z-10 font-bold pl-6 w-[30%]">
                  Provider
                </TableHead>
                <TableHead className="sticky top-0 bg-white z-10 font-bold w-[30%]">
                  ID
                </TableHead>
                <TableHead className="sticky top-0 bg-white z-10 font-bold text-right pr-6 w-[40%]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.map((p) => (
                <TableRow
                  key={p.filename}
                  className={`border-b last:border-0 ${p.isEdited ? "bg-amber-50/40 hover:bg-amber-50/60" : ""}`}
                >
                  <TableCell className="pl-6 py-2.5">
                    <div className="flex items-center gap-2">
                      {/* Fuente más pequeña: text-xs y font-medium */}
                      <span
                        className="text-xs font-medium text-slate-700 truncate max-w-[100px]"
                        title={p.providerName}
                      >
                        {p.providerName}
                      </span>
                      {p.isEdited && (
                        <span className="bg-amber-100 text-amber-700 text-[7px] font-black px-1 py-0.5 rounded uppercase shrink-0">
                          Mod
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-mono text-slate-400 py-2.5">
                    {p.billerId}
                  </TableCell>
                  <TableCell className="pr-6 py-2.5">
                    {/* Contenedor optimizado para 3 botones */}
                    <div className="flex items-center justify-end gap-1">
                      {p.isEdited && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 shrink-0"
                          onClick={() => onMerge(p)}
                          title="Merge to Production"
                        >
                          <GitMerge className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-slate-900 shrink-0"
                        onClick={() => onOpenEdit(p)}
                        title="Edit Payload"
                      >
                        <FileEdit className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-blue-600 shrink-0"
                        onClick={() => onQuickExecute(p)}
                        disabled={loading}
                        title="Run Test"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
