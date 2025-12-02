const dotenv = require('dotenv');
const getSheetsClient = require("../Google_Sheets/getGoogleSheetsClient");
dotenv.config();

const writeToGoogleSheets = async(techPerformanceResult, qcPerformanceResult, time) => {
    const sheetsHandler = getSheetsClient();
    const today = new Date();
    const date = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear()

    const [techPerformance, qcPerformance] = changePerformanceFormat(techPerformanceResult, qcPerformanceResult)

    const performanceReport = [
        {
            range: `${date}!A1`,
            values: [[`${time}`]],
        },
        {
            range: `${date}!A3`,
            values: techPerformance,
        },
        {
            range: `${date}!A${techPerformance.length + 5}`,
            values: qcPerformance,
        }
    ]

    try {
        const { data } = await sheetsHandler.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SHEET_PRICE_PERFROMANCE_CALCUTION_SHEET_ID });
        const existingSheet = data.sheets.find(
            (sheet) => sheet.properties.title === date
        );

        if (existingSheet) {
            console.log(`Sheet "${date}" already exists. Clearing contents...`);
            await sheetsHandler.spreadsheets.values.clear({
                spreadsheetId: process.env.GOOGLE_SHEET_PRICE_PERFROMANCE_CALCUTION_SHEET_ID,
                range: `${date}!A:Z`, // adjust range as needed
            });
        } else {
            console.log(`Creating new sheet "${date}"...`);
            await sheetsHandler.spreadsheets.batchUpdate({
                spreadsheetId: process.env.GOOGLE_SHEET_PRICE_PERFROMANCE_CALCUTION_SHEET_ID,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: date,
                                },
                            },
                        },
                    ],
                },
            });
        }

        await sheetsHandler.spreadsheets.values.batchUpdate({
            spreadsheetId: process.env.GOOGLE_SHEET_PRICE_PERFROMANCE_CALCUTION_SHEET_ID,
            resource: {
                data: performanceReport,
                valueInputOption: "RAW"
            }
        })
    } catch (error) {
        console.log(error);
    }

}

const changePerformanceFormat = (techPerformanceResult, qcPerformanceResult) => {
    let techPerformance;
    let qcPerformance;

    if (techPerformanceResult.size !== 0) {
        const techName = [...techPerformanceResult.keys()][0];
        const performanceReport = techPerformanceResult.get(techName);
        const performanceContent = Object.keys(performanceReport);
        techPerformance = performanceContent.map(item => [item])
        performanceContent[performanceContent.length - 2] = "Total QCed";
        qcPerformance = performanceContent.map(item => [item])
    } else if (qcPerformanceResult.size !== 0) {
        const techName = [...qcPerformanceResult.keys()][0];
        const performanceReport = qcPerformanceResult.get(techName);
        const performanceContent = Object.keys(performanceReport);
        qcPerformance = performanceContent.map(item => [item])
        performanceContent[performanceContent.length - 2] = "Total Tested";
        techPerformance = performanceContent.map(item => [item])
    }

    if (techPerformanceResult.size !== 0) {
        for (const techName of techPerformanceResult.keys()) {
            const performanceReport = techPerformanceResult.get(techName);
            for (const performanceRow of techPerformance) {
                if (performanceRow[0] === "Position") {
                    performanceRow.push("Testing Tech")
                } else if (performanceRow[0] === "Name") {
                    performanceRow.push(techName)
                } else {
                    const title = performanceRow[0]
                    performanceRow.push(performanceReport[title])
                }
            }
        }
    }
    if (qcPerformanceResult.size !== 0) {
        for (const techName of qcPerformanceResult.keys()) {
            const performanceReport = qcPerformanceResult.get(techName);
            for (const performanceRow of qcPerformance) {
                if (performanceRow[0] === "Position") {
                    performanceRow.push("QC Tech")
                } else if (performanceRow[0] === 'Name') {
                    performanceRow.push(techName)
                } else {
                    const title = performanceRow[0]
                    performanceRow.push(performanceReport[title])
                }
            }
        }
    }

    return [techPerformance, qcPerformance]
}

module.exports = {
    tempWriteToGoogleSheets: writeToGoogleSheets,
}