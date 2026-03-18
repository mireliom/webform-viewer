import { Search, FileEdit, Play } from "lucide-react";
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
}

export default function ProvidersTable({
  providers,
  search,
  onSearchChange,
  loading,
  onOpenEdit,
  onQuickExecute,
}: ProvidersTableProps) {
  // Filter providers locally based on search input
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
              <TableRow className="hover:bg-transparent">
                <TableHead className="sticky top-0 bg-white z-10 font-bold text-xs pl-6">
                  Provider
                </TableHead>
                <TableHead className="sticky top-0 bg-white z-10 font-bold text-xs">
                  ID
                </TableHead>
                <TableHead className="sticky top-0 bg-white z-10 font-bold text-xs text-center pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.map((p) => (
                <TableRow key={p.filename} className="border-b last:border-0">
                  <TableCell className="font-semibold text-sm pl-6">
                    {p.providerName}
                  </TableCell>
                  <TableCell className="text-[10px] font-mono text-slate-500">
                    {p.billerId}
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-900"
                        onClick={() => onOpenEdit(p)}
                        title="Edit Payload"
                      >
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-600"
                        onClick={() => onQuickExecute(p)}
                        disabled={loading}
                        title="Run Test"
                      >
                        <Play className="h-4 w-4" />
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
