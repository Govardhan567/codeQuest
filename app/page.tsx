"use client";

import { MouseEvent, useState } from "react";

export default function CodexLaunch() {
  const [action, setAction] = useState<"" | "login" | "register">("");
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const begin = (kind: "login" | "register", event: MouseEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setRipple({ x: event.clientX - box.left, y: event.clientY - box.top });
    setAction(kind);
    window.setTimeout(() => setAction(""), 1250);
  };
  return <main className={`launch ${action ? `is-${action}` : ""}`}>
    <div className="stars" aria-hidden="true" />
    <div className="ambient" aria-hidden="true" />
    <section className="hero" aria-labelledby="launch-title">
      <p className="overline">THE AGENTIC CODING WORKSPACE</p>
      <h1 id="launch-title">Build the<br /><em>impossible.</em></h1>
      <p className="lede">A new kind of coding environment, where your ideas<br className="desktop" /> move at the speed of thought.</p>
      <div className="actions">
        <button className="register" onClick={(event) => begin("register", event)}>Register <span>↗</span>{action === "register" && ripple && <i className="ripple" style={{ left: ripple.x, top: ripple.y }} />}</button>
        <button className="login" onClick={(event) => begin("login", event)}>Login <span>⟶</span>{action === "login" && ripple && <i className="ripple" style={{ left: ripple.x, top: ripple.y }} />}</button>
      </div>
      <p className="fine">No credit card required <b>·</b> Your first build starts free</p>
    </section>
    <div className="object-space" aria-hidden="true">
      <div className="ai-chip">AI</div>
      <div className="idea-card"><b>✦</b><strong>What will you<br />make today?</strong><span>↗</span></div>
      <div className="orbit" />
      <div className="editor">
        <header><span><i /><i /><i /></span><b>dream.ts</b><em>⌘K</em></header>
        <pre><small>1</small><code><b>import</b> &#123; imagination &#125; <b>from</b> <i>&apos;codex&apos;</i>;</code><small>2</small><code /> <small>3</small><code><b>const</b> future = <b>await</b> imagination.</code><small>4</small><code>  <strong>create</strong>(&#123;</code><small>5</small><code>    with: <i>&apos;a little wonder&apos;</i>,</code><small>6</small><code>    limit: <em>Infinity</em></code><small>7</small><code>  &#125;);<mark /></code></pre>
      </div>
    </div>
    <p className="sr" aria-live="polite">{action ? `${action === "login" ? "Login" : "Registration"} experience starting` : ""}</p>
  </main>;
}
