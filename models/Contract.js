const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  contractCode: { type: String, unique: true },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room:         { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  startDate:    { type: Date, required: true },
  endDate:      { type: Date },
  depositAmount:{ type: Number, default: 0 },      // tiền cọc
  rentPrice:    { type: Number, required: true },
  terms:        { type: String },                  // điều khoản hợp đồng
  contractImage:{ type: String, default: null },   // đường dẫn ảnh hợp đồng
  status:       { type: String, enum: ['active', 'expired', 'terminated'], default: 'active' },
  signedAt:     { type: Date, default: Date.now },
}, { timestamps: true });

// Tự tạo mã hợp đồng
contractSchema.pre('save', async function () {
  if (!this.contractCode) {
    const count = await mongoose.model('Contract').countDocuments();
    this.contractCode = `HD${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Contract', contractSchema);
