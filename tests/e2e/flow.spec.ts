import { expect, test } from "@playwright/test";

test("redirect ke login saat buka dashboard tanpa sesi", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Masuk ke Nuvora" })).toBeVisible();
});

test("halaman onboarding redirect ke login tanpa sesi", async ({ page }) => {
  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/login/);
});

test("navigasi landing ke daftar dan login", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Mulai gratis" }).first().click();
  await expect(page).toHaveURL(/\/daftar/);
  await page.getByRole("link", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("form booking publik menampilkan layanan aktif", async ({ page }) => {
  // Memakai slug yang sudah ada di environment dev jika tersedia.
  const slug = process.env.E2E_BUSINESS_SLUG;
  test.skip(!slug, "E2E_BUSINESS_SLUG belum diatur");
  await page.goto(`/${slug}`);
  await expect(page.getByRole("heading", { name: "Pilih jadwal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Lihat slot" })).toBeVisible();
});
