export default function Loader({ label = 'Loading...', compact = false, className = '' }) {
  return (
    <div
      className={`panel-soft flex flex-col items-center justify-center gap-4 px-6 text-center ${
        compact ? 'min-h-[120px] py-8' : 'min-h-[180px] py-10'
      } ${className}`}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-brand-gold" />
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{label}</p>
    </div>
  );
}
