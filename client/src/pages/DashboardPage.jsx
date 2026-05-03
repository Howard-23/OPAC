import { useEffect, useState } from "react";

import { getBooks } from "../api/booksApi";
import { getRentals, getRentalSummary } from "../api/rentalsApi";
import Panel from "../components/ui/Panel";

function DashboardPage() {
  const [stats, setStats] = useState({
    books: 0,
    authors: 0,
    activeRentals: 0,
    overdueRentals: 0,
    digitalBooks: 0
  });

  useEffect(() => {
    async function loadDashboard() {
      const [books, rentals, summary] = await Promise.all([
        getBooks({ all: true }),
        getRentals({ page: 1, pageSize: 5 }),
        getRentalSummary()
      ]);

      const linkedAuthors = new Set(
        books.data.map((book) => book.author_id).filter(Boolean)
      ).size;
      const digitalBooks = books.data.filter((book) => book.format === "digital").length;

      setStats({
        books: books.data.length,
        authors: linkedAuthors,
        activeRentals: summary.activeCount,
        overdueRentals: summary.overdueCount,
        digitalBooks,
        recentRentals: rentals.data
      });
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Books", stats.books, "Cataloged items across the collection"],
          ["Authors", stats.authors, "Authors linked to cataloged books"],
          ["Active Rentals", stats.activeRentals, "Currently checked-out items"],
          ["Overdue", stats.overdueRentals, "Loans past their due date"],
          ["Digital Titles", stats.digitalBooks, "Online-access resources"]
        ].map(([label, value, note]) => (
          <Panel key={label} className="p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{label}</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{value}</p>
            <p className="mt-3 text-sm text-slate-600">{note}</p>
          </Panel>
        ))}
      </div>

      <Panel className="p-6">
        <p className="section-title">Operational Notes</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl bg-parchment px-5 py-5">
            <p className="text-sm font-semibold text-ink">Cataloging Workflow</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Scan an ISBN into the book form, trigger Google Books lookup, then finalize call
              number and circulation status.
            </p>
          </div>
          <div className="rounded-3xl bg-teal-50 px-5 py-5">
            <p className="text-sm font-semibold text-ink">Circulation Workflow</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Rentals automatically flip physical items to borrowed and return actions restore the
              book to available.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-100 px-5 py-5">
            <p className="text-sm font-semibold text-ink">Digital Access</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              When a title is marked digital and has an access URL, the catalog surfaces a Read
              Online action directly in the listing.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default DashboardPage;
