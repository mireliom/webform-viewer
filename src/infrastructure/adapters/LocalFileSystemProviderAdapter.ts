import fs from "fs/promises";
import path from "path";
import {
  ProviderTemplate,
  ProviderRepositoryPort,
} from "@domain/entities/ProviderTemplate";

export class LocalFileSystemProviderAdapter implements ProviderRepositoryPort {
  private readonly dataDirectory = path.join(
    process.cwd(),
    "src/infrastructure/data/providers",
  );

  public async getProviders(): Promise<ProviderTemplate[]> {
    try {
      const files = await fs.readdir(this.dataDirectory);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));

      const templates: ProviderTemplate[] = [];

      for (const file of jsonFiles) {
        const filePath = path.join(this.dataDirectory, file);
        const fileContent = await fs.readFile(filePath, "utf-8");

        try {
          const parsedContent = JSON.parse(fileContent);
          templates.push({
            filename: file,
            providerName:
              parsedContent.provider_name || file.replace(".json", ""),
            billerId: parsedContent.biller_id || "N/A",
            serviceUrl: parsedContent.service_url || "N/A",
            specificConfig: parsedContent,
          });
        } catch (parseError) {
          console.error(`❌ Error parsing JSON in file: ${file}. Skipping...`);
          console.error(
            `Reason: ${parseError instanceof Error ? parseError.message : "Unknown syntax error"}`,
          );
          continue;
        }
      }

      return templates;
    } catch (error) {
      console.error("Fatal error reading provider directory:", error);
      return [];
    }
  }
}
