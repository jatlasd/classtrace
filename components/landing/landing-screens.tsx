import Image from "next/image";
import { cn } from "@/lib/utils";

export type Screenshot = { src: string; width: number; height: number };

export const screenshots = {
  studentTrace: { src: "/landing/student-trace.webp", width: 2400, height: 1800 },
  captureComposer: { src: "/landing/capture-composer.webp", width: 1700, height: 550 },
  reviewDraft: { src: "/landing/review-draft.webp", width: 1344, height: 960 },
  evidenceReport: { src: "/landing/evidence-report.webp", width: 1720, height: 1600 },
  exploreQuestion: { src: "/landing/explore-question.webp", width: 2140, height: 1600 },
  mobileCapture: { src: "/landing/mobile-capture.webp", width: 780, height: 1688 },
  mobileReview: { src: "/landing/mobile-review.webp", width: 780, height: 1688 },
  mobileTrace: { src: "/landing/mobile-trace.webp", width: 780, height: 1688 },
} satisfies Record<string, Screenshot>;

type ScreenProps = {
  src: Screenshot;
  alt: string;
  className?: string;
  preload?: boolean;
  sizes: string;
};

export function BrowserScreen({ src, alt, className, preload, sizes, title }: ScreenProps & { title: string }) {
  return (
    <figure className={cn("screen-shadow overflow-hidden rounded-lg bg-plate", className)}>
      <div aria-hidden="true" className="flex h-7 items-center gap-3 border-b border-line bg-well px-4">
        <span className="flex gap-1.5">
          <span className="size-2 rounded-full bg-line-2" />
          <span className="size-2 rounded-full bg-line-2" />
          <span className="size-2 rounded-full bg-line-2" />
        </span>
        <span className="mx-auto hidden truncate rounded-full bg-plate px-4 py-0.5 text-[11px] font-medium text-fg-3 sm:block">
          ClassTrace · {title}
        </span>
        <span className="hidden w-[42px] sm:block" />
      </div>
      <Image {...src} alt={alt} sizes={sizes} preload={preload} className="block h-auto w-full bg-well" />
    </figure>
  );
}

export function PhoneScreen({ src, alt, className, preload, sizes }: ScreenProps) {
  return (
    <figure
      className={cn(
        "screen-shadow overflow-hidden rounded-[1.75rem] border-[5px] border-night bg-night",
        className,
      )}
    >
      <Image
        {...src}
        alt={alt}
        sizes={sizes}
        preload={preload}
        className="block h-auto w-full rounded-[1.4rem]"
      />
    </figure>
  );
}
