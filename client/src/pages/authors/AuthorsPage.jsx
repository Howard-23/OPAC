import { useEffect, useState } from "react";

import { createAuthor, deleteAuthor, getAuthors, updateAuthor } from "../../api/authorsApi";
import PaginationControls from "../../components/ui/PaginationControls";
import Panel from "../../components/ui/Panel";
import { validateAuthorForm } from "../../utils/validation";

const initialForm = {
  first_name: "",
  last_name: ""
};

function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadAuthors(page, search);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [page, search]);

  async function loadAuthors(nextPage = page, nextSearch = search) {
    setLoading(true);

    try {
      const response = await getAuthors({
        page: nextPage,
        pageSize: 8,
        q: nextSearch
      });
      setAuthors(response.data);
      setMeta(response.meta);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateAuthorForm(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setMessage("");

    try {
      if (editingId) {
        await updateAuthor(editingId, form);
        setMessage("Author updated.");
      } else {
        await createAuthor(form);
        setMessage("Author created.");
      }

      resetForm();
      await loadAuthors(page, search);
    } catch (error) {
      setMessage(error.response?.data?.details?.join(" ") || error.response?.data?.message || "Author save failed.");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteAuthor(id);
      setMessage("Author removed.");
      await loadAuthors(page, search);
    } catch (error) {
      setMessage(error.response?.data?.message || "Author delete failed.");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel className="p-6">
        <p className="section-title">{editingId ? "Edit Author" : "Add Author"}</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">First name</label>
            <input
              autoFocus
              value={form.first_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, first_name: event.target.value }))
              }
            />
            {errors.first_name ? <p className="mt-2 text-sm text-rosewood">{errors.first_name}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Last name</label>
            <input
              value={form.last_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, last_name: event.target.value }))
              }
            />
            {errors.last_name ? <p className="mt-2 text-sm text-rosewood">{errors.last_name}</p> : null}
          </div>
          {message ? <p className="text-sm text-teal">{message}</p> : null}
          <div className="flex gap-3">
            <button className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white">
              {editingId ? "Save Changes" : "Create Author"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Reset
            </button>
          </div>
        </form>
      </Panel>

      <Panel className="p-6">
        <p className="section-title">Author Directory</p>
        <div className="mt-4">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by first or last name"
          />
        </div>
        <div className="mt-6 space-y-3">
          {loading ? <p className="text-sm text-slate-500">Loading authors...</p> : null}
          {authors.map((author) => (
            <article
              key={author.id}
              className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-ink">
                  {author.last_name}, {author.first_name}
                </p>
                <p className="text-sm text-slate-500">{author.id}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(author.id);
                    setForm({
                      first_name: author.first_name,
                      last_name: author.last_name
                    });
                    setErrors({});
                  }}
                  className="rounded-2xl bg-parchment px-4 py-2 text-sm font-medium text-ink"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(author.id)}
                  className="rounded-2xl bg-rosewood px-4 py-2 text-sm font-medium text-white"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}

          {!loading && authors.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
              No authors found.
            </div>
          ) : null}
        </div>
        <PaginationControls meta={meta} onPageChange={setPage} />
      </Panel>
    </div>
  );
}

export default AuthorsPage;
