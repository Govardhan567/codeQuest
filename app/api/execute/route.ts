import { NextRequest, NextResponse } from "next/server";

const runnerUrl = (process.env.CODE_RUNNER_URL ?? "https://ce.judge0.com").replace(/\/$/, "");
const runnerToken = process.env.CODE_RUNNER_TOKEN;
const maxSourceLength = 100_000;
const maxInputLength = 20_000;
const runnerRequestTimeoutMs = 20_000;

// These limits are passed to Judge0 for every submission.  They keep user
// programs isolated from the application and prevent a single run from
// consuming excessive runner resources.  The runner must be a Judge0
// instance configured to honor sandbox limits.
const sandboxLimits = {
  cpu_time_limit: 3,
  cpu_extra_time: 1,
  wall_time_limit: 5,
  memory_limit: 128_000,
  stack_limit: 32_000,
  max_processes_and_or_threads: 16,
  max_file_size: 1_024,
  enable_network: false,
  redirect_stderr_to_stdout: false,
};

function runnerHeaders() {
  return {
    "content-type": "application/json",
    ...(runnerToken ? { "X-Auth-Token": runnerToken } : {}),
  };
}

async function runnerFetch(path: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), runnerRequestTimeoutMs);
  try {
    return await fetch(`${runnerUrl}${path}`, {
      ...init,
      headers: { ...runnerHeaders(), ...init?.headers },
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  try {
    const response = await runnerFetch("/languages");
    if (!response.ok) throw new Error("Unable to load languages");
    const languages = await response.json() as { id: number; name: string }[];
    return NextResponse.json(languages.sort((a, b) => a.name.localeCompare(b.name)));
  } catch {
    return NextResponse.json({ error: "The code runner is unavailable. Try again shortly." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { languageId?: unknown; sourceCode?: unknown; stdin?: unknown };
    const languageId = Number(body.languageId);
    const sourceCode = typeof body.sourceCode === "string" ? body.sourceCode : "";
    const stdin = typeof body.stdin === "string" ? body.stdin : "";

    if (!Number.isInteger(languageId) || !sourceCode.trim()) {
      return NextResponse.json({ error: "Choose a language and write code before running it." }, { status: 400 });
    }
    if (sourceCode.length > maxSourceLength || stdin.length > maxInputLength) {
      return NextResponse.json({ error: "Your code or input is too large to run." }, { status: 413 });
    }

    const submissionResponse = await runnerFetch("/submissions?base64_encoded=false&wait=false", {
      method: "POST",
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        stdin,
        ...sandboxLimits,
      }),
    });
    let submission = await submissionResponse.json() as Record<string, unknown>;
    if (!submissionResponse.ok) {
      return NextResponse.json({ error: typeof submission.error === "string" ? submission.error : "The runner rejected this submission." }, { status: 502 });
    }

    for (let attempt = 0; attempt < 12 && typeof submission.token === "string" && typeof submission.status === "object" && submission.status && Number((submission.status as { id?: number }).id) <= 2; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const resultResponse = await runnerFetch(`/submissions/${submission.token}?base64_encoded=false`);
      if (!resultResponse.ok) break;
      submission = await resultResponse.json() as Record<string, unknown>;
    }

    return NextResponse.json({
      stdout: typeof submission.stdout === "string" ? submission.stdout : "",
      stderr: typeof submission.stderr === "string" ? submission.stderr : "",
      compileOutput: typeof submission.compile_output === "string" ? submission.compile_output : "",
      message: typeof submission.message === "string" ? submission.message : "",
      time: typeof submission.time === "string" ? submission.time : null,
      memory: typeof submission.memory === "number" ? submission.memory : null,
      status: typeof submission.status === "object" && submission.status ? submission.status as { id?: number; description?: string } : null,
    });
  } catch {
    return NextResponse.json({ error: "The code runner could not execute your program. Please try again." }, { status: 503 });
  }
}
