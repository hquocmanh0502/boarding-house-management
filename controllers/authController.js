const User = require('../models/User');

// GET /auth/login
const getLogin = (req, res) => {
  if (req.session.user) {
    return res.redirect(req.session.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
  }
  res.render('auth/login', { title: 'Đăng nhập' });
};

// POST /auth/login
const postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.trim(), isActive: true });

    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Tên đăng nhập hoặc mật khẩu không đúng');
      return res.redirect('/auth/login');
    }

    req.session.user = {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      room: user.room,
      avatar: user.avatar,
    };

    req.flash('success', `Chào mừng ${user.fullName}!`);
    res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
    res.redirect('/auth/login');
  }
};

// GET /auth/logout
const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};

module.exports = { getLogin, postLogin, logout };
