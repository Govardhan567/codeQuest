"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AccountAccess, type CodeQuestAccount } from "@/app/account-access";
import { runPythonInBrowser } from "@/lib/browser-python-runner";
import { learnLanguages, pythonTopics, type PythonTopic } from "@/lib/learn-content";

const CodeEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="learn-editor-loading">Preparing editor…</div>,
});

type View = "dashboard" | "learn" | "practice" | "challenges" | "leaderboard";
type Panel = "help" | "settings" | "quest" | null;

const navItems: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Home", icon: "⌂" },
  { id: "learn", label: "Learn", icon: "◫" },
  { id: "practice", label: "Practice", icon: "◎" },
  { id: "challenges", label: "Challenges", icon: "◇" },
  { id: "leaderboard", label: "Leaderboard", icon: "♕" },
];

const languages = [
  { name: "Python", icon: "⌘", lessons: "8 / 24 lessons", percent: 34, color: "#f5c451" },
  { name: "JavaScript", icon: "JS", lessons: "4 / 30 lessons", percent: 15, color: "#f1d56b" },
  { name: "SQL", icon: "▤", lessons: "12 / 18 lessons", percent: 67, color: "#65b9ff" },
];

const challenges = [
  { title: "Two Sum", topic: "Arrays · Hash Map", difficulty: "Easy", solved: true, xp: 50 },
  { title: "Valid Parentheses", topic: "Stacks", difficulty: "Easy", solved: false, xp: 60 },
  { title: "Longest Substring", topic: "Sliding Window", difficulty: "Medium", solved: false, xp: 100 },
  { title: "Merge Intervals", topic: "Arrays · Sorting", difficulty: "Medium", solved: false, xp: 120 },
];

function ProgressRing({ value }: { value: number }) {
  return (
    <div className="progress-ring" style={{ background: `conic-gradient(#8c7bff ${value * 3.6}deg, #25223b 0deg)` }}>
      <div className="progress-ring__core">
        <strong>{value}%</strong>
        <span>to Level 12</span>
      </div>
    </div>
  );
}

function HomeView({ onNavigate, xp, onPractice, onOpenQuest }: { onNavigate: (view: View) => void; xp: number; onPractice: () => void; onOpenQuest: () => void }) {
  return (
    <>
      <section className="hero-grid">
        <div className="welcome-card card">
          <div className="eyebrow">TUESDAY, JUNE 18</div>
          <h1>Good morning, Alex <span>✦</span></h1>
          <p>Small steps, sharp skills. You&apos;re on a 5-day roll—let&apos;s keep the momentum going.</p>
          <div className="hero-actions">
            <button className="button button--primary" onClick={() => onNavigate("learn")}>Resume learning <span>→</span></button>
            <button className="button button--ghost" onClick={() => onNavigate("challenges")}>Browse challenges</button>
          </div>
          <div className="light-orb light-orb--one" />
          <div className="light-orb light-orb--two" />
          <div className="code-sprinkles"><i>{"{}"}</i><i>{"</>"}</i><i>{"()"}</i></div>
        </div>

        <div className="level-card card">
          <div className="level-card__title"><span>YOUR QUEST</span><button type="button" aria-label="Open quest details" onClick={onOpenQuest}>•••</button></div>
          <div className="level-content">
            <ProgressRing value={72} />
            <div><div className="level-label">LEVEL 11</div><h2>Code Pathfinder</h2><p><b>{xp.toLocaleString()}</b> / 2,000 XP</p></div>
          </div>
          <div className="xp-track"><span style={{ width: "72%" }} /></div>
          <p className="next-level">440 XP until your next milestone</p>
        </div>
      </section>

      <section className="daily-callout card">
        <div className="daily-callout__icon">✦</div>
        <div className="daily-callout__copy"><span>DAILY QUEST</span><h2>Keep your streak alive</h2><p>Complete today&apos;s 5-minute Python challenge before midnight.</p></div>
        <div className="daily-callout__reward"><small>REWARD</small><b>+40 XP</b></div>
        <button className="button button--warm" onClick={onPractice}>Start quest <span>→</span></button>
      </section>

      <div className="content-grid">
        <section className="card learn-card">
          <div className="section-heading"><div><span className="eyebrow">KEEP LEARNING</span><h2>Pick up where you left off</h2></div><button className="text-button" onClick={() => onNavigate("learn")}>View all <span>→</span></button></div>
          <div className="lesson-row">
            <div className="python-badge">⌘</div>
            <div className="lesson-copy"><span className="eyebrow">PYTHON · MODULE 3</span><h3>Functions &amp; scope</h3><p>Understand how functions pass data and keep it tidy.</p><div className="lesson-meta"><span className="dot" /> <span>Lesson 4 of 7</span><span>·</span><span>8 min</span></div></div>
            <button className="round-play" onClick={() => onNavigate("learn")} aria-label="Resume Functions and scope lesson">▶</button>
          </div>
          <div className="lesson-progress"><span /></div>
        </section>

        <section className="card streak-card">
          <div className="section-heading"><div><span className="eyebrow">YOUR STREAK</span><h2>Make it six</h2></div><span className="flame">♨</span></div>
          <div className="streak-count"><strong>5</strong><span>days</span></div>
          <div className="week-days">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <div key={`${day}-${index}`} className={index < 5 ? "day day--done" : index === 5 ? "day day--today" : "day"}><span>{day}</span><i>{index < 5 ? "✓" : index === 5 ? "•" : ""}</i></div>)}
          </div>
          <p>One short session is all it takes.</p>
        </section>
      </div>

      <section className="section-block">
        <div className="section-heading section-heading--plain"><div><span className="eyebrow">YOUR ROADMAP</span><h2>Explore your learning paths</h2></div><button className="text-button" onClick={() => onNavigate("learn")}>See roadmap <span>→</span></button></div>
        <div className="language-grid">
          {languages.map((language) => <article className="language-card card" key={language.name}>
            <div className="language-card__top"><div className="language-mark" style={{ color: language.color }}>{language.icon}</div><button type="button" aria-label={`Open ${language.name}`} onClick={() => onNavigate("learn")}>···</button></div>
            <h3>{language.name}</h3><p>{language.lessons}</p>
            <div className="mini-progress"><span style={{ width: `${language.percent}%`, background: language.color }} /></div>
            <button className="language-link" onClick={() => onNavigate("learn")}>Continue <span>→</span></button>
          </article>)}
          <button className="add-language card" onClick={() => onNavigate("learn")}><span>+</span><b>Explore more languages</b><small>Java, C++, JavaScript &amp; more</small></button>
        </div>
      </section>
    </>
  );
}

type LearnStage = "languages" | "roadmap" | "lesson";
type ConsoleState = { kind: "idle" | "running" | "success" | "error"; stdout: string; stderr: string; label: string };

function LearnView({ initialStage = "languages", initialTopicId = 1 }: { initialStage?: LearnStage; initialTopicId?: number }) {
  const router = useRouter();
  const [stage, setStage] = useState<LearnStage>(initialStage);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopicId);
  const [code, setCode] = useState((pythonTopics.find((topic) => topic.id === initialTopicId) ?? pythonTopics[0]).starterCode);
  const [consoleState, setConsoleState] = useState<ConsoleState>({ kind: "idle", stdout: "", stderr: "", label: "Run code to see its output here." });
  const [checkState, setCheckState] = useState<{ passed?: boolean; actual?: string; expected?: string; message?: string }>({});
  const [serverProgressReady, setServerProgressReady] = useState(false);

  const selectedTopic = pythonTopics.find((topic) => topic.id === selectedTopicId) ?? pythonTopics[0];
  const completedCount = completedIds.length;
  const progressPercent = Math.round((completedCount / pythonTopics.length) * 100);

  useEffect(() => {
    const saved = window.localStorage.getItem("codequest-python-preview-progress");
    if (saved) {
      try {
        const savedProgress = JSON.parse(saved) as number[];
        queueMicrotask(() => setCompletedIds(savedProgress));
      } catch {
        window.localStorage.removeItem("codequest-python-preview-progress");
      }
    }

    fetch("/api/learn/python/topics")
      .then(async (response) => response.ok ? response.json() : Promise.reject())
      .then((topics: { id: number; status: string }[]) => {
        setCompletedIds(topics.filter((topic) => topic.status === "completed").map((topic) => topic.id));
        setServerProgressReady(true);
      })
      .catch(() => setServerProgressReady(false));
  }, []);

  const statusFor = (topic: PythonTopic) => {
    if (completedIds.includes(topic.id)) return "completed" as const;
    if (topic.position === 1 || completedIds.includes(topic.id - 1)) return "unlocked" as const;
    return "locked" as const;
  };

  const openTopic = (topic: PythonTopic) => {
    if (statusFor(topic) === "locked") return;
    setSelectedTopicId(topic.id);
    setCode(topic.starterCode);
    setConsoleState({ kind: "idle", stdout: "", stderr: "", label: "Run code to see its output here." });
    setCheckState({});
    setStage("lesson");
  };

  const runCode = async () => {
    setConsoleState({ kind: "running", stdout: "", stderr: "", label: "Starting Python…" });
    try {
      const result = await runPythonInBrowser(code);
      setConsoleState({
        kind: result.exitCode === 0 ? "success" : "error",
        stdout: result.stdout,
        stderr: result.stderr,
        label: result.exitCode === 0 ? "Finished" : "Finished with an error",
      });
    } catch (error) {
      setConsoleState({ kind: "error", stdout: "", stderr: error instanceof Error ? error.message : "Unable to run that code.", label: "Python unavailable" });
    }
  };

  const checkTask = async () => {
    setCheckState({ message: "Checking your solution…" });
    try {
      const execution = await runPythonInBrowser(code, selectedTopic.taskInput ?? "");
      const response = await fetch(`/api/learn/python/topics/${selectedTopic.id}/check`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(execution),
      });
      const result = await response.json() as { passed?: boolean; actualOutput?: string; expectedOutput?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to check that code.");

      setCheckState({ passed: result.passed, actual: result.actualOutput, expected: result.expectedOutput });
      if (result.passed) {
        const nextCompleted = [...new Set([...completedIds, selectedTopic.id])];
        setCompletedIds(nextCompleted);
        window.localStorage.setItem("codequest-python-preview-progress", JSON.stringify(nextCompleted));
      }
    } catch (error) {
      setCheckState({ message: error instanceof Error ? error.message : "Unable to check that code." });
    }
  };

  const nextTopic = pythonTopics.find((topic) => topic.position === selectedTopic.position + 1);
  const canMoveNext = completedIds.includes(selectedTopic.id) && nextTopic;

  if (stage === "languages") {
    return <section className="learn-hub workspace-view">
      <div className="learn-hub__hero">
        <div><span className="eyebrow">CODEQUEST LEARN</span><h1>Choose your path.</h1><p>Learn one clear concept at a time, write real code, and make steady progress.</p></div>
        <div className="learn-hub__spark" aria-hidden="true">&lt;/&gt;</div>
      </div>
      <div className="language-picker" aria-label="Choose a programming language">
        {learnLanguages.map((language) => language.active ? (
          <button className="language-picker__card language-picker__card--active" key={language.id} onClick={() => { setStage("roadmap"); router.push("/learn/python"); }}>
            <span className="language-picker__mark" style={{ color: language.accent }}>{language.icon}</span>
            <span><b>{language.name}</b><small>Python foundations · 10 topics</small></span>
            <em>Start path →</em>
          </button>
        ) : (
          <div className="language-picker__card language-picker__card--disabled" key={language.id} aria-disabled="true" title={`${language.name} is coming soon`}>
            <span className="language-picker__mark" style={{ color: language.accent }}>{language.icon}</span>
            <span><b>{language.name}</b><small>New learning path</small></span>
            <em>Coming soon</em>
          </div>
        ))}
      </div>
    </section>;
  }

  if (stage === "roadmap") {
    return <section className="learn-hub workspace-view">
      <div className="learn-hub__hero learn-hub__hero--roadmap">
        <div><button className="learn-back" onClick={() => { setStage("languages"); router.push("/learn"); }}>← All languages</button><span className="eyebrow">PYTHON · FOUNDATIONS</span><h1>Your Python roadmap.</h1><p>Finish each checkpoint to unlock the next one. No skipping—just momentum.</p></div>
        <div className="roadmap-score"><b>{completedCount}</b><span>/ {pythonTopics.length} complete</span><i><span style={{ width: `${progressPercent}%` }} /></i></div>
      </div>
      <div className="roadmap" aria-label="Python learning roadmap">
        {pythonTopics.map((topic) => {
          const status = statusFor(topic);
          return <div className={`roadmap__item roadmap__item--${status}`} key={topic.id}>
            <div className="roadmap__line" aria-hidden="true" />
            <button disabled={status === "locked"} onClick={() => openTopic(topic)} title={status === "locked" ? "Complete the previous topic to unlock this lesson." : `Open ${topic.title}`}>
              <span className="roadmap__number">{status === "completed" ? "✓" : status === "locked" ? "🔒" : topic.position}</span>
              <span className="roadmap__copy"><b>{topic.title}</b><small>{topic.description}</small></span>
              <em>{status === "completed" ? "Complete" : status === "locked" ? "Locked" : "Start lesson →"}</em>
            </button>
          </div>;
        })}
      </div>
    </section>;
  }

  return <section className="learn-hub workspace-view">
    <div className="lesson-topbar">
      <button className="learn-back" onClick={() => setStage("roadmap")}>← Python roadmap</button>
      <span className="lesson-topbar__progress">Topic {selectedTopic.position} of {pythonTopics.length} · {progressPercent}% complete</span>
    </div>
    <div className="lesson-heading"><div><span className="eyebrow">PYTHON FOUNDATIONS · TOPIC {selectedTopic.position}</span><h1>{selectedTopic.title}</h1><p>{selectedTopic.description}</p></div><button className="lesson-help" type="button" title="AI hints will be added in a future update." onClick={() => setCheckState({ message: "Need help? The hint guide is coming soon. Re-read the example, then try one small change." })}>Need help?</button></div>
    <div className="lesson-workspace">
      <article className="lesson-explanation card">
        <span className="lesson-panel-label">01 · Understand it</span>
        {selectedTopic.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <div className="lesson-example"><div><b>Example</b><span>Read only</span></div><CodeEditor height="142px" defaultLanguage="python" language="python" value={selectedTopic.exampleCode} theme="vs-dark" options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, lineNumbers: "on", scrollBeyondLastLine: false, folding: false, padding: { top: 12, bottom: 12 } }} /></div>
      </article>
      <article className="lesson-code card">
        <div className="lesson-code__head"><span className="lesson-panel-label">02 · Try it</span><span>main.py</span></div>
        <CodeEditor height="300px" defaultLanguage="python" language="python" value={code} onChange={(value) => setCode(value ?? "")} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: "on", scrollBeyondLastLine: false, padding: { top: 14, bottom: 14 }, automaticLayout: true }} />
        <div className="lesson-runbar"><button className="lesson-run" onClick={runCode} disabled={consoleState.kind === "running"}>{consoleState.kind === "running" ? "Running…" : "▷ Run code"}</button><span>Runs privately in your browser</span></div>
        <div className={`lesson-console lesson-console--${consoleState.kind}`} role="status" aria-live="polite"><div><b>Output</b><span>{consoleState.label}</span></div>{consoleState.stdout && <pre>{consoleState.stdout}</pre>}{consoleState.stderr && <pre className="lesson-console__error">{consoleState.stderr}</pre>}{!consoleState.stdout && !consoleState.stderr && <pre className="lesson-console__empty">{consoleState.label}</pre>}</div>
      </article>
      <aside className="lesson-task card">
        <span className="lesson-panel-label">03 · Practice task</span>
        <div className="lesson-task__badge">{selectedTopic.position.toString().padStart(2, "0")}</div><h2>{selectedTopic.taskTitle}</h2><p>{selectedTopic.taskDescription}</p>
        {selectedTopic.taskInput && <div className="lesson-input-note"><b>Checker input</b><code>Ada</code></div>}
        <button className="lesson-check" onClick={checkTask}>Check solution</button>
        {checkState.message && <p className="lesson-check-message">{checkState.message}</p>}
        {checkState.passed !== undefined && <div className={checkState.passed ? "lesson-result lesson-result--pass" : "lesson-result lesson-result--fail"}><b>{checkState.passed ? "Nice work — topic complete!" : "Not quite yet"}</b>{!checkState.passed && <><span>Expected</span><code>{checkState.expected}</code><span>Your output</span><code>{checkState.actual || "(no output)"}</code></>}</div>}
        <div className="lesson-next"><button disabled={!canMoveNext} onClick={() => nextTopic && openTopic(nextTopic)}>{nextTopic ? "Next topic →" : "Python foundations complete"}</button>{!completedIds.includes(selectedTopic.id) && <small>{serverProgressReady ? "Pass the task to unlock the next topic." : "Sign in and configure the sandbox to save progress."}</small>}</div>
      </aside>
    </div>
  </section>;
}

const practiceQuestions = [
  { prompt: "What does this expression return?", code: "len([1, 2, 3])", answer: "3", explanation: "Exactly. len() counts the items in a collection.", next: "Calculate a power with the exponent operator." },
  { prompt: "What does this expression return?", code: "2 ** 3", answer: "8", explanation: "Correct. ** raises a number to a power.", next: "Count the characters in a string." },
  { prompt: "What does this expression return?", code: "len(\"code\")", answer: "4", explanation: "Right. The word code has four characters.", next: "Use floor division to find a whole-number result." },
  { prompt: "What does this expression return?", code: "10 // 3", answer: "3", explanation: "Nice. // performs floor division and removes the remainder.", next: "Check the truthiness of an empty list." },
  { prompt: "What does this expression return?", code: "bool([])", answer: "false", explanation: "Perfect. An empty list is falsy in Python.", next: "Finish the quest and collect your XP." },
];

function PracticeView({ onComplete }: { onComplete: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = practiceQuestions[questionIndex];
  const isCorrect = answer.trim().toLocaleLowerCase() === question.answer;

  const checkOrAdvance = () => {
    if (checked && isCorrect) {
      if (questionIndex === practiceQuestions.length - 1) {
        setFinished(true);
        onComplete();
        return;
      }
      setQuestionIndex((current) => current + 1);
      setAnswer("");
      setChecked(false);
      return;
    }

    setChecked(true);
    if (isCorrect) setCompletedCount(questionIndex + 1);
  };

  const actionLabel = checked && isCorrect
    ? questionIndex === practiceQuestions.length - 1 ? "Finish quest →" : "Next question →"
    : "Check answer";

  return <section className="workspace-view practice-view">
    <div className="view-hero"><div><span className="eyebrow">TODAY&apos;S QUEST · 5 MINUTES</span><h1>Warm up your Python brain.</h1><p>Answer five short prompts. Incorrect answers cost a heart, but you can always try again.</p></div><div className="hearts"><span>♥</span><span>♥</span><span>♥</span><span>♥</span><span>♥</span></div></div>
    <div className="practice-grid">{finished ? <article className="question-card card practice-complete"><div className="question-orb">✓</div><span className="eyebrow">QUEST COMPLETE</span><h2>Five steps stronger.</h2><p>You completed today&apos;s Python warm-up and earned 40 XP. Come back tomorrow for a fresh quest.</p><div className="practice-complete__score"><b>5 / 5</b><span>answers correct</span></div></article> : <article className="question-card card"><div className="question-card__top"><span>QUESTION {questionIndex + 1} OF {practiceQuestions.length}</span><span>+8 XP</span></div><div className="question-orb">{(questionIndex + 1).toString().padStart(2, "0")}</div><h2>{question.prompt}</h2><div className="inline-code"><code>{question.code}</code></div><form className="answer-row" onSubmit={(event) => { event.preventDefault(); checkOrAdvance(); }}><input aria-label="Your answer" value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false); }} placeholder="Type your answer" disabled={checked && isCorrect} /><button className="button button--primary" type="submit">{actionLabel}</button></form>{checked && <p className={isCorrect ? "answer-feedback answer-feedback--good" : "answer-feedback"}>{isCorrect ? `${question.explanation} +8 XP ready.` : "Not quite. Check the expression carefully, then try again."}</p>}</article>}<aside className="practice-side card"><span className="eyebrow">QUEST PROGRESS</span><div className="quest-numbers"><b>{completedCount}</b><span>/ {practiceQuestions.length} complete</span></div><div className="quest-dots">{practiceQuestions.map((_, index) => <i key={index} className={index < completedCount ? "active" : index === questionIndex && !finished ? "current" : undefined} />)}</div><hr /><span className="eyebrow">UP NEXT</span><p>{finished ? "A new Python quest will be ready tomorrow." : question.next}</p><div className="tip-small"><span>✦</span><p>Need a nudge? Your tutor is ready with hints—not answers.</p></div></aside></div>
  </section>;
}

const challengeContent: Record<string, { description: string; starterCode: string; testCase: string; expectedOutput: string; hint: string }> = {
  "Two Sum": { description: "Given an array of integers and a target, return the indices of the two numbers that add up to the target.", starterCode: "def two_sum(nums, target):\n    seen = {}\n    for index, number in enumerate(nums):\n        needed = target - number\n        if needed in seen:\n            return [seen[needed], index]\n        seen[number] = index\n\nprint(two_sum([2, 7, 11, 15], 9))", testCase: "Input: [2, 7, 11, 15], target = 9\nExpected output: [0, 1]", expectedOutput: "[0, 1]", hint: "Use a dictionary to remember each number's index as you scan the list." },
  "Valid Parentheses": { description: "Check whether every opening bracket has the matching closing bracket in the correct order.", starterCode: "def is_valid(value):\n    pairs = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for character in value:\n        if character in '([{':\n            stack.append(character)\n        elif not stack or stack.pop() != pairs[character]:\n            return False\n    return not stack\n\nprint(is_valid(\"()[]{}\"))", testCase: "Input: ()[]{}\nExpected output: True", expectedOutput: "True", hint: "A stack lets you match each closing bracket with the most recent opening bracket." },
  "Longest Substring": { description: "Find the length of the longest substring that contains no repeated characters.", starterCode: "def longest_unique_substring(value):\n    seen = {}\n    start = longest = 0\n    for end, character in enumerate(value):\n        if character in seen and seen[character] >= start:\n            start = seen[character] + 1\n        seen[character] = end\n        longest = max(longest, end - start + 1)\n    return longest\n\nprint(longest_unique_substring(\"abcabcbb\"))", testCase: "Input: abcabcbb\nExpected output: 3", expectedOutput: "3", hint: "Move a sliding-window start pointer past a repeated character instead of rebuilding the substring." },
  "Merge Intervals": { description: "Merge overlapping ranges into the smallest set of non-overlapping intervals.", starterCode: "def merge_intervals(intervals):\n    intervals.sort(key=lambda interval: interval[0])\n    merged = []\n    for start, end in intervals:\n        if not merged or start > merged[-1][1]:\n            merged.append([start, end])\n        else:\n            merged[-1][1] = max(merged[-1][1], end)\n    return merged\n\nprint(merge_intervals([[1, 3], [2, 6], [8, 10]]))", testCase: "Input: [[1, 3], [2, 6], [8, 10]]\nExpected output: [[1, 6], [8, 10]]", expectedOutput: "[[1, 6], [8, 10]]", hint: "Sort ranges by their first value, then compare each new range with the last merged range." },
};

function ChallengesView({ onGainXp }: { onGainXp: (amount: number, title: string) => void }) {
  const [selected, setSelected] = useState("Two Sum");
  const [topicFilter, setTopicFilter] = useState("All topics");
  const [activeTab, setActiveTab] = useState<"solution" | "tests">("solution");
  const [message, setMessage] = useState("Your Quest Guide is here. Ask for a nudge when you need one.");
  const [hintQuestion, setHintQuestion] = useState("");
  const [code, setCode] = useState(challengeContent["Two Sum"].starterCode);
  const [runState, setRunState] = useState("Ready to run the sample test.");
  const [isRunning, setIsRunning] = useState(false);
  const visibleChallenges = challenges.filter((challenge) => topicFilter === "All topics" || challenge.topic.startsWith(topicFilter));
  const selectedChallenge = challenges.find((challenge) => challenge.title === selected) ?? challenges[0];
  const details = challengeContent[selectedChallenge.title];

  const chooseChallenge = (title: string) => {
    setSelected(title);
    setCode(challengeContent[title].starterCode);
    setRunState("Ready to run the sample test.");
    setActiveTab("solution");
  };

  const changeTopic = (topic: string) => {
    setTopicFilter(topic);
    const nextChallenge = challenges.find((challenge) => topic === "All topics" || challenge.topic.startsWith(topic));
    if (nextChallenge) chooseChallenge(nextChallenge.title);
  };

  const runChallenge = async (submit = false) => {
    setIsRunning(true);
    setRunState("Running the sample test…");
    try {
      const result = await runPythonInBrowser(code);
      if (result.exitCode !== 0) throw new Error(result.stderr || "The sample test did not finish.");
      const output = result.stdout.trim();
      const passed = output === details.expectedOutput;
      if (submit && !passed) {
        setRunState(`Sample output: ${output || "(no output)"}. Expected: ${details.expectedOutput}. Update your solution and try again.`);
        return;
      }
      setRunState(`Sample output: ${output || "(no output)"}${submit ? " — solution accepted." : ""}`);
      if (submit) onGainXp(selectedChallenge.xp, selectedChallenge.title);
    } catch (error) {
      setRunState(error instanceof Error ? error.message : "Unable to run the sample test.");
    } finally {
      setIsRunning(false);
    }
  };

  const sendHint = () => {
    setMessage(hintQuestion.trim() ? `For “${hintQuestion.trim()}”: ${details.hint}` : `Hint: ${details.hint}`);
    setHintQuestion("");
  };

  return <section className="workspace-view challenge-view">
    <div className="challenge-heading"><div><span className="eyebrow">CHALLENGE ZONE</span><h1>Turn knowledge into instinct.</h1></div><div className="challenge-filters"><label><span className="sr-only">Filter by topic</span><select value={topicFilter} onChange={(event) => changeTopic(event.target.value)}><option>All topics</option><option>Arrays</option><option>Stacks</option><option>Sliding Window</option></select></label><span className="editor-lang">Python</span></div></div>
    <div className="challenge-layout"><aside className="problem-list card"><div className="problem-list__head"><b>Problems</b><span>{visibleChallenges.length} shown</span></div>{visibleChallenges.map((challenge) => <button type="button" key={challenge.title} onClick={() => chooseChallenge(challenge.title)} className={selected === challenge.title ? "problem problem--selected" : "problem"}><span className={challenge.solved ? "solve-dot solve-dot--done" : "solve-dot"}>{challenge.solved ? "✓" : ""}</span><div><b>{challenge.title}</b><small>{challenge.topic}</small></div><em className={`difficulty difficulty--${challenge.difficulty.toLowerCase()}`}>{challenge.difficulty}</em></button>)}</aside>
      <article className="editor-card card"><div className="editor-top"><div><span className="eyebrow">{selectedChallenge.difficulty.toUpperCase()} · {selectedChallenge.topic.toUpperCase()}</span><h2>{selected}</h2></div><span className="editor-lang">Python</span></div><p>{details.description}</p><div className="tabs" role="tablist" aria-label="Challenge workspace"><button type="button" role="tab" aria-selected={activeTab === "solution"} className={activeTab === "solution" ? "tab--active" : ""} onClick={() => setActiveTab("solution")}>Solution.py</button><button type="button" role="tab" aria-selected={activeTab === "tests"} className={activeTab === "tests" ? "tab--active" : ""} onClick={() => setActiveTab("tests")}>Test cases</button></div>{activeTab === "solution" ? <textarea className="challenge-editor" aria-label={`${selected} solution`} value={code} onChange={(event) => setCode(event.target.value)} spellCheck="false" /> : <div className="test-cases" role="tabpanel"><b>Sample test</b><pre>{details.testCase}</pre><p>Run the current solution to see its output below.</p></div>}<div className="run-result" role="status" aria-live="polite">{runState}</div><div className="editor-actions"><button className="button button--ghost" type="button" onClick={() => runChallenge()} disabled={isRunning}>{isRunning ? "Running…" : "▷ Run code"}</button><button className="button button--primary" type="button" onClick={() => runChallenge(true)} disabled={isRunning}>{isRunning ? "Checking…" : "Submit solution"}</button></div></article>
      <aside className="hint-panel card"><div className="hint-head"><span className="spark-icon">✦</span><div><b>Quest Guide</b><small>Hint-focused tutor</small></div><i>●</i></div><div className="chat-bubble">{message}</div><div className="hint-steps"><span>1</span><p><b>Try this first</b><br />{details.hint}</p></div><form className="hint-input" onSubmit={(event) => { event.preventDefault(); sendHint(); }}><input aria-label="Ask your tutor for help" value={hintQuestion} onChange={(event) => setHintQuestion(event.target.value)} placeholder="Ask for a hint…" /><button aria-label="Send hint request" type="submit">↑</button></form></aside>
    </div>
  </section>;
}

function LeaderboardView({ onFindChallenge }: { onFindChallenge: () => void }) {
  const people = [["Maya Chen", "2,480", "MC", "violet"], ["Lucas Hart", "2,260", "LH", "blue"], ["Alex Morgan", "1,560", "AM", "gold"], ["Nora Ali", "1,420", "NA", "pink"], ["Samir Rao", "1,120", "SR", "green"]];
  const [period, setPeriod] = useState("This week");
  const dateLabel = period === "This week" ? "July 15 – July 21" : period === "Last week" ? "July 8 – July 14" : "June 24 – June 30";
  return <section className="workspace-view leaderboard-view"><div className="view-hero"><div><span className="eyebrow">WEEKLY LEADERBOARD</span><h1>Keep climbing.</h1><p>You&apos;re in the top 18% of learners this week. A single challenge could move you up.</p></div><div className="rank-medal">#3</div></div><div className="leaderboard-grid"><article className="leaderboard-card card"><div className="leaderboard-card__top"><div><h2>Python pathfinders</h2><p>{dateLabel}</p></div><label className="select-button"><span className="sr-only">Leaderboard period</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>This week</option><option>Last week</option><option>Last month</option></select></label></div>{people.map(([name, score, initials, color], index) => <div className={name === "Alex Morgan" ? "leader-row leader-row--you" : "leader-row"} key={name}><span className="rank">{index + 1}</span><span className={`avatar avatar--${color}`}>{initials}</span><b>{name}{name === "Alex Morgan" && <small> You</small>}</b><span className="leader-xp">✦ {score} XP</span></div>)}</article><aside className="card leaderboard-side"><span className="eyebrow">YOUR WEEK</span><div className="week-score"><b>1,560</b><span>XP earned</span></div><div className="bar-chart">{[25, 58, 35, 72, 49, 88, 42].map((height, index) => <div key={height + index}><i style={{ height: `${height}%` }} /><span>{["M", "T", "W", "T", "F", "S", "S"][index]}</span></div>)}</div><hr /><p><b>440 XP</b> will put you in first place.</p><button className="button button--primary" type="button" onClick={onFindChallenge}>Find a challenge →</button></aside></div></section>;
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="dialog-card" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}><div className="dialog-head"><h2>{title}</h2><button type="button" className="dialog-close" onClick={onClose} aria-label={`Close ${title}`}>×</button></div>{children}</section></div>;
}

export default function Home({ initialView = "dashboard", initialLearnStage = "languages", initialTopicId = 1 }: { initialView?: View; initialLearnStage?: LearnStage; initialTopicId?: number }) {
  const [view, setView] = useState<View>(initialView);
  const [notice, setNotice] = useState("");
  const [xp, setXp] = useState(1560);
  const [account, setAccount] = useState<CodeQuestAccount | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [celebrations, setCelebrations] = useState(true);
  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3600); };
  const navigate = (nextView: View) => { setView(nextView); setPanel(null); };
  const openPractice = () => { navigate("practice"); showNotice("Today's quest is ready. Answer the first question to earn XP."); };
  const subtitle = useMemo(() => ({ dashboard: "YOUR PERSONAL LEARNING SPACE", learn: "LEARNING HUB", practice: "PRACTICE ARENA", challenges: "CHALLENGE ZONE", leaderboard: "COMPETE & CELEBRATE" }[view]), [view]);
  const awardXp = (amount: number, message: string) => { setXp((current) => current + amount); if (celebrations) showNotice(message); };
  const goPractice = () => { setView("practice"); setNotice("Today’s quest is ready. Answer the first question to earn XP."); window.setTimeout(() => setNotice(""), 3600); };

  return <main className="app-shell bg-quest-bg">
    <aside className="sidebar">
      <button className="brand" onClick={() => setView("dashboard")} aria-label="CodeQuest home"><span className="brand-mark">⌘</span><span>code<span>quest</span></span></button>
      <div className="sidebar-label">{subtitle}</div>
      <nav>{navItems.map((item) => <button key={item.id} onClick={() => setView(item.id)} className={view === item.id ? "nav-link nav-link--active" : "nav-link"}><span>{item.icon}</span>{item.label}{item.id === "practice" && <i>5</i>}</button>)}</nav>
      <div className="sidebar-bottom"><button type="button" className="nav-link" onClick={() => setPanel("help")}><span>?</span>Help center</button><button type="button" className="nav-link" onClick={() => setPanel("settings")}><span>⚙</span>Settings</button>{dailyReminders && <div className="sidebar-promo"><span>✦</span><b>Build your habit</b><p>Study 10 minutes today to protect your streak.</p><button type="button" onClick={openPractice}>Start a session →</button></div>}</div>
    </aside>
    <section className="main-area">
      <header className="topbar"><div className="mobile-brand"><span>⌘</span> codequest</div><div className="topbar-spacer" /><button className="top-stat top-stat--flame" onClick={goPractice}><span>♨</span><b>5</b></button><button className="top-stat top-stat--xp" onClick={() => setView("leaderboard")}><span>✦</span><b>{xp.toLocaleString()} XP</b></button><AccountAccess account={account} onAccountChange={setAccount} onViewProfile={() => setView("leaderboard")} /></header>
      <div className="page-content">{view === "dashboard" && <HomeView onNavigate={navigate} xp={xp} onPractice={openPractice} onOpenQuest={() => setPanel("quest")} />}{view === "learn" && <LearnView initialStage={initialLearnStage} initialTopicId={initialTopicId} />}{view === "practice" && <PracticeView onComplete={() => awardXp(40, "Quest complete! +40 XP added to your quest.")} />}{view === "challenges" && <ChallengesView onGainXp={(amount, title) => awardXp(amount, `${title} submitted! +${amount} XP added to your quest.`)} />}{view === "leaderboard" && <LeaderboardView onFindChallenge={() => navigate("challenges")} />}</div>
    </section>
    <nav aria-label="Mobile navigation" className="mobile-bottom-nav fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-2xl border border-white/10 bg-quest-surface/95 p-1 shadow-2xl shadow-black/40 backdrop-blur">
      {navItems.map((item) => <button key={item.id} onClick={() => setView(item.id)} aria-current={view === item.id ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition ${view === item.id ? "bg-quest-purple/20 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><span className="text-base leading-none">{item.icon}</span><span className="truncate">{item.label}</span></button>)}
    </nav>
    {panel === "help" && <Dialog title="Help center" onClose={() => setPanel(null)}><p className="dialog-copy">Pick a quick way forward. Your learning progress stays right where it is.</p><div className="dialog-list"><button type="button" onClick={() => navigate("learn")}><b>Continue a lesson</b><span>Open your Python roadmap and pick up where you left off.</span></button><button type="button" onClick={openPractice}><b>Start today’s quest</b><span>Warm up with a five-minute Python question.</span></button><button type="button" onClick={() => navigate("challenges")}><b>Browse challenges</b><span>Practice an algorithm problem with test cases and hints.</span></button></div></Dialog>}
    {panel === "settings" && <Dialog title="Settings" onClose={() => setPanel(null)}><p className="dialog-copy">Choose how CodeQuest supports your learning habit.</p><div className="setting-row"><div><b>Daily study reminder</b><span>Show a reminder when today’s quest is waiting.</span></div><button type="button" className={dailyReminders ? "setting-switch setting-switch--on" : "setting-switch"} aria-pressed={dailyReminders} onClick={() => { setDailyReminders((current) => !current); showNotice(`Daily reminders ${dailyReminders ? "paused" : "enabled"}.`); }}><i /></button></div><div className="setting-row"><div><b>Progress celebrations</b><span>Show XP and milestone confirmations while you learn.</span></div><button type="button" className={celebrations ? "setting-switch setting-switch--on" : "setting-switch"} aria-pressed={celebrations} onClick={() => { setCelebrations((current) => !current); showNotice(`Progress celebrations ${celebrations ? "paused" : "enabled"}.`); }}><i /></button></div></Dialog>}
    {panel === "quest" && <Dialog title="Your quest" onClose={() => setPanel(null)}><p className="dialog-copy">You’re 440 XP away from Level 12. A completed daily quest earns 40 XP, and challenges earn even more.</p><div className="quest-dialog-stats"><div><b>{xp.toLocaleString()}</b><span>current XP</span></div><div><b>5 days</b><span>current streak</span></div><div><b>72%</b><span>to Level 12</span></div></div><div className="dialog-actions"><button type="button" className="button button--ghost" onClick={() => navigate("leaderboard")}>View leaderboard</button><button type="button" className="button button--primary" onClick={openPractice}>Start quest →</button></div></Dialog>}
    {notice && <div className="toast"><span>✦</span>{notice}</div>}
  </main>;
}
