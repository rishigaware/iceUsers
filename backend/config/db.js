const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/the247panel';
        console.log(`Attempting to connect to MongoDB with URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`); // Log masked URI

        const conn = await mongoose.connect(uri);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Auto-seed or verify Superadmin
        const seedSuperAdmin = require('./seedSuperAdmin');
        await seedSuperAdmin();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
