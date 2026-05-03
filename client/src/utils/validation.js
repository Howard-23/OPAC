function normalizeIsbn(value) {
  return String(value || "")
    .trim()
    .replace(/[\s-]+/g, "")
    .toUpperCase();
}

function isValidUrl(value) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (_error) {
    return false;
  }
}

export function validateAuthorForm(form) {
  const errors = {};

  if (!form.first_name.trim()) {
    errors.first_name = "First name is required.";
  }

  if (!form.last_name.trim()) {
    errors.last_name = "Last name is required.";
  }

  return errors;
}

export function validateBookForm(form) {
  const errors = {};
  const normalizedIsbn = normalizeIsbn(form.isbn);
  const publicationYear = form.publication_year ? Number(form.publication_year) : null;

  if (!normalizedIsbn) {
    errors.isbn = "ISBN is required.";
  } else if (!/^(?:\d{9}[\dX]|\d{13})$/.test(normalizedIsbn)) {
    errors.isbn = "Enter a valid ISBN-10 or ISBN-13.";
  }

  if (!form.title.trim()) {
    errors.title = "Title is required.";
  }

  if (!form.author_id) {
    errors.author_id = "Author is required.";
  }

  if (publicationYear !== null) {
    if (!Number.isInteger(publicationYear)) {
      errors.publication_year = "Publication year must be a whole number.";
    } else if (publicationYear < 1450 || publicationYear > new Date().getFullYear() + 1) {
      errors.publication_year = "Publication year is outside the supported range.";
    }
  }

  if (form.format === "digital") {
    if (!form.access_url.trim()) {
      errors.access_url = "Access URL is required for digital books.";
    } else if (!isValidUrl(form.access_url.trim())) {
      errors.access_url = "Access URL must start with http:// or https://.";
    }
  }

  return errors;
}

export function validateRentalForm(form) {
  const errors = {};

  if (!form.book_id) {
    errors.book_id = "Select a book.";
  }

  if (!form.patron_name.trim()) {
    errors.patron_name = "Patron name is required.";
  }

  if (!form.checkout_date) {
    errors.checkout_date = "Checkout date is required.";
  }

  if (!form.due_date) {
    errors.due_date = "Due date is required.";
  }

  if (form.checkout_date && form.due_date) {
    if (new Date(form.due_date) < new Date(form.checkout_date)) {
      errors.due_date = "Due date cannot be earlier than checkout date.";
    }
  }

  return errors;
}
