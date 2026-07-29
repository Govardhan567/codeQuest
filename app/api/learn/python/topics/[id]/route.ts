import { NextResponse } from "next/server";
import { getCurrentUserProgress, getPythonTopics, statusForTopic } from "@/lib/learn-repository";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [topics, progress] = await Promise.all([getPythonTopics(), getCurrentUserProgress()]);
    const topic = topics.find((item) => item.id === Number(id));
    if (!topic) return NextResponse.json({ error: "Topic not found." }, { status: 404 });

    return NextResponse.json({ ...topic, status: statusForTopic(topic, topics, progress.completedTopicIds) });
  } catch {
    return NextResponse.json(
      { error: "The lesson is unavailable. Apply the Learn migration before using this endpoint." },
      { status: 503 },
    );
  }
}
