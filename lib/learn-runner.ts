export type RunResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

const MAX_CODE_SIZE = 20_000;

export class RunnerConfigurationError extends Error {}

export async function runPython(code: string, stdin = ""): Promise<RunResult> {
  if (typeof code !== "string" || !code.trim()) {
    throw new Error("Code is required.");
  }

  if (code.length > MAX_CODE_SIZE) {
    throw new Error("Code is limited to 20,000 characters.");
  }

  const runnerUrl = process.env.CODE_RUNNER_URL;
  if (!runnerUrl) {
    throw new RunnerConfigurationError(
      "A sandbox runner is not configured. Set CODE_RUNNER_URL to your Judge0 or self-hosted Piston execute endpoint.",
    );
  }

  const provider = process.env.CODE_RUNNER_PROVIDER ?? "piston";
  const apiKey = process.env.CODE_RUNNER_API_KEY;
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;

  const body = provider === "judge0"
    ? {
        source_code: code,
        language_id: Number(process.env.JUDGE0_PYTHON_LANGUAGE_ID ?? 92),
        stdin,
      }
    : {
        language: "python",
        version: process.env.PISTON_PYTHON_VERSION ?? "3.11.0",
        files: [{ content: code }],
        stdin,
      };

  let response: Response;
  try {
    response = await fetch(runnerUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error("The sandbox runner could not be reached. Please try again.");
  }

  if (!response.ok) {
    throw new Error(`The sandbox runner returned ${response.status}.`);
  }

  const data = await response.json() as {
    run?: { stdout?: string; stderr?: string; output?: string; code?: number };
    stdout?: string;
    stderr?: string;
    compile_output?: string | null;
    status?: { id?: number };
  };

  if (provider === "judge0") {
    return {
      stdout: data.stdout ?? "",
      stderr: `${data.compile_output ?? ""}${data.stderr ?? ""}`,
      exitCode: data.status?.id === 3 ? 0 : 1,
    };
  }

  return {
    stdout: data.run?.stdout ?? data.run?.output ?? "",
    stderr: data.run?.stderr ?? "",
    exitCode: data.run?.code ?? 1,
  };
}

export function normalizeOutput(output: string) {
  return output.replace(/\r\n/g, "\n").trimEnd();
}
