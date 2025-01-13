import { MilwaukeeScraper } from "./scrapers/MilwaukeeScraper";

async function main() {
    const milwaukeeScraper = new MilwaukeeScraper();
    const result = await milwaukeeScraper.scrape("2880-20");
    console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error); 