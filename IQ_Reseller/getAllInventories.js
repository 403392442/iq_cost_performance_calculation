const axios = require("axios");
const { IQ_GET_INVENTORIES_BY_PO_ULR } = require("../utils/constants");

const getAllInventories = async (apiKey, workingOnPOData) => {
    if (!IQ_GET_INVENTORIES_BY_PO_ULR) {
        return {
            code: 500,
            message: "Missing GET_INVENTORIES_BY_PO_URL",
        };
    }
    if (!apiKey) {
        return {
            code: 401,
            message: "Missing API key when calling getAllInventories",
        };
    }
    if (!workingOnPOData || !Array.isArray(workingOnPOData) || workingOnPOData.length === 0) {
        return {
            code: 400,
            message: "Missing or invalid workingOnPOData",
        };
    }

    try {
        const responses = await Promise.all(
            workingOnPOData.map(async (poid) => {
                try {
                    const res = await axios.get(IQ_GET_INVENTORIES_BY_PO_ULR, {
                        headers: { "iqr-session-token": apiKey },
                        params: { poid },
                    });
                    return {
                        poid,
                        success: true,
                        status: res.status,
                        data: res.data,
                    };
                } catch (err) {
                    if (err.response) {
                        return {
                            poid,
                            success: false,
                            status: err.response.status,
                            message:
                                err.response.data?.message ||
                                `API error for POID ${poid}: status ${err.response.status}`,
                        };
                    } else {
                        return {
                            poid,
                            success: false,
                            status: 500,
                            message: `Network or unknown error for POID ${poid}: ${err.message}`,
                        };
                    }
                }
            })
        );

        const successResponses = responses.filter((r) => r.success);
        const failedResponses = responses.filter((r) => !r.success);

        if (successResponses.length > 0) {
            return {
                code: failedResponses.length ? 206 : 200,
                message:
                    failedResponses.length > 0 ?
                        `Some POIDs failed: ${failedResponses.map((r) => r.poid).join(", ")}` :
                        "All inventory requests succeeded.",
                data: successResponses,
                errors: failedResponses,
            };
        }


        return {
            code: 502,
            message: "All inventory requests failed or returned empty data.",
        };
    } catch (err) {
        return {
            code: 500,
            message: `Unexpected error in getAllInventories: ${err.message}`,
        };
    }
};

module.exports = getAllInventories;