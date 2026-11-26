import { expect, test } from "@playwright/test";

test("landing page tampil", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Jadwal rapi, pelanggan datang." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mulai gratis" })).toBeVisible();
});

test("halaman login tampil", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Masuk ke akun kamu" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
});

test("halaman daftar tampil", async ({ page }) => {
  await page.goto("/daftar");
  await expect(page.getByRole("heading", { name: "Buat akun bisnis" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Daftar" })).toBeVisible();
});

test("slug bisnis tidak dikenal menampilkan 404", async ({ page }) => {
  const response = await page.goto("/slug-yang-tidak-ada-12345");
  expect(response?.status()).toBe(404);
});
