const Settings = require('../../models/Settings');

// GET /admin/settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.render('admin/settings', { title: 'Cài đặt giá & Thông tin', settings });
  } catch (err) {
    req.flash('error', 'Lỗi tải cài đặt');
    res.redirect('/admin/dashboard');
  }
};

// POST /admin/settings
const postSettings = async (req, res) => {
  try {
    const { electricPrice, waterPrice, servicePrice, landlordName, landlordPhone, address } = req.body;
    await Settings.findOneAndUpdate({}, {
      electricPrice: +electricPrice,
      waterPrice: +waterPrice,
      servicePrice: +servicePrice,
      landlordName, landlordPhone, address
    }, { upsert: true });
    req.flash('success', 'Lưu cài đặt thành công');
    res.redirect('/admin/settings');
  } catch (err) {
    req.flash('error', 'Lỗi lưu cài đặt');
    res.redirect('/admin/settings');
  }
};

module.exports = { getSettings, postSettings };
