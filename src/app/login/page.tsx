"use client";

import { useState, FormEvent } from "react";

export default function LoginPage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerVerifyEmail, setRegisterVerifyEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerVerifyPassword, setRegisterVerifyPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    // TODO: implement login
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    // TODO: implement registration
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-12 px-4 py-8 font-mono">
      {/* Register */}
      <div className="flex-1">
        <h2 className="text-lg text-primary mb-4">register</h2>
        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="username"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-secondary rounded text-text outline-none focus:border-primary transition-colors placeholder:text-secondary text-sm"
            autoComplete="new-username"
          />
          <input
            type="email"
            placeholder="email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-secondary rounded text-text outline-none focus:border-primary transition-colors placeholder:text-secondary text-sm"
            autoComplete="new-email"
          />
          <input
            type="email"
            placeholder="verify email"
            value={registerVerifyEmail}
            onChange={(e) => setRegisterVerifyEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-secondary rounded text-text outline-none focus:border-primary transition-colors placeholder:text-secondary text-sm"
            autoComplete="verify-email"
          />
          <input
            type="password"
            placeholder="password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-secondary rounded text-text outline-none focus:border-primary transition-colors placeholder:text-secondary text-sm"
            autoComplete="new-password"
          />
          <input
            type="password"
            placeholder="verify password"
            value={registerVerifyPassword}
            onChange={(e) => setRegisterVerifyPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-secondary rounded text-text outline-none focus:border-primary transition-colors placeholder:text-secondary text-sm"
            autoComplete="verify-password"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded bg-primary text-background text-sm hover:opacity-90 transition-opacity"
          >
            sign up
          </button>
        </form>
      </div>

      {/* Login */}
      <div className="flex-1">
        <h2 className="text-lg text-primary mb-4">login</h2>
        <div className="flex gap-3 mb-4">
          <button className="flex-1 px-4 py-2.5 rounded border border-secondary text-secondary hover:text-text hover:border-[var(--text)] transition-colors text-sm">
            Google
          </button>
          <button className="flex-1 px-4 py-2.5 rounded border border-secondary text-secondary hover:text-text hover:border-[var(--text)] transition-colors text-sm">
            GitHub
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-secondary opacity-30" />
          <span className="text-xs text-secondary">or</span>
          <div className="flex-1 h-px bg-secondary opacity-30" />
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-secondary rounded text-text outline-none focus:border-primary transition-colors placeholder:text-secondary text-sm"
            autoComplete="current-email"
          />
          <input
            type="password"
            placeholder="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-secondary rounded text-text outline-none focus:border-primary transition-colors placeholder:text-secondary text-sm"
            autoComplete="current-password"
          />
          <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-primary"
            />
            remember me
          </label>
          <button
            type="submit"
            className="px-4 py-2.5 rounded bg-primary text-background text-sm hover:opacity-90 transition-opacity"
          >
            sign in
          </button>
        </form>
        <button className="mt-3 text-xs text-secondary hover:text-text transition-colors">
          forgot password?
        </button>
      </div>
    </div>
  );
}
