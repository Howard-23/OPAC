import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { api } from "../lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    totalBooks: 0,
    activeRentals: 0,
    overdueBooks: 0,
    availableBooks: 0,
    digitalBooks: 0
  });
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then(setSummary)
      .catch((loadError) => setError(loadError.message));
  }, []);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brass-200/70">Dashboard</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white">Library activity at a glance</h2>
        </div>
        {error ? <p className="text-sm text-clay-300">{error}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Books" value={summary.totalBooks} accent="bg-brass-500/80" />
        <StatCard label="Active Rentals" value={summary.activeRentals} accent="bg-moss-500/80" />
        <StatCard label="Overdue Books" value={summary.overdueBooks} accent="bg-clay-500/80" />
        <StatCard label="Available Books" value={summary.availableBooks} accent="bg-white/25" />
        <StatCard label="Digital Titles" value={summary.digitalBooks} accent="bg-sky-400/70" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-brass-200/70">Workflow Notes</p>
          <div className="mt-5 space-y-4 text-sm text-white/70">
            <p>Use the Books view to scan or paste ISBNs, pull metadata from Google Books, and create catalog entries faster.</p>
            <p>Use the Circulation view to check out physical books and complete returns without leaving the screen.</p>
            <p>Digital titles stay available through the catalog and expose a direct Read Online action when an access URL is present.</p>
            <p>Overdue counts are computed from rental due dates and updated as circulation records are loaded.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-brass-200/70">Seeded Access</p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/75">
            <p>Username: <span className="font-semibold text-white">admin</span></p>
            <p className="mt-2">Password: <span className="font-semibold text-white">admin123</span></p>
          </div>
        </section>
      </div>
    </div>
  );
}
