// src/utils/formatProductData.ts

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

export function formatProductData(data: PowerTool): string {
  let output: string[] = [];

  output.push("\n=== PRODUCT INFORMATION ===");
  output.push(`Title: ${data.title}`);
  output.push(`Brand: ${data.brand}`);
  output.push(`Item Number: ${data.itemNumber}`);

  if (data.itemsIncluded.length > 0) {
    output.push("\nItems Included:");
    data.itemsIncluded.forEach((item) => output.push(`• ${item}`));
  }

  output.push("\n" + "=".repeat(50) + "\n");

  output.push("Description:");
  output.push(data.description);

  output.push("\nSpecifications:");
  Object.entries(data.specs)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => {
      output.push(`• ${key.trim()}: ${value.trim()}`);
    });

  if (data.features.length > 0) {
    output.push("\nFeatures:");
    data.features.forEach((feature, index) => {
      output.push(`${index + 1}. ${feature}`);
    });
  }

  if (data.imageUrls.length > 0) {
    output.push("\nImage URLs:");
    data.imageUrls.forEach((url) => output.push(`• ${url}`));
  }

  output.push("\n" + "=".repeat(50));

  return output.join("\n");
}

