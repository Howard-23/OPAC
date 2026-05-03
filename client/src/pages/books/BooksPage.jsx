import { useEffect, useState } from "react";

import { createAuthor, deleteAuthor, getAuthors } from "../../api/authorsApi";
import { createBook, deleteBook, getBooks, lookupBookByIsbn, updateBook } from "../../api/booksApi";
import PaginationControls from "../../components/ui/PaginationControls";
import ScannerInput from "../../components/ui/ScannerInput";
import Panel from "../../components/ui/Panel";
import StatusBadge from "../../components/ui/StatusBadge";
import { validateBookForm } from "../../utils/validation";

const LOOKUP_AUTHOR_OPTION = "__lookup_author__";

const initialForm = {
  isbn: "",
  title: "",
  author_id: "",
  publisher: "",
  publication_year: "",
  call_number: "",
  status: "available",
  format: "physical",
  access_url: ""
};

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [lookupAuthor, setLookupAuthor] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAuthors();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadBooks(page, search, statusFilter, formatFilter);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [page, search, statusFilter, formatFilter]);

  async function loadAuthors() {
    const response = await getAuthors({ all: true });
    setAuthors(response.data);
  }

  async function loadBooks(
    nextPage = page,
    nextSearch = search,
    nextStatus = statusFilter,
    nextFormat = formatFilter
  ) {
    setLoading(true);

    try {
      const response = await getBooks({
        page: nextPage,
        pageSize: 8,
        q: nextSearch,
        status: nextStatus || undefined,
        format: nextFormat || undefined
      });
      setBooks(response.data);
      setMeta(response.meta);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setLookupAuthor(null);
    setEditingId(null);
    setErrors({});
  }

  function findMatchingAuthor(author) {
    if (!author?.first_name || !author?.last_name) {
      return null;
    }

    return (
      authors.find(
        (entry) =>
          entry.first_name.toLowerCase() === author.first_name.toLowerCase() &&
          entry.last_name.toLowerCase() === author.last_name.toLowerCase()
      ) || null
    );
  }

  async function ensureAuthor(author) {
    if (!author.first_name || !author.last_name) {
      return { id: "", created: false };
    }

    const matchingAuthor = findMatchingAuthor(author);

    if (matchingAuthor) {
      return { id: matchingAuthor.id, created: false };
    }

    const createdAuthor = await createAuthor(author);
    setAuthors((current) =>
      [...current, createdAuthor].sort((left, right) =>
        `${left.last_name}${left.first_name}`.localeCompare(`${right.last_name}${right.first_name}`)
      )
    );
    return { id: createdAuthor.id, created: true };
  }

  async function handleLookup() {
    if (!form.isbn) {
      setMessage("Scan or enter an ISBN first.");
      return;
    }

    setLookupLoading(true);
    setMessage("");

    try {
      const result = await lookupBookByIsbn(form.isbn);
      const matchingAuthor = findMatchingAuthor(result.author);
      const hasLookupAuthor = Boolean(result.author?.first_name && result.author?.last_name);

      setLookupAuthor(!matchingAuthor && hasLookupAuthor ? result.author : null);

      setForm((current) => ({
        ...current,
        title: result.title || current.title,
        publisher: result.publisher || current.publisher,
        publication_year: result.publication_year || current.publication_year,
        author_id:
          matchingAuthor?.id ||
          (hasLookupAuthor
            ? LOOKUP_AUTHOR_OPTION
            : current.author_id === LOOKUP_AUTHOR_OPTION
              ? ""
              : current.author_id)
      }));
      setMessage(
        hasLookupAuthor
          ? "Book details imported from Google Books."
          : "Book details imported. Select an author before saving."
      );
    } catch (error) {
      setMessage(error.response?.data?.message || "ISBN lookup failed.");
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateBookForm(form);
    let createdAuthorId = null;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setMessage("");

    try {
      let authorId = form.author_id;

      if (authorId === LOOKUP_AUTHOR_OPTION) {
        const ensuredAuthor = await ensureAuthor(lookupAuthor || {});
        authorId = ensuredAuthor.id;
        createdAuthorId = ensuredAuthor.created ? ensuredAuthor.id : null;
      }

      if (!authorId) {
        setErrors({ author_id: "Author is required." });
        return;
      }

      const payload = {
        ...form,
        author_id: authorId,
        publication_year: form.publication_year ? Number(form.publication_year) : null,
        access_url: form.format === "digital" ? form.access_url : null
      };

      if (editingId) {
        await updateBook(editingId, payload);
        setMessage("Book updated.");
      } else {
        await createBook(payload);
        setMessage("Book created.");
      }
    } catch (error) {
      if (createdAuthorId) {
        try {
          await deleteAuthor(createdAuthorId);
        } catch {
          // Best-effort cleanup if author creation succeeded but book save failed.
        }
      }
      setMessage(error.response?.data?.details?.join(" ") || error.response?.data?.message || "Book save failed.");
      return;
    }

    resetForm();
    await loadBooks(page, search, statusFilter, formatFilter);
  }

  async function handleDelete(id) {
    try {
      await deleteBook(id);
      setMessage("Book removed.");
      await loadBooks(page, search, statusFilter, formatFilter);
    } catch (error) {
      setMessage(error.response?.data?.message || "Book delete failed.");
    }
  }

  function handleEdit(book) {
    setEditingId(book.id);
    setLookupAuthor(null);
    setForm({
      isbn: book.isbn || "",
      title: book.title || "",
      author_id: book.author_id || "",
      publisher: book.publisher || "",
      publication_year: book.publication_year || "",
      call_number: book.call_number || "",
      status: book.status || "available",
      format: book.format || "physical",
      access_url: book.access_url || ""
    });
    setErrors({});
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-title">{editingId ? "Edit Book" : "Catalog Book"}</p>
            <p className="mt-2 text-sm text-slate-600">
              ISBN input stays scanner-ready for USB barcode readers.
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            New Entry
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">ISBN</label>
              <ScannerInput
                autoFocus
                value={form.isbn}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isbn: event.target.value }))
                }
                onScannerSubmit={handleLookup}
                placeholder="Scan or type ISBN"
              />
              {errors.isbn ? <p className="mt-2 text-sm text-rosewood">{errors.isbn}</p> : null}
            </div>
            <button
              type="button"
              onClick={handleLookup}
              disabled={lookupLoading}
              className="mt-7 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
            >
              {lookupLoading ? "Looking up..." : "Auto-Fill"}
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
            {errors.title ? <p className="mt-2 text-sm text-rosewood">{errors.title}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Author</label>
            <select
              value={form.author_id}
              onChange={(event) =>
                setForm((current) => ({ ...current, author_id: event.target.value }))
              }
            >
              <option value="">Select an author</option>
              {lookupAuthor ? (
                <option value={LOOKUP_AUTHOR_OPTION}>
                  {lookupAuthor.last_name}, {lookupAuthor.first_name} (from lookup)
                </option>
              ) : null}
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.last_name}, {author.first_name}
                </option>
              ))}
            </select>
            {errors.author_id ? <p className="mt-2 text-sm text-rosewood">{errors.author_id}</p> : null}
            {lookupAuthor && form.author_id === LOOKUP_AUTHOR_OPTION ? (
              <p className="mt-2 text-sm text-slate-500">This author will be created only when the book is saved.</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Publisher</label>
              <input
                value={form.publisher}
                onChange={(event) =>
                  setForm((current) => ({ ...current, publisher: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Publication year
              </label>
              <input
                value={form.publication_year}
                onChange={(event) =>
                  setForm((current) => ({ ...current, publication_year: event.target.value }))
                }
              />
              {errors.publication_year ? (
                <p className="mt-2 text-sm text-rosewood">{errors.publication_year}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Call number</label>
              <input
                value={form.call_number}
                onChange={(event) =>
                  setForm((current) => ({ ...current, call_number: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Format</label>
              <select
                value={form.format}
                onChange={(event) => setForm((current) => ({ ...current, format: event.target.value }))}
              >
                <option value="physical">Physical</option>
                <option value="digital">Digital</option>
              </select>
            </div>
          </div>

          {form.format === "digital" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Access URL</label>
              <input
                value={form.access_url}
                onChange={(event) =>
                  setForm((current) => ({ ...current, access_url: event.target.value }))
                }
                placeholder="https://"
              />
              {errors.access_url ? <p className="mt-2 text-sm text-rosewood">{errors.access_url}</p> : null}
            </div>
          ) : null}

          {message ? <p className="text-sm text-teal">{message}</p> : null}

          <button className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white">
            {editingId ? "Save Changes" : "Create Book"}
          </button>
        </form>
      </Panel>

      <Panel className="p-6">
        <p className="section-title">Catalog</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search title, ISBN, publisher, call number, or author"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
            <option value="lost">Lost</option>
          </select>
          <select
            value={formatFilter}
            onChange={(event) => {
              setFormatFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All formats</option>
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
          </select>
        </div>
        <div className="mt-6 space-y-3">
          {loading ? <p className="text-sm text-slate-500">Loading books...</p> : null}
          {books.map((book) => (
            <article
              key={book.id}
              className="rounded-3xl border border-slate-200 bg-white px-5 py-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-ink">{book.title}</h3>
                    <StatusBadge value={book.status} />
                    <StatusBadge value={book.format} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {book.author ? `${book.author.last_name}, ${book.author.first_name}` : "No author"}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">ISBN: {book.isbn}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {book.publisher || "No publisher"} {book.publication_year ? ` - ${book.publication_year}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Call Number: {book.call_number || "Not set"}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {book.format === "digital" && book.access_url ? (
                    <a
                      href={book.access_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-teal-700 px-4 py-2 text-sm font-medium text-white"
                    >
                      Read Online
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleEdit(book)}
                    className="rounded-2xl bg-parchment px-4 py-2 text-sm font-medium text-ink"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(book.id)}
                    className="rounded-2xl bg-rosewood px-4 py-2 text-sm font-medium text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}

          {!loading && books.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
              No books found.
            </div>
          ) : null}
        </div>
        <PaginationControls meta={meta} onPageChange={setPage} />
      </Panel>
    </div>
  );
}

export default BooksPage;
