const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendanceController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/attendance', ctrl.listAttendance);
router.post('/attendance', ctrl.markAttendance);

router.get('/advances', ctrl.listAdvances);
router.post('/advances', ctrl.createAdvance);

router.get('/deductions', ctrl.listDeductions);
router.post('/deductions', ctrl.createDeduction);
router.delete('/deductions/:id', ctrl.deleteDeduction);

router.get('/payroll/summary', ctrl.payrollSummary);

module.exports = router;
