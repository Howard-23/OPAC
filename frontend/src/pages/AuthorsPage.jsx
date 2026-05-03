import { useEffect, useState } from "react";
import { api } from "../lib/api";

const emptyForm = {
  firstName: "",
  lastName: ""
};

export default function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function loadAuthors() {
    try {
      setAuthors(await api.get("/authors"));
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadAuthors();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.put(`/authors/${editingId}`, form);
      } else {
        await api.post("/authors", form);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadAuthors();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/authors/${id}`);
      await loadAuthors();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function startEdit(author) {
    setEditingId(author.id);
    setForm({
      firstName: author.firstName,
      lastName: author.lastName
    });
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-brass-200/70">Authors</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-white">Author directory</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <form className="rounded-3xl border border-white/10 bg-white/[0.03] p-6" onSubmit={handleSubmit}>
          <div>
            <label className="label">First Name</label>
            <input
              className="field"
              value={form.firstName}
              onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
            />
          </div>

          <div className="mt-4">
            <label className="label">Last Name</label>
            <input
              className="field"
              value={form.lastName}
              onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
            />
          </div>

          {error ? <p className="mt-4 text-sm text-clay-300">{error}</p> : null}

          <div className="mt-6 flex gap-3">
            <button type="submit" className="btn-primary flex-1">
              {editingId ? "Update Author" : "Add Author"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
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
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Books</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((author) => (
                  <tr key={author.id} className="border-b border-white/5 text-white/80">
                    <td className="px-6 py-4">{author.lastName}, {author.firstName}</td>
                    <td className="px-6 py-4">{author.booksCount ?? 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={() => startEdit(author)}>
                          Edit
                        </button>
                        <button type="button" className="btn-danger px-3 py-2 text-xs" onClick={() => handleDelete(author.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!authors.length ? (
                  <tr>
                    <td className="px-6 py-8 text-white/50" colSpan="3">No authors found.</td>
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
