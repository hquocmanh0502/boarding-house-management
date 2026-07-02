const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  electricPrice: { type: Number, default: 3500 },  // VNĐ/kWh
  waterPrice:    { type: Number, default: 15000 },  // VNĐ/khối
  servicePrice:  { type: Number, default: 50000 },  // VNĐ/người/tháng
  landlordName:  { type: String, default: 'Chủ nhà trọ' },
  landlordPhone: { type: String, default: '' },
  address:       { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
