export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  as: Component = 'button',
  ...props
}) {
  const variants = {
    primary:
      'border border-brand-gold/20 bg-brand-gold text-brand-950 shadow-[0_18px_40px_rgba(214,174,98,0.22)] hover:-translate-y-0.5 hover:bg-[#e6c488] disabled:hover:translate-y-0',
    secondary:
      'border border-white/12 bg-white/[0.05] text-white hover:-translate-y-0.5 hover:bg-white/[0.09] disabled:hover:translate-y-0',
    ghost: 'border border-transparent text-brand-sand hover:bg-white/[0.05]',
    danger:
      'border border-rose-400/20 bg-rose-400/10 text-rose-200 hover:-translate-y-0.5 hover:bg-rose-400/15 disabled:hover:translate-y-0'
  };
  const sizes = {
    sm: 'min-h-10 px-4 py-2 text-sm',
    md: 'min-h-12 px-5 py-3 text-sm',
    lg: 'min-h-14 px-6 py-3.5 text-base'
  };

  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
