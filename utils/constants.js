const GOOGLE_AUTH_SCOPE = ['https://www.googleapis.com/auth/spreadsheets'];
const GOOGLE_AUTH_KEY_FILE_PATH = `./googleAuth.json`;
const GOOGLE_SHEET_PROCESS_COST_TABLE_RANGE = "Process Costs!A3:J14";
const GOOGLE_SHEET_TECH_PERFORMANCE_TABLE_RANGE = "Team Estimates!A6:M7";
const GOOGLE_SHEET_QC_PERFORMANCE_TABLE_RANGE = "Team Estimates!A18:M19";

const IQ_API_SESSION_URL = "https://signin.iqreseller.com/api/IntegrationAPI/Session";
const IQ_GET_INVENTORIES_BY_PO_ULR = 'https://api.iqreseller.com/webapi.svc/Inventory/JSON/GetInventoriesByPOId';
const IQ_GET_INVENTORIES_BY_PAGE="https://api.iqreseller.com/webapi.svc/Inventory/XML/GetInventories";

module.exports = {
    GOOGLE_AUTH_SCOPE,
    GOOGLE_AUTH_KEY_FILE_PATH,
    GOOGLE_SHEET_PROCESS_COST_TABLE_RANGE,
    GOOGLE_SHEET_TECH_PERFORMANCE_TABLE_RANGE,
    GOOGLE_SHEET_QC_PERFORMANCE_TABLE_RANGE,
    IQ_API_SESSION_URL,
    IQ_GET_INVENTORIES_BY_PO_ULR,
    IQ_GET_INVENTORIES_BY_PAGE,
}