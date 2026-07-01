const User = require('../../models/User');
const Room = require('../../models/Room');
const Invoice = require('../../models/Invoice');
const Contract = require('../../models/Contract');
const Notification = require('../../models/Notification');

// GET /admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const totalRooms     = await Room.countDocuments();
    const occupiedRooms  = await Room.countDocuments({ status: 'occupied' });
    const availableRooms = await Room.countDocuments({ status: 'available' });
    const totalTenants   = await User.countDocuments({ role: 'user', isActive: true });
    const unpaidInvoices = await Invoice.countDocuments({ isPaid: false });

    const currentMonth = new Date().getMonth() + 1;
    const currentYear  = new Date().getFullYear();

    // Doanh thu tháng này
    const revenueThisMonth = await Invoice.aggregate([
      { $match: { month: currentMonth, year: currentYear, isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Hóa đơn chưa thanh toán (5 gần nhất)
    const recentUnpaid = await Invoice.find({ isPaid: false })
      .populate('room').sort({ createdAt: -1 }).limit(5);

    // Doanh thu 6 tháng gần nhất (cho biểu đồ)
    const revenueChart = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const result = await Invoice.aggregate([
        { $match: { month: m, year: y, isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      revenueChart.push({ label: `${m}/${y}`, value: result[0]?.total || 0 });
    }

    res.render('admin/dashboard', {
      title: 'Dashboard',
      totalRooms, occupiedRooms, availableRooms, totalTenants, unpaidInvoices,
      revenueThisMonth: revenueThisMonth[0]?.total || 0,
      recentUnpaid,
      revenueChart: JSON.stringify(revenueChart),
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi tải dashboard');
    res.redirect('/admin/dashboard');
  }
};

module.exports = { getDashboard };
