export default function SectionHeading({ eyebrow, title, copy, align = 'left' }) {
  return (
    <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <p className="eyebrow drop-shadow-[0_6px_18px_rgba(214,174,98,0.12)]">{eyebrow}</p>
      <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">{title}</h2>
      {copy ? <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{copy}</p> : null}
    </div>
  );
}
