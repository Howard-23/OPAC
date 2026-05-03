import { useEffect, useRef, useState } from "react";
import BarcodeInput from "../components/BarcodeInput";
import { api } from "../lib/api";

const emptyForm = {
  isbn: "",
  title: "",
  authorId: "",
  publisher: "",
  publicationYear: "",
  callNumber: "",
  status: "available",
  format: "physical",
  accessUrl: ""
};

function labelize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function BooksPage() {
  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const isbnRef = useRef(null);

  async function loadAuthors() {
    const data = await api.get("/authors");
    setAuthors(data);
    if (!form.authorId && data[0]) {
      setForm((current) => ({ ...current, authorId: data[0].id }));
    }
  }

  async function loadBooks(search = "") {
    const suffix = search ? `?q=${encodeURIComponent(search)}` : "";
    setBooks(await api.get(`/books${suffix}`));
  }

  useEffect(() => {
    Promise.all([loadAuthors(), loadBooks()]).catch((loadError) => setError(loadError.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = {
      ...form,
      publicationYear: form.publicationYear ? Number(form.publicationYear) : null,
      publisher: form.publisher || null,
      callNumber: form.callNumber || null,
      accessUrl: form.format === "digital" ? form.accessUrl || null : null
    };

    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, payload);
      } else {
        await api.post("/books", payload);
      }

      setEditingId(null);
      setForm((current) => ({
        ...emptyForm,
        authorId: authors[0]?.id || current.authorId
      }));
      await loadBooks(query);
      isbnRef.current?.focus();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/books/${id}`);
      await loadBooks(query);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function startEdit(book) {
    setEditingId(book.id);
    setForm({
      isbn: book.isbn,
      title: book.title,
      authorId: book.authorId,
      publisher: book.publisher || "",
      publicationYear: book.publicationYear || "",
      callNumber: book.callNumber || "",
      status: book.status,
      format: book.format,
      accessUrl: book.accessUrl || ""
    });
  }

  async function lookupByIsbn() {
    if (!form.isbn) {
      return;
    }

    try {
      const data = await api.get(`/books/google/${form.isbn}`);

      setForm((current) => ({
        ...current,
        title: data.title || current.title,
        publisher: data.publisher || current.publisher,
        publicationYear: data.publicationYear || current.publicationYear
      }));

      if (data.author?.firstName || data.author?.lastName) {
        const fullName = `${data.author.firstName} ${data.author.lastName}`.trim().toLowerCase();
        const existing = authors.find(
          (author) => `${author.firstName} ${author.lastName}`.trim().toLowerCase() === fullName
        );

        if (existing) {
          setForm((current) => ({ ...current, authorId: existing.id }));
        }
      }
    } catch (lookupError) {
      setError(lookupError.message);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    try {
      await loadBooks(query);
    } catch (searchError) {
      setError(searchError.message);
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brass-200/70">Books</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white">Catalog management</h2>
        </div>
        <form className="flex w-full max-w-md gap-3" onSubmit={handleSearch}>
          <input
            className="field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, ISBN, author, call number, format"
          />
          <button type="submit" className="btn-secondary">Search</button>
        </form>
      </div>

      <div className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        <form className="rounded-3xl border border-white/10 bg-white/[0.03] p-6" onSubmit={handleSubmit}>
          {!authors.length ? (
            <div className="mb-5 rounded-2xl border border-clay-300/30 bg-clay-500/10 px-4 py-3 text-sm text-clay-300">
              Add at least one author before creating a book record.
            </div>
          ) : null}

          <div>
            <label className="label">ISBN / Barcode</label>
            <div className="flex gap-3">
              <BarcodeInput
                ref={isbnRef}
                value={form.isbn}
                onChange={(event) => setForm((current) => ({ ...current, isbn: event.target.value }))}
                placeholder="Scan or enter ISBN"
              />
              <button type="button" className="btn-secondary whitespace-nowrap" onClick={lookupByIsbn}>
                Auto-Fill
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Title</label>
            <input
              className="field"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
          </div>

          <div className="mt-4">
            <label className="label">Author</label>
            <select
              className="field"
              value={form.authorId}
              onChange={(event) => setForm((current) => ({ ...current, authorId: event.target.value }))}
            >
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.lastName}, {author.firstName}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Publisher</label>
              <input
                className="field"
                value={form.publisher}
                onChange={(event) => setForm((current) => ({ ...current, publisher: event.target.value }))}
              />
            </div>

            <div>
              <label className="label">Publication Year</label>
              <input
                className="field"
                value={form.publicationYear}
                onChange={(event) => setForm((current) => ({ ...current, publicationYear: event.target.value }))}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Call Number</label>
              <input
                className="field"
                value={form.callNumber}
                onChange={(event) => setForm((current) => ({ ...current, callNumber: event.target.value }))}
                placeholder={form.format === "digital" ? "Optional for digital titles" : ""}
              />
            </div>

            <div>
              <label className="label">Status</label>
              <select
                className="field"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Format</label>
              <select
                className="field"
                value={form.format}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    format: event.target.value,
                    accessUrl: event.target.value === "digital" ? current.accessUrl : ""
                  }))
                }
              >
                <option value="physical">Physical</option>
                <option value="digital">Digital</option>
              </select>
            </div>

            <div>
              <label className="label">Access URL</label>
              <input
                className="field"
                value={form.accessUrl}
                onChange={(event) => setForm((current) => ({ ...current, accessUrl: event.target.value }))}
                placeholder={form.format === "digital" ? "https://..." : "Only used for digital titles"}
                disabled={form.format !== "digital"}
              />
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-clay-300">{error}</p> : null}

          <div className="mt-6 flex gap-3">
            <button type="submit" className="btn-primary flex-1" disabled={!authors.length}>
              {editingId ? "Update Book" : "Add Book"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditingId(null);
                setForm({
                  ...emptyForm,
                  authorId: authors[0]?.id || ""
                });
              }}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-white/60">
                <tr>
                  <th className="px-5 py-4 font-medium">ISBN</th>
                  <th className="px-5 py-4 font-medium">Title</th>
                  <th className="px-5 py-4 font-medium">Author</th>
                  <th className="px-5 py-4 font-medium">Format</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Access</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b border-white/5 text-white/80">
                    <td className="px-5 py-4">{book.isbn}</td>
                    <td className="px-5 py-4">{book.title}</td>
                    <td className="px-5 py-4">{book.author.lastName}, {book.author.firstName}</td>
                    <td className="px-5 py-4">{labelize(book.format)}</td>
                    <td className="px-5 py-4">{labelize(book.status)}</td>
                    <td className="px-5 py-4">
                      {book.format === "digital" && book.accessUrl ? (
                        <a
                          className="btn-secondary px-3 py-2 text-xs"
                          href={book.accessUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Read Online
                        </a>
                      ) : (
                        <span className="text-white/40">N/A</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={() => startEdit(book)}>
                          Edit
                        </button>
                        <button type="button" className="btn-danger px-3 py-2 text-xs" onClick={() => handleDelete(book.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!books.length ? (
                  <tr>
                    <td className="px-5 py-8 text-white/50" colSpan="7">No books found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
