export function EvidenceFeedHeader() {
  return <h1 className="sr-only">Capture</h1>;
}

export function RecentCapturesLabel() {
  return (
    <h2
      id="evidence-inbox-heading"
      tabIndex={-1}
      className="font-display text-[1.75rem] font-semibold leading-none text-fg outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
    >
      Saved evidence
    </h2>
  );
}
