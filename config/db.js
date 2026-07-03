const mongoose = require("mongoose");
const dns = require("dns");

//  FIX DNS TRƯỚC KHI CONNECT
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    console.log("DNS:", dns.getServers());

    await mongoose.connect(process.env.MONGO_URI);

    console.log(" MongoDB connected");
  } catch (err) {
    console.error(" MongoDB error:", err.message);
    process.exit(1);
  }
  
};

module.exports = connectDB;