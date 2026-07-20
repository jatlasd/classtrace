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
      className={`pointer-events-none absolute h-6 w-20 ${className}`}
    >
      <Image
        src="/svg/landing/tape-strip.svg?v=2"
        alt=""
        fill
        sizes="80px"
        className="object-fill"
      />
    </span>
  );
}

export function IndexCard({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative isolate min-h-40 w-56 px-6 pb-6 pt-5 ${className}`}
    >
      <Image
        src="/svg/landing/index-card-paper.svg?v=2"
        alt=""
        fill
        sizes="224px"
        className="-z-10 object-fill"
      />
      <TapeStrip className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
      <p className="font-hand border-b border-destructive/25 pb-1 pl-2 text-lg leading-snug text-foreground/85">
        before I forget —
      </p>
      <ul className="font-hand mt-1.5 space-y-0.5 pl-2 text-[15px] leading-snug text-foreground/70">
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
  variant = "blue",
  children,
}: {
  className?: string;
  variant?: "blue" | "rose";
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative isolate min-h-32 w-44 px-5 pb-6 pt-5 ${className}`}
    >
      <Image
        src={`/svg/landing/sticky-${variant}-paper.svg?v=2`}
        alt=""
        fill
        sizes="176px"
        className="-z-10 object-fill"
      />
      <p className="font-hand relative break-words text-base leading-[1.2] text-foreground/85">
        {children}
      </p>
    </div>
  );
}
