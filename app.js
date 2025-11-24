const cron = require('node-cron');
const getApiKey = require('./IQ_Reseller/getAPIKey');
const getAllInventories = require('./IQ_Reseller/getAllInventories');
const getGoogleData = require("./Google_Sheets/getGoogleData");
const {
    cleanModelData,
    cleanUnfinishedPOData,
    cleanProcessCostData,
    cleanPerformanceData,
} = require('./Google_Sheets/googleDataHandler');
const {handleInventoriesResponse} = require('./IQ_Reseller/iqDataHandler')
const {tempWriteToGoogleSheets} = require('./utils/tempWriteToGoogleSheets');

/**
 * TODO
 * Error handling
 * Save in a separate file
 * for both getDataFormIQ & getAndCleanDataFromGoogle
 */
const getDataFromIQ = async (workingOnPOData) => {
    // 1) Get session token
    const apiResponse = await getApiKey();
    if (apiResponse.code !== 200) {
        console.error(`Error in getApiKey:\n${apiResponse.message}`);
        return;
    }
    const apiKey = apiResponse.data;


    // 2) Get IQ inventories data
    const inventoriesResponse = await getAllInventories(apiKey, workingOnPOData);
    if (!inventoriesResponse.data) {
        console.error(`Error in getAllInventories:\n${inventoriesResponse.message}`);
        return;
    }

    return [inventoriesResponse, apiKey];
};

const getAndCleanDataFromGoogle = async () => {
    const googleData = await getGoogleData();
    if (googleData.code !== 200) {
        console.error(`Error in getGoogleData:\n${googleData.message}`);
        return;
    }
    const {
        modelData,
        unfinishedPOData,
        processCostData,
        techPerformanceData,
        qcPerformanceData
    } = googleData.data;

    const [processCostsMap, processCostsTableTypesSet] = cleanProcessCostData(processCostData);
    if (processCostsMap.size === 0) {
        console.error(`Error in getGoogleData:\nNo process costs found.`);
        return;
    }
    const modelDataMap = cleanModelData(modelData, processCostsTableTypesSet);
    const workingOnPOData = cleanUnfinishedPOData(unfinishedPOData);
    if (workingOnPOData.length === 0) {
        console.error(`Error in getGoogleData:\nNo working on PO data found.`);
        return;
    }

    const [techPerformanceMap, qcPerformanceMap] = cleanPerformanceData(techPerformanceData.flat(), qcPerformanceData.flat());

    return [processCostsMap, modelDataMap, workingOnPOData, techPerformanceMap, qcPerformanceMap];
}

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
        modelDataMap,
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

cron.schedule('0 9-17 * * 1-5', main);

/**
 * TODO - make the process fully automatic
 */
// top-level catcher so unhandled errors don’t crash silently
main().catch((err) => {
    console.error('Unexpected fatal error in main:', err);
    process.exit(1);
});

