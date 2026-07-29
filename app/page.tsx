"use client";

import { useMemo, useState } from "react";

type View = "dashboard" | "learn" | "practice" | "challenges" | "leaderboard";

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

function HomeView({ onNavigate, xp, onPractice }: { onNavigate: (view: View) => void; xp: number; onPractice: () => void }) {
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
          <div className="level-card__title"><span>YOUR QUEST</span><button aria-label="More quest options">•••</button></div>
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
            <div className="language-card__top"><div className="language-mark" style={{ color: language.color }}>{language.icon}</div><button aria-label={`Open ${language.name}`}>···</button></div>
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

function LearnView() {
  const topics = ["Getting started", "Variables & data types", "Control flow", "Functions & scope", "Lists & dictionaries", "Object-oriented Python"];
  return <section className="workspace-view">
    <div className="view-hero"><div><span className="eyebrow">PYTHON PATH · 34% COMPLETE</span><h1>Learn by building.</h1><p>Clear explanations, runnable examples, and quick checks—one useful concept at a time.</p></div><div className="path-orbit"><span>⌘</span><i>03</i></div></div>
    <div className="learn-layout">
      <div className="topic-list card"><div className="topic-list__head"><b>Python foundations</b><span>8 / 24</span></div>{topics.map((topic, index) => <button key={topic} className={index === 3 ? "topic topic--active" : "topic"}><i>{index < 3 ? "✓" : `${index + 1}`}</i><span>{topic}</span>{index === 3 && <em>Resume</em>}</button>)}</div>
      <article className="lesson-panel card"><span className="eyebrow">MODULE 3 · LESSON 4</span><h2>Functions &amp; scope</h2><p className="lesson-lede">Functions let you turn a repeatable piece of work into a named tool. Scope decides which values that tool can see.</p><div className="snippet"><div><span>1</span><code><b>def</b> greet(name):</code></div><div><span>2</span><code>&nbsp;&nbsp;<b>return</b> <mark>f</mark>&quot;Hello, {"{name}"}!&quot;</code></div><div><span>3</span><code>&nbsp;</code></div><div><span>4</span><code>message = greet(<mark>&quot;Alex&quot;</mark>)</code></div></div><div className="lesson-tip"><span>✦</span><p><b>Think of scope as a room.</b> A variable created inside a function stays in that function&apos;s room unless you return it.</p></div><div className="lesson-controls"><button className="button button--ghost">← Previous</button><button className="button button--primary">Continue lesson →</button></div></article>
    </div>
  </section>;
}

function PracticeView({ onComplete }: { onComplete: () => void }) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  return <section className="workspace-view practice-view">
    <div className="view-hero"><div><span className="eyebrow">TODAY&apos;S QUEST · 5 MINUTES</span><h1>Warm up your Python brain.</h1><p>Answer five short prompts. Incorrect answers cost a heart, but you can always try again.</p></div><div className="hearts"><span>♥</span><span>♥</span><span>♥</span><span>♥</span><span>♥</span></div></div>
    <div className="practice-grid"><article className="question-card card"><div className="question-card__top"><span>QUESTION 1 OF 5</span><span>+8 XP</span></div><div className="question-orb">01</div><h2>What does this expression return?</h2><div className="inline-code"><code>len([1, 2, 3])</code></div><div className="answer-row"><input aria-label="Your answer" value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false); }} placeholder="Type your answer" /><button className="button button--primary" onClick={() => { setChecked(true); if (answer.trim() === "3") onComplete(); }}>Check answer</button></div>{checked && <p className={answer.trim() === "3" ? "answer-feedback answer-feedback--good" : "answer-feedback"}>{answer.trim() === "3" ? "Exactly. len() counts the items in a collection. +8 XP added!" : "Not quite. Count the items in the square brackets, then try again."}</p>}</article><aside className="practice-side card"><span className="eyebrow">QUEST PROGRESS</span><div className="quest-numbers"><b>0</b><span>/ 5 complete</span></div><div className="quest-dots"><i className="active" /><i /><i /><i /><i /></div><hr /><span className="eyebrow">UP NEXT</span><p>Spot the bug in a short function.</p><div className="tip-small"><span>✦</span><p>Need a nudge? Your tutor is ready with hints—not answers.</p></div></aside></div>
  </section>;
}

function ChallengesView({ onGainXp }: { onGainXp: () => void }) {
  const [selected, setSelected] = useState("Two Sum");
  const [message, setMessage] = useState("Your AI tutor is here. Ask for a nudge when you need one.");
  return <section className="workspace-view challenge-view">
    <div className="challenge-heading"><div><span className="eyebrow">CHALLENGE ZONE</span><h1>Turn knowledge into instinct.</h1></div><div className="challenge-filters"><button>All topics⌄</button><button>Python⌄</button></div></div>
    <div className="challenge-layout"><aside className="problem-list card"><div className="problem-list__head"><b>Problems</b><span>42 available</span></div>{challenges.map((challenge) => <button key={challenge.title} onClick={() => setSelected(challenge.title)} className={selected === challenge.title ? "problem problem--selected" : "problem"}><span className={challenge.solved ? "solve-dot solve-dot--done" : "solve-dot"}>{challenge.solved ? "✓" : ""}</span><div><b>{challenge.title}</b><small>{challenge.topic}</small></div><em className={`difficulty difficulty--${challenge.difficulty.toLowerCase()}`}>{challenge.difficulty}</em></button>)}</aside>
      <article className="editor-card card"><div className="editor-top"><div><span className="eyebrow">EASY · ARRAYS</span><h2>{selected}</h2></div><span className="editor-lang">Python ⌄</span></div><p>Given an array of integers and a target, return the indices of the two numbers that add up to the target.</p><div className="tabs"><span className="tab--active">Solution.py</span><span>Test cases</span></div><div className="editor"><div className="line-numbers">1<br />2<br />3<br />4<br />5<br />6</div><pre><span className="purple">def</span> two_sum(nums, target):{`\n`}  <span className="muted"># Write your solution here</span>{`\n`}  <span className="purple">for</span> i <span className="purple">in</span> range(len(nums)):{`\n`}    <span className="purple">for</span> j <span className="purple">in</span> range(i + 1, len(nums)):{`\n`}      <span className="purple">if</span> nums[i] + nums[j] == target:{`\n`}        <span className="purple">return</span> [i, j]</pre></div><div className="editor-actions"><button className="button button--ghost" onClick={() => setMessage("Sample tests passed: [2, 7, 11, 15], target 9 → [0, 1]. Nice structure—now consider its time complexity.")}>▷ Run code</button><button className="button button--primary" onClick={onGainXp}>Submit solution</button></div></article>
      <aside className="hint-panel card"><div className="hint-head"><span className="spark-icon">✦</span><div><b>Quest Guide</b><small>Hint-focused tutor</small></div><i>●</i></div><div className="chat-bubble">{message}</div><div className="hint-steps"><span>1</span><p><b>Try this first</b><br />What value would you need to remember while scanning the list just once?</p></div><div className="hint-input"><input aria-label="Ask your tutor for help" placeholder="Ask for a hint…" /><button aria-label="Send hint request" onClick={() => setMessage("Hint: Instead of testing every pair, keep track of values you have already seen. What value would complete the target?")}>↑</button></div></aside>
    </div>
  </section>;
}

function LeaderboardView() {
  const people = [["Maya Chen", "2,480", "MC", "violet"], ["Lucas Hart", "2,260", "LH", "blue"], ["Alex Morgan", "1,560", "AM", "gold"], ["Nora Ali", "1,420", "NA", "pink"], ["Samir Rao", "1,120", "SR", "green"]];
  return <section className="workspace-view leaderboard-view"><div className="view-hero"><div><span className="eyebrow">WEEKLY LEADERBOARD</span><h1>Keep climbing.</h1><p>You&apos;re in the top 18% of learners this week. A single challenge could move you up.</p></div><div className="rank-medal">#3</div></div><div className="leaderboard-grid"><article className="leaderboard-card card"><div className="leaderboard-card__top"><div><h2>Python pathfinders</h2><p>July 15 – July 21</p></div><button className="button button--ghost">This week⌄</button></div>{people.map(([name, score, initials, color], index) => <div className={name === "Alex Morgan" ? "leader-row leader-row--you" : "leader-row"} key={name}><span className="rank">{index + 1}</span><span className={`avatar avatar--${color}`}>{initials}</span><b>{name}{name === "Alex Morgan" && <small> You</small>}</b><span className="leader-xp">✦ {score} XP</span></div>)}</article><aside className="card leaderboard-side"><span className="eyebrow">YOUR WEEK</span><div className="week-score"><b>1,560</b><span>XP earned</span></div><div className="bar-chart">{[25, 58, 35, 72, 49, 88, 42].map((height, index) => <div key={height + index}><i style={{ height: `${height}%` }} /><span>{["M", "T", "W", "T", "F", "S", "S"][index]}</span></div>)}</div><hr /><p><b>440 XP</b> will put you in first place.</p><button className="button button--primary">Find a challenge →</button></aside></div></section>;
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [notice, setNotice] = useState("");
  const [xp, setXp] = useState(1560);
  const [profileOpen, setProfileOpen] = useState(false);
  const subtitle = useMemo(() => ({ dashboard: "YOUR PERSONAL LEARNING SPACE", learn: "LEARNING HUB", practice: "PRACTICE ARENA", challenges: "CHALLENGE ZONE", leaderboard: "COMPETE & CELEBRATE" }[view]), [view]);
  const awardXp = (amount: number, message: string) => { setXp((current) => current + amount); setNotice(message); window.setTimeout(() => setNotice(""), 3600); };
  const goPractice = () => { setView("practice"); setNotice("Today’s quest is ready. Answer the first question to earn XP."); window.setTimeout(() => setNotice(""), 3600); };

  return <main className="app-shell bg-quest-bg">
    <aside className="sidebar">
      <button className="brand" onClick={() => setView("dashboard")} aria-label="CodeQuest home"><span className="brand-mark">⌘</span><span>code<span>quest</span></span></button>
      <div className="sidebar-label">{subtitle}</div>
      <nav>{navItems.map((item) => <button key={item.id} onClick={() => setView(item.id)} className={view === item.id ? "nav-link nav-link--active" : "nav-link"}><span>{item.icon}</span>{item.label}{item.id === "practice" && <i>5</i>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-link"><span>?</span>Help center</button><button className="nav-link"><span>⚙</span>Settings</button><div className="sidebar-promo"><span>✦</span><b>Build your habit</b><p>Study 10 minutes today to protect your streak.</p><button onClick={goPractice}>Start a session →</button></div></div>
    </aside>
    <section className="main-area">
      <header className="topbar"><div className="mobile-brand"><span>⌘</span> codequest</div><div className="topbar-spacer" /><button className="top-stat top-stat--flame" onClick={goPractice}><span>♨</span><b>5</b></button><button className="top-stat top-stat--xp" onClick={() => setView("leaderboard")}><span>✦</span><b>{xp.toLocaleString()} XP</b></button><div className="profile-wrap"><button className="profile-button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}><span className="avatar avatar--gold">AM</span><span className="profile-name">Alex Morgan</span><i>⌄</i></button>{profileOpen && <div className="profile-menu"><b>Alex Morgan</b><span>Level 11 · Code Pathfinder</span><button onClick={() => { setView("leaderboard"); setProfileOpen(false); }}>View profile</button></div>}</div></header>
      <div className="page-content">{view === "dashboard" && <HomeView onNavigate={setView} xp={xp} onPractice={goPractice} />}{view === "learn" && <LearnView />}{view === "practice" && <PracticeView onComplete={() => awardXp(8, "Correct! +8 XP added to your quest.")} />}{view === "challenges" && <ChallengesView onGainXp={() => awardXp(50, "Solution submitted! Your first test run is queued. +50 XP awarded.")} />}{view === "leaderboard" && <LeaderboardView />}</div>
    </section>
    <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-2xl border border-white/10 bg-quest-surface/95 p-1 shadow-2xl shadow-black/40 backdrop-blur min-[831px]:hidden">
      {navItems.map((item) => <button key={item.id} onClick={() => setView(item.id)} aria-current={view === item.id ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition ${view === item.id ? "bg-quest-purple/20 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><span className="text-base leading-none">{item.icon}</span><span className="truncate">{item.label}</span></button>)}
    </nav>
    {notice && <div className="toast"><span>✦</span>{notice}</div>}
  </main>;
}
