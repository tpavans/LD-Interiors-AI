const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const WorkerAdvance = require('../models/WorkerAdvance');
const Project = require('../models/Project');

// Helper to get current date formatted as YYYY-MM-DD in Indian Standard Time (IST)
function getTodayIST() {
  const now = new Date();
  const istDateString = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // 'YYYY-MM-DD'
  return istDateString;
}

// Helper to get formatted current time in IST (e.g. "09:30 AM")
function getCurrentTimeIST() {
  const now = new Date();
  return now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}

/**
 * 1. Overview Statistics for LD Management Portal
 * GET /api/management/stats
 */
exports.getManagementStats = async (req, res) => {
  try {
    const today = getTodayIST();

    // Today's attendance stats
    const totalWorkers = await Worker.countDocuments({ isActive: true });
    const todayAttendances = await Attendance.find({ date: today }).lean();
    const presentCount = todayAttendances.filter(a => a.status === 'present' || a.status === 'overtime').length;
    const halfDayCount = todayAttendances.filter(a => a.status === 'half_day').length;
    const todayWages = todayAttendances.reduce((sum, a) => sum + (a.dailyWageEarned || 0), 0);

    // Active client projects stats
    const activeProjects = await Project.find({ status: { $ne: 'completed' } }).lean();
    const totalProjectsBudget = activeProjects.reduce((sum, p) => sum + (p.totalBudget || 0), 0);
    const totalProjectsReceived = activeProjects.reduce((sum, p) => sum + (p.receivedAmount || 0), 0);
    const pendingClientReceivables = Math.max(0, totalProjectsBudget - totalProjectsReceived);

    // Total worker advances given this month
    const currentMonthPrefix = today.substring(0, 7); // 'YYYY-MM'
    const startOfMonth = new Date(`${currentMonthPrefix}-01T00:00:00.000Z`);
    const monthlyAdvances = await WorkerAdvance.find({
      type: 'advance',
      date: { $gte: startOfMonth }
    }).lean();
    const totalAdvancesGiven = monthlyAdvances.reduce((sum, a) => sum + (a.amount || 0), 0);

    res.json({
      success: true,
      stats: {
        today,
        totalWorkers,
        presentCount,
        halfDayCount,
        absentCount: Math.max(0, totalWorkers - presentCount - halfDayCount),
        todayWages,
        activeProjectsCount: activeProjects.length,
        totalProjectsBudget,
        totalProjectsReceived,
        pendingClientReceivables,
        totalAdvancesGiven
      }
    });
  } catch (error) {
    console.error('Error fetching management stats:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve stats' });
  }
};

/**
 * =========================================================================
 * 2. WORKER MANAGEMENT ENDPOINTS
 * =========================================================================
 */

// GET /api/management/workers
exports.getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().sort({ workerId: 1 }).lean();
    res.json({ success: true, count: workers.length, workers });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve workers' });
  }
};

// POST /api/management/workers
exports.createWorker = async (req, res) => {
  try {
    let { workerId, name, phone, role, wageType, dailyRate, monthlySalary, photo, aadharNumber, bloodGroup, emergencyContact, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Worker name is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    // Auto-generate Worker ID if not provided (e.g. LDI-W101, LDI-W102)
    if (!workerId || !workerId.trim()) {
      const lastWorker = await Worker.findOne().sort({ createdAt: -1 }).lean();
      let nextNum = 101;
      if (lastWorker && lastWorker.workerId && lastWorker.workerId.startsWith('LDI-W')) {
        const parsed = parseInt(lastWorker.workerId.replace('LDI-W', ''), 10);
        if (!isNaN(parsed)) nextNum = parsed + 1;
      }
      workerId = `LDI-W${nextNum}`;
    } else {
      workerId = workerId.trim().toUpperCase();
      const existing = await Worker.findOne({ workerId });
      if (existing) {
        return res.status(400).json({ success: false, message: `Worker ID ${workerId} is already in use.` });
      }
    }

    const worker = await Worker.create({
      workerId,
      name: name.trim(),
      phone: phone.trim(),
      role: (role && role.trim()) || 'Master Carpenter',
      wageType: wageType || 'daily',
      dailyRate: Number(dailyRate) || 900,
      monthlySalary: Number(monthlySalary) || 0,
      photo: photo || '',
      aadharNumber: aadharNumber || '',
      bloodGroup: bloodGroup || 'O+',
      emergencyContact: emergencyContact || '',
      qrCodeData: `LDI-WORKER:${workerId}`,
      notes: notes || ''
    });

    res.status(201).json({ success: true, message: 'Worker registered successfully!', worker });
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create worker' });
  }
};

// PUT /api/management/workers/:id
exports.updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.json({ success: true, message: 'Worker updated successfully', worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/management/workers/:id
exports.deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.json({ success: true, message: 'Worker removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * =========================================================================
 * 3. QR ATTENDANCE & DAILY PUNCH ENDPOINTS
 * =========================================================================
 */

/**
 * Scan Worker QR Code to Mark Instant Attendance
 * POST /api/management/attendance/scan
 * Payload: { qrData: "LDI-WORKER:LDI-W101" } or { workerId: "LDI-W101" }
 */
exports.scanWorkerQr = async (req, res) => {
  try {
    const { qrData, workerId: explicitWorkerId } = req.body;
    let targetWorkerId = '';

    if (explicitWorkerId) {
      targetWorkerId = explicitWorkerId.trim().toUpperCase();
    } else if (qrData) {
      // Parse payload formatted like "LDI-WORKER:LDI-W101" or raw "LDI-W101"
      const str = String(qrData).trim();
      if (str.includes('LDI-WORKER:')) {
        targetWorkerId = str.split('LDI-WORKER:')[1].trim().toUpperCase();
      } else {
        targetWorkerId = str.toUpperCase();
      }
    }

    if (!targetWorkerId) {
      return res.status(400).json({ success: false, message: 'Invalid QR code. No Worker ID found.' });
    }

    // 1. Locate worker
    const worker = await Worker.findOne({ workerId: targetWorkerId });
    if (!worker) {
      return res.status(404).json({ success: false, message: `Worker ${targetWorkerId} not found in database.` });
    }
    if (!worker.isActive) {
      return res.status(400).json({ success: false, message: `Worker ${worker.name} (${targetWorkerId}) is marked inactive.` });
    }

    const today = getTodayIST();
    const currentTime = getCurrentTimeIST();

    // 2. Check if already marked today
    let attendance = await Attendance.findOne({ workerId: targetWorkerId, date: today });

    if (attendance) {
      // Already marked: record checkout or acknowledge punch
      if (!attendance.checkOutTime) {
        attendance.checkOutTime = currentTime;
        await attendance.save();
        return res.json({
          success: true,
          isCheckout: true,
          message: `${worker.name} Check-Out recorded at ${currentTime}!`,
          worker,
          attendance
        });
      }

      return res.json({
        success: true,
        alreadyMarked: true,
        message: `${worker.name} is already marked PRESENT today at ${attendance.checkInTime}.`,
        worker,
        attendance
      });
    }

    // 3. Create fresh Present Attendance record
    const dailyWageEarned = worker.wageType === 'daily' ? worker.dailyRate : Math.round((worker.monthlySalary || 0) / 30);

    attendance = await Attendance.create({
      workerId: worker.workerId,
      workerName: worker.name,
      date: today,
      status: 'present',
      checkInTime: currentTime,
      checkOutTime: '',
      overtimeHours: 0,
      dailyWageEarned,
      scanMethod: 'qr_scan',
      notes: 'Punched via QR Scanner'
    });

    res.status(201).json({
      success: true,
      message: `✅ Attendance Marked! Welcome ${worker.name} (${worker.role}).`,
      worker,
      attendance
    });
  } catch (error) {
    console.error('QR scan attendance error:', error);
    res.status(500).json({ success: false, message: error.message || 'QR Scan failed' });
  }
};

// GET /api/management/attendance/today
exports.getTodayAttendance = async (req, res) => {
  try {
    const today = getTodayIST();
    const attendances = await Attendance.find({ date: today }).lean();
    res.json({ success: true, date: today, count: attendances.length, attendances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/management/attendance?date=YYYY-MM-DD
exports.getAttendanceByDate = async (req, res) => {
  try {
    const date = req.query.date || getTodayIST();
    const attendances = await Attendance.find({ date }).lean();
    res.json({ success: true, date, count: attendances.length, attendances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/management/attendance/manual
exports.markManualAttendance = async (req, res) => {
  try {
    const { workerId, date, status, overtimeHours, notes } = req.body;
    if (!workerId) {
      return res.status(400).json({ success: false, message: 'Worker ID is required' });
    }

    const worker = await Worker.findOne({ workerId });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const targetDate = date || getTodayIST();
    const otHours = Number(overtimeHours) || 0;
    const baseWage = worker.wageType === 'daily' ? worker.dailyRate : Math.round((worker.monthlySalary || 0) / 30);
    const hourlyRate = Math.round(baseWage / 8);

    let calculatedWage = 0;
    if (status === 'present') {
      calculatedWage = baseWage + (otHours * hourlyRate);
    } else if (status === 'half_day') {
      calculatedWage = Math.round(baseWage / 2) + (otHours * hourlyRate);
    } else if (status === 'overtime') {
      calculatedWage = baseWage + (otHours * hourlyRate);
    } else {
      calculatedWage = 0;
    }

    const attendance = await Attendance.findOneAndUpdate(
      { workerId: worker.workerId, date: targetDate },
      {
        workerName: worker.name,
        status: status || 'present',
        checkInTime: getCurrentTimeIST(),
        overtimeHours: otHours,
        dailyWageEarned: calculatedWage,
        scanMethod: 'manual',
        notes: notes || ''
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: `Attendance updated for ${worker.name}`, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * =========================================================================
 * 4. WORKER ADVANCES & SALARY KHATA ENDPOINTS
 * =========================================================================
 */

// GET /api/management/advances
exports.getAdvances = async (req, res) => {
  try {
    const { workerId, month } = req.query;
    const filter = {};
    if (workerId) filter.workerId = workerId.toUpperCase();
    if (month) {
      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(new Date(start).setMonth(start.getMonth() + 1));
      filter.date = { $gte: start, $lt: end };
    }

    const advances = await WorkerAdvance.find(filter).sort({ date: -1 }).lean();
    res.json({ success: true, count: advances.length, advances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/management/advances
exports.createAdvance = async (req, res) => {
  try {
    const { workerId, amount, type, paymentMode, notes, recordedBy } = req.body;
    if (!workerId || !amount) {
      return res.status(400).json({ success: false, message: 'Worker ID and Amount are required.' });
    }

    const worker = await Worker.findOne({ workerId: workerId.toUpperCase() });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const advance = await WorkerAdvance.create({
      workerId: worker.workerId,
      workerName: worker.name,
      amount: Number(amount),
      type: type || 'advance',
      paymentMode: paymentMode || 'cash',
      notes: notes || '',
      recordedBy: recordedBy || 'Admin',
      date: new Date()
    });

    res.status(201).json({ success: true, message: `${type === 'salary_payout' ? 'Salary settlement' : 'Advance'} recorded!`, advance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/management/salaries/summary?month=YYYY-MM
exports.getMonthlySalarySummary = async (req, res) => {
  try {
    const month = req.query.month || getTodayIST().substring(0, 7); // e.g. '2026-11'
    const workers = await Worker.find({ isActive: true }).lean();

    // Query attendances for the given month
    const regex = new RegExp(`^${month}`);
    const monthAttendances = await Attendance.find({ date: { $regex: regex } }).lean();

    // Query advances & payouts for the given month
    const startOfMonth = new Date(`${month}-01T00:00:00.000Z`);
    const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1));
    const monthTransactions = await WorkerAdvance.find({
      date: { $gte: startOfMonth, $lt: endOfMonth }
    }).lean();

    const summary = workers.map(worker => {
      const workerAtt = monthAttendances.filter(a => a.workerId === worker.workerId);
      const presentDays = workerAtt.filter(a => a.status === 'present' || a.status === 'overtime').length;
      const halfDays = workerAtt.filter(a => a.status === 'half_day').length;
      const effectiveDays = presentDays + (halfDays * 0.5);
      const grossEarnings = workerAtt.reduce((sum, a) => sum + (a.dailyWageEarned || 0), 0);

      const workerTx = monthTransactions.filter(t => t.workerId === worker.workerId);
      const advancesTaken = workerTx.filter(t => t.type === 'advance').reduce((sum, t) => sum + t.amount, 0);
      const payoutsMade = workerTx.filter(t => t.type === 'salary_payout').reduce((sum, t) => sum + t.amount, 0);
      const netPayable = Math.max(0, grossEarnings - advancesTaken - payoutsMade);

      return {
        workerId: worker.workerId,
        name: worker.name,
        role: worker.role,
        dailyRate: worker.dailyRate,
        wageType: worker.wageType,
        presentDays,
        halfDays,
        effectiveDays,
        grossEarnings,
        advancesTaken,
        payoutsMade,
        netPayable
      };
    });

    res.json({ success: true, month, count: summary.length, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * =========================================================================
 * 5. CLIENT PROJECTS & BUDGET MANAGEMENT ENDPOINTS
 * =========================================================================
 */

// GET /api/management/projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/management/projects
exports.createProject = async (req, res) => {
  try {
    let { projectId, title, clientName, clientPhone, clientCity, totalBudget, targetDate, milestones, notes } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required' });
    }
    if (!clientName || !clientName.trim()) {
      return res.status(400).json({ success: false, message: 'Client name is required' });
    }

    if (!projectId || !projectId.trim()) {
      const count = await Project.countDocuments();
      projectId = `LDI-PRJ-${String(count + 1).padStart(3, '0')}`;
    } else {
      projectId = projectId.trim().toUpperCase();
      const existing = await Project.findOne({ projectId });
      if (existing) {
        return res.status(400).json({ success: false, message: `Project ID ${projectId} is already used.` });
      }
    }

    // Default milestones if none provided
    const budgetNum = Number(totalBudget) || 0;
    let projectMilestones = milestones;
    if (!projectMilestones || projectMilestones.length === 0) {
      projectMilestones = [
        { title: '1. Booking Advance', amount: Math.round(budgetNum * 0.3), status: 'pending' },
        { title: '2. Wood Slicing & Hand Carving', amount: Math.round(budgetNum * 0.4), status: 'pending' },
        { title: '3. PU Polish & Final Installation', amount: Math.round(budgetNum * 0.3), status: 'pending' }
      ];
    }

    const project = await Project.create({
      projectId,
      title: title.trim(),
      clientName: clientName.trim(),
      clientPhone: clientPhone || '',
      clientCity: clientCity || 'Rajahmundry',
      totalBudget: budgetNum,
      targetDate: targetDate || null,
      milestones: projectMilestones,
      notes: notes || ''
    });

    res.status(201).json({ success: true, message: 'Project created successfully!', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/management/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    Object.assign(project, req.body);
    await project.save(); // triggers pre-save budget & expense re-calculations

    res.json({ success: true, message: 'Project updated successfully', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/management/projects/:id/payment (Record Milestone or Client Payment)
exports.addProjectPayment = async (req, res) => {
  try {
    const { milestoneIndex, amount, paymentMode, note } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (milestoneIndex !== undefined && project.milestones[milestoneIndex]) {
      project.milestones[milestoneIndex].status = 'received';
      project.milestones[milestoneIndex].paidDate = new Date();
      if (paymentMode) project.milestones[milestoneIndex].paymentMode = paymentMode;
      if (note) project.milestones[milestoneIndex].note = note;
    } else {
      project.milestones.push({
        title: note || 'Client Payment',
        amount: Number(amount) || 0,
        status: 'received',
        paidDate: new Date(),
        paymentMode: paymentMode || 'upi',
        note: note || ''
      });
    }

    await project.save();
    res.json({ success: true, message: 'Payment recorded successfully', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/management/projects/:id/expense (Record Material or Labor Expense)
exports.addProjectExpense = async (req, res) => {
  try {
    const { category, description, amount } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!description || !amount) {
      return res.status(400).json({ success: false, message: 'Description and amount are required' });
    }

    project.expenses.push({
      category: category || 'Teakwood Logs',
      description: description.trim(),
      amount: Number(amount) || 0,
      date: new Date()
    });

    await project.save();
    res.json({ success: true, message: 'Expense added successfully', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/management/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
