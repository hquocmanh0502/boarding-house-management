const Invoice = require('../../models/Invoice');
const User    = require('../../models/User');
const { getPayOS } = require('../../services/payosService');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// POST /user/invoices/:id/pay  →  Tạo link thanh toán PayOS
const createPayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('room');
    if (!invoice) {
      req.flash('error', 'Không tìm thấy hóa đơn');
      return res.redirect('/user/invoices');
    }
    if (invoice.isPaid) {
      req.flash('info', 'Hóa đơn này đã được thanh toán');
      return res.redirect(`/user/invoices/${invoice._id}`);
    }

    // Tạo orderCode duy nhất (số nguyên) từ timestamp + 3 số cuối invoice
    const suffix = invoice._id.toString().slice(-3);
    const orderCode = parseInt(Date.now().toString().slice(-7) + suffix.replace(/[^0-9]/g, '0').slice(0,3));

    const description = `P${invoice.room.roomNumber} T${invoice.month}/${invoice.year}`.slice(0, 25);

    const paymentData = {
      orderCode,
      amount:      invoice.totalAmount,
      description,
      items: [
        { name: `Tien phong T${invoice.month}/${invoice.year}`, quantity: 1, price: invoice.rentPrice },
        { name: 'Tien dien',    quantity: 1, price: invoice.electricTotal },
        { name: 'Tien nuoc',    quantity: 1, price: invoice.waterTotal },
        { name: 'Phi dich vu',  quantity: 1, price: invoice.serviceTotal },
      ].filter(item => item.price > 0),
      returnUrl: `${APP_URL}/user/payment/success?invoiceId=${invoice._id}`,
      cancelUrl:  `${APP_URL}/user/payment/cancel?invoiceId=${invoice._id}`,
    };

    const paymentLink = await getPayOS().createPaymentLink(paymentData);

    // Lưu orderCode + checkoutUrl vào invoice
    invoice.payosOrderCode   = orderCode;
    invoice.payosCheckoutUrl = paymentLink.checkoutUrl;
    invoice.payosStatus      = 'PENDING';
    await invoice.save();

    return res.redirect(paymentLink.checkoutUrl);
  } catch (err) {
    console.error('PayOS createPayment error:', err);
    req.flash('error', 'Không thể tạo link thanh toán: ' + (err.message || 'Lỗi hệ thống'));
    return res.redirect(`/user/invoices/${req.params.id}`);
  }
};

// GET /user/payment/success  →  PayOS redirect về sau khi thanh toán thành công
const paymentSuccess = async (req, res) => {
  try {
    const { invoiceId, orderCode, status } = req.query;

    // Nếu PayOS trả về status=PAID hoặc kiểm tra qua API
    let isPaid = status === 'PAID';

    if (!isPaid && orderCode) {
      try {
        const paymentInfo = await getPayOS().getPaymentLinkInformation(orderCode);
        isPaid = paymentInfo.status === 'PAID';
      } catch (e) {
        console.error('PayOS verify error:', e.message);
      }
    }

    if (invoiceId && isPaid) {
      await Invoice.findByIdAndUpdate(invoiceId, {
        isPaid:      true,
        paidAt:      new Date(),
        payosStatus: 'PAID',
        note:        'Đã thanh toán qua PayOS',
      });
      req.flash('success', '✅ Thanh toán thành công! Hóa đơn đã được xác nhận.');
    } else if (invoiceId) {
      // Chưa xác nhận được — có thể đang xử lý, đánh dấu pending
      req.flash('info', '⏳ Đang xử lý thanh toán. Vui lòng chờ xác nhận.');
    }

    return res.redirect(invoiceId ? `/user/invoices/${invoiceId}` : '/user/invoices');
  } catch (err) {
    console.error('Payment success handler error:', err);
    req.flash('error', 'Lỗi xác nhận thanh toán');
    return res.redirect('/user/invoices');
  }
};

// GET /user/payment/cancel  →  User huỷ thanh toán
const paymentCancel = async (req, res) => {
  const { invoiceId } = req.query;
  try {
    if (invoiceId) {
      await Invoice.findByIdAndUpdate(invoiceId, { payosStatus: 'CANCELLED' });
    }
  } catch (e) { /* bỏ qua */ }
  req.flash('error', '❌ Bạn đã huỷ thanh toán.');
  return res.redirect(invoiceId ? `/user/invoices/${invoiceId}` : '/user/invoices');
};

// POST /webhook/payos  →  PayOS gọi để xác nhận thanh toán (production)
const payosWebhook = async (req, res) => {
  try {
    const webhookData = getPayOS().verifyPaymentWebhookData(req.body);

    if (webhookData.code === '00' && webhookData.desc === 'success') {
      // Tìm invoice theo orderCode
      const invoice = await Invoice.findOne({ payosOrderCode: webhookData.data?.orderCode });
      if (invoice && !invoice.isPaid) {
        invoice.isPaid      = true;
        invoice.paidAt      = new Date();
        invoice.payosStatus = 'PAID';
        invoice.note        = 'Đã thanh toán qua PayOS (webhook)';
        await invoice.save();
        console.log(`✅ Webhook: Invoice ${invoice.invoiceCode} đã được xác nhận thanh toán`);
      }
    }

    return res.json({ error: 0 });
  } catch (err) {
    console.error('PayOS webhook error:', err);
    return res.json({ error: -1, message: err.message });
  }
};

module.exports = { createPayment, paymentSuccess, paymentCancel, payosWebhook };
