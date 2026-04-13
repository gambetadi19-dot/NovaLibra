export default function Input({
  label,
  textarea = false,
  className = '',
  error = '',
  hint = '',
  required = false,
  id,
  ...props
}) {
  const Component = textarea ? 'textarea' : 'input';
  const inputId = id || label?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <label className="block space-y-2">
      <span className="text-xs font-bold uppercase tracking-[0.28em] text-brand-sand/90">
        {label}
        {required ? <span className="ml-1 text-rose-300">*</span> : null}
      </span>
      <Component
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`w-full rounded-[24px] border bg-[linear-gradient(180deg,rgba(15,22,41,0.92),rgba(10,15,27,0.94))] px-4 py-3.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_38px_rgba(0,0,0,0.16)] transition duration-300 placeholder:text-slate-500 focus:bg-brand-900 ${
          textarea ? 'resize-y' : ''
        } ${error ? 'border-rose-400/60 focus:border-rose-300' : 'border-white/10 focus:border-brand-gold'} ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-rose-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </label>
  );
}
