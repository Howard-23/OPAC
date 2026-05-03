const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function toPositiveInteger(value, fallback) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

function parsePagination(query = {}) {
  const all = String(query.all || "").toLowerCase() === "true";
  const page = toPositiveInteger(query.page, DEFAULT_PAGE);
  const requestedPageSize = toPositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE);
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);

  return {
    all,
    page,
    pageSize,
    limit: pageSize,
    offset: (page - 1) * pageSize
  };
}

function buildPaginationMeta({ totalItems, page, pageSize }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return {
    page,
    pageSize,
    totalItems,
    totalPages
  };
}

module.exports = {
  buildPaginationMeta,
  parsePagination
};
