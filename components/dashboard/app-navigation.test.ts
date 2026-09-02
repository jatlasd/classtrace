import { describe, expect, it } from "vitest";
import {
  APP_NAVIGATION_ITEMS,
  getAppRouteLabel,
  isAppNavigationItemActive,
} from "./app-navigation";

describe("app navigation state", () => {
  it("keeps Capture first and places Explore before Students", () => {
    expect(APP_NAVIGATION_ITEMS.map((item) => item.label)).toEqual([
      "Capture",
      "Explore",
      "Students",
      "Settings",
    ]);
  });

  it("keeps student timelines and reports under Students", () => {
    expect(isAppNavigationItemActive("/app/roster", "students")).toBe(true);
    expect(isAppNavigationItemActive("/app/students/student_1", "students")).toBe(
      true
    );
    expect(
      isAppNavigationItemActive(
        "/app/students/student_1/report",
        "students"
      )
    ).toBe(true);
    expect(isAppNavigationItemActive("/app/feed", "students")).toBe(false);
    expect(isAppNavigationItemActive("/app/explore", "explore")).toBe(true);
    expect(isAppNavigationItemActive("/app/feed", "explore")).toBe(false);
  });

  it("provides compact contextual route labels", () => {
    expect(getAppRouteLabel("/app/feed")).toBe("Feed");
    expect(getAppRouteLabel("/app/explore")).toBe("Explore");
    expect(getAppRouteLabel("/app/roster")).toBe("Students");
    expect(getAppRouteLabel("/app/students/student_1")).toBe(
      "Student timeline"
    );
    expect(getAppRouteLabel("/app/students/student_1/report")).toBe(
      "Student report"
    );
    expect(getAppRouteLabel("/app/settings")).toBe("Settings");
  });
});
