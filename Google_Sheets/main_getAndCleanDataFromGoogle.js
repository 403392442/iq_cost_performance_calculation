const getGoogleData = require("./getGoogleData");
const {cleanProcessCostData, cleanUnfinishedPOData, cleanPerformanceData} = require("./googleDataHandler");

const getAndCleanDataFromGoogle = async () => {
    const googleData = await getGoogleData();
    if (googleData.code !== 200) {
        console.error(`Error in getGoogleData:\n${googleData.message}`);
        return;
    }
    const {
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
    const workingOnPOData = cleanUnfinishedPOData(unfinishedPOData);
    if (workingOnPOData.length === 0) {
        console.error(`Error in getGoogleData:\nNo working on PO data found.`);
        return;
    }

    const [techPerformanceMap, qcPerformanceMap] = cleanPerformanceData(techPerformanceData.flat(), qcPerformanceData.flat());

    return [processCostsMap, workingOnPOData, techPerformanceMap, qcPerformanceMap];
}

module.exports = getAndCleanDataFromGoogle;