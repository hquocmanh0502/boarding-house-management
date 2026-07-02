const express = require('express');
const router = express.Router();
const { isUser } = require('../middleware/auth');
const user    = require('../controllers/user/userController');
const payment = require('../controllers/user/paymentController');

router.use(isUser);

router.get('/dashboard',                user.getDashboard);
router.get('/profile',                  user.getProfile);
router.get('/change-password',          user.getChangePassword);
router.post('/change-password',         user.postChangePassword);
router.get('/invoices',                 user.getInvoices);
router.get('/invoices/:id',             user.getInvoiceDetail);
router.post('/invoices/:id/pay',        payment.createPayment);
router.get('/payment/success',          payment.paymentSuccess);
router.get('/payment/cancel',           payment.paymentCancel);
router.get('/notifications',            user.getNotifications);
router.get('/contract',                 user.getContract);

module.exports = router;
