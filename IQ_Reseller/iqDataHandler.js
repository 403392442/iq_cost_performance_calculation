const axios = require('axios');
const {
    IQ_GET_MASTER_ITEMS_BY_ID_URL,
    GOOGLE_SHEET_PERFORMANCE_TABLE_COLUMN_NAME_ARRAY,
    INIT_TECH_SUMMARY,
    INIT_QC_SUMMARY
} = require("../utils/constants");

/**
 * TODO - optimize this function, make it more organized
 */
const handleInventoriesResponse = async (inventoriesResponse, apiKey, categoryMap, processedUnitsMap, processCostsMap) => {
    const errorMessages = [];
    const priceUpdateRequiredUnit = [];
    const categorySet = new Set(GOOGLE_SHEET_PERFORMANCE_TABLE_COLUMN_NAME_ARRAY);
    const today = new Date();

    const techPerformanceResult = new Map();
    const qcPerformanceResult = new Map();

    if (inventoriesResponse.errors.length > 0) {
        errorMessages.push(inventoriesResponse.message);
    }

    const inventoriesObj = inventoriesResponse.data;
    for (const inventory of inventoriesObj) {
        const {poid, data} = inventory;
        for (const inventoryInfo of data) {
            const {
                inventorycomments,
                unitcost,
                inventoryid,
                itemid,
                location,
            } = inventoryInfo;

            /**
             * TODO - error handling
             */
            if (!location || !unitcost || !inventorycomments || location.trim() === "RTV") { continue; }

            // get the category
            if (!categoryMap.has(itemid)) {
                const masterData = await getMasterItemById(apiKey, itemid);
                const {category, category2, category3, category4} = masterData;
                //macbook vs MacBook
                categoryMap.set(itemid,
                    categorySet.has(category) ? category :
                        categorySet.has(category2) ? category2 :
                            categorySet.has(category3) ? category3 :
                                categorySet.has(category4) ? category4 : "Other"
                );
            }

            // calculate the price
            const category = categoryMap.get(itemid);
            const processCostsObj = processCostsMap.get(category);
            const repairCost = processCostsObj.repairCost;
            const decalCost = processCostsObj.decalCost;
            let totalPrice = Object.values(processCostsObj).reduce((acc, price) => acc + price, unitcost);

            // Match all TESTING DONE entries
            const testingMatches = [...inventorycomments.matchAll(/TESTING DONE\s*-?\s*(\w+):\s*(.+)/gi)];
            for (const match of testingMatches) {
                const techName = match[1];
                const date = new Date(match[2]);

                if (isSameDay(date, today)) {
                    if (!techPerformanceResult.has(techName)) { techPerformanceResult.set(techName, INIT_TECH_SUMMARY); }

                    const techDailyData = {...techPerformanceResult.get(techName)}
                    techDailyData[category] += 1;
                    techDailyData["Total Tested"] += 1;
                    techPerformanceResult.set(techName, techDailyData);
                }
            }

            // Match all QC DONE entries
            const qcMatches = [...inventorycomments.matchAll(/QC DONE\s*-?\s*(\w+):\s*(.+)/gi)];
            for (const match of qcMatches) {
                const techName = match[1];
                const date = new Date(match[2]);

                if (isSameDay(date, today)) {
                    if (!qcPerformanceResult.has(techName)) { qcPerformanceResult.set(techName, INIT_QC_SUMMARY); }

                    const qcDailyData = {...qcPerformanceResult.get(techName)};
                    qcDailyData[category] += 1;
                    qcDailyData["Total QCed"] += 1;
                    qcPerformanceResult.set(techName, qcDailyData);
                }
            }

            // calculate the final cost.
            totalPrice = !/repair/i.test(inventorycomments) ? totalPrice - repairCost : totalPrice;
            totalPrice = !/decal/i.test(inventorycomments) ? totalPrice - decalCost : totalPrice;
            if (processedUnitsMap.has(inventoryid) && processedUnitsMap.get(inventoryid) === totalPrice) { continue; }
            priceUpdateRequiredUnit.push([inventoryid, unitcost, totalPrice, category, /repair/i.test(inventorycomments), /decal/i.test(inventorycomments)]);
            processedUnitsMap.set(inventoryid, totalPrice);
        }
    }

    return [
        priceUpdateRequiredUnit,
        errorMessages,
        techPerformanceResult,
        qcPerformanceResult,
    ];
}


/**
 * TODO
 * Optimize the error handling
 *
 * @param apiKey
 * @param itemId
 * @returns {Promise<*>}
 */
const getMasterItemById = async (apiKey, itemId) => {
    try {
        const res = await axios.get(IQ_GET_MASTER_ITEMS_BY_ID_URL, {
            headers: { "iqr-session-token": apiKey },
            params: { ItemID: itemId },
        });
        return res.data;
    } catch (err) {
        if (err.response) {
            throw new Error(`API error: ${err.response.status} ${err.response.data?.message || ''}`);
        }
        throw new Error(`Network or unknown error: ${err.message}`);
    }
};

const isSameDay = (testingDate, today) =>
    testingDate.getFullYear() === today.getFullYear() &&
    testingDate.getMonth() === today.getMonth() &&
    testingDate.getDate() === today.getDate();

module.exports = {
    handleInventoriesResponse,
}