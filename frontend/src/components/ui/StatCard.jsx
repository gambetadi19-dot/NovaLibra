export default function StatCard({ label, value, hint }) {
  return (
    <div className="panel relative overflow-hidden p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />
      <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">{label}</p>
      <p className="mt-5 font-display text-5xl leading-none text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{hint}</p>
    </div>
  );
}
