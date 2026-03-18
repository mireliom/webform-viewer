export const dynamic = "force-dynamic";

import { ProviderTemplateController } from "@infrastructure/controllers/ProviderTemplateController";

export async function GET() {
  return ProviderTemplateController.handleGet();
}
