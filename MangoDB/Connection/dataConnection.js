const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongodbAddress = process.env.MONGODB_ADDRESS;

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(mongodbAddress);
        return {
            status: 200,
            message: 'Connected to MongoDB!',
        }
    } catch (error) {
        return {
            status: 500,
            message: error.message,
        };
    }
}

const disconnectFromMongoDB = async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
}

module.exports = {
    connectToMongoDB,
    disconnectFromMongoDB,
};