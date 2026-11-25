import { describe, expect, it } from "vitest";
import { distanceMiles, formatMiles } from "../../lib/geo";
import {
  formatCents,
  formatMoney,
  titleCase,
  typeLabel,
} from "../../lib/format";
import { safeRedirect } from "../../lib/redirect";

describe("safeRedirect", () => {
  it("allows pages on this site", () => {
    expect(safeRedirect("/vehicles")).toBe("/vehicles");
    expect(safeRedirect("/vehicles/3/book?start=2026-12-01T10:00")).toBe(
      "/vehicles/3/book?start=2026-12-01T10:00",
    );
  });

  it("falls back to the home page for anything else", () => {
    for (const bad of [
      undefined,
      "",
      "https://evil.example.com",
      "//evil.example.com",
      "/\\evil.example.com",
      "vehicles",
      "javascript:alert(1)",
    ]) {
      expect(safeRedirect(bad)).toBe("/");
    }
  });
});

describe("distanceMiles", () => {
  const seaTac = { latitude: 47.4435, longitude: -122.3017 };
  const downtown = { latitude: 47.6094, longitude: -122.333 };

  it("is zero between the same point", () => {
    expect(distanceMiles(seaTac, seaTac)).toBe(0);
  });

  it("is about 11.5 miles from Sea-Tac to downtown Seattle", () => {
    const miles = distanceMiles(seaTac, downtown);
    expect(miles).toBeGreaterThan(11);
    expect(miles).toBeLessThan(12);
  });

  it("is the same in both directions", () => {
    expect(distanceMiles(seaTac, downtown)).toBeCloseTo(
      distanceMiles(downtown, seaTac),
      10,
    );
  });
});

describe("formatMiles", () => {
  it("shows one decimal under 10 miles and whole miles above", () => {
    expect(formatMiles(0.234)).toBe("0.2 mi");
    expect(formatMiles(3.14159)).toBe("3.1 mi");
    expect(formatMiles(12.6)).toBe("13 mi");
  });
});

describe("price and label formatting", () => {
  it("formatCents drops .00 but keeps real cents", () => {
    expect(formatCents(5200)).toBe("$52");
    expect(formatCents(5250)).toBe("$52.50");
  });

  it("formatMoney always shows two decimals", () => {
    expect(formatMoney(5200)).toBe("$52.00");
    expect(formatMoney(32031)).toBe("$320.31");
  });

  it("labels vehicle types and values", () => {
    expect(typeLabel("EV")).toBe("EV");
    expect(typeLabel("SUV")).toBe("SUV");
    expect(typeLabel("SEDAN")).toBe("Sedan");
    expect(typeLabel("UNKNOWN")).toBe("UNKNOWN");
    expect(titleCase("AUTOMATIC")).toBe("Automatic");
  });
});