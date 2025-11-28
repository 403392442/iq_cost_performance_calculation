const GOOGLE_AUTH_SCOPE = ['https://www.googleapis.com/auth/spreadsheets'];
const GOOGLE_AUTH_KEY_FILE_PATH = `./googleAuth.json`;
const GOOGLE_SHEET_MODE_LIST_RANGE = "Model List!A2:B";
const GOOGLE_SHEET_UNFINISHED_PO_LIST_RANGE = "Unfinished PO!A2:A";
const GOOGLE_SHEET_PROCESS_COST_TABLE_RANGE = "Process Costs!A3:J14";
const GOOGLE_SHEET_TECH_PERFORMANCE_TABLE_RANGE = "Team Estimates!A7:L7";
const GOOGLE_SHEET_QC_PERFORMANCE_TABLE_RANGE = "Team Estimates!A19:L19";
const GOOGLE_SHEET_PERFORMANCE_TABLE_COLUMN_NAME_ARRAY = ["iMac", "Macbook", "Mac Mini", "Mac Pro", "iPad", "iPhone", "Apple TV", "Apple Watch", "Mac Studio", "Monitor", "Apple Accessory", "Other", "ChromeBook"]

const IQ_API_SESSION_URL = "https://signin.iqreseller.com/api/IntegrationAPI/Session";
const IQ_GET_INVENTORIES_BY_PO_ULR = 'https://api.iqreseller.com/webapi.svc/Inventory/JSON/GetInventoriesByPOId';
const IQ_GET_MASTER_ITEMS_BY_ID_URL = 'https://api.iqreseller.com/webapi.svc/MI/JSON/GetItemByItemId';

const INIT_TECH_SUMMARY = {
    'Position': 'Testing Tech',
    'Macbook': 0,
    'iMac': 0,
    'Mac Mini': 0,
    'Mac Pro': 0,
    'Mac Studio': 0,
    'iPhone': 0,
    'iPad': 0,
    'Apple TV': 0,
    'Monitor': 0,
    'Apple Watch': 0,
    'Apple Accessory': 0,
    'Other': 0,
    'Total Tested': 0,
    'Performance': 0,
}
const INIT_QC_SUMMARY = {
    'Position': 'QC Tech',
    'Macbook': 0,
    'iMac': 0,
    'Mac Mini': 0,
    'Mac Pro': 0,
    'Mac Studio': 0,
    'iPhone': 0,
    'iPad': 0,
    'Apple TV': 0,
    'Monitor': 0,
    'Apple Watch': 0,
    'Apple Accessory': 0,
    'Other': 0,
    'Total QCed': 0,
    'Performance': 0,
}

module.exports = {
    GOOGLE_AUTH_SCOPE,
    GOOGLE_AUTH_KEY_FILE_PATH,
    GOOGLE_SHEET_MODE_LIST_RANGE,
    GOOGLE_SHEET_UNFINISHED_PO_LIST_RANGE,
    GOOGLE_SHEET_PROCESS_COST_TABLE_RANGE,
    GOOGLE_SHEET_TECH_PERFORMANCE_TABLE_RANGE,
    GOOGLE_SHEET_QC_PERFORMANCE_TABLE_RANGE,
    GOOGLE_SHEET_PERFORMANCE_TABLE_COLUMN_NAME_ARRAY,
    IQ_API_SESSION_URL,
    IQ_GET_INVENTORIES_BY_PO_ULR,
    IQ_GET_MASTER_ITEMS_BY_ID_URL,
    INIT_TECH_SUMMARY,
    INIT_QC_SUMMARY,
}