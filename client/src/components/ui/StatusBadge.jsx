const toneMap = {
  available: "bg-emerald-100 text-emerald-700",
  borrowed: "bg-amber-100 text-amber-700",
  lost: "bg-rosewood/10 text-rosewood",
  checked_out: "bg-amber-100 text-amber-700",
  returned: "bg-emerald-100 text-emerald-700",
  overdue: "bg-rosewood/10 text-rosewood"
};

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        toneMap[value] || "bg-slate-100 text-slate-700"
      }`}
    >
      {String(value || "unknown").replace("_", " ")}
    </span>
  );
}

export default StatusBadge;
