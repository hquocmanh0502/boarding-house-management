/**
 * Chuyển tiếng Việt có dấu → không dấu
 * Ví dụ: "Hoàng Quốc Mạnh" → "Hoang Quoc Manh"
 */
const removeAccents = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

/**
 * Tự động tạo username từ họ tên + năm sinh
 * Ví dụ: "Hoàng Quốc Mạnh", 2004 → "manh2004"
 */
const generateUsername = (fullName, birthDate) => {
  const noAccent = removeAccents(fullName.trim());
  const parts = noAccent.split(/\s+/);
  const firstName = parts[parts.length - 1].toLowerCase(); // Lấy tên (phần cuối)
  const year = new Date(birthDate).getFullYear();
  return `${firstName}${year}`;
};

/**
 * Tự động tạo password từ họ tên + năm sinh
 * Ví dụ: "Hoàng Quốc Mạnh", 2004 → "Manh@2004"
 */
const generatePassword = (fullName, birthDate) => {
  const noAccent = removeAccents(fullName.trim());
  const parts = noAccent.split(/\s+/);
  const firstName = parts[parts.length - 1]; // Lấy tên (phần cuối), giữ hoa
  const year = new Date(birthDate).getFullYear();
  return `${firstName}@${year}`;
};

module.exports = { removeAccents, generateUsername, generatePassword };
