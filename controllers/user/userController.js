const User = require('../../models/User');
const Room = require('../../models/Room');
const Invoice = require('../../models/Invoice');
const Contract = require('../../models/Contract');
const Notification = require('../../models/Notification');
const bcrypt = require('bcryptjs');
const moment = require('moment');

// GET /user/dashboard
const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('room');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear  = new Date().getFullYear();

    const invoices = await Invoice.find({ room: user.room?._id }).sort({ year: -1, month: -1 }).limit(6);
    const currentInvoice = invoices.find(i => i.month === currentMonth && i.year === currentYear);

    // Dữ liệu biểu đồ điện nước 6 tháng
    const chartData = invoices.map(i => ({
      label: `${i.month}/${i.year}`,
      electric: i.electricUsage,
      water: i.waterUsage,
      total: i.totalAmount,
    })).reverse();

    const unreadNotifications = await Notification.countDocuments({
      readBy: { $ne: req.session.user._id },
      $or: [
        { targetRooms: { $size: 0 } },
        { targetRooms: user.room?._id }
      ]
    });

    res.render('user/dashboard', {
      title: 'Dashboard',
      user, currentInvoice, chartData: JSON.stringify(chartData), unreadNotifications, moment
    });
  } catch (err) {
    console.error(err);
    res.render('user/dashboard', { title: 'Dashboard', user: null, currentInvoice: null, chartData: '[]', unreadNotifications: 0, moment });
  }
};

// GET /user/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('room');
    res.render('user/profile', { title: 'Thông tin của tôi', user, moment });
  } catch (err) {
    req.flash('error', 'Lỗi tải thông tin');
    res.redirect('/user/dashboard');
  }
};

// GET /user/change-password
const getChangePassword = (req, res) => {
  res.render('user/change-password', { title: 'Đổi mật khẩu' });
};

// POST /user/change-password
const postChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      req.flash('error', 'Mật khẩu xác nhận không khớp');
      return res.redirect('/user/change-password');
    }
    const user = await User.findById(req.session.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      req.flash('error', 'Mật khẩu hiện tại không đúng');
      return res.redirect('/user/change-password');
    }
    user.password = newPassword;
    await user.save();
    req.flash('success', 'Đổi mật khẩu thành công');
    res.redirect('/user/dashboard');
  } catch (err) {
    req.flash('error', 'Lỗi đổi mật khẩu');
    res.redirect('/user/change-password');
  }
};

// GET /user/invoices
const getInvoices = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const invoices = await Invoice.find({ room: user.room }).populate('room').sort({ year: -1, month: -1 });
    res.render('user/invoices', { title: 'Hóa đơn của tôi', invoices, moment });
  } catch (err) {
    req.flash('error', 'Lỗi tải hóa đơn');
    res.redirect('/user/dashboard');
  }
};

// GET /user/invoices/:id
const getInvoiceDetail = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('room');
    res.render('user/invoice-detail', { title: `Hóa đơn tháng ${invoice.month}/${invoice.year}`, invoice, moment });
  } catch (err) {
    req.flash('error', 'Không tìm thấy hóa đơn');
    res.redirect('/user/invoices');
  }
};

// GET /user/notifications
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const notifications = await Notification.find({
      $or: [
        { targetRooms: { $size: 0 } },
        { targetRooms: user.room }
      ]
    }).sort({ createdAt: -1 });

    // Đánh dấu đã đọc
    await Notification.updateMany(
      { _id: { $in: notifications.map(n => n._id) } },
      { $addToSet: { readBy: req.session.user._id } }
    );

    res.render('user/notifications', { title: 'Thông báo', notifications, moment });
  } catch (err) {
    req.flash('error', 'Lỗi tải thông báo');
    res.redirect('/user/dashboard');
  }
};

// GET /user/contract
const getContract = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const contract = await Contract.findOne({ user: user._id, status: 'active' })
      .populate('user').populate('room');
    const settings = await require('../../models/Settings').findOne() || {};
    res.render('user/contract', { title: 'Hợp đồng thuê trọ', contract, settings, moment });
  } catch (err) {
    req.flash('error', 'Lỗi tải hợp đồng');
    res.redirect('/user/dashboard');
  }
};

module.exports = {
  getDashboard, getProfile, getChangePassword, postChangePassword,
  getInvoices, getInvoiceDetail, getNotifications, getContract
};
