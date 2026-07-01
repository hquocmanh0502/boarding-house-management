const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');

const dashboard     = require('../controllers/admin/dashboardController');
const tenant        = require('../controllers/admin/tenantController');
const room          = require('../controllers/admin/roomController');
const invoice       = require('../controllers/admin/invoiceController');
const notification  = require('../controllers/admin/notificationController');
const contract      = require('../controllers/admin/contractController');
const settings      = require('../controllers/admin/settingsController');

router.use(isAdmin);

// Dashboard
router.get('/dashboard', dashboard.getDashboard);

// Tenants
router.get('/tenants',              tenant.getAll);
router.get('/tenants/create',       tenant.getCreate);
router.post('/tenants/create',      tenant.postCreate);
router.get('/tenants/:id/edit',     tenant.getEdit);
router.post('/tenants/:id/edit',    tenant.postEdit);
router.post('/tenants/:id/delete',  tenant.deleteTenant);

// Rooms
router.get('/rooms',                room.getAll);
router.get('/rooms/create',         room.getCreate);
router.post('/rooms/create',        room.postCreate);
router.get('/rooms/:id/edit',       room.getEdit);
router.post('/rooms/:id/edit',      room.postEdit);
router.post('/rooms/:id/delete',    room.deleteRoom);

// Invoices
router.get('/invoices',             invoice.getAll);
router.get('/invoices/create',      invoice.getCreate);
router.post('/invoices/create',     invoice.postCreate);
router.get('/invoices/:id',         invoice.getDetail);
router.post('/invoices/:id/pay',    invoice.markPaid);
router.post('/invoices/:id/delete', invoice.deleteInvoice);

// Notifications
router.get('/notifications',              notification.getAll);
router.get('/notifications/create',       notification.getCreate);
router.post('/notifications/create',      notification.postCreate);
router.post('/notifications/:id/delete',  notification.deleteNotification);

// Contracts
router.get('/contracts',                  contract.getAll);
router.get('/contracts/create',           contract.getCreate);
router.post('/contracts/create',          contract.postCreate);
router.get('/contracts/:id',              contract.getDetail);
router.post('/contracts/:id/terminate',   contract.terminate);

// Settings
router.get('/settings',   settings.getSettings);
router.post('/settings',  settings.postSettings);

module.exports = router;
