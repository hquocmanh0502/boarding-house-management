/**
 * Seed realistic data: 4 rooms, 5 tenants, 6 months invoices (Jan–Jun 2026)
 * Run: node scripts/seedData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User     = require('../models/User');
const Room     = require('../models/Room');
const Invoice  = require('../models/Invoice');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const Contract = require('../models/Contract');

const MONGO_URI = process.env.MONGO_URI;

// ─── Giá điện nước ──────────────────────────────────────────────────────────
const ELECTRIC_PRICE = 3500;   // đ/kWh
const WATER_PRICE    = 15000;  // đ/m³
const SERVICE_PRICE  = 50000;  // đ/người/tháng

// ─── 4 phòng ──────────────────────────────────────────────────────────────
const ROOMS_DATA = [
  { roomNumber: '101', rentPrice: 2000000, floor: 1, area: 25, maxTenants: 2,
    amenities: ['bed','wardrobe','ac','wifi','private_wc'],
    description: 'Phòng thoáng mát, view sân vườn' },
  { roomNumber: '102', rentPrice: 2500000, floor: 1, area: 30, maxTenants: 2,
    amenities: ['bed','wardrobe','fridge','ac','wifi','private_wc','kitchen'],
    description: 'Phòng rộng, có bếp nấu ăn' },
  { roomNumber: '201', rentPrice: 2200000, floor: 2, area: 25, maxTenants: 2,
    amenities: ['bed','wardrobe','ac','wifi','private_wc'],
    description: 'Phòng tầng 2, yên tĩnh' },
  { roomNumber: '202', rentPrice: 3000000, floor: 2, area: 35, maxTenants: 3,
    amenities: ['bed','wardrobe','fridge','ac','wifi','private_wc','kitchen','parking'],
    description: 'Phòng cao cấp, đầy đủ tiện nghi' },
];

// ─── 5 khách thuê ────────────────────────────────────────────────────────────
const TENANTS_DATA = [
  { fullName: 'Nguyễn Văn An',   phone: '0901234567', idCard: '036099001234', dob: new Date('1999-03-15'), username: 'an1999',   roomIdx: 0, numTenants: 2 },
  { fullName: 'Trần Thị Bình',   phone: '0912345678', idCard: '036099005678', dob: new Date('2000-07-22'), username: 'binh2000',  roomIdx: 1, numTenants: 1 },
  { fullName: 'Lê Minh Châu',    phone: '0923456789', idCard: '036099009012', dob: new Date('2001-11-05'), username: 'chau2001',  roomIdx: 2, numTenants: 2 },
  { fullName: 'Phạm Thị Dung',   phone: '0934567890', idCard: '036099003456', dob: new Date('1998-05-18'), username: 'dung1998',  roomIdx: 3, numTenants: 2 },
  { fullName: 'Hoàng Quốc Mạnh', phone: '0945678901', idCard: '036099007890', dob: new Date('2004-09-01'), username: 'manh2004',  roomIdx: 0, numTenants: 2, existing: true },
];

// ─── Dữ liệu điện nước cho 6 tháng (1→6 / 2026) ────────────────────────────
// Chỉ số điện tăng dần theo thực tế (mùa hè dùng nhiều hơn)
// roomIdx: [ [electricOld, electricNew, waterOld, waterNew] x 6 tháng ]
const METER_DATA = {
  0: [ // P.101 – 2 người
    [1200, 1285, 40, 44],   // T1: 85kWh, 4m³
    [1285, 1370, 44, 48],   // T2: 85kWh, 4m³
    [1370, 1462, 48, 53],   // T3: 92kWh, 5m³
    [1462, 1568, 53, 58],   // T4: 106kWh, 5m³ (nóng hơn)
    [1568, 1685, 58, 64],   // T5: 117kWh, 6m³
    [1685, 1810, 64, 70],   // T6: 125kWh, 6m³
  ],
  1: [ // P.102 – 1 người
    [850,  910,  25, 28],   // T1: 60kWh, 3m³
    [910,  972,  28, 31],   // T2: 62kWh, 3m³
    [972,  1040, 31, 34],   // T3: 68kWh, 3m³
    [1040, 1115, 34, 38],   // T4: 75kWh, 4m³
    [1115, 1198, 38, 42],   // T5: 83kWh, 4m³
    [1198, 1290, 42, 46],   // T6: 92kWh, 4m³
  ],
  2: [ // P.201 – 2 người
    [620,  700,  18, 22],   // T1: 80kWh, 4m³
    [700,  782,  22, 26],   // T2: 82kWh, 4m³
    [782,  868,  26, 30],   // T3: 86kWh, 4m³
    [868,  966,  30, 35],   // T4: 98kWh, 5m³
    [966,  1074, 35, 41],   // T5: 108kWh, 6m³
    [1074, 1188, 41, 47],   // T6: 114kWh, 6m³
  ],
  3: [ // P.202 – 2 người
    [2100, 2195, 65, 70],   // T1: 95kWh, 5m³
    [2195, 2292, 70, 75],   // T2: 97kWh, 5m³
    [2292, 2395, 75, 81],   // T3: 103kWh, 6m³
    [2395, 2510, 81, 87],   // T4: 115kWh, 6m³
    [2510, 2636, 87, 94],   // T5: 126kWh, 7m³
    [2636, 2768, 94, 101],  // T6: 132kWh, 7m³
  ],
};

const MONTHS = [1, 2, 3, 4, 5, 6]; // T1–T6 năm 2026
const YEAR   = 2026;

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Kết nối MongoDB thành công');

  // ── 1. Cài đặt cơ bản ────────────────────────────────────────────────────
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({});
  }
  settings.electricPrice = ELECTRIC_PRICE;
  settings.waterPrice    = WATER_PRICE;
  settings.servicePrice  = SERVICE_PRICE;
  settings.landlordName  = 'Nguyen Van Chu Tro';
  await settings.save();
  console.log('✅ Cài đặt đã cập nhật');

  // ── 2. Tạo / cập nhật phòng ──────────────────────────────────────────────
  const rooms = [];
  for (const rd of ROOMS_DATA) {
    let room = await Room.findOne({ roomNumber: rd.roomNumber });
    if (!room) {
      room = new Room(rd);
    } else {
      Object.assign(room, rd);
    }
    await room.save();
    rooms.push(room);
    console.log(`✅ Phòng ${room.roomNumber}`);
  }

  // ── 3. Tạo khách thuê (bỏ qua nếu đã tồn tại) ───────────────────────────
  const tenants = [];
  for (const td of TENANTS_DATA) {
    let tenant = await User.findOne({ username: td.username });
    if (!tenant) {
      const firstName = td.fullName.split(' ').pop();
      const birthYear = td.dob.getFullYear();
      const rawPass   = `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}@${birthYear}`;
      tenant = new User({
        fullName: td.fullName,
        phone:    td.phone,
        idCard:   td.idCard,
        dob:      td.dob,
        username: td.username,
        password: rawPass,
        role:     'user',
        room:     rooms[td.roomIdx]._id,
      });
      await tenant.save();
      console.log(`✅ Khách: ${td.fullName} → ${td.username} / ${rawPass}`);
    } else {
      tenant.room = rooms[td.roomIdx]._id;
      await tenant.save();
      console.log(`⚠️  Khách đã tồn tại: ${td.username} (cập nhật room)`);
    }
    tenants.push({ doc: tenant, roomIdx: td.roomIdx, numTenants: td.numTenants });

    // Gán tenant vào room.tenants
    const room = rooms[td.roomIdx];
    if (!room.tenants) room.tenants = [];
    if (!room.tenants.map(id => id.toString()).includes(tenant._id.toString())) {
      room.tenants.push(tenant._id);
    }
    room.currentTenants = (room.currentTenants || 0) + 1;
    room.status = 'occupied';
    await room.save();
  }

  // ── 4. Xóa hóa đơn cũ của các phòng đang tạo (T1–T6/2026) ──────────────
  const roomIds = rooms.map(r => r._id);
  await Invoice.deleteMany({
    room: { $in: roomIds },
    year: YEAR,
    month: { $in: MONTHS }
  });
  console.log('🗑️  Xóa hóa đơn cũ T1–T6/2026');

  // ── 5. Tạo hóa đơn thực tế ──────────────────────────────────────────────
  for (let ri = 0; ri < rooms.length; ri++) {
    const room    = rooms[ri];
    const meters  = METER_DATA[ri];
    const ntenant = TENANTS_DATA.filter(t => t.roomIdx === ri)
                      .reduce((sum, t) => sum + t.numTenants, 0) || 1;

    for (let mi = 0; mi < MONTHS.length; mi++) {
      const month = MONTHS[mi];
      const [eOld, eNew, wOld, wNew] = meters[mi];

      // T1–T5 đã thanh toán, T6 chưa
      const isPaid = month < 6;

      const inv = new Invoice({
        room:            room._id,
        month,
        year:            YEAR,
        electricOldIndex: eOld,
        electricNewIndex: eNew,
        electricPrice:   ELECTRIC_PRICE,
        waterOldIndex:   wOld,
        waterNewIndex:   wNew,
        waterPrice:      WATER_PRICE,
        servicePrice:    SERVICE_PRICE,
        numOfTenants:    ntenant,
        rentPrice:       room.rentPrice,
        isPaid,
        paidAt:          isPaid ? new Date(YEAR, month - 1, 5) : undefined,
        note: isPaid ? 'Đã thanh toán qua chuyển khoản' : '',
      });
      await inv.save();
    }
    console.log(`✅ 6 hóa đơn cho phòng ${room.roomNumber}`);
  }

  // ── 6. Thêm thông báo mẫu ───────────────────────────────────────────────
  const notifCount = await Notification.countDocuments();
  if (notifCount === 0) {
    await Notification.insertMany([
      {
        title: '📢 Thông báo nội quy nhà trọ',
        content: 'Kính gửi các bạn thuê trọ,\n\nNhà trọ xin nhắc nhở các bạn giữ gìn vệ sinh chung, không nấu ăn sau 22h, giữ trật tự. Cảm ơn sự hợp tác của các bạn!',
        targetRooms: [],
        createdAt: new Date('2026-01-10'),
      },
      {
        title: '💡 Thông báo tăng giá điện từ tháng 4/2026',
        content: 'Kính gửi các bạn,\n\nDo EVN điều chỉnh giá điện, từ tháng 4/2026 giá điện tại nhà trọ là 3.500đ/kWh. Mọi thắc mắc liên hệ chủ trọ.',
        targetRooms: [],
        createdAt: new Date('2026-03-25'),
      },
      {
        title: '🔧 Lịch bảo trì hệ thống nước ngày 15/5/2026',
        content: 'Thông báo: Ngày 15/5/2026 sẽ bảo trì đường ống nước từ 8h–12h. Vui lòng trữ nước trước.',
        targetRooms: [],
        createdAt: new Date('2026-05-10'),
      },
    ]);
    console.log('✅ 3 thông báo mẫu đã tạo');
  }

  console.log('\n🎉 Seed data hoàn tất!');
  console.log('──────────────────────────────────────────');
  console.log('Tài khoản đăng nhập thử:');
  console.log('  Admin:  admin / Admin@123');
  console.log('  User 1: an1999 / An@1999     (P.101)');
  console.log('  User 2: binh2000 / Binh@2000 (P.102)');
  console.log('  User 3: chau2001 / Chau@2001 (P.201)');
  console.log('  User 4: dung1998 / Dung@1998 (P.202)');
  console.log('  User 5: manh2004 / Manh@2004 (P.101) [đã có]');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Lỗi seed:', err);
  process.exit(1);
});
