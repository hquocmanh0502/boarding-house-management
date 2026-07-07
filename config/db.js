const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
console.log(`✅ Da ket noi MongoDB: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(' Kết nối MongoDB thất bại:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
