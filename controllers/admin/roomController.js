const Room = require('../../models/Room');
const User = require('../../models/User');

// GET /admin/rooms
const getAll = async (req, res) => {
  try {
    const rooms = await Room.find().populate('tenants').sort({ roomNumber: 1 });
    res.render('admin/rooms/index', { title: 'Quản lý phòng', rooms });
  } catch (err) {
    req.flash('error', 'Lỗi tải danh sách phòng');
    res.redirect('/admin/dashboard');
  }
};

// GET /admin/rooms/create
const getCreate = (req, res) => {
  res.render('admin/rooms/create', { title: 'Thêm phòng mới' });
};

// POST /admin/rooms/create
const postCreate = async (req, res) => {
  try {
    const { roomNumber, floor, area, rentPrice, maxOccupants, description } = req.body;
    let amenities = req.body.amenities || [];
    if (typeof amenities === 'string') amenities = [amenities];

    await Room.create({ roomNumber, floor, area, rentPrice, maxOccupants, amenities, description });
    req.flash('success', `Đã thêm phòng ${roomNumber}`);
    res.redirect('/admin/rooms');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi thêm phòng: ' + err.message);
    res.redirect('/admin/rooms/create');
  }
};

// GET /admin/rooms/:id/edit
const getEdit = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('tenants');
    res.render('admin/rooms/edit', { title: 'Sửa thông tin phòng', room });
  } catch (err) {
    req.flash('error', 'Không tìm thấy phòng');
    res.redirect('/admin/rooms');
  }
};

// POST /admin/rooms/:id/edit
const postEdit = async (req, res) => {
  try {
    const { roomNumber, floor, area, rentPrice, maxOccupants, description, status } = req.body;
    let amenities = req.body.amenities || [];
    if (typeof amenities === 'string') amenities = [amenities];

    await Room.findByIdAndUpdate(req.params.id, {
      roomNumber, floor, area, rentPrice, maxOccupants, amenities, description, status
    });
    req.flash('success', 'Cập nhật phòng thành công');
    res.redirect('/admin/rooms');
  } catch (err) {
    req.flash('error', 'Lỗi cập nhật phòng');
    res.redirect(`/admin/rooms/${req.params.id}/edit`);
  }
};

// POST /admin/rooms/:id/delete
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (room.tenants.length > 0) {
      req.flash('error', 'Không thể xóa phòng đang có người ở');
      return res.redirect('/admin/rooms');
    }
    await Room.findByIdAndDelete(req.params.id);
    req.flash('success', 'Đã xóa phòng');
    res.redirect('/admin/rooms');
  } catch (err) {
    req.flash('error', 'Lỗi xóa phòng');
    res.redirect('/admin/rooms');
  }
};

module.exports = { getAll, getCreate, postCreate, getEdit, postEdit, deleteRoom };
