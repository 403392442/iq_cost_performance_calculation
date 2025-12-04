const axios = require("axios");

const { IQ_GET_INVENTORIES_BY_PAGE_URL, IQ_GET_INVENTORIES_COUNT_URL, IQ_GET_INVENTORIES_PAGE_SIZE } = require("../utils/constants");
const getApiKey = require("./getAPIKey");

const getAllInventories = async () => {
    let apiKey;
    let totalInventoryCount;

    console.log("Getting all inventories from IQ.")
    try {
        const apiKeyRes = await getApiKey()
        if (apiKeyRes.code === 200) {
            apiKey = apiKeyRes.data;
        } else {
            return;
        }
    } catch (err) {
        return {
            code: 400,
            message: `Trouble getting apiKey: ${err.message}`,
        };
    }

    try {
        const res = await axios.get(IQ_GET_INVENTORIES_COUNT_URL, {
            headers: { "iqr-session-token": apiKey },
        });

        const match = res.data.match(/>(\d+)</);
        totalInventoryCount = match ? parseInt(match[1], 10) : null;
    } catch (e) {
        return {
            code: 400,
            message: `Trouble getting total inventories count: ${e}`,
        }
    }

    const maxPageNumber = Math.ceil(totalInventoryCount / IQ_GET_INVENTORIES_PAGE_SIZE);
    try {
        // create an array of page numbers
        const pages = Array.from({ length: maxPageNumber }, (_, i) => i + 1);

        const requests = pages.map((page) =>
            axios.get(IQ_GET_INVENTORIES_BY_PAGE_URL, {
                headers: { "iqr-session-token": apiKey },
                params: { PageSize: 2000, Page: page },
            })
        );

        const responses = await Promise.all(requests);

        return responses.flatMap((res) => res.data);

    } catch (e) {
        console.log(e)
    }
};

module.exports = getAllInventories;