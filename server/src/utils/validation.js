const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BOOK_STATUS_VALUES = ["available", "borrowed", "lost"];
const BOOK_FORMAT_VALUES = ["physical", "digital"];
const RENTAL_STATUS_VALUES = ["checked_out", "returned", "overdue"];

function trimString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableString(value) {
  const trimmedValue = trimString(value);
  return trimmedValue || null;
}

function normalizeIsbn(value) {
  return trimString(value).replace(/[\s-]+/g, "").toUpperCase();
}

function isValidUuid(value) {
  return UUID_PATTERN.test(trimString(value));
}

function isValidIsbn(value) {
  const normalizedIsbn = normalizeIsbn(value);
  return /^(?:\d{9}[\dX]|\d{13})$/.test(normalizedIsbn);
}

function isValidUrl(value) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (_error) {
    return false;
  }
}

function isValidDateString(value) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function validateAuthorPayload(payload) {
  const first_name = trimString(payload.first_name);
  const last_name = trimString(payload.last_name);
  const errors = [];

  if (!first_name) {
    errors.push("First name is required.");
  }

  if (!last_name) {
    errors.push("Last name is required.");
  }

  if (first_name.length > 100) {
    errors.push("First name must be 100 characters or fewer.");
  }

  if (last_name.length > 100) {
    errors.push("Last name must be 100 characters or fewer.");
  }

  return {
    errors,
    value: {
      first_name,
      last_name
    }
  };
}

function validateBookPayload(payload) {
  const isbn = normalizeIsbn(payload.isbn);
  const title = trimString(payload.title);
  const author_id = trimString(payload.author_id);
  const publisher = normalizeNullableString(payload.publisher);
  const publication_year =
    payload.publication_year === null ||
    payload.publication_year === undefined ||
    trimString(String(payload.publication_year)) === ""
      ? null
      : Number(payload.publication_year);
  const call_number = normalizeNullableString(payload.call_number);
  const status = trimString(payload.status || "available");
  const format = trimString(payload.format || "physical");
  const access_url = normalizeNullableString(payload.access_url);
  const errors = [];

  if (!isbn) {
    errors.push("ISBN is required.");
  } else if (!isValidIsbn(isbn)) {
    errors.push("ISBN must be a valid ISBN-10 or ISBN-13.");
  }

  if (!title) {
    errors.push("Title is required.");
  }

  if (!author_id) {
    errors.push("Author is required.");
  } else if (!isValidUuid(author_id)) {
    errors.push("Author ID must be a valid UUID.");
  }

  if (publication_year !== null) {
    if (!Number.isInteger(publication_year)) {
      errors.push("Publication year must be a whole number.");
    } else if (publication_year < 1450 || publication_year > new Date().getFullYear() + 1) {
      errors.push("Publication year is outside the supported range.");
    }
  }

  if (!BOOK_STATUS_VALUES.includes(status)) {
    errors.push("Book status must be available, borrowed, or lost.");
  }

  if (!BOOK_FORMAT_VALUES.includes(format)) {
    errors.push("Book format must be physical or digital.");
  }

  if (format === "digital" && !access_url) {
    errors.push("Access URL is required for digital books.");
  }

  if (access_url && !isValidUrl(access_url)) {
    errors.push("Access URL must be a valid http or https URL.");
  }

  return {
    errors,
    value: {
      isbn,
      title,
      author_id,
      publisher,
      publication_year,
      call_number,
      status,
      format,
      access_url: format === "digital" ? access_url : null
    }
  };
}

function validateRentalPayload(payload) {
  const book_id = trimString(payload.book_id);
  const patron_name = trimString(payload.patron_name);
  const checkout_date = trimString(payload.checkout_date);
  const due_date = trimString(payload.due_date);
  const return_date = normalizeNullableString(payload.return_date);
  const status = trimString(payload.status || "checked_out");
  const errors = [];

  if (!book_id) {
    errors.push("Book is required.");
  } else if (!isValidUuid(book_id)) {
    errors.push("Book ID must be a valid UUID.");
  }

  if (!patron_name) {
    errors.push("Patron name is required.");
  } else if (patron_name.length > 120) {
    errors.push("Patron name must be 120 characters or fewer.");
  }

  if (!isValidDateString(checkout_date)) {
    errors.push("Checkout date is required.");
  }

  if (!isValidDateString(due_date)) {
    errors.push("Due date is required.");
  }

  if (return_date && !isValidDateString(return_date)) {
    errors.push("Return date must be a valid date.");
  }

  if (isValidDateString(checkout_date) && isValidDateString(due_date)) {
    if (new Date(due_date) < new Date(checkout_date)) {
      errors.push("Due date cannot be earlier than checkout date.");
    }
  }

  if (return_date && isValidDateString(checkout_date)) {
    if (new Date(return_date) < new Date(checkout_date)) {
      errors.push("Return date cannot be earlier than checkout date.");
    }
  }

  if (!RENTAL_STATUS_VALUES.includes(status)) {
    errors.push("Rental status must be checked_out, returned, or overdue.");
  }

  return {
    errors,
    value: {
      book_id,
      patron_name,
      checkout_date,
      due_date,
      return_date,
      status
    }
  };
}

module.exports = {
  isValidUuid,
  trimString,
  validateAuthorPayload,
  validateBookPayload,
  validateRentalPayload
};
