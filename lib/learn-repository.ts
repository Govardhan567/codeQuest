import { createClient } from "@/lib/server";
import type { PythonTopic } from "@/lib/learn-content";

type TopicRow = {
  id: number;
  slug: string;
  position: number;
  title: string;
  description: string;
  explanation: string;
  example_code: string;
  starter_code: string;
  task_title: string;
  task_description: string;
  expected_output: string;
  task_input: string | null;
};

function topicFromRow(row: TopicRow): PythonTopic {
  return {
    id: row.id,
    slug: row.slug,
    position: row.position,
    title: row.title,
    description: row.description,
    explanation: row.explanation.split("\n\n"),
    exampleCode: row.example_code,
    starterCode: row.starter_code,
    taskTitle: row.task_title,
    taskDescription: row.task_description,
    expectedOutput: row.expected_output,
    taskInput: row.task_input ?? undefined,
  };
}

export async function getLanguages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_languages")
    .select("id, name, icon, accent, active")
    .order("position");
  if (error) throw error;
  return data;
}

export async function getPythonTopics() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topics")
    .select("id, slug, position, title, description, explanation, example_code, starter_code, task_title, task_description, expected_output, task_input")
    .eq("language_id", "python")
    .order("position");
  if (error) throw error;
  return (data as TopicRow[]).map(topicFromRow);
}

export async function getTopicWithProgress(topicId: number) {
  const supabase = await createClient();
  const topics = await getPythonTopics();
  const topic = topics.find((item) => item.id === topicId);
  if (!topic) return { topic: null, completedTopicIds: [] as number[], userId: null as string | null };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { topic, completedTopicIds: [] as number[], userId: null as string | null };

  const { data: progress, error: progressError } = await supabase
    .from("user_topic_progress")
    .select("topic_id")
    .eq("user_id", userData.user.id)
    .eq("status", "completed");
  if (progressError) throw progressError;

  return {
    topic,
    completedTopicIds: (progress ?? []).map((item) => item.topic_id as number),
    userId: userData.user.id,
  };
}

export async function getCurrentUserProgress() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { userId: null as string | null, completedTopicIds: [] as number[] };

  const { data: progress, error } = await supabase
    .from("user_topic_progress")
    .select("topic_id")
    .eq("user_id", userData.user.id)
    .eq("status", "completed");
  if (error) throw error;
  return { userId: userData.user.id, completedTopicIds: (progress ?? []).map((item) => item.topic_id as number) };
}

export async function completeTopic(userId: string, topicId: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_topic_progress")
    .upsert({ user_id: userId, topic_id: topicId, status: "completed", completed_at: new Date().toISOString() }, { onConflict: "user_id,topic_id" });
  if (error) throw error;
}

export function statusForTopic(topic: PythonTopic, topics: PythonTopic[], completedTopicIds: number[]) {
  if (completedTopicIds.includes(topic.id)) return "completed" as const;
  const prior = topics.find((item) => item.position === topic.position - 1);
  if (!prior || completedTopicIds.includes(prior.id)) return "unlocked" as const;
  return "locked" as const;
}
