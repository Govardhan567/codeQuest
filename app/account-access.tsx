"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient, hasSupabaseAuth } from "@/lib/client";

export type CodeQuestAccount = {
  displayName: string;
  email: string;
  kind: "member" | "demo";
};

type AccountAccessProps = {
  account: CodeQuestAccount | null;
  onAccountChange: (account: CodeQuestAccount | null) => void;
  onViewProfile: () => void;
};

const DEMO_SESSION_KEY = "codequest-demo-session";
const demoAccount: CodeQuestAccount = {
  displayName: "Demo Learner",
  email: "demo@codequest.local",
  kind: "demo",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CQ";
}

function messageFrom(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Email confirmation took too long. Check your SMTP settings, then try again.";
  }
  if (message.toLowerCase().includes("abort") || message.toLowerCase().includes("failed to fetch")) {
    return "Email confirmation could not be sent. Check your SMTP settings, then try again.";
  }
  if (message === "{}") {
    return "Email confirmation could not be sent. Verify your Resend sender domain and SMTP details, then try again.";
  }
  return message || "Something went wrong. Please try again.";
}

export function AccountAccess({ account, onAccountChange, onViewProfile }: AccountAccessProps) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedDemo = window.sessionStorage.getItem(DEMO_SESSION_KEY);
    if (storedDemo) onAccountChange(demoAccount);
    if (!hasSupabaseAuth) return;

    const supabase = createClient();
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active || !data.user) return;
      window.sessionStorage.removeItem(DEMO_SESSION_KEY);
      onAccountChange({
        displayName: data.user.user_metadata.full_name || data.user.email || "CodeQuest learner",
        email: data.user.email || "",
        kind: "member",
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active || !session?.user) return;
      window.sessionStorage.removeItem(DEMO_SESSION_KEY);
      onAccountChange({
        displayName: session.user.user_metadata.full_name || session.user.email || "CodeQuest learner",
        email: session.user.email || "",
        kind: "member",
      });
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [onAccountChange]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const openAccess = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setMessage("");
    setOpen(true);
  };

  const useDemoAccess = () => {
    window.sessionStorage.setItem(DEMO_SESSION_KEY, "true");
    onAccountChange(demoAccount);
    setMessage("");
    setOpen(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    if (!hasSupabaseAuth) {
      setMessage("Email access is not configured yet. You can still use Demo access.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage("Registration complete. Check your email to confirm your account, then sign in.");
          return;
        }
        onAccountChange({ displayName: name.trim(), email, kind: "member" });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const user = data.user;
        onAccountChange({
          displayName: user.user_metadata.full_name || user.email || "CodeQuest learner",
          email: user.email || email,
          kind: "member",
        });
      }
      setPassword("");
      setOpen(false);
    } catch (error) {
      setMessage(messageFrom(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const signOut = async () => {
    setProfileOpen(false);
    if (account?.kind === "demo") {
      window.sessionStorage.removeItem(DEMO_SESSION_KEY);
      onAccountChange(null);
      return;
    }
    try {
      if (hasSupabaseAuth) await createClient().auth.signOut();
    } finally {
      onAccountChange(null);
    }
  };

  if (account) {
    return <div className="profile-wrap"><button type="button" className="profile-button" onClick={() => setProfileOpen((current) => !current)} aria-expanded={profileOpen}><span className="avatar avatar--gold">{initials(account.displayName)}</span><span className="profile-name">{account.displayName}</span><i>⌄</i></button>{profileOpen && <div className="profile-menu"><b>{account.displayName}</b><span>{account.kind === "demo" ? "Demo access · progress resets on sign out" : account.email}</span><button type="button" onClick={() => { onViewProfile(); setProfileOpen(false); }}>View profile</button><button type="button" className="profile-menu__signout" onClick={() => void signOut()}>Sign out</button></div>}</div>;
  }

  return <><button type="button" className="auth-launch" onClick={() => openAccess("login")}>Log in</button><div className="auth-register-wrap"><button type="button" className="auth-register" onClick={() => openAccess("register")}>Register</button></div>{open && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setOpen(false)}><section className="dialog-card auth-dialog" role="dialog" aria-modal="true" aria-label="Account access" onMouseDown={(event) => event.stopPropagation()}><div className="dialog-head"><div><span className="eyebrow">CODEQUEST ACCOUNT</span><h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2></div><button type="button" className="dialog-close" onClick={() => setOpen(false)} aria-label="Close account access">×</button></div><p className="dialog-copy">{mode === "login" ? "Sign in to keep learning across devices." : "Create an account to save your learning journey."}</p><div className="auth-tabs" role="tablist" aria-label="Account access options"><button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "auth-tab--active" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Log in</button><button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "auth-tab--active" : ""} onClick={() => { setMode("register"); setMessage(""); }}>Register</button></div><form className="auth-form" onSubmit={(event) => void submit(event)}>{mode === "register" && <label>Your name<input type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>}<label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label>Password<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>{message && <p className="auth-message" role="status">{message}</p>}<button className="button button--primary auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button></form><div className="auth-divider"><span>or</span></div><button type="button" className="auth-demo" onClick={useDemoAccess}><span>✦</span><div><b>Try Demo access</b><small>Explore CodeQuest instantly — no account needed.</small></div><i>→</i></button><a className="auth-chatgpt" href="/signin-with-chatgpt?return_to=%2F">Continue with ChatGPT</a></section></div>}</>;
}
