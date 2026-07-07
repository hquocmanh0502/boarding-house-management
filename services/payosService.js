const { PayOS } = require('@payos/node');
// kết nối PayOS 
let _payos = null;

function getPayOS() {
  if (!_payos) {
    _payos = new PayOS(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY
    );
  }
  return _payos;
}

module.exports = { getPayOS };
