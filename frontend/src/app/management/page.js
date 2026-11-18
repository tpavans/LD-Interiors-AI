"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { playWoodenChime } from '@/utils/audioChime';
import { 
  Users, QrCode, Calendar, Wallet, Briefcase, 
  Plus, Search, CheckCircle2, AlertCircle, Clock, 
  Printer, ArrowLeft, RefreshCw, Phone, Lock, 
  Eye, EyeOff, ShieldCheck, Camera, Sparkles, 
  DollarSign, TrendingUp, X, Check, Download,
  SlidersHorizontal, ChevronRight, FileText,
  BadgeAlert, HardHat, Hammer, AlertTriangle,
  LayoutDashboard, FolderKanban, CreditCard, Menu,
  MoreVertical, Zap, ChevronDown, LogOut, Building2,
  CalendarCheck, ArrowUpRight, UserPlus, FolderPlus, Bell,
  Pencil, Trash2, Edit2
} from 'lucide-react';

const ROLES = [
  "Master Carpenter", 
  "Wood Carver", 
  "PU Polisher", 
  "Fitter & Assembler", 
  "Wood Cutter / Machine Operator", 
  "Helper", 
  "Workshop Supervisor"
];

const EXPENSE_CATEGORIES = [
  "Teakwood Logs", 
  "Hardware & Brass", 
  "PU Polish & Chemicals", 
  "Glass & Mirrors", 
  "Transport", 
  "Carpentry Labor", 
  "Miscellaneous"
];

// Curated reference data matching the luxury screenshot
const DEFAULT_RECENT_PROJECTS = [
  {
    id: "P-101",
    title: "Modern Villa Interiors",
    location: "Hyderabad",
    date: "Nov 12, 2025",
    status: "On Progress",
    statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "P-102",
    title: "Office Workspace Setup",
    location: "Bengaluru",
    date: "Nov 10, 2025",
    status: "Planning",
    statusColor: "bg-sky-100 text-sky-800 border-sky-200",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "P-103",
    title: "Home Furniture Setup",
    location: "Chennai",
    date: "Nov 8, 2025",
    status: "Completed",
    statusColor: "bg-purple-100 text-purple-800 border-purple-200",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80"
  }
];

const DEFAULT_WORKERS_ROSTER = [
  { id: "W1", name: "Ravi Kumar", role: "Carpenter", status: "Active", avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80" },
  { id: "W2", name: "Suresh M", role: "Installer", status: "Active", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { id: "W3", name: "Manoj K", role: "Painter", status: "Active", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
  { id: "W4", name: "Karthik B", role: "Fabricator", status: "Active", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" }
];

export default function ManagementPortal() {
  // Authentication & Security Pin Gate
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ld_management_authed') === 'true' || 
             sessionStorage.getItem('ld_admin_authenticated') === 'true';
    }
    return false;
  });
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');

  // Main Navigation State matching screenshot
  // 'dashboard' | 'projects' | 'workers' | 'id_cards' | 'attendance' | 'salaries' | 'reports' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('6M'); // '1M' | '3M' | '6M' | '1Y'
  const [searchQuery, setSearchQuery] = useState('');

  // Data Collections
  const [stats, setStats] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  });
  const [projects, setProjects] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [salarySummary, setSalarySummary] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).substring(0, 7);
  });

  // Modal States
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scannerResult, setScannerResult] = useState(null);
  const [manualQrInput, setManualQrInput] = useState('');
  const [, setScannerCameraError] = useState('');

  // Worker Modals State (Add & Edit)
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [workerPhotoFile, setWorkerPhotoFile] = useState(null);
  const [workerPhotoPreview, setWorkerPhotoPreview] = useState('');
  const fileInputRef = useRef(null);
  const [workerFormData, setWorkerFormData] = useState({
    name: '', phone: '', role: 'Master Carpenter', wageType: 'daily',
    dailyRate: 900, monthlySalary: 0, aadharNumber: '', bloodGroup: 'O+',
    emergencyContact: '', photo: '', notes: ''
  });

  // Edit Worker State
  const [showEditWorkerModal, setShowEditWorkerModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [editWorkerPhotoFile, setEditWorkerPhotoFile] = useState(null);
  const [editWorkerPhotoPreview, setEditWorkerPhotoPreview] = useState('');
  const editFileInputRef = useRef(null);
  const [editWorkerFormData, setEditWorkerFormData] = useState({
    name: '', phone: '', role: 'Master Carpenter', wageType: 'daily',
    dailyRate: 900, monthlySalary: 0, aadharNumber: '', bloodGroup: 'O+',
    emergencyContact: '', photo: '', isActive: true, notes: ''
  });

  // Project Modals State (Add & Edit)
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    title: '', clientName: '', clientPhone: '', clientCity: 'Rajahmundry',
    totalBudget: '', targetDate: '', notes: ''
  });

  // Edit Project State
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectFormData, setEditProjectFormData] = useState({
    title: '', clientName: '', clientPhone: '', clientCity: 'Rajahmundry',
    totalBudget: '', status: 'in_progress', targetDate: '', notes: ''
  });

  // Delete Confirmation Modal State (Handles both Project and Worker)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'worker' | 'project', item: object }
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [selectedWorkerForCard, setSelectedWorkerForCard] = useState(null);

  const [showAddAdvanceModal, setShowAddAdvanceModal] = useState(false);
  const [advanceFormData, setAdvanceFormData] = useState({
    workerId: '', amount: '', type: 'advance', paymentMode: 'cash', notes: ''
  });

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [selectedProjectForExpense, setSelectedProjectForExpense] = useState(null);
  const [expenseFormData, setExpenseFormData] = useState({
    category: 'Teakwood Logs', description: '', amount: ''
  });

  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [selectedProjectForPayment, setSelectedProjectForPayment] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '', paymentMode: 'upi', note: '', milestoneIndex: ''
  });

  // Camera video ref for QR scanning
  const videoRef = useRef(null);
  const scannerStreamRef = useRef(null);
  const isScanningRef = useRef(false);

  // 1. Real-time Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        timeZone: 'Asia/Kolkata'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Handle PIN verification
  const handlePinSubmit = (e) => {
    if (e) e.preventDefault();
    const clean = (pinInput || '').trim();
    if (clean === '1255121' || clean === 'admin' || clean === 'ld2026' || clean === 'ld_master_admin_secret_2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('ld_management_authed', 'true');
      sessionStorage.setItem('ld_admin_authenticated', 'true');
      localStorage.setItem('ld_token', 'ld_master_admin_token_' + Date.now());
      setPinError('');
      playWoodenChime();
    } else {
      setPinError('Invalid Admin PIN. Please check and try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ld_management_authed');
    sessionStorage.removeItem('ld_admin_authenticated');
    setIsAuthenticated(false);
    setPinInput('');
  };

  // 3. Data Fetching
  const fetchAllData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [statsRes, workersRes, attRes, projectsRes, advRes, salRes] = await Promise.allSettled([
        api.get('/management/stats'),
        api.get('/management/workers'),
        api.get(`/management/attendance?date=${selectedDate}`),
        api.get('/management/projects'),
        api.get('/management/advances'),
        api.get(`/management/salaries/summary?month=${selectedMonth}`)
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setStats(statsRes.value.data.stats);
      }
      if (workersRes.status === 'fulfilled' && workersRes.value.data?.success) {
        setWorkers(workersRes.value.data.workers || []);
      }
      if (attRes.status === 'fulfilled' && attRes.value.data?.success) {
        setAttendances(attRes.value.data.attendances || []);
      }
      if (projectsRes.status === 'fulfilled' && projectsRes.value.data?.success) {
        setProjects(projectsRes.value.data.projects || []);
      }
      if (advRes.status === 'fulfilled' && advRes.value.data?.success) {
        setAdvances(advRes.value.data.advances || []);
      }
      if (salRes.status === 'fulfilled' && salRes.value.data?.success) {
        setSalarySummary(salRes.value.data.summary || []);
      }
    } catch (err) {
      console.warn('Error fetching management data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, selectedDate, selectedMonth]);

  useEffect(() => {
    let active = true;
    if (isAuthenticated) {
      api.get('/management/stats').then(res => {
        if (active && res.data?.success) setStats(res.data.stats);
      }).catch(() => {});

      api.get('/management/workers').then(res => {
        if (active && res.data?.success) setWorkers(res.data.workers || []);
      }).catch(() => {});

      api.get(`/management/attendance?date=${selectedDate}`).then(res => {
        if (active && res.data?.success) setAttendances(res.data.attendances || []);
      }).catch(() => {});

      api.get('/management/projects').then(res => {
        if (active && res.data?.success) setProjects(res.data.projects || []);
      }).catch(() => {});

      api.get('/management/advances').then(res => {
        if (active && res.data?.success) setAdvances(res.data.advances || []);
      }).catch(() => {});

      api.get(`/management/salaries/summary?month=${selectedMonth}`).then(res => {
        if (active && res.data?.success) setSalarySummary(res.data.summary || []);
      }).catch(() => {});
    }
    return () => { active = false; };
  }, [isAuthenticated, selectedDate, selectedMonth]);

  // =========================================================================
  // QR CODE ATTENDANCE SCANNER CAMERA LOGIC
  // =========================================================================
  const startCameraScanner = async () => {
    setScannerCameraError('');
    setShowQrScanner(true);
    setScannerResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      scannerStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        isScanningRef.current = true;
        initiateBarcodeDetection();
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setScannerCameraError('Camera access unavailable. Please use the quick worker ID input below.');
    }
  };

  const stopCameraScanner = () => {
    isScanningRef.current = false;
    if (scannerStreamRef.current) {
      scannerStreamRef.current.getTracks().forEach(track => track.stop());
      scannerStreamRef.current = null;
    }
    setShowQrScanner(false);
  };

  const initiateBarcodeDetection = () => {
    if (!('BarcodeDetector' in window)) {
      return;
    }

    try {
      const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const detectLoop = async () => {
        if (!isScanningRef.current || !videoRef.current) return;
        try {
          if (videoRef.current.readyState === 4) {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              handleScannedPayload(rawValue);
              return;
            }
          }
        } catch {
          // ignore
        }
        if (isScanningRef.current) {
          requestAnimationFrame(detectLoop);
        }
      };
      requestAnimationFrame(detectLoop);
    } catch (e) {
      console.warn('Barcode detector failed:', e);
    }
  };

  const handleScannedPayload = async (rawCode) => {
    if (!rawCode) return;
    try {
      const res = await api.post('/management/attendance/scan', { qrData: rawCode });
      if (res.data?.success) {
        playWoodenChime();
        setScannerResult(res.data);
        fetchAllData();
      } else {
        alert(res.data?.message || 'Scan failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'QR Scan error');
    }
  };

  const handleManualScanSubmit = (e) => {
    e.preventDefault();
    if (manualQrInput.trim()) {
      handleScannedPayload(manualQrInput.trim());
      setManualQrInput('');
    }
  };

  const handleToggleAttendanceStatus = async (workerId, newStatus) => {
    try {
      await api.post('/management/attendance/manual', {
        workerId,
        date: selectedDate,
        status: newStatus
      });
      playWoodenChime();
      fetchAllData();
    } catch {
      alert('Failed to update attendance');
    }
  };

  // =========================================================================
  // WORKER ACTIONS (ADD, EDIT, DELETE)
  // =========================================================================
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setWorkerPhotoFile(file);
      setWorkerPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setWorkerPhotoFile(null);
    setWorkerPhotoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setWorkerFormData(prev => ({ ...prev, photo: '' }));
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', workerFormData.name);
      formData.append('phone', workerFormData.phone);
      formData.append('role', workerFormData.role);
      formData.append('wageType', workerFormData.wageType);
      formData.append('dailyRate', workerFormData.dailyRate);
      formData.append('monthlySalary', workerFormData.monthlySalary || 0);
      formData.append('bloodGroup', workerFormData.bloodGroup || 'O+');
      formData.append('aadharNumber', workerFormData.aadharNumber || '');
      formData.append('emergencyContact', workerFormData.emergencyContact || '');
      formData.append('notes', workerFormData.notes || '');

      if (workerPhotoFile) {
        formData.append('photo', workerPhotoFile);
      } else if (workerFormData.photo) {
        formData.append('photo', workerFormData.photo);
      }

      const res = await api.post('/management/workers', formData);
      if (res.data?.success) {
        playWoodenChime();
        setShowAddWorkerModal(false);
        setWorkerPhotoFile(null);
        setWorkerPhotoPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setWorkerFormData({
          name: '', phone: '', role: 'Master Carpenter', wageType: 'daily',
          dailyRate: 900, monthlySalary: 0, aadharNumber: '', bloodGroup: 'O+',
          emergencyContact: '', photo: '', notes: ''
        });
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create worker');
    }
  };

  // Open Edit Worker Modal
  const openEditWorkerModal = (worker) => {
    setEditingWorker(worker);
    setEditWorkerFormData({
      name: worker.name || '',
      phone: worker.phone || '',
      role: worker.role || 'Master Carpenter',
      wageType: worker.wageType || 'daily',
      dailyRate: worker.dailyRate || 900,
      monthlySalary: worker.monthlySalary || 0,
      bloodGroup: worker.bloodGroup || 'O+',
      aadharNumber: worker.aadharNumber || '',
      emergencyContact: worker.emergencyContact || '',
      photo: worker.photo || '',
      isActive: worker.isActive !== false,
      notes: worker.notes || ''
    });
    setEditWorkerPhotoFile(null);
    setEditWorkerPhotoPreview(worker.photo || '');
    setShowEditWorkerModal(true);
  };

  const handleEditPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditWorkerPhotoFile(file);
      setEditWorkerPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveEditPhoto = () => {
    setEditWorkerPhotoFile(null);
    setEditWorkerPhotoPreview('');
    if (editFileInputRef.current) editFileInputRef.current.value = '';
    setEditWorkerFormData(prev => ({ ...prev, photo: '' }));
  };

  // Submit Worker Update
  const handleUpdateWorker = async (e) => {
    e.preventDefault();
    if (!editingWorker?._id) return;
    try {
      const formData = new FormData();
      formData.append('name', editWorkerFormData.name);
      formData.append('phone', editWorkerFormData.phone);
      formData.append('role', editWorkerFormData.role);
      formData.append('wageType', editWorkerFormData.wageType);
      formData.append('dailyRate', editWorkerFormData.dailyRate);
      formData.append('monthlySalary', editWorkerFormData.monthlySalary || 0);
      formData.append('bloodGroup', editWorkerFormData.bloodGroup || 'O+');
      formData.append('aadharNumber', editWorkerFormData.aadharNumber || '');
      formData.append('emergencyContact', editWorkerFormData.emergencyContact || '');
      formData.append('isActive', editWorkerFormData.isActive);
      formData.append('notes', editWorkerFormData.notes || '');

      if (editWorkerPhotoFile) {
        formData.append('photo', editWorkerPhotoFile);
      } else if (editWorkerFormData.photo) {
        formData.append('photo', editWorkerFormData.photo);
      }

      const res = await api.put(`/management/workers/${editingWorker._id}`, formData);
      if (res.data?.success) {
        playWoodenChime();
        setShowEditWorkerModal(false);
        setEditingWorker(null);
        setEditWorkerPhotoFile(null);
        setEditWorkerPhotoPreview('');
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update worker');
    }
  };

  const openIdCardModal = (worker) => {
    setSelectedWorkerForCard(worker);
    setShowIdCardModal(true);
  };

  // =========================================================================
  // PROJECT ACTIONS (ADD, EDIT, DELETE)
  // =========================================================================
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/management/projects', projectFormData);
      if (res.data?.success) {
        playWoodenChime();
        setShowAddProjectModal(false);
        setProjectFormData({ title: '', clientName: '', clientPhone: '', clientCity: 'Rajahmundry', totalBudget: '', targetDate: '', notes: '' });
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  // Open Edit Project Modal
  const openEditProjectModal = (proj) => {
    setEditingProject(proj);
    setEditProjectFormData({
      title: proj.title || '',
      clientName: proj.clientName || '',
      clientPhone: proj.clientPhone || '',
      clientCity: proj.clientCity || 'Rajahmundry',
      totalBudget: proj.totalBudget || '',
      status: proj.status || 'in_progress',
      targetDate: proj.targetDate ? proj.targetDate.substring(0, 10) : '',
      notes: proj.notes || ''
    });
    setShowEditProjectModal(true);
  };

  // Submit Project Update
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editingProject?._id) return;
    try {
      const res = await api.put(`/management/projects/${editingProject._id}`, editProjectFormData);
      if (res.data?.success) {
        playWoodenChime();
        setShowEditProjectModal(false);
        setEditingProject(null);
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update project');
    }
  };

  // =========================================================================
  // GENERAL DELETE MODAL CONFIRMATION HANDLER
  // =========================================================================
  const confirmDelete = (type, item) => {
    setDeleteTarget({ type, item });
    setShowDeleteConfirmModal(true);
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget?.item?._id) return;
    try {
      setDeleteLoading(true);
      if (deleteTarget.type === 'worker') {
        const res = await api.delete(`/management/workers/${deleteTarget.item._id}`);
        if (res.data?.success) {
          playWoodenChime();
          setShowDeleteConfirmModal(false);
          setDeleteTarget(null);
          fetchAllData();
        } else {
          alert(res.data?.message || 'Failed to delete worker');
        }
      } else if (deleteTarget.type === 'project') {
        const res = await api.delete(`/management/projects/${deleteTarget.item._id}`);
        if (res.data?.success) {
          playWoodenChime();
          setShowDeleteConfirmModal(false);
          setDeleteTarget(null);
          fetchAllData();
        } else {
          alert(res.data?.message || 'Failed to delete project');
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Delete operation failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Advances & Project Finances
  const handleCreateAdvance = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/management/advances', advanceFormData);
      if (res.data?.success) {
        playWoodenChime();
        setShowAddAdvanceModal(false);
        setAdvanceFormData({ workerId: '', amount: '', type: 'advance', paymentMode: 'cash', notes: '' });
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record advance');
    }
  };

  const handleAddProjectExpense = async (e) => {
    e.preventDefault();
    if (!selectedProjectForExpense) return;
    try {
      const res = await api.post(`/management/projects/${selectedProjectForExpense._id}/expense`, expenseFormData);
      if (res.data?.success) {
        playWoodenChime();
        setShowAddExpenseModal(false);
        setExpenseFormData({ category: 'Teakwood Logs', description: '', amount: '' });
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleRecordProjectPayment = async (e) => {
    e.preventDefault();
    if (!selectedProjectForPayment) return;
    try {
      const payload = {
        amount: paymentFormData.amount,
        paymentMode: paymentFormData.paymentMode,
        note: paymentFormData.note
      };
      if (paymentFormData.milestoneIndex !== '') {
        payload.milestoneIndex = Number(paymentFormData.milestoneIndex);
      }
      const res = await api.post(`/management/projects/${selectedProjectForPayment._id}/payment`, payload);
      if (res.data?.success) {
        playWoodenChime();
        setShowRecordPaymentModal(false);
        setPaymentFormData({ amount: '', paymentMode: 'upi', note: '', milestoneIndex: '' });
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  // =========================================================================
  // RENDER PIN GATE IF NOT AUTHENTICATED
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#140D08] text-white flex items-center justify-center p-4 antialiased">
        <div className="w-full max-w-md bg-[#1C130D] border border-[#D6A04B]/30 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-scaleUp">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#A64B24] via-[#D6A04B] to-[#F5E6C8] p-[2px] mx-auto shadow-lg">
            <div className="w-full h-full rounded-full bg-[#140D08] flex items-center justify-center">
              <Lock className="h-7 w-7 text-[#D6A04B]" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D6A04B] block mb-1">
              LD INTERIORS WORKSHOP
            </span>
            <h1 className="font-serif text-2xl font-black text-[#F5E6C8]">
              Management &amp; ERP Access
            </h1>
            <p className="text-xs text-stone-400 mt-1 font-light">
              Enter authorized Master PIN to manage staff, ID cards, attendance, and client project budgets.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Security PIN"
                autoFocus
                className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-[#D6A04B]/40 text-center text-lg font-mono tracking-widest text-[#F5E6C8] placeholder:text-stone-500 focus:outline-none focus:border-[#D6A04B] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#D6A04B] cursor-pointer"
                title={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {pinError && (
              <p className="text-xs text-red-400 font-bold animate-fadeIn">{pinError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#D6A04B] to-[#E6B86C] text-[#140D08] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Unlock Management Portal →
            </button>
          </form>

          <div className="pt-2 border-t border-stone-800">
            <Link
              href="/"
              className="text-xs text-stone-400 hover:text-[#D6A04B] transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar navigation items matching the luxury design
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'workers', label: 'Workers', icon: Users },
    { id: 'id_cards', label: 'ID Cards', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'salaries', label: 'Payroll & Payments', icon: Wallet },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal }
  ];

  // Calculated/Fallback display metrics
  const displayTotalProjects = stats?.totalProjectsCount || (projects.length > 0 ? projects.length : 12);
  const displayTotalWorkers = stats?.totalWorkers || (workers.length > 0 ? workers.length : 48);
  const displayIdCards = workers.length > 0 ? workers.length : 48;
  const displayPendingDues = stats?.pendingClientReceivables 
    ? `₹${stats.pendingClientReceivables.toLocaleString('en-IN')}` 
    : "₹3,00,000";
  const displayActiveProjects = stats?.activeProjectsCount || (projects.filter(p => p.status === 'in_progress').length || 10);

  // =========================================================================
  // MAIN LUXURY DASHBOARD LAYOUT
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F7F2E7] text-[#1C130D] flex font-sans antialiased selection:bg-[#D6A04B]/30">
      {/* Print Style Optimization for PVC ID Cards */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-id-card-area, #printable-id-card-area * {
            visibility: visible;
          }
          #printable-id-card-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white !important;
          }
        }
      `}</style>

      {/* ------------------------------------------------------------------- */}
      {/* LEFT SIDEBAR: Deep Rich Espresso Brown Teakwood Theme */}
      {/* ------------------------------------------------------------------- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#160F0A] text-[#C4B7A6] flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
        ${mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Top: Logo & Monogram */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#A64B24] via-[#D6A04B] to-[#F5E6C8] p-[2px] shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-[10px] bg-[#160F0A] flex items-center justify-center font-serif font-black text-sm text-[#F5E6C8]">
                  LD
                </div>
              </div>
              <div>
                <h1 className="font-serif text-base font-black text-[#F5E6C8] tracking-wider leading-none">
                  LD INTERIORS
                </h1>
                <span className="text-[9px] uppercase tracking-widest text-[#D6A04B] font-semibold block mt-1">
                  Design • Build • Inspire
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-stone-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#D6A04B] to-[#E6B86C] text-[#160F0A] font-bold shadow-md' 
                      : 'text-[#C4B7A6] hover:text-[#F5E6C8] hover:bg-white/5'}
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#160F0A]' : 'text-[#D6A04B]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Promo Card & Logout */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="relative rounded-2xl overflow-hidden p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent border border-white/10 shadow-inner group">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-500"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80')` }}
            />
            <div className="relative z-10">
              <h4 className="font-serif text-sm font-bold text-white leading-tight">
                Build Better Together
              </h4>
              <p className="text-[10px] uppercase tracking-wider text-[#D6A04B] font-bold mt-1">
                LD INTERIORS
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA: Luxurious Warm Sand/Cream Palette */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#F7F2E7]/90 backdrop-blur-md border-b border-[#E8DEC8] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/80 border border-[#E8DEC8] text-stone-700 hover:text-[#160F0A]"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, workers, or reports..."
                className="w-full pl-10 pr-20 py-2.5 rounded-full bg-white/90 border border-[#E8DEC8] text-xs text-[#160F0A] placeholder:text-stone-400 focus:outline-none focus:border-[#D6A04B] shadow-xs transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-[#F0E6D2] text-[10px] font-mono font-bold text-stone-600 select-none hidden sm:inline-block">
                Ctrl + K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startCameraScanner}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#160F0A] hover:bg-[#2A1B10] text-[#F5E6C8] text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Launch QR Camera"
            >
              <Camera className="h-3.5 w-3.5 text-[#D6A04B]" />
              <span>QR Scanner</span>
            </button>

            <div className="relative">
              <button 
                onClick={fetchAllData}
                className="p-2.5 rounded-full bg-white/90 border border-[#E8DEC8] text-stone-600 hover:text-[#160F0A] shadow-xs relative cursor-pointer"
                title={`Live IST: ${currentTimeStr} • Click to refresh`}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  3
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2.5 bg-white/90 border border-[#E8DEC8] px-3 py-1.5 rounded-full shadow-xs cursor-pointer hover:border-[#D6A04B] transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#A64B24] to-[#D6A04B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                AD
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-[#160F0A] block leading-tight">Admin</span>
                <span className="text-[10px] text-stone-500 font-medium">Super Admin</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-stone-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Main Body Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* ================================================================= */}
          {/* TAB: DASHBOARD (Matches Screenshot Exact Layout) */}
          {/* ================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              {/* 1. Hero Welcome Banner */}
              <div className="relative rounded-3xl bg-gradient-to-r from-[#160F0A] via-[#24170E] to-[#332014] text-white p-6 sm:p-8 overflow-hidden shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div 
                  className="absolute right-0 inset-y-0 w-full md:w-3/5 bg-cover bg-right opacity-35 mix-blend-screen pointer-events-none"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80')` }}
                />

                <div className="relative z-10 space-y-2 max-w-xl">
                  <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#F5E6C8] tracking-wide">
                    Welcome back, <span className="text-white">Admin!</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#C4B7A6] font-light leading-relaxed">
                    Manage your projects, workforce and operations with ease.
                  </p>
                </div>

                <div className="relative z-10 text-right hidden md:block">
                  <p className="font-serif text-lg font-bold text-[#E6B86C] italic tracking-wide">
                    Crafting Dream Spaces Together
                  </p>
                  <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#D6A04B] to-transparent ml-auto mt-1" />
                </div>
              </div>

              {/* 2. 5 Stat Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white/95 border border-[#E8DFC9] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-stone-500 block">Total Projects</span>
                      <span className="text-2xl font-black font-sans text-[#160F0A] mt-1 block">
                        {displayTotalProjects}
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#F6EFE3] text-[#A64B24] flex items-center justify-center">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F0E6D2]">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      ↑ +20%
                    </span>
                    <svg className="w-12 h-4 text-[#D6A04B]" viewBox="0 0 50 16" fill="none">
                      <path d="M1 12C10 12 15 4 25 8C35 12 40 2 49 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <div className="bg-white/95 border border-[#E8DFC9] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-stone-500 block">Total Workers</span>
                      <span className="text-2xl font-black font-sans text-[#160F0A] mt-1 block">
                        {displayTotalWorkers}
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#F6EFE3] text-[#A64B24] flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F0E6D2]">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      ↑ +12%
                    </span>
                    <svg className="w-12 h-4 text-[#D6A04B]" viewBox="0 0 50 16" fill="none">
                      <path d="M1 14C10 14 18 6 28 9C38 12 42 3 49 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <div className="bg-white/95 border border-[#E8DFC9] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-stone-500 block">ID Cards Generated</span>
                      <span className="text-2xl font-black font-sans text-[#160F0A] mt-1 block">
                        {displayIdCards}
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#F6EFE3] text-[#A64B24] flex items-center justify-center">
                      <CreditCard className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F0E6D2]">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      ↑ +100%
                    </span>
                    <svg className="w-12 h-4 text-[#D6A04B]" viewBox="0 0 50 16" fill="none">
                      <path d="M1 13C12 13 18 5 28 8C38 11 44 2 49 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <div className="bg-white/95 border border-[#E8DFC9] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-stone-500 block">Pending Dues</span>
                      <span className="text-2xl font-black font-sans text-[#160F0A] mt-1 block truncate">
                        {displayPendingDues}
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#F6EFE3] text-[#A64B24] flex items-center justify-center">
                      <Wallet className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F0E6D2]">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      ↑ +5%
                    </span>
                    <svg className="w-12 h-4 text-[#D6A04B]" viewBox="0 0 50 16" fill="none">
                      <path d="M1 10C10 10 18 8 28 11C38 14 42 6 49 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <div className="bg-white/95 border border-[#E8DFC9] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between col-span-2 sm:col-span-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-stone-500 block">Active Projects</span>
                      <span className="text-2xl font-black font-sans text-[#160F0A] mt-1 block">
                        {displayActiveProjects}
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#F6EFE3] text-[#A64B24] flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F0E6D2]">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      ↑ +11%
                    </span>
                    <svg className="w-12 h-4 text-[#D6A04B]" viewBox="0 0 50 16" fill="none">
                      <path d="M1 12C10 12 18 4 28 7C38 10 44 2 49 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 3. Middle Section: Chart + Quick Actions + Workforce Promo Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[#A64B24]" />
                      <h3 className="font-serif text-sm font-bold text-[#160F0A]">
                        Project Overview
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 bg-[#F5EEDB] p-1 rounded-xl text-[10px] font-bold">
                      {['1M', '3M', '6M', '1Y'].map((p) => (
                        <button
                          key={p}
                          onClick={() => setChartPeriod(p)}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            chartPeriod === p
                              ? 'bg-[#D6A04B] text-white shadow-xs font-black'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative pt-4">
                    <div className="absolute top-2 right-6 bg-[#160F0A] text-[#F5E6C8] text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md z-10 flex items-center gap-1">
                      <span>18 Projects</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col justify-between h-36 text-[9px] font-mono text-stone-400 py-1">
                        <span>20</span>
                        <span>15</span>
                        <span>10</span>
                        <span>5</span>
                        <span>0</span>
                      </div>

                      <div className="flex-1 h-36 relative">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#D6A04B" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#D6A04B" stopOpacity="0.02" />
                            </linearGradient>
                          </defs>

                          <line x1="0" y1="0" x2="300" y2="0" stroke="#F0E6D2" strokeDasharray="3 3" />
                          <line x1="0" y1="30" x2="300" y2="30" stroke="#F0E6D2" strokeDasharray="3 3" />
                          <line x1="0" y1="60" x2="300" y2="60" stroke="#F0E6D2" strokeDasharray="3 3" />
                          <line x1="0" y1="90" x2="300" y2="90" stroke="#F0E6D2" strokeDasharray="3 3" />
                          <line x1="0" y1="120" x2="300" y2="120" stroke="#F0E6D2" />

                          <path
                            d="M0,85 C50,75 80,60 120,62 C160,64 190,80 230,70 C260,65 280,30 300,32 L300,120 L0,120 Z"
                            fill="url(#goldGradient)"
                          />

                          <path
                            d="M0,85 C50,75 80,60 120,62 C160,64 190,80 230,70 C260,65 280,30 300,32"
                            fill="none"
                            stroke="#D6A04B"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />

                          <circle cx="0" cy="85" r="3.5" fill="#D6A04B" />
                          <circle cx="60" cy="72" r="3.5" fill="#D6A04B" />
                          <circle cx="120" cy="62" r="3.5" fill="#D6A04B" />
                          <circle cx="180" cy="74" r="3.5" fill="#D6A04B" />
                          <circle cx="240" cy="68" r="3.5" fill="#D6A04B" />
                          <circle cx="300" cy="32" r="4.5" fill="#160F0A" stroke="#D6A04B" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex justify-between pl-6 pt-2 text-[10px] font-sans text-stone-500">
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                      <span>Sep</span>
                      <span>Oct</span>
                      <span>Nov</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[#A64B24]" />
                      <h3 className="font-serif text-sm font-bold text-[#160F0A]">
                        Quick Actions
                      </h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab('projects')}
                      className="w-6 h-6 rounded-full bg-[#F5EEDB] text-stone-700 hover:text-[#160F0A] flex items-center justify-center cursor-pointer"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setShowAddProjectModal(true)}
                      className="p-3 rounded-2xl bg-[#FBF8F2] hover:bg-[#F3EADB] border border-[#ECE2D0] flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group shadow-xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EFE4D0] text-[#A64B24] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-bold text-[#160F0A] leading-tight">
                        Add New Project
                      </span>
                    </button>

                    <button
                      onClick={() => setShowAddWorkerModal(true)}
                      className="p-3 rounded-2xl bg-[#FBF8F2] hover:bg-[#F3EADB] border border-[#ECE2D0] flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group shadow-xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EFE4D0] text-[#A64B24] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-bold text-[#160F0A] leading-tight">
                        Hire Worker
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        if (workers.length > 0) openIdCardModal(workers[0]);
                        else setActiveTab('workers');
                      }}
                      className="p-3 rounded-2xl bg-[#FBF8F2] hover:bg-[#F3EADB] border border-[#ECE2D0] flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group shadow-xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EFE4D0] text-[#A64B24] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-bold text-[#160F0A] leading-tight">
                        Generate ID Cards
                      </span>
                    </button>

                    <button
                      onClick={startCameraScanner}
                      className="p-3 rounded-2xl bg-[#FBF8F2] hover:bg-[#F3EADB] border border-[#ECE2D0] flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group shadow-xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EFE4D0] text-[#A64B24] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-bold text-[#160F0A] leading-tight">
                        Scan QR Punch
                      </span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4 relative rounded-3xl bg-gradient-to-br from-[#160F0A] via-[#24170E] to-[#140D08] text-white p-6 overflow-hidden shadow-md flex flex-col justify-between space-y-4">
                  <div 
                    className="absolute right-0 inset-y-0 w-1/2 bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80')` }}
                  />

                  <div className="relative z-10 space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#D6A04B]/20 border border-[#D6A04B]/40 text-[#E6B86C] text-[10px] font-bold uppercase tracking-wider">
                      Grow Your Business
                    </span>
                    <h3 className="font-serif text-xl font-black text-white leading-tight">
                      Manage Your Workforce Better.
                    </h3>
                    <p className="text-xs text-[#C4B7A6] font-light">
                      Streamline operations, boost productivity.
                    </p>
                  </div>

                  <div className="relative z-10 pt-2">
                    <button
                      onClick={startCameraScanner}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D6A04B] to-[#E6B86C] text-[#160F0A] text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Scan QR Attendance →</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Bottom Section: Recent Projects + Worker Management + Today's Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Recent Projects with Edit & Delete actions */}
                <div className="lg:col-span-5 bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-[#A64B24]" />
                      <h3 className="font-serif text-sm font-bold text-[#160F0A]">
                        Recent Projects
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="text-xs font-bold text-[#A64B24] hover:text-[#D6A04B] flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(projects.length > 0 ? projects.slice(0, 3) : DEFAULT_RECENT_PROJECTS).map((proj, idx) => {
                      const title = proj.title || `Project #${idx + 1}`;
                      const location = proj.clientCity || proj.location || 'Rajahmundry';
                      const dateStr = proj.createdAt 
                        ? new Date(proj.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                        : proj.date || 'Nov 12, 2025';
                      const status = proj.status ? proj.status.replace('_', ' ') : 'On Progress';
                      const image = proj.image || DEFAULT_RECENT_PROJECTS[idx % 3].image;
                      const hasRealId = !!proj._id;

                      return (
                        <div
                          key={proj._id || proj.id || idx}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F9F5EC] transition-colors border border-transparent hover:border-[#E8DFC9]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 shrink-0 shadow-xs">
                              <img src={image} alt={title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-[#160F0A] line-clamp-1">
                                {title}
                              </h4>
                              <p className="text-[10px] text-stone-500 font-medium">
                                📍 {location} • {dateStr}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 capitalize">
                              {status}
                            </span>
                            {hasRealId ? (
                              <>
                                <button 
                                  onClick={() => openEditProjectModal(proj)}
                                  className="p-1 rounded-lg text-stone-400 hover:text-[#A64B24] hover:bg-stone-100 cursor-pointer"
                                  title="Edit Project"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={() => confirmDelete('project', proj)}
                                  className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                  title="Delete Project"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => setActiveTab('projects')}
                                className="text-stone-400 hover:text-stone-700 p-1"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Worker Management Horizontal Artisan Avatars */}
                <div className="lg:col-span-4 bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#A64B24]" />
                      <h3 className="font-serif text-sm font-bold text-[#160F0A]">
                        Worker Management
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('workers')}
                      className="text-xs font-bold text-[#A64B24] hover:text-[#D6A04B] flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 items-center">
                    {(workers.length > 0 ? workers.slice(0, 4) : DEFAULT_WORKERS_ROSTER).map((w, idx) => {
                      const avatar = w.photo || w.avatar || DEFAULT_WORKERS_ROSTER[idx % 4].avatar;
                      const hasRealId = !!w._id;

                      return (
                        <div
                          key={w._id || w.id || idx}
                          className="flex flex-col items-center text-center p-2 rounded-2xl hover:bg-[#F9F5EC] transition-all cursor-pointer group relative"
                        >
                          <div 
                            onClick={() => openIdCardModal(w)}
                            className="w-12 h-12 rounded-full overflow-hidden bg-stone-200 border-2 border-[#D6A04B]/40 shadow-xs mb-1.5 group-hover:scale-105 transition-transform"
                          >
                            <img src={avatar} alt={w.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="font-bold text-[11px] text-[#160F0A] truncate w-full">
                            {w.name}
                          </span>
                          <span className="text-[9px] text-stone-500 truncate w-full">
                            {w.role}
                          </span>

                          {/* Action Links on Hover or default status */}
                          {hasRealId ? (
                            <div className="flex items-center gap-1 mt-1 opacity-80 group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditWorkerModal(w);
                                }}
                                className="p-0.5 text-stone-400 hover:text-[#A64B24] cursor-pointer"
                                title="Edit Worker"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete('worker', w);
                                }}
                                className="p-0.5 text-stone-400 hover:text-red-600 cursor-pointer"
                                title="Delete Worker"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[8px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                              ● Active
                            </span>
                          )}
                        </div>
                      );
                    })}

                    <div
                      onClick={() => setShowAddWorkerModal(true)}
                      className="border-2 border-dashed border-[#D6A04B]/60 hover:border-[#D6A04B] rounded-2xl flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-[#F9F5EC] transition-all h-28"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#EFE4D0] text-[#A64B24] flex items-center justify-center mb-1">
                        <Plus className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold text-[#160F0A] leading-tight">
                        + Add Worker
                      </span>
                    </div>
                  </div>
                </div>

                {/* Today's Summary */}
                <div className="lg:col-span-3 bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#A64B24]" />
                    <h3 className="font-serif text-sm font-bold text-[#160F0A]">
                      Today&apos;s Summary
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-stone-600">
                        <Users className="h-3.5 w-3.5 text-emerald-600" />
                        <span>New Attendance</span>
                      </div>
                      <span className="font-bold font-mono text-[#160F0A]">
                        {stats?.presentCount || attendances.length || 48}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-stone-600">
                        <FolderKanban className="h-3.5 w-3.5 text-[#D6A04B]" />
                        <span>New Projects</span>
                      </div>
                      <span className="font-bold font-mono text-[#160F0A]">
                        {projects.length > 0 ? projects.length : 2}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-stone-600">
                        <Wallet className="h-3.5 w-3.5 text-amber-600" />
                        <span>Payments Received</span>
                      </div>
                      <span className="font-bold font-mono text-[#160F0A]">
                        ₹75,000
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#FAF3E5] border border-[#EADDC5] rounded-2xl p-3 text-center space-y-1">
                    <svg className="w-16 h-8 mx-auto text-[#A64B24]/40" viewBox="0 0 60 30" fill="none">
                      <path d="M5 25L30 5L55 25H5Z" stroke="currentColor" strokeWidth="2" />
                      <path d="M15 25V17H45V25" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="25" y1="25" x2="25" y2="17" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="35" y1="25" x2="35" y2="17" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-wider font-serif font-black text-[#8B5A2B] block">
                      Building Dreams
                    </span>
                    <span className="text-[8px] text-stone-500 font-sans block">
                      Since Day One
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: PROJECTS (Full Costing, Edit & Delete) */}
          {/* ================================================================= */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#160F0A]">
                    Client Interior Projects &amp; Costing
                  </h2>
                  <p className="text-xs text-stone-500 font-light">
                    Track client quotations, stage-wise payments, wood/material expenses, and calculate net profit.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddProjectModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A64B24] to-[#D6A04B] text-white text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Client Project</span>
                </button>
              </div>

              {/* Projects List */}
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl p-12 text-center space-y-3">
                    <FolderKanban className="h-10 w-10 text-stone-400 mx-auto" />
                    <h3 className="font-serif text-base font-bold text-stone-700">No client projects registered yet</h3>
                    <p className="text-xs text-stone-500">Click &quot;New Client Project&quot; above to log your first interior design project.</p>
                  </div>
                ) : (
                  projects.map((proj) => {
                    const totalExpenses = (proj.materialsCost || 0) + (proj.laborCost || 0) + (proj.transportCost || 0);
                    const pendingBalance = Math.max(0, (proj.totalBudget || 0) - (proj.receivedAmount || 0));
                    const netProfit = (proj.receivedAmount || 0) - totalExpenses;
                    const profitMargin = proj.receivedAmount > 0 ? Math.round((netProfit / proj.receivedAmount) * 100) : 0;

                    return (
                      <div
                        key={proj._id}
                        className="bg-white/95 border border-[#E8DFC9] hover:border-[#D6A04B]/60 rounded-3xl p-6 shadow-xs space-y-4 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E6D2] pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-[#D6A04B]/20 text-[#A64B24] text-[10px] font-mono font-bold">
                                {proj.projectId}
                              </span>
                              <h3 className="font-serif text-base sm:text-lg font-bold text-[#160F0A]">
                                {proj.title}
                              </h3>
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5">
                              Client: <strong className="text-stone-800">{proj.clientName}</strong> • {proj.clientCity} {proj.clientPhone ? `• 📞 ${proj.clientPhone}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 w-fit">
                              {proj.status?.replace('_', ' ')}
                            </span>

                            {/* Edit Project Button */}
                            <button
                              onClick={() => openEditProjectModal(proj)}
                              className="px-2.5 py-1.5 rounded-xl bg-[#F5EEDB] hover:bg-[#EBDDC3] text-[#160F0A] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-[#E8DFC9]"
                              title="Edit Project Details"
                            >
                              <Pencil className="h-3.5 w-3.5 text-[#A64B24]" />
                              <span>Edit</span>
                            </button>

                            {/* Delete Project Button */}
                            <button
                              onClick={() => confirmDelete('project', proj)}
                              className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Delete Project"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-[#FBF8F2] p-4 rounded-2xl border border-[#ECE2D0]">
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase font-mono block">Total Budget</span>
                            <span className="text-lg font-black font-mono text-[#160F0A]">
                              ₹{proj.totalBudget?.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase font-mono block">Received Amount</span>
                            <span className="text-lg font-black font-mono text-emerald-700">
                              ₹{(proj.receivedAmount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase font-mono block">Pending Balance</span>
                            <span className="text-lg font-black font-mono text-amber-700">
                              ₹{pendingBalance.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase font-mono block">Estimated Net Profit</span>
                            <span className={`text-lg font-black font-mono ${netProfit >= 0 ? 'text-[#8B5A2B]' : 'text-red-600'}`}>
                              ₹{netProfit.toLocaleString('en-IN')} ({profitMargin}%)
                            </span>
                          </div>
                        </div>

                        {/* Milestones & Expenses Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#ECE2D0] space-y-2">
                            <div className="flex items-center justify-between pb-2 border-b border-[#E8DEC8]">
                              <span className="text-xs font-bold text-stone-700 font-mono">Payment Stages</span>
                              <button
                                onClick={() => {
                                  setSelectedProjectForPayment(proj);
                                  setShowRecordPaymentModal(true);
                                }}
                                className="text-[11px] font-bold text-[#A64B24] hover:underline"
                              >
                                + Record Payment
                              </button>
                            </div>
                            <div className="space-y-1.5 divide-y divide-[#E8DEC8]/60">
                              {proj.milestones?.map((m, idx) => (
                                <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                                  <span className="text-stone-700">{m.title}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-stone-900 font-bold">₹{m.amount.toLocaleString('en-IN')}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                      m.status === 'received' 
                                        ? 'bg-emerald-100 text-emerald-800' 
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {m.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#ECE2D0] space-y-2">
                            <div className="flex items-center justify-between pb-2 border-b border-[#E8DEC8]">
                              <span className="text-xs font-bold text-stone-700 font-mono">
                                Expenses (₹{totalExpenses.toLocaleString('en-IN')})
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedProjectForExpense(proj);
                                  setShowAddExpenseModal(true);
                                }}
                                className="text-[11px] font-bold text-[#A64B24] hover:underline"
                              >
                                + Add Expense
                              </button>
                            </div>
                            <div className="space-y-1.5 divide-y divide-[#E8DEC8]/60 max-h-36 overflow-y-auto">
                              {proj.expenses?.length === 0 ? (
                                <p className="text-[11px] text-stone-400 py-2">No expenses logged yet.</p>
                              ) : (
                                proj.expenses?.map((e, idx) => (
                                  <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                                    <div>
                                      <span className="text-stone-800 block">{e.description}</span>
                                      <span className="text-[9px] text-[#A64B24] uppercase font-bold">{e.category}</span>
                                    </div>
                                    <span className="font-mono text-red-600 font-bold">₹{e.amount.toLocaleString('en-IN')}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: WORKERS (Directory, Registration, Edit & Delete) */}
          {/* ================================================================= */}
          {activeTab === 'workers' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#160F0A]">
                    Staff &amp; Workshop Artisans
                  </h2>
                  <p className="text-xs text-stone-500 font-light">
                    Manage worker profiles, daily wages, edit details, and generate official PVC ID Badges.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddWorkerModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A64B24] to-[#D6A04B] text-white text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register New Worker</span>
                </button>
              </div>

              {/* Workers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {workers.map((worker) => (
                  <div
                    key={worker._id}
                    className="bg-white/95 border border-[#E8DFC9] hover:border-[#D6A04B] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#F6EFE3] border border-[#D6A04B]/40 text-[#8B5A2B] flex items-center justify-center font-bold text-base shadow-xs overflow-hidden shrink-0">
                          {worker.photo ? (
                            <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover" />
                          ) : (
                            worker.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-serif text-sm font-bold text-[#160F0A]">
                              {worker.name}
                            </h4>
                            {worker.isActive === false && (
                              <span className="px-1.5 py-0.2 rounded text-[8px] bg-red-100 text-red-700 font-bold">
                                Inactive
                              </span>
                            )}
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-[#D6A04B]/20 text-[#A64B24] text-[9px] font-bold uppercase inline-block">
                            {worker.role}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-stone-500 bg-[#F0E6D2] px-2 py-0.5 rounded-md">
                        {worker.workerId}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-600 border-t border-[#F0E6D2] pt-3">
                      <div className="flex justify-between">
                        <span>Daily Wage:</span>
                        <span className="font-mono font-bold text-[#8B5A2B]">₹{worker.dailyRate} / day</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <span className="font-mono text-stone-800">{worker.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blood Group:</span>
                        <span className="font-mono text-red-600 font-bold">{worker.bloodGroup || 'O+'}</span>
                      </div>
                    </div>

                    {/* Action Buttons: ID Card + Edit + Delete */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => openIdCardModal(worker)}
                        className="flex-1 py-2 rounded-xl bg-[#F5EEDB] hover:bg-[#EBDDC3] border border-[#D6A04B]/40 text-[#8B5A2B] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="View & Print PVC ID Badge"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>ID Card</span>
                      </button>

                      <button
                        onClick={() => openEditWorkerModal(worker)}
                        className="p-2 rounded-xl bg-[#F0E6D2] hover:bg-[#E2D5BE] text-[#160F0A] border border-[#E8DFC9] transition-all cursor-pointer"
                        title="Edit Worker Profile"
                      >
                        <Pencil className="h-3.5 w-3.5 text-[#A64B24]" />
                      </button>

                      <button
                        onClick={() => confirmDelete('worker', worker)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all cursor-pointer"
                        title="Delete Worker"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: ID CARDS GALLERY */}
          {/* ================================================================= */}
          {activeTab === 'id_cards' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#160F0A]">
                    Official PVC ID Badges Gallery
                  </h2>
                  <p className="text-xs text-stone-500 font-light">
                    Preview, edit, or batch print official workshop PVC badges with high-resolution attendance QR codes.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddWorkerModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A64B24] to-[#D6A04B] text-white text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Staff Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workers.map((worker) => (
                  <div
                    key={worker._id}
                    className="bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 shadow-xs space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div className="rounded-2xl bg-gradient-to-b from-[#160F0A] to-[#26190F] p-4 text-white space-y-3 relative overflow-hidden shadow-md">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#D6A04B] text-[#160F0A] flex items-center justify-center font-serif font-black text-[9px]">
                            LD
                          </div>
                          <span className="font-serif text-[10px] font-black text-[#F5E6C8] tracking-widest">
                            LD INTERIORS
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#A64B24] text-white text-[8px] font-bold uppercase">
                          STAFF
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl border border-[#D6A04B] overflow-hidden bg-stone-800 shrink-0">
                          {worker.photo ? (
                            <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-lg text-[#D6A04B]">
                              {worker.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="leading-tight space-y-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-[#D6A04B] font-bold block">
                            {worker.role}
                          </span>
                          <h4 className="font-serif text-sm font-bold text-white">
                            {worker.name}
                          </h4>
                          <p className="text-[10px] font-mono text-[#F5E6C8]">
                            ID: {worker.workerId}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openIdCardModal(worker)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#A64B24] to-[#D6A04B] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Print PVC Card</span>
                      </button>

                      <button
                        onClick={() => openEditWorkerModal(worker)}
                        className="p-2.5 rounded-xl bg-[#F0E6D2] hover:bg-[#E2D5BE] text-[#160F0A] border border-[#E8DFC9] transition-all cursor-pointer"
                        title="Edit Worker"
                      >
                        <Pencil className="h-4 w-4 text-[#A64B24]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: ATTENDANCE (Live Sheet & Scanner) */}
          {/* ================================================================= */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#160F0A]">
                    Daily Attendance Tracker
                  </h2>
                  <p className="text-xs text-stone-500 font-light">
                    Scan QR codes or use quick toggle buttons to record attendance and daily wages.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#F5EEDB] border border-[#E8DFC9] text-xs font-mono text-[#160F0A] focus:outline-none focus:border-[#D6A04B]"
                  />

                  <button
                    onClick={startCameraScanner}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A64B24] to-[#D6A04B] text-white text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Scan QR Code</span>
                  </button>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl overflow-hidden shadow-xs">
                <div className="p-4 sm:p-5 border-b border-[#F0E6D2] flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 font-mono">
                    All Active Workers ({workers.length})
                  </span>
                  <span className="text-xs font-bold text-[#8B5A2B] font-mono">
                    Total Day Wages: ₹{attendances.reduce((acc, a) => acc + (a.dailyWageEarned || 0), 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="divide-y divide-[#F0E6D2] overflow-x-auto">
                  {workers.map((worker) => {
                    const att = attendances.find(a => a.workerId === worker.workerId);
                    const currentStatus = att ? att.status : 'absent';

                    return (
                      <div
                        key={worker._id}
                        className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#F9F5EC] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#F6EFE3] border border-[#D6A04B]/40 text-[#8B5A2B] flex items-center justify-center font-bold text-sm overflow-hidden">
                            {worker.photo ? (
                              <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover" />
                            ) : (
                              worker.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs sm:text-sm text-[#160F0A]">
                                {worker.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-md bg-[#F0E6D2] text-[#A64B24] text-[9px] font-mono font-bold">
                                {worker.workerId}
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-500 font-light block">
                              {worker.role} • ₹{worker.dailyRate}/day
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {att?.checkInTime && (
                            <span className="text-[10px] text-stone-500 font-mono mr-2 hidden md:inline">
                              Punched {att.checkInTime}
                            </span>
                          )}

                          <div className="flex items-center bg-[#F5EEDB] p-1 rounded-xl border border-[#E8DFC9] gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleAttendanceStatus(worker.workerId, 'present')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-stone-600 hover:text-stone-900'
                              }`}
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleAttendanceStatus(worker.workerId, 'half_day')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                currentStatus === 'half_day'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'text-stone-600 hover:text-stone-900'
                              }`}
                            >
                              Half Day
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleAttendanceStatus(worker.workerId, 'absent')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                currentStatus === 'absent'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'text-stone-600 hover:text-stone-900'
                              }`}
                            >
                              Absent
                            </button>
                          </div>

                          <span className="text-xs font-mono font-bold text-[#8B5A2B] w-14 text-right">
                            ₹{att ? att.dailyWageEarned : 0}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: PAYROLL & PAYMENTS (Salary Khata) */}
          {/* ================================================================= */}
          {activeTab === 'salaries' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#160F0A]">
                    Salary &amp; Advance Khata Book
                  </h2>
                  <p className="text-xs text-stone-500 font-light">
                    Track weekly/monthly wages, advance deductions, and payout settlements.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#F5EEDB] border border-[#E8DFC9] text-xs font-mono text-[#160F0A] focus:outline-none focus:border-[#D6A04B]"
                  />

                  <button
                    onClick={() => setShowAddAdvanceModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A64B24] to-[#D6A04B] text-white text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Give Advance / Payout</span>
                  </button>
                </div>
              </div>

              {/* Salary Summary Table */}
              <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl overflow-hidden shadow-xs">
                <div className="p-4 sm:p-5 border-b border-[#F0E6D2] flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 font-mono">
                    Monthly Wage Calculations for {selectedMonth}
                  </span>
                  <span className="text-xs font-bold text-[#8B5A2B] font-mono">
                    Total Payable: ₹{salarySummary.reduce((acc, s) => acc + s.netPayable, 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-800">
                    <thead className="bg-[#FAF3E5] text-stone-600 uppercase font-mono text-[10px] border-b border-[#E8DFC9]">
                      <tr>
                        <th className="p-3.5">Worker</th>
                        <th className="p-3.5">Daily Rate</th>
                        <th className="p-3.5">Days Worked</th>
                        <th className="p-3.5">Gross Wages</th>
                        <th className="p-3.5 text-red-600">Advances Deducted</th>
                        <th className="p-3.5 text-[#8B5A2B]">Net Balance</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E6D2]">
                      {salarySummary.map((s) => (
                        <tr key={s.workerId} className="hover:bg-[#F9F5EC] transition-colors">
                          <td className="p-3.5">
                            <span className="font-bold text-[#160F0A] block">{s.name}</span>
                            <span className="text-[10px] text-stone-500 font-mono">{s.workerId} • {s.role}</span>
                          </td>
                          <td className="p-3.5 font-mono">₹{s.dailyRate}</td>
                          <td className="p-3.5 font-mono text-emerald-700 font-bold">{s.effectiveDays} Days</td>
                          <td className="p-3.5 font-mono font-bold text-[#160F0A]">₹{s.grossEarnings.toLocaleString('en-IN')}</td>
                          <td className="p-3.5 font-mono text-red-600 font-bold">-₹{s.advancesTaken.toLocaleString('en-IN')}</td>
                          <td className="p-3.5 font-mono font-black text-[#8B5A2B] text-sm">
                            ₹{s.netPayable.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setAdvanceFormData({
                                  workerId: s.workerId,
                                  amount: s.netPayable > 0 ? s.netPayable : '',
                                  type: 'salary_payout',
                                  paymentMode: 'cash',
                                  notes: `Settlement for ${selectedMonth}`
                                });
                                setShowAddAdvanceModal(true);
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold uppercase transition-all shadow-xs cursor-pointer"
                            >
                              Pay &amp; Settle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: REPORTS */}
          {/* ================================================================= */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl p-5">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#160F0A]">
                  Workshop Analytics &amp; Reports
                </h2>
                <p className="text-xs text-stone-500 font-light">
                  High-level reporting on workforce productivity, monthly labor expenses, and client contract profitability.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 space-y-3">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Attendance Rate</span>
                  <span className="text-3xl font-black text-emerald-700 font-sans block">94.8%</span>
                  <p className="text-xs text-stone-500">Average on-time attendance this month</p>
                </div>

                <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 space-y-3">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Gross Labor Expense</span>
                  <span className="text-3xl font-black text-[#8B5A2B] font-sans block">
                    ₹{salarySummary.reduce((acc, s) => acc + s.grossEarnings, 0).toLocaleString('en-IN')}
                  </span>
                  <p className="text-xs text-stone-500">Earned wages for active artisans</p>
                </div>

                <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl p-5 space-y-3">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Active Contracts</span>
                  <span className="text-3xl font-black text-sky-700 font-sans block">{displayActiveProjects}</span>
                  <p className="text-xs text-stone-500">Currently in progress at workshop</p>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: SETTINGS */}
          {/* ================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl p-5">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#160F0A]">
                  Workshop Settings &amp; Security
                </h2>
                <p className="text-xs text-stone-500 font-light">
                  Configure default wage rates, working shift timings, and ERP access credentials.
                </p>
              </div>

              <div className="bg-white/95 border border-[#E8DFC9] rounded-3xl p-6 space-y-5 max-w-xl">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Workshop Shift Timings</label>
                  <input
                    type="text"
                    defaultValue="09:00 AM - 06:30 PM (IST)"
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5EEDB] border border-[#E8DFC9] text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Standard Daily Carpenter Rate</label>
                  <input
                    type="text"
                    defaultValue="₹900 - ₹1200 / day"
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5EEDB] border border-[#E8DFC9] text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">ERP Master PIN Protection</label>
                  <input
                    type="password"
                    defaultValue="•••••••"
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5EEDB] border border-[#E8DFC9] text-xs text-stone-800 font-mono"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">PIN configured and active.</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: QR CODE LIVE CAMERA SCANNER */}
      {/* ===================================================================== */}
      {showQrScanner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#160F0A] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-center relative text-white">
            <button
              onClick={stopCameraScanner}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D6A04B] block mb-1">
                ATTENDANCE CAMERA SCANNER
              </span>
              <h3 className="font-serif text-lg font-black text-white">
                Hold Worker ID Card to Camera
              </h3>
            </div>

            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-dashed border-[#D6A04B]/60 shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-8 border-2 border-[#D6A04B] rounded-2xl pointer-events-none animate-pulse flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-3 h-3 border-t-2 border-l-2 border-[#D6A04B]" />
                  <div className="w-3 h-3 border-t-2 border-r-2 border-[#D6A04B]" />
                </div>
                <span className="text-[9px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded-full mx-auto">
                  Align QR Code inside box
                </span>
                <div className="flex justify-between">
                  <div className="w-3 h-3 border-b-2 border-l-2 border-[#D6A04B]" />
                  <div className="w-3 h-3 border-b-2 border-r-2 border-[#D6A04B]" />
                </div>
              </div>
            </div>

            {scannerResult && (
              <div className="bg-emerald-950 border border-emerald-600 rounded-2xl p-4 text-left animate-scaleUp">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{scannerResult.worker?.name}</h4>
                    <p className="text-[11px] text-emerald-300 font-mono">
                      {scannerResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleManualScanSubmit} className="pt-2 border-t border-stone-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={manualQrInput}
                  onChange={(e) => setManualQrInput(e.target.value)}
                  placeholder="Or enter Worker ID (e.g. LDI-W101)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-xs font-mono text-white focus:outline-none focus:border-[#D6A04B]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#D6A04B] text-[#160F0A] text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Punch
                </button>
              </div>
              <p className="text-[10px] text-stone-400 font-light">
                Works with USB/Bluetooth laser scanners or manual typing.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: OFFICIAL PVC ID CARD GENERATOR & PRINT */}
      {/* ===================================================================== */}
      {showIdCardModal && selectedWorkerForCard && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#160F0A] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 text-center relative text-white">
            <button
              onClick={() => setShowIdCardModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D6A04B] block mb-1">
                OFFICIAL WORKSHOP BADGE
              </span>
              <h3 className="font-serif text-lg font-black text-white">
                Worker PVC ID Card Preview
              </h3>
            </div>

            {/* Printable ID Card Container */}
            <div id="printable-id-card-area" className="flex flex-col sm:flex-row gap-4 items-center justify-center py-2">
              {/* FRONT OF ID CARD */}
              <div className="w-[320px] h-[200px] rounded-2xl bg-gradient-to-b from-[#160F0A] via-[#24170E] to-[#160F0A] border-2 border-[#D6A04B] p-3 text-left relative flex flex-col justify-between shadow-2xl select-none overflow-hidden text-white">
                <div className="flex items-center justify-between border-b border-[#D6A04B]/40 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#D6A04B] text-[#160F0A] flex items-center justify-center font-serif font-black text-[9px]">
                      LD
                    </div>
                    <div>
                      <h5 className="font-serif text-[10px] font-black text-[#F5E6C8] tracking-widest">
                        LD INTERIORS
                      </h5>
                      <span className="text-[7px] text-[#D6A04B] uppercase tracking-wider block font-bold">
                        HANDCRAFTED TEAKWOOD
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#A64B24] text-white text-[7.5px] font-black uppercase tracking-wider">
                    STAFF
                  </span>
                </div>

                <div className="flex items-center gap-3 my-auto">
                  <div className="w-16 h-16 rounded-xl border-2 border-[#D6A04B] overflow-hidden bg-stone-800 text-[#D6A04B] flex items-center justify-center font-serif font-black text-xl shrink-0 shadow-sm">
                    {selectedWorkerForCard.photo ? (
                      <img src={selectedWorkerForCard.photo} alt={selectedWorkerForCard.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedWorkerForCard.name.charAt(0)
                    )}
                  </div>

                  <div className="space-y-0.5 leading-tight">
                    <span className="text-[8px] uppercase tracking-wider text-[#D6A04B] font-bold block">
                      {selectedWorkerForCard.role}
                    </span>
                    <h4 className="font-serif text-sm font-black text-white line-clamp-1">
                      {selectedWorkerForCard.name}
                    </h4>
                    <p className="text-[9px] font-mono text-[#F5E6C8] font-bold">
                      ID: {selectedWorkerForCard.workerId}
                    </p>
                    <p className="text-[8px] font-mono text-stone-300">
                      Blood Group: <strong className="text-red-400">{selectedWorkerForCard.bloodGroup || 'O+'}</strong>
                    </p>
                    <p className="text-[8px] font-mono text-stone-400">
                      Phone: {selectedWorkerForCard.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[7.5px] text-[#F5E6C8]/80 font-mono pt-1 border-t border-[#D6A04B]/30">
                  <span>Rajahmundry, AP</span>
                  <span className="text-[#D6A04B] font-bold">Authorized Artisan</span>
                </div>
              </div>

              {/* BACK OF ID CARD */}
              <div className="w-[320px] h-[200px] rounded-2xl bg-[#F5E6C8] border-2 border-[#D6A04B] p-3 text-left relative flex flex-col justify-between shadow-2xl select-none overflow-hidden text-[#160F0A]">
                <div className="text-center border-b border-[#160F0A]/20 pb-1">
                  <span className="text-[8px] font-black uppercase tracking-wider text-[#A64B24]">
                    ATTENDANCE &amp; VERIFICATION QR
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3 my-auto">
                  <div className="w-24 h-24 p-1 bg-white rounded-xl border border-[#160F0A]/30 shadow-xs flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LDI-WORKER:${selectedWorkerForCard.workerId}&color=160F0A&bgcolor=FFFFFF`}
                      alt="Worker QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[8px] text-[#160F0A] space-y-1 font-sans">
                    <p className="font-bold">Instructions:</p>
                    <p>• Scan daily at workshop for instant attendance punch.</p>
                    <p>• Emergency: +91 6281653998</p>
                    <p>• Valid at all LD Interiors job sites.</p>
                  </div>
                </div>

                <div className="text-center text-[7.5px] text-[#160F0A]/70 font-mono pt-1 border-t border-[#160F0A]/20">
                  LD Interiors Handcrafted Teakwood • Rajahmundry
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#D6A04B] to-[#E6B86C] text-[#160F0A] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Official PVC ID Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: REGISTER NEW WORKER */}
      {/* ===================================================================== */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#160F0A] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-left relative max-h-[90vh] overflow-y-auto text-white">
            <button
              onClick={() => setShowAddWorkerModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D6A04B] block mb-1">
                STAFF ENROLLMENT
              </span>
              <h3 className="font-serif text-lg font-black text-white">
                Register New Artisan / Worker
              </h3>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={workerFormData.name}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={workerFormData.phone}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-bold block mb-1">Role / Craft *</label>
                  <select
                    value={workerFormData.role}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Daily Wage (₹/day) *</label>
                  <input
                    type="number"
                    required
                    value={workerFormData.dailyRate}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, dailyRate: e.target.value })}
                    placeholder="900"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-bold block mb-1">Blood Group</label>
                  <select
                    value={workerFormData.bloodGroup}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, bloodGroup: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  >
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">
                  Artisan Photo (Select from Gallery / Camera)
                </label>
                
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                <div className="flex items-center gap-3 bg-black/30 p-2.5 rounded-2xl border border-stone-700/80">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-[#D6A04B]/60 bg-black/50 hover:bg-[#D6A04B]/10 transition-colors flex items-center justify-center cursor-pointer overflow-hidden shrink-0 group relative"
                    title="Tap to select photo from gallery"
                  >
                    {workerPhotoPreview || workerFormData.photo ? (
                      <img 
                        src={workerPhotoPreview || workerFormData.photo} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-1">
                        <Camera className="h-5 w-5 text-[#D6A04B] mx-auto group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] text-stone-400 font-bold block mt-0.5">Gallery</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#A64B24] to-[#D6A04B] text-white text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Camera className="h-3 w-3" />
                        <span>Choose from Gallery</span>
                      </button>

                      {(workerPhotoPreview || workerFormData.photo) && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="url"
                      value={workerFormData.photo}
                      onChange={(e) => {
                        setWorkerFormData({ ...workerFormData, photo: e.target.value });
                        if (e.target.value) setWorkerPhotoPreview(e.target.value);
                      }}
                      placeholder="Or paste image link (optional)"
                      className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-stone-700 text-[10px] text-white focus:outline-none focus:border-[#D6A04B]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={workerFormData.emergencyContact}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, emergencyContact: e.target.value })}
                  placeholder="Family member phone"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#D6A04B] to-[#E6B86C] text-[#160F0A] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Save &amp; Generate ID Card →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3B: EDIT WORKER DETAILS */}
      {/* ===================================================================== */}
      {showEditWorkerModal && editingWorker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#160F0A] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-left relative max-h-[90vh] overflow-y-auto text-white">
            <button
              onClick={() => setShowEditWorkerModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D6A04B] block mb-1">
                UPDATE WORKER • {editingWorker.workerId}
              </span>
              <h3 className="font-serif text-lg font-black text-white">
                Edit Artisan Profile ({editingWorker.name})
              </h3>
            </div>

            <form onSubmit={handleUpdateWorker} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editWorkerFormData.name}
                  onChange={(e) => setEditWorkerFormData({ ...editWorkerFormData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editWorkerFormData.phone}
                    onChange={(e) => setEditWorkerFormData({ ...editWorkerFormData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-bold block mb-1">Role / Craft *</label>
                  <select
                    value={editWorkerFormData.role}
                    onChange={(e) => setEditWorkerFormData({ ...editWorkerFormData, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Daily Wage (₹/day) *</label>
                  <input
                    type="number"
                    required
                    value={editWorkerFormData.dailyRate}
                    onChange={(e) => setEditWorkerFormData({ ...editWorkerFormData, dailyRate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-bold block mb-1">Blood Group</label>
                  <select
                    value={editWorkerFormData.bloodGroup}
                    onChange={(e) => setEditWorkerFormData({ ...editWorkerFormData, bloodGroup: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  >
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Active toggle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Status</label>
                  <select
                    value={editWorkerFormData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditWorkerFormData({ ...editWorkerFormData, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  >
                    <option value="active">Active (Working)</option>
                    <option value="inactive">Inactive / On Leave</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-300 font-bold block mb-1">Aadhar Number</label>
                  <input
                    type="text"
                    value={editWorkerFormData.aadharNumber}
                    onChange={(e) => setEditWorkerFormData({ ...editWorkerFormData, aadharNumber: e.target.value })}
                    placeholder="12-digit Aadhar"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>
              </div>

              {/* Photo Update Section */}
              <div>
                <label className="text-stone-300 font-bold block mb-1">
                  Artisan Photo (Update from Gallery or URL)
                </label>
                
                <input
                  type="file"
                  accept="image/*"
                  ref={editFileInputRef}
                  onChange={handleEditPhotoSelect}
                  className="hidden"
                />

                <div className="flex items-center gap-3 bg-black/30 p-2.5 rounded-2xl border border-stone-700/80">
                  <div 
                    onClick={() => editFileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-[#D6A04B]/60 bg-black/50 hover:bg-[#D6A04B]/10 transition-colors flex items-center justify-center cursor-pointer overflow-hidden shrink-0 group relative"
                    title="Tap to select new photo"
                  >
                    {editWorkerPhotoPreview || editWorkerFormData.photo ? (
                      <img 
                        src={editWorkerPhotoPreview || editWorkerFormData.photo} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-1">
                        <Camera className="h-5 w-5 text-[#D6A04B] mx-auto group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] text-stone-400 font-bold block mt-0.5">Gallery</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#A64B24] to-[#D6A04B] text-white text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Camera className="h-3 w-3" />
                        <span>Change Photo</span>
                      </button>

                      {(editWorkerPhotoPreview || editWorkerFormData.photo) && (
                        <button
                          type="button"
                          onClick={handleRemoveEditPhoto}
                          className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="url"
                      value={editWorkerFormData.photo}
                      onChange={(e) => {
                        setEditWorkerFormData({ ...editWorkerFormData, photo: e.target.value });
                        if (e.target.value) setEditWorkerPhotoPreview(e.target.value);
                      }}
                      placeholder="Or photo link"
                      className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-stone-700 text-[10px] text-white focus:outline-none focus:border-[#D6A04B]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={editWorkerFormData.emergencyContact}
                  onChange={(e) => setEditWorkerFormData({ ...editWorkerFormData, emergencyContact: e.target.value })}
                  placeholder="Family phone"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#D6A04B] to-[#E6B86C] text-[#160F0A] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Save Worker Changes →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: RECORD ADVANCE / PAYOUT */}
      {/* ===================================================================== */}
      {showAddAdvanceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#160F0A] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left relative text-white">
            <button
              onClick={() => setShowAddAdvanceModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D6A04B] block mb-1">
                KHATA TRANSACTION
              </span>
              <h3 className="font-serif text-lg font-black text-white">
                Record Advance or Salary Payout
              </h3>
            </div>

            <form onSubmit={handleCreateAdvance} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-bold block mb-1">Select Worker *</label>
                <select
                  required
                  value={advanceFormData.workerId}
                  onChange={(e) => setAdvanceFormData({ ...advanceFormData, workerId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                >
                  <option value="">-- Choose Worker --</option>
                  {workers.map(w => (
                    <option key={w.workerId} value={w.workerId}>{w.name} ({w.workerId} - {w.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={advanceFormData.amount}
                    onChange={(e) => setAdvanceFormData({ ...advanceFormData, amount: e.target.value })}
                    placeholder="e.g. 2000"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-bold block mb-1">Type *</label>
                  <select
                    value={advanceFormData.type}
                    onChange={(e) => setAdvanceFormData({ ...advanceFormData, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  >
                    <option value="advance">Advance (Deduction)</option>
                    <option value="salary_payout">Salary Settlement</option>
                    <option value="bonus">Bonus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Payment Mode</label>
                <select
                  value={advanceFormData.paymentMode}
                  onChange={(e) => setAdvanceFormData({ ...advanceFormData, paymentMode: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / GPay / PhonePe</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Notes / Reason</label>
                <input
                  type="text"
                  value={advanceFormData.notes}
                  onChange={(e) => setAdvanceFormData({ ...advanceFormData, notes: e.target.value })}
                  placeholder="e.g. Festival advance / Medical"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#D6A04B] to-[#E6B86C] text-[#160F0A] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Save Transaction →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: NEW CLIENT PROJECT */}
      {/* ===================================================================== */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#160F0A] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-left relative max-h-[90vh] overflow-y-auto text-white">
            <button
              onClick={() => setShowAddProjectModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D6A04B] block mb-1">
                NEW CONTRACT
              </span>
              <h3 className="font-serif text-lg font-black text-white">
                Create Client Interior Project
              </h3>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-bold block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projectFormData.title}
                  onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                  placeholder="e.g. Suresh Garu Villa Teakwood Mandir & Doors"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={projectFormData.clientName}
                    onChange={(e) => setProjectFormData({ ...projectFormData, clientName: e.target.value })}
                    placeholder="Client Name"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-bold block mb-1">Client Phone</label>
                  <input
                    type="tel"
                    value={projectFormData.clientPhone}
                    onChange={(e) => setProjectFormData({ ...projectFormData, clientPhone: e.target.value })}
                    placeholder="Phone Number"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Total Agreed Budget (₹) *</label>
                  <input
                    type="number"
                    required
                    value={projectFormData.totalBudget}
                    onChange={(e) => setProjectFormData({ ...projectFormData, totalBudget: e.target.value })}
                    placeholder="e.g. 350000"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-bold block mb-1">Client City</label>
                  <input
                    type="text"
                    value={projectFormData.clientCity}
                    onChange={(e) => setProjectFormData({ ...projectFormData, clientCity: e.target.value })}
                    placeholder="Rajahmundry"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#D6A04B] to-[#E6B86C] text-[#160F0A] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Create Project &amp; Milestones →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5B: EDIT CLIENT PROJECT */}
      {/* ===================================================================== */}
      {showEditProjectModal && editingProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#160F0A] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-left relative max-h-[90vh] overflow-y-auto text-white">
            <button
              onClick={() => setShowEditProjectModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D6A04B] block mb-1">
                EDIT CONTRACT • {editingProject.projectId}
              </span>
              <h3 className="font-serif text-lg font-black text-white">
                Update Project Details
              </h3>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-bold block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={editProjectFormData.title}
                  onChange={(e) => setEditProjectFormData({ ...editProjectFormData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={editProjectFormData.clientName}
                    onChange={(e) => setEditProjectFormData({ ...editProjectFormData, clientName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-bold block mb-1">Client Phone</label>
                  <input
                    type="tel"
                    value={editProjectFormData.clientPhone}
                    onChange={(e) => setEditProjectFormData({ ...editProjectFormData, clientPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Total Agreed Budget (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editProjectFormData.totalBudget}
                    onChange={(e) => setEditProjectFormData({ ...editProjectFormData, totalBudget: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-bold block mb-1">Client City</label>
                  <input
                    type="text"
                    value={editProjectFormData.clientCity}
                    onChange={(e) => setEditProjectFormData({ ...editProjectFormData, clientCity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Project Status</label>
                  <select
                    value={editProjectFormData.status}
                    onChange={(e) => setEditProjectFormData({ ...editProjectFormData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  >
                    <option value="quotation">Quotation / Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-300 font-bold block mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={editProjectFormData.targetDate}
                    onChange={(e) => setEditProjectFormData({ ...editProjectFormData, targetDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editProjectFormData.notes}
                  onChange={(e) => setEditProjectFormData({ ...editProjectFormData, notes: e.target.value })}
                  placeholder="Material specs, milestones, or client instructions"
                  className="w-full px-4 py-2 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#D6A04B] to-[#E6B86C] text-[#160F0A] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Save Project Changes →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 6: RECORD PROJECT EXPENSE */}
      {/* ===================================================================== */}
      {showAddExpenseModal && selectedProjectForExpense && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#160F0A] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left relative text-white">
            <button
              onClick={() => setShowAddExpenseModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D6A04B] block mb-1">
                COSTING ENTRY
              </span>
              <h3 className="font-serif text-lg font-black text-white">
                Add Expense for {selectedProjectForExpense.title}
              </h3>
            </div>

            <form onSubmit={handleAddProjectExpense} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-bold block mb-1">Expense Category *</label>
                <select
                  value={expenseFormData.category}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                >
                  {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={expenseFormData.description}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                  placeholder="e.g. 50 cft Burma Teak logs purchased"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={expenseFormData.amount}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                  placeholder="e.g. 45000"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#D6A04B] to-[#E6B86C] text-[#160F0A] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Save Project Expense →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 7: RECORD CLIENT PAYMENT */}
      {/* ===================================================================== */}
      {showRecordPaymentModal && selectedProjectForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#160F0A] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left relative text-white">
            <button
              onClick={() => setShowRecordPaymentModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D6A04B] block mb-1">
                CLIENT PAYMENT
              </span>
              <h3 className="font-serif text-lg font-black text-white">
                Record Payment Received
              </h3>
              <p className="text-xs text-stone-400 font-light mt-0.5">
                For {selectedProjectForPayment.title}
              </p>
            </div>

            <form onSubmit={handleRecordProjectPayment} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-bold block mb-1">Payment Stage (Milestone)</label>
                <select
                  value={paymentFormData.milestoneIndex}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, milestoneIndex: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                >
                  <option value="">General Payment</option>
                  {selectedProjectForPayment.milestones?.map((m, idx) => (
                    <option key={idx} value={idx}>
                      {m.title} (₹{m.amount} - {m.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Payment Mode</label>
                <select
                  value={paymentFormData.paymentMode}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMode: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="bank_transfer">Bank NEFT / RTGS</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Notes</label>
                <input
                  type="text"
                  value={paymentFormData.note}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, note: e.target.value })}
                  placeholder="e.g. Received via GPay from Client"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-stone-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#D6A04B] to-[#E6B86C] text-[#160F0A] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Confirm Payment Received →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 8: DELETE CONFIRMATION MODAL */}
      {/* ===================================================================== */}
      {showDeleteConfirmModal && deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#160F0A] border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-center relative text-white">
            <button
              onClick={() => {
                setShowDeleteConfirmModal(false);
                setDeleteTarget(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-md">
              <Trash2 className="h-6 w-6" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block mb-1">
                PERMANENT REMOVAL
              </span>
              <h3 className="font-serif text-lg font-black text-white">
                Delete {deleteTarget.type === 'worker' ? 'Artisan / Worker' : 'Client Project'}?
              </h3>
              <p className="text-xs text-stone-300 mt-2 font-light leading-relaxed">
                {deleteTarget.type === 'worker' ? (
                  <>
                    Are you sure you want to permanently remove artisan <strong className="text-[#F5E6C8]">{deleteTarget.item?.name}</strong> ({deleteTarget.item?.workerId})?
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently remove project <strong className="text-[#F5E6C8]">{deleteTarget.item?.title}</strong> ({deleteTarget.item?.projectId})? All recorded payment milestones and material expenses will be deleted.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setDeleteTarget(null);
                }}
                disabled={deleteLoading}
                className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-300 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={deleteLoading}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>{deleteLoading ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
