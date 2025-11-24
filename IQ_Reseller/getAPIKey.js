const axios = require('axios');
const dotenv = require('dotenv');

const { IQ_API_SESSION_URL } = require('../utils/constants');

dotenv.config();

const IQ_API_TOKEN = process.env.IQ_API_TOKEN;

const getApiKey = async () => {
    if (!IQ_API_SESSION_URL || !IQ_API_TOKEN) {
        return {
            code: 500,
            message: 'IQ_API_SESSION_URL or IQ_API_TOKEN is not set in .env',
        };
    }

    try {
        const response = await axios.post(IQ_API_SESSION_URL, {
            APIToken: IQ_API_TOKEN,
        });

        if (response.status === 200 && response.data && response.data.Data) {
            return {
                code: 200,
                data: response.data.Data,
            };
        }

        return {
            code: response.status,
            message: 'Empty or invalid response from getApiKey function',
        };
    } catch (err) {
        if (err.response) {
            return {
                code: err.response.status,
                message:
                    err.response.data?.message ||
                    `Error getting API key (status ${err.response.status})`,
            };
        }

        return {
            code: 500,
            message: `Network or unknown error getting API key: ${err.message}`,
        };
    }
};

module.exports = getApiKey;