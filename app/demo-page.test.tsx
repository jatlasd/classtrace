// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DemoPage, { metadata } from "@/app/demo/page";

describe("public overview page", () => {
  const page = document.createElement("div");
  page.innerHTML = renderToStaticMarkup(<DemoPage />);
  const text = page.textContent ?? "";

  it("leads with the video behind a click-to-play poster", () => {
    expect(page.querySelector("main#main-content")).not.toBeNull();
    expect(page.querySelector("h1")?.textContent).toBe("Meet ClassTrace.");
    expect(page.querySelector("main button")?.textContent).toMatch(
      /watch the overview/i,
    );
    expect(page.querySelector("iframe")).toBeNull();
    expect(text).not.toMatch(/youtube/i);
  });

  it("lists the chapters and the full narration", () => {
    const chapters = Array.from(
      page.querySelectorAll("#chapters-heading + ol > li"),
    ).map((chapter) => chapter.textContent);
    expect(chapters).toHaveLength(6);
    expect(chapters[2]).toMatch(/^Play from 0:40Review/);

    const transcript = page.querySelector("details");
    expect(transcript?.querySelector("summary")?.textContent).toBe(
      "Read the transcript",
    );
    expect(transcript?.textContent).toMatch(
      /^Read the transcriptClassTrace\. Write one sentence about one student\./,
    );
    expect(transcript?.textContent).toMatch(
      /Write one sentence\. Keep the whole story\.$/,
    );
  });

  it("shares with the title card as its preview image", () => {
    expect(text).toMatch(/nothing saves until you say so/i);
    expect(text).toMatch(/no generative AI/i);
    expect(metadata.openGraph?.images).toEqual([
      { url: "/demo/overview-title.jpg", width: 1920, height: 1080 },
    ]);
  });
});
