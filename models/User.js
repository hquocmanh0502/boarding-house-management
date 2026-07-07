const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName:  { type: String, required: true, trim: true },
  phone:     { type: String, trim: true },
  idCard:    { type: String, trim: true },         // CCCD
  birthDate: { type: Date },
  username:  { type: String, required: true, unique: true, trim: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['admin', 'user'], default: 'user' },
  room:      { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
  avatar:    { type: String, default: null },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

// Hash password trước khi lưu
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// So sánh password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
