const axios = require("axios");

const getApiKey = require("./getAPIKey");


const updateUnitCost = async (priceUpdateRequiredUnitArr) => {
    // 1) Get session token
    const apiResponse = await getApiKey();
    if (apiResponse.code !== 200) {
        console.error(`Error in getApiKey:\n${apiResponse.message}`);
        return;
    }
    const apiKey = apiResponse.data;

    try {
        const data = '<request>\r\n<inventories>\r\n<inventory>\r\n<unitcost>36</unitcost>\r\n</inventory>\r\n</inventories>\r\n</request>';
        await axios.post(`https://api.iqreseller.com/webapi.svc/Inventories/Update/XML?id=365812`, {
            headers: { "iqr-session-token": apiKey },
            data: data
        })
    } catch (e) {
        console.error(`Error in getApiKey:\n${apiKey}`);
    }
}

module.exports = updateUnitCost;

