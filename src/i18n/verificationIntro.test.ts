import i18next from "i18next";
import { describe, expect, it } from "vitest";
import "./index.ts";

describe("verification email copy", () => {
  it.each([
    ["en", "We sent a verification link to"],
    ["sv", "Vi skickade en verifieringslänk till"],
  ])("inserts the user's email in %s", (lng, intro) => {
    const email = "traveler@example.com";
    expect(i18next.t("auth.verificationIntro", { lng, email })).toContain(`${intro} ${email}.`);
  });
});
