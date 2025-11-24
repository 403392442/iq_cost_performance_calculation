const { google } = require('googleapis');

const {GOOGLE_AUTH_SCOPE, GOOGLE_AUTH_KEY_FILE_PATH} = require(`../utils/constants.js`);

const auth = new google.auth.GoogleAuth({
    keyFile: GOOGLE_AUTH_KEY_FILE_PATH,
    scopes: GOOGLE_AUTH_SCOPE,
});

const getSheetsClient = () => {
    return google.sheets({version: 'v4', auth});
}

module.exports = getSheetsClient;