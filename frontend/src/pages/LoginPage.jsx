import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(username, password);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-ink-900/70 shadow-panel lg:grid-cols-[1.2fr_0.8fr]">
        <section className="relative overflow-hidden px-8 py-10 md:px-12 md:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,155,60,0.2),transparent_40%),linear-gradient(135deg,transparent,rgba(58,108,86,0.22))]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.35em] text-brass-200/70">Library Information System</p>
            <h1 className="mt-5 max-w-lg font-display text-4xl font-semibold leading-tight text-white md:text-5xl">
              Rebuilt for modern catalog and circulation workflows.
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/70">
              Manage books, authors, check-outs, returns, and overdue inventory from a responsive librarian dashboard.
            </p>
          </div>
        </section>

        <section className="bg-black/20 px-8 py-10 md:px-10 md:py-14">
          <p className="text-xs uppercase tracking-[0.25em] text-brass-200/80">Librarian Sign-In</p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="label">Username</label>
              <input
                className="field"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="field"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {error ? <p className="text-sm text-clay-300">{error}</p> : null}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Enter Workspace"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

