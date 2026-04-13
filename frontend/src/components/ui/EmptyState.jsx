export default function EmptyState({ title, copy, icon = null, action = null, className = '' }) {
  return (
    <div className={`panel-soft subtle-grid relative overflow-hidden px-6 py-12 text-center ${className}`}>
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_68%)]" />
      <div className="mx-auto max-w-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] border border-brand-gold/20 bg-brand-gold/10 text-brand-gold shadow-[0_16px_35px_rgba(214,174,98,0.12)]">
          {icon}
        </div>
        <h3 className="font-display text-3xl text-white">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p>
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}
