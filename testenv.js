const dotenv = require('dotenv');
const path = require('path');

// Load .env
const result = dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== KẾT QUẢ LOAD ENV ===');
console.log('MONGO_URI:', process.env.MONGO_URI || '❌ UNDEFINED');
console.log('PORT:', process.env.PORT || '❌ UNDEFINED');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET || '❌ UNDEFINED');
console.log('Lỗi load:', result.error || '✅ Không có lỗi');