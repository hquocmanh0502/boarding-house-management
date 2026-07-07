const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://hunglc999:hunglc999@cluster0.gsmnxe6.mongodb.net/boarding-house-management?retryWrites=true&w=majority&appName=Cluster0",
  {
    serverSelectionTimeoutMS: 5000,
  }
)
.then(() => {
  console.log("Kết nối thành công");
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});