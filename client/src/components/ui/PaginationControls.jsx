function PaginationControls({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) {
    return null;
  }

  const pages = [];

  for (let pageNumber = 1; pageNumber <= meta.totalPages; pageNumber += 1) {
    pages.push(pageNumber);
  }

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Page {meta.page} of {meta.totalPages} - {meta.totalItems} total records
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Previous
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={[
              "rounded-2xl px-4 py-2 text-sm font-medium",
              pageNumber === meta.page
                ? "bg-teal-700 text-white"
                : "bg-white text-slate-700"
            ].join(" ")}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PaginationControls;
