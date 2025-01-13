import { chromium, Page, Browser } from "playwright";

export interface PowerTool {
  upc: string;
  brand: string;
  itemNumber: string;
  title: string;
  description: string;
  specs: Record<string, string>;
  features: string[];
  imageUrls: string[];
  itemsIncluded: string[];
}


export class MilwaukeeScraper {
  private readonly baseUrl: string;
  private browser: Browser | null;
  private page: Page | null;

  constructor(baseUrl = "https://www.milwaukeetool.com/products/") {
    this.baseUrl = baseUrl;
    this.browser = null;
    this.page = null;
  }

  private async setupScraper(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          ...(process.env.DEBUG ? ["--auto-open-devtools-for-tabs"] : []),
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        ],
      });
      this.page = await this.browser.newPage();

      if (process.env.DEBUG) {
        this.page.on("console", (msg) =>
          console.log("Browser console:", msg.text())
        );
        this.page.on("pageerror", (err) =>
          console.error("Browser error:", err)
        );
      }
    } catch (error) {
      console.error("Setup failed:", error);
      throw error;
    }
  }

  private async cleanupScraper(): Promise<void> {
    try {
      if (this.page) await this.page.close();
      if (this.browser) await this.browser.close();
    } catch (error) {
      console.error("Cleanup failed:", error);
      throw error;
    } finally {
      this.page = null;
      this.browser = null;
    }
  }

  private getUrl(itemNumber: string): string {
    return `${this.baseUrl}${itemNumber}`;
  }

  public async scrape(itemNumber: string): Promise<PowerTool | null> {
    if (!itemNumber) {
      throw new Error("Item number is required");
    }

    await this.setupScraper();
    const url = this.getUrl(itemNumber);
    console.log(`Starting scrape for item ${itemNumber} at ${url}`);

    try {
      await this.page?.goto(url, {
        timeout: 90000,
        waitUntil: "networkidle",
      });

      await this.page?.waitForSelector("h1.product-info__title", {
        timeout: 30000,
        state: "visible",
      });

      await this.page?.waitForTimeout(2000);

      const [title, description, specs, features, imageUrls, itemsIncluded] =
        await Promise.all([
          this.getTitle(),
          this.getDescription(),
          this.getSpecs(),
          this.getFeatures(),
          this.getImageUrls(),
          this.getItemsIncluded(),
        ]);

      const powerTool: PowerTool = {
        upc: specs["UPC Code"] || "",
        brand: "Milwaukee",
        itemNumber,
        title,
        description,
        specs,
        features,
        imageUrls,
        itemsIncluded,
      };

      return powerTool;
    } catch (error) {
      console.error(`Failed to scrape item ${itemNumber}:`, error);
      return null;
    } finally {
      await this.cleanupScraper();
    }
  }

  private async getTitle(): Promise<string> {
    try {
      const title = await this.page?.textContent("h1.product-info__title");
      return title?.trim() || "";
    } catch (error) {
      console.error("Error getting title:", error);
      return "";
    }
  }

  private async getDescription(): Promise<string> {
    try {
      const description =
        (await this.page?.$eval(
          "div.product-info__overview p",
          (el) => el.textContent || ""
        )) || "";
      return description.trim();
    } catch (error) {
      console.error("Error getting description:", error);
      return "";
    }
  }

  private async getSpecs(): Promise<Record<string, string>> {
    const specs: Record<string, string> = {};
    try {
      const specRows = await this.page?.$$(
        "div.product-specs__table .product-specs__row:not(.product-specs__row--empty)"
      );
      if (specRows) {
        for (const row of specRows) {
          const cells = await row.$$(".product-specs__cell");
          if (cells.length === 2) {
            const key = await cells[0].textContent();
            const value = await cells[1].textContent();
            if (
              key &&
              value &&
              key.trim() !== "&nbsp;" &&
              value.trim() !== "&nbsp;"
            ) {
              specs[key.trim()] = value.trim();
            }
          }
        }
      }
    } catch (error) {
      console.error("Error getting specs:", error);
    }
    return specs;
  }

  private async getFeatures(): Promise<string[]> {
    const features: string[] = [];
    try {
      const featureElements = await this.page?.$$("div.product-features ul li");
      if (featureElements) {
        for (const element of featureElements) {
          const text = await element.textContent();
          if (text?.trim()) {
            features.push(text.trim());
          }
        }
      }
    } catch (error) {
      console.error("Error getting features:", error);
    }
    return features;
  }

  private async getItemsIncluded(): Promise<string[]> {
    const items: string[] = [];
    try {
      const includeElements = await this.page?.$$(".product-include");
      if (includeElements) {
        for (const element of includeElements) {
          const quantity = await element.$eval(
            ".product-include__quantity",
            (el) => el.textContent?.trim() || "(1)"
          );
          const title = await element.$eval(
            ".product-include__title",
            (el) => el.textContent?.trim() || ""
          );

          if (title) {
            items.push(`${quantity} ${title}`);
          }
        }
      }
    } catch (error) {
      console.error("Error getting included items:", error);
    }
    return items;
  }

  private async getImageUrls(): Promise<string[]> {
    const imageUrls = new Set<string>();
    try {
      const imageContainer = await this.page?.$(
        "div.media-gallery__main-carousel"
      );
      if (imageContainer) {
        const sources = await imageContainer.$$("picture source");
        for (const source of sources) {
          const srcset = await source.getAttribute("srcset");
          if (srcset) {
            const url = srcset.split(",")[0].split(" ")[0];
            if (url.startsWith("/--/")) {
              imageUrls.add(`https://www.milwaukeetool.com${url}`);
            } else {
              imageUrls.add(url);
            }
          }
        }

        // Get video thumbnails
        const videoThumbnails = await imageContainer.$$(
          "span.media-gallery__video img"
        );
        for (const thumb of videoThumbnails) {
          const src = await thumb.getAttribute("src");
          if (src) {
            if (src.startsWith("/--/")) {
              imageUrls.add(`https://www.milwaukeetool.com${src}`);
            } else {
              imageUrls.add(src);
            }
          }
        }
      }

      // Fallback image selectors
      if (imageUrls.size === 0) {
        const fallbackSelectors = [
          "div.media-gallery img",
          "div.product-image img",
        ];
        for (const selector of fallbackSelectors) {
          const images = await this.page?.$$(selector);
          if (images) {
            for (const img of images) {
              const src = await img.getAttribute("src");
              if (src) {
                if (src.startsWith("/--/")) {
                  imageUrls.add(`https://www.milwaukeetool.com${src}`);
                } else {
                  imageUrls.add(src);
                }
              }
            }
          }
          if (imageUrls.size > 0) break;
        }
      }
    } catch (error) {
      console.error("Error getting image URLs:", error);
    }
    return Array.from(imageUrls).map((url) => this.getLargestImageUrl(url));
  }

  private getLargestImageUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set("w", "1000");
      parsedUrl.searchParams.set("h", "1000");
      if (parsedUrl.searchParams.has("mw")) {
        parsedUrl.searchParams.set("mw", "1000");
      }
      return parsedUrl.toString();
    } catch (error) {
      console.error("Error processing image URL:", error);
      return url;
    }
  }
}