async function fetchGoogleBookByIsbn(isbn) {
  const cleanedIsbn = String(isbn || "").replace(/[^0-9Xx]/g, "");

  if (!cleanedIsbn) {
    return null;
  }

  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanedIsbn}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch from Google Books API");
  }

  const data = await response.json();
  const volume = data.items?.[0]?.volumeInfo;

  if (!volume) {
    return null;
  }

  const authors = volume.authors || [];
  const [firstAuthor = ""] = authors;
  const authorTokens = firstAuthor.split(" ");

  return {
    isbn: cleanedIsbn,
    title: volume.title || "",
    publisher: volume.publisher || "",
    publicationYear: volume.publishedDate ? Number(String(volume.publishedDate).slice(0, 4)) || null : null,
    authors,
    author: {
      firstName: authorTokens.slice(0, -1).join(" ") || authorTokens[0] || "",
      lastName: authorTokens.length > 1 ? authorTokens.at(-1) : ""
    }
  };
}

module.exports = {
  fetchGoogleBookByIsbn
};
