export default function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-white/55">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="font-display text-4xl font-semibold text-white">{value}</p>
        <div className={`h-12 w-12 rounded-2xl ${accent}`} />
      </div>
    </div>
  );
}

