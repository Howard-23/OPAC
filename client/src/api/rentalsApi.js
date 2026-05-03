import http from "./http";

export async function getRentals(params = {}) {
  const { data } = await http.get("/rentals", { params });
  return data;
}

export async function getRentalSummary() {
  const { data } = await http.get("/rentals/summary");
  return data;
}

export async function createRental(payload) {
  const { data } = await http.post("/rentals", payload);
  return data;
}

export async function returnRental(id, payload = {}) {
  const { data } = await http.post(`/rentals/${id}/return`, payload);
  return data;
}

export async function deleteRental(id) {
  await http.delete(`/rentals/${id}`);
}
