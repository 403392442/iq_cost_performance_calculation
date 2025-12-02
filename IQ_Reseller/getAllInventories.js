const axios = require("axios");

const { IQ_GET_INVENTORIES_BY_PAGE } = require("../utils/constants");
const getApiKey = require("./getAPIKey");

const getAllInventories = async () => {
    try {
        const apiKey = await getApiKey()

        console.log("got api key, start getting all inventories")
        const res = await axios.get(IQ_GET_INVENTORIES_BY_PAGE, {
            headers: { "iqr-session-token": apiKey },
            params: {
                PageSize: 10000,
                PageNumber: 1
            }
        });

    } catch (err) {
        return {
            code: 500,
            message: `Unexpected error in getAllInventories: ${err.message}`,
        };
    }
};

module.exports = getAllInventories;