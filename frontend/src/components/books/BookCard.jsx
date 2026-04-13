import { ArrowUpRight, Heart, MessageCircleMore, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function BookCard({ book, onFavorite }) {
  return (
    <article className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] shadow-[0_26px_80px_rgba(0,0,0,0.24)] transition duration-500 hover:-translate-y-2 hover:border-white/14 hover:shadow-[0_34px_95px_rgba(0,0,0,0.34)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_38%)] opacity-90 transition duration-500 group-hover:opacity-100" />
      <div
        className="relative h-[22rem] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(6,8,22,0.02), rgba(6,8,22,0.35) 42%, rgba(6,8,22,0.92) 100%), url(${book.coverImage})`
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_25%_100%,rgba(168,85,247,0.18),transparent_28%)] opacity-80" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
          <div className="flex flex-wrap gap-2">
            {book.isFeatured ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/15 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-brand-sand backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Featured title
              </span>
            ) : null}
            {book.genre ? (
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-brand-sand backdrop-blur-md">
                {book.genre}
              </span>
            ) : null}
          </div>
        </div>
        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
          <div className="max-w-[14rem] rounded-[24px] border border-white/10 bg-black/25 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-brand-gold">Editorial pick</p>
            <p className="mt-2 text-sm leading-6 text-slate-100">{book.shortDescription}</p>
          </div>
          {book.averageRating ? (
            <div className="rounded-[20px] border border-white/10 bg-black/25 px-4 py-3 text-right shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="flex items-center justify-end gap-1 text-brand-gold">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className={`h-3.5 w-3.5 ${index < Math.round(book.averageRating) ? 'fill-current' : ''}`} />
                ))}
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-300">{book.averageRating}/5 rating</p>
            </div>
          ) : null}
        </div>
      </div>
      <div className="relative space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-[2rem] leading-tight text-white">{book.title}</h3>
            <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
              <span>Platform catalog</span>
              {book.category ? <span>{book.category}</span> : null}
            </div>
            {book.author?.name && book.author.role === 'AUTHOR' ? (
              <Link to={`/authors/${book.author.id}`} className="mt-2 inline-block text-sm text-slate-400 hover:text-brand-gold">
                By {book.author.name}
              </Link>
            ) : book.author?.name ? (
              <p className="mt-2 text-sm text-slate-400">By {book.author.name}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onFavorite?.(book.id)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${book.isFavorited ? 'border-brand-gold/40 bg-brand-gold/15 text-brand-gold shadow-[0_12px_30px_rgba(214,174,98,0.18)]' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/[0.08]'}`}
          >
            <Heart className="h-4 w-4" fill={book.isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>
        <p className="text-sm leading-7 text-slate-300">{book.shortDescription}</p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
          {book.genre ? <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{book.genre}</span> : null}
          {book.category ? <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{book.category}</span> : null}
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{book._count?.favorites || 0} saves</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <MessageCircleMore className="h-4 w-4" />
            {book._count?.comments || 0}
          </span>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button as={Link} to={`/books/${book.slug}`} className="rounded-[18px] bg-[linear-gradient(135deg,#5a2cff_0%,#8c4bff_42%,#d561da_100%)] text-white shadow-[0_18px_35px_rgba(124,58,237,0.28)]">
            View details
            <ArrowUpRight className="h-4 w-4" />
          </Button>
          <Button as="a" href={book.amazonUrl} target="_blank" rel="noreferrer" variant="secondary" className="rounded-[18px] border-white/12 bg-brand-900/55">
            Amazon
          </Button>
        </div>
      </div>
    </article>
  );
}
