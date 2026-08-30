import { describe, expect, it } from "vitest";
import {
  getAppRouteLabel,
  isAppNavigationItemActive,
} from "./app-navigation";

describe("app navigation state", () => {
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
  });

  it("provides compact contextual route labels", () => {
    expect(getAppRouteLabel("/app/feed")).toBe("Feed");
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
