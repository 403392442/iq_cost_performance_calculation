const cron = require('node-cron')

const {handleAllItemsData} = require('./IQ_Reseller/iqDataHandler')
const {tempWriteToGoogleSheets} = require('./utils/writeToGoogleSheets');
const getAndCleanDataFromGoogle = require('./Google_Sheets/main_getAndCleanDataFromGoogle')
const getInventories = require('./MangoDB/getAllInventories')
const getMasterItems = require("./MangoDB/getMasterItems");
const {createMasterItemsMap} = require('./utils/cleanMongoDBData')
const exportJson = require("./utils/exportJson");
const getTime = require("./MangoDB/getTime");
const updateDailyWorkedOnUnits = require("./MangoDB/updateDailyWorkedOnUnits");
const getAllInventories = require("./IQ_Reseller/getAllInventories");

const main = async () => {
    console.log('(´｡ • ω •｡ \\\\) Running main at', new Date().toLocaleString());
    const allRowInventories = await getAllInventories();
    const allItems = allRowInventories.filter(inventory => inventory.inventorycomments !== "")

    const allMasterItems = await getMasterItems()
    const masterItemsMap = createMasterItemsMap(allMasterItems);

    // STEP 2: Get data from Google Sheets
    console.log(`ヽ(・∀・)ﾉ Getting Data From Google Sheets`)
    const [
        processCostsMap,
        techPerformanceMap,
        qcPerformanceMap
    ] = await getAndCleanDataFromGoogle();

    // Calculate cost & performance
    const [
        dailyWorkedOnUnits,
        techPerformanceResult,
        qcPerformanceResult,
    ] = handleAllItemsData(allItems, masterItemsMap, processCostsMap, techPerformanceMap, qcPerformanceMap);
    const unitsDetails = Object.values(dailyWorkedOnUnits).map(Object.values)

    await updateDailyWorkedOnUnits(dailyWorkedOnUnits)
    exportJson(dailyWorkedOnUnits);

    // Update the unit cost in IQ
    // await updateUnitCost(priceUpdateRequiredUnitArr)

    // Update to Google Sheets
    await tempWriteToGoogleSheets(unitsDetails, techPerformanceResult, qcPerformanceResult, new Date().toLocaleString());

    console.log(`FINISHED AT ${new Date().toLocaleString()}`)


}

cron.schedule('0,10 9-17 * * 1-5', main, {
    scheduled: true,
});

// top-level catcher so unhandled errors don’t crash silently
main().catch((err) => {
    console.error('Unexpected fatal error in main:', err);
});




