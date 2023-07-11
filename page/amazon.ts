import { expect, Locator, Page } from "@playwright/test";

export class Product {
  readonly page: Page;
  readonly searchBar: Locator;
  readonly searchBtn: Locator;
  readonly productLb: Locator;
  readonly priceTagLb: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBar = page.getByPlaceholder("Buscar Amazon.com.mx");
    this.searchBtn = page.getByTestId("nav-search-submit-button");
    this.productLb = page.locator("h1 span.a-color-state.a-text-bold");
    this.priceTagLb = page.locator("span.a-price-whole");
  }

  /**
   * Search a product in Amazon
   *
   * @argument {string} productName to fulfill the search
   * @example
   *    Product.searchProduct('Shoes')
   */
  async searchProduct(productName: string) {
    await this.searchBar.fill(productName);
    await this.searchBtn.click();
    await expect(this.productLb).toContainText(productName);
    await expect(
      this.page.getByText("Resultados", { exact: true })
    ).toBeVisible();
  }

  /**
   * Select the cheapest product within first N amount of results
   *
   * @argument {number} threshold of results to be consider to find the cheapest prodcut
   * @example
   *    Product.selectCheapestProduct(10)
   */
  async selectCheapestProduct(threshold: number) {
    let index: number;
    let minimunValue: number;
    const prices: number[] = [];
    let thresholdPrices: number[] = [];
    // Wait to get all the results loaded
    await this.page.waitForTimeout(2000);

    // When the number of results are less than the threshold set, it will throw and error
    if ((await this.priceTagLb.all()).length >= threshold) {
      for (const i of await this.priceTagLb.allTextContents()) {
        const aux = i?.replace(/[.,]?/g, "");
        console.log("Prices: " + aux);
        prices.push(Number(aux));
      }
      thresholdPrices = prices.slice(0, threshold);
      minimunValue = Math.min(...thresholdPrices);

      // Get the index of the minimum value found
      index = thresholdPrices.indexOf(minimunValue);
      console.log(
        "The lowest value is: " + minimunValue + " at index: " + index
      );

      await this.priceTagLb.nth(index).click();

      //Validate the price matches in the next page
      await expect(this.priceTagLb.first()).toContainText(
        minimunValue.toString()
      );
    } else {
      // throws an error because the group is bigger that the amount of results
      await expect((await this.priceTagLb.all()).length).toBeGreaterThan(
        threshold
      );
    }
  }
}
