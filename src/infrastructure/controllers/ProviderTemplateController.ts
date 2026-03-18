import { NextResponse } from "next/server";
import { GetProvidersUseCase } from "@application/use-cases/GetProvidersUseCase";
import { LocalFileSystemProviderAdapter } from "./../adapters/LocalFileSystemProviderAdapter";

export class ProviderTemplateController {
  static async handleGet() {
    try {
      const adapter = new LocalFileSystemProviderAdapter();
      const useCase = new GetProvidersUseCase(adapter);

      const providers = await useCase.execute();
      return NextResponse.json(providers);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to load templates" },
        { status: 500 },
      );
    }
  }
}
