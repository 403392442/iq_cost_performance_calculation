const DailyWorkedOnUnit = require('./Models/DailyWorkedUnitModel')
const {connectToMongoDB, disconnectFromMongoDB} = require("./Connection/dataConnection");

const updateDailyWorkedOnUnits = async (dailyWorkedOnUnits) => {
    const {status, message} = await connectToMongoDB();
    if (status !== 200) {
        console.error(message);
        process.exit(1);
    }

    try {
        await DailyWorkedOnUnit.deleteMany({})
        await DailyWorkedOnUnit.insertMany(Object.values(dailyWorkedOnUnits));

    } catch (error) {
        console.error("Error fetching items:", error);
        process.exit(1);
    } finally
    {
        await disconnectFromMongoDB();
    }

}

module.exports = updateDailyWorkedOnUnits;