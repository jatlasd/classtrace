export default function AppLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[1180px] px-4 py-7 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
    >
      <div className="h-5 w-28 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-8 w-full max-w-md animate-pulse rounded bg-muted" />
      <div className="mt-8 space-y-3" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-card bg-card" />
        <div className="h-40 animate-pulse rounded-card bg-card" />
      </div>
      <span className="sr-only">Loading ClassTrace…</span>
    </div>
  );
}
