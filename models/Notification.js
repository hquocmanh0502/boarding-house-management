const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  content:    { type: String, required: true },
  type:       { type: String, enum: ['general', 'invoice', 'maintenance', 'other'], default: 'general' },
  targetRooms:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }], // [] = gửi tất cả
  readBy:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
