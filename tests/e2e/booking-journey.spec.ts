import { expect, test } from "@playwright/test";
import { todayInSeattle } from "../../lib/dates";

// Dates 90 days ahead, so they are never in the past and never clash with demo bookings.
function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
const startDay = addDays(todayInSeattle(), 90);
const START = `${startDay}T10:00`;
const END = `${addDays(startDay, 3)}T10:00`;

const PASSWORD = "RainCity-E2E-2026!";

test("a renter can sign up, search, book, view and cancel a booking", async ({
  page,
}) => {
  const email = `e2e.${Date.now()}@example.com`;
  let reference = "";

  await test.step("sign up", async () => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign up" }).click();
    await page.getByLabel("Full name").fill("E2E Tester");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password (at least 8 characters)").fill(PASSWORD);
    await page.getByLabel("Confirm password").fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Hi, E2E")).toBeVisible();
  });

  await test.step("a renter cannot open the company dashboard", async () => {
    await page.goto("/company/vehicles");
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
    await page.goto("/");
  });

  await test.step("search by date from the home page", async () => {
    await page.locator('input[name="start"]').fill(START);
    await page.locator('input[name="end"]').fill(END);
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/vehicles\?/);
    await expect(page.getByText(/Vehicles free from/)).toBeVisible();

    const rav4 = page.locator("article", { hasText: "Toyota RAV4" });
    await expect(rav4).toContainText("$320.31 total for 3 days");
  });

  await test.step("open the vehicle and check the price breakdown", async () => {
    const rav4 = page.locator("article", { hasText: "Toyota RAV4" });
    await rav4.getByRole("link", { name: "View" }).click();
    await expect(page.getByRole("status").first()).toContainText("Available");
    await expect(page.getByText("Estimated total")).toBeVisible();
    await expect(page.getByText("$320.31").first()).toBeVisible();
  });

  await test.step("review and confirm the booking", async () => {
    await page.getByRole("link", { name: "Book now" }).click();
    await expect(
      page.getByRole("heading", { name: "Review and confirm" }),
    ).toBeVisible();
    await expect(page.getByText("$320.31").first()).toBeVisible();
    await page.getByLabel(/I agree to the terms/).check();
    await page.getByRole("button", { name: "Confirm booking" }).click();

    await expect(
      page.getByRole("heading", { name: "Booking confirmed" }),
    ).toBeVisible();
    const referenceText = page.getByText(/^RCR-[A-F0-9]{6}$/);
    await expect(referenceText).toBeVisible();
    reference = (await referenceText.textContent()) ?? "";
    expect(reference).toMatch(/^RCR-[A-F0-9]{6}$/);
    await expect(page.getByText("$320.31").first()).toBeVisible();
  });

  await test.step("the booked vehicle is no longer offered for those dates", async () => {
    await page.goto(
      `/vehicles?start=${encodeURIComponent(START)}&end=${encodeURIComponent(END)}`,
    );
    await expect(page.getByText(/Vehicles free from/)).toBeVisible();
    await expect(
      page.locator("article", { hasText: "Toyota RAV4" }),
    ).toHaveCount(0);
  });

  await test.step("the booking appears under My bookings", async () => {
    await page.getByRole("link", { name: "My bookings" }).click();
    await expect(
      page.getByRole("heading", { name: "My bookings" }),
    ).toBeVisible();
    const booking = page.locator("article", { hasText: reference });
    await expect(booking).toContainText("Upcoming");
    await expect(booking).toContainText("$320.31 total");
  });

  await test.step("cancel the booking", async () => {
    const booking = page.locator("article", { hasText: reference });
    await booking.getByRole("link", { name: "Cancel" }).click();
    await expect(
      page.getByRole("heading", { name: "Cancel this booking?" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Yes, cancel booking" }).click();

    await expect(
      page.getByText(`Your booking ${reference} was cancelled.`),
    ).toBeVisible();
    await expect(
      page.locator("article", { hasText: reference }),
    ).toContainText("Cancelled");
  });

  await test.step("the vehicle is free again", async () => {
    await page.goto(
      `/vehicles?start=${encodeURIComponent(START)}&end=${encodeURIComponent(END)}`,
    );
    await expect(
      page.locator("article", { hasText: "Toyota RAV4" }),
    ).toBeVisible();
  });
});