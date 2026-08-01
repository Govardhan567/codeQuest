export type PythonRunResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

const MAX_CODE_SIZE = 20_000;
const EXECUTION_TIMEOUT_MS = 30_000;

export function runPythonInBrowser(code: string, stdin = ""): Promise<PythonRunResult> {
  if (!code.trim()) return Promise.reject(new Error("Code is required."));
  if (code.length > MAX_CODE_SIZE) {
    return Promise.reject(new Error("Code is limited to 20,000 characters."));
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker("/python-runner.worker.mjs", { type: "module" });
    const timeout = window.setTimeout(() => {
      worker.terminate();
      reject(new Error("The program took too long to finish."));
    }, EXECUTION_TIMEOUT_MS);

    const finish = () => {
      window.clearTimeout(timeout);
      worker.terminate();
    };

    worker.addEventListener("message", (event: MessageEvent<PythonRunResult>) => {
      finish();
      resolve(event.data);
    });
    worker.addEventListener("error", () => {
      finish();
      reject(new Error("Python could not start in this browser. Please refresh and try again."));
    });
    worker.postMessage({ code, stdin });
  });
}
