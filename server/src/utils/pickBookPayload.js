function pickBookPayload(body) {
  return {
    isbn: body.isbn,
    title: body.title,
    author_id: body.author_id,
    publisher: body.publisher || null,
    publication_year: body.publication_year || null,
    call_number: body.call_number || null,
    status: body.status || "available",
    format: body.format || "physical",
    access_url: body.access_url || null
  };
}

module.exports = pickBookPayload;
