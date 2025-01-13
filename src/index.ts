import { MilwaukeeScraper } from "./scrapers/MilwaukeeScraper";
import { formatProductData } from "./utils/formatProductData";
import { Type } from "@sinclair/typebox";
import { ComputeModule } from "@palantir/compute-module";

async function scrapeMilwaukee(mpn: string) {
  const milwaukeeScraper = new MilwaukeeScraper();
  try {
    const result = await milwaukeeScraper.scrape(mpn);
    if (result) {
      return {
        success: true as const,
        ...result,
      };
    }
    return {
      success: false as const,
      upc: "",
      brand: "",
      itemNumber: "",
      title: "",
      description: "",
      specs: {},
      features: [],
      imageUrls: [],
      itemsIncluded: [],
    };
  } catch (error) {
    return {
      success: false as const,
      upc: "",
      brand: "",
      itemNumber: "",
      title: "",
      description: "",
      specs: {},
      features: [],
      imageUrls: [],
      itemsIncluded: [],
    };
  }
}

async function scrapeMilwaukeeFormatted(mpn: string): Promise<string> {
  const result = await scrapeMilwaukee(mpn);
  if (!result.success) return "";
  return formatProductData(result);
}

const myModule = new ComputeModule({
  logger: console,
  definitions: {
    addOne: {
      input: Type.Object({ value: Type.Number() }),
      output: Type.Object({ value: Type.Number() }),
    },
    scrapeMilwaukee: {
      input: Type.Object({
        mpn: Type.String(),
      }),
      output: Type.Object({
        success: Type.Boolean(),
        upc: Type.String(),
        brand: Type.String(),
        itemNumber: Type.String(),
        title: Type.String(),
        description: Type.String(),
        specs: Type.Record(Type.String(), Type.String()),
        features: Type.Array(Type.String()),
        imageUrls: Type.Array(Type.String()),
        itemsIncluded: Type.Array(Type.String()),
      }),
    },
    scrapeMilwaukeeFormatted: {
      input: Type.Object({
        mpn: Type.String(),
      }),
      output: Type.String(),
    },
  },
});

myModule.register("addOne", async ({ value }) => ({ value: value + 1 }));

myModule.register("scrapeMilwaukee", async ({ mpn }) => {
  const result = await scrapeMilwaukee(mpn);
  return result;
});

myModule.register("scrapeMilwaukeeFormatted", async ({ mpn }) => {
  return await scrapeMilwaukeeFormatted(mpn);
});
