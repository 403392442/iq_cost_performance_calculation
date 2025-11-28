const { connectToMongoDB, disconnectFromMongoDB } = require("./Connection/dataConnection");
const { IQInventory } = require('./Models/IQInventoryModel')

const getInventories = async () => {
    const {status, message} = await connectToMongoDB();
    if (status !== 200) {
        console.error(message);
        process.exit(1);
    }

    try {
        // This query runs against the 'allitems' collection ONLY
        const allItems = await IQInventory.find({});

        console.log("Data from the allitems collection:", allItems);
        return allItems;

    } catch (error) {
        console.error("Error fetching items:", error);
    }
}

module.exports = getInventories;

