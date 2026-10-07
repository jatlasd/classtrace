"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

const overviewVideoId = "QKPBxvYxmtc";

export const overviewChapters = [
  {
    start: 10,
    title: "Capture",
    detail: "Mention the student, say what happened, and add a tag or two.",
    thumbnail: "/demo/chapters/capture.webp",
  },
  {
    start: 23,
    title: "What Capture does",
    detail: "Plain, predictable rules suggest the student, the topic, and how it went.",
    thumbnail: "/demo/chapters/draft.webp",
  },
  {
    start: 40,
    title: "Review",
    detail: "Fix anything that’s off. Nothing saves until you say so.",
    thumbnail: "/demo/chapters/review.webp",
  },
  {
    start: 49,
    title: "The record",
    detail: "One sentence at a time, the evidence adds up for every student.",
    thumbnail: "/demo/chapters/record.webp",
  },
  {
    start: 55,
    title: "Explore",
    detail: "Ask a question and get the exact records that match.",
    thumbnail: "/demo/chapters/explore.webp",
  },
  {
    start: 68,
    title: "The lines we hold",
    detail: "You approve every record. One teacher, one workspace. No generative AI.",
    thumbnail: "/demo/chapters/boundaries.webp",
  },
] as const;

export function overviewEmbedUrl(startSeconds: number): string {
  const start = startSeconds > 0 ? `&start=${startSeconds}` : "";
  return `https://www.youtube-nocookie.com/embed/${overviewVideoId}?autoplay=1&rel=0${start}`;
}

function formatTimestamp(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

type Playback = { start: number; request: number };

export function OverviewPlayer() {
  const [playback, setPlayback] = useState<Playback | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!playback) return;
    const smooth = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    screenRef.current?.scrollIntoView({ block: "nearest", behavior: smooth ? "smooth" : "auto" });
    frameRef.current?.focus({ preventScroll: true });
  }, [playback]);

  function play(start: number) {
    setPlayback((current) => ({ start, request: (current?.request ?? 0) + 1 }));
  }

  return (
    <>
      <div
        ref={screenRef}
        className="relative aspect-video scroll-my-24 overflow-hidden rounded-xl bg-night shadow-[0_48px_120px_-48px_rgb(0_0_0/0.9)] ring-1 ring-white/15"
      >
        {playback ? (
          <iframe
            key={playback.request}
            ref={frameRef}
            src={overviewEmbedUrl(playback.start)}
            title="ClassTrace overview video"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => play(0)}
            className="group absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-live-bright"
          >
            <Image
              src="/demo/overview-title.jpg"
              alt=""
              fill
              preload
              sizes="(min-width: 1152px) 1120px, 94vw"
              className="object-cover"
            />
            <span className="absolute inset-x-0 bottom-[7%] flex justify-center sm:bottom-[13%]">
              <span className="inline-flex items-center gap-2.5 rounded-full bg-live-bright py-1.5 pl-1.5 pr-4 text-sm font-semibold text-live-fg shadow-[0_12px_40px_-8px_rgb(255_176_32/0.55)] transition-colors group-hover:bg-[#ffc24d] sm:gap-3 sm:py-2 sm:pl-2 sm:pr-6 sm:text-base">
                <span className="grid size-7 place-items-center rounded-full bg-night text-live-bright sm:size-10">
                  <Play aria-hidden="true" className="ml-0.5 size-3.5 fill-current sm:size-4" />
                </span>
                Watch the overview
                <span className="font-medium tabular-nums text-live-fg/65">1:21</span>
              </span>
            </span>
          </button>
        )}
      </div>

      <section aria-labelledby="chapters-heading" className="mt-10">
        <h2 id="chapters-heading" className="label text-night-fg-2">
          Chapters
        </h2>
        <ol className="mt-4 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
          {overviewChapters.map((chapter) => (
            <li key={chapter.start}>
              <button
                type="button"
                onClick={() => play(chapter.start)}
                className="group block w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-4 focus-visible:ring-offset-night"
              >
                <span className="relative block aspect-video overflow-hidden rounded-md bg-night-2 ring-1 ring-white/15 transition-shadow group-hover:ring-2 group-hover:ring-live-bright">
                  <Image
                    src={chapter.thumbnail}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 180px, (min-width: 640px) 30vw, 45vw"
                    className="object-cover"
                  />
                </span>
                <span className="mt-3 block text-[13px] font-semibold tabular-nums text-live-bright">
                  <span className="sr-only">Play from</span>{" "}
                  {formatTimestamp(chapter.start)}
                </span>
                <span className="mt-0.5 block text-[15px] font-semibold leading-snug text-night-fg">
                  {chapter.title}
                </span>
                <span className="mt-1 block text-pretty text-[13px] leading-snug text-night-fg-2">
                  {chapter.detail}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
