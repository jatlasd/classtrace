"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ScrollMeasurement = () => (() => void) | undefined;

const scrollMeasurements = new Set<ScrollMeasurement>();
let scrollFrame = 0;

function runScrollFrame() {
  scrollFrame = 0;
  const writes: (() => void)[] = [];

  scrollMeasurements.forEach((measure) => {
    const write = measure();
    if (write) writes.push(write);
  });

  writes.forEach((write) => write());
}

function scheduleScrollFrame() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(runScrollFrame);
}

export function subscribeToScrollFrame(measure: ScrollMeasurement) {
  scrollMeasurements.add(measure);

  if (scrollMeasurements.size === 1) {
    window.addEventListener("scroll", scheduleScrollFrame, { passive: true });
    window.addEventListener("resize", scheduleScrollFrame);
  }

  scheduleScrollFrame();

  return () => {
    scrollMeasurements.delete(measure);
    if (scrollMeasurements.size > 0) return;

    if (scrollFrame) {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    }
    window.removeEventListener("scroll", scheduleScrollFrame);
    window.removeEventListener("resize", scheduleScrollFrame);
  };
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  from = "translate-y-8",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: string;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={nodeRef}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        shown ? "opacity-100 translate-y-0 scale-100" : `opacity-0 ${from}`
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function ParallaxDrift({
  children,
  className = "",
  depth = 24,
}: {
  children: ReactNode;
  className?: string;
  depth?: number;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    return subscribeToScrollFrame(() => {
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewport) return;
      const center = rect.top + rect.height / 2;
      const ratio = (center - viewport / 2) / viewport;
      const transform = `translateY(${(ratio * depth).toFixed(1)}px)`;

      return () => {
        node.style.transform = transform;
      };
    });
  }, [depth]);

  return (
    <div ref={nodeRef} className={className}>
      {children}
    </div>
  );
}
