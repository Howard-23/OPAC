import { useEffect, useMemo, useState } from "react";
import BarcodeInput from "../components/BarcodeInput";
import { api } from "../lib/api";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function plusDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function labelize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const emptyForm = {
  bookId: "",
  patronName: "",
  checkoutDate: today(),
  dueDate: plusDays(14)
};

export default function RentalsPage() {
  const [books, setBooks] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [bookQuery, setBookQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const availableBooks = useMemo(
    () => books.filter((book) => book.status === "available" && book.format === "physical"),
    [books]
  );

  const digitalBooks = useMemo(
    () => books.filter((book) => book.format === "digital"),
    [books]
  );

  async function loadData() {
    const [booksData, rentalsData] = await Promise.all([api.get("/books"), api.get("/rentals")]);
    setBooks(booksData);
    setRentals(rentalsData);

    if (!form.bookId && booksData.find((book) => book.status === "available" && book.format === "physical")) {
      setForm((current) => ({
        ...current,
        bookId: booksData.find((book) => book.status === "available" && book.format === "physical")?.id || ""
      }));
    }
  }

  useEffect(() => {
    loadData().catch((loadError) => setError(loadError.message));
  }, []);

  async function handleCheckout(event) {
    event.preventDefault();
    setError("");

    try {
      await api.post("/rentals", form);
      setForm({
        ...emptyForm,
        bookId: ""
      });
      setBookQuery("");
      await loadData();
    } catch (checkoutError) {
      setError(checkoutError.message);
    }
  }

  async function handleReturn(id) {
    try {
      await api.post(`/rentals/${id}/return`, {});
      await loadData();
    } catch (returnError) {
      setError(returnError.message);
    }
  }

  useEffect(() => {
    if (!bookQuery) {
      return;
    }

    const match = availableBooks.find(
      (book) =>
        book.isbn.toLowerCase() === bookQuery.toLowerCase() ||
        book.callNumber?.toLowerCase() === bookQuery.toLowerCase()
    );

    if (match) {
      setForm((current) => ({ ...current, bookId: match.id }));
    }
  }, [availableBooks, bookQuery]);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-brass-200/70">Circulation</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-white">Check-out and returns</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form className="rounded-3xl border border-white/10 bg-white/[0.03] p-6" onSubmit={handleCheckout}>
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            Only physical titles are eligible for circulation. Digital titles remain available in the catalog.
          </div>

          <div>
            <label className="label">Scan ISBN / Call Number</label>
            <BarcodeInput
              value={bookQuery}
              onChange={(event) => setBookQuery(event.target.value)}
              placeholder="Scan physical book barcode"
            />
          </div>

          <div className="mt-4">
            <label className="label">Available Physical Book</label>
            <select
              className="field"
              value={form.bookId}
              onChange={(event) => setForm((current) => ({ ...current, bookId: event.target.value }))}
            >
              <option value="">Select a book</option>
              {availableBooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} ({book.isbn})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="label">Patron Name</label>
            <input
              className="field"
              value={form.patronName}
              onChange={(event) => setForm((current) => ({ ...current, patronName: event.target.value }))}
              placeholder="Enter borrower name"
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Checkout Date</label>
              <input
                type="date"
                className="field"
                value={form.checkoutDate}
                onChange={(event) => setForm((current) => ({ ...current, checkoutDate: event.target.value }))}
              />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                className="field"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
              />
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-clay-300">{error}</p> : null}

          <button type="submit" className="btn-primary mt-6 w-full">
            Check Out Book
          </button>
        </form>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="font-medium text-white">Active and overdue rentals</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-white/60">
                  <tr>
                    <th className="px-5 py-4 font-medium">Book</th>
                    <th className="px-5 py-4 font-medium">Patron</th>
                    <th className="px-5 py-4 font-medium">Due</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals
                    .filter((rental) => rental.status !== "returned")
                    .map((rental) => (
                      <tr key={rental.id} className="border-b border-white/5 text-white/80">
                        <td className="px-5 py-4">{rental.book.title}</td>
                        <td className="px-5 py-4">{rental.patronName}</td>
                        <td className="px-5 py-4">{new Date(rental.dueDate).toLocaleDateString()}</td>
                        <td className="px-5 py-4">{labelize(rental.status)}</td>
                        <td className="px-5 py-4">
                          <button type="button" className="btn-primary px-3 py-2 text-xs" onClick={() => handleReturn(rental.id)}>
                            Return
                          </button>
                        </td>
                      </tr>
                    ))}
                  {!rentals.some((rental) => rental.status !== "returned") ? (
                    <tr>
                      <td className="px-5 py-8 text-white/50" colSpan="5">No active rentals.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="font-medium text-white">Return history</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-white/60">
                  <tr>
                    <th className="px-5 py-4 font-medium">Book</th>
                    <th className="px-5 py-4 font-medium">Patron</th>
                    <th className="px-5 py-4 font-medium">Returned</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals
                    .filter((rental) => rental.status === "returned")
                    .map((rental) => (
                      <tr key={rental.id} className="border-b border-white/5 text-white/80">
                        <td className="px-5 py-4">{rental.book.title}</td>
                        <td className="px-5 py-4">{rental.patronName}</td>
                        <td className="px-5 py-4">{new Date(rental.returnDate).toLocaleDateString()}</td>
                        <td className="px-5 py-4">{labelize(rental.status)}</td>
                      </tr>
                    ))}
                  {!rentals.some((rental) => rental.status === "returned") ? (
                    <tr>
                      <td className="px-5 py-8 text-white/50" colSpan="4">No returns yet.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="font-medium text-white">Digital library</p>
            </div>
            <div className="space-y-3 px-5 py-5">
              {digitalBooks.length ? (
                digitalBooks.map((book) => (
                  <div key={book.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-white">{book.title}</p>
                      <p className="text-sm text-white/60">{book.author.lastName}, {book.author.firstName}</p>
                    </div>
                    {book.accessUrl ? (
                      <a className="btn-secondary px-3 py-2 text-sm" href={book.accessUrl} target="_blank" rel="noreferrer">
                        Read Online
                      </a>
                    ) : (
                      <span className="text-sm text-white/45">No access URL set</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/50">No digital titles in the catalog yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
