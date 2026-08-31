"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { SCRAMBLE_THEME } from "@/lib/scramble-theme";
import { isAdminEmail } from "@/lib/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAdminEmail(email)) {
      setError("This login is for the Scramble team only.");
      return;
    }

    setLoading(true);
    const { error: authError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="sc-root">
      <style>{SCRAMBLE_THEME}</style>
      <style>{`
        .al-wrap { max-width: 440px; margin: 0 auto; padding: 170px 28px 80px; }
        .al-card { padding: 40px; }
        .al-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 999px; margin-bottom: 20px;
          background: rgba(74, 158, 255, 0.1); color: #2d7fe0;
          font-size: 13px; font-weight: 700;
        }
        .al-title { font-size: 30px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; }
        .al-sub { font-size: 15px; color: #5a6b82; margin-bottom: 32px; }
        .al-form { display: flex; flex-direction: column; gap: 20px; }
      `}</style>

      <nav className="sc-nav">
        <div className="sc-nav-inner">
          <Link href="/landing" className="sc-logo">
            <div className="sc-logo-mark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4.5 12.5H11L9 22L18.5 10.5H12L13 2Z" fill="white" />
              </svg>
            </div>
            <span className="sc-logo-text">Scramble</span>
          </Link>
        </div>
      </nav>

      <div className="al-wrap">
        <div className="sc-card al-card">
          <div className="al-badge">🔒 Team Access</div>
          <h1 className="al-title">Scramble Admin</h1>
          <p className="al-sub">Sign in to manage clients and operations.</p>

          <form onSubmit={handleLogin} className="al-form">
            <div>
              <label className="sc-label">Team email</label>
              <input
                className="sc-input"
                type="email"
                placeholder="helloscrambleteam@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="sc-label">Password</label>
              <input
                className="sc-input"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="sc-error">{error}</div>}

            <button type="submit" className="sc-btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
