const express = require('express');
const router = express.Router();
const managementController = require('../controllers/managementController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Apply protection to all management routes
router.use(protect);

// 1. Overview Stats
router.get('/stats', managementController.getManagementStats);

// 2. Workers
router.get('/workers', managementController.getWorkers);
router.post('/workers', upload.single('photo'), managementController.createWorker);
router.put('/workers/:id', upload.single('photo'), managementController.updateWorker);
router.delete('/workers/:id', managementController.deleteWorker);

// 3. QR Attendance & Daily Sheets
router.post('/attendance/scan', managementController.scanWorkerQr);
router.get('/attendance/today', managementController.getTodayAttendance);
router.get('/attendance', managementController.getAttendanceByDate);
router.post('/attendance/manual', managementController.markManualAttendance);

// 4. Advances & Salary Khata
router.get('/advances', managementController.getAdvances);
router.post('/advances', managementController.createAdvance);
router.get('/salaries/summary', managementController.getMonthlySalarySummary);

// 5. Client Projects & Budgets
router.get('/projects', managementController.getProjects);
router.post('/projects', managementController.createProject);
router.put('/projects/:id', managementController.updateProject);
router.delete('/projects/:id', managementController.deleteProject);
router.post('/projects/:id/payment', managementController.addProjectPayment);
router.post('/projects/:id/expense', managementController.addProjectExpense);

module.exports = router;
