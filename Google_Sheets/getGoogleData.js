const getSheetsClient = require('./getGoogleSheetsClient');
const {
    GOOGLE_SHEET_PROCESS_COST_TABLE_RANGE,
    GOOGLE_SHEET_TECH_PERFORMANCE_TABLE_RANGE,
    GOOGLE_SHEET_QC_PERFORMANCE_TABLE_RANGE
} = require('../utils/constants.js');
const dotenv = require('dotenv');


dotenv.config();

const getGoogleData = async () => {
    const sheetsHandler = getSheetsClient();
    const dailyReportSheetID = process.env.GOOGLE_SHEET_DAILY_REPORT_ID;
    const performanceCostSheetId = process.env.GOOGLE_SHEET_PERFORMANCE_COST_SHEET_ID;

    if (!dailyReportSheetID) {
        return {
            code: 500,
            message:
                'GOOGLE_SHEET_DAILY_REPORT_ID is not set in .env',
        };
    }

    try {
        const processCostRes = await sheetsHandler.spreadsheets.values.get({
            spreadsheetId: performanceCostSheetId,
            range: GOOGLE_SHEET_PROCESS_COST_TABLE_RANGE,
        })
        const processCostData = processCostRes.data.values || [];
        if (processCostData.length === 0) {
            return {
                code: 204,
                message: 'No Process Cost found in the PROCESS COSTS sheet.',
            }
        }

        const techPerformanceRes = await sheetsHandler.spreadsheets.values.get({
            spreadsheetId: performanceCostSheetId,
            range: GOOGLE_SHEET_TECH_PERFORMANCE_TABLE_RANGE,
        })
        const techPerformanceData = techPerformanceRes.data.values || [];
        if (techPerformanceData.length === 0) {
            return {
                code: 204,
                message: 'No Tech Performance Sheet.',
            }
        }

        const qcPerformanceRes = await sheetsHandler.spreadsheets.values.get({
            spreadsheetId: performanceCostSheetId,
            range: GOOGLE_SHEET_QC_PERFORMANCE_TABLE_RANGE,
        })
        const qcPerformanceData = qcPerformanceRes.data.values || [];
        if (qcPerformanceData.length === 0) {
            return {
                code: 204,
                message: 'No Tech Performance Sheet.',
            }
        }

        return {
            code: 200,
            data: {
                processCostData,
                techPerformanceData,
                qcPerformanceData,
            },
        };
    } catch (err) {
        if (err.response) {
            return {
                code: err.response.status,
                message:
                    err.response.data?.error?.message ||
                    `Sheets API error (status ${err.response.status})`,
            };
        }

        return {
            code: 500,
            message: `Unexpected error in getGoogleData: ${err.message}`,
        };
    }
};

module.exports = getGoogleData;