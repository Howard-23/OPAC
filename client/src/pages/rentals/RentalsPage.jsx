import { useEffect, useMemo, useState } from "react";

import { getBooks } from "../../api/booksApi";
import { createRental, deleteRental, getRentals, returnRental } from "../../api/rentalsApi";
import PaginationControls from "../../components/ui/PaginationControls";
import ScannerInput from "../../components/ui/ScannerInput";
import Panel from "../../components/ui/Panel";
import StatusBadge from "../../components/ui/StatusBadge";
import { validateRentalForm } from "../../utils/validation";

function defaultCheckoutDate() {
  return new Date().toISOString().slice(0, 10);
}

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

const initialForm = {
  book_id: "",
  patron_name: "",
  checkout_date: defaultCheckoutDate(),
  due_date: defaultDueDate()
};

function RentalsPage() {
  const [books, setBooks] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [scanValue, setScanValue] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableBooks();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadRentals(page, search, statusFilter);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [page, search, statusFilter]);

  async function loadAvailableBooks() {
    const response = await getBooks({
      all: true,
      status: "available",
      format: "physical"
    });
    setBooks(response.data);
  }

  async function loadRentals(nextPage = page, nextSearch = search, nextStatus = statusFilter) {
    setLoading(true);

    try {
      const response = await getRentals({
        page: nextPage,
        pageSize: 8,
        q: nextSearch,
        status: nextStatus || undefined
      });
      setRentals(response.data);
      setMeta(response.meta);
    } finally {
      setLoading(false);
    }
  }

  const availableBooks = useMemo(
    () => books.filter((book) => book.status === "available" || book.id === form.book_id),
    [books, form.book_id]
  );

  function resetForm() {
    setForm(initialForm);
    setScanValue("");
    setErrors({});
  }

  function handleScannerSubmit(value) {
    const match = availableBooks.find((book) => book.isbn === value.trim());

    if (match) {
      setForm((current) => ({ ...current, book_id: match.id }));
      setMessage(`Selected "${match.title}" from scanned ISBN.`);
    } else {
      setMessage("No available book matched the scanned ISBN.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRentalForm(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setMessage("");

    try {
      await createRental(form);
      setMessage("Rental created.");
      resetForm();
      await loadAvailableBooks();
      await loadRentals(page, search, statusFilter);
    } catch (error) {
      setMessage(error.response?.data?.details?.join(" ") || error.response?.data?.message || "Rental create failed.");
    }
  }

  async function handleReturn(id) {
    try {
      await returnRental(id);
      setMessage("Book returned.");
      await loadAvailableBooks();
      await loadRentals(page, search, statusFilter);
    } catch (error) {
      setMessage(error.response?.data?.message || "Return failed.");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteRental(id);
      setMessage("Rental removed.");
      await loadAvailableBooks();
      await loadRentals(page, search, statusFilter);
    } catch (error) {
      setMessage(error.response?.data?.message || "Rental delete failed.");
    }
  }

  function getDisplayStatus(rental) {
    if (!rental.return_date && new Date(rental.due_date) < new Date()) {
      return "overdue";
    }

    return rental.status;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel className="p-6">
        <p className="section-title">Check Out Item</p>
        <p className="mt-2 text-sm text-slate-600">
          Scan an ISBN into the first field, then press Enter to select the matching available book.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">ISBN scanner input</label>
            <ScannerInput
              autoFocus
              value={scanValue}
              onChange={(event) => setScanValue(event.target.value)}
              onScannerSubmit={handleScannerSubmit}
              placeholder="Scan ISBN to select a book"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Book</label>
            <select
              value={form.book_id}
              onChange={(event) => setForm((current) => ({ ...current, book_id: event.target.value }))}
            >
              <option value="">Select available book</option>
              {availableBooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} ({book.isbn})
                </option>
              ))}
            </select>
            {errors.book_id ? <p className="mt-2 text-sm text-rosewood">{errors.book_id}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Patron name</label>
            <input
              value={form.patron_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, patron_name: event.target.value }))
              }
              placeholder="Enter patron name"
            />
            {errors.patron_name ? <p className="mt-2 text-sm text-rosewood">{errors.patron_name}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Checkout date</label>
              <input
                type="date"
                value={form.checkout_date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, checkout_date: event.target.value }))
                }
              />
              {errors.checkout_date ? (
                <p className="mt-2 text-sm text-rosewood">{errors.checkout_date}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Due date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(event) => setForm((current) => ({ ...current, due_date: event.target.value }))}
              />
              {errors.due_date ? <p className="mt-2 text-sm text-rosewood">{errors.due_date}</p> : null}
            </div>
          </div>

          {message ? <p className="text-sm text-teal">{message}</p> : null}

          <button className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white">
            Check Out
          </button>
        </form>
      </Panel>

      <Panel className="p-6">
        <p className="section-title">Rental Activity</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px]">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by patron, title, or ISBN"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="checked_out">Checked out</option>
            <option value="returned">Returned</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="mt-6 space-y-3">
          {loading ? <p className="text-sm text-slate-500">Loading rentals...</p> : null}
          {rentals.map((rental) => (
            <article
              key={rental.id}
              className="rounded-3xl border border-slate-200 bg-white px-5 py-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-ink">{rental.book?.title || "Unknown title"}</h3>
                    <StatusBadge value={getDisplayStatus(rental)} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Patron: {rental.patron_name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Checkout: {rental.checkout_date} - Due: {rental.due_date}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Return date: {rental.return_date || "Not returned"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!rental.return_date && rental.status !== "returned" ? (
                    <button
                      type="button"
                      onClick={() => handleReturn(rental.id)}
                      className="rounded-2xl bg-teal-700 px-4 py-2 text-sm font-medium text-white"
                    >
                      Return
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDelete(rental.id)}
                    className="rounded-2xl bg-rosewood px-4 py-2 text-sm font-medium text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}

          {!loading && rentals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
              No rental activity found.
            </div>
          ) : null}
        </div>
        <PaginationControls meta={meta} onPageChange={setPage} />
      </Panel>
    </div>
  );
}

export default RentalsPage;
