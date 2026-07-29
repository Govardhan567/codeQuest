import { NextResponse } from "next/server";
import { getCurrentUserProgress, getPythonTopics, statusForTopic } from "@/lib/learn-repository";

export async function GET() {
  try {
    const [topics, progress] = await Promise.all([getPythonTopics(), getCurrentUserProgress()]);
    return NextResponse.json(topics.map((topic) => ({
      id: topic.id,
      slug: topic.slug,
      position: topic.position,
      title: topic.title,
      description: topic.description,
      status: statusForTopic(topic, topics, progress.completedTopicIds),
    })));
  } catch {
    return NextResponse.json(
      { error: "The Python roadmap is unavailable. Apply the Learn migration before using this endpoint." },
      { status: 503 },
    );
  }
}
