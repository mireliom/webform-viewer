import { NextResponse } from "next/server";
import { InvokeProviderUseCase } from "@application/use-cases/InvokeProviderUseCase";
import { AwsLambdaAdapter } from "../adapters/AwsLambdaAdapter";

export class ExecutionController {
  static async handle(req: Request) {
    try {
      const body = await req.json();

      const adapter = new AwsLambdaAdapter();
      const useCase = new InvokeProviderUseCase(adapter);

      const result = await useCase.execute(body);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
  }
}
