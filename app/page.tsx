"use client";

import { FormEvent, MouseEvent, useState } from "react";
import { createClient, hasSupabaseAuth } from "@/lib/client";

type AuthMode = "" | "login" | "register";

export default function CodexLaunch() {
  const [action, setAction] = useState<AuthMode>("");
  const [form, setForm] = useState<AuthMode>("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const begin = (kind: Exclude<AuthMode, "">, event: MouseEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setRipple({ x: event.clientX - box.left, y: event.clientY - box.top });
    setAction(kind);
    window.setTimeout(() => { setAction(""); setForm(kind); }, 620);
  };
  const close = () => { setForm(""); setStatus(""); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasSupabaseAuth) { setStatus("Authentication is not configured for this workspace yet."); return; }
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "").trim();
    const password = String(values.get("password") ?? "");
    const name = String(values.get("name") ?? "").trim();
    setIsSubmitting(true); setStatus(form === "login" ? "Signing you in..." : "Creating your workspace...");
    try {
      const supabase = createClient();
      if (form === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setStatus("Signed in successfully. Opening your workspace...");
        window.setTimeout(() => window.location.assign("/learn"), 550);
      } else {
        if (!name) throw new Error("Please enter your name.");
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/` } });
        if (error) throw error;
        setStatus(data.session ? "Account created. Opening your workspace..." : "Account created. Check your email to confirm it, then sign in.");
        if (data.session) window.setTimeout(() => window.location.assign("/learn"), 550);
      }
    } catch (error) { setStatus(error instanceof Error ? error.message : "We could not complete that request. Please try again."); }
    finally { setIsSubmitting(false); }
  };
  return <main className={`launch ${action ? `is-${action}` : ""}`}>
    <div className="stars" aria-hidden="true" /><div className="ambient" aria-hidden="true" />
    <section className="hero" aria-labelledby="launch-title"><p className="overline">THE AGENTIC CODING WORKSPACE</p><h1 id="launch-title">Build the<br /><em>impossible.</em></h1><p className="lede">A new kind of coding environment, where your ideas<br className="desktop" /> move at the speed of thought.</p><div className="actions"><button className="register" onClick={(event) => begin("register", event)}>Register <span>up</span>{action === "register" && ripple && <i className="ripple" style={{ left: ripple.x, top: ripple.y }} />}</button><button className="login" onClick={(event) => begin("login", event)}>Login <span>right</span>{action === "login" && ripple && <i className="ripple" style={{ left: ripple.x, top: ripple.y }} />}</button></div><p className="fine">No credit card required <b>·</b> Your first build starts free</p></section>
    <div className="object-space" aria-hidden="true"><div className="ai-chip">AI</div><div className="idea-card"><b>*</b><strong>What will you<br />make today?</strong><span>up</span></div><div className="orbit" /><div className="editor"><header><span><i /><i /><i /></span><b>dream.ts</b><em>cmd K</em></header><pre><small>1</small><code><b>import</b> &#123; imagination &#125; <b>from</b> <i>&apos;codex&apos;</i>;</code><small>2</small><code /> <small>3</small><code><b>const</b> future = <b>await</b> imagination.</code><small>4</small><code>  <strong>create</strong>(&#123;</code><small>5</small><code>    with: <i>&apos;a little wonder&apos;</i>,</code><small>6</small><code>    limit: <em>Infinity</em></code><small>7</small><code>  &#125;);<mark /></code></pre></div></div>
    {form && <div className="auth-backdrop" role="presentation" onMouseDown={close}><section className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.stopPropagation()}><button className="close" type="button" aria-label="Close authentication form" onClick={close}>x</button><p className="overline">CODEX ACCESS</p><h2 id="auth-title">{form === "login" ? "Welcome back." : "Start building."}</h2><p className="auth-copy">{form === "login" ? "Sign in to return to your agentic workspace." : "Create your free CODEX workspace in moments."}</p><form onSubmit={(event) => void submit(event)} className="auth-form">{form === "register" && <label>Name<input required name="name" placeholder="Your name" autoComplete="name" /></label>}<label>Email<input required type="email" name="email" placeholder="you@example.com" autoComplete="email" /></label><label>Password<input required minLength={8} type="password" name="password" placeholder="********" autoComplete={form === "login" ? "current-password" : "new-password"} /></label>{status && <p className="auth-status" role="status">{status}</p>}<button type="submit" className="auth-submit" disabled={isSubmitting}>{isSubmitting ? "Please wait..." : form === "login" ? "Login" : "Create account"} <span>right</span></button></form><p className="switch">{form === "login" ? "New to CODEX?" : "Already building with CODEX?"} <button type="button" onClick={() => { setForm(form === "login" ? "register" : "login"); setStatus(""); }}>{form === "login" ? "Register" : "Login"}</button></p></section></div>}
  </main>;
}
