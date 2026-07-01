const Contract = require('../../models/Contract');
const User = require('../../models/User');
const Room = require('../../models/Room');
const moment = require('moment');

// GET /admin/contracts
const getAll = async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate('user', 'fullName phone')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 });
    res.render('admin/contracts/index', { title: 'Hợp đồng thuê trọ', contracts, moment });
  } catch (err) {
    req.flash('error', 'Lỗi tải hợp đồng');
    res.redirect('/admin/dashboard');
  }
};

// GET /admin/contracts/create
const getCreate = async (req, res) => {
  const tenants = await User.find({ role: 'user', isActive: true }).sort({ fullName: 1 });
  const rooms   = await Room.find({ status: 'occupied' }).sort({ roomNumber: 1 });
  res.render('admin/contracts/create', { title: 'Tạo hợp đồng', tenants, rooms, moment });
};

// POST /admin/contracts/create
const postCreate = async (req, res) => {
  try {
    const { userId, roomId, startDate, endDate, depositAmount, rentPrice, terms } = req.body;
    await Contract.create({ user: userId, room: roomId, startDate, endDate, depositAmount, rentPrice, terms });
    req.flash('success', 'Tạo hợp đồng thành công');
    res.redirect('/admin/contracts');
  } catch (err) {
    req.flash('error', 'Lỗi tạo hợp đồng: ' + err.message);
    res.redirect('/admin/contracts/create');
  }
};

// GET /admin/contracts/:id
const getDetail = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('user').populate('room');
    const settings = await require('../../models/Settings').findOne() || {};
    res.render('admin/contracts/detail', { title: 'Chi tiết hợp đồng', contract, settings, moment });
  } catch (err) {
    req.flash('error', 'Không tìm thấy hợp đồng');
    res.redirect('/admin/contracts');
  }
};

// POST /admin/contracts/:id/terminate
const terminate = async (req, res) => {
  try {
    await Contract.findByIdAndUpdate(req.params.id, { status: 'terminated' });
    req.flash('success', 'Đã chấm dứt hợp đồng');
    res.redirect('/admin/contracts');
  } catch (err) {
    req.flash('error', 'Lỗi cập nhật hợp đồng');
    res.redirect('/admin/contracts');
  }
};

module.exports = { getAll, getCreate, postCreate, getDetail, terminate };
