import { useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function LoginPage() {
  const { login, user } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel overflow-hidden p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-brass">Modernized Stack</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-ink">
            Rebuilt library operations for cataloging, lending, and digital access.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">
            This PERN-based interface centralizes catalog records, author management, circulation,
            and digital resource links in one responsive workspace.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-parchment px-5 py-4">
              <p className="text-sm font-semibold text-ink">Google Books Lookup</p>
              <p className="mt-2 text-sm text-slate-600">Auto-fill titles and publishers from ISBN scans.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-5 py-4">
              <p className="text-sm font-semibold text-ink">Digital Library</p>
              <p className="mt-2 text-sm text-slate-600">Expose online reading links beside physical holdings.</p>
            </div>
            <div className="rounded-3xl bg-teal-50 px-5 py-4">
              <p className="text-sm font-semibold text-ink">Barcode Ready</p>
              <p className="mt-2 text-sm text-slate-600">Scanner-friendly inputs stay focused for quick circulation.</p>
            </div>
          </div>
        </section>

        <section className="panel p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal">Librarian Login</p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
              <input
                autoFocus
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Enter password"
              />
            </div>
            {error ? <p className="text-sm text-rosewood">{error}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-600">
            Seeded demo account: <span className="font-semibold text-ink">librarian</span> /
            <span className="font-semibold text-ink"> LibraryAdmin123!</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
