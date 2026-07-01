const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber:  { type: String, required: true, unique: true, trim: true },
  floor:       { type: Number, default: 1 },
  area:        { type: Number },                   // m²
  rentPrice:   { type: Number, required: true },   // tiền thuê/tháng
  maxOccupants:{ type: Number, default: 4 },
  amenities:   [{ type: String }],                 // ['wifi', 'ac', 'wc', 'parking', 'kitchen']
  images:      [{ type: String }],
  description: { type: String },
  status:      { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  tenants:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Số người hiện tại
roomSchema.virtual('currentOccupants').get(function () {
  return this.tenants.length;
});

module.exports = mongoose.model('Room', roomSchema);
