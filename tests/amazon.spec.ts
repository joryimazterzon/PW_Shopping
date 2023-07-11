import { expect, test } from "@playwright/test";
import { Product } from "../page/amazon";

test.beforeEach(async ({ page }) => {
  await page.goto(process.env.BASE_URL);
  await expect(page).toHaveURL(/.*amazon/);
});

test("Search products", async ({ page }) => {
  const item = new Product(page);
  const product = "pull up bar";
  await item.searchProduct(process.env.PRODUCT);
  await item.selectCheapestProduct(Number(process.env.THRESHOLD));
  await item.addToCart();
});
