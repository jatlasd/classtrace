export function CoffeeRing({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none block rounded-full border-[5px] border-primary/12 ${className}`}
    >
      <span className="absolute inset-1 rounded-full border-2 border-primary/8" />
    </span>
  );
}

export function TapeStrip({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`tape-tab pointer-events-none absolute h-5 w-16 rounded-[2px] ${className}`}
    />
  );
}

export function IndexCard({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative w-52 rounded-sm border border-border/70 bg-card px-4 pb-4 pt-3 shadow-paper ${className}`}
    >
      <TapeStrip className="-top-2.5 left-1/2 -translate-x-1/2 rotate-2" />
      <p className="font-hand border-b border-destructive/25 pb-1 text-lg leading-snug text-foreground/85">
        before I forget —
      </p>
      <ul className="font-hand mt-1.5 space-y-0.5 text-base leading-snug text-foreground/70">
        <li>
          <span className="text-validated-foreground">✓</span> jeremy — reading
          conf.
        </li>
        <li>
          <span className="text-validated-foreground">✓</span> stacy — math
          transition!!
        </li>
        <li className="text-foreground/45">mary — check tues</li>
      </ul>
    </div>
  );
}

export function StickyScrap({
  className = "",
  color = "bg-audience-gold",
  children,
}: {
  className?: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative w-40 px-4 pb-4 pt-3 shadow-paper ${color} ${className}`}
    >
      <p className="font-hand text-lg leading-snug text-foreground/85">
        {children}
      </p>
    </div>
  );
}
