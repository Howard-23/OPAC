const axios = require("axios");

async function fetchBookByIsbn(isbn) {
  const apiBaseUrl =
    process.env.GOOGLE_BOOKS_API_BASE_URL || "https://www.googleapis.com/books/v1/volumes";
  const response = await axios.get(apiBaseUrl, {
    params: {
      q: `isbn:${isbn}`,
      maxResults: 1
    }
  });

  const book = response.data.items?.[0];

  if (!book) {
    return null;
  }

  const volumeInfo = book.volumeInfo || {};
  const authors = volumeInfo.authors || [];
  const [firstAuthor = ""] = authors;
  const nameParts = firstAuthor.trim().split(/\s+/).filter(Boolean);

  return {
    isbn,
    title: volumeInfo.title || "",
    publisher: volumeInfo.publisher || "",
    publication_year: volumeInfo.publishedDate
      ? Number.parseInt(volumeInfo.publishedDate.slice(0, 4), 10) || null
      : null,
    authors,
    author: {
      first_name: nameParts.slice(0, -1).join(" ") || nameParts[0] || "",
      last_name: nameParts.length > 1 ? nameParts[nameParts.length - 1] : ""
    },
    thumbnail: volumeInfo.imageLinks?.thumbnail || null,
    info_link: volumeInfo.infoLink || null
  };
}

module.exports = {
  fetchBookByIsbn
};
