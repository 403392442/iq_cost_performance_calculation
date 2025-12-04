const cron = require('node-cron')

const {handleAllItemsData} = require('./IQ_Reseller/iqDataHandler')
const {tempWriteToGoogleSheets} = require('./utils/writeToGoogleSheets');
const getAndCleanDataFromGoogle = require('./Google_Sheets/main_getAndCleanDataFromGoogle')
const getMasterItems = require("./MangoDB/getMasterItems");
const {createMasterItemsMap} = require('./utils/cleanMongoDBData')
const exportJson = require("./utils/exportJson");
const updateDailyWorkedOnUnits = require("./MangoDB/updateDailyWorkedOnUnits");
const getAllInventories = require("./IQ_Reseller/getAllInventories");

const main = async () => {
    console.log('(•̀ᴗ•́)و ̑̑  Running main at', new Date().toLocaleString());
    console.log('Getting Data from IQ and Mongodb  ( •̀ ω •́ )✧ ')
    const allRowInventories = await getAllInventories();
    const allItems = allRowInventories.filter(inventory => inventory.inventorycomments !== "")
    const allMasterItems = await getMasterItems()
    const masterItemsMap = createMasterItemsMap(allMasterItems);

    console.log(`Cleaning up data. (｀･ω･´)ゞ `)
    const [
        processCostsMap,
        techPerformanceMap,
        qcPerformanceMap
    ] = await getAndCleanDataFromGoogle();

    // Calculate cost & performance
    console.log('Calculate cost and performance (ಠ_ಠ)')
    const [
        dailyWorkedOnUnits,
        techPerformanceResult,
        qcPerformanceResult,
    ] = handleAllItemsData(allItems, masterItemsMap, processCostsMap, techPerformanceMap, qcPerformanceMap);
    const unitsDetails = Object.values(dailyWorkedOnUnits).map(Object.values)

    console.log('Update MongoDB (╬ Ò ‸ Ó)')
    await updateDailyWorkedOnUnits(dailyWorkedOnUnits)
    exportJson(dailyWorkedOnUnits);

    // Update to Google Sheets
    console.log('Update google sheets (っ- ‸ – ς)  ')
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




