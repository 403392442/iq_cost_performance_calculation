const MasterItem = require('./Models/MasterItemModel')
const {connectToMongoDB, disconnectFromMongoDB} = require("./Connection/dataConnection");

const getMasterItems = async () => {
    console.log(`(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ Getting Master Items`)
    const {status, message} = await connectToMongoDB();
    if (status !== 200) {
        console.error(message);
        process.exit(1);
    }

    try {
        return await MasterItem.find({});

    } catch (error) {
        console.error("Error fetching items:", error);
        process.exit(1);
    } finally
    {
        await disconnectFromMongoDB();
    }

}

module.exports = getMasterItems;