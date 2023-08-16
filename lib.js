const { Builder, By, Key, until } = require("selenium-webdriver");
const { keypress } = require("./util");

function normalizeWorkshopURL(workshopURL) {
  let url = new URL(workshopURL);
  let path = workshopURL.split('?')[0];

  if (path != 'https://steamcommunity.com/sharedfiles/filedetails/' && path != 'https://steamcommunity.com/workshop/filedetails/') {
    throw new Error("URL does not point to a steam workshop file");
  }

  let id = url.searchParams.get('id');

  return `https://steamcommunity.com/workshop/filedetails/?id=${id}`;
}

async function buildCollection(workshopURLs) {
  let driver = await new Builder().forBrowser("firefox").build();

  let addons = {};
  let installStack = workshopURLs;
  let count = 0;

  for (let i = 0; i < installStack.length; i++) {
    let workshopURL = installStack[i];
    addons[workshopURL[i]] = {};
  }

  try {
    while (installStack.length > 0) {
      let currentUrl = installStack.pop();
      await processWorkshopItem(driver, addons, installStack, currentUrl);
      count++;
    }
  } finally {
    console.log(`Finished running without errors. Processed ${count} items.`);
    await driver.quit();
  }
}

async function processWorkshopItem(driver, addons, installStack, workshopURL) {
  await driver.get(workshopURL);

  // Determine item type
  let isAddon = false;
  try {
    await driver.findElement(By.className("collection"));
  } catch (e) {
    isAddon = true
  }

  if (isAddon) {
    console.log(workshopURL);
    await processAddon(driver, addons, installStack);
  }
  else {
    await processCollection(driver, addons, installStack);
  }
}

async function processCollection(driver, addons, installStack) {
  const title = await getTitle(driver);
  console.log("Processing Collection: ", title);

  let collectionContainer = await driver.findElement(By.className("collectionChildren"));
  let collectionItems = await collectionContainer.findElements(By.className("collectionItem"));

  for (let item of collectionItems) {
    let element_id = await item.getAttribute('id');
    let id = element_id.split('_')[1];
    let workshopURL = `https://steamcommunity.com/workshop/filedetails/?id=${id}`
    if (!addons[workshopURL]) {
      addons[workshopURL] = {};
      installStack.push(workshopURL);
    }
  }
}

async function processAddon(driver, addons, installStack) {
  const title = await getTitle(driver);
  console.log("Processing Addon: ", title);

  // Enqueue dependencies 
  try {
    let required_container = await driver.findElement(By.id("RequiredItems"));
    let dependencies = await required_container.findElements(By.css("a"));

    for (let d of dependencies) {
      let dependency_url = await d.getAttribute('href');
      if (addons[dependency_url]) {
        console.log("Skipping a dependency we already have...");
        continue;
      }
      addons[dependency_url] = {};
      installStack.push(dependency_url);
    }
  } catch {
    // Addon doesn't have dependencies
  }

}

async function getTitle(driver) {
  let title = await driver.findElement(By.className("workshopItemTitle"));
  return title.getText();
}

module.exports = { buildCollection, normalizeWorkshopURL };
