import { describe, expect, it } from "vitest";
import { checkAge, latestAdultBirthDate, todayInRome } from "@/lib/age";

// 5 Nov 2026, 10:00 in Rome (CET = UTC+1).
const NOW = new Date("2026-11-05T09:00:00Z");

describe("checkAge", () => {
  it("is adult on the 18th birthday and underage the day before", () => {
    expect(checkAge("2008-11-05", NOW)).toBe("adult");
    expect(checkAge("2008-11-06", NOW)).toBe("underage");
    expect(checkAge("1990-01-01", NOW)).toBe("adult");
  });

  it("uses the calendar date in Rome, not UTC", () => {
    // 23:30 UTC on 4 Nov is already 00:30 on 5 Nov in Rome: the 18th birthday has started.
    const lateUtc = new Date("2026-11-04T23:30:00Z");
    expect(todayInRome(lateUtc)).toEqual({ year: 2026, month: 11, day: 5 });
    expect(checkAge("2008-11-05", lateUtc)).toBe("adult");
  });

  it("treats 29 February birthdays as 1 March in common years", () => {
    // Born 29 Feb 2008: turns 18 in 2026 (not a leap year) on 1 March.
    expect(checkAge("2008-02-29", new Date("2026-02-28T12:00:00Z"))).toBe("underage");
    expect(checkAge("2008-02-29", new Date("2026-03-01T12:00:00Z"))).toBe("adult");
  });

  it.each([
    ["impossible date", "2007-02-30"],
    ["wrong format", "05/11/1990"],
    ["empty", ""],
    ["text", "ieri"],
    ["future date", "2030-01-01"],
    ["implausible age", "1890-01-01"],
    ["month 13", "1990-13-01"],
  ])("rejects %s as invalid", (_label, value) => {
    expect(checkAge(value, NOW)).toBe("invalid");
  });

  it("supports a different minimum age", () => {
    expect(checkAge("2010-11-05", NOW, 16)).toBe("adult");
  });
});

describe("latestAdultBirthDate", () => {
  it("is today minus 18 years", () => {
    expect(latestAdultBirthDate(NOW)).toBe("2008-11-05");
  });

  it("falls back to 28 Feb when today is 29 Feb", () => {
    expect(latestAdultBirthDate(new Date("2028-02-29T12:00:00Z"))).toBe("2010-02-28");
  });
});
