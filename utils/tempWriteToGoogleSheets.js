const dotenv = require('dotenv');
const getSheetsClient = require("../Google_Sheets/getGoogleSheetsClient");
dotenv.config();

/**
 * GOAL: Desperate this function
 * @returns {Promise<void>}
 */
const tempWriteToGoogleSheets = async(priceUpdateRequiredUnit, techPerformanceResult, qcPerformanceResult) => {
    const sheetsHandler = getSheetsClient();
    const today = new Date();
    const date = (today.getMonth()+1) + "/" + today.getDate()  + "/" + today.getFullYear()
    const time = today.getHours() + ":"  + today.getMinutes() + ":" + today.getSeconds();

    const priceSheetHeader = ["Inventory ID", "Purchase Cost", "Unit Cost", "Category", "Needs Repair", "Needs Decal"];
    const testingPerformanceTableHeader = ["Tech Init", "Position", "Macbook", "iMac", "Mac Mini", "Mac Pro", "Mac Studio", "iPhone", "iPad", "Apple TV", "Monitor", "Apple Watch", "Apple Accessory", "Other", "Total Tested", "Performance"];
    const qcPerformanceResultTableHeader = ["Tech Init", "Position", "Macbook", "iMac", "Mac Mini", "Mac Pro", "Mac Studio", "iPhone", "iPad", "Apple TV", "Monitor", "Apple Watch", "Apple Accessory", "Other", "Total QCed", "Performance"];

    const techPerformanceData = Array.from(techPerformanceResult.entries()).map(([key, value]) => [
        key,
        value["Position"],
        value["Macbook"],
        value["iMac"],
        value["Mac Mini"],
        value["Mac Pro"],
        value["Mac Studio"],
        value["iPhone"],
        value["iPad"],
        value["Apple TV"],
        value["Monitor"],
        value["Apple Watch"],
        value["Apple Accessory"],
        value["Other"],
        value["Total Tested"],
        value["Performance"],
    ]);

    const qcPerformanceData = Array.from(qcPerformanceResult.entries()).map(([key, value]) => [
        key,
        value["Position"],
        value["Macbook"],
        value["iMac"],
        value["Mac Mini"],
        value["Mac Pro"],
        value["Mac Studio"],
        value["iPhone"],
        value["iPad"],
        value["Apple TV"],
        value["Monitor"],
        value["Apple Watch"],
        value["Apple Accessory"],
        value["Other"],
        value["Total QCed"],
        value["Performance"],
    ]);

    const performanceReport = [
        {
            range: `${date}!A1`,
            values: [[time]]
        },
        {
            range: `${date}!A3`,
            values: [[...testingPerformanceTableHeader], ...techPerformanceData],
        },
        {
            range: `${date}!A${techPerformanceData.length + 5}`,
            values: [[...qcPerformanceResultTableHeader], ...qcPerformanceData],
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

        await sheetsHandler.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_PRICE_PERFROMANCE_CALCUTION_SHEET_ID,
            range: `Cost Calculation!A1`,
            valueInputOption: "RAW",
            requestBody: { values: [[...priceSheetHeader], ...priceUpdateRequiredUnit] },
        });

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

module.exports = {
    tempWriteToGoogleSheets,
}