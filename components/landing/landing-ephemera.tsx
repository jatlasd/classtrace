import Image from "next/image";

type CoffeeRingVariant = "full" | "broken" | "arc" | "ghost";

const coffeeRingImageClasses: Record<CoffeeRingVariant, string> = {
  full: "opacity-[0.28]",
  broken:
    "opacity-[0.3] [mask-image:conic-gradient(from_24deg,#000_0deg,#000_226deg,transparent_252deg,transparent_326deg,#000_360deg)]",
  arc: "scale-y-[0.82] opacity-25 [mask-image:conic-gradient(from_-38deg,#000_0deg,#000_172deg,transparent_204deg,transparent_338deg,#000_360deg)]",
  ghost:
    "scale-x-[1.08] scale-y-[0.72] opacity-[0.16] [mask-image:conic-gradient(from_12deg,#000_0deg,#000_282deg,transparent_316deg,transparent_352deg,#000_360deg)]",
};

export function CoffeeRing({
  className = "",
  variant = "full",
}: {
  className?: string;
  variant?: CoffeeRingVariant;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none block ${className}`}
    >
      <Image
        src="/svg/coffeering.svg"
        alt=""
        fill
        sizes="96px"
        className={`object-contain ${coffeeRingImageClasses[variant]}`}
      />
      {variant === "broken" ? (
        <>
          <span className="absolute right-[4%] top-[4%] size-[7%] rounded-full bg-audience-gold/30" />
          <span className="absolute right-[13%] top-[-3%] size-[3%] rounded-full bg-audience-gold/25" />
        </>
      ) : null}
      {variant === "arc" ? (
        <span className="absolute bottom-[13%] left-[4%] size-[5%] rounded-full bg-audience-gold/25" />
      ) : null}
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
