import BrandLockup from './BrandLockup';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/10 py-8">
      <div className="container-shell flex flex-col gap-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <BrandLockup size="sm" titleClassName="text-[1.6rem]" />
          <p className="mt-3 leading-7 text-slate-400">A premium literary platform for discovery, publishing presence, and community.</p>
        </div>
        <p className="max-w-md leading-6 md:text-right">Built as a scalable platform foundation with React, Express, Prisma, MySQL, JWT, and Socket.IO.</p>
      </div>
    </footer>
  );
}
