import http from "./http";

export async function getAuthors(params = {}) {
  const { data } = await http.get("/authors", { params });
  return data;
}

export async function createAuthor(payload) {
  const { data } = await http.post("/authors", payload);
  return data;
}

export async function updateAuthor(id, payload) {
  const { data } = await http.put(`/authors/${id}`, payload);
  return data;
}

export async function deleteAuthor(id) {
  await http.delete(`/authors/${id}`);
}
