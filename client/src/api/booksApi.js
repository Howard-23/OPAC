import http from "./http";

export async function getBooks(params = {}) {
  const { data } = await http.get("/books", { params });
  return data;
}

export async function lookupBookByIsbn(isbn) {
  const { data } = await http.get(`/books/lookup/${isbn}`);
  return data;
}

export async function createBook(payload) {
  const { data } = await http.post("/books", payload);
  return data;
}

export async function updateBook(id, payload) {
  const { data } = await http.put(`/books/${id}`, payload);
  return data;
}

export async function deleteBook(id) {
  await http.delete(`/books/${id}`);
}
