"use client";
import React, { useState, useEffect, useRef } from 'react';
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
  BadgeAlert, HardHat, Hammer, AlertTriangle
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

  // Main Portal State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'attendance' | 'workers' | 'salaries' | 'projects'
  const [loading, setLoading] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

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
  const [scannerCameraError, setScannerCameraError] = useState('');

  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [workerPhotoFile, setWorkerPhotoFile] = useState(null);
  const [workerPhotoPreview, setWorkerPhotoPreview] = useState('');
  const fileInputRef = useRef(null);
  const [workerFormData, setWorkerFormData] = useState({
    name: '', phone: '', role: 'Master Carpenter', wageType: 'daily',
    dailyRate: 900, monthlySalary: 0, aadharNumber: '', bloodGroup: 'O+',
    emergencyContact: '', photo: '', notes: ''
  });

  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [selectedWorkerForCard, setSelectedWorkerForCard] = useState(null);

  const [showAddAdvanceModal, setShowAddAdvanceModal] = useState(false);
  const [advanceFormData, setAdvanceFormData] = useState({
    workerId: '', amount: '', type: 'advance', paymentMode: 'cash', notes: ''
  });

  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    title: '', clientName: '', clientPhone: '', clientCity: 'Rajahmundry',
    totalBudget: '', targetDate: '', notes: ''
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

  // 3. Data Fetching
  const fetchAllData = React.useCallback(async () => {
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
      // Browser does not support native BarcodeDetector; fallback is available
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
              return; // Stop loop once detected
            }
          }
        } catch (e) {
          // Frame detect skip
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
        fetchAllData(); // Refresh list
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

  // Toggle Manual Attendance Status
  const handleToggleAttendanceStatus = async (workerId, newStatus) => {
    try {
      await api.post('/management/attendance/manual', {
        workerId,
        date: selectedDate,
        status: newStatus
      });
      playWoodenChime();
      fetchAllData();
    } catch (err) {
      alert('Failed to update attendance');
    }
  };

  // =========================================================================
  // WORKER ACTIONS
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

  const openIdCardModal = (worker) => {
    setSelectedWorkerForCard(worker);
    setShowIdCardModal(true);
  };

  // =========================================================================
  // ADVANCE / SALARY ACTIONS
  // =========================================================================
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

  // =========================================================================
  // PROJECT ACTIONS
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
      <div className="min-h-screen bg-[#071A33] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0B1E3B] border border-[#D6A04B]/30 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-scaleUp">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#A64B24] via-[#D6A04B] to-[#F5E6C8] p-[2px] mx-auto shadow-lg">
            <div className="w-full h-full rounded-full bg-[#071A33] flex items-center justify-center">
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
            <p className="text-xs text-slate-400 mt-1 font-light">
              Enter authorized Security PIN to manage staff, ID cards, attendance, and client project budgets.
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
                className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-[#D6A04B]/40 text-center text-lg font-mono tracking-widest text-[#F5E6C8] placeholder:text-slate-500 focus:outline-none focus:border-[#D6A04B] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#D6A04B] cursor-pointer"
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
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#c0582d] to-[#D6A04B] text-[#071A33] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Unlock Management Portal →
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-[#D6A04B] transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN PORTAL DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#071A33] text-slate-100 flex flex-col antialiased">
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

      {/* TOP LUXURY APP BAR */}
      <header className="sticky top-0 z-40 bg-[#071A33]/90 backdrop-blur-md border-b border-[#D6A04B]/30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#A64B24] via-[#D6A04B] to-[#F5E6C8] p-[2px] shadow-md">
            <div className="w-full h-full rounded-full bg-[#071A33] flex items-center justify-center font-serif font-black text-xs text-[#F5E6C8]">
              LD
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-sm sm:text-base font-black text-[#F5E6C8] tracking-wide">
                LD INTERIORS
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#D6A04B]/20 border border-[#D6A04B]/40 text-[#D6A04B] text-[9px] font-black uppercase tracking-wider">
                ERP & Workshop Portal
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Live IST: {currentTimeStr || 'Connecting...'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick QR Attendance Scan Button */}
          <button
            onClick={startCameraScanner}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#A64B24] to-[#D6A04B] text-white text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Scan QR Attendance</span>
            <span className="sm:hidden">Scan QR</span>
          </button>

          <Link
            href="/admin"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Website Admin"
          >
            <Briefcase className="h-3.5 w-3.5 text-[#D6A04B]" />
            <span className="hidden md:inline">Website Admin</span>
          </Link>

          <Link
            href="/"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
            title="View Live Website"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#D6A04B]" />
            <span className="hidden md:inline">Storefront</span>
          </Link>
        </div>
      </header>

      {/* HORIZONTAL TAB NAVIGATION */}
      <nav className="bg-[#0B1E3B] border-b border-slate-800 px-4 sm:px-8 py-2 overflow-x-auto scrollbar-none flex items-center gap-2">
        {[
          { id: 'overview', label: '📊 Dashboard Overview', icon: Sparkles },
          { id: 'attendance', label: '📅 Daily Attendance & QR', icon: QrCode },
          { id: 'workers', label: '👷 Workers & ID Cards', icon: Users },
          { id: 'salaries', label: '💵 Salaries & Advances Khata', icon: Wallet },
          { id: 'projects', label: '🏛️ Client Projects & Budgets', icon: Briefcase },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-gradient-to-r from-[#A64B24] to-[#D6A04B] text-white border-transparent font-black shadow-md'
                  : 'bg-black/20 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={fetchAllData}
          disabled={loading}
          className="ml-auto p-2 rounded-xl bg-black/30 hover:bg-black/50 text-slate-400 hover:text-[#D6A04B] border border-slate-800 transition-all cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#D6A04B]' : ''}`} />
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 text-left">
        {/* =========================================================================
            TAB 1: OVERVIEW
           ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {/* Metric 1: Today Attendance */}
              <div className="bg-[#0B1E3B] border border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Today&apos;s Attendance</span>
                  <Users className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-emerald-400">
                    {stats?.presentCount || 0}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / {stats?.totalWorkers || workers.length} Present
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {stats?.halfDayCount || 0} Half-Day • {stats?.absentCount || 0} Absent
                </p>
              </div>

              {/* Metric 2: Today Wages Earned */}
              <div className="bg-[#0B1E3B] border border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Today Labor Wages</span>
                  <Wallet className="h-4 w-4 text-sky-400" />
                </div>
                <span className="text-3xl font-black font-mono text-sky-400 block">
                  ₹{(stats?.todayWages || 0).toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-slate-500">
                  Accrued for active shift today
                </p>
              </div>

              {/* Metric 3: Active Client Projects */}
              <div className="bg-[#0B1E3B] border border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Active Client Projects</span>
                  <Briefcase className="h-4 w-4 text-[#D6A04B]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-[#F5E6C8]">
                    {stats?.activeProjectsCount || projects.length}
                  </span>
                  <span className="text-xs text-slate-400">In Progress</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  Budget: ₹{(stats?.totalProjectsBudget || 0).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Metric 4: Pending Client Dues */}
              <div className="bg-[#0B1E3B] border border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Pending Client Dues</span>
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                </div>
                <span className="text-3xl font-black font-mono text-amber-400 block">
                  ₹{(stats?.pendingClientReceivables || 0).toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-slate-500">
                  To be collected on milestones
                </p>
              </div>
            </div>

            {/* Quick Actions & Live Attendance Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Quick QR Punch & Actions */}
              <div className="bg-gradient-to-br from-[#0B1E3B] to-[#071A33] border border-[#D6A04B]/30 rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D6A04B]/20 text-[#D6A04B] text-[9px] font-black uppercase tracking-wider inline-block">
                    Instant Check-In
                  </span>
                  <h3 className="font-serif text-xl font-bold text-white">
                    Worker QR Attendance Scanner
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Scan any worker&apos;s PVC ID Card QR code to automatically mark attendance, timestamp arrival, and credit their daily wage.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={startCameraScanner}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#c0582d] to-[#D6A04B] text-[#071A33] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Launch QR Camera Scanner</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('workers')}
                    className="w-full py-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-slate-700 text-xs text-[#F5E6C8] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Users className="h-3.5 w-3.5 text-[#D6A04B]" />
                    <span>Manage Staff & Print ID Badges</span>
                  </button>
                </div>
              </div>

              {/* Right 2 Columns: Today's Punched Workers Feed */}
              <div className="lg:col-span-2 bg-[#0B1E3B] border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-white">
                      Today&apos;s Live Attendance Sheet
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Date: {selectedDate} • {attendances.length} Punched
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="text-xs text-[#D6A04B] hover:underline font-bold flex items-center gap-1"
                  >
                    Full Sheet <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {attendances.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <Clock className="h-8 w-8 mx-auto text-slate-600" />
                    <p className="text-xs">No workers punched in yet today.</p>
                    <button
                      onClick={startCameraScanner}
                      className="text-xs text-[#D6A04B] hover:underline font-bold"
                    >
                      Scan QR Code to mark first attendance →
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
                    {attendances.map((att) => (
                      <div key={att._id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-[#D6A04B] flex items-center justify-center font-bold text-xs">
                            {att.workerName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {att.workerName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {att.workerId} • Checked in at {att.checkInTime || 'Morning'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {att.status}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#F5E6C8]">
                            ₹{att.dailyWageEarned}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: DAILY ATTENDANCE & QR
           ========================================================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Controls */}
            <div className="bg-[#0B1E3B] border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Daily Attendance Tracker
                </h2>
                <p className="text-xs text-slate-400 font-light">
                  Scan QR codes or use quick toggle buttons to record attendance and daily wages.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-black/40 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-[#D6A04B]"
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

            {/* Attendance Roster Table */}
            <div className="bg-[#0B1E3B] border border-slate-800 rounded-3xl overflow-hidden shadow-md">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  All Active Workers ({workers.length})
                </span>
                <span className="text-xs font-bold text-[#D6A04B] font-mono">
                  Total Day Wages: ₹{attendances.reduce((acc, a) => acc + (a.dailyWageEarned || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="divide-y divide-slate-800/80 overflow-x-auto">
                {workers.map((worker) => {
                  const att = attendances.find(a => a.workerId === worker.workerId);
                  const currentStatus = att ? att.status : 'absent';

                  return (
                    <div
                      key={worker._id}
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors"
                    >
                      {/* Worker Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#071A33] border border-[#D6A04B]/40 text-[#F5E6C8] flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden">
                          {worker.photo ? (
                            <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover" />
                          ) : (
                            worker.name.charAt(0)
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-white">
                              {worker.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md bg-black/40 text-[#D6A04B] text-[9px] font-mono font-bold">
                              {worker.workerId}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-light block">
                            {worker.role} • ₹{worker.dailyRate}/day
                          </span>
                        </div>
                      </div>

                      {/* Status Selector & Punch Times */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {att?.checkInTime && (
                          <span className="text-[10px] text-slate-400 font-mono mr-2 hidden md:inline">
                            Punched {att.checkInTime}
                          </span>
                        )}

                        {/* Status Buttons */}
                        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-slate-800 gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleAttendanceStatus(worker.workerId, 'present')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-400 hover:text-white'
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
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Half Day
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleAttendanceStatus(worker.workerId, 'absent')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              currentStatus === 'absent'
                                ? 'bg-red-600/80 text-white shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Absent
                          </button>
                        </div>

                        <span className="text-xs font-mono font-bold text-[#F5E6C8] w-14 text-right">
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

        {/* =========================================================================
            TAB 3: WORKERS & ID CARDS
           ========================================================================= */}
        {activeTab === 'workers' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Bar */}
            <div className="bg-[#0B1E3B] border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Staff & Workshop Artisans
                </h2>
                <p className="text-xs text-slate-400 font-light">
                  Manage worker profiles and generate official LD Interiors PVC ID Badges with scannable QR codes.
                </p>
              </div>

              <button
                onClick={() => setShowAddWorkerModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A64B24] to-[#D6A04B] text-white text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
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
                  className="bg-[#0B1E3B] border border-slate-800 hover:border-[#D6A04B]/40 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#071A33] border border-[#D6A04B]/40 text-[#F5E6C8] flex items-center justify-center font-bold text-base shadow-xs overflow-hidden">
                        {worker.photo ? (
                          <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover" />
                        ) : (
                          worker.name.charAt(0)
                        )}
                      </div>

                      <div>
                        <h4 className="font-serif text-sm font-bold text-white">
                          {worker.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-[#D6A04B]/20 text-[#D6A04B] text-[9px] font-bold uppercase inline-block">
                          {worker.role}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-black/40 px-2 py-0.5 rounded-md">
                      {worker.workerId}
                    </span>
                  </div>

                  {/* Details List */}
                  <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                    <div className="flex justify-between">
                      <span>Daily Wage:</span>
                      <span className="font-mono font-bold text-[#F5E6C8]">₹{worker.dailyRate} / day</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="font-mono text-slate-300">{worker.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blood Group:</span>
                      <span className="font-mono text-red-400 font-bold">{worker.bloodGroup || 'O+'}</span>
                    </div>
                  </div>

                  {/* ID Card Action */}
                  <div className="pt-2">
                    <button
                      onClick={() => openIdCardModal(worker)}
                      className="w-full py-2 rounded-xl bg-black/40 hover:bg-[#D6A04B]/20 border border-[#D6A04B]/40 text-[#D6A04B] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Generate & Print ID Card</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: SALARIES, ADVANCES & KHATA
           ========================================================================= */}
        {activeTab === 'salaries' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Bar */}
            <div className="bg-[#0B1E3B] border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Salary & Advance Khata Book
                </h2>
                <p className="text-xs text-slate-400 font-light">
                  Track weekly/monthly wages, advance deductions, and payout settlements.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-black/40 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-[#D6A04B]"
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
            <div className="bg-[#0B1E3B] border border-slate-800 rounded-3xl overflow-hidden shadow-md">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  Monthly Wage Calculations for {selectedMonth}
                </span>
                <span className="text-xs font-bold text-[#D6A04B] font-mono">
                  Total Payable: ₹{salarySummary.reduce((acc, s) => acc + s.netPayable, 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-black/40 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Worker</th>
                      <th className="p-3.5">Daily Rate</th>
                      <th className="p-3.5">Days Worked</th>
                      <th className="p-3.5">Gross Wages</th>
                      <th className="p-3.5 text-red-400">Advances Deducted</th>
                      <th className="p-3.5 text-[#D6A04B]">Net Balance Payable</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {salarySummary.map((s) => (
                      <tr key={s.workerId} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{s.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{s.workerId} • {s.role}</span>
                        </td>
                        <td className="p-3.5 font-mono">₹{s.dailyRate}</td>
                        <td className="p-3.5 font-mono text-emerald-400 font-bold">{s.effectiveDays} Days</td>
                        <td className="p-3.5 font-mono font-bold text-white">₹{s.grossEarnings.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 font-mono text-red-400 font-bold">-₹{s.advancesTaken.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 font-mono font-black text-[#F5E6C8] text-sm">
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
                            className="px-3 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-600/50 text-[10px] font-bold uppercase transition-all"
                          >
                            Pay & Settle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Advance History Ledger */}
            <div className="bg-[#0B1E3B] border border-slate-800 rounded-3xl p-5 space-y-3">
              <h3 className="font-serif text-sm font-bold text-white">
                Recent Advance & Payout Transactions
              </h3>
              <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto">
                {advances.slice(0, 15).map((adv) => (
                  <div key={adv._id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{adv.workerName} ({adv.workerId})</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(adv.date).toLocaleDateString('en-IN')} • {adv.paymentMode.toUpperCase()} {adv.notes ? `• ${adv.notes}` : ''}
                      </span>
                    </div>
                    <span className={`font-mono font-bold ${adv.type === 'advance' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {adv.type === 'advance' ? '-₹' : '₹'}{adv.amount.toLocaleString('en-IN')} ({adv.type})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: CLIENT PROJECTS & BUDGETS
           ========================================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Bar */}
            <div className="bg-[#0B1E3B] border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Client Interior Projects & Costing
                </h2>
                <p className="text-xs text-slate-400 font-light">
                  Track client quotations, stage-wise payments, wood/material expenses, and calculate net profit.
                </p>
              </div>

              <button
                onClick={() => setShowAddProjectModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A64B24] to-[#D6A04B] text-white text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
              >
                <Plus className="h-4 w-4" />
                <span>New Client Project</span>
              </button>
            </div>

            {/* Projects List */}
            <div className="space-y-6">
              {projects.map((proj) => {
                const totalExpenses = (proj.materialsCost || 0) + (proj.laborCost || 0) + (proj.transportCost || 0);
                const pendingBalance = Math.max(0, (proj.totalBudget || 0) - (proj.receivedAmount || 0));
                const netProfit = (proj.receivedAmount || 0) - totalExpenses;
                const profitMargin = proj.receivedAmount > 0 ? Math.round((netProfit / proj.receivedAmount) * 100) : 0;

                return (
                  <div
                    key={proj._id}
                    className="bg-[#0B1E3B] border border-slate-800 hover:border-[#D6A04B]/30 rounded-3xl p-6 shadow-md space-y-5 transition-all"
                  >
                    {/* Project Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#D6A04B]/20 text-[#D6A04B] text-[10px] font-mono font-bold">
                            {proj.projectId}
                          </span>
                          <h3 className="font-serif text-base sm:text-lg font-black text-white">
                            {proj.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 font-light mt-0.5">
                          Client: <strong className="text-slate-200">{proj.clientName}</strong> • {proj.clientCity} {proj.clientPhone ? `• 📞 ${proj.clientPhone}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-800">
                          {proj.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-black/40 p-4 rounded-2xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Budget</span>
                        <span className="text-lg font-black font-mono text-white">
                          ₹{proj.totalBudget.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Received Amount</span>
                        <span className="text-lg font-black font-mono text-emerald-400">
                          ₹{(proj.receivedAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Pending Balance</span>
                        <span className="text-lg font-black font-mono text-amber-400">
                          ₹{pendingBalance.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated Net Profit</span>
                        <span className={`text-lg font-black font-mono ${netProfit >= 0 ? 'text-[#D6A04B]' : 'text-red-400'}`}>
                          ₹{netProfit.toLocaleString('en-IN')} ({profitMargin}%)
                        </span>
                      </div>
                    </div>

                    {/* Milestones & Expenses Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Payment Milestones */}
                      <div className="bg-black/20 p-4 rounded-2xl border border-slate-800/60 space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                          <span className="text-xs font-bold text-slate-300 font-mono">Payment Stages</span>
                          <button
                            onClick={() => {
                              setSelectedProjectForPayment(proj);
                              setShowRecordPaymentModal(true);
                            }}
                            className="text-[10px] font-bold text-[#D6A04B] hover:underline"
                          >
                            + Record Payment
                          </button>
                        </div>

                        <div className="space-y-1.5 divide-y divide-slate-800/40">
                          {proj.milestones?.map((m, idx) => (
                            <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                              <span className="text-slate-300">{m.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-white font-bold">₹{m.amount.toLocaleString('en-IN')}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  m.status === 'received' 
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                                }`}>
                                  {m.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Project Expenses (Wood, Polish, Labor) */}
                      <div className="bg-black/20 p-4 rounded-2xl border border-slate-800/60 space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                          <span className="text-xs font-bold text-slate-300 font-mono">
                            Expenses (₹{totalExpenses.toLocaleString('en-IN')})
                          </span>
                          <button
                            onClick={() => {
                              setSelectedProjectForExpense(proj);
                              setShowAddExpenseModal(true);
                            }}
                            className="text-[10px] font-bold text-[#D6A04B] hover:underline"
                          >
                            + Add Expense
                          </button>
                        </div>

                        <div className="space-y-1.5 divide-y divide-slate-800/40 max-h-36 overflow-y-auto">
                          {proj.expenses?.length === 0 ? (
                            <p className="text-[11px] text-slate-500 py-2">No expenses logged yet.</p>
                          ) : (
                            proj.expenses?.map((e, idx) => (
                              <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                                <div>
                                  <span className="text-slate-300 block">{e.description}</span>
                                  <span className="text-[9px] text-[#D6A04B] uppercase font-bold">{e.category}</span>
                                </div>
                                <span className="font-mono text-red-400 font-bold">₹{e.amount.toLocaleString('en-IN')}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL 1: QR CODE LIVE CAMERA SCANNER
         ========================================================================= */}
      {showQrScanner && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1E3B] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-center relative">
            <button
              onClick={stopCameraScanner}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-slate-400 hover:text-white"
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

            {/* Video Viewport with Scanning Target Frame */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-dashed border-[#D6A04B]/60 shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Scanning Crosshair Overlay */}
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

            {/* Success Popup Card when Scanned */}
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

            {/* Fallback Manual Input for Handheld Barcode Scanners or Manual Entry */}
            <form onSubmit={handleManualScanSubmit} className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={manualQrInput}
                  onChange={(e) => setManualQrInput(e.target.value)}
                  placeholder="Or enter Worker ID (e.g. LDI-W101)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-[#D6A04B]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#D6A04B] text-[#071A33] text-xs font-black uppercase tracking-wider"
                >
                  Punch
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-light">
                Works with USB/Bluetooth laser scanners or manual typing.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: OFFICIAL PVC ID CARD GENERATOR & PRINT
         ========================================================================= */}
      {showIdCardModal && selectedWorkerForCard && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1E3B] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 text-center relative">
            <button
              onClick={() => setShowIdCardModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-slate-400 hover:text-white"
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

            {/* Printable ID Card Container (Standard PVC 85.6mm x 54mm Ratio) */}
            <div id="printable-id-card-area" className="flex flex-col sm:flex-row gap-4 items-center justify-center py-2">
              {/* FRONT OF ID CARD */}
              <div className="w-[320px] h-[200px] rounded-2xl bg-gradient-to-b from-[#071A33] via-[#0B1E3B] to-[#071A33] border-2 border-[#D6A04B] p-3 text-left relative flex flex-col justify-between shadow-2xl select-none overflow-hidden">
                {/* Gold Top Banner */}
                <div className="flex items-center justify-between border-b border-[#D6A04B]/40 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#D6A04B] text-[#071A33] flex items-center justify-center font-serif font-black text-[9px]">
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

                {/* Body: Photo & Info */}
                <div className="flex items-center gap-3 my-auto">
                  <div className="w-16 h-16 rounded-xl border-2 border-[#D6A04B] overflow-hidden bg-slate-800 text-[#D6A04B] flex items-center justify-center font-serif font-black text-xl shrink-0 shadow-sm">
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
                    <p className="text-[8px] font-mono text-slate-300">
                      Blood Group: <strong className="text-red-400">{selectedWorkerForCard.bloodGroup || 'O+'}</strong>
                    </p>
                    <p className="text-[8px] font-mono text-slate-400">
                      Phone: {selectedWorkerForCard.phone}
                    </p>
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="flex items-center justify-between text-[7.5px] text-[#F5E6C8]/80 font-mono pt-1 border-t border-[#D6A04B]/30">
                  <span>Rajahmundry, AP</span>
                  <span className="text-[#D6A04B] font-bold">Authorized Artisan</span>
                </div>
              </div>

              {/* BACK OF ID CARD (SCANNABLE QR CODE) */}
              <div className="w-[320px] h-[200px] rounded-2xl bg-[#F5E6C8] border-2 border-[#D6A04B] p-3 text-left relative flex flex-col justify-between shadow-2xl select-none overflow-hidden text-[#071A33]">
                {/* Back Header */}
                <div className="text-center border-b border-[#071A33]/20 pb-1">
                  <span className="text-[8px] font-black uppercase tracking-wider text-[#A64B24]">
                    ATTENDANCE & VERIFICATION QR
                  </span>
                </div>

                {/* QR Code Center */}
                <div className="flex items-center justify-center gap-3 my-auto">
                  <div className="w-24 h-24 p-1 bg-white rounded-xl border border-[#071A33]/30 shadow-xs flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LDI-WORKER:${selectedWorkerForCard.workerId}&color=071A33&bgcolor=FFFFFF`}
                      alt="Worker QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[8px] text-[#071A33] space-y-1 font-sans">
                    <p className="font-bold">Instructions:</p>
                    <p>• Scan daily at workshop for instant attendance punch.</p>
                    <p>• Emergency: +91 6281653998</p>
                    <p>• Valid at all LD Interiors job sites.</p>
                  </div>
                </div>

                {/* Back Footer */}
                <div className="text-center text-[7.5px] text-[#071A33]/70 font-mono pt-1 border-t border-[#071A33]/20">
                  LD Interiors Handcrafted Teakwood • Rajahmundry
                </div>
              </div>
            </div>

            {/* Print CTA */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#c0582d] to-[#D6A04B] text-[#071A33] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Official PVC ID Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: REGISTER NEW WORKER
         ========================================================================= */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1E3B] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-left relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddWorkerModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-slate-400 hover:text-white"
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
                <label className="text-slate-300 font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={workerFormData.name}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={workerFormData.phone}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Role / Craft *</label>
                  <select
                    value={workerFormData.role}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Daily Wage (₹/day) *</label>
                  <input
                    type="number"
                    required
                    value={workerFormData.dailyRate}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, dailyRate: e.target.value })}
                    placeholder="900"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Blood Group</label>
                  <select
                    value={workerFormData.bloodGroup}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, bloodGroup: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  >
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Artisan Photo (Select from Gallery / Camera)
                </label>
                
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                <div className="flex items-center gap-3 bg-black/30 p-2.5 rounded-2xl border border-slate-700/80">
                  {/* Photo Preview Thumbnail */}
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
                        <span className="text-[8px] text-slate-400 font-bold block mt-0.5">Gallery</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & URL Input */}
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
                      className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-slate-700 text-[10px] text-white focus:outline-none focus:border-[#D6A04B]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={workerFormData.emergencyContact}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, emergencyContact: e.target.value })}
                  placeholder="Family member phone"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#c0582d] to-[#D6A04B] text-[#071A33] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  Save & Generate ID Card →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: RECORD ADVANCE / PAYOUT
         ========================================================================= */}
      {showAddAdvanceModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1E3B] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left relative">
            <button
              onClick={() => setShowAddAdvanceModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-slate-400 hover:text-white"
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
                <label className="text-slate-300 font-bold block mb-1">Select Worker *</label>
                <select
                  required
                  value={advanceFormData.workerId}
                  onChange={(e) => setAdvanceFormData({ ...advanceFormData, workerId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                >
                  <option value="">-- Choose Worker --</option>
                  {workers.map(w => (
                    <option key={w.workerId} value={w.workerId}>{w.name} ({w.workerId} - {w.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={advanceFormData.amount}
                    onChange={(e) => setAdvanceFormData({ ...advanceFormData, amount: e.target.value })}
                    placeholder="e.g. 2000"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Type *</label>
                  <select
                    value={advanceFormData.type}
                    onChange={(e) => setAdvanceFormData({ ...advanceFormData, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  >
                    <option value="advance">Advance (Deduction)</option>
                    <option value="salary_payout">Salary Settlement</option>
                    <option value="bonus">Bonus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Payment Mode</label>
                <select
                  value={advanceFormData.paymentMode}
                  onChange={(e) => setAdvanceFormData({ ...advanceFormData, paymentMode: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / GPay / PhonePe</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Notes / Reason</label>
                <input
                  type="text"
                  value={advanceFormData.notes}
                  onChange={(e) => setAdvanceFormData({ ...advanceFormData, notes: e.target.value })}
                  placeholder="e.g. Festival advance / Medical"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#c0582d] to-[#D6A04B] text-[#071A33] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  Save Transaction →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: NEW CLIENT PROJECT
         ========================================================================= */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1E3B] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-left relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddProjectModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-slate-400 hover:text-white"
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
                <label className="text-slate-300 font-bold block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projectFormData.title}
                  onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                  placeholder="e.g. Suresh Garu Villa Teakwood Mandir & Doors"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={projectFormData.clientName}
                    onChange={(e) => setProjectFormData({ ...projectFormData, clientName: e.target.value })}
                    placeholder="Client Name"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Client Phone</label>
                  <input
                    type="tel"
                    value={projectFormData.clientPhone}
                    onChange={(e) => setProjectFormData({ ...projectFormData, clientPhone: e.target.value })}
                    placeholder="Phone Number"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Total Agreed Budget (₹) *</label>
                  <input
                    type="number"
                    required
                    value={projectFormData.totalBudget}
                    onChange={(e) => setProjectFormData({ ...projectFormData, totalBudget: e.target.value })}
                    placeholder="e.g. 350000"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Client City</label>
                  <input
                    type="text"
                    value={projectFormData.clientCity}
                    onChange={(e) => setProjectFormData({ ...projectFormData, clientCity: e.target.value })}
                    placeholder="Rajahmundry"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#c0582d] to-[#D6A04B] text-[#071A33] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  Create Project & Milestones →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: RECORD PROJECT EXPENSE
         ========================================================================= */}
      {showAddExpenseModal && selectedProjectForExpense && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1E3B] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left relative">
            <button
              onClick={() => setShowAddExpenseModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-slate-400 hover:text-white"
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
                <label className="text-slate-300 font-bold block mb-1">Expense Category *</label>
                <select
                  value={expenseFormData.category}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                >
                  {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={expenseFormData.description}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                  placeholder="e.g. 50 cft Burma Teak logs purchased"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={expenseFormData.amount}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                  placeholder="e.g. 45000"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#c0582d] to-[#D6A04B] text-[#071A33] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  Save Project Expense →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: RECORD CLIENT PAYMENT
         ========================================================================= */}
      {showRecordPaymentModal && selectedProjectForPayment && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1E3B] border border-[#D6A04B]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left relative">
            <button
              onClick={() => setShowRecordPaymentModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-slate-400 hover:text-white"
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
              <p className="text-xs text-slate-400 font-light mt-0.5">
                For {selectedProjectForPayment.title}
              </p>
            </div>

            <form onSubmit={handleRecordProjectPayment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Payment Stage (Milestone)</label>
                <select
                  value={paymentFormData.milestoneIndex}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, milestoneIndex: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
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
                <label className="text-slate-300 font-bold block mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Payment Mode</label>
                <select
                  value={paymentFormData.paymentMode}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMode: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="bank_transfer">Bank NEFT / RTGS</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Notes</label>
                <input
                  type="text"
                  value={paymentFormData.note}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, note: e.target.value })}
                  placeholder="e.g. Received via GPay from Client"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A64B24] via-[#c0582d] to-[#D6A04B] text-[#071A33] font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  Confirm Payment Received →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
