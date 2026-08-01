const PYODIDE_BASE_URL = "https://cdn.jsdelivr.net/pyodide/v0.29.4/full/";

let pyodidePromise;

function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = import(`${PYODIDE_BASE_URL}pyodide.mjs`).then(({ loadPyodide }) =>
      loadPyodide({ indexURL: PYODIDE_BASE_URL }),
    );
  }
  return pyodidePromise;
}

self.addEventListener("message", async (event) => {
  const { code, stdin = "" } = event.data ?? {};
  if (typeof code !== "string") return;

  const stdout = [];
  const stderr = [];
  const inputLines = typeof stdin === "string" ? stdin.split(/\r?\n/) : [];

  try {
    const pyodide = await getPyodide();
    pyodide.setStdout({ batched: (line) => stdout.push(line) });
    pyodide.setStderr({ batched: (line) => stderr.push(line) });
    pyodide.setStdin({ stdin: () => inputLines.shift() });
    await pyodide.runPythonAsync(code);
    self.postMessage({ stdout: stdout.join("\n"), stderr: stderr.join("\n"), exitCode: 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Python could not run this code.";
    self.postMessage({ stdout: stdout.join("\n"), stderr: [stderr.join("\n"), message].filter(Boolean).join("\n"), exitCode: 1 });
  }
});
