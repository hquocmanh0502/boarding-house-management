const mongoose = require('mongoose');

//  FIX DNS TRƯỚC KHI CONNECT
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Atlas connected!');
  } catch (err) {

    console.error('Kết nối MongoDB thất bại:', err.message);

    process.exit(1);
  }
};

module.exports = connectDB;
