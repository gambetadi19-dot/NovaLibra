export default function Alert({ tone = 'info', message, className = '' }) {
  if (!message) {
    return null;
  }

  const tones = {
    info: 'border-sky-400/20 bg-[linear-gradient(135deg,rgba(56,189,248,0.14),rgba(14,22,38,0.4))] text-sky-100',
    success: 'border-emerald-400/20 bg-[linear-gradient(135deg,rgba(52,211,153,0.14),rgba(14,22,38,0.4))] text-emerald-100',
    error: 'border-rose-400/20 bg-[linear-gradient(135deg,rgba(251,113,133,0.14),rgba(22,11,18,0.42))] text-rose-100'
  };

  return (
    <div className={`rounded-[24px] border px-4 py-3 text-sm leading-6 shadow-[0_18px_45px_rgba(0,0,0,0.16)] backdrop-blur-xl ${tones[tone]} ${className}`} role="status">
      {message}
    </div>
  );
}
