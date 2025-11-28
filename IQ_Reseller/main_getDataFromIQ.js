const getApiKey = require("./getAPIKey");
const getAllInventories = require("./getAllInventories");


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

module.exports = getDataFromIQ;
