// Kiểm tra đã đăng nhập
const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) return next();
  req.flash('error', 'Vui lòng đăng nhập để tiếp tục');
  res.redirect('/auth/login');
};

// Kiểm tra là Admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') return next();
  req.flash('error', 'Bạn không có quyền truy cập trang này');
  res.redirect('/auth/login');
};

// Kiểm tra là User
const isUser = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'user') return next();
  req.flash('error', 'Bạn không có quyền truy cập trang này');
  res.redirect('/auth/login');
};

// Truyền thông tin user vào tất cả views
const setLocals = (req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
};

module.exports = { isLoggedIn, isAdmin, isUser, setLocals };
