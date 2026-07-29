import { NextResponse } from "next/server";
import { RunnerConfigurationError, runPython } from "@/lib/learn-runner";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { language?: string; code?: string; stdin?: string };
    if (body.language !== "python") {
      return NextResponse.json({ error: "Only Python is available right now." }, { status: 400 });
    }

    return NextResponse.json(await runPython(body.code ?? "", body.stdin ?? ""));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to run that code.";
    return NextResponse.json({ error: message }, { status: error instanceof RunnerConfigurationError ? 503 : 400 });
  }
}
