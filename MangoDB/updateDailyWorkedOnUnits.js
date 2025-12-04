const DailyWorkedOnUnit = require('./Models/DailyWorkedUnitModel')
const {connectToMongoDB, disconnectFromMongoDB} = require("./Connection/dataConnection");

const updateDailyWorkedOnUnits = async (dailyWorkedOnUnits) => {
    const {status, message} = await connectToMongoDB();
    if (status !== 200) {
        console.error(message);
    }

    try {
        const operations = Object.values(dailyWorkedOnUnits).map((item) => ({
            updateOne: {
                filter: { inventoryId: item.inventoryId },
                update: { $set: item },
                upsert: true,
            },
        }));
        await DailyWorkedOnUnit.bulkWrite(operations);

    } catch (error) {
        console.error("Error fetching items:", error);
    } finally
    {
        await disconnectFromMongoDB();
    }

}

module.exports = updateDailyWorkedOnUnits;