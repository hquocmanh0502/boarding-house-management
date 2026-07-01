const Notification = require('../../models/Notification');
const Room = require('../../models/Room');

// GET /admin/notifications
const getAll = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('createdBy', 'fullName')
      .populate('targetRooms', 'roomNumber')
      .sort({ createdAt: -1 });
    res.render('admin/notifications/index', { title: 'Quản lý thông báo', notifications });
  } catch (err) {
    req.flash('error', 'Lỗi tải thông báo');
    res.redirect('/admin/dashboard');
  }
};

// GET /admin/notifications/create
const getCreate = async (req, res) => {
  const rooms = await Room.find().sort({ roomNumber: 1 });
  res.render('admin/notifications/create', { title: 'Gửi thông báo mới', rooms });
};

// POST /admin/notifications/create
const postCreate = async (req, res) => {
  try {
    const { title, content, type } = req.body;
    let targetRooms = req.body.targetRooms || [];
    if (typeof targetRooms === 'string') targetRooms = [targetRooms];

    await Notification.create({
      title, content, type,
      targetRooms: targetRooms.length > 0 ? targetRooms : [],
      createdBy: req.session.user._id,
    });

    req.flash('success', 'Đã gửi thông báo thành công');
    res.redirect('/admin/notifications');
  } catch (err) {
    req.flash('error', 'Lỗi gửi thông báo');
    res.redirect('/admin/notifications/create');
  }
};

// POST /admin/notifications/:id/delete
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    req.flash('success', 'Đã xóa thông báo');
    res.redirect('/admin/notifications');
  } catch (err) {
    req.flash('error', 'Lỗi xóa thông báo');
    res.redirect('/admin/notifications');
  }
};

module.exports = { getAll, getCreate, postCreate, deleteNotification };
