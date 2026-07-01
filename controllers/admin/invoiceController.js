const Invoice = require('../../models/Invoice');
const Room = require('../../models/Room');
const Settings = require('../../models/Settings');
const moment = require('moment');

// GET /admin/invoices
const getAll = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = parseInt(month) || new Date().getMonth() + 1;
    const currentYear  = parseInt(year)  || new Date().getFullYear();

    const invoices = await Invoice.find({ month: currentMonth, year: currentYear })
      .populate('room').sort({ createdAt: -1 });

    const totalRevenue = invoices.filter(i => i.isPaid).reduce((s, i) => s + i.totalAmount, 0);
    const unpaidCount  = invoices.filter(i => !i.isPaid).length;

    res.render('admin/invoices/index', {
      title: 'Quản lý hóa đơn',
      invoices, currentMonth, currentYear, totalRevenue, unpaidCount, moment
    });
  } catch (err) {
    req.flash('error', 'Lỗi tải hóa đơn');
    res.redirect('/admin/dashboard');
  }
};

// GET /admin/invoices/create
const getCreate = async (req, res) => {
  const rooms = await Room.find({ status: 'occupied' }).populate('tenants').sort({ roomNumber: 1 });
  const settings = await Settings.findOne() || {};
  const currentMonth = new Date().getMonth() + 1;
  const currentYear  = new Date().getFullYear();
  res.render('admin/invoices/create', {
    title: 'Tạo hóa đơn', rooms, settings, currentMonth, currentYear
  });
};

// POST /admin/invoices/create
const postCreate = async (req, res) => {
  try {
    const {
      roomId, month, year,
      electricOldIndex, electricNewIndex, electricPrice,
      waterOldIndex, waterNewIndex, waterPrice,
      servicePrice, rentPrice, note
    } = req.body;

    const room = await Room.findById(roomId).populate('tenants');
    const numOfTenants = room.tenants.length || 1;

    // Kiểm tra hóa đơn đã tồn tại chưa
    const existing = await Invoice.findOne({ room: roomId, month: parseInt(month), year: parseInt(year) });
    if (existing) {
      req.flash('error', `Phòng ${room.roomNumber} đã có hóa đơn tháng ${month}/${year}`);
      return res.redirect('/admin/invoices/create');
    }

    const invoice = new Invoice({
      room: roomId, month: parseInt(month), year: parseInt(year),
      electricOldIndex: +electricOldIndex, electricNewIndex: +electricNewIndex, electricPrice: +electricPrice,
      waterOldIndex: +waterOldIndex, waterNewIndex: +waterNewIndex, waterPrice: +waterPrice,
      servicePrice: +servicePrice, numOfTenants,
      rentPrice: +rentPrice, note
    });
    await invoice.save();

    req.flash('success', `Tạo hóa đơn phòng ${room.roomNumber} tháng ${month}/${year} thành công`);
    res.redirect('/admin/invoices');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi tạo hóa đơn: ' + err.message);
    res.redirect('/admin/invoices/create');
  }
};

// GET /admin/invoices/:id
const getDetail = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('room');
    const settings = await Settings.findOne() || {};
    res.render('admin/invoices/detail', { title: 'Chi tiết hóa đơn', invoice, settings, moment });
  } catch (err) {
    req.flash('error', 'Không tìm thấy hóa đơn');
    res.redirect('/admin/invoices');
  }
};

// POST /admin/invoices/:id/pay
const markPaid = async (req, res) => {
  try {
    await Invoice.findByIdAndUpdate(req.params.id, { isPaid: true, paidAt: new Date() });
    req.flash('success', 'Đã xác nhận thanh toán');
    res.redirect('/admin/invoices');
  } catch (err) {
    req.flash('error', 'Lỗi xác nhận thanh toán');
    res.redirect('/admin/invoices');
  }
};

// POST /admin/invoices/:id/delete
const deleteInvoice = async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    req.flash('success', 'Đã xóa hóa đơn');
    res.redirect('/admin/invoices');
  } catch (err) {
    req.flash('error', 'Lỗi xóa hóa đơn');
    res.redirect('/admin/invoices');
  }
};

module.exports = { getAll, getCreate, postCreate, getDetail, markPaid, deleteInvoice };
