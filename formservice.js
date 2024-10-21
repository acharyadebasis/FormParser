const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/myforms"; // Adjust your URI as needed

const connectToMongo = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

module.exports = connectToMongo;
