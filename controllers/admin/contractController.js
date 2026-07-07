const Contract = require('../../models/Contract');
const User = require('../../models/User');
const Room = require('../../models/Room');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer upload ảnh hợp đồng
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/contracts'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `contract_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh'));
  },
});
const uploadMiddleware = upload.single('contractImage');

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
  const rooms   = await Room.find().sort({ roomNumber: 1 });
  // Truyền dữ liệu tenant dạng JSON để JS auto-fill
  const tenantsJson = tenants.map(t => ({
    _id: t._id.toString(), fullName: t.fullName, phone: t.phone || '', idCard: t.idCard || '',
    birthDate: t.birthDate ? moment(t.birthDate).format('DD/MM/YYYY') : '',
  }));
  res.render('admin/contracts/create', { title: 'Tạo hợp đồng', tenants, rooms, tenantsJson, moment });
};

// POST /admin/contracts/create
const postCreate = async (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      req.flash('error', 'Lỗi upload ảnh: ' + err.message);
      return res.redirect('/admin/contracts/create');
    }
    try {
      const { userId, roomId, startDate, endDate, depositAmount, rentPrice, terms } = req.body;
      const contractImage = req.file ? `/uploads/contracts/${req.file.filename}` : null;
      await Contract.create({ user: userId, room: roomId, startDate, endDate, depositAmount, rentPrice, terms, contractImage });
      req.flash('success', 'Tạo hợp đồng thành công');
      res.redirect('/admin/contracts');
    } catch (err) {
      if (req.file) fs.unlinkSync(req.file.path).catch(() => {});
      req.flash('error', 'Lỗi tạo hợp đồng: ' + err.message);
      res.redirect('/admin/contracts/create');
    }
  });
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
