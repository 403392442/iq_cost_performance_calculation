const getGoogleData = require("./getGoogleData");
const { cleanProcessCostData, cleanPerformanceData } = require("./googleDataHandler");

const getAndCleanDataFromGoogle = async () => {
    const googleData = await getGoogleData();
    if (googleData.code !== 200) {
        console.error(`Error in getGoogleData:\n${googleData.message}`);
        process.exit(2);
    }
    const {
        processCostData,
        techPerformanceData,
        qcPerformanceData
    } = googleData.data;

    const [processCostsMap, typeSet] = cleanProcessCostData(processCostData);
    const [techPerformanceMap, qcPerformanceMap] = cleanPerformanceData(techPerformanceData, qcPerformanceData, typeSet);

    if (processCostsMap.size === 0 || techPerformanceMap.size === 0 || qcPerformanceMap.size === 0 || typeSet.size !== 0) {
        console.error(
            `Error in getGoogleData:\nNo process costs or performance data found.\n
            Process Data Length: ${processCostsMap.size}. Tech Performance Data Length: ${techPerformanceMap.size}. QC Performance Data Length: ${qcPerformanceMap.size}.`
        );
        process.exit(2);
    }

    return [processCostsMap, techPerformanceMap, qcPerformanceMap];
}

module.exports = getAndCleanDataFromGoogle;