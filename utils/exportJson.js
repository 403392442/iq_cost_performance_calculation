const fs = require('fs')

const exportJson = (obj) => {
    const dailyWorkedUnits = JSON.stringify(obj, null, 2);

    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const fileName = `${dateString}.json`;

    const filePath = `./DailyWorkedOnJson/${fileName}`;
    try {
        fs.writeFileSync(filePath, dailyWorkedUnits, 'utf8');
        console.log(`Data successfully written to ${filePath}`);
    } catch (err) {
        console.error('Error writing file:', err);
    }

}

module.exports = exportJson;