export default function MenuSkeleton() {
  return (
    <div className="grid gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="h-48 bg-latte" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-2/3 rounded bg-latte" />
            <div className="h-3 w-full rounded bg-latte/70" />
          </div>
        </div>
      ))}
    </div>
  );
}