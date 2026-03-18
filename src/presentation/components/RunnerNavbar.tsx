import { Zap } from "lucide-react";
import { Badge } from "@components/ui/badge";

export default function RunnerNavbar() {
  return (
    <nav className="border-b bg-white px-8 py-4 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-slate-900" />
          <h1 className="text-xl font-bold tracking-tight">Lambda Runner</h1>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {process.env.NEXT_PUBLIC_LAMBDA_NAME || "AWS_LAMBDA_READY"}
        </Badge>
      </div>
    </nav>
  );
}
