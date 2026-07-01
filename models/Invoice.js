const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceCode:    { type: String, unique: true },
  room:           { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  month:          { type: Number, required: true },   // 1-12
  year:           { type: Number, required: true },

  // Điện
  electricOldIndex:  { type: Number, default: 0 },   // chỉ số điện đầu kỳ
  electricNewIndex:  { type: Number, default: 0 },   // chỉ số điện cuối kỳ
  electricUsage:     { type: Number, default: 0 },   // số điện tiêu thụ (kWh)
  electricPrice:     { type: Number, default: 0 },   // giá 1 số điện
  electricTotal:     { type: Number, default: 0 },   // thành tiền điện

  // Nước
  waterOldIndex:  { type: Number, default: 0 },      // chỉ số nước đầu kỳ
  waterNewIndex:  { type: Number, default: 0 },      // chỉ số nước cuối kỳ
  waterUsage:     { type: Number, default: 0 },      // số khối nước
  waterPrice:     { type: Number, default: 0 },      // giá 1 khối
  waterTotal:     { type: Number, default: 0 },      // thành tiền nước

  // Dịch vụ
  servicePrice:   { type: Number, default: 0 },      // phí dịch vụ/người
  numOfTenants:   { type: Number, default: 1 },      // số người ở
  serviceTotal:   { type: Number, default: 0 },      // = servicePrice * numOfTenants

  // Tiền thuê
  rentPrice:      { type: Number, default: 0 },

  // Tổng
  totalAmount:    { type: Number, default: 0 },

  isPaid:         { type: Boolean, default: false },
  paidAt:         { type: Date },
  note:           { type: String },
}, { timestamps: true });

// Tự tạo mã hóa đơn
invoiceSchema.pre('save', async function () {
  if (!this.invoiceCode) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceCode = `HD${this.month.toString().padStart(2,'0')}${this.year}-${String(count + 1).padStart(3, '0')}`;
  }

  // Tính toán tự động
  this.electricUsage = this.electricNewIndex - this.electricOldIndex;
  this.electricTotal = this.electricUsage * this.electricPrice;

  this.waterUsage = this.waterNewIndex - this.waterOldIndex;
  this.waterTotal = this.waterUsage * this.waterPrice;

  this.serviceTotal = this.servicePrice * this.numOfTenants;

  this.totalAmount = this.rentPrice + this.electricTotal + this.waterTotal + this.serviceTotal;
});

module.exports = mongoose.model('Invoice', invoiceSchema);
