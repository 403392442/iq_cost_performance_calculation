const {handleInventoriesResponse} = require('./IQ_Reseller/iqDataHandler')
const {tempWriteToGoogleSheets} = require('./utils/writeToGoogleSheets');
const getAndCleanDataFromGoogle = require('./Google_Sheets/main_getAndCleanDataFromGoogle')
const getDataFromIQ = require('./IQ_Reseller/main_getDataFromIQ')
const getInventories = require('./MangoDB/getAllInventories')

const main = async () => {
    console.log('Running main at', new Date().toLocaleString());
    /**
     * TODO - get categoryMap & processedUnitsMap from database
     */
    const categoryMap = new Map();
    const processedUnitsMap = new Map();

    /**
     * TODO
     * 1. The following should be put in a timerInterval
     * 2. The program needs to run automatically without user input PO
     *      Get data from Lorry's MangoDB -> delete workingOnPOData
     * 3. modelData is unnecessary
     * 4. The performance goal is missing all the data now
     */
    const [
        processCostsMap,
        workingOnPOData,
        techPerformanceMap,
        qcPerformanceMap
    ] = await getAndCleanDataFromGoogle();

    console.log("FINISH GETTING DATA FROM GOOGLE SHEET")

    const [inventoriesResponse, apiKey] = await getDataFromIQ(workingOnPOData);

    console.log("FINISH GETTING DATA FROM IQ")

    /**
     * TODO - add error handling
     */
    const [
        priceUpdateRequiredUnit,
        errorMessages,
        techPerformanceResult,
        qcPerformanceResult,
    ] = await handleInventoriesResponse(inventoriesResponse, apiKey, categoryMap, processedUnitsMap, processCostsMap);

    console.log("FINISH PROCESS DATA FROM IQ")

    await tempWriteToGoogleSheets(priceUpdateRequiredUnit, techPerformanceResult, qcPerformanceResult)

    console.log(`FINISHED AT ${new Date().toLocaleString()}`)

}

const getAllItems = async () => {
    const res = await getInventories()
    console.log(res)
    return res
}

console.log(getAllItems())

// cron.schedule('0 9-17 * * 1-5', main);
//
// /**
//  * TODO - make the process fully automatic
//  */
// // top-level catcher so unhandled errors don’t crash silently
// main().catch((err) => {
//     console.error('Unexpected fatal error in main:', err);
//     process.exit(1);
// });


