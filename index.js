const process = require("process");
const { Builder, By, Key, until } = require('selenium-webdriver');

const { buildCollection, normalizeWorkshopURL } = require('./lib.js');

(async function main() {
    let workshopURLs = process.argv.slice(2);

    if (workshopURLs.length == 0) {
        console.error("Provide at least one valid URL");
        process.exit(1);
    }

    let allValid = true;
    for (let i = 0; i < workshopURLs.length; i++) {
        let nonNormal = workshopURLs[i];
        try {
            workshopURLs[i] = normalizeWorkshopURL(nonNormal);
        } catch (e) {
            console.warn(`Invalid workshop URL (${nonNormal}) :${e.message}`);
        }
    }

    if (!allValid) {
        console.error("Please fix invalid urls before continuing");
        process.exit(1);
    }

    await buildCollection(workshopURLs);

    process.exit(0);
})();