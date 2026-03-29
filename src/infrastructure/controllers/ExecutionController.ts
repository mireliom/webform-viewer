import { NextResponse } from "next/server";
import { InvokeProviderUseCase } from "@application/use-cases/InvokeProviderUseCase";
import { AwsLambdaAdapter } from "../adapters/AwsLambdaAdapter";
import { ExecutionRequest } from "@/domain/entities/Execution";

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
  static async handleClient(body: ExecutionRequest) {
    try {
      console.log(
        "🚀 ~ ExecutionController.ts ~ ExecutionController ~ handleClient ~ body:",
        body,
      );
      // const body = await req.json();
      
      const adapter = new AwsLambdaAdapter();
      const useCase = new InvokeProviderUseCase(adapter);
      
      const result = await useCase.execute(body);
      return NextResponse.json(result);
    } catch (error) {
      console.log(
        "🚀 ~ ExecutionController.ts ~ ExecutionController ~ handleClient ~ error:",
        error,
      );
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
  }
}
