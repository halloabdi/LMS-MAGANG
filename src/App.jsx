import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Camera, Upload, FileText, LogOut,
  LayoutDashboard, CheckCircle, XCircle,
  Map as MapIcon, Eye, Menu, X, Bold, Italic, Underline,
  Superscript, Subscript, ChevronRight, ChevronLeft, ChevronDown,
  User, Settings, Edit3, Save, Image as ImageIcon, Calendar, Clock,
  AlertCircle, ListOrdered, Lightbulb, Check, AlertTriangle, Search
} from 'lucide-react';

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

// --- CUSTOM TOAST NOTIFICATION SYSTEM ---
// Styled perfectly matching the requested UI reference
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
    success: { border: 'border-green-400', iconBg: 'bg-green-400', icon: <Check size={18} className="text-white" /> },
    info: { border: 'border-blue-400', iconBg: 'bg-blue-400', icon: <Lightbulb size={18} className="text-white" /> },
    warning: { border: 'border-amber-400', iconBg: 'bg-amber-400', icon: <AlertTriangle size={18} className="text-white" /> },
    error: { border: 'border-red-400', iconBg: 'bg-red-400', icon: <X size={18} className="text-white" /> }
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div className={`mb-3 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border ${currentStyle.border} flex items-start gap-4 transition-all duration-300 transform ${isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
      <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center mt-0.5 ${currentStyle.iconBg}`}>
        {currentStyle.icon}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
      </div>
      <button onClick={handleClose} className="shrink-0 p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-md transition-colors">
        <X size={16} />
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
const CustomDatePicker = ({ value, onChange }) => {
  const [show, setShow] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(value || new Date()));
  const containerRef = useRef(null);

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
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = newDate.toISOString().split('T')[0];
    onChange(dateString);
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
    const selected = new Date(value);
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
      </div>
    );
  };

  const displayDate = new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={(e) => { e.preventDefault(); setShow(!show) }}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl text-left hover:border-cyan-400 focus:ring-2 focus:ring-cyan-200 transition-all group shadow-sm"
      >
        <span className="font-bold text-slate-700">{displayDate}</span>
        <Calendar size={18} className="text-slate-400 group-hover:text-cyan-500 transition-colors" />
      </button>
      {show && (
        <div className="absolute top-full left-0 mt-2 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          {renderCalendar()}
        </div>
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
          <div dangerouslySetInnerHTML={{ __html: content }} className="prose prose-slate max-w-none" />
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  );
};

// --- CONFIGURATION ---
const GAS_URL = "https://script.google.com/macros/s/AKfycbx0ilzVqV0O2wZ4ySGOr5Z-m6EP-LZKRbf2k8SE8B4z9IPRFUWyrJdIBKNk1B1JMQko/exec";

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
  const baseStyle = "px-4 py-2 rounded-xl font-medium transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 hover:from-cyan-600 hover:to-blue-700",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20",
    success: "bg-emerald-500 text-white hover:bg-emerald-600"
  };
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
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

const Input = ({ label, type = "text", value, onChange, placeholder, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-slate-500 mb-2 ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 outline-none transition-all bg-slate-50 focus:bg-white text-slate-700 placeholder:text-slate-400"
      placeholder={placeholder}
      {...props}
    />
  </div>
);

// --- LEAFLET MAP COMPONENT (ROBUST IMPLEMENTATION) ---
const LeafletMap = ({ lat, lng, setLat, setLng, setAddress, readOnly = false, markers = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const markersGroupRef = useRef([]);

  useEffect(() => {
    // Inject Script if not present
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      // Clean up map instance
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
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // Default center (Indonesia)
    const initialLat = parseFloat(lat) || -2.5489;
    const initialLng = parseFloat(lng) || 118.0149;
    const initialZoom = 5;

    const map = L.map(mapRef.current).setView([initialLat, initialLng], initialZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
    mapInstanceRef.current = map;

    // FORCE RELAYOUT AFTER A SHORT DELAY & ON RESIZE
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    });
    resizeObserver.observe(mapRef.current);

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        if (markers.length > 0) renderMarkers(L, mapInstanceRef.current);
      }
    }, 250);

    // Handle single marker mode (Logbook Form)
    if (!readOnly && lat && lng) {
      const validLat = parseFloat(lat);
      const validLng = parseFloat(lng);
      markerRef.current = L.marker([validLat, validLng]).addTo(map);
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
  };

  const renderMarkers = (L, map) => {
    markersGroupRef.current.forEach(m => map.removeLayer(m));
    markersGroupRef.current = [];

    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds();
      let hasValidMarker = false;

      markers.forEach(m => {
        // Ensure lat/lng are valid numbers
        const mLat = parseFloat(m.lat);
        const mLng = parseFloat(m.lng);

        if (!isNaN(mLat) && !isNaN(mLng) && mLat !== 0 && mLng !== 0) {
          const marker = L.marker([mLat, mLng])
            .bindPopup(`<div class="text-sm"><b class="font-bold">${m.name}</b><br/>Status: ${m.status}</div>`)
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
const RichEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);

  const execCmd = (command) => {
    document.execCommand(command, false, null);
    editorRef.current.focus();
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (value === '') editorRef.current.innerHTML = '';
    }
  }, [value]);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-cyan-100 transition-all bg-white shadow-sm">
      <div className="bg-slate-50/50 p-2 flex gap-1 border-b border-slate-100 backdrop-blur-sm">
        <ToolButton onClick={() => execCmd('bold')} icon={Bold} title="Bold" />
        <ToolButton onClick={() => execCmd('italic')} icon={Italic} title="Italic" />
        <ToolButton onClick={() => execCmd('underline')} icon={Underline} title="Underline" />
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <ToolButton onClick={() => execCmd('insertOrderedList')} icon={ListOrdered} title="Poin Angka (Numbered List)" />
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <ToolButton onClick={() => execCmd('superscript')} icon={Superscript} title="Superscript" />
        <ToolButton onClick={() => execCmd('subscript')} icon={Subscript} title="Subscript" />
      </div>
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          className="w-full p-4 outline-none min-h-[120px] max-h-[300px] overflow-y-auto text-sm text-slate-700 leading-relaxed list-inside relative z-10"
          onInput={handleInput}
          suppressContentEditableWarning={true}
          style={{ whiteSpace: 'pre-wrap' }}
        />
        {!value && <div className="absolute top-4 left-4 text-slate-400 text-sm pointer-events-none z-0">{placeholder}</div>}
      </div>
    </div>
  );
};

const ToolButton = ({ onClick, icon: Icon, title }) => (
  <button onClick={(e) => { e.preventDefault(); onClick(); }} className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors" title={title}><Icon size={16} /></button>
);

// --- PROFILE COMPONENT ---
function ProfileSettings({ user, onUpdate, onCancel, showToast }) {
  const [formData, setFormData] = useState({
    name: user.name, username: user.username, email: user.email, phone: user.phone || '', password: user.password, photoUrl: user.photoUrl || '',
    bio: user.bio || ''
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(user.photoUrl || '');
  const [photoFile, setPhotoFile] = useState(null);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setPhotoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoBase64 = null;
      if (photoFile) {
        const reader = new FileReader();
        photoBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(photoFile);
        });
      }

      const payload = {
        ...formData,
        id: user.id, // Current User ID
        role: user.role, // Current Role
        photoBase64: photoBase64,
        mimeType: photoFile ? photoFile.type : null,
        // Include link_folder if available in user object to help backend place file
        link_folder: user.link_folder
      };

      const result = await callAPI('updateProfile', payload);

      // Update Local State in Parent
      // Ensure photoUrl is updated with the result from backend or the preview
      onUpdate({ ...formData, photoUrl: result.photoUrl || (photoBase64 ? preview : formData.photoUrl) });
      showToast('success', 'Profil Diperbarui', 'Data profil berhasil disimpan ke database.');
    } catch (err) {
      console.error(err);
      showToast('error', 'Gagal Memperbarui Profil', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card title="Pengaturan Profil Saya">
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
            <Input label="Nama Lengkap" name="name" value={formData.name} onChange={handleChange} />
            <Input label={user.role === 'student' ? 'NIM' : 'NIP / Username'} name="username" value={formData.username} onChange={handleChange} />
            <Input label="Alamat Email" name="email" type="email" value={formData.email} onChange={handleChange} />
            <Input label="Nomor Telepon" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="08123456789" />
            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-500 mb-2 ml-1">Bio / Uraian Singkat</label>
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
            <h4 className="font-bold text-slate-700 mb-2">Informasi Akademik</h4>
            {user.role === 'student' && (<div className="bg-slate-50 p-4 rounded-xl space-y-3 text-sm border border-slate-100"><div><span className="font-bold text-slate-500">Tempat Magang:</span><br />{user.internship_place}</div><div><span className="font-bold text-slate-500">Dosen Pembimbing:</span><br /><FormatText text={user.supervisor_internal} /></div></div>)}
            {user.role === 'lecturer' && (<div className="bg-slate-50 p-4 rounded-xl space-y-3 text-sm border border-slate-100"><div><span className="font-bold text-slate-500">Jabatan:</span> {user.jabatan}</div><div><span className="font-bold text-slate-500">Kelas Ampuan:</span> {user.classId || '-'}</div><div><span className="font-bold text-slate-500">Status:</span> Aktif</div></div>)}
          </div>
          <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>Batal</Button><Button type="submit" variant="primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button></div>
        </form>
      </Card>
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

  // Fetch Data on User Login/Load
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          // Identify ID to pass: NIM for student, ID/NIP for lecturer
          const idToPass = user.role === 'student' ? user.username : user.id;
          const fetchDashboardData = async (role, id) => {
            // Only fetch logbooks for now (centralized)
            // Both Student and Lecturer need logbooks
            // Student needs it for their history, Lecturer for monitoring
            try {
              const res = await fetch(`${GAS_URL}?action=getAllLogbooks`);
              const json = await res.json();
              if (json.status === 'success') {
                return json.data; // Returns all logbooks
              }
              return [];
            } catch (e) {
              console.error("Fetch Error", e);
              return [];
            }
          };
          const data = await fetchDashboardData(user.role, idToPass);

          if (data) {
            // Backend returns array of logbooks directly or object? 
            // handleGetDashboardData returns array (from handleGetAllLogbooks lines)
            // Let's check backend: returns allLogs (Array).
            if (Array.isArray(data)) {
              setLogbooks(data);
            } else if (data.logbooks) {
              setLogbooks(data.logbooks);
            }
          }
        } catch (err) {
          console.error("Failed to load dashboard data", err);
          showToast('error', 'Gagal Memuat Data', 'Tidak dapat mengambil data logbook terbaru.');
        }
      };
      loadData();
    }
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
      {view === 'student-dashboard' && user && <StudentDashboard user={user} onLogout={handleLogout} logbooks={logbooks} setLogbooks={setLogbooks} reports={reports} setReports={setReports} onUpdateProfile={handleProfileUpdate} showToast={showToast} />}
      {view === 'lecturer-dashboard' && user && <LecturerDashboard user={user} onLogout={handleLogout} logbooks={logbooks} setLogbooks={setLogbooks} reports={reports} onUpdateProfile={handleProfileUpdate} showToast={showToast} />}
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
function StudentDashboard({ user, onLogout, logbooks, setLogbooks, reports, setReports, onUpdateProfile, showToast }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition">{isMobileMenuOpen ? <X /> : <Menu />}</button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-xl z-40 rounded-b-3xl border-b border-slate-100 p-4">
          <nav className="flex flex-col gap-1">
            <NavItem id="overview" label="Overview" icon={LayoutDashboard} />
            <NavItem id="logbook" label="Isi Logbook" icon={MapPin} />
            <NavItem id="report" label="Kerjakan Laporan" icon={FileText} />
            <NavItem id="profile" label="Profil Saya" icon={User} />
            <div className="pt-4 mt-2 border-t border-slate-100"><Button variant="danger" onClick={onLogout} className="w-full justify-center">Keluar</Button></div>
          </nav>
        </div>
      )}

      <main className="flex-1 overflow-y-auto relative pt-24 md:pt-0">
        <div className="p-5 md:p-8 max-w-7xl mx-auto">
          {activeTab === 'overview' && <StudentOverview user={user} logbooks={logbooks} reports={reports} />}
          {activeTab === 'logbook' && <StudentLogbookForm user={user} logbooks={logbooks} setLogbooks={setLogbooks} showToast={showToast} />}
          {activeTab === 'report' && <StudentReportForm user={user} reports={reports} setReports={setReports} showToast={showToast} />}
          {activeTab === 'profile' && <ProfileSettings user={user} onUpdate={onUpdateProfile} onCancel={() => setActiveTab('overview')} showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}

function StudentOverview({ user, logbooks, reports }) {
  const myLogbooks = logbooks.filter(l => l.nim === user.username);
  const myReports = reports.filter(r => r.studentId === user.id);
  const lastLogbook = myLogbooks[myLogbooks.length - 1];
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-3xl font-bold text-slate-800 tracking-tight">Selamat Datang!</h1><p className="text-slate-500">Ringkasan aktivitas magang Anda.</p></div>
        <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 text-sm font-medium text-slate-600">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Statistik Kinerja">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-blue-600 uppercase w-full break-words leading-tight mb-2">Logbook</span>
              <div className="text-4xl font-black text-blue-700">{myLogbooks.length}</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl border border-cyan-100 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-cyan-600 uppercase w-full break-words leading-tight mb-2">Laporan</span>
              <div className="text-4xl font-black text-cyan-700">{myReports.length}</div>
            </div>
          </div>
        </Card>
        <Card title="Lokasi Terakhir">
          <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200">
            {lastLogbook ? <LeafletMap lat={lastLogbook.lat} lng={lastLogbook.lng} readOnly={true} /> : <div className="flex items-center justify-center h-full text-slate-400 text-sm">Belum ada data lokasi</div>}
            {lastLogbook && <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl text-xs shadow-lg border border-slate-100 z-[400]"><div className="font-bold text-slate-700 mb-1">Terakhir check-in:</div><div className="text-slate-500 truncate">{lastLogbook.address || 'Koordinat GPS'}</div></div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StudentLogbookForm({ user, logbooks, setLogbooks, showToast }) {
  const [lat, setLat] = useState(null); const [lng, setLng] = useState(null); const [address, setAddress] = useState('Menunggu GPS...'); const [accuracy, setAccuracy] = useState(null);

  const [status, setStatus] = useState('Hadir');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));

  const [activityHTML, setActivityHTML] = useState(''); const [outputHTML, setOutputHTML] = useState('');
  const [selfie, setSelfie] = useState(null);
  const [doc, setDoc] = useState(null);
  const [docMode, setDocMode] = useState(null);
  const [cameraActive, setCameraActive] = useState(false); const videoRef = useRef(null); const canvasRef = useRef(null);
  const [docCameraActive, setDocCameraActive] = useState(false); const docVideoRef = useRef(null); const docCanvasRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);
  const lastGeoUpdateRef = useRef(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setAddress("Browser ini tidak mendukung GPS.");
      return;
    }

    const successHandler = async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;

      // LOGIC LOCK: Jika address sudah terisi valid (bukan Menunggu/Gagal/Memuat), JANGAN update lagi otomatis.
      // Kecuali user menekan tombol Refresh (yang akan mereset address ke "Memperbarui lokasi..." dulu)
      if (address && !address.startsWith("Menunggu") && !address.startsWith("Gagal") && !address.startsWith("Memuat") && !address.startsWith("Browser")) {
        return;
      }

      setLat(latitude);
      setLng(longitude);
      setAccuracy(accuracy);

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
      if (err.code === 1) msg = "Izin lokasi ditolak. Mohon aktifkan izin lokasi di browser.";
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

    showToast('info', 'Mencari Lokasi...', 'Sedang memaksa update posisi GPS...');
    // Reset address ke status loading agar watch/getCurrentPosition bisa update lagi
    setAddress("Memperbarui lokasi...");
    setLat(null); // Reset coords visual

    const success = async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      setLat(latitude);
      setLng(longitude);
      setAccuracy(accuracy);

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
        const data = await res.json();

        if (data && data.address) {
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
          setAddress(data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
      } catch {
        setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
      showToast('success', 'Lokasi Terkini', `Akurasi: ±${Math.round(accuracy)}m`);
    };

    const error = (err) => {
      // If High Accuracy failed, try Low Accuracy
      if (err.code === 3 || err.message.includes("Timeout")) {
        console.warn("High accuracy timed out, trying low accuracy...");
        navigator.geolocation.getCurrentPosition(success, (err2) => {
          let msg = err2.message;
          if (err2.code === 1) msg = "Izin lokasi ditolak!";
          else if (err2.code === 2) msg = "GPS mati / tidak tersedia.";
          else if (err2.code === 3) msg = "Timeout! Sinyal GPS lemah.";
          showToast('error', 'Gagal', msg);
          setAddress("Gagal: " + msg);
        }, { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 });
      } else {
        let msg = err.message;
        if (err.code === 1) msg = "Izin lokasi ditolak!";
        else if (err.code === 2) msg = "GPS mati / tidak tersedia.";
        showToast('error', 'Gagal', msg);
        setAddress("Gagal: " + msg);
      }
    };

    // Try High Accuracy First (20s timeout)
    navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  };

  const startCamera = async () => { setCameraActive(true); try { const stream = await navigator.mediaDevices.getUserMedia({ video: true }); if (videoRef.current) videoRef.current.srcObject = stream; } catch { showToast('error', 'Kamera Error', 'Akses kamera ditolak/gagal'); setCameraActive(false); } };
  const takePhoto = () => { const video = videoRef.current; const canvas = canvasRef.current; if (video && canvas) { canvas.width = video.videoWidth; canvas.height = video.videoHeight; canvas.getContext('2d').drawImage(video, 0, 0); setSelfie(canvas.toDataURL('image/png')); video.srcObject.getTracks().forEach(t => t.stop()); setCameraActive(false); showToast('success', 'Foto Tersimpan', 'Foto selfie berhasil diambil.'); } };

  const startDocCamera = async () => { setDocCameraActive(true); try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); if (docVideoRef.current) docVideoRef.current.srcObject = stream; } catch { showToast('error', 'Kamera Error', 'Gagal akses kamera belakang'); setDocCameraActive(false); } };
  const takeDocPhoto = () => { const video = docVideoRef.current; const canvas = docCanvasRef.current; if (video && canvas) { canvas.width = video.videoWidth; canvas.height = video.videoHeight; canvas.getContext('2d').drawImage(video, 0, 0); const fileData = canvas.toDataURL('image/jpeg'); fetch(fileData).then(res => res.blob()).then(blob => { const file = new File([blob], "doc_camera.jpg", { type: "image/jpeg" }); setDoc(file); showToast('success', 'Dokumen Tersimpan', 'Foto dokumen berhasil diambil.'); }); video.srcObject.getTracks().forEach(t => t.stop()); setDocCameraActive(false); setDocMode(null); } };

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

    if (!lat || !selfie || cleanActivity.length === 0 || cleanOutput.length === 0) {
      showToast('warning', 'Data Belum Lengkap', 'Mohon lengkapi: Lokasi, Selfie, Kegiatan, dan Output.');
      return;
    }

    showToast('info', 'Mengirim Data...', 'Mohon tunggu sebentar.');

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
      activity: activityHTML,
      output: outputHTML,
      selfieBase64: selfie, // Kirim base64
      docBase64: doc ? await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r(reader.result); reader.readAsDataURL(doc); }) : null
    };

    try {
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
      {previewImage && <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />}
      <Card title="Formulir Logbook Harian">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-1 rounded-2xl border border-slate-200 flex flex-col h-full">
              <div className="bg-white rounded-xl overflow-hidden h-64 relative z-0 flex-1"><LeafletMap lat={lat} lng={lng} setLat={setLat} setLng={setLng} setAddress={setAddress} /></div>
              <Button onClick={getLocation} variant="secondary" className="w-full mt-2 py-3 border-cyan-200 text-cyan-700 hover:bg-cyan-50 font-bold shadow-sm">↻ Refresh Lokasi</Button>
              <div className="p-4"><div className="flex items-start gap-3"><MapPin className="text-cyan-600 mt-1 shrink-0" size={20} /><div><p className="font-bold text-slate-700 text-sm leading-snug">{address}</p><p className="text-xs text-slate-500 mt-1 font-mono">{lat ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : "Mencari kordinat..."}</p>{accuracy && <p className="text-[10px] text-green-600">Akurasi GPS: ±{Math.round(accuracy)} meter</p>}</div></div></div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center flex flex-col justify-center h-full">
              <h4 className="font-bold text-slate-700 mb-4 flex items-center justify-center gap-2"><Camera size={18} /> Foto Selfie (Wajib)</h4>
              {selfie ? (
                <div className="relative inline-block group cursor-pointer" onClick={() => setPreviewImage(selfie)}>
                  <img src={selfie} className="w-full max-h-64 object-cover rounded-xl shadow-md mx-auto hover:opacity-90 transition-opacity" alt="Selfie" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white font-bold"><Eye size={24} className="mr-2" /> Lihat Full</div>
                  <button onClick={(e) => { e.stopPropagation(); setSelfie(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow hover:bg-red-600 transition"><X size={14} /></button>
                </div>
              ) : cameraActive ? (
                <div className="space-y-3">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-xl object-cover mx-auto" />
                  <canvas ref={canvasRef} className="hidden" />
                  <Button onClick={takePhoto} className="w-full">Ambil Foto</Button>
                </div>
              ) : (
                <Button onClick={startCamera} variant="secondary" className="w-full py-12 border-dashed border-2 flex flex-col gap-2 h-full"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2"><Camera size={32} className="text-slate-400" /></div><span className="text-slate-500 font-medium">Buka Kamera Depan</span></Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative z-30">
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

          <div className="relative z-10"><label className="block text-sm font-bold text-slate-700 mb-2">Kegiatan yang Dilakukan</label><RichEditor value={activityHTML} onChange={setActivityHTML} placeholder="Ketik di sini... (Bisa ditebalkan, miring, garis bawah, dan poin angka)" /></div>
          <div className="relative z-10"><label className="block text-sm font-bold text-slate-700 mb-2">Output yang Dihasilkan</label><RichEditor value={outputHTML} onChange={setOutputHTML} placeholder="Hasil kerja yang dicapai..." /></div>
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
                  <div className="text-center space-y-3">{docCameraActive ? (<><video ref={docVideoRef} autoPlay playsInline className="w-full max-h-64 bg-black rounded-lg object-cover" /><canvas ref={docCanvasRef} className="hidden" /><Button onClick={takeDocPhoto} className="w-full">Ambil Foto Dokumen</Button></>) : (<div className="py-8"><Button onClick={startDocCamera} className="w-full">Mulai Kamera Belakang</Button></div>)}</div>
                )}
              </div>
            )}
          </div>
          <Button onClick={handleSubmit} className="w-full py-4 text-lg mt-4 shadow-xl shadow-cyan-500/20 relative z-10">Kirim Logbook</Button>
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `${GAS_URL}?action=getAllLogbooks`; // Special Endpoint
        const res = await fetch(url);
        const result = await res.json();
        if (result.status === 'success') {
          setLogbooks(result.data);

          // Derive unique students from logbooks for mapping
          const uniqueStudents = [];
          const seenNims = new Set();

          result.data.forEach(log => {
            if (log.nim && !seenNims.has(log.nim)) {
              seenNims.add(log.nim);
              uniqueStudents.push({
                id: log.studentId || log.nim,
                name: log.name,
                username: log.nim,
                class: log.class,
                lastLogbook: log.date + ' ' + log.time
              });
            }
          });
          setStudents(uniqueStudents);
        }

      } catch (e) {
        console.error(e);
      }
    };
    if (!GAS_URL.includes("MASUKKAN")) fetchData();
  }, [setLogbooks]);

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
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition">{isMobileMenuOpen ? <X /> : <Menu />}</button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-xl z-40 rounded-b-3xl border-b border-slate-100 p-4">
          <nav className="flex flex-col gap-1">
            <NavItem id="overview" label="Overview" icon={LayoutDashboard} />
            <NavItem id="logbooks" label="Logbook Mahasiswa" icon={MapPin} />
            <NavItem id="grading" label="Nilai Tugas" icon={FileText} />
            <NavItem id="profile" label="Profil Saya" icon={User} />
            <div className="pt-4 mt-2 border-t border-slate-100"><Button variant="danger" onClick={onLogout} className="w-full justify-center">Keluar</Button></div>
          </nav>
        </div>
      )}

      <main className="flex-1 overflow-y-auto relative pt-24 md:pt-0">
        <div className="p-5 md:p-8 max-w-7xl mx-auto">
          {activeTab === 'overview' && <LecturerOverview students={students} logbooks={logbooks} reports={reports} />}
          {activeTab === 'logbooks' && <LecturerLogbookView logbooks={logbooks} students={students} />}
          {activeTab === 'grading' && <LecturerGrading reports={reports} showToast={showToast} />}
          {activeTab === 'profile' && <ProfileSettings user={user} onUpdate={onUpdateProfile} onCancel={() => setActiveTab('overview')} showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}

function LecturerOverview({ students, logbooks, reports }) {
  const submitted = reports.length; const total = students.length;

  const studentMarkers = students.map(s => {
    const studentLogbooks = logbooks.filter(l => l.studentId === s.id);
    const lastLog = studentLogbooks[studentLogbooks.length - 1];
    if (lastLog && lastLog.lat && lastLog.lng) {
      return { lat: lastLog.lat, lng: lastLog.lng, name: s.name, status: lastLog.status };
    }
    return null;
  }).filter(m => m !== null);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 relative overflow-visible" title="Peta Sebaran Mahasiswa">
          <div className="h-80 bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200">
            <LeafletMap readOnly={true} markers={studentMarkers} />
            <LeafletMap readOnly={true} markers={studentMarkers} />
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

function LecturerLogbookView({ logbooks, students }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [detailModal, setDetailModal] = useState({ show: false, title: '', content: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [dateFilter, setDateFilter] = useState('today'); // Default: Hari Ini (Updated per request)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Filter & Sort Logic
  const filteredLogbooks = logbooks.filter(log => {
    // 1. Filter Search Term
    let matchesSearch = true;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      matchesSearch = (
        (log.name && log.name.toLowerCase().includes(term)) ||
        (log.nim && log.nim.toLowerCase().includes(term)) ||
        (log.activity && log.activity.toLowerCase().includes(term)) ||
        (log.output && log.output.toLowerCase().includes(term)) ||
        (log.address && log.address.toLowerCase().includes(term)) ||
        (log.date && log.date.includes(term))
      );
    }

    // 2. Filter Date Range
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const logDate = new Date(log.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(logDate.getTime())) {
        matchesDate = false;
      } else {
        logDate.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today - logDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === 'today') matchesDate = diffDays === 0;
        else if (dateFilter === '3days') matchesDate = diffDays <= 3;
        else if (dateFilter === '7days') matchesDate = diffDays <= 7;
      }
    }

    return matchesSearch && matchesDate;
  }).sort((a, b) => {
    // Default Sort by Timestamp (Date + Time)
    const timeA = new Date(a.date + ' ' + a.time).getTime();
    const timeB = new Date(b.date + ' ' + b.time).getTime();

    switch (sortOrder) {
      case 'newest': return timeB - timeA;
      case 'oldest': return timeA - timeB;
      case 'date_newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date_oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {previewImage && <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />}
      {detailModal.show && <TextModal title={detailModal.title} content={detailModal.content} onClose={() => setDetailModal({ show: false, title: '', content: '' })} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Logbook Mahasiswa</h2>
          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 bg-cyan-50 rounded-full border border-cyan-100 text-sm font-bold text-cyan-700">{filteredLogbooks.length} Entri</span>
            <span className="text-slate-400 text-sm">Halaman {currentPage} dari {totalPages || 1}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group">
            <input
              type="text"
              placeholder="Cari Mahasiswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 outline-none w-full sm:w-64 transition-all font-medium text-slate-700"
            />
            <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors"><Search size={20} /></div>
          </div>

          {/* Custom Dropdown - Date */}
          <CustomDropdown
            value={dateFilter}
            onChange={setDateFilter}
            icon={Calendar}
            options={[
              { value: 'today', label: 'Hari Ini' },
              { value: '3days', label: '3 Hari Terakhir' },
              { value: '7days', label: '7 Hari Terakhir' },
              { value: 'all', label: 'Semua Waktu' }
            ]}
          />

          {/* Custom Dropdown - Sort */}
          <CustomDropdown
            value={sortOrder}
            onChange={setSortOrder}
            icon={ListOrdered}
            options={[
              { value: 'newest', label: 'Terbaru' },
              { value: 'oldest', label: 'Terlama' },
              { value: 'date_newest', label: 'Tgl Terbaru' },
              { value: 'date_oldest', label: 'Tgl Terlama' }
            ]}
          />
        </div>
      </div>

      {/* MAP REMOVED AS REQUESTED */}

      {/* Desktop View: Table */}
      <div className="hidden md:block bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs text-center">Foto Selfie</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs">Nama Lengkap Mahasiswa</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs">Tanggal Absensi</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs">Jam Absensi</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs">Status Kehadiran</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs w-1/5">Kegiatan yang Dilakukan</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs w-1/5">Output yang Dihasilkan</th>
              <th className="p-5 font-bold text-slate-400 uppercase tracking-wider text-xs text-center">Dokumentasi Tambahan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentItems.map(log => (
              <tr key={log.id} className="hover:bg-cyan-50/30 transition-colors group">
                <td className="p-5 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm mx-auto cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setPreviewImage(log.selfieUrl)}
                  >
                    <img src={log.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="p-5">
                  <div className="font-bold text-slate-800">{log.name}</div>
                  <div className="text-xs text-slate-400 font-mono mt-1">{log.nim} • {log.class || '-'}</div>
                </td>
                <td className="p-5 font-medium text-slate-600">
                  {log.date}
                </td>
                <td className="p-5 font-mono text-slate-500">
                  {log.time}
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide ${log.status === 'Hadir' ? 'bg-green-100 text-green-700' : log.status === 'Sakit' ? 'bg-red-100 text-red-700' : log.status === 'Izin' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                    {log.status}
                  </span>
                </td>
                <td className="p-5 align-top">
                  <div className="line-clamp-2 text-slate-600 text-xs mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: displayRichText(log.activity) }} />
                  <button onClick={() => setDetailModal({ show: true, title: 'Detail Kegiatan', content: displayRichText(log.activity) })} className="text-xs font-bold text-cyan-600 hover:text-cyan-800 hover:underline">Lihat Selengkapnya</button>
                </td>
                <td className="p-5 align-top">
                  <div className="line-clamp-2 text-slate-600 text-xs mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: displayRichText(log.output) }} />
                  <button onClick={() => setDetailModal({ show: true, title: 'Detail Output', content: displayRichText(log.output) })} className="text-xs font-bold text-cyan-600 hover:text-cyan-800 hover:underline">Lihat Selengkapnya</button>
                </td>
                <td className="p-5 text-center">
                  {log.docUrl ? (
                    <div
                      className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mx-auto shadow-sm cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setPreviewImage(log.docUrl)}
                    >
                      <img src={log.docUrl} alt="Dokumen" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <span className="text-slate-300 text-xs italic">Tidak ada</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
        {currentItems.map(log => (
          <div key={log.id} className="bg-white rounded-[2rem] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col gap-5">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
              <div
                className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner cursor-pointer"
                onClick={() => setPreviewImage(log.selfieUrl)}
              >
                <img src={log.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-800 leading-tight truncate">{log.name}</h3>
                <p className="text-slate-500 text-xs font-mono mt-1">{log.nim}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${log.status === 'Hadir' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{log.status}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{log.date} {log.time}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
              <MapPin size={18} className="text-cyan-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-700 leading-snug">{log.address || 'Alamat tidak terdeteksi'}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">{typeof log.lat === 'number' ? `${log.lat}, ${log.lng}` : 'No GPS'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDetailModal({ show: true, title: 'Detail Kegiatan', content: displayRichText(log.activity) })} className="p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition text-center">Lihat Kegiatan</button>
              <button onClick={() => setDetailModal({ show: true, title: 'Detail Output', content: displayRichText(log.output) })} className="p-3 bg-cyan-50 text-cyan-700 rounded-xl text-xs font-bold hover:bg-cyan-100 transition text-center">Lihat Output</button>
            </div>

            {log.docUrl && (
              <button onClick={() => setPreviewImage(log.docUrl)} className="w-full py-3 border border-slate-200 rounded-xl text-slate-600 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50">
                <FileText size={16} /> Lihat Dokumentasi Tambahan
              </button>
            )}
          </div>
        ))}
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

          <div className="hidden sm:flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${currentPage === number ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white transform scale-105' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {number}
              </button>
            ))}
          </div>
          <span className="sm:hidden font-bold text-slate-600 text-sm">Halaman {currentPage}</span>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
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
// End of file
