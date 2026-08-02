import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  MapPin, Camera, Upload, FileText, LogOut,
  LayoutDashboard, CheckCircle, XCircle,
  Map as MapIcon, Eye, EyeOff, Menu, X, Bold, Italic, Underline,
  Superscript, Subscript, ChevronRight, ChevronLeft, ChevronDown, BookOpen,
  User, Settings, Edit3, Save, Image as ImageIcon, Calendar, Clock,
  AlertCircle, ListOrdered, Lightbulb, Check, AlertTriangle, Search, RefreshCw, Download, MessageCircle, FileSpreadsheet, Maximize2, Trash2
} from 'lucide-react';
import { saveAs } from 'file-saver';
import LogbookAgrinak from './landing-page';

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: transparent; 
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.5); 
      border-radius: 10px;
      border: 2px solid rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(4px);
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(100, 116, 139, 0.8); 
    }
      
    /* Toast Animations */
    .toast-enter { transform: translateX(100%); opacity: 0; }
    .toast-enter-active { transform: translateX(0); opacity: 1; transition: all 300ms ease-out; }
    .toast-exit { transform: translateX(0); opacity: 1; }
    .toast-exit-active { transform: translateX(100%); opacity: 0; transition: all 300ms ease-in; }
  `}</style>
);

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan (App Crash)</h2>
          <p className="mb-4">Maaf, aplikasi mengalami gangguan saat memuat tampilan.</p>
          <div className="bg-white p-4 rounded-lg border border-red-100 font-mono text-xs overflow-auto max-h-64">
            <p className="font-bold text-red-600 mb-2">{this.state.error && this.state.error.toString()}</p>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Refresh Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- CUSTOM TOAST NOTIFICATION SYSTEM (MODERN UI) ---
const ToastMessage = ({ id, type, title, message, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => handleClose(), 5000); // Auto close after 5s
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(id), 300);
  };

  const styles = {
    success: {
      wrapper: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/30',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/40',
      icon: <Check size={16} className="text-white drop-shadow-md" />,
      text: 'text-emerald-800'
    },
    info: {
      wrapper: 'from-blue-500/10 to-blue-500/5 border-blue-500/30',
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/40',
      icon: <Lightbulb size={16} className="text-white drop-shadow-md" />,
      text: 'text-blue-800'
    },
    warning: {
      wrapper: 'from-amber-500/10 to-amber-500/5 border-amber-500/30',
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/40',
      icon: <AlertTriangle size={16} className="text-white drop-shadow-md" />,
      text: 'text-amber-800'
    },
    error: {
      wrapper: 'from-rose-500/10 to-rose-500/5 border-rose-500/30',
      iconBg: 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/40',
      icon: <X size={16} className="text-white drop-shadow-md" />,
      text: 'text-rose-800'
    }
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div className={`mb-3 w-[calc(100vw-2rem)] sm:w-96 bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-slate-200/50 border bg-gradient-to-br ${currentStyle.wrapper} flex items-start gap-4 transition-all duration-300 transform ${isClosing ? 'translate-x-[120%] opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'} hover:scale-[1.02]`}>
      <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center mt-0.5 shadow-lg ${currentStyle.iconBg}`}>
        {currentStyle.icon}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className={`font-extrabold text-sm leading-tight mb-1 ${currentStyle.text}`}>{title}</h4>
        <p className="text-xs text-slate-600 font-medium leading-relaxed drop-shadow-sm">{message}</p>
      </div>
      <button onClick={handleClose} className="shrink-0 p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-all active:scale-95" title="Tutup">
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
};

// --- UTILITY: FORMAT TEXT ---
const FormatText = ({ text }) => {
  if (!text) return null;
  return (
    <>
      {text.split(' ### ').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < text.split(' ### ').length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};

const displayRichText = (dbString) => {
  if (!dbString) return '';
  return dbString.replace(/ ### /g, '<br/>');
};

// --- UTILITY: PARSE DATE SAFE ---
const parseDateSafe = (dateVal, timeVal) => {
  if (!dateVal) return new Date(0);
  
  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? new Date(0) : dateVal;
  }
  
  const dateStr = String(dateVal).trim();
  let year = 1970, month = 0, day = 1;
  
  const dateParts = dateStr.split('-');
  if (dateParts.length === 3) {
    year = parseInt(dateParts[0], 10) || 1970;
    month = (parseInt(dateParts[1], 10) || 1) - 1;
    day = parseInt(dateParts[2], 10) || 1;
  } else {
    const slashParts = dateStr.split('/');
    if (slashParts.length === 3) {
      const part0 = parseInt(slashParts[0], 10) || 1;
      const part1 = parseInt(slashParts[1], 10) || 1;
      const part2 = parseInt(slashParts[2], 10) || 1970;
      if (part0 > 31) {
        year = part0;
        month = part1 - 1;
        day = part2;
      } else if (part2 > 1000) {
        year = part2;
        month = part1 - 1;
        day = part0;
      } else {
        year = part2;
        month = part0 - 1;
        day = part1;
      }
    } else {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        year = parsed.getFullYear();
        month = parsed.getMonth();
        day = parsed.getDate();
      }
    }
  }
  
  let hours = 0, minutes = 0;
  if (timeVal) {
    const timeParts = String(timeVal).trim().split(':');
    if (timeParts.length >= 2) {
      hours = parseInt(timeParts[0], 10) || 0;
      minutes = parseInt(timeParts[1], 10) || 0;
    }
  }
  
  return new Date(year, month, day, hours, minutes);
};

// --- CUSTOM STATUS DROPDOWN ---
const CustomStatusSelect = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const options = [
    { label: 'Hadir', color: 'text-green-600 font-bold' },
    { label: 'Sakit', color: 'text-red-600 font-bold' },
    { label: 'Izin', color: 'text-yellow-600 font-bold' },
    { label: 'Libur', color: 'text-slate-900 font-bold' }
  ];

  const selectedOption = options.find(opt => opt.label === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/50 backdrop-blur-md border border-slate-200 rounded-xl text-left hover:border-cyan-400 focus:ring-2 focus:ring-cyan-200 transition-all group shadow-sm"
      >
        <span className={`text-lg ${selectedOption.color}`}>{selectedOption.label}</span>
        <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-1">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={(e) => { e.preventDefault(); onChange(opt.label); setIsOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100/80 transition-colors flex items-center justify-between group ${value === opt.label ? 'bg-blue-50' : ''}`}
            >
              <span className={`${opt.color} group-hover:scale-105 transition-transform`}>{opt.label}</span>
              {value === opt.label && <CheckCircle size={16} className="text-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- CUSTOM DATE PICKER COMPONENT ---
const CustomDatePicker = ({ value, onChange, forceOpen, onForceOpenConsume }) => {
  const [show, setShow] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(value || new Date()));
  const containerRef = useRef(null);

  useEffect(() => {
    if (forceOpen) {
      setShow(true);
      if (onForceOpenConsume) onForceOpenConsume();
    }
  }, [forceOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setShow(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handleDayClick = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    onChange(`${year}-${month}-${dayStr}`);
    setShow(false);
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const daysShort = ["Mg", "Sn", "Sl", "Rb", "Km", "Jm", "Sb"];

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);
    const blanks = Array(startDay).fill(null);
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    const selected = new Date(value && !value.includes('T') ? `${value}T00:00:00` : value);
    const isSelected = (d) => selected.getDate() === d && selected.getMonth() === month && selected.getFullYear() === year;

    return (
      <div className="p-4 w-72">
        <div className="flex justify-between items-center mb-4">
          <button onClick={(e) => { e.preventDefault(); changeMonth(-1) }} className="p-1 hover:bg-slate-200 rounded-full transition"><ChevronLeft size={20} /></button>
          <span className="font-bold text-slate-700">{monthNames[month]} {year}</span>
          <button onClick={(e) => { e.preventDefault(); changeMonth(1) }} className="p-1 hover:bg-slate-200 rounded-full transition"><ChevronRight size={20} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysShort.map(d => <div key={d} className="text-center text-xs font-bold text-slate-400">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => <div key={`blank-${i}`} />)}
          {days.map(d => (
            <button
              key={d}
              onClick={(e) => { e.preventDefault(); handleDayClick(d) }}
              className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition-all duration-200 ${isSelected(d) ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' : 'text-slate-700 hover:bg-cyan-50 hover:text-cyan-600'}`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
          <button
            onClick={(e) => {
              e.preventDefault();
              onChange("");
              setShow(false);
            }}
            className="text-xs font-bold text-slate-500 hover:text-cyan-600 transition-colors"
          >
            Semua Waktu
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              onChange(todayStr);
              setShow(false);
            }}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-800 transition-colors"
          >
            Hari Ini
          </button>
        </div>
      </div>
    );
  };

  const displayDate = new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatDateDisplay = (dateStr) => {
    if (!dateStr || dateStr === "all") return "Semua Waktu";
    const parseTime = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
    const d = new Date(parseTime);
    if (isNaN(d.getTime())) return "Semua Waktu";
    return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setShow(!show)}
        className={`w-full min-w-[140px] md:min-w-[180px] flex items-center justify-between gap-2 px-4 py-3 bg-white border rounded-2xl shadow-sm transition-all focus:ring-4 focus:ring-cyan-100 group font-bold text-sm ${show ? 'border-cyan-400 text-cyan-700' : 'border-slate-200 text-slate-700 hover:border-cyan-400 hover:text-cyan-700'}`}
      >
        <span className="flex-1 text-left">{formatDateDisplay(value)}</span>
        <Calendar size={18} className={`transition-colors ${show ? 'text-cyan-500' : 'text-slate-400 group-hover:text-cyan-500'}`} />
      </button>

      {show && (
        <>
          <div className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm sm:hidden" onClick={() => setShow(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:translate-x-0 sm:translate-y-0 sm:mt-2 max-w-[95vw] sm:max-w-[90vw] bg-white rounded-2xl shadow-2xl sm:shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-[110] overflow-hidden animate-in fade-in zoom-in-95 sm:slide-in-from-top-2 duration-200 origin-center sm:origin-top-right">
            {renderCalendar()}
          </div>
        </>
      )}
    </div>
  );
};

// --- CUSTOM TIME PICKER COMPONENT ---
const CustomTimePicker = ({ value, onChange }) => {
  const [show, setShow] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setShow(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  const [selectedH, selectedM] = value.split(':');
  const updateTime = (h, m) => { onChange(`${h}:${m}`); };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={(e) => { e.preventDefault(); setShow(!show) }}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl text-left hover:border-cyan-400 focus:ring-2 focus:ring-cyan-200 transition-all group shadow-sm"
      >
        <span className="font-bold text-slate-700 font-mono text-lg">{value}</span>
        <Clock size={18} className="text-slate-400 group-hover:text-cyan-500 transition-colors" />
      </button>
      {show && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl z-50 p-4 flex gap-2 h-64 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
            <div className="text-center text-xs font-bold text-slate-400 mb-2 sticky top-0 bg-white/90 backdrop-blur py-1">JAM</div>
            {hours.map(h => (<button key={h} onClick={(e) => { e.preventDefault(); updateTime(h, selectedM); }} className={`py-2 rounded-lg text-sm font-mono transition-colors ${h === selectedH ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-slate-100 text-slate-600'}`}>{h}</button>))}
          </div>
          <div className="w-[1px] bg-slate-200 my-2"></div>
          <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
            <div className="text-center text-xs font-bold text-slate-400 mb-2 sticky top-0 bg-white/90 backdrop-blur py-1">MENIT</div>
            {minutes.map(m => (<button key={m} onClick={(e) => { e.preventDefault(); updateTime(selectedH, m); setShow(false); }} className={`py-2 rounded-lg text-sm font-mono transition-colors ${m === selectedM ? 'bg-cyan-500 text-white shadow-md' : 'hover:bg-slate-100 text-slate-600'}`}>{m}</button>))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- NEW FULL IMAGE MODAL ---
const ImageModal = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full flex flex-col items-center gap-6" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt="Full Preview"
          style={{ imageOrientation: 'from-image' }}
          className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl object-contain border-4 border-white/20 bg-slate-800/50"
        />
        <Button
          variant="danger"
          onClick={onClose}
          className="px-10 py-3 font-bold text-lg rounded-full shadow-xl hover:scale-105 transition-transform"
        >
          Tutup
        </Button>
      </div>
    </div>
  );
};

// --- NEW TEXT MODAL ---
const TextModal = ({ title, content, onClose }) => {
  if (!content) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto text-slate-600 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: content }} className="prose prose-slate max-w-none [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5" />
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  );
};

// --- ALERTS/WARNING MODAL ---
const AlertModal = ({ title, content, onClose }) => {
  if (!content) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 border border-red-200" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-red-100 flex justify-between items-center bg-red-50">
          <h3 className="font-bold text-lg text-red-800 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            {title}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-red-200 text-red-600 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto text-slate-700 leading-relaxed bg-white">
          <div dangerouslySetInnerHTML={{ __html: content }} className="prose prose-slate max-w-none [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 selection:bg-red-200" />
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <Button variant="danger" onClick={onClose}>Mengerti & Tutup</Button>
        </div>
      </div>
    </div>
  );
};

// --- CONFIGURATION ---
// 19 Feb 11:45 - Version 48: Fallback Columns Fix
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxKUjPqFEHRoFQYw3UjPeYhGMmCFh5_CP2NdzZC_aGtdq-_s9ZtKes7A6EfXnUYSVA-/exec';

// --- INITIAL DATA ---
const INITIAL_LOGBOOKS = [];
const INITIAL_REPORTS = [];

// --- UTILITY: API CALL ---
const callAPI = async (action, payload = {}) => {
  if (GAS_URL.includes("MASUKKAN_URL")) {
    console.warn("URL GAS belum disetting!");
    // Return mock error or keep loading
    throw new Error("URL Backend Belum Dikonfigurasi. Hubungi Admin.");
  }

  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action, ...payload })
    });
    const result = await response.json();
    if (result.status === "error") throw new Error(result.message);
    return result.data;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
};

const fetchDashboardData = async (role, userId) => {
  // Use GET request for data retrieval to avoid CORS preflight issues sometimes, 
  // or just use POST for everything if GAS is set up that way. 
  // Here we use the doGet endpoint via simple fetch distinct from callAPI if needed, 
  // but callAPI (POST) is often more stable for GAS Web Apps unless published as 'Anonymous'.
  // Let's stick to POST for consistency if the GAS handles it, OR use the URL param method.

  // Actually, standard fetch to GAS Web App endpoint works best with POST for data mutations,
  // and GET for retrieval. Let's use a helper for GET.

  if (GAS_URL.includes("MASUKKAN_URL")) return null;

  const url = `${GAS_URL}?action=getDashboardData&userId=${userId}&role=${role}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.status === 'error') throw new Error(json.message);
  return json.data;
};

// --- UTILITY COMPONENTS ---

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-xl font-medium transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:active:scale-100 disabled:shadow-none";
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 hover:from-cyan-600 hover:to-blue-700",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20",
    success: "bg-emerald-500 text-white hover:bg-emerald-600"
  };

  const handleClick = (e) => {
    if (props.disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) onClick(e);
  };

  return (
    <button type={type} onClick={handleClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '', title }) => (
  <div className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-lg shadow-slate-200/50 border border-white overflow-hidden ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-100/50 bg-gradient-to-r from-white via-slate-50 to-white">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const Input = ({ label, type = "text", value, onChange, placeholder, labelClassName, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-4">
      <label className={`block mb-2 ml-1 ${labelClassName || 'text-sm font-semibold text-slate-500'}`}>{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 outline-none transition-all bg-slate-50 focus:bg-white text-slate-700 placeholder:text-slate-400"
          placeholder={placeholder}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-cyan-600 rounded-lg transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

// --- LEAFLET MAP COMPONENT (ROBUST IMPLEMENTATION) ---
const LeafletMap = ({ lat, lng, setLat, setLng, setAddress, readOnly = false, markers = [], onMarkerAction }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const markersGroupRef = useRef([]);

  // Bind event listener to map container for popup buttons
  useEffect(() => {
    const handlePopupClick = (e) => {
      if (e.target && e.target.classList.contains('leaflet-popup-action-btn')) {
        const id = e.target.getAttribute('data-id');
        if (id && onMarkerAction) {
          onMarkerAction(id);
        }
      }
    };
    const node = mapRef.current;
    if (node) {
      node.addEventListener('click', handlePopupClick);
    }
    return () => {
      if (node) {
        node.removeEventListener('click', handlePopupClick);
      }
    };
  }, [onMarkerAction]);

  useEffect(() => {
    // Inject CSS if not present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject Script & Init Map
    let checkInterval;
    const attemptInit = () => {
      if (window.L && mapRef.current) {
        if (!mapInstanceRef.current) initMap();
        if (checkInterval) clearInterval(checkInterval);
        return true;
      }
      return false;
    };

    if (!window.L) {
      let script = document.getElementById("leaflet-script");
      if (!script) {
        script = document.createElement("script");
        script.id = "leaflet-script";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        document.body.appendChild(script);
      }
      // Check periodically if Leaflet is ready
      checkInterval = setInterval(attemptInit, 200);
    } else {
      attemptInit();
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  const forceResize = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  };

  useEffect(() => {
    // Force resize on prop changes or when markers change
    // This helps when the map is inside a tab or modal that becomes visible
    const timer1 = setTimeout(forceResize, 100);
    const timer2 = setTimeout(forceResize, 500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [lat, lng, markers]);

  const initMap = () => {
    if (mapInstanceRef.current || !window.L || !mapRef.current) return;

    const L = window.L;

    // FIX FOR MISSING PINS: Explicitly set the default icon path
    if (L.Icon && L.Icon.Default && L.Icon.Default.prototype) {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    }

    // Default center (Indonesia)
    const initialLat = parseFloat(lat) || -2.5489;
    const initialLng = parseFloat(lng) || 118.0149;
    const initialZoom = 5;

    try {
      const map = L.map(mapRef.current).setView([initialLat, initialLng], initialZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
      mapInstanceRef.current = map;

      // FORCE RELAYOUT AFTER A SHORT DELAY & ON RESIZE
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          try { mapInstanceRef.current.invalidateSize(); } catch (e) { console.warn(e); }
        }
      });
      if (mapRef.current) resizeObserver.observe(mapRef.current);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.invalidateSize();
            if (markers.length > 0) renderMarkers(L, mapInstanceRef.current);
          } catch (e) {
            console.warn("Map resize error:", e);
          }
        }
      }, 250);

      // Handle single marker mode (Logbook Form)
      if (!readOnly && lat && lng) {
        const validLat = parseFloat(lat);
        const validLng = parseFloat(lng);
        if (!isNaN(validLat) && !isNaN(validLng)) {
          markerRef.current = L.marker([validLat, validLng]).addTo(map);
        }

        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          if (setLat && setLng) {
            setLat(lat); setLng(lng);
            if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
            else markerRef.current = L.marker([lat, lng]).addTo(map);
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              const data = await res.json();
              if (data && data.display_name && setAddress) setAddress(data.display_name);
            } catch (err) { console.error("Geocoding failed", err); }
          }
        });
      }

      // Handle multiple markers mode (Overview & Lecturer Logbook)
      renderMarkers(L, map);

    } catch (err) {
      console.error("Leaflet Init Error:", err);
    }
  };

  const renderMarkers = (L, map) => {
    try {
      if (!map || !markersGroupRef.current) return;

      markersGroupRef.current.forEach(m => {
        try { map.removeLayer(m); } catch (e) { }
      });
      markersGroupRef.current = [];

      if (markers && markers.length > 0) {
        const bounds = L.latLngBounds();
        let hasValidMarker = false;
        
        // Track coords to avoid exact overlaps
        const coordCounts = {};

        markers.forEach(m => {
          if (!m) return;
          // Ensure lat/lng are valid numbers
          let mLat = parseFloat(m.lat);
          let mLng = parseFloat(m.lng);

          if (!isNaN(mLat) && !isNaN(mLng) && mLat !== 0 && mLng !== 0) {
            
            // Generate key based on approx 11 meters precision
            const coordKey = `${mLat.toFixed(4)},${mLng.toFixed(4)}`;
            if (coordCounts[coordKey]) {
              const count = coordCounts[coordKey];
              coordCounts[coordKey]++;
              
              // Spread the overlapping markers using a spiral pattern
              // 0.00015 degrees is roughly 15 meters
              const angle = count * (Math.PI / 3); 
              const radius = 0.00015 + (Math.floor(count / 6) * 0.0001);
              mLat += Math.cos(angle) * radius;
              mLng += Math.sin(angle) * radius;
            } else {
              coordCounts[coordKey] = 1;
            }

            const popupHtml = `
              <div class="text-xs p-1 min-w-[150px]">
                <div class="font-bold text-slate-800 mb-1 border-b border-slate-100 pb-1">${m.name || 'Nama Tidak Diketahui'}</div>
                <div class="space-y-1 mb-3">
                  <div class="text-slate-600 font-medium">${m.nim || '-'} | ${m.class || '-'}</div>
                  <div class="font-bold uppercase text-[10px] ${m.status === 'Hadir' ? 'text-green-600' : 'text-slate-500'}">${m.status || '-'}</div>
                  <div class="text-[10px] text-slate-500 font-mono">${parseFloat(m.lat).toFixed(6)}, ${parseFloat(m.lng).toFixed(6)}</div>
                  <div class="text-[10px] text-slate-400 font-mono">${m.date || '-'} ${m.time || ''}</div>
                </div>
                ${m.id ? `<button class="leaflet-popup-action-btn w-full py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold rounded-lg transition-colors border border-cyan-100" data-id="${m.id}">Lihat Detail</button>` : ''}
              </div>
            `;

            const marker = L.marker([mLat, mLng])
              .bindPopup(popupHtml)
              .addTo(map);
            markersGroupRef.current.push(marker);
            bounds.extend([mLat, mLng]);
            hasValidMarker = true;
          }
        });

        if (hasValidMarker) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      }
    } catch (e) {
      console.error("Error rendering markers:", e);
    }
  };

  useEffect(() => {
    if (mapInstanceRef.current && window.L && markers.length > 0) {
      renderMarkers(window.L, mapInstanceRef.current);
    } else if (mapInstanceRef.current && window.L && lat && lng && !readOnly) {
      const vLat = parseFloat(lat);
      const vLng = parseFloat(lng);
      if (!isNaN(vLat) && !isNaN(vLng)) {
        if (markerRef.current) markerRef.current.setLatLng([vLat, vLng]);
        else markerRef.current = window.L.marker([vLat, vLng]).addTo(mapInstanceRef.current);
        mapInstanceRef.current.setView([vLat, vLng], 15);
      }
    }
  }, [lat, lng, markers]);

  return <div ref={mapRef} className="w-full h-full z-0 rounded-xl" style={{ minHeight: '100%' }} />;
};

// --- RICH TEXT EDITOR COMPONENT ---
const RichEditor = ({ value, onChange, placeholder, disabled }) => {
  const editorRef = useRef(null);

  const execCmd = (command) => {
    if (disabled) return;
    document.execCommand(command, false, null);
    editorRef.current.focus();
  };

  const handleInput = () => {
    if (editorRef.current && !disabled) onChange(editorRef.current.innerHTML);
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-cyan-100 transition-all bg-white shadow-sm ${disabled ? 'opacity-60 pointer-events-none bg-slate-50' : ''}`}>
      <div className="bg-slate-50/50 p-2 flex gap-1 border-b border-slate-100 backdrop-blur-sm">
        <ToolButton onClick={() => execCmd('bold')} icon={Bold} title="Bold" disabled={disabled} />
        <ToolButton onClick={() => execCmd('italic')} icon={Italic} title="Italic" disabled={disabled} />
        <ToolButton onClick={() => execCmd('underline')} icon={Underline} title="Underline" disabled={disabled} />
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <ToolButton onClick={() => execCmd('insertOrderedList')} icon={ListOrdered} title="Poin Angka (Numbered List)" disabled={disabled} />
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <ToolButton onClick={() => execCmd('superscript')} icon={Superscript} title="Superscript" disabled={disabled} />
        <ToolButton onClick={() => execCmd('subscript')} icon={Subscript} title="Subscript" disabled={disabled} />
      </div>
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={!disabled}
          className="w-full p-4 outline-none min-h-[120px] max-h-[300px] overflow-y-auto text-sm text-slate-700 leading-relaxed list-inside relative z-10 [&_ol]:list-decimal [&_ul]:list-disc"
          onInput={handleInput}
          suppressContentEditableWarning={true}
          style={{ whiteSpace: 'pre-wrap' }}
        />
        {!value && <div className="absolute top-4 left-4 text-slate-400 text-sm pointer-events-none z-0">{placeholder}</div>}
      </div>
    </div>
  );
};


const ToolButton = ({ onClick, icon: Icon, title, disabled }) => (
  <button onClick={(e) => { e.preventDefault(); if (!disabled) onClick(); }} disabled={disabled} className={`p-2 rounded-lg transition-colors ${disabled ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-cyan-600 hover:bg-cyan-50'}`} title={title}><Icon size={16} /></button>
);

// --- UTILITY: GET PHOTO URL ---
const getPhotoUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (url.startsWith('data:image')) return url; // Ignore Base64

  let fileId = null;
  const dMatch = url.match(/\/d\/([-\w]{15,})/);
  const idParamMatch = url.match(/[?&]id=([-\w]{15,})/);

  if (dMatch && dMatch[1]) {
    fileId = dMatch[1];
  } else if (idParamMatch && idParamMatch[1]) {
    fileId = idParamMatch[1];
  }

  if (fileId) {
    // API thumbnail Google Drive selalu merender EXIF-orientation dengan benar
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w000`;
  }

  return url;
};


/*
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const image = imageRef.current;

// Set fixed output size (e.g., 400x400 for high quality profile)
canvas.width = 400;
canvas.height = 400;

// Draw simple white background (optional)
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Calculate source rectangle
// The container is 256x256 (w-64 h-64).
// The image scale is `zoom`.
// The image position is `offset`.

// We need to map the visible area of the image in the container to the canvas.
// Easier approach: Draw image to canvas with transforms.

const scale = zoom; // Current visual scale

// We want the center of the crop box to map to the center of the canvas
// But our offset is applied to the image relative to top-left.

// Let's rely on the visual ratio.
// Container size in pixels (approx 256px if w-64 is 16rem * 16px).
const containerSize = 256;

// Scale factor from container to output canvas
const outputScale = canvas.width / containerSize;

ctx.save();
ctx.scale(outputScale, outputScale); // Scale drawing operations to match output size
ctx.translate(containerSize / 2, containerSize / 2);
ctx.translate(offset.x, offset.y);
ctx.scale(zoom, zoom);
ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
ctx.restore();

canvas.toBlob((blob) => {
  onCrop(blob);
}, 'image/jpeg', 0.9);
};

return (
  <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800">Sesuaikan Foto</h3>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={20} /></button>
      </div>

      <div className="p-6 flex flex-col items-center">
        <div
          ref={containerRef}
          className="w-64 h-64 rounded-full overflow-hidden border-4 border-cyan-500 shadow-xl relative cursor-move bg-slate-100 touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop Preview"
            className="max-w-none absolute top-1/2 left-1/2 origin-center pointer-events-none select-none"
            style={{
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`
            }}
            draggable={false}
          />
        </div>

        <div className="w-full mt-6 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Zoom Out</span>
            <span>Zoom In</span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>Batal</Button>
        <Button onClick={handleCrop} className="px-6">Simpan Foto</Button>
      </div>
    </div>
  </div>
);

*/

// --- IMAGE CROPPER COMPONENT (REFINED) ---
const ImageCropper = ({ imageSrc, onCrop, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 0 }); // coordinates in natural image pixels
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [inputSize, setInputSize] = useState(''); // Separate state for manual input to allow typing

  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0, cropX: 0, cropY: 0, cropSize: 0 });

  // On Image Load: Initialize crop to max square centered
  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });

    const size = Math.min(naturalWidth, naturalHeight);
    const x = (naturalWidth - size) / 2;
    const y = (naturalHeight - size) / 2;

    setCrop({ x, y, size });
    setInputSize(size.toString());
  };

  // Helper: Convert client coordinates to image natural coordinates
  const getNaturalCoords = (clientX, clientY) => {
    if (!imgRef.current) return { x: 0, y: 0 };
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = naturalSize.width / rect.width;
    const scaleY = naturalSize.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Dragging Logic
  const handleMouseDown = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();

    const coords = getNaturalCoords(e.clientX, e.clientY);

    if (mode === 'drag') {
      isDraggingRef.current = true;
      startPosRef.current = {
        x: coords.x,
        y: coords.y,
        cropX: crop.x,
        cropY: crop.y
      };
    } else if (mode === 'resize') {
      isResizingRef.current = true;
      startPosRef.current = {
        x: coords.x,
        y: coords.y,
        cropSize: crop.size
      };
    }

    // Global listeners for smooth dragging outside container
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const coords = getNaturalCoords(e.clientX, e.clientY);

    if (isDraggingRef.current) {
      const dx = coords.x - startPosRef.current.x;
      const dy = coords.y - startPosRef.current.y;

      let newX = startPosRef.current.cropX + dx;
      let newY = startPosRef.current.cropY + dy;

      // Bounds check
      newX = Math.max(0, Math.min(newX, naturalSize.width - crop.size));
      newY = Math.max(0, Math.min(newY, naturalSize.height - crop.size));

      setCrop(prev => ({ ...prev, x: newX, y: newY }));
    }
    else if (isResizingRef.current) {
      // Resize logic (bottom-right handle)
      // distance moved in X direction determines size change (maintain 1:1)
      const dx = coords.x - startPosRef.current.x;
      // We can take max of dx/dy purely, or just dx since it's user preference usually

      let newSize = startPosRef.current.cropSize + dx;

      // Min size 100px
      newSize = Math.max(100, newSize);

      // Max bounds check (x + size <= w, y + size <= h)
      const maxSize = Math.min(
        naturalSize.width - crop.x,
        naturalSize.height - crop.y
      );
      newSize = Math.min(newSize, maxSize);

      setCrop(prev => {
        const next = { ...prev, size: newSize };
        setInputSize(Math.round(newSize).toString());
        return next;
      });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Manual Input Change
  const handleManualInputApply = () => {
    let val = parseInt(inputSize);
    if (isNaN(val)) return;

    // Constraints
    val = Math.max(100, Math.min(val, naturalSize.width, naturalSize.height));

    // Recenter if shrinking, or clamp to top-left if growing prevents fitting
    let newX = crop.x;
    let newY = crop.y;

    if (newX + val > naturalSize.width) newX = naturalSize.width - val;
    if (newY + val > naturalSize.height) newY = naturalSize.height - val;

    setCrop({ x: newX, y: newY, size: val });
    setInputSize(val.toString());
  };

  const executeCrop = () => {
    const canvas = document.createElement('canvas');
    // Set output size to the actual crop size (high res)
    canvas.width = crop.size;
    canvas.height = crop.size;

    const ctx = canvas.getContext('2d');

    // Draw cropped area
    ctx.drawImage(
      imgRef.current,
      crop.x, crop.y, crop.size, crop.size, // Source
      0, 0, crop.size, crop.size // Destination
    );

    canvas.toBlob((blob) => {
      onCrop(blob);
    }, 'image/jpeg', 0.95);
  };

  // Styles for the Overlay Box
  // We use percentages for rendering to be responsive
  const getStyle = () => {
    if (naturalSize.width === 0) return {};
    return {
      left: `${(crop.x / naturalSize.width) * 100}%`,
      top: `${(crop.y / naturalSize.height) * 100}%`,
      width: `${(crop.size / naturalSize.width) * 100}%`,
      height: `${(crop.size / naturalSize.height) * 100}%`
    };
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95">

        {/* LEFT: Image Area */}
        <div className="flex-1 bg-slate-900 relative flex items-center justify-center p-8 overflow-hidden">
          <div ref={containerRef} className="relative max-w-full max-h-full shadow-2xl">
            <img
              ref={imgRef}
              src={imageSrc}
              onLoad={onImageLoad}
              alt="Crop Source"
              className="max-w-full max-h-[80vh] block object-contain select-none pointer-events-none"
              draggable={false}
            />

            {/* Dark Overlay (Outside Crop) - Implemented via Box Shadow on the Crop Box for simplicity */}
            {naturalSize.width > 0 && (
              <div
                className="absolute border-2 border-white box-content cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
                style={getStyle()}
                onMouseDown={(e) => handleMouseDown(e, 'drag')}
              >
                {/* Rule of Thirds Grid */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  <div className="border-r border-b border-white/30"></div>
                  <div className="border-r border-b border-white/30"></div>
                  <div className="border-b border-white/30"></div>
                  <div className="border-r border-b border-white/30"></div>
                  <div className="border-r border-b border-white/30"></div>
                  <div className="border-b border-white/30"></div>
                  <div className="border-r border-white/30"></div>
                  <div className="border-r border-white/30"></div>
                  <div></div>
                </div>

                {/* Resize Handle (Bottom Right) */}
                <div
                  className="absolute -bottom-2 -right-2 w-6 h-6 bg-cyan-500 border-2 border-white rounded-full cursor-se-resize shadow-md z-10 hover:scale-125 transition-transform"
                  onMouseDown={(e) => handleMouseDown(e, 'resize')}
                ></div>

                {/* Dimensions Label */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full font-mono pointer-events-none whitespace-nowrap">
                  {Math.round(crop.size)} x {Math.round(crop.size)} px
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Sidebar Controls */}
        <div className="w-full md:w-80 bg-white border-l border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Camera size={20} className="text-cyan-600" />
              Crop Foto
            </h3>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-red-500"><X size={20} /></button>
          </div>

          <div className="hidden lg:block flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Info Box */}
            <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
              <h4 className="font-bold text-cyan-800 text-sm mb-1 flex items-center gap-2"><Lightbulb size={14} /> Pengaturan Potongan</h4>
              <p className="text-xs text-cyan-700 leading-relaxed">Geser kotak pada gambar atau tarik sudut kanan bawah untuk mengubah ukuran. Rasio foto dikunci 1:1 (Persegi) untuk foto profil.</p>
            </div>

            {/* Manual Size Input */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ukuran Manual (px)</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={inputSize}
                    onChange={(e) => setInputSize(e.target.value)}
                    onBlur={handleManualInputApply}
                    className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all outline-none text-slate-700"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">W</span>
                </div>
                <span className="text-slate-300"><X size={14} /></span>
                <div className="relative flex-1 opacity-50 cursor-not-allowed" title="Terkunci (Persegi)">
                  <input
                    type="number"
                    value={inputSize}
                    readOnly
                    className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-500 pointer-events-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">H</span>
                </div>
              </div>
              <button
                onClick={handleManualInputApply}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors border border-slate-200"
              >
                Terapkan Ukuran
              </button>
            </div>

            {/* Download Info (Mimicking UI) */}
            <div className="pt-6 border-t border-slate-100">
              <h4 className="font-bold text-slate-700 text-sm mb-2 flex items-center gap-2"><Download size={14} /> Output</h4>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">Format</span>
                  <span className="text-xs font-bold text-slate-700">JPEG (High Quality)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Resolusi</span>
                  <span className="text-xs font-bold text-slate-700">{Math.round(crop.size)} x {Math.round(crop.size)} px</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
            <Button onClick={executeCrop} className="w-full py-3 shadow-lg shadow-cyan-500/20 text-lg">Simpan Foto</Button>
            <button onClick={onCancel} className="w-full py-3 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors">Batal</button>
          </div>
        </div>

      </div >
    </div >
  );
};

// --- PROFILE COMPONENT ---
function ProfileSettings({ user, students, onUpdate, onCancel, showToast }) {
  // Initialize state with all necessary fields, including academic info breakdown
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    password: user.password,
    photoUrl: user.photoUrl || '',
    bio: user.bio || '',
    internship_place: user.internship_place || '',
    supervisor1: user.supervisor_internal ? user.supervisor_internal.split(' ### ')[0] : '',
    supervisor2: user.supervisor_internal ? (user.supervisor_internal.split(' ### ')[1] || '') : ''
  });

  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(getPhotoUrl(user.photoUrl) || '');
  const [previewImage, setPreviewImage] = useState(null); // For viewing student photos
  const [croppingImage, setCroppingImage] = useState(null);

  // Update preview when manual URL changes (and no file selected)
  useEffect(() => {
    if (!photoFile && formData.photoUrl) {
      setPreview(getPhotoUrl(formData.photoUrl));
    }
  }, [formData.photoUrl, photoFile]);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCroppingImage(ev.target.result);
      };
      reader.readAsDataURL(file);
      e.target.value = null; // Allow re-selecting same file
    }
  };

  const handleCropComplete = (croppedBlob) => {
    const url = URL.createObjectURL(croppedBlob);
    setPreview(url);
    const file = new File([croppedBlob], "profile_cropped.jpg", { type: "image/jpeg" });
    setPhotoFile(file);
    setCroppingImage(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('success', 'Berhasil Disalin', 'NIM berhasil disalin ke clipboard.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    setLoading(true);
    isSubmittingRef.current = true;

    // Minimal validation
    if (!formData.name || !formData.email) {
      showToast('warning', 'Validasi Gagal', 'Nama Lengkap dan Email wajib diisi.');
      setLoading(false);
      isSubmittingRef.current = false;
      return;
    }

    try {
      let photoBase64 = null;
      if (photoFile) {
        const reader = new FileReader();
        photoBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(photoFile);
        });
      }

      // Reconstruct the supervisor string for the backend
      const supervisor_internal = `${formData.supervisor1} ### ${formData.supervisor2}`;

      const payload = {
        ...formData,
        id: user.id, // Current User ID
        role: user.role, // Current Role
        photoBase64: photoBase64,
        mimeType: photoFile ? photoFile.type : null,
        // Include link_folder if available in user object to help backend place file
        link_folder: user.link_folder,
        // Ensure strictly formatted academic info is sent
        supervisor_internal: supervisor_internal,
        internship_place: formData.internship_place,
        photoUrl: formData.photoUrl // Send manual URL if present
      };

      const result = await callAPI('updateProfile', payload);

      // Update Local State in Parent
      // Ensure photoUrl is updated with the result from backend or the preview
      onUpdate({
        ...formData,
        photoUrl: result.photoUrl || (photoBase64 ? preview : formData.photoUrl),
        supervisor_internal: supervisor_internal
      });

      showToast('success', 'Profil Diperbarui', 'Data profil berhasil disimpan ke database.');
    } catch (err) {
      console.error(err);
      showToast('error', 'Gagal Memperbarui Profil', err.message);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const headerLabelStyle = "font-bold text-slate-700 text-lg";

  const [showGuide, setShowGuide] = useState(false);

  const guideContent = `
    <ol class="list-decimal pl-5 space-y-2 text-sm text-slate-600">
      <li>Pastikan kamu menuliskan nama asli dosen pembimbing secara lengkap sesuai dengan data resmi dari kampus agar logbook kamu bisa langsung terhubung ke layar dosen yang bersangkutan tanpa nyasar. 🏫</li>
      <li>Kamu tidak perlu pusing memikirkan kelengkapan gelar akademik seperti sarjana atau magister karena sistem sudah dirancang pintar untuk mengabaikan embel-embel tersebut dan hanya berfokus pada nama utamanya saja. 🎓</li>
      <li>Hindari menyingkat nama dosen pembimbing apalagi hanya menggunakan sapaan akrab atau nama panggilan gaul sehari-hari karena sistem bisa kebingungan dan berisiko gagal mendata namamu serta huruf kapital/besar setiap kata. 🙅‍♂️</li>
      <li>Jangan khawatir jika kamu salah menaruh tanda titik atau koma saat menuliskan gelar karena sistem secara otomatis akan membersihkan tanda baca tersebut asalkan huruf pada nama utamanya tidak salah ketik. ✨</li>
      <li>Sebagai contoh penulisan yang tepat dan mudah terbaca sistem adalah <b>Budi Abdi</b> atau <b>Dr Budi Abdi S Pt M Si</b>. Sementara contoh yang tidak tepat adalah <b>Pak Abdi</b> atau <b>B Mengabdi</b> karena pemotongan nama maupun ketidaksesuaian nama membuat sistem kesulitan melacak data (misal: Budi Abdi ✅ | budi abdi ❌ | budi Abdi ❌ | Budi ❌). 📝</li>
    </ol>
  `;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-10">
      {previewImage && <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />}
      {showGuide && <TextModal title="Panduan Penulisan Nama Dosen" content={guideContent} onClose={() => setShowGuide(false)} />}

      {croppingImage && (
        <ImageCropper
          imageSrc={croppingImage}
          onCrop={handleCropComplete}
          onCancel={() => { setCroppingImage(null); }}
        />
      )}

      <Card title={<span className="text-2xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Pengaturan Profil Saya</span>}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={48} /></div>}
              </div>
              <label className="absolute bottom-0 right-0 bg-cyan-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-cyan-700 transition-colors"><Camera size={16} /><input type="file" className="hidden" accept="image/*" onChange={handleFileChange} /></label>
            </div>
            <p className="text-sm text-slate-500 mt-2">Klik ikon kamera untuk ganti foto</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nama Lengkap"
              name="name"
              value={formData.name}
              onChange={handleChange}
              labelClassName={headerLabelStyle}
            />

            {/* NIM Field - Read Only & Copyable */}
            <div className="mb-4">
              <label className={`block mb-2 ml-1 ${headerLabelStyle}`}>
                {user.role === 'student' ? 'NIM' : 'NIP / Username'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.username}
                  readOnly
                  className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(formData.username)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                  title={`Salin ${user.role === 'student' ? 'NIM' : 'NIP'}`}
                >
                  <FileText size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-1">*{user.role === 'student' ? 'NIM' : 'NIP'} tidak dapat diubah. Hubungi admin jika terdapat kesalahan.</p>
            </div>

            <Input
              label="Alamat Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              labelClassName={headerLabelStyle}
            />
            <Input
              label="Nomor Telepon"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="08123456789"
              labelClassName={headerLabelStyle}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Biarkan kosong jika tidak ingin mengubah"
              labelClassName={headerLabelStyle}
            />

            <div className="md:col-span-2">
              <label className={`block mb-2 ml-1 ${headerLabelStyle}`}>Bio / Uraian Singkat</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 outline-none transition-all bg-slate-50 focus:bg-white text-slate-700 placeholder:text-slate-400 min-h-[100px]"
                placeholder="Ceritakan sedikit tentang Anda..."
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-700 text-lg">Informasi Akademik</h4>
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="text-sm font-bold text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Lightbulb size={16} /> Lihat Panduan
              </button>
            </div>

            {user.role === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="md:col-span-2">
                  <Input
                    label="Tempat Magang"
                    name="internship_place"
                    value={formData.internship_place}
                    onChange={handleChange}
                    placeholder="Contoh: PT. Telkom Indonesia"
                  />
                </div>

                <Input
                  label="Dosen Pembimbing Utama"
                  name="supervisor1"
                  value={formData.supervisor1}
                  onChange={handleChange}
                  placeholder="Nama Dosen Pembimbing Pertama"
                />

                <Input
                  label="Dosen Pembimbing Pendamping"
                  name="supervisor2"
                  value={formData.supervisor2}
                  onChange={handleChange}
                  placeholder="Nama Dosen Pembimbing Kedua (Opsional)"
                />
              </div>
            )}

            {user.role === 'lecturer' && (
              <div className="bg-slate-50 p-4 rounded-xl space-y-3 text-sm border border-slate-100">
                <div><span className="font-bold text-slate-500">Jabatan:</span> {user.jabatan}</div>
                <div><span className="font-bold text-slate-500">Kelas Ampuan:</span> {user.classId || '-'}</div>
                <div><span className="font-bold text-slate-500">Status:</span> Aktif</div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>Batal</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Card>

      {user.role === 'lecturer' && (
        <Card title={`Daftar Mahasiswa Bimbingan Anda (${students ? students.length : 0})`}>
          {students && students.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4 font-bold text-center w-20">No</th>
                    <th className="p-4 font-bold text-center w-20">Foto</th>
                    <th className="p-4 font-bold">Nama Mahasiswa</th>
                    <th className="p-4 font-bold">NIM</th>
                    <th className="p-4 font-bold">Kelas</th>
                    <th className="p-4 font-bold">Logbook Terakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student, index) => (
                    <tr key={student.id || index} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-center text-slate-400 font-mono">{index + 1}</td>
                      <td className="p-4">
                        <div
                          className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden mx-auto cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all"
                          onClick={() => setPreviewImage(getPhotoUrl(student.photoUrl))}
                        >
                          {student.photoUrl ? (
                            <img src={getPhotoUrl(student.photoUrl)} alt={student.name} style={{ imageOrientation: 'from-image' }} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={20} /></div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-700">{student.name}</td>
                      <td className="p-4 font-mono text-slate-500">{student.nim || student.username}</td>
                      <td className="p-4 text-slate-600">{student.class}</td>
                      <td className="p-4">
                        {student.lastLogbook ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{student.lastLogbook}</span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum ada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <User size={48} className="mb-3 opacity-50" />
              <p>Belum ada data mahasiswa bimbingan yang ditemukan.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [logbooks, setLogbooks] = useState(INITIAL_LOGBOOKS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [toasts, setToasts] = useState([]);

  // Toast Function
  const showToast = useCallback((type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Persistent Login Logic (Check local storage on mount)
  useEffect(() => {
    const savedSession = localStorage.getItem('app_session');
    if (savedSession) {
      try {
        const { userData, expires } = JSON.parse(savedSession);
        // Check if 6 months haven't passed
        if (new Date().getTime() < expires) {
          setUser(userData);
          setView(userData.role === 'student' ? 'student-dashboard' : 'lecturer-dashboard');

          if (GAS_URL.includes("MASUKKAN_URL")) {
            showToast('warning', 'Konfigurasi Diperlukan', 'Silahkan edit file App.jsx dan masukkan URL Google Apps Script yang sudah dideploy.');
          }
        } else {
          localStorage.removeItem('app_session'); // Expired
        }
      } catch (e) {
        localStorage.removeItem('app_session');
      }
    }
  }, []);

  // Reusable Fetch Function
  const fetchData = async () => {
    if (!user) return;

    try {
      // Identify ID to pass: NIM for student, Username/NIP for lecturer
      const idToPass = user.username;

      // Only fetch logbooks for now (centralized)
      // Both Student and Lecturer need logbooks
      const res = await fetch(`${GAS_URL}?action=getAllLogbooks&userId=${idToPass}&role=${user.role}`);
      const json = await res.json();

      let data = [];
      if (json.status === 'success') {
        data = json.data;
      }

      if (data) {
        if (Array.isArray(data)) {
          setLogbooks(data);
        } else if (data.logbooks) {
          setLogbooks(data.logbooks);
        }
      }
      return true; // Return true on success
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      showToast('error', 'Gagal Memuat Data', 'Tidak dapat mengambil data logbook terbaru.');
      return false; // Return false on error
    }
  };

  // Fetch Data on User Login/Load
  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleLogin = async (identifier, password) => {
    if (!identifier || !password) {
      showToast('warning', 'Peringatan!', 'Harap isi ID/Email dan Password.');
      return;
    }

    showToast('info', 'Sedang Masuk...', 'Memverifikasi data akun...');

    try {
      const userData = await callAPI('login', { identifier, password });

      const role = userData.role;
      setUser(userData);
      setView(role === 'student' ? 'student-dashboard' : 'lecturer-dashboard');

      showToast('success', 'Berhasil Login!', `Selamat datang kembali, ${userData.name}.`);

      // Save session for 8 months
      const eightMonths = 8 * 30 * 24 * 60 * 60 * 1000;
      const expires = new Date().getTime() + eightMonths;
      localStorage.setItem('app_session', JSON.stringify({ userData, expires }));

    } catch (err) {
      showToast('error', 'Login Gagal', err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    localStorage.removeItem('app_session');
    showToast('info', 'Berhasil Keluar', 'Anda telah keluar dari sistem.');
  };

  const handleProfileUpdate = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);

    // Update session storage
    const savedSession = localStorage.getItem('app_session');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      parsed.userData = newUser;
      localStorage.setItem('app_session', JSON.stringify(parsed));
    }
    // Note: Actually sending update to backend would need another API endpoint
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-cyan-200 selection:text-cyan-900 relative">
      <GlobalStyles />

      {/* GLOBAL TOAST CONTAINER */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastMessage id={t.id} type={t.type} title={t.title} message={t.message} onClose={removeToast} />
          </div>
        ))}
      </div>

      {view === 'login' && <LoginPage onLogin={handleLogin} />}
      {view === 'student-dashboard' && user && (
        <ErrorBoundary>
          <StudentDashboard user={user} onLogout={handleLogout} logbooks={logbooks} setLogbooks={setLogbooks} reports={reports} setReports={setReports} onUpdateProfile={handleProfileUpdate} showToast={showToast} onRefresh={fetchData} />
        </ErrorBoundary>
      )}
      {view === 'lecturer-dashboard' && user && (
        <ErrorBoundary>
          <LecturerDashboard user={user} onLogout={handleLogout} logbooks={logbooks} setLogbooks={setLogbooks} reports={reports} onUpdateProfile={handleProfileUpdate} showToast={showToast} />
        </ErrorBoundary>
      )}
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [identifier, setIdentifier] = useState(''); const [password, setPassword] = useState('');
  const handleAuthorClick = (e) => { const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); if (isMobile) { e.preventDefault(); window.location.href = "vnd.youtube://www.youtube.com/@HALLOABDI"; setTimeout(() => { window.location.href = "https://m.youtube.com/@HALLOABDI"; }, 500); } };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-500 via-blue-600 to-blue-800 p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px]"></div>
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 z-10">
        <div className="pt-12 pb-6 px-10 text-center"><h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent tracking-tight mb-2">Sistem Akademik</h1><p className="text-slate-500 text-lg font-medium">Agrinak Mengabdi</p></div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(identifier, password); }} className="p-10 pt-4">
          <Input label="Username / Email / No HP" placeholder="Masukkan Identitas" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          <Input label="Password" type="password" placeholder="Kata sandi" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" className="w-full mt-6 py-4 text-lg shadow-cyan-500/30 rounded-2xl">Masuk Dashboard</Button>
          <div className="mt-8 text-center text-sm text-slate-500">Made by <a href="https://www.youtube.com/@HALLOABDI" onClick={handleAuthorClick} target="_blank" rel="noopener noreferrer" className="font-bold text-cyan-600 hover:text-cyan-800 transition-colors">Mas Abdi</a> for Agrinak Mengabdi</div>
        </form>
      </div>
    </div>
  );
}

// --- STUDENT DASHBOARD ---
function StudentDashboard({ user, onLogout, logbooks, setLogbooks, reports, setReports, onUpdateProfile, showToast, onRefresh }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingLogbook, setEditingLogbook] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const handleEditLogbook = (log) => {
    setEditingLogbook(log);
  };

  const handleUpdateLogbook = async (editData) => {
    // API Call
    const res = await callAPI('editLogbook', {
      ...editData,
      link_spreadsheet: user.link_spreadsheet,
      link_folder: user.link_folder
    });

    // Update local state
    const updatedLogs = logbooks.map(l => {
      // Use original date and time matching because timestamp might change slightly due to sync
      if (l.nim === editData.username && l.date === editData.originalDate && l.time === editData.originalTime) {
        const newLog = { ...l, ...editData.logEntry };
        // Restore URLs if backend returned them
        if (res.selfieUrl) newLog.selfieUrl = res.selfieUrl;
        if (res.docUrl) newLog.docUrl = res.docUrl;
        return newLog;
      }
      return l;
    });

    setLogbooks(updatedLogs);
    showToast('success', 'Berhasil', 'Logbook telah diperbarui.');
    setEditingLogbook(null);
  };

  const handleDeleteLogbook = async (deleteData) => {
    // Show Modern Confirmation Modal
    setDeleteConfirmation(deleteData);
  };

  const confirmDeleteLogbook = async () => {
    if (!deleteConfirmation) return;
    const deleteData = deleteConfirmation;
    setDeleteConfirmation(null);
    showToast('info', 'Menghapus...', 'Sedang menghapus logbook...');

    try {
      await callAPI('deleteLogbook', {
        ...deleteData,
      });

      // Update local state by removing
      const updatedLogs = logbooks.filter(l => {
         // Keep all logs that DO NOT match the exact original data
         const isMatch = (l.nim === deleteData.username && l.date === deleteData.originalDate && l.time === deleteData.originalTime);
         return !isMatch;
      });

      setLogbooks(updatedLogs);
      showToast('success', 'Berhasil', 'Logbook telah dihapus.');
      setEditingLogbook(null);
    } catch(err) {
      showToast('error', 'Gagal', err.message);
    }
  };

  const cancelDeleteLogbook = () => {
    setDeleteConfirmation(null);
    showToast('info', 'Dibatalkan', 'Batal menghapus logbook.');
  };

  const NavItem = ({ id, label, icon: Icon }) => {
    const isActive = activeTab === id;
    return (
      <button onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-5 py-3.5 mx-3 mb-2 rounded-xl transition-all duration-300 font-medium ${isActive ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`} style={{ width: 'calc(100% - 1.5rem)' }}>
        <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
        <span>{label}</span>
        {isActive && <ChevronRight size={16} className="ml-auto opacity-70" />}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-lg z-20">
        <div className="p-8">
          <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Panel Mahasiswa</h2>
          <p className="text-slate-400 text-sm font-medium mt-1 truncate">{user.name}</p>
        </div>
        <nav className="flex-1 py-2">
          <NavItem id="overview" label="Overview" icon={LayoutDashboard} />
          <NavItem id="logbook" label="Isi Logbook" icon={MapPin} />
          <NavItem id="report" label="Kerjakan Laporan" icon={FileText} />
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 font-medium ${activeTab === 'profile' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            <User size={20} className={activeTab === 'profile' ? 'text-white' : 'text-slate-400'} /> Profil Saya
          </button>
          <Button variant="danger" onClick={onLogout} className="w-full justify-center rounded-xl"><LogOut size={18} /> Keluar</Button>
        </div>
      </aside>

      {/* Header Mobile */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 backdrop-blur-md flex items-center justify-between px-6 z-50 shadow-md">
        <div className="text-white"><h2 className="text-xl font-bold">Mahasiswa Panel</h2><p className="text-xs text-blue-100 truncate max-w-[200px]">{user.name}</p></div>
        <button onClick={() => setActiveTab('profile')} className={`p-2 rounded-full text-white transition-colors shadow-sm ${activeTab === 'profile' ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30'}`}><User size={22} /></button>
      </div>

      {/* Bottom Navigation Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 px-2 pb-safe pt-2">
        <div className="flex justify-around items-center">
          <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center justify-center py-2 px-1 mx-1 rounded-2xl min-w-[4.5rem] flex-1 transition-all duration-300 ${activeTab === 'overview' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 font-bold scale-105' : 'text-slate-400 hover:text-cyan-600 hover:bg-slate-50'}`}>
            <LayoutDashboard size={22} className="mb-1" />
            <span className="text-[12px] font-bold text-center leading-tight">Overview</span>
          </button>
          <button onClick={() => setActiveTab('logbook')} className={`flex flex-col items-center justify-center py-2 px-1 mx-1 rounded-2xl min-w-[4.5rem] flex-1 transition-all duration-300 ${activeTab === 'logbook' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 font-bold scale-105' : 'text-slate-400 hover:text-cyan-600 hover:bg-slate-50'}`}>
            <MapPin size={22} className="mb-1" />
            <span className="text-[12px] font-bold text-center leading-tight">Isi<br />Logbook</span>
          </button>
          <button onClick={() => setActiveTab('report')} className={`flex flex-col items-center justify-center py-2 px-1 mx-1 rounded-2xl min-w-[4.5rem] flex-1 transition-all duration-300 ${activeTab === 'report' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 font-bold scale-105' : 'text-slate-400 hover:text-cyan-600 hover:bg-slate-50'}`}>
            <FileText size={22} className="mb-1" />
            <span className="text-[12px] font-bold text-center leading-tight">Kerjakan<br />Laporan</span>
          </button>
          <button onClick={onLogout} className="flex flex-col items-center justify-center py-2 px-1 mx-1 rounded-2xl min-w-[4.5rem] flex-1 transition-all duration-300 text-red-400 hover:text-red-600 hover:bg-red-50">
            <LogOut size={22} className="mb-1" />
            <span className="text-[12px] font-bold text-center leading-tight">Keluar</span>
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto relative pt-24 pb-20 md:pt-0 md:pb-0">
        <div className="p-5 md:p-8 max-w-7xl mx-auto">
          {activeTab === 'overview' && <StudentOverview user={user} logbooks={logbooks} reports={reports} onEditLogbook={handleEditLogbook} onRefresh={onRefresh} />}
          {activeTab === 'logbook' && <StudentLogbookForm user={user} logbooks={logbooks} setLogbooks={setLogbooks} showToast={showToast} />}
          {activeTab === 'report' && <StudentReportForm user={user} reports={reports} setReports={setReports} showToast={showToast} />}
          {activeTab === 'profile' && <ProfileSettings user={user} onUpdate={onUpdateProfile} onCancel={() => setActiveTab('overview')} showToast={showToast} />}
        </div>
      </main>

      {/* Edit Modal */}
      {editingLogbook && (
        <LogbookEditModal
          isOpen={!!editingLogbook}
          onClose={() => setEditingLogbook(null)}
          logbook={editingLogbook}
          onUpdate={handleUpdateLogbook}
          onDelete={handleDeleteLogbook}
          showToast={showToast}
          user={user}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl flex flex-col p-6 animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Logbook?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Yakin ingin menghapus logbook ini? Tindakan ini tidak dapat dibatalkan dan data akan hilang secara permanen.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={cancelDeleteLogbook} className="flex-1 justify-center rounded-xl">Batal</Button>
              <Button variant="danger" onClick={confirmDeleteLogbook} className="flex-1 justify-center rounded-xl">Ya, Hapus</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- EXPORT DATE RANGE MODAL ---
const ExportDateRangeModal = ({ onClose, onConfirm, logbooks = [] }) => {
  const today = new Date().toISOString().split('T')[0];
  const sortedDates = [...logbooks].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const firstDate = sortedDates[0]?.date || today;
  const lastDate  = sortedDates[sortedDates.length - 1]?.date || today;

  const [mode, setMode]           = useState('rentang'); // 'rentang' as default
  const [startDate, setStartDate] = useState(firstDate);
  const [endDate, setEndDate]     = useState(lastDate);
  const [activeField, setActiveField] = useState(null); // 'start' | 'end' | null

  const [currentYear, setCurrentYear]   = useState(new Date(startDate || today).getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date(startDate || today).getMonth());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const presets = [
    { label: '7 Hari Terakhir', days: 7 },
    { label: '30 Hari Terakhir', days: 30 },
    { label: '3 Bulan Terakhir', days: 90 },
    { label: 'Bulan Ini', custom: 'thisMonth' },
  ];

  const applyPreset = (preset) => {
    const end = new Date();
    const endStr = end.toISOString().split('T')[0];
    let startStr;
    if (preset.custom === 'thisMonth') {
      const start = new Date(end.getFullYear(), end.getMonth(), 1);
      startStr = start.toISOString().split('T')[0];
    } else {
      const start = new Date();
      start.setDate(start.getDate() - preset.days);
      startStr = start.toISOString().split('T')[0];
    }
    setStartDate(startStr);
    setEndDate(endStr);
    setActiveField(null);

    const startObj = new Date(startStr);
    setCurrentYear(startObj.getFullYear());
    setCurrentMonth(startObj.getMonth());
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayRaw = new Date(currentYear, currentMonth, 1).getDay();
  const firstDayIndex = firstDayRaw === 0 ? 6 : firstDayRaw - 1;

  const matchedCount = mode === 'semua'
    ? logbooks.length
    : logbooks.filter(l => l.date && l.date >= startDate && l.date <= endDate).length;

  const handleConfirm = () => {
    if (mode === 'semua') {
      onConfirm(null, null); // null = semua
    } else {
      onConfirm(startDate, endDate);
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '--/--/----';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <>
      {createPortal(
        <div
          className="fixed inset-0 z-[1000] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            if (activeField) {
              setActiveField(null);
            } else {
              onClose();
            }
          }}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Gradient Header */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg leading-tight">Pilihan Ekspor Logbook</h3>
                    <p className="text-blue-100 text-xs font-medium mt-0.5">Pilih semua atau tentukan rentang tanggal</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
                  <X size={16} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5" onClick={() => setActiveField(null)}>
              {/* Mode Selector */}
              <div className="grid grid-cols-2 gap-3" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setMode('rentang');
                    setActiveField(null);
                  }}
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${
                    mode === 'rentang'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    mode === 'rentang' ? 'bg-indigo-100' : 'bg-slate-100'
                  }`}>
                    <Calendar size={18} className={mode === 'rentang' ? 'text-indigo-600' : 'text-slate-400'} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-extrabold leading-tight">Pilih Rentang</p>
                    <p className="text-[10px] font-medium opacity-70 mt-0.5">Filter tanggal</p>
                  </div>
                  {mode === 'rentang' && <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                </button>
                <button
                  onClick={() => {
                    setMode('semua');
                    setActiveField(null);
                  }}
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${
                    mode === 'semua'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    mode === 'semua' ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <FileSpreadsheet size={18} className={mode === 'semua' ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-extrabold leading-tight">Export Semua</p>
                    <p className="text-[10px] font-medium opacity-70 mt-0.5">Semua {logbooks.length} entri</p>
                  </div>
                  {mode === 'semua' && <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                </button>
              </div>

              {/* Date Range Section – only shown when mode = 'rentang' */}
              {mode === 'rentang' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200" onClick={e => e.stopPropagation()}>
                  {/* Quick Presets */}
                  <div>
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Pilihan Cepat</p>
                    <div className="grid grid-cols-2 gap-2">
                      {presets.map(p => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => applyPreset(p)}
                          className="px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 text-slate-600 transition-all"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Inputs Container */}
                  <div className="grid grid-cols-2 gap-3 relative">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Dari Tanggal</label>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveField(activeField === 'start' ? null : 'start');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 border-2 rounded-xl text-sm font-semibold outline-none transition-all bg-slate-50 text-left ${
                          activeField === 'start' ? 'border-indigo-500 text-indigo-700 ring-2 ring-indigo-100' : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>{formatDisplayDate(startDate)}</span>
                        <Calendar size={16} className={activeField === 'start' ? 'text-indigo-500' : 'text-slate-400'} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Hingga Tanggal</label>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveField(activeField === 'end' ? null : 'end');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 border-2 rounded-xl text-sm font-semibold outline-none transition-all bg-slate-50 text-left ${
                          activeField === 'end' ? 'border-indigo-500 text-indigo-700 ring-2 ring-indigo-100' : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>{formatDisplayDate(endDate)}</span>
                        <Calendar size={16} className={activeField === 'end' ? 'text-indigo-500' : 'text-slate-400'} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Matched Count Badge */}
              <div className={`flex items-center gap-3 p-3.5 rounded-2xl text-sm font-bold ${
                matchedCount > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`} onClick={e => e.stopPropagation()}>
                {matchedCount > 0
                  ? <CheckCircle size={16} className="shrink-0" />
                  : <AlertTriangle size={16} className="shrink-0" />}
                <span>
                  {matchedCount > 0
                    ? mode === 'semua'
                      ? `Semua ${matchedCount} entri logbook akan diekspor`
                      : `${matchedCount} entri logbook dalam rentang ini`
                    : 'Tidak ada logbook dalam rentang tanggal ini'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3" onClick={e => e.stopPropagation()}>
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl text-sm transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => matchedCount > 0 && handleConfirm()}
                disabled={matchedCount === 0}
                className={`flex-1 py-3 rounded-2xl text-sm font-extrabold transition-all ${
                  matchedCount > 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Lanjutkan →
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Dedicated Calendar Popover Modal */}
      {activeField && createPortal(
        <div
          className="fixed inset-0 z-[1050] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setActiveField(null)}
        >
          <div
            className="bg-white w-full max-w-[320px] rounded-3xl shadow-2xl border border-slate-100 p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-extrabold text-slate-800 tracking-wider uppercase">
                {activeField === 'start' ? 'Pilih Tanggal Mulai' : 'Pilih Tanggal Selesai'}
              </span>
              <button
                onClick={() => setActiveField(null)}
                className="w-6 h-6 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </div>

            {/* Calendar Controller */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-extrabold text-slate-700">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, idx) => (
                <span key={idx} className="text-[10px] font-extrabold text-slate-400 uppercase py-0.5">
                  {day}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 justify-items-center">
              {Array(firstDayIndex).fill(null).map((_, idx) => (
                <div key={`empty-${idx}`} className="w-8 h-8" />
              ))}
              {Array.from({ length: daysInMonth }, (_, idx) => {
                const d = idx + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const isSelected = activeField === 'start' ? dateStr === startDate : dateStr === endDate;
                const isToday = dateStr === today;
                const isOtherFieldSelected = activeField === 'start' ? dateStr === endDate : dateStr === startDate;
                const isInBetween = startDate && endDate && dateStr > startDate && dateStr < endDate;

                let btnClass = "w-8 h-8 flex items-center justify-center text-xs font-bold transition-all rounded-full ";
                if (isSelected) {
                  btnClass += "bg-indigo-600 text-white shadow-md shadow-indigo-200";
                } else if (isOtherFieldSelected) {
                  btnClass += "bg-indigo-100 text-indigo-700 font-extrabold";
                } else if (isInBetween) {
                  btnClass += "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-none w-full";
                } else if (isToday) {
                  btnClass += "border border-indigo-500 text-indigo-600";
                } else {
                  btnClass += "text-slate-600 hover:bg-slate-100";
                }

                const isDisabled = activeField === 'start'
                  ? (endDate && dateStr > endDate)
                  : (startDate && dateStr < startDate);

                if (isDisabled) {
                  btnClass = "w-8 h-8 flex items-center justify-center text-xs font-medium text-slate-300 cursor-not-allowed";
                }

                let cellClass = "w-8 h-8 flex items-center justify-center ";
                if (isSelected && activeField === 'start' && endDate) {
                  cellClass += "rounded-l-full bg-indigo-50";
                } else if (isSelected && activeField === 'end' && startDate) {
                  cellClass += "rounded-r-full bg-indigo-50";
                } else if (isOtherFieldSelected && activeField === 'start') {
                  cellClass += "rounded-r-full bg-indigo-50";
                } else if (isOtherFieldSelected && activeField === 'end') {
                  cellClass += "rounded-l-full bg-indigo-50";
                } else if (isInBetween) {
                  cellClass += "bg-indigo-50";
                }

                return (
                  <div key={d} className={cellClass}>
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (activeField === 'start') {
                          setStartDate(dateStr);
                        } else {
                          setEndDate(dateStr);
                        }
                        setActiveField(null); // auto-close
                      }}
                      className={btnClass}
                    >
                      {d}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Action Info */}
            <div className="text-center pt-2 text-[10px] font-bold text-slate-400">
              Pilih tanggal untuk langsung menerapkan
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// --- EXPORT PHOTO OPTION MODAL ---
const ExportPhotoOptionModal = ({ onClose, onConfirm }) => {
  const [selectedOption, setSelectedOption] = useState('Semua');

  return createPortal(
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <h3 className="font-bold text-lg text-slate-800">Opsi Ekspor Foto</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-3">
          {[
            { id: 'Semua', label: 'Ekspor Foto Selfie dan Dokumentasi' },
            { id: 'FotoSelfieSaja', label: 'Ekspor Foto Selfie Saja' },
            { id: 'FotoDokumentasiSaja', label: 'Ekspor Foto Dokumentasi Saja' },
            { id: 'JanganKeduanya', label: 'Jangan Ekspor Foto Selfie dan Foto Dokumentasi' },
          ].map(opt => (
            <label key={opt.id} onClick={() => setSelectedOption(opt.id)} className={`flex items-start sm:items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${selectedOption === opt.id ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <div className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 ${selectedOption === opt.id ? 'border-cyan-500' : 'border-slate-300'}`}>
                {selectedOption === opt.id && <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full" />}
              </div>
              <span className={`text-sm font-medium leading-tight ${selectedOption === opt.id ? 'text-cyan-800 font-bold' : 'text-slate-700'}`}>{opt.label}</span>
            </label>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={() => onConfirm(selectedOption)}>Lanjutkan Ekspor</Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- EXPORT PROGRESS MODAL ---
const ExportProgressModal = ({ progress, onClose }) => {
  if (!progress) return null;
  const { status, message, detail, current, total } = progress;
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return createPortal(
    <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 animate-in zoom-in-95 border border-slate-100">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          
          {status === 'loading' && (
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-cyan-500 animate-spin"></div>
              <Download size={24} className="absolute text-cyan-600 animate-pulse" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
              <CheckCircle size={36} className="text-emerald-600 animate-bounce" />
            </div>
          )}
          
          {status === 'error' && (
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-100">
              <XCircle size={36} className="text-red-600 animate-bounce" />
            </div>
          )}

          <h3 className="font-extrabold text-xl text-slate-800 tracking-tight">
            {status === 'loading' ? 'Sedang Mengekspor...' : status === 'success' ? 'Ekspor Selesai!' : 'Ekspor Gagal'}
          </h3>

          <div className="space-y-1.5 w-full">
            <p className="text-sm font-bold text-slate-700">{message}</p>
            {detail && <p className="text-xs text-slate-400 font-medium px-4 line-clamp-2 min-h-[32px]">{detail}</p>}
          </div>

          {status === 'loading' && total > 0 && (
            <div className="w-full space-y-2 px-2">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase font-mono">
                <span>{percent}% Selesai</span>
                <span>{current} / {total} Entri</span>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="w-full bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-left">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-amber-800">Jangan Refresh Halaman</p>
                <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
                  Harap tunggu hingga proses selesai. Menutup atau memuat ulang halaman akan membatalkan proses ekspor file Anda.
                </p>
              </div>
            </div>
          )}
        </div>

        {status !== 'loading' && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center w-full">
            <button 
              onClick={onClose} 
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800 rounded-2xl font-bold transition-all text-sm"
            >
              Tutup Notifikasi
            </button>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};

// --- UTILITY: COMPRESS IMAGE FOR EXPORTS ---
const compressImage = (base64, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG with the specified quality (reducing file size significantly)
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.onerror = () => {
      resolve(base64); // Fallback to original base64 on error
    };
    img.src = base64;
  });
};

// --- EXPORT COMPONENT ---
const ExportDropdown = ({ logbooks = [], reports = [], user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [exportDateRange, setExportDateRange] = useState({ start: null, end: null });
  const [exportProgress, setExportProgress] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBase64Image = async (url) => {
    try {
      if (!url) return null;
      let base64 = null;
      if (url.startsWith('data:image')) {
        base64 = url;
      } else {
        // Extract Google Drive File ID if present
        let fileId = null;
        const dMatch = url.match(/\/d\/([-\w]{15,})/);
        const idParamMatch = url.match(/[?&]id=([-\w]{15,})/);
        if (dMatch && dMatch[1]) {
          fileId = dMatch[1];
        } else if (idParamMatch && idParamMatch[1]) {
          fileId = idParamMatch[1];
        }

        // If we have a Google Drive URL, use the direct lh3 download link to support CORS
        let fetchUrl = url;
        if (fileId) {
          fetchUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
        }

        const res = await fetch(fetchUrl, { mode: 'cors' });
        if (!res.ok) {
          throw new Error(`Failed to fetch image: HTTP ${res.status}`);
        }

        const blob = await res.blob();
        
        // CRITICAL: Verify the downloaded blob is actually an image!
        if (!blob || !blob.type.startsWith('image/')) {
          throw new Error(`Fetched resource is not an image (type: ${blob ? blob.type : 'unknown'})`);
        }

        base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("FileReader failed"));
          reader.readAsDataURL(blob);
        });
      }

      if (base64 && base64.startsWith('data:image')) {
        // Compress image to max 800px width/height and 0.7 JPEG quality
        const compressed = await compressImage(base64, 800, 800, 0.7);
        if (compressed && compressed.startsWith('data:image')) {
          return compressed;
        }
      }
      return null;
    } catch (e) {
      console.warn('Failed to load/compress image for export:', e, 'URL:', url);
      return null;
    }
  };

  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64.split(",")[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const getImageDimensions = (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 100, height: 100 });
      };
      img.src = base64;
    });
  };

  const getFormattedDateTimePlace = (log) => {
    // Always rebuild from raw fields to ensure status and coordinates are formatted correctly
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    let dateObj = null;
    if (log.date) {
      const parts = log.date.split('-');
      if (parts.length === 3) {
        dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        dateObj = new Date(log.date);
      }
    }
    let dayName = "";
    let dateStr = log.date || "";
    if (dateObj && !isNaN(dateObj.getTime())) {
      dayName = dayNames[dateObj.getDay()];
      dateStr = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    }
    const timeStr = log.time || "";
    let statusStr = String(log.status || "").trim();
    if (statusStr) {
      statusStr = statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
    }
    const coordStr = (log.lat && log.lng && log.lat !== 0 && log.lng !== 0)
      ? `${log.lat}, ${log.lng}`
      : "";
    const addressStr = log.address || "";
    const parts = [];
    if (dayName && dateStr) {
      parts.push(`${dayName}, ${dateStr}`);
    } else if (dateStr) {
      parts.push(dateStr);
    }
    if (timeStr) parts.push(timeStr);
    if (statusStr) parts.push(statusStr);
    if (coordStr) parts.push(`(${coordStr})`);
    if (addressStr) parts.push(addressStr);
    return parts.join(" - ");
  };

  const textToRuns = (text, TextRun) => {
    if (!text) return [];
    const lines = text.split('\n');
    const runs = [];
    lines.forEach((line, idx) => {
      runs.push(new TextRun({
        text: line,
        font: "Times New Roman",
        size: 24,
        break: idx > 0 ? 1 : undefined,
      }));
    });
    return runs;
  };

  const cleanText = (html) => {
    if (!html) return '';
    let text = html.toString();

    // Convert block endings and line breaks to actual newlines
    text = text.replace(/<\/div>|<\/p>|<\/li>|<br\s*[\/]?>/gi, '\n');

    // Remove all remaining HTML tags
    text = text.replace(/<[^>]+>/g, '');

    // Handle common HTML entities
    text = text.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&');

    // Handle concatenated numbering (e.g., "ABCD2. XYZ" -> "ABCD\n2. XYZ")
    // This regex looks for a lowercase letter, a number, a dot, and a space/capital letter
    text = text.replace(/([a-zA-Z])(\d+\.)/g, '$1\n$2');

    // Clean up text: split by newline, trim each line, remove empty lines, and rejoin with single newline
    return text.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');
  };

  const exportLogbookDocx = async (photoOption) => {
    setIsOpen(false);
    
    const exportSelfie = photoOption === 'Semua' || photoOption === 'FotoSelfieSaja';
    const exportDoc = photoOption === 'Semua' || photoOption === 'FotoDokumentasiSaja';
    const { start: dateStart, end: dateEnd } = exportDateRange;
    const ownLogbooks = (logbooks || [])
      .filter(l => Boolean((l.nim && user?.username && l.nim === user?.username) || (l.userId && user?.id && l.userId === user?.id) || (l.nim && user?.nim && l.nim === user?.nim)))
      .filter(l => {
        if (!dateStart || !dateEnd) return true;
        return l.date >= dateStart && l.date <= dateEnd;
      });
    if (!ownLogbooks || ownLogbooks.length === 0) return alert('Tidak ada data logbook untuk diekspor pada rentang tanggal tersebut.');

    setExportProgress({
      status: 'loading',
      message: 'Menghubungkan pustaka eksport...',
      detail: 'Mengimpor package docx...',
      current: 0,
      total: ownLogbooks.length
    });

    try {
      // Sort oldest to newest
      // Sort oldest to newest
      const sortedLogs = [...ownLogbooks].sort((a, b) => {
        const dateA = parseDateSafe(a.date, a.time);
        const dateB = parseDateSafe(b.date, b.time);
        return dateA - dateB;
      });

      const {
        Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        WidthType, AlignmentType, ImageRun, PageOrientation, VerticalAlign, BorderStyle,
        TableLayoutType
      } = await import('docx');

      const createImageCell = async (url, widthDxa, exportImg, imgLabel, logDate) => {
        if (exportImg && url) {
          setExportProgress(prev => ({
            ...prev,
            detail: `Mengunduh ${imgLabel} (Tanggal: ${logDate || ''})...`
          }));
          const base64 = await getBase64Image(url);
          if (base64) {
            try {
              const dims = await getImageDimensions(base64);
              const arrayBuffer = base64ToArrayBuffer(base64);
              
              const targetWidth = Math.round((widthDxa / 15) * 0.985);
              const targetHeight = targetWidth / (dims.width / dims.height);
              
              let imgType = "png";
              if (base64.includes("image/jpeg") || base64.includes("image/jpg")) {
                imgType = "jpg";
              } else if (base64.includes("image/gif")) {
                imgType = "gif";
              }
              
              return new TableCell({
                width: { size: widthDxa, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        data: arrayBuffer,
                        transformation: {
                          width: targetWidth,
                          height: targetHeight
                        },
                        type: imgType
                      })
                    ],
                    spacing: { before: 80, after: 80 }
                  })
                ]
              });
            } catch (err) {
              console.warn("Failed to process image:", err);
            }
          }
        }
        
        return new TableCell({
          width: { size: widthDxa, type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "-",
                  font: "Times New Roman",
                  size: 24
                })
              ],
              spacing: { before: 80, after: 80 }
            })
          ]
        });
      };

      const tableRows = [];

      // Header Row
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 1757, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: "Tanggal, Waktu dan Tempat",
                      bold: true,
                      font: "Times New Roman",
                      size: 24
                    })
                  ],
                  spacing: { before: 120, after: 120 }
                })
              ]
            }),
            new TableCell({
              width: { size: 1370, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: "Foto Selfie",
                      bold: true,
                      font: "Times New Roman",
                      size: 24
                    })
                  ],
                  spacing: { before: 120, after: 120 }
                })
              ]
            }),
            new TableCell({
              width: { size: 1984, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: "Detail Kegiatan",
                      bold: true,
                      font: "Times New Roman",
                      size: 24
                    })
                  ],
                  spacing: { before: 120, after: 120 }
                })
              ]
            }),
            new TableCell({
              width: { size: 1984, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: "Output yang Dihasilkan",
                      bold: true,
                      font: "Times New Roman",
                      size: 24
                    })
                  ],
                  spacing: { before: 120, after: 120 }
                })
              ]
            }),
            new TableCell({
              width: { size: 1381, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: "Dokumentasi Tambahan",
                      bold: true,
                      font: "Times New Roman",
                      size: 24
                    })
                  ],
                  spacing: { before: 120, after: 120 }
                })
              ]
            })
          ]
        })
      );

      // Data Rows
      for (let i = 0; i < sortedLogs.length; i++) {
        const log = sortedLogs[i];

        setExportProgress({
          status: 'loading',
          message: `Memproses entri ${i + 1} dari ${sortedLogs.length}`,
          detail: `Menyusun baris data (Tanggal: ${log.date || ''})...`,
          current: i + 1,
          total: sortedLogs.length
        });

        const dateCell = new TableCell({
          width: { size: 1757, type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.JUSTIFY,
              children: [
                new TextRun({
                  text: getFormattedDateTimePlace(log),
                  font: "Times New Roman",
                  size: 24
                })
              ],
              spacing: { before: 120, after: 120 }
            })
          ]
        });

        const selfieCell = await createImageCell(log.selfieUrl, 1370, exportSelfie, "Foto Selfie", log.date);

        const activityCell = new TableCell({
          width: { size: 1984, type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.JUSTIFY,
              children: textToRuns(cleanText(log.activity), TextRun),
              spacing: { before: 120, after: 120 }
            })
          ]
        });

        const outputCell = new TableCell({
          width: { size: 1984, type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.JUSTIFY,
              children: textToRuns(cleanText(log.output), TextRun),
              spacing: { before: 120, after: 120 }
            })
          ]
        });

        const docCell = await createImageCell(log.docUrl, 1381, exportDoc, "Foto Dokumentasi", log.date);

        tableRows.push(
          new TableRow({
            children: [dateCell, selfieCell, activityCell, outputCell, docCell]
          })
        );
      }

      setExportProgress({
        status: 'loading',
        message: 'Menyusun dokumen Word...',
        detail: 'Membuat halaman lampiran & tabel...',
        current: sortedLogs.length,
        total: sortedLogs.length
      });

      const doc = new Document({
        styles: {
          documentDefaults: {
            run: {
              font: "Times New Roman",
              size: 24
            }
          }
        },
        sections: [{
          properties: {
            page: {
              size: {
                width: 11906,
                height: 16838
              },
              margin: {
                top: 1701,
                bottom: 1701,
                left: 2268,
                right: 1701
              },
              orientation: PageOrientation.PORTRAIT
            }
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "LAMPIRAN", bold: true, font: "Times New Roman", size: 24 })
              ],
              spacing: { before: 0, after: 240 }
            }),
            new Paragraph({
              alignment: AlignmentType.JUSTIFY,
              children: [
                new TextRun({ text: "Lampiran 1. Logbook", bold: true, font: "Times New Roman", size: 24 })
              ],
              spacing: { before: 0, after: 240 }
            }),
            new Paragraph({
              alignment: AlignmentType.JUSTIFY,
              children: [
                new TextRun({ text: "Nama	: ", font: "Times New Roman", size: 24 }),
                new TextRun({ text: user?.name || "", font: "Times New Roman", size: 24 })
              ],
              spacing: { before: 0, after: 120 }
            }),
            new Paragraph({
              alignment: AlignmentType.JUSTIFY,
              children: [
                new TextRun({ text: "NIM	: ", font: "Times New Roman", size: 24 }),
                new TextRun({ text: user?.nim || user?.username || "", font: "Times New Roman", size: 24 })
              ],
              spacing: { before: 0, after: 120 }
            }),
            new Paragraph({
              alignment: AlignmentType.JUSTIFY,
              children: [
                new TextRun({ text: "Kelas	: ", font: "Times New Roman", size: 24 }),
                new TextRun({ text: user?.class || "", font: "Times New Roman", size: 24 })
              ],
              spacing: { before: 0, after: 360 }
            }),
            new Table({
              layout: TableLayoutType.FIXED,
              columnWidths: [1757, 1370, 1984, 1984, 1381],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "000000" }
              },
              width: {
                size: 8476,
                type: WidthType.DXA
              },
              rows: tableRows
            })
          ]
        }]
      });

      setExportProgress({
        status: 'loading',
        message: 'Mengompresi data file...',
        detail: 'Menghasikan file .docx...',
        current: sortedLogs.length,
        total: sortedLogs.length
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Logbook_${user?.name || 'Export'}.docx`);

      setExportProgress({
        status: 'success',
        message: 'Ekspor Word Berhasil!',
        detail: 'File .docx Anda telah berhasil diunduh ke folder unduhan Anda.',
        current: sortedLogs.length,
        total: sortedLogs.length
      });

    } catch (err) {
      console.error(err);
      setExportProgress({
        status: 'error',
        message: 'Gagal Mengekspor Word',
        detail: err.message || 'Terjadi kesalahan saat memproses ekspor logbook.',
        current: 0,
        total: ownLogbooks.length
      });
    }
  };

  const exportLogbook = async (photoOption) => {
    setIsOpen(false);
    
    const exportSelfie = photoOption === 'Semua' || photoOption === 'FotoSelfieSaja';
    const exportDoc = photoOption === 'Semua' || photoOption === 'FotoDokumentasiSaja';
    const { start: dateStart, end: dateEnd } = exportDateRange;
    const ownLogbooks = (logbooks || [])
      .filter(l => Boolean((l.nim && user?.username && l.nim === user?.username) || (l.userId && user?.id && l.userId === user?.id) || (l.nim && user?.nim && l.nim === user?.nim)))
      .filter(l => {
        if (!dateStart || !dateEnd) return true;
        return l.date >= dateStart && l.date <= dateEnd;
      });
    if (!ownLogbooks || ownLogbooks.length === 0) return alert('Tidak ada data logbook untuk diekspor pada rentang tanggal tersebut.');

    setExportProgress({
      status: 'loading',
      message: 'Menghubungkan pustaka eksport...',
      detail: 'Mengimpor package exceljs...',
      current: 0,
      total: ownLogbooks.length
    });

    try {
      // Sort oldest to newest
      // Sort oldest to newest
      const sortedLogs = [...ownLogbooks].sort((a, b) => {
        const dateA = parseDateSafe(a.date, a.time);
        const dateB = parseDateSafe(b.date, b.time);
        return dateA - dateB;
      });

      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Logbook');

      const borderStyle = { style: 'medium', color: { argb: 'FF000000' } };
      const applyRowBorder = (row) => {
        row.eachCell({ includeEmpty: true }, cell => {
          cell.border = {
            top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle
          };
        });
      };

      sheet.columns = [
        { header: 'Tanggal Logbook', key: 'tanggal', width: 20 },
        { header: 'Waktu Logbook', key: 'waktu', width: 20 },
        { header: 'Foto Selfie', key: 'selfie', width: 30 },
        { header: 'Koordinat', key: 'koordinat', width: 25 },
        { header: 'Nama Jalan', key: 'jalan', width: 40 },
        { header: 'Kegiatan yang Dilakukan', key: 'kegiatan', width: 40 },
        { header: 'Output yang Dihasilkan', key: 'output', width: 40 },
        { header: 'Foto Dokumentasi Tambahan', key: 'doc', width: 30 }
      ];

      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      applyRowBorder(headerRow);

      for (let i = 0; i < sortedLogs.length; i++) {
        const rowData = sortedLogs[i];

        setExportProgress({
          status: 'loading',
          message: `Memproses entri ${i + 1} dari ${sortedLogs.length}`,
          detail: `Mengisi baris data Excel (Tanggal: ${rowData.date || ''})...`,
          current: i + 1,
          total: sortedLogs.length
        });

        const row = sheet.addRow({
          tanggal: rowData.date,
          waktu: rowData.time,
          koordinat: (rowData.lat && rowData.lng) ? `${rowData.lat}, ${rowData.lng}` : '',
          jalan: rowData.address,
          kegiatan: cleanText(rowData.activity),
          output: cleanText(rowData.output)
        });

        row.height = 100;
        row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        applyRowBorder(row);

        if (exportSelfie && rowData.selfieUrl) {
          setExportProgress(prev => ({
            ...prev,
            detail: `Mengunduh Foto Selfie (Tanggal: ${rowData.date || ''})...`
          }));
          const base64 = await getBase64Image(rowData.selfieUrl);
          if (base64) {
            const exImageId = workbook.addImage({
              base64: base64,
              extension: base64.split(';')[0].split('/')[1] || 'png',
            });
            sheet.addImage(exImageId, {
              tl: { col: 2, row: row.number - 1 },
              ext: { width: 130, height: 130 },
              editAs: 'oneCell'
            });
          } else {
            const selfieCell = row.getCell(3);
            selfieCell.value = '-';
            selfieCell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        } else {
          const selfieCell = row.getCell(3);
          selfieCell.value = '-';
          selfieCell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        if (exportDoc && rowData.docUrl) {
          setExportProgress(prev => ({
            ...prev,
            detail: `Mengunduh Foto Dokumentasi (Tanggal: ${rowData.date || ''})...`
          }));
          const base64 = await getBase64Image(rowData.docUrl);
          if (base64) {
            const exImageId = workbook.addImage({
              base64: base64,
              extension: base64.split(';')[0].split('/')[1] || 'png',
            });
            sheet.addImage(exImageId, {
              tl: { col: 7, row: row.number - 1 },
              ext: { width: 130, height: 130 },
              editAs: 'oneCell'
            });
          } else {
            const docCell = row.getCell(8);
            docCell.value = '-';
            docCell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        } else {
          const docCell = row.getCell(8);
          docCell.value = '-';
          docCell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      }

      setExportProgress({
        status: 'loading',
        message: 'Menyusun file Excel...',
        detail: 'Menulis buffer data excel...',
        current: sortedLogs.length,
        total: sortedLogs.length
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Logbook_${user?.name || 'Export'}.xlsx`);

      setExportProgress({
        status: 'success',
        message: 'Ekspor Excel Berhasil!',
        detail: 'File logbook .xlsx Anda telah berhasil diunduh ke folder unduhan Anda.',
        current: sortedLogs.length,
        total: sortedLogs.length
      });

    } catch (err) {
      console.error(err);
      setExportProgress({
        status: 'error',
        message: 'Gagal Mengekspor Excel',
        detail: err.message || 'Terjadi kesalahan saat memproses ekspor logbook.',
        current: 0,
        total: ownLogbooks.length
      });
    }
  };

  const exportLaporan = async () => {
    setIsOpen(false);
    const ownReports = (reports || []).filter(r => Boolean((r.nim && user?.username && r.nim === user?.username) || (r.userId && user?.id && r.userId === user?.id) || (r.studentId && user?.id && r.studentId === user?.id)));
    if (!ownReports || ownReports.length === 0) return alert('Tidak ada data laporan untuk diekspor.');

    setExportProgress({
      status: 'loading',
      message: 'Menghubungkan pustaka eksport...',
      detail: 'Mengimpor package exceljs...',
      current: 0,
      total: ownReports.length
    });

    try {
      const sortedReports = [...ownReports].sort((a, b) => {
        const dateA = new Date(a.timestamp || 0);
        const dateB = new Date(b.timestamp || 0);
        return dateA - dateB;
      });

      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Laporan');

      const borderStyle = { style: 'medium', color: { argb: 'FF000000' } };
      const applyRowBorder = (row) => {
        row.eachCell({ includeEmpty: true }, cell => {
          cell.border = {
            top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle
          };
        });
      };

      sheet.columns = [
        { header: 'Tanggal', key: 'tanggal', width: 20 },
        { header: 'Waktu', key: 'waktu', width: 20 },
        { header: 'Judul Dokumen', key: 'judul', width: 40 },
        { header: 'Ringkasan Isi Dokumen', key: 'ringkasan', width: 60 },
        { header: 'Link Dokumen', key: 'link', width: 50 },
      ];

      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      applyRowBorder(headerRow);

      sortedReports.forEach((r, idx) => {
        setExportProgress({
          status: 'loading',
          message: `Memproses laporan ${idx + 1} dari ${sortedReports.length}`,
          detail: `Menulis baris data: ${r.title || ''}...`,
          current: idx + 1,
          total: sortedReports.length
        });

        const ts = new Date(r.timestamp);
        const row = sheet.addRow({
          tanggal: !isNaN(ts.getTime()) ? ts.toLocaleDateString('id-ID') : '',
          waktu: !isNaN(ts.getTime()) ? ts.toLocaleTimeString('id-ID') : '',
          judul: cleanText(r.title || r.judul || ''),
          ringkasan: cleanText(r.overview || r.ringkasan || ''),
          link: r.fileUrl || r.link || ''
        });
        row.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        applyRowBorder(row);
      });

      setExportProgress({
        status: 'loading',
        message: 'Menyusun file Excel...',
        detail: 'Menulis buffer data excel...',
        current: sortedReports.length,
        total: sortedReports.length
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Laporan_${user?.name || 'Export'}.xlsx`);

      setExportProgress({
        status: 'success',
        message: 'Ekspor Laporan Berhasil!',
        detail: 'File laporan .xlsx Anda telah berhasil diunduh ke folder unduhan Anda.',
        current: sortedReports.length,
        total: sortedReports.length
      });

    } catch (err) {
      console.error(err);
      setExportProgress({
        status: 'error',
        message: 'Gagal Mengekspor Laporan',
        detail: err.message || 'Terjadi kesalahan saat memproses ekspor laporan.',
        current: 0,
        total: ownReports.length
      });
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 text-sm h-10"
      >
        <FileSpreadsheet size={16} />
        Ekspor
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => { setSelectedFormat('excel'); setShowDateRangeModal(true); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-2 group border-b border-slate-50"
          >
            <BookOpen size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="font-bold text-slate-700 group-hover:text-blue-700 text-sm">Ekspor Logbook (Excel)</span>
          </button>
          <button
            onClick={() => { setSelectedFormat('word'); setShowDateRangeModal(true); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-2 group border-b border-slate-50"
          >
            <FileText size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <span className="font-bold text-slate-700 group-hover:text-indigo-700 text-sm">Ekspor Logbook (Word)</span>
          </button>
          <button
            onClick={exportLaporan}
            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-2 group"
          >
            <FileText size={16} className="text-slate-400 group-hover:text-cyan-600 transition-colors" />
            <span className="font-bold text-slate-700 group-hover:text-cyan-700 text-sm">Ekspor Laporan</span>
          </button>
        </div>
      )}

      {showDateRangeModal && (
        <ExportDateRangeModal
          logbooks={(logbooks || []).filter(l => Boolean(
            (l.nim && user?.username && l.nim === user?.username) ||
            (l.userId && user?.id && l.userId === user?.id) ||
            (l.nim && user?.nim && l.nim === user?.nim)
          ))}
          onClose={() => setShowDateRangeModal(false)}
          onConfirm={(start, end) => {
            setExportDateRange({ start, end });
            setShowDateRangeModal(false);
            setShowPhotoModal(true);
          }}
        />
      )}

      {showPhotoModal && (
        <ExportPhotoOptionModal
          onClose={() => setShowPhotoModal(false)}
          onConfirm={(opt) => {
            setShowPhotoModal(false);
            if (selectedFormat === 'excel') {
              exportLogbook(opt);
            } else if (selectedFormat === 'word') {
              exportLogbookDocx(opt);
            }
          }}
        />
      )}

      {exportProgress && (
        <ExportProgressModal
          progress={exportProgress}
          onClose={() => setExportProgress(null)}
        />
      )}
    </div>
  );
};
// Fixed Duplicate Function
function StudentOverview({ user, logbooks = [], reports = [], onEditLogbook, onRefresh }) {
  // SAFETY: Ensure props are arrays and remove any null/undefined items
  const safeLogbooks = (Array.isArray(logbooks) ? logbooks : []).filter(l => l && l !== null);
  const safeReports = (Array.isArray(reports) ? reports : []).filter(r => r && r !== null);

  const [currentPage, setCurrentPage] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [viewLogDetail, setViewLogDetail] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 768 ? 3 : 5);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 3 : 5);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const submittedLogbooks = safeLogbooks.length;
  const submittedReports = safeReports.length;

  const handleRefreshClick = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  // SORT LOGBOOKS (Newest First)
  const sortedLogbooks = [...safeLogbooks].sort((a, b) => {
    const dateA = parseDateSafe(a.date, a.time);
    const dateB = parseDateSafe(b.date, b.time);
    return dateB - dateA;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedLogbooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedLogbooks.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getVisiblePageNumbers = () => {
    const maxVisible = itemsPerPage === 5 ? 5 : 3;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Get Last Location from latest logbook
  const lastLogbook = sortedLogbooks.length > 0 ? sortedLogbooks[0] : null;

  // Parse Coordinate string
  let lastLat = null;
  let lastLng = null;
  if (lastLogbook) {
    if (lastLogbook.lat !== undefined && lastLogbook.lng !== undefined) {
      const parsedLat = parseFloat(lastLogbook.lat);
      const parsedLng = parseFloat(lastLogbook.lng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        lastLat = parsedLat;
        lastLng = parsedLng;
      }
    }
  }

  const lastLocation = lastLogbook && lastLat !== null && lastLng !== null
    ? {
      lat: lastLat,
      lng: lastLng,
      address: lastLogbook.address || '',
      name: (user && user.name) ? user.name : 'Anda',
      status: lastLogbook.status || 'Terakhir',
      date: lastLogbook.date || '',
      time: lastLogbook.time || ''
    }
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {previewImage && <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />}
      {viewLogDetail && <TextModal title={viewLogDetail.title} content={viewLogDetail.content} onClose={() => setViewLogDetail(null)} />}

      {/* 1. STATUS & STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title={
          <div className="flex justify-between items-center w-full">
            <span>Statistik Kinerja</span>
            <div className="md:hidden">
              <ExportDropdown logbooks={safeLogbooks} reports={safeReports} user={user} />
            </div>
          </div>
        } className="h-full">
          <div className="grid grid-cols-2 gap-4 h-full items-center">
            <div className="bg-blue-50/50 p-6 rounded-2xl text-center border border-blue-100 hover:shadow-md transition-shadow">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Logbook</div>
              <div className="text-5xl font-black text-blue-600">{submittedLogbooks}</div>
            </div>
            <div className="bg-cyan-50/50 p-6 rounded-2xl text-center border border-cyan-100 hover:shadow-md transition-shadow">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Laporan</div>
              <div className="text-5xl font-black text-cyan-600">{submittedReports}</div>
            </div>
          </div>
        </Card>

        {/* MAP - Desktop Order: 2nd Column */}
        <div className="hidden md:block lg:col-span-2 h-full">
          <Card title="Lokasi Terakhir" className="h-full">
            <ErrorBoundary>
              <div className="h-[250px] w-full bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200">
                {lastLocation && (
                  <LeafletMap
                    readOnly={true}
                    markers={[{ ...lastLocation, popup: "Lokasi Terakhir Anda" }]}
                    lat={lastLocation.lat}
                    lng={lastLocation.lng}
                  />
                )}
                {!lastLocation && (
                  <div className="flex items-center justify-center h-full text-slate-400 italic">
                    Belum ada data lokasi.
                  </div>
                )}
              </div>
            </ErrorBoundary>
          </Card>
        </div>
      </div>

      {/* 2. DAFTAR LOGBOOK (Mobile: Box, Desktop: Table) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Riwayat Logbook</h3>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ExportDropdown logbooks={safeLogbooks} reports={safeReports} user={user} />
            </div>
            {onRefresh && (
              <button
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm transition-all ${isRefreshing ? 'text-slate-400 cursor-not-allowed' : 'text-cyan-600 hover:bg-cyan-50 hover:border-cyan-200'}`}
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Memuat...' : 'Refresh Data'}
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-bold w-16 text-center">No.</th>
                  <th className="p-4 font-bold">Waktu & Tanggal</th>
                  <th className="p-4 font-bold text-center">Foto Selfie</th>
                  <th className="p-4 font-bold max-w-[200px]">Kegiatan</th>
                  <th className="p-4 font-bold max-w-[200px]">Output</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center w-24">Dokumentasi Tambahan</th>
                  <th className="p-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((log, index) => {
                  if (!log) return null;
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-center text-slate-400">
                        <div>{indexOfFirstItem + index + 1}</div>
                        <div className="text-[10px] mt-1 hidden" title="Timestamp Data">{log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID', {day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}) : '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-700">{String(log.date || '-')}</div>
                        <div className="text-xs text-slate-400 font-mono">{String(log.time || '-')}</div>
                      </td>
                      <td className="p-4">
                        <div
                          className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden mx-auto cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all"
                          onClick={() => setPreviewImage(getPhotoUrl(log.selfieUrl))}
                        >
                          {log.selfieUrl ? (
                            <img src={getPhotoUrl(log.selfieUrl)} alt="Selfie" style={{ imageOrientation: 'from-image' }} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20} /></div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="line-clamp-2 prose prose-sm max-w-none mb-1 [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-4 [&_ul]:pl-4" dangerouslySetInnerHTML={{ __html: log.activity || '' }} />
                        <button onClick={() => setViewLogDetail({ title: "Detail Kegiatan", content: log.activity || 'Tidak ada konten' })} className="text-xs text-cyan-600 font-bold hover:underline flex items-center gap-1">
                          <Eye size={12} /> Lihat Rincian
                        </button>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="line-clamp-2 prose prose-sm max-w-none mb-1 [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-4 [&_ul]:pl-4" dangerouslySetInnerHTML={{ __html: log.output || '' }} />
                        <button onClick={() => setViewLogDetail({ title: "Detail Output", content: log.output || 'Tidak ada konten' })} className="text-xs text-cyan-600 font-bold hover:underline flex items-center gap-1">
                          <Eye size={12} /> Lihat Rincian
                        </button>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${log.status === 'Hadir' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {log.status || '-'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {log.docUrl ? (
                          <div
                            className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden mx-auto cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all"
                            onClick={() => setPreviewImage(getPhotoUrl(log.docUrl))}
                            title="Lihat Dokumentasi"
                          >
                            <img src={getPhotoUrl(log.docUrl)} alt="Doc" style={{ imageOrientation: 'from-image' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span class="text-[10px] text-slate-400 flex items-center justify-center h-full">File</span>'; }} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onEditLogbook(log)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="Edit Logbook"
                        >
                          <Edit3 size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {currentItems.length === 0 && (
                  <tr><td colSpan="8" className="p-8 text-center text-slate-400 italic">Belum ada data logbook.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Box View */}
        <div className="md:hidden space-y-4">
          {currentItems.map((log, index) => {
            if (!log) return null;
            return (
              <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 cursor-pointer"
                      onClick={() => setPreviewImage(getPhotoUrl(log.selfieUrl))}
                    >
                      {log.selfieUrl ? (
                        <img src={getPhotoUrl(log.selfieUrl)} alt="Selfie" style={{ imageOrientation: 'from-image' }} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-300"><User size={16} /></div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-700 text-sm">{String(log.date || '-')}</div>
                      <div className="text-xs text-slate-400 font-mono">{String(log.time || '-')}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${log.status === 'Hadir' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {log.status || '-'}
                  </span>
                </div>

                <div className="text-sm text-slate-600 border-l-2 border-slate-100 pl-3">
                  <div className="font-semibold text-xs text-slate-400 uppercase mb-1">Kegiatan</div>
                  <div className="line-clamp-3 prose prose-sm max-w-none [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-4 [&_ul]:pl-4 mb-2" dangerouslySetInnerHTML={{ __html: log.activity || '' }} />
                  <button onClick={() => setViewLogDetail({ title: "Detail Kegiatan", content: log.activity || 'Tidak ada konten' })} className="text-xs text-cyan-600 font-bold hover:underline flex items-center gap-1">
                    <Eye size={12} /> Lihat Rincian
                  </button>
                </div>

                <div className="text-sm text-slate-600 border-l-2 border-slate-100 pl-3">
                  <div className="font-semibold text-xs text-slate-400 uppercase mb-1">Output</div>
                  <div className="line-clamp-3 prose prose-sm max-w-none [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-4 [&_ul]:pl-4 mb-2" dangerouslySetInnerHTML={{ __html: log.output || '' }} />
                  <button onClick={() => setViewLogDetail({ title: "Detail Output", content: log.output || 'Tidak ada konten' })} className="text-xs text-cyan-600 font-bold hover:underline flex items-center gap-1">
                    <Eye size={12} /> Lihat Rincian
                  </button>
                </div>

                {log.docUrl && (
                  <div className="text-sm text-slate-600 border-l-2 border-slate-100 pl-3">
                    <div className="font-semibold text-xs text-slate-400 uppercase mb-2">Dokumentasi Tambahan</div>
                    <div
                      className="w-full h-32 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 cursor-pointer relative group"
                      onClick={() => setPreviewImage(getPhotoUrl(log.docUrl))}
                    >
                      <img src={getPhotoUrl(log.docUrl)} alt="Dokumentasi" style={{ imageOrientation: 'from-image' }} className="w-full h-full object-cover transition-transform group-hover:scale-105" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span class="text-xs text-slate-400 absolute inset-0 flex items-center justify-center">Bukan Gambar / Gagal Load</span>'; }} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={24} />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onEditLogbook(log)}
                  className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit3 size={16} /> Edit Logbook
                </button>
              </div>
            );
          })}
          {currentItems.length === 0 && (
            <div className="p-8 text-center text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">Belum ada logbook.</div>
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <div className="flex gap-1 flex-wrap">
              {getVisiblePageNumbers().map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${currentPage === number ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {number}
                </button>
              ))}
            </div>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>
        )}
      </div>

      {/* 3. DAFTAR LAPORAN */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Riwayat Laporan</h3>
        <div className="space-y-3">
          {safeReports.map((rep, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="font-bold text-slate-700">{rep.title}</div>
              <div className="text-sm text-slate-500 mt-1 line-clamp-2">{rep.overview}</div>
              <div className="mt-2 text-xs text-slate-400 font-mono">{rep.timestamp ? new Date(rep.timestamp).toLocaleDateString() : '-'}</div>
            </div>
          ))}
          {safeReports.length === 0 && (
            <div className="p-8 text-center text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">Belum ada laporan.</div>
          )}
        </div>
      </div>

      {/* MAP - Mobile Order: Last */}
      <div className="md:hidden">
        <Card title="Lokasi Terakhir">
          <div className="h-64 bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200">
            <LeafletMap readOnly={true} markers={lastLocation ? [{ ...lastLocation, popup: "Lokasi Terakhir Anda" }] : []} />
          </div>
        </Card>
      </div>

    </div>
  );
}

function LogbookEditModal({ isOpen, onClose, logbook, onUpdate, onDelete, showToast }) {
  if (!isOpen || !logbook) return null;

  const [activity, setActivity] = useState(logbook.activity || '');
  const [output, setOutput] = useState(logbook.output || '');
  const [date, setDate] = useState(logbook.date || new Date().toLocaleDateString('en-CA'));
  const [time, setTime] = useState(logbook.time || '');
  const [status, setStatus] = useState(logbook.status || 'Hadir');

  // Location
  const [updateLocation, setUpdateLocation] = useState(false);
  const [lat, setLat] = useState(logbook.lat);
  const [lng, setLng] = useState(logbook.lng);
  const [address, setAddress] = useState(logbook.address || '');
  const [accuracy, setAccuracy] = useState(logbook.accuracy);
  const [locLoading, setLocLoading] = useState(false);

  // Files
  const [selfie, setSelfie] = useState(null); // Base64
  const [doc, setDoc] = useState(null); // File object
  const [previewSelfie, setPreviewSelfie] = useState(logbook.selfieUrl);
  const [docMode, setDocMode] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [locationAlert, setLocationAlert] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setActivity(logbook.activity || '');
    setOutput(logbook.output || '');
    setDate(logbook.date || new Date().toLocaleDateString('en-CA'));
    setTime(logbook.time || '');
    setStatus(logbook.status || 'Hadir');
    setLat(logbook.lat);
    setLng(logbook.lng);
    setAddress(logbook.address || '');
    setAccuracy(logbook.accuracy);
    setUpdateLocation(false);
    setSelfie(null);
    setDoc(null);
    setPreviewSelfie(logbook.selfieUrl);
  }, [logbook]);

  const getLocation = () => {
    if (!navigator.geolocation) return showToast('error', 'Error', 'Browser tidak mendukung GPS');
    setLocLoading(true);
    setUpdateLocation(true);
    setAddress("Memperbarui lokasi...");

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;

      if (accuracy > 5000) {
        setLocLoading(false);
        setUpdateLocation(false);
        showToast('error', 'Sinyal GPS Lemah', `Lokasi tidak akurat (±${Math.round(accuracy)}m) karena menggunakan jaringan tidak stabil. Coba lagi!`);
        return;
      }

      setLat(latitude);
      setLng(longitude);
      setAccuracy(accuracy);

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
      } catch {
        setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
      setLocLoading(false);
      showToast('success', 'Lokasi Update', `Akurasi: ±${Math.round(accuracy)}m`);
    }, (err) => {
      setLocLoading(false);

      let msg = err.message;
      if (err.code === 1) {
        msg = "Izin lokasi ditolak!";
        setLocationAlert("PENTING: Izin lokasi Anda ditolak!<br/><br/>Untuk memperbarui lokasi, mohon berikan izin lokasi di pengaturan browser/perangkat Anda, lalu coba lagi.");
      } else if (err.code === 3 || err.message.includes("Timeout")) {
        msg = "Timeout! Sinyal GPS lemah.";
      }

      showToast('error', 'Gagal GPS', msg);
      setUpdateLocation(false);
      // Revert to old location if failed? 
      // Better to keep user aware that update failed.
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  };

  const startCamera = async () => { setCameraActive(true); try { const stream = await navigator.mediaDevices.getUserMedia({ video: true }); if (videoRef.current) videoRef.current.srcObject = stream; } catch { showToast('error', 'Kamera Error', 'Akses kamera ditolak'); setCameraActive(false); } };
  const takePhoto = () => { const video = videoRef.current; const canvas = canvasRef.current; if (video && canvas) { canvas.width = video.videoWidth; canvas.height = video.videoHeight; canvas.getContext('2d').drawImage(video, 0, 0); const dataUrl = canvas.toDataURL('image/png'); setSelfie(dataUrl); setPreviewSelfie(dataUrl); video.srcObject.getTracks().forEach(t => t.stop()); setCameraActive(false); } };

  const handleSubmit = async () => {
    const cleanActivity = activity.replace(/<[^>]*>/g, '').trim();
    const cleanOutput = output.replace(/<[^>]*>/g, '').trim();

    if (cleanActivity.length === 0 || cleanOutput.length === 0) {
      showToast('warning', 'Data Kosong', 'Kegiatan dan Output wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    showToast('info', 'Menyimpan...', 'Sedang memperbarui logbook...');

    try {
      const editData = {
        username: logbook.nim, 
        timestamp: logbook.timestamp,
        originalDate: logbook.date, // Add original date for robust matching
        originalTime: logbook.time, // Add original time for robust matching
        link_folder: "", 
        logEntry: {
          date, time, status, activity, output,
          updateLocation, lat, lng, address, accuracy,
          selfieBase64: selfie,
          docBase64: doc ? await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r(reader.result); reader.readAsDataURL(doc); }) : null
        }
      };

      await onUpdate(editData);
      setIsSubmitting(false);
    } catch (e) {
      setIsSubmitting(false);
      showToast('error', 'Gagal', e.message);
    }
  };

  const handleDelete = () => {
    // Show parent's confirmation dialog
    const deleteData = {
      username: logbook.nim,
      originalDate: logbook.date,
      originalTime: logbook.time
    };
    onDelete(deleteData);
  };

  return (
    <>
      {locationAlert && <AlertModal title="Peringatan Lokasi" content={locationAlert} onClose={() => setLocationAlert(null)} />}
      <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Edit3 size={20} /> Edit Logbook</h3>
            <button onClick={onClose} disabled={isSubmitting} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <div className="overflow-y-auto p-6 space-y-6">
            {/* Location Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">Lokasi (Lat, Lng)</label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <div className="font-mono text-xs bg-white p-2 border rounded mb-1">{lat}, {lng}</div>
                  <div className="text-sm text-slate-600">{address}</div>
                </div>
                <Button onClick={getLocation} disabled={locLoading || isSubmitting} variant="secondary" className="whitespace-nowrap flex items-center gap-2">
                  <MapPin size={16} /> {locLoading ? 'Mencari...' : 'Perbarui Lokasi'}
                </Button>
              </div>
              {updateLocation && <p className="text-xs text-amber-600 mt-2 font-bold">* Lokasi akan diperbarui ke posisi saat ini.</p>}
            </div>

            {/* Date/Time/Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-xl relative z-40">
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Tanggal</label>
                <CustomDatePicker value={date} onChange={setDate} />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl relative z-30">
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Jam</label>
                <CustomTimePicker value={time || '00:00'} onChange={setTime} />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl relative z-20">
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Status</label>
                <CustomStatusSelect value={status} onChange={setStatus} />
              </div>
            </div>

            {/* Activity & Output */}
            <div className="space-y-4">
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Kegiatan</label><RichEditor value={activity} onChange={setActivity} disabled={isSubmitting} /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Output</label><RichEditor value={output} onChange={setOutput} disabled={isSubmitting} /></div>
            </div>

            {/* Selfie & Doc */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-xl p-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Foto Selfie</label>
                {previewSelfie ? (
                  <div className="relative group">
                    <img src={previewSelfie} className="w-full h-48 object-cover rounded-lg" alt="Selfie" />
                    <button onClick={() => { setSelfie(null); setPreviewSelfie(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" disabled={isSubmitting}><X size={14} /></button>
                  </div>
                ) : cameraActive ? (
                  <div className="space-y-2">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-lg object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    <Button onClick={takePhoto} className="w-full text-xs">Ambil Foto</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={startCamera} variant="secondary" className="flex-1 text-xs" disabled={isSubmitting}>Kamera</Button>
                    <label className="flex-1 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl flex items-center justify-center text-xs transition-colors p-2">
                      Upload
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => { setSelfie(ev.target.result); setPreviewSelfie(ev.target.result); };
                          reader.readAsDataURL(file);
                        }
                      }} disabled={isSubmitting} />
                    </label>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl p-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Dokumen (Opsional)</label>
                {doc ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                    <span className="text-sm truncate font-bold">{doc.name}</span>
                    <button onClick={() => setDoc(null)} className="text-red-500 hover:bg-red-50 p-1 rounded" disabled={isSubmitting}><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex gap-2 h-full items-end pb-1">
                    <label className="w-full cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl flex items-center justify-center text-xs transition-colors p-3 border-2 border-dashed border-slate-300">
                      <Upload size={16} className="mr-2" /> Pilih Dokumen Baru
                      <input type="file" className="hidden" onChange={(e) => setDoc(e.target.files[0])} disabled={isSubmitting} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-between gap-3">
            <Button variant="danger" onClick={handleDelete} disabled={isSubmitting} className="flex items-center gap-2">
              <Trash2 size={16} />Hapus
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Batal</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StudentLogbookForm({ user, logbooks, setLogbooks, showToast }) {
  const [lat, setLat] = useState(null); const [lng, setLng] = useState(null); const [address, setAddress] = useState('Menunggu GPS...'); const [accuracy, setAccuracy] = useState(null);

  const [status, setStatus] = useState('Hadir');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));

  const [activityHTML, setActivityHTML] = useState(''); const [outputHTML, setOutputHTML] = useState('');
  const [selfie, setSelfie] = useState(null);
  const [doc, setDoc] = useState(null);
  const [docMode, setDocMode] = useState(null);
  const [cameraActive, setCameraActive] = useState(false); const videoRef = useRef(null); const canvasRef = useRef(null);
  const [docCameraActive, setDocCameraActive] = useState(false); const docVideoRef = useRef(null); const docCanvasRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);
  const lastGeoUpdateRef = useRef(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [locationType, setLocationType] = useState('manual'); // 'manual' | 'automatic'
  const [locationAlert, setLocationAlert] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setAddress("Browser ini tidak mendukung GPS.");
      return;
    }

    const successHandler = async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;

      if (accuracy > 1500) {
        errorHandler({ code: 3, message: `Timeout! GPS tidak akurat (±${Math.round(accuracy)}m).` });
        return;
      }

      // LOGIC LOCK: Jika address sudah terisi valid (bukan Menunggu/Gagal/Memuat), JANGAN update lagi otomatis.
      // Kecuali user menekan tombol Refresh (yang akan mereset address ke "Memperbarui lokasi..." dulu)
      if (address && !address.startsWith("Menunggu") && !address.startsWith("Gagal") && !address.startsWith("Memuat") && !address.startsWith("Browser")) {
        return;
      }

      setLat(latitude);
      setLng(longitude);
      setAccuracy(accuracy);
      setLocationType('automatic'); // Ensure status is automatic when GPS works
      setShowManualInput(false); // Hide manual input if GPS works

      // Throttle Reverse Geocoding - Jika belum ada alamat yg valid, kita coba fetch
      const now = Date.now();
      if (now - lastGeoUpdateRef.current > 5000 || address === 'Menunggu GPS...' || address === 'Memperbarui lokasi...') {
        lastGeoUpdateRef.current = now;
        if (address !== "Memperbarui lokasi...") setAddress("Memuat Alamat Lengkap...");

        try {
          // Tambah addressdetails=1 untuk dapat rincian
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
          const data = await res.json();

          if (data && data.address) {
            const a = data.address;
            // Format: Jalan, Desa/Kelurahan, Kecamatan, Kab/Kota, Provinsi, Kode Pos
            // Ambil komponen yang ada saja
            const road = a.road || a.street || '';
            const village = a.village || a.suburb || a.hamlet || ''; // Desa/Kelurahan
            const district = a.town || a.city_district || a.district || ''; // Kecamatan (kadang mappingnya beda2)
            const city = a.city || a.regency || a.county || ''; // Kab/Kota
            const state = a.state || '';
            const postcode = a.postcode || '';

            const components = [road, village, district, city, state, postcode].filter(c => c && c.trim() !== '');
            const fullAddress = components.join(', ');

            setAddress(fullAddress || data.display_name);
          } else if (data && data.display_name) {
            setAddress(data.display_name);
          }
        } catch (e) {
          // Silent fail, keep coords
          if (!address || address.startsWith("Menunggu") || address.startsWith("Memuat")) {
            setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        }
      }
    };

    const errorHandler = (err) => {
      console.warn("GPS Watch Error:", err);
      // Jangan timpa address yang sudah valid dengan error transient
      if (address && !address.startsWith("Menunggu") && !address.startsWith("Gagal") && !address.startsWith("Memuat")) return;

      let msg = "Gagal mengambil lokasi.";
      if (err.code === 1) {
        msg = "Izin lokasi ditolak. Mohon aktifkan izin lokasi di browser.";
        setLocationAlert("PENTING: Izin lokasi ditolak!<br/><br/>Fitur absensi mewajibkan deteksi lokasi yang akurat.<br/>Mohon ubah pengaturan browser/perangkat Anda untuk MENGIZINKAN lokasi (Allow/Grant), lalu refresh halaman ini.");
      }
      else if (err.code === 2) msg = "Sinyal GPS tidak tersedia.";
      else if (err.code === 3) msg = "Waktu permintaan GPS habis (Timeout).";

      setAddress(msg);
    };

    // Primary Watch
    const watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [address]); // Add address dependency so we can check its state in effect

  const getLocation = () => {
    if (!navigator.geolocation) return showToast('error', 'Error', 'Browser tidak mendukung GPS');

    showToast('info', 'Mencari Lokasi...', 'Sedang memaksa update posisi GPS (Bisa memakan waktu hingga 30 detik)...');
    // Reset address ke status loading agar watch/getCurrentPosition bisa update lagi
    setAddress("Memperbarui lokasi...");
    setLat(null); // Reset coords visual
    setShowManualInput(false); // Hide manual input during search

    const success = async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;

      if (accuracy > 2500) {
        error({ code: 3, message: `Timeout! GPS tidak akurat (±${Math.round(accuracy)}m).` });
        return;
      }

      setLat(latitude);
      setLng(longitude);
      setAccuracy(accuracy);
      setShowManualInput(false); // Hide on success
      setLocationType('automatic'); // Set as automatic

      // ROBUST ADDRESS FETCHING WITH RETRY (3 ATTEMPTS)
      let fetchSuccess = false;
      let attempt = 0;
      while (!fetchSuccess && attempt < 3) {
        attempt++;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
          if (!res.ok) throw new Error("Network response was not ok");

          const data = await res.json();
          if (data && (data.address || data.display_name)) {
            if (data.address) {
              const a = data.address;
              const road = a.road || a.street || '';
              const village = a.village || a.suburb || a.hamlet || '';
              const district = a.town || a.city_district || a.district || '';
              const city = a.city || a.regency || a.county || '';
              const state = a.state || '';
              const postcode = a.postcode || '';

              const components = [road, village, district, city, state, postcode].filter(c => c && c.trim() !== '');
              const fullAddress = components.join(', ');
              setAddress(fullAddress || data.display_name);
            } else {
              setAddress(data.display_name);
            }
            fetchSuccess = true;
          }
        } catch (err) {
          console.warn(`Address fetch attempt ${attempt} failed:`, err);
          if (attempt < 3) await new Promise(res => setTimeout(res, 1000)); // Wait before retry
        }
      }

      if (!fetchSuccess) {
        setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        showToast('warning', 'Alamat Tidak Ditemukan', 'Gagal mengambil nama jalan, hanya koordinat yang tersimpan.');
      } else {
        showToast('success', 'Lokasi Terkini', `Akurasi: ±${Math.round(accuracy)}m`);
      }
    };

    const error = (err) => {
      // TIDAK ADA FALLBACK KE LOW ACCURACY. PAKSA HIGH ACCURACY.
      let msg = err.message;
      if (err.code === 1) {
        msg = "Izin lokasi ditolak!";
        setLocationAlert("PENTING: Akses lokasi ditolak!<br/><br/>Untuk melakukan absensi, Anda WAJIB memberikan izin lokasi secara akurat.<br/><br/><strong>Cara memperbaiki:</strong><ul><li><strong>iPhone/iPad:</strong> Buka Settings &gt; Privacy &amp; Security &gt; Location Services &gt; Safari/Chrome &gt; Pilih 'While Using the App' &amp; aktifkan 'Precise Location'.</li><li><strong>Android:</strong> Masuk ke Settings &gt; Apps &gt; Chrome/Browser &gt; Permissions &gt; Location &gt; Pilih 'Allow only while using the app' &amp; aktifkan 'Use precise location'.</li><li><strong>Laptop/PC:</strong> Klik ikon gembok di URL bar &gt; Ubah izin Lokasi menjadi 'Allow'.</li></ul>Setelah mengubah izin, silakan <strong>REFRESH</strong> halaman ini.");
      }
      else if (err.code === 2) {
        msg = "GPS mati / tidak tersedia. Pastikan GPS menyala.";
      }
      else if (err.code === 3 || err.message.includes("Timeout")) {
        msg = "Timeout! Sinyal GPS sangat lemah. Mohon pindah ke area terbuka.";
        setShowManualInput(true); // Show on failure
        setLocationType('manual'); // Fallback to manual
      } else {
        setShowManualInput(false);
      }

      showToast('error', 'Gagal', msg);
      if (err.code !== 3 && !err.message.includes("Timeout")) setAddress("Gagal: " + msg);
      else setAddress(""); // Kosongkan agar user sadar harus isi
    };

    // Try High Accuracy (Strict GPS)
    navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 });
  };

  const startCamera = async (mode = 'user') => {
    setCameraActive(true);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      showToast('error', 'Kamera Error', 'Akses kamera ditolak/gagal');
      setCameraActive(false);
    }
  };
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      let width = video.videoWidth;
      let height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isPortrait = window.innerHeight > window.innerWidth;
      const videoIsLandscape = width > height;

      if (isMobile && isPortrait && videoIsLandscape) {
        // Fix for Android/Mobile devices that don't rotate the raw video stream automatically
        canvas.width = height;
        canvas.height = width;
        ctx.translate(height / 2, width / 2);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(video, -width / 2, -height / 2, width, height);
      } else {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, width, height);
      }

      setSelfie(canvas.toDataURL('image/jpeg', 0.8));
      video.srcObject.getTracks().forEach(t => t.stop());
      setCameraActive(false);
      showToast('success', 'Foto Tersimpan', 'Foto selfie berhasil diambil.');
    }
  };

  const startDocCamera = async (mode = 'environment') => {
    setDocCameraActive(true);
    try {
      if (docVideoRef.current && docVideoRef.current.srcObject) {
        const tracks = docVideoRef.current.srcObject.getTracks();
        tracks.forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      if (docVideoRef.current) docVideoRef.current.srcObject = stream;
    } catch {
      showToast('error', 'Kamera Error', 'Gagal akses kamera');
      setDocCameraActive(false);
    }
  };
  const takeDocPhoto = () => {
    const video = docVideoRef.current;
    const canvas = docCanvasRef.current;
    if (video && canvas) {
      let width = video.videoWidth;
      let height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isPortrait = window.innerHeight > window.innerWidth;
      const videoIsLandscape = width > height;

      if (isMobile && isPortrait && videoIsLandscape) {
        canvas.width = height;
        canvas.height = width;
        ctx.translate(height / 2, width / 2);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(video, -width / 2, -height / 2, width, height);
      } else {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, width, height);
      }

      const fileData = canvas.toDataURL('image/jpeg');
      fetch(fileData).then(res => res.blob()).then(blob => {
        const file = new File([blob], "doc_camera.jpg", { type: "image/jpeg" });
        setDoc(file);
        showToast('success', 'Dokumen Tersimpan', 'Foto dokumen berhasil diambil.');
      });
      video.srcObject.getTracks().forEach(t => t.stop());
      setDocCameraActive(false);
      setDocMode(null);
    }
  };

  const formatHTMLToDBString = (htmlString) => {
    if (!htmlString) return '';
    return htmlString
      .replace(/<div><br><\/div>/gi, ' ### ')
      .replace(/<div>/gi, ' ### ')
      .replace(/<\/div>/gi, '')
      .replace(/<p><br><\/p>/gi, ' ### ')
      .replace(/<p>/gi, ' ### ')
      .replace(/<\/p>/gi, '')
      .replace(/<br\s*[\/]?>/gi, ' ### ')
      .replace(/( ### )+/g, ' ### ')
      .replace(/^ ### | ### $/g, '')
      .trim();
  };

  const handleSubmit = async () => {
    // Strip HTML to check real content length
    const cleanActivity = activityHTML.replace(/<[^>]*>/g, '').trim();
    const cleanOutput = outputHTML.replace(/<[^>]*>/g, '').trim();

    // Prevent Double Submission
    if (isSubmittingRef.current) return;

    // Validation: Require Selfie, Activity, Output.
    // Address must be valid (not Loading/Error message).
    // Lat/Lng is optional if Address is provided manually.
    const isAddressValid = address && !address.startsWith("Menunggu") && !address.startsWith("Gagal") && !address.startsWith("Browser") && !address.startsWith("Memuat");

    if (!isAddressValid || !selfie || cleanActivity.length === 0 || cleanOutput.length === 0) {
      showToast('warning', 'Data Belum Lengkap', 'Mohon lengkapi: Lokasi (Manual/GPS), Selfie, Kegiatan, dan Output.');
      return;
    }

    showToast('info', 'Mengirim Data...', 'Mohon tunggu sebentar.');
    setIsSubmitting(true);
    isSubmittingRef.current = true;

    try {
      const newLog = {
        id: Date.now(),
        studentId: user.id,
        name: user.name,
        className: user.class, // Add class
        nim: user.username,
        date: date,
        time: time,
        status,
        lat,
        lng,
        accuracy,
        address,
        locationType, // Send location type
        activity: activityHTML,
        output: outputHTML,
        selfieBase64: selfie, // Kirim base64
        docBase64: doc ? await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r(reader.result); reader.readAsDataURL(doc); }) : null
      };

      const result = await callAPI('submitLogbook', {
        username: user.username,
        fullname: user.name, // Add Full Name
        className: user.class, // Add Class
        link_spreadsheet: user.link_spreadsheet,
        link_folder: user.link_folder,
        logEntry: newLog
      });

      // Update local state for immediate feedback using the URLs returned from backend
      const savedLog = { ...newLog, selfieUrl: result.selfieUrl, docUrl: result.docUrl, selfieBase64: null, docBase64: null };
      setLogbooks([...logbooks, savedLog]);

      showToast('success', 'Berhasil Dikirim', 'Logbook harian Anda berhasil disimpan!');

      setActivityHTML('');
      setOutputHTML('');
      setSelfie(null);
      setDoc(null);
      setDocMode(null);
    } catch (err) {
      showToast('error', 'Gagal Mengirim', err.message);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleDocClick = () => {
    if (doc && doc.type.startsWith('image/')) {
      setPreviewImage(URL.createObjectURL(doc));
    } else if (doc) {
      showToast('info', 'Format File', 'Dokumen yang diunggah bukan format gambar.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {locationAlert && <AlertModal title="Peringatan Lokasi" content={locationAlert} onClose={() => setLocationAlert(null)} />}
      {previewImage && <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />}
      <Card title="Formulir Logbook Harian">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="bg-slate-50 p-1 rounded-2xl border border-slate-200 flex flex-col">
                <div className="bg-white rounded-xl overflow-hidden h-[250px] relative z-0 w-full"><LeafletMap lat={lat} lng={lng} setLat={setLat} setLng={setLng} setAddress={setAddress} /></div>
                <Button onClick={getLocation} variant="secondary" className="w-full mt-2 py-3 border-cyan-200 text-cyan-700 hover:bg-cyan-50 font-bold shadow-sm">↻ Refresh Lokasi</Button>
                <div className="p-4"><div className="flex items-start gap-3"><MapPin className="text-cyan-600 mt-1 shrink-0" size={20} /><div><p className="font-bold text-slate-700 text-sm leading-snug">{address}</p><p className="text-xs text-slate-500 mt-1 font-mono">{lat ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : "Mencari kordinat..."}</p>{accuracy && <p className="text-[10px] text-green-600">Akurasi GPS: ±{Math.round(accuracy)} meter</p>}</div></div></div>
              </div>

              {/* Manual Location Input (For Fallback) */}
              {showManualInput && (
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><MapPin size={16} className="text-amber-500" /> Input Manual (Wajib karena Sinyal Lemah)</label>
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase mb-1 block">Alamat Lengkap (Wajib)</span>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => { setAddress(e.target.value); setLocationType('manual'); }}
                      placeholder="Nama Jalan / Detail Lokasi..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-400 outline-none transition-shadow"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase mb-1 block">Latitude (Opsional)</span>
                      <input
                        type="number"
                        value={lat || ''}
                        onChange={(e) => setLat(parseFloat(e.target.value))}
                        placeholder="-6.xxxxx"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-400 outline-none transition-shadow font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase mb-1 block">Longitude (Opsional)</span>
                      <input
                        type="number"
                        value={lng || ''}
                        onChange={(e) => setLng(parseFloat(e.target.value))}
                        placeholder="106.xxxxx"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-400 outline-none transition-shadow font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-600 font-medium">* Data ini akan dikirim ke "Alamat Lengkap" dan "Titik Koordinat".</p>
                </div>
              )}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center flex flex-col justify-center h-full">
              <h4 className="font-bold text-slate-700 mb-4 flex items-center justify-center gap-2"><Camera size={18} /> Foto Selfie (Wajib)</h4>
              {selfie ? (
                <div className="relative inline-block group cursor-pointer" onClick={() => setPreviewImage(selfie)}>
                  <img src={selfie} className="w-full max-h-64 object-cover rounded-xl shadow-md mx-auto hover:opacity-90 transition-opacity" alt="Selfie" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white font-bold"><Eye size={24} className="mr-2" /> Lihat Full</div>
                  <button onClick={(e) => { e.stopPropagation(); setSelfie(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow hover:bg-red-600 transition"><X size={14} /></button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Camera Box */}
                  <div className="w-full aspect-[4/3] md:min-h-[260px] bg-slate-100 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-inner mt-2 mb-4">
                    {cameraActive ? (
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                        <Camera size={48} className="mb-2" />
                        <span className="text-xs">Preview Kamera</span>
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {/* Buttons Below Camera Box */}
                  <div className="grid grid-cols-2 gap-2">
                    {cameraActive ? (
                      <>
                        <Button onClick={takePhoto} className="col-span-2 py-3 text-lg font-bold shadow-lg shadow-cyan-500/30">Ambil Foto</Button>
                        <Button onClick={() => startCamera('user')} variant="secondary" className="text-xs">Kamera Depan</Button>
                        <Button onClick={() => startCamera('environment')} variant="secondary" className="text-xs">Kamera Belakang</Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => startCamera('user')} variant="secondary" className="text-xs py-3">Kamera Depan</Button>
                        <Button onClick={() => startCamera('environment')} variant="secondary" className="text-xs py-3">Kamera Belakang</Button>
                        <label className="col-span-2 cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center text-xs transition-colors p-3 border border-slate-200">
                          Upload Foto
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => { setSelfie(ev.target.result); setPreviewSelfie(ev.target.result); };
                              reader.readAsDataURL(file);
                            }
                          }} disabled={isSubmitting} />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative z-40">
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Tanggal</label>
              <CustomDatePicker value={date} onChange={setDate} />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative z-30">
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Jam</label>
              <CustomTimePicker value={time} onChange={setTime} />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative z-20">
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Status</label>
              <CustomStatusSelect value={status} onChange={setStatus} />
            </div>
          </div>

          <div className="relative z-10"><label className="block text-sm font-bold text-slate-700 mb-2">Kegiatan yang Dilakukan</label><RichEditor value={activityHTML} onChange={setActivityHTML} placeholder="Ketik di sini... (Bisa ditebalkan, miring, garis bawah, dan poin angka)" disabled={isSubmitting} /></div>
          <div className="relative z-10"><label className="block text-sm font-bold text-slate-700 mb-2">Output yang Dihasilkan</label><RichEditor value={outputHTML} onChange={setOutputHTML} placeholder="Hasil kerja yang dicapai..." disabled={isSubmitting} /></div>
          <div className="relative z-10"><label className="block text-sm font-bold text-slate-700 mb-2">Dokumentasi Tambahan</label>
            {doc ? (
              <div
                className="flex items-center gap-3 p-4 border border-green-200 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors"
                onClick={handleDocClick}
              >
                <div className="p-2 bg-white rounded-lg shadow-sm"><CheckCircle className="text-green-500" size={24} /></div>
                <div className="flex-1">
                  <p className="font-bold text-green-700 text-sm">Dokumen Terlampir (Klik untuk lihat)</p>
                  <p className="text-xs text-green-600 truncate">{doc.name}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setDoc(null); }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><X size={20} /></button>
              </div>
            ) : !docMode ? (
              <button onClick={() => setDocMode('selecting')} className="w-full py-6 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-3 text-slate-500 hover:bg-slate-50 hover:border-cyan-400 hover:text-cyan-600 transition-all"><Upload size={20} /><span className="font-medium">Tambah Dokumentasi (Foto/File)</span></button>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-4"><h5 className="font-bold text-slate-700">Pilih Metode Upload</h5><button onClick={() => { setDocMode(null); setDocCameraActive(false); }} className="text-slate-400 hover:text-red-500"><X size={18} /></button></div>
                {docMode === 'selecting' && (
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setDocMode('camera')} className="flex flex-col items-center gap-2 p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:ring-2 hover:ring-cyan-400 transition-all"><div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><Camera size={24} /></div><span className="font-bold text-slate-700 text-sm">Buka Kamera</span></button>
                    <label className="flex flex-col items-center gap-2 p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:ring-2 hover:ring-cyan-400 transition-all cursor-pointer"><div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center"><ImageIcon size={24} /></div><span className="font-bold text-slate-700 text-sm">Pilih Galeri/File</span><input type="file" className="hidden" accept="image/*" onChange={(e) => { setDoc(e.target.files[0]); setDocMode(null); }} /></label>
                  </div>
                )}
                {docMode === 'camera' && (
                  <div className="space-y-4">
                    <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center">
                      {docCameraActive ? (
                        <video ref={docVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-slate-400 flex flex-col items-center"><Camera size={48} /><span className="text-xs">Preview Kamera</span></div>
                      )}
                      <canvas ref={docCanvasRef} className="hidden" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {docCameraActive ? (
                        <>
                          <Button onClick={takeDocPhoto} className="col-span-2 py-3 text-lg font-bold shadow-lg shadow-cyan-500/30">Ambil Foto</Button>
                          <Button onClick={() => startDocCamera('environment')} variant="secondary" className="text-xs">Kamera Belakang</Button>
                          <Button onClick={() => startDocCamera('user')} variant="secondary" className="text-xs">Kamera Depan</Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={() => startDocCamera('environment')} variant="secondary" className="text-xs py-3">Kamera Belakang</Button>
                          <Button onClick={() => startDocCamera('user')} variant="secondary" className="text-xs py-3">Kamera Depan</Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 text-lg mt-4 shadow-xl shadow-cyan-500/20 relative z-10">
            {isSubmitting ? 'Mengirim...' : 'Kirim Logbook'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function StudentReportForm({ user, reports, setReports, showToast }) {
  const [title, setTitle] = useState(''); const [file, setFile] = useState(null); const [overview, setOverview] = useState(''); const [isGenerating, setIsGenerating] = useState(false);

  const handleAI = () => {
    if (!file) return showToast('warning', 'Peringatan', 'Pilih file laporan terlebih dahulu!');
    setIsGenerating(true);
    setTimeout(() => {
      setOverview(`[AI Summary]\nBerdasarkan dokumen ${file.name}, laporan ini menunjukkan kemajuan signifikan.`);
      setIsGenerating(false);
      showToast('success', 'AI Selesai', 'Ringkasan laporan berhasil dibuat.');
    }, 2000);
  };

  const submit = async () => {
    if (!title || !file) return showToast('error', 'Gagal Dikirim', 'Lengkapi judul dan dokumen laporan!');

    showToast('info', 'Mengirim Laporan...', 'Sedang mengupload dokumen...');

    try {
      const fileBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const reportData = {
        title,
        overview,
        fileName: file.name,
        fileBase64
      };

      const result = await callAPI('submitReport', {
        username: user.username,
        link_spreadsheet: user.link_spreadsheet,
        link_folder: user.link_folder,
        reportData
      });

      setReports([...reports, {
        id: Date.now(),
        studentId: user.id,
        name: user.name,
        title,
        overview,
        fileUrl: result.reportFileUrl,
        submittedAt: new Date().toISOString().split('T')[0],
        graded: false
      }]);

      showToast('success', 'Laporan Terkirim', 'Laporan Anda berhasil dikirim ke Spreadsheet Dosen.');
      setTitle(''); setFile(null); setOverview('');
    } catch (err) {
      showToast('error', 'Gagal Upload', err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
      <Card title="Upload Laporan Akhir">
        <div className="space-y-6">
          <Input label="Judul Laporan" value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Laporan Akhir Magang" />
          <div className="group border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-cyan-400 hover:bg-cyan-50/30 transition-all cursor-pointer relative"><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFile(e.target.files[0])} /><div className="flex flex-col items-center"><div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><FileText size={32} /></div><p className="font-bold text-slate-700 text-lg">{file ? file.name : "Drag & Drop atau Klik"}</p><p className="text-slate-400 text-sm mt-1">Format PDF/DOCX (Maks 10MB)</p></div></div>
          <div><div className="flex justify-between items-center mb-2"><label className="font-bold text-slate-700">Ringkasan Laporan</label><button onClick={handleAI} disabled={isGenerating} className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 font-bold flex items-center gap-1 transition-colors">{isGenerating ? "Menganalisis..." : "✨ AI Generate"}</button></div><textarea className="w-full p-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-100 outline-none h-32 text-sm leading-relaxed" value={overview} onChange={e => setOverview(e.target.value)} placeholder="Hasil ringkasan akan muncul di sini..." /></div>
          <Button onClick={submit} className="w-full py-4 text-lg">Kirim Laporan</Button>
        </div>
      </Card>
    </div>
  );
}

// --- LECTURER DASHBOARD ---
function LecturerDashboard({ user, onLogout, logbooks, setLogbooks, reports, onUpdateProfile, showToast }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [students, setStudents] = useState([]); // Fetch students from logic if needed, or just derive from logs

  // Fetch Logic for Lecturer
  // Fetch Logic for Lecturer
  const fetchData = async () => {
    try {
      // 1. Get Logbooks
      const urlLogbooks = `${GAS_URL}?action=getAllLogbooks&userId=${user.username}&role=lecturer`;
      const resLog = await fetch(urlLogbooks);
      const resultLog = await resLog.json();

      // 2. Get Supervised Students (Authoritative List)
      const urlStudents = `${GAS_URL}?action=getSupervisedStudents&userId=${user.username}`;
      const resStudents = await fetch(urlStudents);
      const resultStudents = await resStudents.json();

      if (resultLog.status === 'success') {
        setLogbooks(resultLog.data);
        showToast('success', 'Data Diperbarui', 'Data terbaru berhasil dimuat.');
      }

      if (resultStudents.status === 'success') {
        // Enrich student data with latest logbook info for UI convenience
        const enrichedStudents = resultStudents.data.map(s => {
          // Find latest logbook for this student
          const studentLogs = resultLog.data ? resultLog.data.filter(l => l.nim === s.nim) : [];

          // Sort explicitly to get the latest (Newest First)
          studentLogs.sort((a, b) => {
            const dateA = parseDateSafe(a.date, a.time);
            const dateB = parseDateSafe(b.date, b.time);
            return dateB - dateA;
          });

          // Take the first one (latest) because we sorted descending
          const lastLog = studentLogs.length > 0 ? studentLogs[0] : null;

          return {
            ...s,
            // Keep existing fields
            id: s.id,
            name: s.name,
            username: s.nim, // Mapping nim to username for consistency with existing code
            class: s.class,
            // Add derived fields
            lastLogbook: lastLog ? (lastLog.date + ' ' + lastLog.time) : null,
            lastStatus: lastLog ? lastLog.status : null
          };
        });
        setStudents(enrichedStudents);
      } else {
        // Fallback if API fails or returns empty: Derive from logbooks as before
        if (resultLog.status === 'success') {
          // Robust Fallback: Group by NIM, Keep Latest
          const studentMap = new Map();

          resultLog.data.forEach(log => {
            if (!log.nim) return;

            const logDate = new Date(`${log.date}T${log.time}`);
            // Skip invalid dates if any
            if (isNaN(logDate.getTime())) {
              // If date invalid, maybe just take it if we have nothing else? 
              // Or better to skip to avoid bad data. Let's skip.
              return;
            }

            if (!studentMap.has(log.nim)) {
              studentMap.set(log.nim, log);
            } else {
              const currentBest = studentMap.get(log.nim);
              const currentBestDate = new Date(`${currentBest.date}T${currentBest.time}`);
              if (logDate > currentBestDate) {
                studentMap.set(log.nim, log);
              }
            }
          });

          const uniqueStudents = Array.from(studentMap.values()).map(log => ({
            id: log.studentId || log.nim,
            name: log.name,
            username: log.nim,
            class: log.class,
            lastLogbook: log.date + ' ' + log.time,
            lastStatus: log.status
          }));

          setStudents(uniqueStudents);
        }
      }

    } catch (e) {
      console.error(e);
      showToast('error', 'Gagal Memuat', 'Terjadi kesalahan saat mengambil data.');
    }
  };

  useEffect(() => {
    if (!GAS_URL.includes("MASUKKAN")) fetchData();
  }, []);

  const NavItem = ({ id, label, icon: Icon }) => {
    const isActive = activeTab === id;
    return (
      <button onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-5 py-3.5 mx-3 mb-2 rounded-xl transition-all duration-300 font-medium ${isActive ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`} style={{ width: 'calc(100% - 1.5rem)' }}>
        <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
        <span>{label}</span>
        {isActive && <ChevronRight size={16} className="ml-auto opacity-70" />}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-lg z-20">
        <div className="p-8">
          <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Panel Dosen</h2>
          <p className="text-slate-400 text-sm font-medium mt-1 truncate">{user.name}</p>
        </div>
        <nav className="flex-1 py-2">
          <NavItem id="overview" label="Overview" icon={LayoutDashboard} />
          <NavItem id="logbooks" label="Logbook Mahasiswa" icon={MapPin} />
          <NavItem id="grading" label="Nilai Tugas" icon={FileText} />
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 font-medium ${activeTab === 'profile' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            <User size={20} className={activeTab === 'profile' ? 'text-white' : 'text-slate-400'} /> Profil Saya
          </button>
          <Button variant="danger" onClick={onLogout} className="w-full justify-center rounded-xl"><LogOut size={18} /> Keluar</Button>
        </div>
      </aside>

      {/* Header Mobile */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 backdrop-blur-md flex items-center justify-between px-6 z-50 shadow-md">
        <div className="text-white"><h2 className="text-xl font-bold">Panel Dosen</h2><p className="text-xs text-blue-100 truncate max-w-[200px]">{user.name}</p></div>
        <button onClick={() => setActiveTab('profile')} className={`p-2 rounded-full text-white transition-colors shadow-sm ${activeTab === 'profile' ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30'}`}><User size={22} /></button>
      </div>

      {/* Bottom Navigation Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 px-2 pb-safe pt-2">
        <div className="flex justify-around items-center">
          <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center justify-center py-2 px-1 mx-1 rounded-2xl min-w-[4.5rem] flex-1 transition-all duration-300 ${activeTab === 'overview' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 font-bold scale-105' : 'text-slate-400 hover:text-cyan-600 hover:bg-slate-50'}`}>
            <LayoutDashboard size={22} className="mb-1" />
            <span className="text-[12px] font-bold text-center leading-tight">Overview</span>
          </button>
          <button onClick={() => setActiveTab('logbooks')} className={`flex flex-col items-center justify-center py-2 px-1 mx-1 rounded-2xl min-w-[4.5rem] flex-1 transition-all duration-300 ${activeTab === 'logbooks' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 font-bold scale-105' : 'text-slate-400 hover:text-cyan-600 hover:bg-slate-50'}`}>
            <MapPin size={22} className="mb-1" />
            <span className="text-[12px] font-bold text-center leading-tight">Logbook<br />Mahasiswa</span>
          </button>
          <button onClick={() => setActiveTab('grading')} className={`flex flex-col items-center justify-center py-2 px-1 mx-1 rounded-2xl min-w-[4.5rem] flex-1 transition-all duration-300 ${activeTab === 'grading' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 font-bold scale-105' : 'text-slate-400 hover:text-cyan-600 hover:bg-slate-50'}`}>
            <FileText size={22} className="mb-1" />
            <span className="text-[12px] font-bold text-center leading-tight">Nilai<br />Tugas</span>
          </button>
          <button onClick={onLogout} className="flex flex-col items-center justify-center py-2 px-1 mx-1 rounded-2xl min-w-[4.5rem] flex-1 transition-all duration-300 text-red-400 hover:text-red-600 hover:bg-red-50">
            <LogOut size={22} className="mb-1" />
            <span className="text-[12px] font-bold text-center leading-tight">Keluar</span>
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto relative pt-24 pb-20 md:pt-0 md:pb-0">
        <div className="p-5 md:p-8 w-full max-w-[1600px] mx-auto">
          {activeTab === 'overview' && <LecturerOverview students={students} logbooks={logbooks} reports={reports} onDetailClick={(nim) => { setActiveTab('logbooks'); window.dispatchEvent(new CustomEvent('setSearchTerm', { detail: nim })); }} />}
          {activeTab === 'logbooks' && <LecturerLogbookView user={user} logbooks={logbooks} students={students} showToast={showToast} onRefresh={fetchData} />}
          {activeTab === 'grading' && <LecturerGrading reports={reports} showToast={showToast} />}
          {activeTab === 'profile' && <ProfileSettings user={user} students={students} onUpdate={onUpdateProfile} onCancel={() => setActiveTab('overview')} showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}

function LecturerOverview({ students, logbooks, reports, onDetailClick }) {
  const submitted = reports.length; const total = students.length;

  // Add date filter state initialized to today
  const getTodayDate = () => {
    const today = new Date();
    // Use local timezone to avoid UTC offset issues when comparing dates
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [mapDate, setMapDate] = useState(getTodayDate());

  const studentMarkers = students.map(s => {
    // Matching with NIM instead of id, since logbooks use nim
    // Filter specifically by the selected date, or all if empty
    const studentLogbooks = logbooks.filter(l =>
      (l.nim === s.username || l.studentId === s.id) &&
      (!mapDate || l.date === mapDate)
    );

    if (!studentLogbooks || studentLogbooks.length === 0) return null;

    // Logbooks are already sorted newest first in fetchData, but just in case:
    const sortedLogs = [...studentLogbooks].sort((a, b) => {
      const dateA = parseDateSafe(a.date, a.time);
      const dateB = parseDateSafe(b.date, b.time);
      return dateB - dateA;
    });
    const lastLog = sortedLogs[0];

    if (lastLog && lastLog.lat && lastLog.lng) {
      return {
        id: s.username, // Using username(NIM) as ID for filtering later
        lat: lastLog.lat,
        lng: lastLog.lng,
        name: s.name,
        nim: s.username,
        class: s.class || '-',
        status: lastLog.status,
        date: lastLog.date || '-',
        time: lastLog.time || '-'
      };
    }
    return null;
  }).filter(m => m !== null);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="md:col-span-2 relative overflow-visible"
          title={
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
              <span>Peta Sebaran Mahasiswa</span>
              <div className="mt-2 sm:mt-0 w-[160px] relative z-[60]">
                <CustomDatePicker
                  value={mapDate}
                  onChange={setMapDate}
                />
              </div>
            </div>
          }
        >
          <div className="h-80 bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200">
            <LeafletMap readOnly={true} markers={studentMarkers} onMarkerAction={onDetailClick} />
          </div>
        </Card>
        <Card title="Progress Laporan">
          <div className="flex flex-col items-center justify-center h-full py-4"><div className="relative w-48 h-48 flex items-center justify-center"><svg className="w-full h-full transform -rotate-90"><circle cx="50%" cy="50%" r="70" stroke="#f1f5f9" strokeWidth="12" fill="none" /><circle cx="50%" cy="50%" r="70" stroke="#0ea5e9" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset={440 - (440 * (submitted / total))} className="transition-all duration-1000 ease-out" strokeLinecap="round" /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-black text-slate-800">{Math.round((submitted / total) * 100)}%</span><span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Terkumpul</span></div></div></div>
        </Card>
      </div>
      <Card title="Daftar Mahasiswa Bimbingan">
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-100 text-left"><th className="pb-4 pl-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Mahasiswa</th><th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Logbook Terakhir</th><th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Status Laporan</th></tr></thead><tbody className="divide-y divide-slate-50">{students.map(s => { const hasReport = reports.find(r => r.studentId === s.id); return (<tr key={s.id} className="hover:bg-slate-50/80 transition-colors"><td className="py-4 pl-4"><div className="font-bold text-slate-700">{s.name}</div><div className="text-xs text-slate-400 font-mono">{s.username}</div></td><td className="py-4 text-sm text-slate-600">{s.lastLogbook || "-"}</td><td className="py-4">{hasReport ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold"><CheckCircle size={14} /> Selesai</span> : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">Belum</span>}</td></tr>) })}</tbody></table></div>
      </Card>
    </div>
  );
}

// --- UNSUBMITTED MODAL ---
const UnsubmittedModal = ({ user, showToast, onClose }) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('hari_ini');
  const [isManualSelecting, setIsManualSelecting] = useState(false);
  const [showMobileDates, setShowMobileDates] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - tzOffset).toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (type) => {
    setFilterType(type);
    const todayStr = getTodayDate();
    let newStart = todayStr;
    let newEnd = todayStr;

    if (type === 'hari_ini') {
      newStart = todayStr;
      newEnd = todayStr;
    } else if (type === 'triwulan') {
      // Triwulan / Semester currently requested to start from Jan 1st of current year
      newStart = `${new Date().getFullYear()}-01-01`;
      newEnd = todayStr;
    } else if (type === 'tahun_ini') {
      newStart = `${new Date().getFullYear()}-01-01`;
      newEnd = todayStr;
    } else if (type === 'custom') {
      newStart = startDate;
      newEnd = endDate;
      setShowMobileDates(true);
    }

    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const fetchUnsubmitted = async () => {
    setLoading(true);
    showToast('info', 'Memuat Data...', `Mengambil Data Logbook Mahasiswa yang belum mengerjakan.`);
    try {
      const url = `${GAS_URL}?action=getUnsubmitted&startDate=${startDate}&endDate=${endDate}&userId=${user.username}&role=${user.role}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === 'success') {
        setStudents(json.data);
        if (json.data.length === 0) {
          showToast('success', 'Selesai', 'Semua mahasiswa sudah mengisi logbook pada rentang waktu ini.');
        } else {
          showToast('success', 'Selesai', `Ditemukan ${json.data.length} mahasiswa belum absen.`);
        }
      } else {
        showToast('error', 'Gagal', json.message || 'Terjadi kesalahan sistem.');
      }
    } catch (e) {
      showToast('error', 'Error', 'Gagal mengambil data mahasiswa belum logbook. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
      if (filterType === 'custom') setShowMobileDates(false);
    }
  };

  // Fetch when start or end date changes
  useEffect(() => {
    fetchUnsubmitted();
  }, [startDate, endDate]);

  const formatTanggalIndo = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getRangeText = () => {
    if (startDate === endDate) return formatTanggalIndo(startDate);
    return `${formatTanggalIndo(startDate)} hingga ${formatTanggalIndo(endDate)}`;
  };

  const handleExportExcel = () => {
    // Excel Export with requested columns
    const tableHTML = `
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="border: 2pt solid black; padding: 5px; font-weight: bold;">No</th>
            <th style="border: 2pt solid black; padding: 5px; font-weight: bold;">Nama Mahasiswa</th>
            <th style="border: 2pt solid black; padding: 5px; font-weight: bold;">NIM</th>
            <th style="border: 2pt solid black; padding: 5px; font-weight: bold;">Tanggal Belum Logbook</th>
            <th style="border: 2pt solid black; padding: 5px; font-weight: bold;">Kelas</th>
          </tr>
        </thead>
        <tbody>
          ${students.map((s, i) => `
            <tr>
              <td style="border: 2pt solid black; padding: 5px;">${i + 1}</td>
              <td style="border: 2pt solid black; padding: 5px;">'${s.name}</td>
              <td style="border: 2pt solid black; padding: 5px;">'${s.nim}</td>
              <td style="border: 2pt solid black; padding: 5px;">${(s.missingDates || []).map(d => formatTanggalIndo(d)).join(', ')}</td>
              <td style="border: 2pt solid black; padding: 5px;">${s.class}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Belum_Logbook_${startDate}_to_${endDate}.xls`;
    a.click();
    setIsExportOpen(false);
  };

  const handleExportWA = () => {
    // WA Export with requested format
    let message = `Berikut adalah Mahasiswa yang belum mengumpulkan Logbook ${filterType === 'hari_ini' ? formatTanggalIndo(startDate) : getRangeText()}:\n`;
    students.forEach((s, i) => {
      const datesStr = (s.missingDates || []).map(d => formatTanggalIndo(d)).join(', ');
      message += `${i + 1}. ${s.name} (${s.nim}), ${s.class} pada Tanggal: ${datesStr}\n`;
    });

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    setIsExportOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-black text-2xl text-slate-800 tracking-tight">Mahasiswa Belum Logbook</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Sistem mencari jadwal kosong mahasiswa</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><X size={24} /></button>
            </div>

            {/* Modern Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm w-full">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleFilterChange('hari_ini')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'hari_ini' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Hari Ini</button>
                <button onClick={() => handleFilterChange('triwulan')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'triwulan' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Triwulan Semester</button>
                <button onClick={() => handleFilterChange('tahun_ini')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'tahun_ini' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Tahun Ini</button>
                <button onClick={() => { handleFilterChange('custom'); setIsManualSelecting(true); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'custom' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Pilih Manual</button>
              </div>

              <div className={`flex-col sm:flex-row items-center gap-3 w-full lg:w-auto mt-4 md:mt-0 ${filterType === 'custom' && showMobileDates ? 'flex' : 'hidden md:flex'}`}>
                <div className="relative w-full sm:flex-1 md:w-[180px]">
                  <CustomDatePicker value={startDate} onChange={(val) => { setStartDate(val); setFilterType('custom'); setShowMobileDates(true); }} forceOpen={isManualSelecting} onForceOpenConsume={() => setIsManualSelecting(false)} />
                </div>
                <span className="text-slate-400 font-bold shrink-0">s/d</span>
                <div className="relative w-full sm:flex-1 md:w-[180px]">
                  <CustomDatePicker value={endDate} onChange={(val) => { setEndDate(val); setFilterType('custom'); setShowMobileDates(true); }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50/50 border-b border-blue-100 flex justify-between items-center px-5">
          <span className="text-sm font-bold text-blue-700 font-mono flex items-center gap-2">
            <Calendar size={16} /> Rentang: {getRangeText()}
          </span>
          <span className="px-3 py-1 bg-white rounded-full text-xs font-black text-slate-700 shadow-sm border border-slate-200">
            Total {students.length} Mahasiswa
          </span>
        </div>

        <div className="flex-1 relative w-full h-full min-h-[200px] flex flex-col">
          {loading && (
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[3px] z-[50] flex flex-col items-center justify-center pointer-events-auto">
              <div className="text-center p-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 animate-in zoom-in duration-200">
                <RefreshCw size={40} className="animate-spin text-cyan-500 mx-auto mb-4 drop-shadow-md" />
                <p className="font-black text-slate-800 text-lg">Menganalisis Data...</p>
                <p className="text-slate-500 text-sm mt-1 font-medium">Sistem mencari jadwal kosong mahasiswa</p>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-0">
            <table className={`w-full text-sm text-left transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none select-none' : ''}`}>
              <thead className="hidden md:table-header-group bg-slate-50 text-slate-500 font-bold sticky top-0 z-20">
                <tr>
                  <th className="p-4 border-b text-xs uppercase tracking-wider">Nama Lengkap</th>
                  <th className="p-4 border-b text-xs uppercase tracking-wider">NIM Kelas</th>
                  <th className="p-4 border-b text-xs uppercase tracking-wider">Tanggal Belum Logbook</th>
                  <th className="p-4 border-b text-xs uppercase tracking-wider text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y md:divide-slate-100 flex flex-col md:table-row-group p-4 md:p-0 gap-4 md:gap-0 bg-slate-50/50 md:bg-transparent">
                {students.map((s, i) => (
                  <tr key={i} className="flex flex-col md:table-row transition-colors p-5 md:p-0 gap-3 md:gap-0 bg-white border border-slate-200 md:border-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none hover:bg-slate-50 relative">
                    <td className="p-0 md:p-4 block md:table-cell">
                      <span className="text-[10px] font-bold text-slate-400 mb-1 block md:hidden uppercase tracking-wider">Nama Lengkap</span>
                      <div className="font-bold text-slate-800 text-base md:text-sm">{s.name}</div>
                    </td>
                    <td className="p-0 md:p-4 text-slate-700 font-medium block md:table-cell border-t border-slate-50 pt-3 md:border-0 md:pt-4">
                      <span className="text-[10px] font-bold text-slate-400 mb-1 block md:hidden uppercase tracking-wider">NIM Kelas</span>
                      {s.nim} - {s.class}
                    </td>
                    <td className="p-0 md:p-4 block md:table-cell border-t border-slate-100 pt-3 md:border-0 md:pt-4">
                      <span className="text-[10px] font-bold text-slate-400 mb-2 block md:hidden uppercase tracking-wider">Tanggal Belum Logbook</span>
                      <div className="flex flex-col md:flex-row md:flex-wrap gap-1.5 md:gap-1 mt-1">
                        {(s.missingDates || []).map((d, idx) => (
                          <span key={idx} className="px-2 py-1 md:py-0.5 bg-red-50 text-red-600 rounded-md md:rounded text-[12px] md:text-[11px] font-bold border border-red-100 md:whitespace-nowrap w-fit md:w-auto">{formatTanggalIndo(d)}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-0 md:p-4 text-left md:text-center block md:table-cell border-t border-slate-50 pt-3 md:border-0 md:pt-4 mt-1 md:mt-0">
                      <button
                        onClick={() => showToast('success', 'Berhasil', `Notifikasi peringatan logbook telah dikirimkan ke ${s.name}.`)}
                        className="w-full md:w-auto px-4 py-2.5 md:py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm md:text-xs font-bold rounded-xl md:rounded-lg shadow-sm hover:shadow transition-all"
                      >
                        Ingatkan
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && students.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-1">Semua Mengisi Logbook</h4>
                        <p className="text-slate-500">Semua mahasiswa sudah rajin mengisi logbook pada rentang waktu ini 🎉</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          {students.length > 0 && (
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="px-6 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-200 rounded-xl font-bold transition-all flex items-center gap-2 border border-emerald-100 shadow-sm"
              >
                <Download size={18} /> Ekspor Data
                <ChevronDown size={16} className={`transition-transform duration-300 ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportOpen && (
                <div className="absolute bottom-full right-0 mb-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 origin-bottom-right z-50">
                  <button onClick={handleExportExcel} className="w-full text-left px-5 py-4 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center gap-3 transition-colors border-b border-slate-50 font-medium">
                    <FileSpreadsheet size={20} className="text-emerald-500" /> Ekspor ke Excel
                  </button>
                  <button onClick={handleExportWA} className="w-full text-left px-5 py-4 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center gap-3 transition-colors font-medium">
                    <MessageCircle size={20} className="text-emerald-500" /> Ingatkan via WA
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- CUSTOM DROPDOWN COMPONENT (FOR MODERN UI) ---
const CustomDropdown = ({ options, value, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all group min-w-[180px]"
      >
        {Icon && <Icon size={18} className="text-slate-400 group-hover:text-cyan-500 transition-colors" />}
        <span className="flex-1 text-left font-bold text-slate-700 text-sm">{selectedOption.label}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => { e.preventDefault(); onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between group ${value === opt.value ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span>{opt.label}</span>
                {value === opt.value && <CheckCircle size={14} className="text-cyan-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function LecturerLogbookView({ user, logbooks, students, showToast, onRefresh }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [detailModal, setDetailModal] = useState({ show: false, title: '', content: '' });
  const [unsubmittedList, setUnsubmittedList] = useState([]);
  const [showUnsubmitted, setShowUnsubmitted] = useState(false);
  const [loadingUnsubmitted, setLoadingUnsubmitted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Listen for search term events from Map Popup
  useEffect(() => {
    const handleSetSearch = (e) => {
      if (e.detail) setSearchTerm(e.detail);
    };
    window.addEventListener('setSearchTerm', handleSetSearch);
    return () => window.removeEventListener('setSearchTerm', handleSetSearch);
  }, []);

  const [sortOrder, setSortOrder] = useState('newest');
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [dateFilter, setDateFilter] = useState(getTodayDate());

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const handleOpenUnsubmitted = () => {
    setShowUnsubmitted(true);
  };

  // Filter & Sort Logic
  const filteredLogbooks = logbooks.filter(log => {
    // 1. Filter Search Term
    let matchesSearch = true;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      matchesSearch = (
        (log.name && String(log.name).toLowerCase().includes(term)) ||
        (log.nim && String(log.nim).toLowerCase().includes(term)) ||
        (log.class && String(log.class).toLowerCase().includes(term)) ||
        (log.className && String(log.className).toLowerCase().includes(term)) ||
        (log.activity && String(log.activity).toLowerCase().includes(term)) ||
        (log.output && String(log.output).toLowerCase().includes(term)) ||
        (log.address && String(log.address).toLowerCase().includes(term)) ||
        (log.date && String(log.date).toLowerCase().includes(term))
      );
    }

    // 2. Filter Date Range
    let matchesDate = true;
    if (dateFilter) {
      matchesDate = log.date === dateFilter;
    }

    return matchesSearch && matchesDate;
  }).sort((a, b) => {
    // Default Sort by Timestamp (Date + Time)
    const timeA = parseDateSafe(a.date, a.time).getTime();
    const timeB = parseDateSafe(b.date, b.time).getTime();

    switch (sortOrder) {
      case 'newest': return timeB - timeA;
      case 'oldest': return timeA - timeB;
      case 'date_newest': return parseDateSafe(b.date).getTime() - parseDateSafe(a.date).getTime();
      case 'date_oldest': return parseDateSafe(a.date).getTime() - parseDateSafe(b.date).getTime();
      case 'time_newest': return (b.time || '').localeCompare(a.time || '');
      case 'time_oldest': return (a.time || '').localeCompare(b.time || '');
      default: return timeB - timeA;
    }
  });

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, sortOrder]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogbooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogbooks.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate page buttons (Desktop: Max 5)
  let endPageDesktop = Math.min(totalPages, Math.max(5, currentPage + 2));
  let startPageDesktop = Math.max(1, endPageDesktop - 4);
  if (endPageDesktop - startPageDesktop < 4) {
    endPageDesktop = Math.min(totalPages, startPageDesktop + 4);
  }
  const desktopPages = Array.from({ length: endPageDesktop - startPageDesktop + 1 }, (_, i) => startPageDesktop + i);

  // Calculate page buttons (Mobile: Max 3)
  let endPageMobile = Math.min(totalPages, Math.max(3, currentPage + 1));
  let startPageMobile = Math.max(1, endPageMobile - 2);
  if (endPageMobile - startPageMobile < 2) {
    endPageMobile = Math.min(totalPages, startPageMobile + 2);
  }
  const mobilePages = Array.from({ length: endPageMobile - startPageMobile + 1 }, (_, i) => startPageMobile + i);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {previewImage && <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />}
      {detailModal.show && <TextModal title={detailModal.title} content={detailModal.content} onClose={() => setDetailModal({ show: false, title: '', content: '' })} />}
      {showUnsubmitted && <UnsubmittedModal user={user} showToast={showToast} onClose={() => setShowUnsubmitted(false)} />}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="w-full xl:w-auto">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3 flex items-center gap-3">
            Logbook Mahasiswa
            <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors shrink-0" title="Refresh Data">
              <RefreshCw size={20} className={isRefreshing ? "animate-spin text-cyan-500" : ""} />
            </button>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-4 py-1.5 bg-cyan-50 rounded-full border border-cyan-100 text-sm font-bold text-cyan-700">{filteredLogbooks.length} Entri</span>
            <button onClick={handleOpenUnsubmitted} className="hidden md:flex px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-full border border-red-100 text-sm font-bold transition-colors items-center gap-1">
              Lihat Mahasiswa Belum Logbook
            </button>
            <button onClick={() => setShowExportModal(true)} className="hidden md:flex px-4 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-full border border-emerald-100 text-sm font-bold transition-colors items-center gap-1 shadow-sm">
              <Download size={16} /> Ekspor Excel
            </button>
            <span className="text-slate-400 text-sm ml-2">Halaman {currentPage} dari {totalPages || 1}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full xl:w-auto">
          <div className="relative group sm:flex-1 xl:w-64">
            <input
              type="text"
              placeholder="Cari Mahasiswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 outline-none w-full transition-all font-medium text-slate-700"
            />
            <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors"><Search size={20} /></div>
          </div>

          {/* Custom Date Picker - Modern UI mapped to selected date */}
          <div className="relative z-30 sm:flex-1 xl:w-auto">
            <CustomDatePicker value={dateFilter} onChange={setDateFilter} />
          </div>

          {/* Custom Dropdown - Sort */}
          <div className="relative z-20 sm:flex-1 xl:w-auto">
            <CustomDropdown
              value={sortOrder}
              onChange={setSortOrder}
              icon={ListOrdered}
              options={[
                { value: 'newest', label: 'Terbaru Dikirim' },
                { value: 'oldest', label: 'Terlama Dikirim' },
                { value: 'date_newest', label: 'Tanggal Terbaru' },
                { value: 'date_oldest', label: 'Tanggal Terlama' }
              ]}
            />
          </div>
        </div>

        {/* Mobile DAFTAR MAHASISWA */}
        <div className="md:hidden space-y-4 w-full">
          <button onClick={handleOpenUnsubmitted} className="w-full py-3 mb-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl border border-red-100 text-sm font-bold transition-colors flex items-center justify-center gap-2">
            Lihat Mahasiswa Belum Logbook
          </button>
          <button onClick={handleRefresh} disabled={isRefreshing} className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <RefreshCw size={18} className={isRefreshing ? "animate-spin text-cyan-500" : ""} /> Refresh Data
          </button>
        </div>
      </div>

      {/* MAP REMOVED AS REQUESTED */}

      {/* Desktop View: Table */}
      <div className="hidden xl:block bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[1200px]">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs text-center">Foto Selfie</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs text-center">Nama Lengkap Mahasiswa</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs text-center">Tanggal dan Jam Absensi</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs w-1/4 text-center">Koordinat dan Nama Jalan</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs text-center">Status Kehadiran</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs w-1/6 text-center">Kegiatan yang Dilakukan</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs w-1/6 text-center">Output yang Dihasilkan</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs text-center">Dokumentasi Tambahan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentItems.map(log => {
              // Parse Detection Status
              // Parse Detection Status
              let detectionStatus = log.locationType || 'manual'; // Default to manual/unknown
              let displayAddress = log.address || '-';

              // LEGACY DATA FALLBACK:
              // If backend says 'manual' (default) but date is before 18 Feb 15:00 WIB, treat as automatic.
              if (detectionStatus === 'manual' && log.date) {
                try {
                  const logIso = `${log.date}T${log.time}:00+07:00`;
                  const logDateObj = new Date(logIso);
                  const cutoffDate = new Date('2026-02-18T15:00:00+07:00');

                  if (logDateObj < cutoffDate) {
                    detectionStatus = 'automatic';
                  }
                } catch (e) {
                  // Ignore parse error, keep as manual
                }
              }

              return (
                <tr key={log.id} className="hover:bg-cyan-50/30 transition-colors group">
                  <td className="p-5 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm mx-auto cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setPreviewImage(getPhotoUrl(log.selfieUrl))}
                    >
                      <img src={getPhotoUrl(log.selfieUrl)} alt="Selfie" className="w-full h-full object-cover" style={{ imageOrientation: 'from-image' }} />
                    </div>
                  </td>
                  <td className="p-5 align-top">
                    <div className="font-bold text-slate-800">{log.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">{log.class || '-'} • {log.nim}</div>
                  </td>
                  <td className="p-5 align-top">
                    <div className="font-bold text-slate-700">{log.date}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">Jam {log.time}</div>
                  </td>
                  <td className="p-5 align-top">
                    <div className="flex flex-col gap-1 items-start">
                      <a
                        href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-slate-700 hover:text-cyan-600 hover:underline transition-colors block"
                      >
                        [{log.lat}, {log.lng}]
                      </a>
                      <div className="text-sm font-medium text-slate-700 leading-relaxed">
                        {displayAddress}
                      </div>
                    </div>
                    {detectionStatus !== 'unknown' && (
                      <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${detectionStatus === 'automatic'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-pink-50 text-pink-700 border-pink-200'
                        }`}>
                        {detectionStatus === 'automatic' ? 'Deteksi Otomatis' : 'Input Manual'}
                      </div>
                    )}
                  </td>
                  <td className="p-5 align-top">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide ${log.status === 'Hadir' ? 'bg-green-100 text-green-700' : log.status === 'Sakit' ? 'bg-red-100 text-red-700' : log.status === 'Izin' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-5 align-top">
                    <div className="line-clamp-3 text-slate-700 font-medium text-sm mb-2 leading-relaxed [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: displayRichText(log.activity) }} />
                    <button onClick={() => setDetailModal({ show: true, title: 'Detail Kegiatan', content: displayRichText(log.activity) })} className="block w-full text-left text-sm font-bold text-cyan-600 hover:text-cyan-800 hover:underline">Lihat Selengkapnya</button>
                  </td>
                  <td className="p-5 align-top">
                    <div className="line-clamp-3 text-slate-700 font-medium text-sm mb-2 leading-relaxed [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: displayRichText(log.output) }} />
                    <button onClick={() => setDetailModal({ show: true, title: 'Detail Output', content: displayRichText(log.output) })} className="block w-full text-left text-sm font-bold text-cyan-600 hover:text-cyan-800 hover:underline">Lihat Selengkapnya</button>
                  </td>
                  <td className="p-5 text-center align-top">
                    {log.docUrl ? (
                      <div
                        className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mx-auto shadow-sm cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setPreviewImage(getPhotoUrl(log.docUrl))}
                      >
                        <img src={getPhotoUrl(log.docUrl)} alt="Dokumen" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs italic">Tidak ada</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet View: Cards */}
      <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentItems.map(log => {
          // Parse Detection Status (Duplicate logic for mobile)
          // Parse Detection Status (Mobile)
          let detectionStatus = log.locationType || 'manual';
          let displayAddress = log.address || '-';

          // LEGACY DATA FALLBACK:
          if (detectionStatus === 'manual' && log.date) {
            try {
              const logIso = `${log.date}T${log.time}:00+07:00`;
              const logDateObj = new Date(logIso);
              const cutoffDate = new Date('2026-02-18T15:00:00+07:00');

              if (logDateObj < cutoffDate) {
                detectionStatus = 'automatic';
              }
            } catch (e) {
              // Ignore
            }
          }

          return (
            <div key={log.id} className="bg-white rounded-[2rem] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col gap-5">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
                <div
                  className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner cursor-pointer"
                  onClick={() => setPreviewImage(getPhotoUrl(log.selfieUrl))}
                >
                  <img src={getPhotoUrl(log.selfieUrl)} alt="Selfie" className="w-full h-full object-cover" style={{ imageOrientation: 'from-image' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-slate-800 leading-tight truncate">{log.name}</h3>
                  <p className="text-slate-500 text-xs font-mono mt-1">{log.class || '-'} • {log.nim}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${log.status === 'Hadir' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{log.status}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{log.date} {log.time}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                <MapPin size={18} className="text-cyan-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <a
                    href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-slate-700 leading-snug block hover:text-cyan-600 hover:underline mb-1"
                  >
                    [{log.lat}, {log.lng}]
                  </a>
                  <p className="text-sm font-bold text-slate-700 leading-snug">{displayAddress}</p>
                  {detectionStatus !== 'unknown' && (
                    <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border ${detectionStatus === 'automatic'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-pink-100 text-pink-700 border-pink-200'
                      }`}>
                      {detectionStatus === 'automatic' ? 'Deteksi Otomatis' : 'Input Manual'}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDetailModal({ show: true, title: 'Detail Kegiatan', content: displayRichText(log.activity) })} className="p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition text-center">Lihat Kegiatan</button>
                <button onClick={() => setDetailModal({ show: true, title: 'Detail Output', content: displayRichText(log.output) })} className="p-3 bg-cyan-50 text-cyan-700 rounded-xl text-xs font-bold hover:bg-cyan-100 transition text-center">Lihat Output</button>
              </div>

              <button
                onClick={() => log.docUrl && setPreviewImage(getPhotoUrl(log.docUrl))}
                disabled={!log.docUrl}
                className={`w-full py-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${log.docUrl
                  ? 'border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'
                  : 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                  }`}
              >
                <FileText size={16} className={log.docUrl ? "" : "opacity-50"} />
                {log.docUrl ? "Lihat Dokumentasi Tambahan" : "Tidak Ada Dokumentasi Tambahan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Desktop Pagination */}
          <div className="hidden sm:flex gap-2">
            {desktopPages.map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${currentPage === number ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white transform scale-105' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {number}
              </button>
            ))}
          </div>

          {/* Mobile Pagination */}
          <div className="flex sm:hidden gap-1">
            {mobilePages.map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${currentPage === number ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white transform scale-105' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {number}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Mobile FAB for Export */}
      <button
        onClick={() => setShowExportModal(true)}
        className="md:hidden fixed bottom-24 right-4 p-4 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/40 z-40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center animate-in slide-in-from-bottom"
        title="Ekspor Logbook"
      >
        <FileSpreadsheet size={24} />
      </button>

      {/* Export Logbook Modal */}
      {showExportModal && (
        <ExportLogbookModal
          logbooks={logbooks}
          onClose={() => setShowExportModal(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function LecturerGrading({ reports, showToast }) {
  const [preview, setPreview] = useState(null);

  // Sort reports: Latest first
  const sortedReports = [...reports].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedReports.map(r => (<div key={r.id} className="bg-white group rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/50 transition-all duration-300 flex flex-col"><div className="flex justify-between items-start mb-4"><div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-500 transition-colors"><FileText size={24} /></div>{r.graded ? <CheckCircle className="text-emerald-500" /> : <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />}</div><h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-cyan-700 transition-colors">{r.title}</h3><p className="text-sm text-slate-500 mb-4">{r.name}</p><p className="text-xs text-slate-400 line-clamp-2 mb-6 bg-slate-50 p-3 rounded-xl">{r.overview}</p><Button variant="secondary" onClick={() => setPreview(r)} className="mt-auto w-full">Review</Button></div>))}
      {preview && (<div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white w-full max-w-5xl h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"><div className="bg-white border-b border-slate-100 p-6 flex justify-between items-center"><div><h2 className="text-xl font-bold text-slate-800">{preview.title}</h2><p className="text-slate-500 text-sm">{preview.name}</p></div><button onClick={() => setPreview(null)} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={24} /></button></div><div className="flex-1 bg-slate-50 p-8 overflow-y-auto"><div className="max-w-3xl mx-auto bg-white min-h-[800px] shadow-sm rounded-xl p-10"><h1 className="text-3xl font-bold text-center mb-8">{preview.title}</h1><div className="p-6 bg-purple-50 rounded-xl border border-purple-100 mb-8"><h4 className="font-bold text-purple-800 text-sm uppercase mb-2">AI Summary</h4><p className="text-purple-900/80 leading-relaxed italic">"{preview.overview}"</p></div><div className="space-y-4 text-slate-600 leading-loose text-justify"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></div></div></div><div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3"><Button variant="danger" onClick={() => { showToast('info', 'Revisi Diminta', 'Permintaan revisi telah dikirim.'); setPreview(null); }}>Minta Revisi</Button><Button onClick={() => { showToast('success', 'Penilaian Selesai', 'Nilai 100 berhasil disimpan.'); setPreview(null); }}>Beri Nilai Sempurna</Button></div></div></div>)}
    </div>
  );
}

// --- EXPORT LOGBOOK MODAL ---
const ExportLogbookModal = ({ logbooks, onClose, showToast }) => {
  const [filterType, setFilterType] = useState('hari_ini');
  const [isManualSelecting, setIsManualSelecting] = useState(false);
  const [showMobileDates, setShowMobileDates] = useState(false);
  const [photoOption, setPhotoOption] = useState('Semua');

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());

  const handleFilterChange = (type) => {
    setFilterType(type);
    const todayStr = getTodayDate();
    let newStart = todayStr;
    let newEnd = todayStr;

    if (type === 'hari_ini') {
      newStart = todayStr;
      newEnd = todayStr;
    } else if (type === 'triwulan') {
      const today = new Date();
      const currentQuarter = Math.floor(today.getMonth() / 3);
      const startQuarterDate = new Date(today.getFullYear(), currentQuarter * 3, 1);
      newStart = `${startQuarterDate.getFullYear()}-${String(startQuarterDate.getMonth() + 1).padStart(2, '0')}-${String(startQuarterDate.getDate()).padStart(2, '0')}`;
      newEnd = todayStr;
    } else if (type === 'tahun_ini') {
      newStart = `${new Date().getFullYear()}-01-01`;
      newEnd = todayStr;
    } else if (type === 'custom') {
      newStart = startDate;
      newEnd = endDate;
      setShowMobileDates(true);
    }

    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const cleanHTML = (htmlString) => {
    if (!htmlString) return "-";
    // Convert 1. 2. 3. ol and li items into clean text
    let text = htmlString
      .replace(/<ol[^>]*>/gi, '')
      .replace(/<\/ol>/gi, '')
      .replace(/<ul[^>]*>/gi, '')
      .replace(/<\/ul>/gi, '')
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '') // remove all other tags
      .replace(/&nbsp;/ig, ' ')
      .replace(/&amp;/ig, '&');

    // Remove leading/trailing new lines & extra spaces
    text = text.replace(/(^\n+|\n+$)/g, '').trim();
    // In excel, to force a line break in a cell via HTML, it needs style white-space: normal,
    // and we can output `&#10;` or actual `<br>` if we export an HTML table.
    // Since we export HTML table to xls:
    return text.replace(/\n/g, '<br style="mso-data-placement:same-cell;" />');
  };

  const doExport = () => {
    const exportSelfie = photoOption === 'Semua' || photoOption === 'FotoSelfieSaja';
    const exportDoc = photoOption === 'Semua' || photoOption === 'FotoDokumentasiSaja';

    // 1. Filter logbooks based on date range
    const filtered = logbooks.filter(log => {
      if (!log.date) return false;
      const logTime = new Date(log.date).getTime();
      const sTime = new Date(startDate).getTime();
      const eTime = new Date(endDate).getTime();
      return logTime >= sTime && logTime <= eTime;
    });

    if (filtered.length === 0) {
      showToast('warning', 'Tidak ada data', 'Tidak ada logbook pada rentang waktu tersebut.');
      return;
    }

    // Sort by timestamp (Oldest to Newest)
    const sorted = [...filtered].sort((a, b) => {
      const timeA = parseDateSafe(a.date, a.time).getTime();
      const timeB = parseDateSafe(b.date, b.time).getTime();
      return timeA - timeB;
    });

    // 2. Build HTML Table for Excel
    const tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style>
          table { border-collapse: collapse; }
          th, td { border: 1.5pt solid black; vertical-align: top; text-align: left; padding: 5px; font-family: sans-serif; }
          th { background-color: #f3f4f6; font-weight: bold; }
          /* Autofit hint - forces cell text to wrap but cells to size */
          td.kegiatan, td.output { white-space: normal; }
          .img-cell { text-align: center; vertical-align: middle; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>Foto Selfie (Gambar/Thumbnail)</th>
              <th>Tanggal Logbook</th>
              <th>Nama Lengkap Mahasiswa</th>
              <th>NIM</th>
              <th>Status Kehadiran</th>
              <th>Koordinat</th>
              <th>Kegiatan yang Dilakukan</th>
              <th>Output yang Dihasilkan</th>
              <th>Dokumentasi Tambahan (Link)</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map(log => `
              <tr>
                <td class="img-cell">
                  ${(exportSelfie && log.selfieUrl) ? `<img src="${getPhotoUrl(log.selfieUrl)}" width="80" height="auto" />` : '-'}
                </td>
                <td>${log.date || ''} ${log.time || ''}</td>
                <td>${log.name || ''}</td>
                <td style="mso-number-format:'\@'">${log.nim || ''}</td>
                <td>${log.status || ''}</td>
                <td>${log.lat ? `${log.lat}, ${log.lng}` : '-'}</td>
                <td class="kegiatan">${cleanHTML(log.activity)}</td>
                <td class="output">${cleanHTML(log.output)}</td>
                <td>${(exportDoc && log.docUrl) ? `<a href="${log.docUrl}">Lihat Dokumen</a>` : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Logbook_Export_${startDate}_to_${endDate}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('success', 'Berhasil', `${sorted.length} Logbook berhasil diekspor.`);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 rounded-t-2xl">
          <div>
            <h3 className="font-black text-2xl text-slate-800 tracking-tight flex items-center gap-2"><FileSpreadsheet className="text-emerald-500" /> Ekspor Excel Logbook</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Pilih rentang waktu untuk diekspor</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleFilterChange('hari_ini')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'hari_ini' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Hari Ini</button>
              <button onClick={() => handleFilterChange('triwulan')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'triwulan' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Triwulan</button>
              <button onClick={() => handleFilterChange('tahun_ini')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'tahun_ini' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Tahun Ini</button>
              <button onClick={() => { handleFilterChange('custom'); setIsManualSelecting(true); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'custom' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Pilih Manual</button>
            </div>
          </div>

          <div className={`flex-col sm:flex-row items-center gap-3 w-full lg:w-auto p-4 bg-slate-50 rounded-xl border border-slate-200 ${filterType === 'custom' && showMobileDates ? 'flex' : 'hidden md:flex'}`}>
            <div className="relative w-full sm:flex-1">
              <CustomDatePicker value={startDate} onChange={(val) => { setStartDate(val); setFilterType('custom'); setShowMobileDates(true); }} forceOpen={isManualSelecting} onForceOpenConsume={() => setIsManualSelecting(false)} />
            </div>
            <span className="text-slate-400 font-bold shrink-0">s/d</span>
            <div className="relative w-full sm:flex-1">
              <CustomDatePicker value={endDate} onChange={(val) => { setEndDate(val); setFilterType('custom'); setShowMobileDates(true); }} />
            </div>
          </div>

          <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <h4 className="font-bold text-slate-800 text-sm mb-3">Opsi Ekspor Foto & Dokumentasi</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'Semua', label: 'Ekspor Foto Selfie dan Dokumentasi' },
                { id: 'FotoSelfieSaja', label: 'Ekspor Foto Selfie Saja' },
                { id: 'FotoDokumentasiSaja', label: 'Ekspor Foto Dokumentasi Saja' },
                { id: 'JanganKeduanya', label: 'Jangan Ekspor Foto Selfie dan Foto Dokumentasi' },
              ].map(opt => (
                <label key={opt.id} onClick={() => setPhotoOption(opt.id)} className={`flex items-start sm:items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${photoOption === opt.id ? 'border-cyan-500 bg-white shadow-sm' : 'border-slate-200 hover:bg-slate-100 bg-white/50'}`}>
                  <div className={`mt-0.5 sm:mt-0 w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2 ${photoOption === opt.id ? 'border-cyan-500' : 'border-slate-300'}`}>
                    {photoOption === opt.id && <div className="w-2 h-2 bg-cyan-500 rounded-full" />}
                  </div>
                  <span className={`text-xs font-medium leading-tight ${photoOption === opt.id ? 'text-cyan-800 font-bold' : 'text-slate-600'}`}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={doExport} className="bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 text-white flex items-center gap-2">
            <Download size={18} /> Ekspor File .xls
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
