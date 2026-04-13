import { Link } from 'react-router-dom';

const sizeMap = {
  sm: {
    shell: 'h-12 w-12 rounded-2xl',
    image: 'h-8 w-8',
    eyebrow: 'text-[9px] tracking-[0.34em]',
    title: 'text-[1.45rem]'
  },
  md: {
    shell: 'h-14 w-14 rounded-[22px]',
    image: 'h-10 w-10',
    eyebrow: 'text-[10px] tracking-[0.38em]',
    title: 'text-[1.82rem]'
  },
  lg: {
    shell: 'h-16 w-16 rounded-[26px]',
    image: 'h-11 w-11',
    eyebrow: 'text-[10px] tracking-[0.42em]',
    title: 'text-[2rem]'
  }
};

export default function BrandLockup({
  to = '/',
  size = 'md',
  showTagline = true,
  className = '',
  titleClassName = '',
  taglineClassName = ''
}) {
  const classes = sizeMap[size] || sizeMap.md;

  return (
    <Link to={to} className={`group inline-flex items-center gap-4 ${className}`}>
      <span
        className={`brand-logo-shell ${classes.shell} relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-brand-gold/20 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.16),transparent_38%),linear-gradient(145deg,rgba(14,22,38,0.96),rgba(9,15,27,0.88))] shadow-[0_18px_45px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.02)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_22px_55px_rgba(0,0,0,0.34),0_0_24px_rgba(214,174,98,0.16)]`}
      >
        <span className="absolute inset-[1px] rounded-[inherit] border border-white/6" />
        <span className="absolute inset-x-2 top-0 h-10 rounded-full bg-brand-gold/18 blur-2xl" />
        <img src="/logo-v2.png" alt="NovaLibra logo" className={`brand-logo-mark ${classes.image} relative z-10 object-contain drop-shadow-[0_8px_24px_rgba(214,174,98,0.16)]`} />
      </span>

      <span className="flex min-w-0 flex-col">
        {showTagline ? (
          <span className={`eyebrow ${classes.eyebrow} text-brand-gold/90 ${taglineClassName}`}>NovaLibra Platform</span>
        ) : null}
        <span className={`font-display leading-none text-white transition duration-300 group-hover:text-brand-cream ${classes.title} ${titleClassName}`}>NovaLibra</span>
      </span>
    </Link>
  );
}
