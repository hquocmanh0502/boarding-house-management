const User = require('../../models/User');
const Room = require('../../models/Room');
const { generateUsername, generatePassword } = require('../../services/accountService');
const moment = require('moment');

// GET /admin/tenants
const getAll = async (req, res) => {
  try {
    const tenants = await User.find({ role: 'user' }).populate('room').sort({ createdAt: -1 });
    res.render('admin/tenants/index', { title: 'Quản lý khách thuê', tenants, moment });
  } catch (err) {
    req.flash('error', 'Lỗi tải danh sách khách thuê');
    res.redirect('/admin/dashboard');
  }
};

// GET /admin/tenants/create
const getCreate = async (req, res) => {
  const rooms = await Room.find({ status: { $in: ['available', 'occupied'] } }).sort({ roomNumber: 1 });
  res.render('admin/tenants/create', { title: 'Thêm khách thuê', rooms });
};

// POST /admin/tenants/create
const postCreate = async (req, res) => {
  try {
    const { fullName, phone, idCard, birthDate, roomId } = req.body;

    const username = generateUsername(fullName, birthDate);
    const rawPassword = generatePassword(fullName, birthDate);

    // Kiểm tra username đã tồn tại
    let finalUsername = username;
    let counter = 1;
    while (await User.findOne({ username: finalUsername })) {
      finalUsername = `${username}${counter++}`;
    }

    const user = await User.create({
      fullName, phone, idCard,
      birthDate: new Date(birthDate),
      username: finalUsername,
      password: rawPassword,
      role: 'user',
      room: roomId || null,
    });

    // Thêm user vào phòng
    if (roomId) {
      await Room.findByIdAndUpdate(roomId, {
        $addToSet: { tenants: user._id },
        status: 'occupied',
      });
      await User.findByIdAndUpdate(user._id, { room: roomId });
    }

    req.flash('success', `Tạo tài khoản thành công! Username: ${finalUsername} | Mật khẩu: ${rawPassword}`);
    res.redirect('/admin/tenants');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi tạo khách thuê: ' + err.message);
    res.redirect('/admin/tenants/create');
  }
};

// GET /admin/tenants/:id/edit
const getEdit = async (req, res) => {
  try {
    const tenant = await User.findById(req.params.id).populate('room');
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.render('admin/tenants/edit', { title: 'Sửa thông tin khách thuê', tenant, rooms, moment });
  } catch (err) {
    req.flash('error', 'Không tìm thấy khách thuê');
    res.redirect('/admin/tenants');
  }
};

// POST /admin/tenants/:id/edit
const postEdit = async (req, res) => {
  try {
    const { fullName, phone, idCard, birthDate, roomId, isActive } = req.body;
    const tenant = await User.findById(req.params.id);
    const oldRoomId = tenant.room?.toString();

    // Cập nhật phòng
    if (oldRoomId && oldRoomId !== roomId) {
      // Xóa khỏi phòng cũ
      const oldRoom = await Room.findById(oldRoomId);
      if (oldRoom) {
        await Room.findByIdAndUpdate(oldRoomId, { $pull: { tenants: tenant._id } });
        if (oldRoom.tenants.length <= 1) {
          await Room.findByIdAndUpdate(oldRoomId, { status: 'available' });
        }
      }
    }

    if (roomId && roomId !== oldRoomId) {
      await Room.findByIdAndUpdate(roomId, {
        $addToSet: { tenants: tenant._id },
        status: 'occupied',
      });
    }

    await User.findByIdAndUpdate(req.params.id, {
      fullName, phone, idCard,
      birthDate: new Date(birthDate),
      room: roomId || null,
      isActive: isActive === 'true',
    });

    req.flash('success', 'Cập nhật thông tin thành công');
    res.redirect('/admin/tenants');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi cập nhật: ' + err.message);
    res.redirect(`/admin/tenants/${req.params.id}/edit`);
  }
};

// POST /admin/tenants/:id/delete
const deleteTenant = async (req, res) => {
  try {
    const tenant = await User.findById(req.params.id);
    if (tenant?.room) {
      await Room.findByIdAndUpdate(tenant.room, { $pull: { tenants: tenant._id } });
      const room = await Room.findById(tenant.room);
      if (room && room.tenants.length === 0) {
        await Room.findByIdAndUpdate(tenant.room, { status: 'available' });
      }
    }
    await User.findByIdAndDelete(req.params.id);
    req.flash('success', 'Đã xóa khách thuê');
    res.redirect('/admin/tenants');
  } catch (err) {
    req.flash('error', 'Lỗi xóa khách thuê');
    res.redirect('/admin/tenants');
  }
};

module.exports = { getAll, getCreate, postCreate, getEdit, postEdit, deleteTenant };
