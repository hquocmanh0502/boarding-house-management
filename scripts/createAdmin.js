/**
 * Script tạo tài khoản admin lần đầu
 * Chạy: node scripts/createAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Kết nối MongoDB thành công');

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('⚠️  Admin đã tồn tại:', existing.username);
    process.exit(0);
  }

  await User.create({
    fullName: 'Quản Trị Viên',
    username: 'admin',
    password: 'Admin@123',
    role: 'admin',
  });

  console.log('✅ Tạo admin thành công!');
  console.log('   Username : admin');
  console.log('   Password : Admin@123');
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
