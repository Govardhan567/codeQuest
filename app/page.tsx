"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AccountAccess, type CodeQuestAccount } from "@/app/account-access";
import { createClient, hasSupabaseAuth } from "@/lib/client";
import { runPythonInBrowser } from "@/lib/browser-python-runner";
import { learnLanguages, pythonTopics, type PythonTopic } from "@/lib/learn-content";

const CodeEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="learn-editor-loading">Preparing editor…</div>,
});

type View = "dashboard" | "learn" | "practice" | "challenges" | "compiler" | "leaderboard";
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

const baseChallenges = [
  { title: "Two Sum", topic: "Arrays · Hash Map", difficulty: "Easy", solved: true, xp: 50 },
  { title: "Valid Parentheses", topic: "Stacks", difficulty: "Easy", solved: false, xp: 60 },
  { title: "Longest Substring", topic: "Sliding Window", difficulty: "Medium", solved: false, xp: 100 },
  { title: "Merge Intervals", topic: "Arrays · Sorting", difficulty: "Medium", solved: false, xp: 120 },
];

type AdvancedChallenge = { title: string; topic: string; functionName: string; description: string; hint: string; call: string; expected: unknown };
const advancedChallengeSpecs: AdvancedChallenge[] = [
  ["LRU Cache", "Design · Hash Map", "lru_cache", "Design a least-recently-used cache that returns the final values after a sequence of gets and puts.", "Combine a dictionary with an ordered structure; every read refreshes recency.", "lru_cache(2, [('put', 1, 1), ('put', 2, 2), ('get', 1), ('put', 3, 3), ('get', 2)])", [1, -1]],
  ["Median of Two Sorted Arrays", "Binary Search", "find_median", "Return the median of two sorted arrays in logarithmic time.", "Binary-search the shorter array's partition.", "find_median([1, 3], [2])", 2],
  ["Trapping Rain Water", "Two Pointers", "trap_water", "Calculate how much water can be trapped between elevation bars.", "Track the best wall seen from each side and advance the lower side.", "trap_water([0,1,0,2,1,0,1,3,2,1,2,1])", 6],
  ["Sliding Window Maximum", "Deque · Sliding Window", "max_sliding_window", "Return the maximum value in every window of size k.", "Keep indices in a decreasing deque and discard indices outside the window.", "max_sliding_window([1,3,-1,-3,5,3,6,7], 3)", [3,3,5,5,6,7]],
  ["Minimum Window Substring", "Sliding Window", "min_window", "Find the smallest substring that contains every character in the target.", "Expand until valid, then contract while keeping the window valid.", "min_window('ADOBECODEBANC', 'ABC')", "BANC"],
  ["Word Ladder", "Graphs · BFS", "word_ladder", "Return the shortest transformation length between two words.", "BFS level by level; generate one-letter neighbors.", "word_ladder('hit', 'cog', ['hot','dot','dog','lot','log','cog'])", 5],
  ["Course Schedule II", "Graphs · Topological Sort", "find_course_order", "Return a valid course order from prerequisite pairs.", "Use indegrees and a queue of courses with no prerequisites.", "find_course_order(2, [[1,0]])", [0,1]],
  ["Serialize Binary Tree", "Trees · DFS", "serialize_tree", "Serialize a level-order tree list, keeping null placeholders needed for structure.", "Use a queue and trim only trailing null values.", "serialize_tree([1,2,3,None,None,4,5])", "1,2,3,#,#,4,5"],
  ["Lowest Common Ancestor", "Trees · DFS", "lowest_common_ancestor", "Return the lowest shared ancestor value in a binary-search-tree value list.", "Walk down: both targets left, both right, otherwise the current node is the answer.", "lowest_common_ancestor([6,2,8,0,4,7,9,None,None,3,5], 2, 8)", 6],
  ["Binary Tree Maximum Path", "Trees · Dynamic Programming", "max_path_sum", "Return the largest path sum in a binary tree represented in level order.", "A recursive call returns one usable branch; update a global best with both branches.", "max_path_sum([-10,9,20,None,None,15,7])", 42],
  ["Decode Ways", "Dynamic Programming", "num_decodings", "Count the valid letter decodings of a digit string.", "At each position, consider one valid digit and one valid two-digit number.", "num_decodings('226')", 3],
  ["Coin Change", "Dynamic Programming", "coin_change", "Return the fewest coins needed to reach an amount, or -1.", "Build a bottom-up table where each amount tries every coin.", "coin_change([1,2,5], 11)", 3],
  ["Edit Distance", "Dynamic Programming", "edit_distance", "Find the minimum insertions, deletions, and replacements between two words.", "Use a matrix where each cell comes from its top, left, and diagonal neighbors.", "edit_distance('horse', 'ros')", 3],
  ["Regular Expression Matching", "Dynamic Programming", "regex_match", "Match a string against a pattern containing . and *.", "Let dp[i][j] represent the first i characters against the first j pattern characters.", "regex_match('aab', 'c*a*b')", true],
  ["Distinct Subsequences", "Dynamic Programming", "num_distinct", "Count how many subsequences of source equal target.", "When characters match, add the count that uses it and the count that skips it.", "num_distinct('rabbbit', 'rabbit')", 3],
  ["Longest Increasing Subsequence", "Binary Search · DP", "length_of_lis", "Return the length of the longest strictly increasing subsequence.", "Maintain minimal possible tails and binary-search where each value belongs.", "length_of_lis([10,9,2,5,3,7,101,18])", 4],
  ["Russian Doll Envelopes", "Sorting · Binary Search", "max_envelopes", "Find the maximum number of envelopes that can nest.", "Sort width ascending and height descending, then solve LIS on heights.", "max_envelopes([[5,4],[6,4],[6,7],[2,3]])", 3],
  ["Kth Largest Element", "Heap · Quickselect", "kth_largest", "Return the kth largest value without fully sorting when possible.", "A min-heap of size k keeps exactly the candidates you need.", "kth_largest([3,2,1,5,6,4], 2)", 5],
  ["Merge K Sorted Lists", "Heap · Linked Lists", "merge_k_lists", "Merge sorted lists represented as nested Python lists.", "Push each list head into a heap with its source index.", "merge_k_lists([[1,4,5],[1,3,4],[2,6]])", [1,1,2,3,4,4,5,6]],
  ["Find Median from Stream", "Heaps", "stream_medians", "Return the median after every number in a stream.", "Balance a max-heap for the lower half and min-heap for the upper half.", "stream_medians([2,1,5,7,2,0,5])", [2,1.5,2,3.5,2,2,2]],
  ["Largest Rectangle Histogram", "Monotonic Stack", "largest_rectangle", "Return the area of the largest rectangle in a histogram.", "Use a stack of increasing bar indices and append a zero-height sentinel.", "largest_rectangle([2,1,5,6,2,3])", 10],
  ["Daily Temperatures", "Monotonic Stack", "daily_temperatures", "For each day, return how many days until a warmer temperature.", "Store unresolved indices in a decreasing temperature stack.", "daily_temperatures([73,74,75,71,69,72,76,73])", [1,1,4,2,1,1,0,0]],
  ["Asteroid Collision", "Stacks", "asteroid_collision", "Resolve collisions among moving asteroids.", "Only a positive asteroid followed by a negative asteroid can collide.", "asteroid_collision([5,10,-5])", [5,10]],
  ["Clone Graph", "Graphs · DFS", "clone_graph", "Clone an undirected graph represented as an adjacency dictionary.", "Visit each node once and copy every neighbor list.", "clone_graph({1:[2,4],2:[1,3],3:[2,4],4:[1,3]})", {1:[2,4],2:[1,3],3:[2,4],4:[1,3]}],
  ["Number of Islands", "Graphs · BFS", "num_islands", "Count connected land regions in a grid.", "Flood-fill every unvisited land cell and increment once per traversal.", "num_islands(['11000','11000','00100','00011'])", 3],
  ["Pacific Atlantic Water Flow", "Graphs · DFS", "pacific_atlantic", "Return cells that can flow to both oceans.", "Reverse the search: start from each ocean edge and intersect reachable cells.", "pacific_atlantic([[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]])", [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]],
  ["Rotting Oranges", "Graphs · BFS", "oranges_rotting", "Return minutes until all fresh oranges rot, or -1.", "Seed a queue with all rotten oranges and process one minute per BFS layer.", "oranges_rotting([[2,1,1],[1,1,0],[0,1,1]])", 4],
  ["Network Delay Time", "Graphs · Dijkstra", "network_delay", "Return the time for a signal to reach every node.", "Use a min-heap and finalize nodes in shortest-distance order.", "network_delay([[2,1,1],[2,3,1],[3,4,1]], 4, 2)", 2],
  ["Cheapest Flights K Stops", "Graphs · Shortest Path", "cheapest_flight", "Find the cheapest route with at most k stops.", "Relax edges k + 1 times, keeping the previous round separate.", "cheapest_flight(3, [[0,1,100],[1,2,100],[0,2,500]], 0, 2, 1)", 200],
  ["Critical Connections", "Graphs · Tarjan", "critical_connections", "Return all bridges in an undirected network.", "Track discovery and low-link times; a child with low >= discovery is a bridge.", "critical_connections(4, [[0,1],[1,2],[2,0],[1,3]])", [[1,3]]],
  ["N Queens", "Backtracking", "solve_n_queens", "Return the number of valid ways to place n queens.", "Backtrack by row while tracking used columns and diagonals.", "solve_n_queens(4)", 2],
  ["Sudoku Validator", "Hash Sets", "is_valid_sudoku", "Validate a 9x9 Sudoku board with dots for blanks.", "Track seen values for each row, column, and 3x3 box.", "is_valid_sudoku([['5','3','.','.','7','.','.','.','.'],['6','.','.','1','9','5','.','.','.'],['.','9','8','.','.','.','.','6','.'],['8','.','.','.','6','.','.','.','3'],['4','.','.','8','.','3','.','.','1'],['7','.','.','.','2','.','.','.','6'],['.','6','.','.','.','.','2','8','.'],['.','.','.','4','1','9','.','.','5'],['.','.','.','.','8','.','.','7','9']])", true],
  ["Word Search II", "Trie · Backtracking", "find_words", "Find every dictionary word present in a character board.", "Build a trie, then backtrack from every cell while pruning missing prefixes.", "find_words([['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']], ['oath','pea','eat','rain'])", ['eat','oath']],
  ["Implement Trie", "Trie", "trie_operations", "Process insert, search, and prefix operations on a trie.", "Each node needs children and an end-of-word marker.", "trie_operations([('insert','apple'),('search','apple'),('search','app'),('prefix','app')])", [true,false,true]],
  ["Add Two Numbers", "Linked Lists", "add_two_numbers", "Add reversed digit lists and return a reversed digit list.", "Advance both lists together, carrying into the next column.", "add_two_numbers([2,4,3], [5,6,4])", [7,0,8]],
  ["Reverse Nodes in K Group", "Linked Lists", "reverse_k_group", "Reverse every complete group of k values in a list.", "Locate a full group before reversing it, then reconnect its boundaries.", "reverse_k_group([1,2,3,4,5], 2)", [2,1,4,3,5]],
  ["Copy List with Random Pointer", "Linked Lists · Hash Map", "copy_random_list", "Copy nodes represented as [value, random_index] pairs.", "Map each original index to its copied index before wiring random references.", "copy_random_list([[7,None],[13,0],[11,4],[10,2],[1,0]])", [[7,null],[13,0],[11,4],[10,2],[1,0]]],
  ["Product Except Self", "Arrays · Prefix Suffix", "product_except_self", "Return products of every number except the number at its own index.", "Build left products, then multiply by a running right product.", "product_except_self([1,2,3,4])", [24,12,8,6]],
  ["First Missing Positive", "Arrays · Cyclic Sort", "first_missing_positive", "Return the smallest missing positive integer.", "Place each value x at index x - 1 when it belongs in the array.", "first_missing_positive([3,4,-1,1])", 2],
  ["Search in Rotated Array", "Binary Search", "search_rotated", "Find a target index in a rotated sorted array.", "At least one half is sorted; decide whether the target lies inside it.", "search_rotated([4,5,6,7,0,1,2], 0)", 4],
  ["Find Minimum Rotated Array", "Binary Search", "find_min_rotated", "Return the minimum from a rotated sorted array with distinct values.", "Compare the midpoint to the right boundary to discard one sorted half.", "find_min_rotated([3,4,5,1,2])", 1],
  ["Container With Most Water", "Two Pointers", "max_area", "Find the largest container formed by two vertical lines.", "Move only the shorter line because the taller line cannot improve that limiting height.", "max_area([1,8,6,2,5,4,8,3,7])", 49],
  ["3Sum", "Arrays · Two Pointers", "three_sum", "Return every unique triplet whose sum is zero.", "Sort first, skip duplicates, then solve a two-sum for each anchor.", "three_sum([-1,0,1,2,-1,-4])", [[-1,-1,2],[-1,0,1]]],
  ["Subarray Sum Equals K", "Prefix Sum · Hash Map", "subarray_sum", "Count subarrays whose values sum to k.", "Store how often each prefix sum has occurred.", "subarray_sum([1,1,1], 2)", 2],
  ["Maximum Product Subarray", "Dynamic Programming", "max_product", "Return the largest product among all contiguous subarrays.", "A negative number swaps the roles of current minimum and maximum.", "max_product([2,3,-2,4])", 6],
  ["Jump Game II", "Greedy", "min_jumps", "Return the fewest jumps needed to reach the final index.", "Within each jump range, track the farthest next range.", "min_jumps([2,3,1,1,4])", 2],
  ["Gas Station", "Greedy", "can_complete_circuit", "Return the start index that completes a circular fuel route, or -1.", "If the running tank drops below zero, no station in that segment can be the start.", "can_complete_circuit([1,2,3,4,5], [3,4,5,1,2])", 3],
  ["Meeting Rooms II", "Intervals · Heap", "min_meeting_rooms", "Return the minimum number of rooms required for all intervals.", "Sort starts and track active ending times in a min-heap.", "min_meeting_rooms([[0,30],[5,10],[15,20]])", 2],
  ["Text Justification", "Strings · Simulation", "full_justify", "Format words into exactly sized justified text lines.", "Greedily collect a line, then distribute spaces across its gaps.", "full_justify(['This','is','an','example','of','text','justification.'], 16)", ['This    is    an','example  of text','justification.  ']],
  ["Basic Calculator", "Stacks · Parsing", "calculate", "Evaluate an expression containing parentheses, addition, and subtraction.", "Store the current result and sign whenever entering parentheses.", "calculate('(1+(4+5+2)-3)+(6+8)')", 23],
].map(([title, topic, functionName, description, hint, call, expected]) => ({ title, topic, functionName, description, hint, call, expected }));

const challenges = [
  ...baseChallenges,
  ...advancedChallengeSpecs.map(({ title, topic }) => ({ title, topic, difficulty: "Advanced", solved: false, xp: 180 })),
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
type ConsoleState = {
  kind: "idle" | "running" | "success" | "error";
  stdout: string;
  stderr: string;
  label: string;
  runPassed?: boolean;
  outputPassed?: boolean;
};

function LearnView({ initialStage = "languages", initialTopicId = 1 }: { initialStage?: LearnStage; initialTopicId?: number }) {
  const router = useRouter();
  const [stage, setStage] = useState<LearnStage>(initialStage);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopicId);
  // Learners write the solution themselves; the required output remains visible in the task.
  const [code, setCode] = useState("");
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [consoleState, setConsoleState] = useState<ConsoleState>({ kind: "idle", stdout: "", stderr: "", label: "Run code to see its output here." });
  const [checkState, setCheckState] = useState<{ passed?: boolean; actual?: string; expected?: string; message?: string }>({});

  const selectedTopic = pythonTopics.find((topic) => topic.id === selectedTopicId) ?? pythonTopics[0];
  const nextTopic = pythonTopics.find((topic) => topic.position === selectedTopic.position + 1);
  const canMoveNext = Boolean(nextTopic && (completedIds.includes(selectedTopic.id) || checkState.passed));
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
      })
      .catch(() => undefined);
  }, []);

  const statusFor = (topic: PythonTopic) => {
    if (completedIds.includes(topic.id)) return "completed" as const;
    if (topic.position === 1 || completedIds.includes(topic.id - 1)) return "unlocked" as const;
    return "locked" as const;
  };

  const openTopic = (topic: PythonTopic) => {
    if (statusFor(topic) === "locked") return;
    setSelectedTopicId(topic.id);
    setCode("");
    setUseCustomInput(false);
    setCustomInput("");
    setConsoleState({ kind: "idle", stdout: "", stderr: "", label: "Run code to see its output here." });
    setCheckState({});
    setStage("lesson");
  };

  const goToNextTopic = () => {
    if (!canMoveNext || !nextTopic) return;
    openTopic(nextTopic);
  };

  const normalizeTaskOutput = (output: string) => output.replace(/\r\n?/g, "\n").trimEnd();

  const recordLocalCompletion = () => {
    const nextCompleted = [...new Set([...completedIds, selectedTopic.id])];
    setCompletedIds(nextCompleted);
    window.localStorage.setItem("codequest-python-preview-progress", JSON.stringify(nextCompleted));
  };

  const checkExecutionLocally = (execution: { stdout: string; stderr: string; exitCode: number }, checkedWithButton: boolean) => {
    const actualOutput = normalizeTaskOutput(execution.stdout);
    const expectedOutput = normalizeTaskOutput(selectedTopic.expectedOutput);
    const passed = execution.exitCode === 0 && actualOutput === expectedOutput;

    setCheckState({
      passed,
      actual: actualOutput,
      expected: expectedOutput,
      message: passed
        ? checkedWithButton
          ? nextTopic ? `Correct! Opening ${nextTopic.title}…` : "Python foundations complete — great work!"
          : "Correct! The next topic is now unlocked."
        : execution.exitCode === 0
          ? "Your code ran, but this task requires exactly the expected output."
          : "Fix the Python error, then run the task again.",
    });

    if (passed) recordLocalCompletion();
    return passed;
  };

  const runCode = async () => {
    if (!code.trim()) {
      setConsoleState({
        kind: "error",
        stdout: "",
        stderr: "Write your solution before running it. Start with one small step from the example, then try again.",
        label: "Write code first",
        runPassed: false,
        outputPassed: false,
      });
      setCheckState({
        passed: false,
        actual: "",
        expected: normalizeTaskOutput(selectedTopic.expectedOutput),
        message: "Your editor is empty. Use the example and task instructions to write a solution first.",
      });
      return;
    }

    setConsoleState({ kind: "running", stdout: "", stderr: "", label: "Starting Python…" });
    try {
      const result = await runPythonInBrowser(code, useCustomInput ? customInput : selectedTopic.taskInput ?? "");
      const actualOutput = normalizeTaskOutput(result.stdout);
      const expectedOutput = normalizeTaskOutput(selectedTopic.expectedOutput);
      const passed = !useCustomInput && result.exitCode === 0 && actualOutput === expectedOutput;
      const guidance = result.stderr || (passed
        ? ""
        : useCustomInput && result.exitCode === 0
          ? "Custom input run completed. Submit code to check the lesson test cases."
        : `Your output does not match the task yet. Expected: ${expectedOutput || "(no output)"}. Check the task wording and try one small change.`);
      setConsoleState({
        kind: passed || (useCustomInput && result.exitCode === 0) ? "success" : "error",
        stdout: result.stdout,
        stderr: guidance,
        label: passed ? "Finished" : useCustomInput && result.exitCode === 0 ? "Custom run complete" : result.exitCode === 0 ? "Needs changes" : "Finished with an error",
        runPassed: result.exitCode === 0,
        outputPassed: passed,
      });
      if (useCustomInput) {
        setCheckState({ message: "Custom input run completed. Use Submit Code to evaluate the lesson test cases." });
      } else {
        checkExecutionLocally(result, false);
      }
    } catch (error) {
      setConsoleState({ kind: "error", stdout: "", stderr: error instanceof Error ? error.message : "Unable to run that code.", label: "Python unavailable", runPassed: false, outputPassed: false });
      setCheckState({ message: error instanceof Error ? error.message : "Unable to run that code." });
    }
  };

  const checkTask = async () => {
    if (!code.trim()) {
      await runCode();
      return;
    }
    setCheckState({ message: "Checking your solution…" });
    try {
      const execution = await runPythonInBrowser(code, selectedTopic.taskInput ?? "");
      const actualOutput = normalizeTaskOutput(execution.stdout);
      const expectedOutput = normalizeTaskOutput(selectedTopic.expectedOutput);
      const passed = execution.exitCode === 0 && actualOutput === expectedOutput;
      setConsoleState({
        kind: passed ? "success" : "error",
        stdout: execution.stdout,
        stderr: execution.stderr || (passed ? "" : `Expected: ${expectedOutput || "(no output)"}. Review the task, then update your code.`),
        label: passed ? "Finished" : execution.exitCode === 0 ? "Needs changes" : "Finished with an error",
        runPassed: execution.exitCode === 0,
        outputPassed: passed,
      });
      if (!checkExecutionLocally(execution, true)) return;

      const response = await fetch(`/api/learn/python/topics/${selectedTopic.id}/check`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(execution),
      });
      if (!response.ok) {
        if (response.status === 401) {
          setCheckState((current) => ({
            ...current,
            message: "Correct! This topic is unlocked in this browser. Sign in to save progress across devices.",
          }));
        } else {
          const result = await response.json().catch(() => null) as { error?: string } | null;
          setCheckState((current) => ({
            ...current,
            message: result?.error ?? "Correct! This topic is unlocked in this browser. Progress could not be synced yet.",
          }));
        }
      }
      if (nextTopic) window.setTimeout(() => openTopic(nextTopic), 1_000);
    } catch {
      setCheckState((current) => ({
        ...current,
        message: "Correct! This topic is unlocked in this browser. Progress could not be synced yet.",
      }));
    }
  };

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
        <section className="lesson-understand-problem" aria-labelledby="understand-problem-title">
          <span>Problem to solve</span>
          <h2 id="understand-problem-title">{selectedTopic.taskTitle}</h2>
          <p>{selectedTopic.taskDescription}</p>
          <small>Expected output: <code>{selectedTopic.expectedOutput}</code></small>
        </section>
      </article>
      <article className="lesson-code card">
        <div className="lesson-code__head"><span className="lesson-panel-label">02 · Try it</span><span>main.py</span></div>
        <CodeEditor height="480px" defaultLanguage="python" language="python" value={code} onChange={(value) => setCode(value ?? "")} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: "on", scrollBeyondLastLine: false, folding: false, padding: { top: 14, bottom: 14 }, automaticLayout: true }} />
        <div className="lesson-runner-controls">
          <div className="lesson-runner-controls__tools"><button type="button" onClick={() => setCode("")}>Clear editor</button><span>Python 3</span></div>
          <label className="lesson-custom-toggle"><input type="checkbox" checked={useCustomInput} onChange={(event) => setUseCustomInput(event.target.checked)} /> Test against custom input</label>
          {useCustomInput && <textarea className="lesson-custom-input" aria-label="Custom program input" value={customInput} onChange={(event) => setCustomInput(event.target.value)} placeholder="Type the input your program should receive" />}
          <div className="lesson-run-actions"><button className="lesson-run lesson-run--secondary" onClick={runCode} disabled={consoleState.kind === "running"}>{consoleState.kind === "running" ? "Running…" : "▷ Run Code"}</button><button className="lesson-run lesson-run--submit" onClick={() => void checkTask()} disabled={consoleState.kind === "running"}>Submit Code</button></div>
        </div>
        <div className="lesson-runbar"><button className="lesson-run" onClick={runCode} disabled={consoleState.kind === "running"}>{consoleState.kind === "running" ? "Running…" : "▷ Run code"}</button><span>Runs privately in your browser</span></div>
        <div className={`lesson-console lesson-console--${consoleState.kind}`} role="status" aria-live="polite"><div><b>Output</b><span>{consoleState.label}</span></div>{consoleState.stdout && <pre>{consoleState.stdout}</pre>}{consoleState.stderr && <pre className="lesson-console__error">{consoleState.stderr}</pre>}{!consoleState.stdout && !consoleState.stderr && <pre className="lesson-console__empty">{consoleState.label}</pre>}</div>
      </article>
      <aside className="lesson-task card">
        <span className="lesson-panel-label">03 · Practice task</span>
        <div className="lesson-task__badge">{selectedTopic.position.toString().padStart(2, "0")}</div><h2>{selectedTopic.taskTitle}</h2><p>{selectedTopic.taskDescription}</p>
        {selectedTopic.taskInput && <div className="lesson-input-note"><b>Checker input</b><code>Ada</code></div>}
        <section className="lesson-test-cases" aria-live="polite">
          <div className="lesson-test-cases__head"><b>Test cases</b><span>2 checks</span></div>
          <ol>
            <li className={consoleState.runPassed === undefined ? "lesson-test-case" : consoleState.runPassed ? "lesson-test-case lesson-test-case--passed" : "lesson-test-case lesson-test-case--failed"}>
              <div><b>Code runs</b><small>Your solution must run without a Python error.</small></div>
              <span>{consoleState.runPassed === undefined ? "Ready" : consoleState.runPassed ? "Passed" : "Failed"}</span>
            </li>
            <li className={consoleState.outputPassed === undefined ? "lesson-test-case" : consoleState.outputPassed ? "lesson-test-case lesson-test-case--passed" : "lesson-test-case lesson-test-case--failed"}>
              <div><b>Required output</b><small>{selectedTopic.taskInput ? `Input: ${selectedTopic.taskInput}` : "No input"} · Expected: <code>{selectedTopic.expectedOutput}</code></small></div>
              <span>{consoleState.outputPassed === undefined ? "Ready" : consoleState.outputPassed ? "Passed" : "Failed"}</span>
            </li>
          </ol>
        </section>
        <button className="lesson-check" onClick={checkTask}>Check solution</button>
        {checkState.message && <p className="lesson-check-message">{checkState.message}</p>}
        {checkState.passed !== undefined && <div className={checkState.passed ? "lesson-result lesson-result--pass" : "lesson-result lesson-result--fail"}><b>{checkState.passed ? "Nice work — topic complete!" : "Not quite yet"}</b>{!checkState.passed && <><span>Expected</span><code>{checkState.expected}</code><span>Your output</span><code>{checkState.actual || "(no output)"}</code></>}</div>}
        <div className="lesson-next"><button disabled={!canMoveNext} onClick={goToNextTopic}>{nextTopic ? "Next topic →" : "Python foundations complete"}</button>{!completedIds.includes(selectedTopic.id) && !checkState.passed && <small>Run or check the task to unlock the next topic. Sign in to save progress across devices.</small>}</div>
      </aside>
    </div>
  </section>;
}

const starterPracticeQuestions = [
  { level: "Basic", prompt: "What does this expression return?", code: "7 + 5", answer: "12", explanation: "Correct. Python adds the two integers.", next: "Repeat a short string." },
  { level: "Basic", prompt: "What does this expression return?", code: '"py" * 3', answer: "pypypy", explanation: "Exactly. Multiplying a string repeats it.", next: "Count characters in a word." },
  { level: "Basic", prompt: "What does this expression return?", code: 'len("quest")', answer: "5", explanation: "Right. quest has five characters.", next: "Read the first item in a list." },
  { level: "Basic", prompt: "What does this expression return?", code: "[4, 5, 6][0]", answer: "4", explanation: "Correct. Python list indexes begin at 0.", next: "Find a remainder." },
  { level: "Basic", prompt: "What does this expression return?", code: "10 % 4", answer: "2", explanation: "Nice. % gives the remainder after division.", next: "Add values in a list." },
  { level: "Intermediate", prompt: "What does this expression return?", code: "sum([2, 4, 6])", answer: "12", explanation: "Correct. sum() adds every item in the list.", next: "Use range() with a step." },
  { level: "Intermediate", prompt: "What does this expression return?", code: "list(range(2, 7, 2))", answer: "[2, 4, 6]", explanation: "Exactly. range stops before 7 and moves by 2.", next: "Check a palindrome." },
  { level: "Intermediate", prompt: "What does this expression return?", code: '"level" == "level"[::-1]', answer: "true", explanation: "Right. level is the same when reversed.", next: "Read a dictionary value." },
  { level: "Intermediate", prompt: "What does this expression return?", code: '{"score": 95}["score"]', answer: "95", explanation: "Correct. A dictionary retrieves a value by its key.", next: "Filter the even values." },
  { level: "Intermediate", prompt: "What does this expression return?", code: "[n for n in range(6) if n % 2 == 0]", answer: "[0, 2, 4]", explanation: "Nice. The condition keeps only even numbers.", next: "Call a lambda function." },
  { level: "Advanced", prompt: "What does this expression return?", code: "(lambda n: n * n)(5)", answer: "25", explanation: "Correct. The lambda squares its input.", next: "Combine filter and sum." },
  { level: "Advanced", prompt: "What does this expression return?", code: "sum(n for n in range(10) if n % 2 == 0)", answer: "20", explanation: "Exactly. The even values are 0, 2, 4, 6, and 8.", next: "Test whether every value passes a condition." },
  { level: "Advanced", prompt: "What does this expression return?", code: "all(n > 0 for n in [3, 1, 8])", answer: "true", explanation: "Right. Every value is greater than zero.", next: "Use a nested list comprehension." },
  { level: "Advanced", prompt: "What does this expression return?", code: "[x * y for x in [1, 2] for y in [3, 4]]", answer: "[3, 4, 6, 8]", explanation: "Correct. The inner loop runs for each value of x.", next: "Find the best score with a lambda." },
  { level: "Advanced", prompt: "What does this expression return?", code: "max({\"Ada\": 92, \"Mina\": 98}, key=lambda name: {\"Ada\": 92, \"Mina\": 98}[name])", answer: "Mina", explanation: "Excellent. The key lambda selects the name with the largest score.", next: "Finish the practice set." },
];

const generatedBasicPracticeQuestions = Array.from({ length: 45 }, (_, index) => {
  const number = index + 6;
  return {
    level: "Basic",
    prompt: `Basic prompt ${index + 6}: What does this expression return?`,
    code: `${number} * 2 + 1`,
    answer: String(number * 2 + 1),
    explanation: "Correct. Multiplication happens before addition.",
    next: "Try another short arithmetic expression.",
  };
});

const generatedIntermediatePracticeQuestions = Array.from({ length: 45 }, (_, index) => {
  const limit = index + 4;
  const answer = (limit * (limit + 1)) / 2;
  return {
    level: "Intermediate",
    prompt: `Intermediate prompt ${index + 6}: What does this expression return?`,
    code: `sum(range(1, ${limit + 1}))`,
    answer: String(answer),
    explanation: "Exactly. range creates the values and sum() adds them together.",
    next: "Practice another loop-based total.",
  };
});

const generatedAdvancedPracticeQuestions = Array.from({ length: 45 }, (_, index) => {
  const number = index + 6;
  return {
    level: "Advanced",
    prompt: `Advanced prompt ${index + 6}: What does this expression return?`,
    code: `(lambda value: value ** 2 - value)(${number})`,
    answer: String(number ** 2 - number),
    explanation: "Correct. The lambda runs immediately and returns its calculated value.",
    next: "Practice another lambda expression.",
  };
});

const practiceQuestions = [
  ...starterPracticeQuestions.filter((question) => question.level === "Basic"),
  ...generatedBasicPracticeQuestions,
  ...starterPracticeQuestions.filter((question) => question.level === "Intermediate"),
  ...generatedIntermediatePracticeQuestions,
  ...starterPracticeQuestions.filter((question) => question.level === "Advanced"),
  ...generatedAdvancedPracticeQuestions,
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
  "Two Sum": { description: "Given an array of integers and a target, return the indices of the two numbers that add up to the target.", starterCode: "def two_sum(nums, target):\n    # Return the indices of the pair that reaches target.\n    pass", testCase: "Input: [2, 7, 11, 15], target = 9\nExpected output: [0, 1]", expectedOutput: "[0, 1]", hint: "Use a dictionary to remember each number's index as you scan the list." },
  "Valid Parentheses": { description: "Check whether every opening bracket has the matching closing bracket in the correct order.", starterCode: "def is_valid(value):\n    # Return True only when every bracket is correctly matched.\n    pass", testCase: "Input: ()[]{}\nExpected output: True", expectedOutput: "True", hint: "A stack lets you match each closing bracket with the most recent opening bracket." },
  "Longest Substring": { description: "Find the length of the longest substring that contains no repeated characters.", starterCode: "def longest_unique_substring(value):\n    # Return the length of the longest substring without repeats.\n    pass", testCase: "Input: abcabcbb\nExpected output: 3", expectedOutput: "3", hint: "Move a sliding-window start pointer past a repeated character instead of rebuilding the substring." },
  "Merge Intervals": { description: "Merge overlapping ranges into the smallest set of non-overlapping intervals.", starterCode: "def merge_intervals(intervals):\n    # Return the merged, non-overlapping intervals.\n    pass", testCase: "Input: [[1, 3], [2, 6], [8, 10]]\nExpected output: [[1, 6], [8, 10]]", expectedOutput: "[[1, 6], [8, 10]]", hint: "Sort ranges by their first value, then compare each new range with the last merged range." },
  ...Object.fromEntries(advancedChallengeSpecs.map((problem) => [problem.title, {
    description: problem.description,
    starterCode: `def ${problem.functionName}(*args):\n    # ${problem.description}\n    pass`,
    testCase: `Call: ${problem.call}\nExpected output: ${JSON.stringify(problem.expected)}`,
    expectedOutput: JSON.stringify(problem.expected),
    hint: problem.hint,
  }])),
};

type ChallengeTestCase = { label: string; call: string; expected: unknown };
type ChallengeTestResult = { label: string; passed: boolean; actual: string; expected: string };

const challengeTestCases: Record<string, ChallengeTestCase[]> = {
  "Two Sum": [
    { label: "Example pair", call: "two_sum([2, 7, 11, 15], 9)", expected: [0, 1] },
    { label: "Values out of order", call: "two_sum([3, 2, 4], 6)", expected: [1, 2] },
    { label: "Duplicate values", call: "two_sum([3, 3], 6)", expected: [0, 1] },
  ],
  "Valid Parentheses": [
    { label: "Balanced groups", call: "is_valid('()[]{}')", expected: true },
    { label: "Mismatched pair", call: "is_valid('(]')", expected: false },
    { label: "Incorrect nesting", call: "is_valid('([)]')", expected: false },
    { label: "Nested groups", call: "is_valid('{[]}')", expected: true },
  ],
  "Longest Substring": [
    { label: "Repeating pattern", call: "longest_unique_substring('abcabcbb')", expected: 3 },
    { label: "One repeated character", call: "longest_unique_substring('bbbbb')", expected: 1 },
    { label: "Overlapping window", call: "longest_unique_substring('pwwkew')", expected: 3 },
    { label: "Empty string", call: "longest_unique_substring('')", expected: 0 },
  ],
  "Merge Intervals": [
    { label: "Separate ranges", call: "merge_intervals([[1, 3], [2, 6], [8, 10]])", expected: [[1, 6], [8, 10]] },
    { label: "Touching ranges", call: "merge_intervals([[1, 4], [4, 5]])", expected: [[1, 5]] },
    { label: "Same ending", call: "merge_intervals([[1, 4], [0, 4]])", expected: [[0, 4]] },
  ],
  ...Object.fromEntries(advancedChallengeSpecs.map((problem) => [problem.title, [
    { label: "Interview example", call: problem.call, expected: problem.expected },
  ]])),
};

const TEST_RESULT_MARKER = "__CODEQUEST_TEST_RESULTS__";

function buildChallengeTestHarness(code: string, testCases: ChallengeTestCase[]) {
  const serializedCases = JSON.stringify(testCases);
  return `${code}\n\nimport json\n__codequest_cases = json.loads(${JSON.stringify(serializedCases)})\n__codequest_results = []\nfor __codequest_case in __codequest_cases:\n    try:\n        __codequest_actual = eval(__codequest_case[\"call\"])\n        __codequest_expected = __codequest_case[\"expected\"]\n        __codequest_results.append({\n            \"label\": __codequest_case[\"label\"],\n            \"passed\": __codequest_actual == __codequest_expected,\n            \"actual\": repr(__codequest_actual),\n            \"expected\": repr(__codequest_expected),\n        })\n    except Exception as __codequest_error:\n        __codequest_results.append({\n            \"label\": __codequest_case[\"label\"],\n            \"passed\": False,\n            \"actual\": f\"Error: {__codequest_error}\",\n            \"expected\": repr(__codequest_case[\"expected\"]),\n        })\nprint(${JSON.stringify(TEST_RESULT_MARKER)} + json.dumps(__codequest_results))`;
}

function readChallengeTestResults(stdout: string): ChallengeTestResult[] | null {
  const lines = stdout.split("\n");
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index];
    if (!line.startsWith(TEST_RESULT_MARKER)) continue;
    try {
      const results = JSON.parse(line.slice(TEST_RESULT_MARKER.length)) as ChallengeTestResult[];
      return Array.isArray(results) ? results : null;
    } catch {
      return null;
    }
  }
  return null;
}

function ChallengeTestSummary({ testCases, results }: { testCases: ChallengeTestCase[]; results: ChallengeTestResult[] }) {
  return <section className="challenge-test-summary" aria-live="polite">
    <div className="challenge-test-summary__head"><b>Test cases</b><span>{testCases.length} total</span></div>
    <ol>
      {testCases.map((testCase) => {
        const result = results.find((item) => item.label === testCase.label);
        return <li key={testCase.label} className={result ? result.passed ? "challenge-test-case challenge-test-case--passed" : "challenge-test-case challenge-test-case--failed" : "challenge-test-case"}>
          <div><b>{testCase.label}</b><code>{testCase.call}</code></div>
          <span>{!result ? "Ready" : result.passed ? "Passed" : "Failed"}</span>
          {result && !result.passed && <small>Expected {result.expected}; received {result.actual}</small>}
        </li>;
      })}
    </ol>
  </section>;
}

type RunnerLanguage = { id: number; name: string };
type RunnerResult = { stdout: string; stderr: string; compileOutput: string; message: string; time: string | null; memory: number | null; status: { id?: number; description?: string } | null };

function CodeRunnerView() {
  const [languages, setLanguages] = useState<RunnerLanguage[]>([]);
  const [languageId, setLanguageId] = useState<number | null>(null);
  const [code, setCode] = useState('print("Hello, world!")');
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<RunnerResult | null>(null);
  const [message, setMessage] = useState("Loading supported languages…");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetch("/api/execute")
      .then(async (response) => response.ok ? response.json() as Promise<RunnerLanguage[]> : Promise.reject())
      .then((items) => {
        setLanguages(items);
        const python = items.find((item) => item.name.toLowerCase().startsWith("python"));
        setLanguageId(python?.id ?? items[0]?.id ?? null);
        setMessage(items.length ? "Write code, add optional input, then run it." : "No languages are available right now.");
      })
      .catch(() => setMessage("The code runner is unavailable. Try again shortly."));
  }, []);

  const run = async () => {
    if (!languageId || !code.trim()) {
      setMessage("Choose a language and write code before running it.");
      return;
    }
    setRunning(true);
    setResult(null);
    setMessage("Running your program safely…");
    try {
      const response = await fetch("/api/execute", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ languageId, sourceCode: code, stdin }) });
      const data = await response.json() as RunnerResult & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to run this program.");
      setResult(data);
      setMessage(data.status?.description ?? "Run complete.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to run this program.");
    } finally {
      setRunning(false);
    }
  };

  return <section className="workspace-view runner-view">
    <div className="runner-heading"><div><span className="eyebrow">CODE RUNNER</span><h1>Write. Run. Improve.</h1><p>A HackerRank-style workspace for every language your runner supports.</p></div><label><span>Language</span><select value={languageId ?? ""} onChange={(event) => setLanguageId(Number(event.target.value))} disabled={!languages.length}>{languages.map((language) => <option key={language.id} value={language.id}>{language.name}</option>)}</select></label></div>
    <div className="runner-grid">
      <article className="runner-editor card"><div className="runner-panel-head"><b>Solution</b><span>{languages.find((language) => language.id === languageId)?.name ?? "Loading…"}</span></div><textarea aria-label="Code editor" value={code} onChange={(event) => setCode(event.target.value)} spellCheck="false" /><div className="runner-actions"><button type="button" className="button button--primary" onClick={() => void run()} disabled={running || !languages.length}>{running ? "Running…" : "▷ Run code"}</button><span>Code runs in a sandboxed service</span></div></article>
      <aside className="runner-side"><article className="card runner-input"><div className="runner-panel-head"><b>Custom input</b><span>Optional</span></div><textarea aria-label="Program input" value={stdin} onChange={(event) => setStdin(event.target.value)} placeholder="Input for your program" spellCheck="false" /></article><article className={result?.stderr || result?.compileOutput || result?.message ? "card runner-output runner-output--error" : "card runner-output"}><div className="runner-panel-head"><b>Output</b><span>{message}</span></div>{result ? <><pre>{result.stdout || "(no output)"}</pre>{(result.compileOutput || result.stderr || result.message) && <pre className="runner-error">{result.compileOutput || result.stderr || result.message}</pre>}{(result.time || result.memory !== null) && <small>{result.time ? `${result.time}s` : ""}{result.time && result.memory !== null ? " · " : ""}{result.memory !== null ? `${result.memory} KB` : ""}</small>}</> : <pre className="runner-empty">Your program output will appear here.</pre>}</article></aside>
    </div>
  </section>;
}

function ChallengesView({ onGainXp }: { onGainXp: (amount: number, title: string) => void }) {
  const [selected, setSelected] = useState("Two Sum");
  const [topicFilter, setTopicFilter] = useState("All topics");
  const [activeTab, setActiveTab] = useState<"solution" | "tests">("solution");
  const [message, setMessage] = useState("Your Quest Guide is here. Ask for a nudge when you need one.");
  const [hintQuestion, setHintQuestion] = useState("");
  const [code, setCode] = useState(challengeContent["Two Sum"].starterCode);
  const [runState, setRunState] = useState("Ready to run the sample test.");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<ChallengeTestResult[]>([]);
  const visibleChallenges = challenges.filter((challenge) => topicFilter === "All topics" || challenge.topic.startsWith(topicFilter));
  const selectedChallenge = challenges.find((challenge) => challenge.title === selected) ?? challenges[0];
  const details = challengeContent[selectedChallenge.title];
  const selectedTestCases = challengeTestCases[selectedChallenge.title];

  const chooseChallenge = (title: string) => {
    setSelected(title);
    setCode(challengeContent[title].starterCode);
    setRunState("Ready to run the sample test.");
    setTestResults([]);
    setActiveTab("solution");
  };

  const changeTopic = (topic: string) => {
    setTopicFilter(topic);
    const nextChallenge = challenges.find((challenge) => topic === "All topics" || challenge.topic.startsWith(topic));
    if (nextChallenge) chooseChallenge(nextChallenge.title);
  };

  const runChallenge = async (submit = false) => {
    let advancesToNextChallenge = false;
    setIsRunning(true);
    setRunState(submit ? "Running every test case…" : "Running your code…");
    try {
      const result = await runPythonInBrowser(submit ? buildChallengeTestHarness(code, selectedTestCases) : code);
      if (result.exitCode !== 0) throw new Error(result.stderr || "The code did not finish.");
      if (submit) {
        const results = readChallengeTestResults(result.stdout);
        if (!results) throw new Error("The test results could not be read. Please try again.");
        setTestResults(results);
        const passedCount = results.filter((test) => test.passed).length;
        if (passedCount !== results.length) {
          const failures = results.filter((test) => !test.passed)
            .map((test) => `${test.label}: expected ${test.expected}, got ${test.actual}`)
            .join(" | ");
          setRunState(`${passedCount}/${results.length} test cases passed. ${failures}`);
          return;
        }
        const currentIndex = visibleChallenges.findIndex((challenge) => challenge.title === selectedChallenge.title);
        const nextChallenge = visibleChallenges[currentIndex + 1];
        onGainXp(selectedChallenge.xp, selectedChallenge.title);
        if (nextChallenge) {
          advancesToNextChallenge = true;
          setRunState(`All ${results.length} test cases passed — moving to ${nextChallenge.title}…`);
          window.setTimeout(() => {
            chooseChallenge(nextChallenge.title);
            setIsRunning(false);
          }, 1_000);
          return;
        }
        setRunState(`All ${results.length} test cases passed — challenge set complete!`);
        return;
      }
      const output = result.stdout.trim();
      setTestResults([]);
      setRunState(`Program output: ${output || "(no output)"}`);
    } catch (error) {
      setRunState(error instanceof Error ? error.message : "Unable to run the sample test.");
    } finally {
      if (!advancesToNextChallenge) setIsRunning(false);
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
    <section className="challenge-problem-details card" aria-label="Challenge question details">
      <span className="eyebrow">QUESTION DETAILS</span>
      <h2>What you need to solve</h2>
      <p>{details.description}</p>
      <div className="challenge-problem-details__grid">
        <div><b>Required function</b><code>{details.starterCode.split("\n")[0]}</code></div>
        <div><b>Sample input</b><code>{details.testCase.split("\n")[0].replace("Input: ", "")}</code></div>
        <div><b>Required output</b><code>{details.expectedOutput}</code></div>
      </div>
      <small>Return the required value from the function. The automatic tests will call your function with more cases.</small>
    </section>
    <ChallengeTestSummary testCases={selectedTestCases} results={testResults} />
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
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [view, setView] = useState<View>(initialView);
  const [notice, setNotice] = useState("");
  const [xp, setXp] = useState(1560);
  const [account, setAccount] = useState<CodeQuestAccount | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [celebrations, setCelebrations] = useState(true);
  useEffect(() => {
    let active = true;
    if (window.sessionStorage.getItem("codequest-demo-session")) { setAuthChecked(true); return () => { active = false; }; }
    if (!hasSupabaseAuth) { router.replace("/login"); return () => { active = false; }; }
    void createClient().auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) setAuthChecked(true);
      else router.replace("/login");
    }).catch(() => { if (active) router.replace("/login"); });
    return () => { active = false; };
  }, [router]);
  const handleAccountChange = useCallback((nextAccount: CodeQuestAccount | null) => {
    setAccount(nextAccount);
  }, []);
  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3600); };
  const navigate = (nextView: View) => { setView(nextView); setPanel(null); };
  const openPractice = () => { navigate("practice"); showNotice("Today's quest is ready. Answer the first question to earn XP."); };
  const subtitle = useMemo(() => ({ dashboard: "YOUR PERSONAL LEARNING SPACE", learn: "LEARNING HUB", practice: "PRACTICE ARENA", challenges: "CHALLENGE ZONE", compiler: "CODE EXECUTION", leaderboard: "COMPETE & CELEBRATE" }[view]), [view]);
  const awardXp = (amount: number, message: string) => { setXp((current) => current + amount); if (celebrations) showNotice(message); };
  const goPractice = () => { setView("practice"); setNotice("Today’s quest is ready. Answer the first question to earn XP."); window.setTimeout(() => setNotice(""), 3600); };

  if (!authChecked) return <main className="app-shell bg-quest-bg" aria-label="Checking account access" />;
  return <main className="app-shell bg-quest-bg">
    <aside className="sidebar">
      <button className="brand" onClick={() => setView("dashboard")} aria-label="CodeQuest home"><span className="brand-mark">⌘</span><span>code<span>quest</span></span></button>
      <div className="sidebar-label">{subtitle}</div>
      <nav>{navItems.map((item) => <button key={item.id} onClick={() => setView(item.id)} className={view === item.id ? "nav-link nav-link--active" : "nav-link"}><span>{item.icon}</span>{item.label}{item.id === "practice" && <i>5</i>}</button>)}</nav>
      <div className="sidebar-bottom"><button type="button" className="nav-link" onClick={() => setPanel("help")}><span>?</span>Help center</button><button type="button" className="nav-link" onClick={() => setPanel("settings")}><span>⚙</span>Settings</button>{dailyReminders && <div className="sidebar-promo"><span>✦</span><b>Build your habit</b><p>Study 10 minutes today to protect your streak.</p><button type="button" onClick={openPractice}>Start a session →</button></div>}</div>
    </aside>
    <section className="main-area">
      <header className="topbar"><div className="mobile-brand"><span>⌘</span> codequest</div><div className="topbar-spacer" /><button className="top-stat top-stat--flame" onClick={goPractice}><span>♨</span><b>5</b></button><button className="top-stat top-stat--xp" onClick={() => setView("leaderboard")}><span>✦</span><b>{xp.toLocaleString()} XP</b></button><AccountAccess account={account} onAccountChange={handleAccountChange} onViewProfile={() => setView("leaderboard")} /></header>
      <div className="page-content">{view === "dashboard" && <HomeView onNavigate={navigate} xp={xp} onPractice={openPractice} onOpenQuest={() => setPanel("quest")} />}{view === "learn" && <LearnView initialStage={initialLearnStage} initialTopicId={initialTopicId} />}{view === "practice" && <PracticeView onComplete={() => awardXp(40, "Quest complete! +40 XP added to your quest.")} />}{view === "challenges" && <ChallengesView onGainXp={(amount, title) => awardXp(amount, `${title} submitted! +${amount} XP added to your quest.`)} />}{view === "compiler" && <CodeRunnerView />}{view === "leaderboard" && <LeaderboardView onFindChallenge={() => navigate("challenges")} />}</div>
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
