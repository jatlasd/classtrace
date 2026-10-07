import Image from "next/image";
import { cn } from "@/lib/utils";

export type Screenshot = { src: string; width: number; height: number; blurDataURL: string };

export const screenshots = {
  studentTrace: {
    src: "/landing/student-trace.webp",
    width: 2400,
    height: 1800,
    blurDataURL:
      "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACwAQCdASoKAAgAA4BaJZwAAxf/TCQAAP73EYCc40YyhsUMGcCAAA==",
  },
  captureComposer: {
    src: "/landing/capture-composer.webp",
    width: 1700,
    height: 550,
    blurDataURL:
      "data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAABwAQCdASoKAAMAA4BaJZgC7AGIQAD+850Px2o/pZwnunJ9FgunQ8AAAAA=",
  },
  reviewDraft: {
    src: "/landing/review-draft.webp",
    width: 1344,
    height: 960,
    blurDataURL:
      "data:image/webp;base64,UklGRjQAAABXRUJQVlA4ICgAAACQAQCdASoKAAcAA4BaJaQAAvekt5AA/vf1kqyskDKDtYogpywUAAAA",
  },
  evidenceReport: {
    src: "/landing/evidence-report.webp",
    width: 1720,
    height: 1600,
    blurDataURL:
      "data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAAAwAQCdASoKAAkAA4BaJZwAA3AA/vQMjOZ7wd6xdIAEAA==",
  },
  exploreQuestion: {
    src: "/landing/explore-question.webp",
    width: 2140,
    height: 1600,
    blurDataURL:
      "data:image/webp;base64,UklGRi4AAABXRUJQVlA4ICIAAAAwAQCdASoKAAcAA4BaJZwAA3AA/vRJdvZAaUpomODNAgAA",
  },
  mobileCapture: {
    src: "/landing/mobile-capture.webp",
    width: 780,
    height: 1688,
    blurDataURL:
      "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADQAwCdASoKABYAPu1iqU2ppaOiMAgBMB2JZQDImCHe33fG/Q3bGAAA/u/kNuLWWMRLySUg/7GKb5DRfEPZCSki2o/kKXk2Ac3nzaKkkM7GCAAA",
  },
  mobileReview: {
    src: "/landing/mobile-review.webp",
    width: 780,
    height: 1688,
    blurDataURL:
      "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAADQAwCdASoKABYAPu1qrU8ppiQiMAgBMB2JaQABHvEjvTJNrQl9iWAA/vOvziMlVUTA25kj3xbc7NqvtKkAwH0+Ry6imy7jrtc0ePWnYhJn/wvh0sAAAA==",
  },
  mobileTrace: {
    src: "/landing/mobile-trace.webp",
    width: 780,
    height: 1688,
    blurDataURL:
      "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADQAwCdASoKABYAPu1iqU2ppaOiMAgBMB2JZQDE2CHcfi2TdCf6QgAA/u2MqMGJlsYsBBolk1J/zHvgxjPQsKJ/ZfB2rHdopdNXpuqYWYwZU9YAAAA=",
  },
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
      <Image {...src} alt={alt} sizes={sizes} preload={preload} placeholder="blur" className="block h-auto w-full bg-well" />
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
        placeholder="blur"
        className="block h-auto w-full rounded-[1.4rem]"
      />
    </figure>
  );
}
