import { expect, test } from "@playwright/test";

const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin-Demo-2026!";

test("logged-out visitors are sent to the login page", async ({ page }) => {
  for (const path of ["/company/vehicles", "/bookings", "/vehicles/1/book"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login\?next=/);
  }
});

test("a company admin sees only their own company's data", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@emeraldcitymotors.example");
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();

  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page).toHaveURL(/\/company\/vehicles/);
  await expect(
    page.getByRole("heading", { name: "Emerald City Motors" }),
  ).toBeVisible();
  await expect(page.getByText("Toyota RAV4")).toBeVisible();
  await expect(page.getByText("Tesla Model 3")).toHaveCount(0);

  await page.getByRole("link", { name: "Bookings", exact: true }).click();
  await expect(page).toHaveURL(/\/company\/bookings/);
  await expect(page.getByText("RCR-DEMO-001")).toBeVisible();
  await expect(page.getByText("RCR-DEMO-002")).toHaveCount(0);
  await expect(page.getByText("RCR-DEMO-003")).toHaveCount(0);
});