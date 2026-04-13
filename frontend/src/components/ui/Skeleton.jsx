export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-white/8 ${className}`} aria-hidden="true" />;
}

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`panel overflow-hidden p-0 ${className}`} aria-hidden="true">
      <SkeletonBlock className="h-72 w-full rounded-none" />
      <div className="space-y-4 p-6">
        <SkeletonBlock className="h-8 w-2/3" />
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonBlock key={index} className={`h-4 ${index === lines - 1 ? 'w-3/5' : 'w-full'}`} />
        ))}
        <div className="flex gap-3 pt-2">
          <SkeletonBlock className="h-12 w-32" />
          <SkeletonBlock className="h-12 w-24" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="panel-soft p-5">
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="mt-4 h-6 w-2/3" />
          <div className="mt-4 space-y-3">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
            <SkeletonBlock className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
