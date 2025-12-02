const Time = require('./Models/TimeModel')
const {connectToMongoDB, disconnectFromMongoDB} = require("./Connection/dataConnection");

const getTime = async () => {
    console.log(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ Getting Time`)
    const {status, message} = await connectToMongoDB();
    if (status !== 200) {
        console.error(message);
        process.exit(1);
    }

    try {
        return await Time.find({});

    } catch (error) {
        console.error("Error fetching items:", error);
        process.exit(1);
    } finally
    {
        await disconnectFromMongoDB();
    }

}

module.exports = getTime;