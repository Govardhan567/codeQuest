import { NextResponse } from "next/server";
import { completeTopic, getCurrentUserProgress, getPythonTopics, statusForTopic } from "@/lib/learn-repository";
import { normalizeOutput, RunnerConfigurationError, runPython } from "@/lib/learn-runner";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { code } = await request.json() as { code?: string };
    const [topics, progress] = await Promise.all([getPythonTopics(), getCurrentUserProgress()]);
    const topic = topics.find((item) => item.id === Number(id));
    if (!topic) return NextResponse.json({ error: "Topic not found." }, { status: 404 });
    if (!progress.userId) return NextResponse.json({ error: "Sign in to save and unlock lesson progress." }, { status: 401 });
    if (statusForTopic(topic, topics, progress.completedTopicIds) === "locked") {
      return NextResponse.json({ error: "Complete the previous topic first." }, { status: 403 });
    }

    const result = await runPython(code ?? "", topic.taskInput ?? "");
    const actualOutput = normalizeOutput(result.stdout);
    const expectedOutput = normalizeOutput(topic.expectedOutput);
    const passed = result.exitCode === 0 && actualOutput === expectedOutput;

    if (passed) await completeTopic(progress.userId, topic.id);

    return NextResponse.json({
      passed,
      actualOutput,
      expectedOutput,
      stderr: result.stderr,
      exitCode: result.exitCode,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to check that code.";
    return NextResponse.json({ error: message }, { status: error instanceof RunnerConfigurationError ? 503 : 400 });
  }
}
