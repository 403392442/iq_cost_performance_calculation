const cron = require('node-cron')

const {handleAllItemsData} = require('./IQ_Reseller/iqDataHandler')
const {tempWriteToGoogleSheets} = require('./utils/writeToGoogleSheets');
const getAndCleanDataFromGoogle = require('./Google_Sheets/main_getAndCleanDataFromGoogle')
const getInventories = require('./MangoDB/getAllInventories')
const getMasterItems = require("./MangoDB/getMasterItems");
const {createMasterItemsMap} = require('./utils/cleanMongoDBData')
const exportJson = require("./utils/exportJson");
const getTime = require("./MangoDB/getTime");

const main = async () => {
    console.log('(´｡ • ω •｡ \\\\) Running main at', new Date().toLocaleString());

    // STEP 1: Get data from MongoDB
    console.log(`<(￣︶￣)> Getting Data From MongoDB...`)
    const allItems = await getInventories()
    const dataGeneratedTimeObj = await getTime()
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

    exportJson(dailyWorkedOnUnits);

    // Update the unit cost in IQ
    // await updateUnitCost(priceUpdateRequiredUnitArr)

    // Update to Google Sheets
    await tempWriteToGoogleSheets(techPerformanceResult, qcPerformanceResult, new Date(dataGeneratedTimeObj[0].time).toLocaleString());

    console.log(`FINISHED AT ${new Date().toLocaleString()}`)

}

cron.schedule('0,30 9-17 * * 1-5', main, {
    scheduled: true,
});

// top-level catcher so unhandled errors don’t crash silently
main().catch((err) => {
    console.error('Unexpected fatal error in main:', err);
    process.exit(1);
});




