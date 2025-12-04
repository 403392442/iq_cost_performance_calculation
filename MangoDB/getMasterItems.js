const MasterItem = require('./Models/MasterItemModel')
const {connectToMongoDB, disconnectFromMongoDB} = require("./Connection/dataConnection");

const getMasterItems = async () => {
    const {status, message} = await connectToMongoDB();
    if (status !== 200) {
        console.error(message);
    }

    try {
        console.log(`Getting Master Items`)
        return await MasterItem.find({});

    } catch (error) {
        console.error("Error fetching items:", error);
    } finally
    {
        await disconnectFromMongoDB();
    }

}

module.exports = getMasterItems;