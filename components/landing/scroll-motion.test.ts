// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { subscribeToScrollFrame } from "./scroll-motion";

describe("subscribeToScrollFrame", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shares listeners and batches every read before its writes", () => {
    let scheduledFrame: FrameRequestCallback | undefined;
    const addListener = vi.spyOn(window, "addEventListener");
    const removeListener = vi.spyOn(window, "removeEventListener");
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      scheduledFrame = callback;
      return 1;
    });

    const order: string[] = [];
    const unsubscribeFirst = subscribeToScrollFrame(() => {
      order.push("read first");
      return () => order.push("write first");
    });
    const unsubscribeSecond = subscribeToScrollFrame(() => {
      order.push("read second");
      return () => order.push("write second");
    });

    expect(
      addListener.mock.calls.filter(([event]) => event === "scroll")
    ).toHaveLength(1);
    expect(
      addListener.mock.calls.filter(([event]) => event === "resize")
    ).toHaveLength(1);

    scheduledFrame?.(0);

    expect(order).toEqual([
      "read first",
      "read second",
      "write first",
      "write second",
    ]);

    unsubscribeFirst();
    unsubscribeSecond();

    expect(
      removeListener.mock.calls.filter(([event]) => event === "scroll")
    ).toHaveLength(1);
    expect(
      removeListener.mock.calls.filter(([event]) => event === "resize")
    ).toHaveLength(1);
  });
});
