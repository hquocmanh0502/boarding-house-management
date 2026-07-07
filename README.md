# 🏠 Hệ Thống Quản Lý Nhà Trọ

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v24-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Express-5.x-black?logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb" />
  <img src="https://img.shields.io/badge/EJS-Template-orange" />
  <img src="https://img.shields.io/badge/PayOS-Thanh%20to%C3%A1n-blue" />
  <img src="https://img.shields.io/badge/License-ISC-lightgrey" />
</p>

Ứng dụng web quản lý nhà trọ toàn diện, hỗ trợ **2 vai trò**: Quản trị viên (Admin) và Khách thuê (User). Tích hợp thanh toán trực tuyến qua **PayOS** (VietQR, ATM, Visa/Master, ví điện tử).

---

## 📋 Mục Lục

- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [Tài khoản mặc định](#-tài-khoản-mặc-định)
- [Logic tính toán hóa đơn](#-logic-tính-toán-hóa-đơn)
- [Luồng thanh toán PayOS](#-luồng-thanh-toán-payos)

---

## ✨ Tính Năng

### 👨‍💼 Admin
| Chức năng | Mô tả |
|---|---|
| **Dashboard** | Thống kê tổng quan: số phòng, khách thuê, doanh thu; biểu đồ doanh thu 6 tháng |
| **Quản lý phòng** | Thêm/sửa/xóa phòng, tiện nghi (tủ lạnh, điều hòa, giường,...), trạng thái phòng |
| **Quản lý khách thuê** | CRUD khách thuê, tự động tạo tài khoản & mật khẩu theo quy tắc |
| **Hóa đơn** | Tạo/xem/xóa hóa đơn, tự động tính tiền điện/nước/dịch vụ, xác nhận thanh toán |
| **Thông báo** | Gửi thông báo đến tất cả hoặc phòng cụ thể |
| **Hợp đồng** | Upload ảnh hợp đồng, tự động điền thông tin khách thuê, xem modal |
| **Cài đặt** | Cấu hình giá điện, nước, phí dịch vụ, thông tin chủ nhà |

### 👤 Khách Thuê (User)
| Chức năng | Mô tả |
|---|---|
| **Dashboard** | Xem điện/nước tháng này, biểu đồ tiêu thụ 6 tháng |
| **Hồ sơ** | Xem thông tin cá nhân, phòng đang ở |
| **Đổi mật khẩu** | Thay đổi mật khẩu đăng nhập |
| **Hóa đơn** | Xem danh sách hóa đơn, chi tiết từng tháng |
| **Thanh toán** | Thanh toán trực tuyến qua PayOS (QR, ATM, ví điện tử) |
| **Thông báo** | Xem thông báo từ chủ trọ |
| **Hợp đồng** | Xem ảnh hợp đồng thuê trọ |

---

## 🛠 Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|---|---|
| **Backend** | Node.js, Express.js 5.x |
| **Database** | MongoDB Atlas (Mongoose 9) |
| **Template Engine** | EJS |
| **Authentication** | express-session, bcryptjs |
| **File Upload** | Multer |
| **Thanh toán** | PayOS (`@payos/node`) |
| **Frontend** | Bootstrap 5.3, Font Awesome 6, Chart.js |
| **Fonts** | Google Fonts – Inter |

---

## 📁 Cấu Trúc Dự Án

```
boarding-house-management/
├── app.js                        # Entry point
├── config/
│   └── db.js                     # Kết nối MongoDB
├── controllers/
│   ├── admin/
│   │   ├── dashboardController.js
│   │   ├── tenantController.js
│   │   ├── roomController.js
│   │   ├── invoiceController.js
│   │   ├── notificationController.js
│   │   ├── contractController.js
│   │   └── settingsController.js
│   ├── user/
│   │   ├── userController.js
│   │   └── paymentController.js  # Xử lý PayOS
│   └── authController.js
├── middleware/
│   └── auth.js                   # Xác thực & phân quyền
├── models/
│   ├── User.js
│   ├── Room.js
│   ├── Invoice.js
│   ├── Contract.js
│   ├── Notification.js
│   └── Settings.js
├── routes/
│   ├── auth.js
│   ├── admin.js
│   └── user.js
├── services/
│   ├── accountService.js         # Tạo tài khoản tự động
│   └── payosService.js           # PayOS SDK wrapper
├── scripts/
│   ├── createAdmin.js            # Tạo tài khoản admin
│   └── seedData.js               # Dữ liệu mẫu
├── views/
│   ├── partials/                 # Header, footer, sidebar
│   ├── admin/                    # Giao diện admin
│   ├── user/                     # Giao diện user
│   └── auth/                     # Đăng nhập
├── public/
│   ├── css/style.css
│   └── js/main.js
└── uploads/
    └── contracts/                # Ảnh hợp đồng
```

---

## 🚀 Cài Đặt & Chạy

### Yêu cầu
- Node.js >= 18
- Tài khoản [MongoDB Atlas](https://www.mongodb.com/atlas)
- Tài khoản [PayOS](https://payos.vn) (để tích hợp thanh toán)

### 1. Clone dự án
```bash
git clone https://github.com/hquocmanh0502/boarding-house-management.git
cd boarding-house-management
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` ở thư mục gốc:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/boarding-house
PORT=3000
SESSION_SECRET=your-secret-key
APP_URL=http://localhost:3000

# PayOS (lấy tại dashboard.payos.vn)
PAYOS_CLIENT_ID=your-client-id
PAYOS_API_KEY=your-api-key
PAYOS_CHECKSUM_KEY=your-checksum-key
```

### 4. Tạo tài khoản admin
```bash
node scripts/createAdmin.js
```

### 5. (Tuỳ chọn) Tạo dữ liệu mẫu
```bash
node scripts/seedData.js
```
> Tạo 4 phòng, 5 khách thuê, 24 hóa đơn (T1–T6/2026)

### 6. Chạy ứng dụng
```bash
# Development (tự reload)
npm run dev

# Production
npm start
```

Mở trình duyệt: **http://localhost:3000**

---

## 🔑 Tài Khoản Mặc Định

| Vai trò | Username | Password |
|---|---|---|
| Admin | `admin` | `Admin@123` |
| Khách thuê (P.101) | `an1999` | `An@1999` |
| Khách thuê (P.102) | `binh2000` | `Bình@2000` |
| Khách thuê (P.201) | `chau2001` | `Châu@2001` |
| Khách thuê (P.202) | `dung1998` | `Dung@1998` |

> **Quy tắc tạo tài khoản tự động:**
> Tên: `Hoàng Quốc Mạnh`, Năm sinh: `2004`
> → Username: `manh2004` | Password: `Manh@2004`

---

## 🧮 Logic Tính Toán Hóa Đơn

```
Tiền điện    = (Chỉ số mới - Chỉ số cũ) × Giá điện/kWh
Tiền nước    = (Chỉ số mới - Chỉ số cũ) × Giá nước/m³
Phí dịch vụ = Giá dịch vụ/người × Số người ở
──────────────────────────────────────────────────────
Tổng hóa đơn = Tiền phòng + Tiền điện + Tiền nước + Phí dịch vụ
```

---

## 💳 Luồng Thanh Toán PayOS

```
Khách xem hóa đơn
  → Nhấn "Thanh toán qua PayOS"
  → Server tạo payment link (PayOS API)
  → Redirect đến trang PayOS
  → Khách quét QR / ATM / Visa / ví điện tử
  → PayOS redirect về /user/payment/success
  → Server xác nhận → Đánh dấu isPaid = true
  → Hiển thị "✅ Thanh toán thành công"
```

**Webhook** (production): Đăng ký URL `https://yourdomain.com/webhook/payos` tại [dashboard PayOS](https://dashboard.payos.vn) để nhận xác nhận tự động.

---

## 📸 Giao Diện

| Trang | Mô tả |
|---|---|
| Đăng nhập | Form đăng nhập hiện đại, responsive |
| Admin Dashboard | Stat cards + biểu đồ doanh thu + hóa đơn tồn đọng |
| Quản lý phòng | Danh sách phòng, tiện nghi, trạng thái |
| Tạo hóa đơn | Form tự động điền giá từ cài đặt |
| Chi tiết hóa đơn | Bảng chi tiết + nút thanh toán PayOS |
| User Dashboard | Biểu đồ điện/nước 6 tháng (dual-axis) |

---

## 👨‍💻 Tác Giả

**Hoàng Quốc Mạnh**
GitHub: [@hquocmanh0502](https://github.com/hquocmanh0502)

---

<p align="center">Made with ❤️ using Node.js + Express + MongoDB</p>
