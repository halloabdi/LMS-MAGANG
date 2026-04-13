import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, FileEdit, History, Wallet, Receipt,
  BookOpen, Bell, User, LogOut, ChevronRight, Activity,
  AlertTriangle, Settings, Newspaper, UserCog, Edit,
  Save, Trash2, MoreVertical, X, Check, Search, ChevronDown, Plus, Eye, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import HitungIPTernak from './HitungIPTernak';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbySu3THdMbdj61t2jhA-d-ICbvE7Dn6L82NQQrscfx56InSfINq8L0rRMuDJpqqfCOV/exec';

const formatIndoNumber = (numStr) => {
  const num = Number(numStr) || 0;
  if (num >= 1e12) return (num / 1e12).toFixed(1) + ' Tr';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + ' M';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + ' Jt';
  return num.toLocaleString('id-ID'); // Tidak disingkat untuk Ribuan (Rb)
};

const formatRupiahFull = (num) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

const parseIndoDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
  // Fallback for DD/MM/YYYY HH:mm format if natively unparseable
  const parts = String(dateStr).split(/[ \/:]+/);
  if (parts.length >= 5) {
    const nd = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4]);
    if (!isNaN(nd.getTime())) {
      return nd.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  }
  return dateStr;
};

// --- MODERN DROP DOWN ---
const ModernSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer flex justify-between items-center font-medium"
      >
        <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>{value || placeholder}</span>
        <ChevronDown size={18} className={`transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180 text-green-500' : ''}`} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => { onChange(opt.value || opt); setIsOpen(false); }}
                  className="px-4 py-3 hover:bg-green-50 hover:text-green-700 dark:hover:bg-gray-700 cursor-pointer text-sm font-medium transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                >
                  {opt.label || opt}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const storedUser = localStorage.getItem('satuternak_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      window.location.hash = '';
      window.location.pathname = '/';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('satuternak_user');
    window.location.hash = '';
    window.location.pathname = '/';
  };

  if (!user) return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>;

  const isModerator = user?.Role === 'Moderator';

  const TAB_MENUS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'input-rekording', label: 'Input Rekording', icon: FileEdit },
    { id: 'riwayat-rekording', label: 'Riwayat Rekording', icon: History },
    { id: 'input-usaha', label: 'Input Usaha', icon: Wallet },
    { id: 'riwayat-usaha', label: 'Riwayat Usaha', icon: Receipt },
    { id: 'perpustakaan', label: 'Perpustakaan', icon: BookOpen },
    { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
  ];
  if (isModerator) {
    TAB_MENUS.push({ id: 'kelola-anggota', label: 'Kelola Anggota', icon: UserCog });
    TAB_MENUS.push({ id: 'kelola-berita', label: 'Kelola Berita', icon: Newspaper });
  }
  TAB_MENUS.push({ id: 'profil', label: 'Profil Saya', icon: User });

  const MOBILE_FRONT_MENUS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'input-rekording', label: 'Input R krd', icon: FileEdit },
    { id: 'lainnya', label: 'Lainnya', icon: LayoutGrid },
    { id: 'input-usaha', label: 'Input Ush', icon: Wallet },
    { id: 'profil', label: 'Profil Saya', icon: User }
  ];

  const HIDDEN_MENUS = TAB_MENUS.filter(m => !['overview', 'input-rekording', 'input-usaha', 'profil'].includes(m.id));

  const navItemClass = (id) => `
    flex items-center gap-3 px-4 py-3 rounded-2xl md:rounded-xl transition-all cursor-pointer font-semibold w-full
    ${activeTab === id
      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
  `;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 font-['Poppins']">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed h-full z-20">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex flex-shrink-0 items-center justify-center text-white font-bold text-xl shadow-lg">S</div>
            <span className="font-extrabold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">SATUTERNAK</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            {user['Foto Profil'] && user['Foto Profil'] !== '-' ? (
              <img src={user['Foto Profil']} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-gray-700" alt="Avatar" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex flex-shrink-0 items-center justify-center text-green-700 dark:text-green-400 font-bold text-xl uppercase">
                {user['Nama Lengkap']?.charAt(0)}
              </div>
            )}
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">{user['Nama Lengkap']}</h3>
              <p className="text-xs font-semibold text-green-600 dark:text-green-400">{user.Role}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 pb-24">
          <div className="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-2 mb-2">Menu Utama</div>
          {TAB_MENUS.map(menu => (
            <button key={menu.id} onClick={() => setActiveTab(menu.id)} className={navItemClass(menu.id)}>
              <menu.icon className={activeTab === menu.id ? 'text-white' : ''} size={20} />
              <span className="text-sm">{menu.label}</span>
            </button>
          ))}

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-semibold w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
              <LogOut size={20} />
              <span className="text-sm">Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 w-full pb-24 md:pb-0 transition-all duration-300">
        <div className="md:hidden sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-30 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600 tracking-tighter">SatuTernak</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{user['Nama Lengkap']}</div>
              <div className="text-[10px] font-semibold text-green-600">{user.Role}</div>
            </div>
            {user['Foto Profil'] && user['Foto Profil'] !== '-' ? (
              <img src={user['Foto Profil']} className="w-8 h-8 rounded-lg object-cover" alt="Avatar" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm uppercase">
                {user['Nama Lengkap']?.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white capitalize">{activeTab.replace('-', ' ')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mt-1">Kelola data peternakan Anda dengan mudah dan cepat.</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewView user={user} setTab={setActiveTab} />}
              {activeTab === 'input-rekording' && <InputRekordingView user={user} />}
              {activeTab === 'riwayat-rekording' && <RiwayatRekordingView user={user} />}
              {activeTab === 'input-usaha' && <InputUsahaView user={user} />}
              {activeTab === 'riwayat-usaha' && <RiwayatUsahaView user={user} />}
              {activeTab === 'perpustakaan' && <div className="p-10 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">Modul Perpustakaan Segera Hadir</div>}
              {activeTab === 'notifikasi' && <NotifikasiView user={user} isModerator={isModerator} />}
              {activeTab === 'kelola-anggota' && isModerator && <KelolaAnggotaView user={user} />}
              {activeTab === 'kelola-berita' && isModerator && <KelolaBeritaView user={user} />}
              {activeTab === 'profil' && <ProfilView user={user} setUser={setUser} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pb-safe z-40">
        <div className="flex justify-around items-center px-1 py-1 pb-4">
          {MOBILE_FRONT_MENUS.map(menu => (
            <button
              key={menu.id}
              onClick={() => {
                if (menu.id === 'lainnya') {
                  setShowMobileMenu(true);
                } else {
                  setActiveTab(menu.id);
                  setShowMobileMenu(false);
                }
              }}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all
                ${(activeTab === menu.id || (menu.id === 'lainnya' && showMobileMenu)) ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}
              `}
            >
              <menu.icon size={22} className={(activeTab === menu.id || (menu.id === 'lainnya' && showMobileMenu)) ? '-translate-y-0.5 transition-transform' : ''} />
              <span className="text-[9px] font-bold mt-1 text-center leading-tight truncate w-full px-1">{menu.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Popup Menu (Lainnya) */}
      <AnimatePresence>
        {showMobileMenu && (
          <div className="md:hidden fixed inset-0 z-[110] flex flex-col justify-end items-center pointer-events-none pb-[5.5rem] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto"
              onClick={() => setShowMobileMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border border-gray-200/60 dark:border-gray-700/60 p-2 flex flex-col gap-1 w-64 pointer-events-auto z-10 mb-2"
            >
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-1 flex items-center justify-center">
                <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Menu Lainnya</span>
              </div>
              {HIDDEN_MENUS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setActiveTab(m.id); setShowMobileMenu(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${activeTab === m.id ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'hover:bg-gray-100/80 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}
                >
                  <m.icon size={20} className={activeTab === m.id ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'} />
                  <span className="font-bold text-xs">{m.label}</span>
                </button>
              ))}
              <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div>
              <button
                onClick={() => { setShowMobileMenu(false); handleLogout(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={20} />
                <span className="font-bold text-xs">Keluar</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// OVERVIEW VIEW 
// ==========================================
const OverviewView = ({ user, setTab }) => {
  const [summary, setSummary] = useState({ populasi: 0, aset: 0 });

  useEffect(() => {
    Promise.all([
      fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'getRekording', userId: user['ID Akun'], role: user.Role }) }).then(r => r.json()),
      fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsaha', userId: user['ID Akun'], role: user.Role }) }).then(r => r.json())
    ]).then(([resRek, resUsh]) => {
      let pop = 0;
      let asset = 0;

      const safeParse = val => {
        if (!val || val === '-') return 0;
        const parsed = Number(String(val).replace(/[^0-9.-]+/g, ""));
        return isNaN(parsed) ? 0 : parsed;
      };

      if (resRek.status === 'success') {
        resRek.data.forEach(r => {
          // Menghitung Populasi Aktif (Awal + Penambahan - Kematian) dengan aman
          pop += safeParse(r['Jumlah Populasi Awal Masuk Ternak']);
          pop += safeParse(r['Jumlah Penambahan Populasi Ternak']);
          pop -= safeParse(r['Jumlah Kematian Ternak']);
        });
      }
      if (resUsh.status === 'success') {
        resUsh.data.forEach(r => {
          // Cari kolom Tipe Arus Kas dan Total Transaksi secara dinamis/kasar
          let kasType = String(r['Tipe Arus Kas'] || '').toLowerCase();
          let amountStr = String(r['Total Harga Transaksi'] || r['Total Transaksi (Kotor)'] || r['Total Transaksi (Jenis Aset)'] || r['Total Transaksi'] || r['Total Dasar'] || 0);

          if (!amountStr || amountStr === '0' || amountStr.trim() === '-') {
            let trKey = Object.keys(r).find(k => k.toLowerCase().includes('total transaksi'));
            if (trKey) amountStr = String(r[trKey]);
          }
          let amount = safeParse(amountStr);

          if (kasType.includes('pemasukan')) asset += amount;
          else if (kasType.includes('pengeluaran')) asset -= amount;
        });
      }
      setSummary({ populasi: pop, aset: asset });
    }).catch(console.error);
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => setTab('riwayat-rekording')}
          className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg cursor-pointer transform hover:scale-[1.02] transition-transform relative group overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={100} /></div>
          <h3 className="font-bold mb-1 opacity-80">Populasi Aktif</h3>
          <p className="text-4xl font-extrabold font-['Poppins'] tracking-tight">{Number(summary.populasi).toLocaleString('id-ID')} <span className="text-lg opacity-80 font-medium">Ekor</span></p>
          <p className="text-xs opacity-70 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">Klik Lihat Rincian Rekording <ChevronRight size={14} /></p>
        </div>

        <div
          onClick={() => setTab('riwayat-usaha')}
          className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl p-6 text-white shadow-lg cursor-pointer transform hover:scale-[1.02] transition-transform relative group overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity"><Wallet size={100} /></div>
          <h3 className="font-bold mb-1 opacity-80">Perkiraan Nilai Aset</h3>
          <p className="text-3xl font-extrabold font-['Poppins']">Rp {formatIndoNumber(summary.aset)}</p>
          <p className="text-xs opacity-70 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">Klik Lihat Arus Kas <ChevronRight size={14} /></p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Peringatan Sistem</h3>
            <p className="text-sm text-gray-500 mt-1">Data sinkronisasi realtime aktif. Format kurensi mematuhi SNI.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Activity className="text-green-500" /> Ringkasan Operasional</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-400 font-medium">Data grafis interaktif segera hadir!</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// INPUT VIEWS 
// ==========================================
const InputRekordingView = ({ user }) => {
  const [form, setForm] = useState({ 
    jenis: '', 
    tanggal: new Date(), 
    jam: new Date().getHours().toString().padStart(2, '0'),
    menit: new Date().getMinutes().toString().padStart(2, '0'),
    jenisHewan: '', 
    jumlah: '', 
    keterangan: '',
    satuanPakan: 'Kg',
    beratSak: '50',
    bobotMode: 'RataRata',
    bobotRata: '',
    bobotSamples: ['', '', '']
  });
  const [loading, setLoading] = useState(false);

  const HOURS = Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'));
  const MINUTES = Array.from({length: 60}, (_, i) => String(i).padStart(2, '0'));

  const getAverageBobot = () => {
    const valid = form.bobotSamples.map(Number).filter(n => n > 0);
    if (valid.length === 0) return 0;
    return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2);
  };

  const handleAddSample = () => setForm({...form, bobotSamples: [...form.bobotSamples, '']});
  const handleRemoveSample = (index) => {
    if (form.bobotSamples.length > 3) {
      const newSamples = [...form.bobotSamples];
      newSamples.splice(index, 1);
      setForm({...form, bobotSamples: newSamples});
    } else {
      alert("Minimal 3 sampel ekor diperlukan untuk rata-rata valid!");
    }
  };
  const handleSampleChange = (index, val) => {
    const newSamples = [...form.bobotSamples];
    newSamples[index] = val;
    setForm({...form, bobotSamples: newSamples});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.jenis || !form.jenisHewan) return alert("Pilih evaluasi dan jenis ternak!");
    if (form.jenis !== 'Pencatatan Bobot Badan' && !form.jumlah) return alert("Harap isikan jumlah!");
    setLoading(true);

    const ds = form.tanggal instanceof Date ? form.tanggal : new Date();
    ds.setHours(parseInt(form.jam, 10));
    ds.setMinutes(parseInt(form.menit, 10));

    const localIsoString = new Date(ds.getTime() - ds.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    let submitPayload = {
      "TimeStamp": localIsoString,
      "ID Akun": user['ID Akun'],
      "Username": user['Username'],
      "Nama Lengkap": user['Nama Lengkap'],
      "Role": user.Role,
      "Jenis Ternak": form.jenisHewan,
      "Catatan Kondisi Ternak": form.keterangan || '-',
      "Keterangan Tambahan": form.keterangan || '-',
      "Jenis Evaluasi": form.jenis
    };

    let finalJumlah = Number(form.jumlah) || 0;
    if ((form.jenis === 'Pemberian Pakan' || form.jenis === 'Stok Gudang') && form.satuanPakan === 'Sak') {
       finalJumlah = finalJumlah * (Number(form.beratSak) || 0);
    }

    if (form.jenis === 'Pencatatan Bobot Badan') {
      let bobotRataPayload = "";
      let bobotSamplesPayload = "";
      if (form.bobotMode === 'RataRata') {
        if (!form.bobotRata) { setLoading(false); return alert("Harap isikan nilai Rata-rata bobot!"); }
        bobotRataPayload = form.bobotRata;
      } else {
        const valid = form.bobotSamples.map(Number).filter(n => n > 0);
        if (valid.length < 3) { setLoading(false); return alert("Minimal 3 sampel bobot valid diperlukan!"); }
        bobotRataPayload = getAverageBobot();
        bobotSamplesPayload = valid.join(', ');
      }
      submitPayload["Bobot Badan Rata-Rata Keseluruhan dari Total Populasi"] = bobotRataPayload;
      if (bobotSamplesPayload) submitPayload["Bobot Badan Per Ekor"] = bobotSamplesPayload;
    } else {
      if (form.jenis === 'Populasi Awal Masuk') submitPayload["Jumlah Populasi Awal Masuk Ternak"] = finalJumlah;
      else if (form.jenis === 'Penambahan Populasi Ternak') submitPayload["Jumlah Penambahan Populasi Ternak"] = finalJumlah;
      else if (form.jenis === 'Kematian Ternak (Mortalitas)') submitPayload["Jumlah Kematian Ternak"] = finalJumlah;
      else if (form.jenis === 'Program Vaksinasi') submitPayload["Jumlah Ternak Di Vaksin"] = finalJumlah;
      else if (form.jenis === 'Pemberian Pakan') submitPayload["Jumlah Pemberian Pakan (Kg)"] = finalJumlah;
      else if (form.jenis === 'Stok Gudang') submitPayload["Jumlah Stok Gudang (Kg)"] = finalJumlah;
      else submitPayload["Jumlah Ekor Terdampak"] = finalJumlah;
    }

    fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addRekording",
        payload: submitPayload
      })
    })
      .then(r => r.json()).then(res => {
        if (res.status === 'success') { 
          alert("Pencatatan Berhasil Disimpan!"); 
          setForm({ 
            jenis: '', 
            tanggal: new Date(), 
            jam: new Date().getHours().toString().padStart(2, '0'),
            menit: new Date().getMinutes().toString().padStart(2, '0'),
            jenisHewan: '', 
            jumlah: '', 
            keterangan: '',
            satuanPakan: 'Kg',
            beratSak: '50',
            bobotMode: 'RataRata',
            bobotRata: '',
            bobotSamples: ['', '', '']
          }); 
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative z-10">
      <h3 className="text-xl font-bold mb-6">Pencatatan Ternak Harian</h3>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-[60]">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Pilih Tanggal</label>
            <DatePicker
              selected={form.tanggal instanceof Date ? form.tanggal : new Date()}
              onChange={(date) => setForm({ ...form, tanggal: date })}
              dateFormat="d MMMM yyyy"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium cursor-pointer relative z-[60]"
              calendarClassName="modern-datepicker-calendar"
              wrapperClassName="w-full relative z-[60]"
              popperPlacement="bottom-start"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Pilih Jam</label>
            <div className="flex gap-2 relative z-[60]">
              <div className="w-1/2">
                <ModernSelect
                  value={form.jam}
                  onChange={(v) => setForm({ ...form, jam: v })}
                  options={HOURS}
                  placeholder="Jam"
                />
              </div>
              <div className="flex items-center text-gray-400 font-bold">:</div>
              <div className="w-1/2">
                <ModernSelect
                  value={form.menit}
                  onChange={(v) => setForm({ ...form, menit: v })}
                  options={MINUTES}
                  placeholder="Menit"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 relative z-[50]">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Jenis Evaluasi</label>
            <ModernSelect
               value={form.jenis}
               onChange={(v) => setForm({ ...form, jenis: v })}
               options={['Populasi Awal Masuk', 'Penambahan Populasi Ternak', 'Kematian Ternak (Mortalitas)', 'Program Vaksinasi', 'Pencatatan Bobot Badan', 'Pemberian Pakan', 'Stok Gudang', 'Lainnya']}
               placeholder="- Pilih Kejadian -"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Jenis Ternak</label>
            <input type="text" required value={form.jenisHewan} onChange={e => setForm({ ...form, jenisHewan: e.target.value })} placeholder="Cth: Sapi Potong / Kambing" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium cursor-text" />
          </div>
          {form.jenis !== 'Pencatatan Bobot Badan' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                {(form.jenis === 'Pemberian Pakan' || form.jenis === 'Stok Gudang') ? "Jumlah Kuantitas" : "Jumlah Ekor Terkait Kejadian"}
              </label>
              <div className="flex gap-2">
                <input type="number" required={form.jenis !== 'Pencatatan Bobot Badan'} value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} placeholder="Cth: 10" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium flex-1 cursor-text" />
                
                {(form.jenis === 'Pemberian Pakan' || form.jenis === 'Stok Gudang') && (
                  <div className="w-[120px] relative z-[40]">
                    <ModernSelect 
                      value={form.satuanPakan} 
                      onChange={v => setForm({...form, satuanPakan: v})} 
                      options={['Kg', 'Sak']} 
                      placeholder="Satuan" 
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <AnimatePresence>
            {form.jenis === 'Pencatatan Bobot Badan' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden md:col-span-2">
                <div className="p-5 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 mt-1 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Metode Pencatatan Bobot</label>
                    <div className="w-full relative z-[45]">
                      <ModernSelect value={form.bobotMode === 'RataRata' ? 'Isi Rata-rata Langsung' : 'Hitung dari Sampel Per Ekor'} onChange={v => setForm({...form, bobotMode: v === 'Isi Rata-rata Langsung' ? 'RataRata' : 'PerEkor'})} options={['Isi Rata-rata Langsung', 'Hitung dari Sampel Per Ekor']} />
                    </div>
                  </div>

                  {form.bobotMode === 'RataRata' ? (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Bobot Badan Rata-rata (Kg)</label>
                      <input type="number" step="0.01" required={form.jenis === 'Pencatatan Bobot Badan'} placeholder="Cth: 1.5" value={form.bobotRata} onChange={e => setForm({...form, bobotRata: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-text" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Input Sampel Bobot Per Ekor (Kg)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {form.bobotSamples.map((samp, idx) => (
                          <div key={idx} className="relative group">
                            <input type="number" step="0.01" placeholder={`Ekor ${idx+1}`} value={samp} onChange={e => handleSampleChange(idx, e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-text pr-8 text-center" />
                            <button type="button" onClick={() => handleRemoveSample(idx)} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-blue-100 dark:border-blue-800/50 mt-2">
                        <button type="button" onClick={handleAddSample} className="text-sm px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 font-bold rounded-lg transition-colors flex items-center gap-1 mt-2 sm:mt-0"><Plus size={16}/> Tambah Sampel</button>
                        <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-bold rounded-lg text-sm border border-green-200 dark:border-green-800">
                            Rata-rata Terkalkulasi: {getAverageBobot()} Kg
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* INJECTION UNTUK INPUT BERAT SAK */}
        <AnimatePresence>
          {(form.jenis === 'Pemberian Pakan' || form.jenis === 'Stok Gudang') && form.satuanPakan === 'Sak' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="pt-2">
                 <label className="block text-sm font-bold text-blue-700 dark:text-blue-400 mb-1">Berat per 1 Sak (Kg)</label>
                 <input type="number" required value={form.beratSak} onChange={e => setForm({ ...form, beratSak: e.target.value })} placeholder="Cth: 50" className="w-full px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-blue-800 dark:text-blue-200 cursor-text" />
                 <p className="text-xs font-medium text-gray-500 mt-2">Dihitung menjadi total: {Number(form.jumlah || 0) * Number(form.beratSak || 0)} Kg.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Keterangan / Memo (Sebab/Kondisi)</label>
          <textarea rows="3" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium resize-none cursor-text"></textarea>
        </div>
        <button disabled={loading} className="px-8 py-3 bg-green-600 font-bold text-white rounded-xl shadow-lg w-full md:w-auto hover:bg-green-700 cursor-pointer">
          {loading ? 'Menyimpan...' : 'Simpan Pencatatan'}
        </button>
      </form>
    </div>
  );
};

const InputUsahaView = ({ user }) => {
  const [form, setForm] = useState({ tipe: 'Pemasukan', kategori: '', nama: '', jumlah: '', satuan: '', total: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.tipe || !form.kategori || !form.total) return alert("Isian wajib tidak boleh kosong!");
    setLoading(true);

    let submitPayload = {
      "TimeStamp": new Date().toISOString(),
      "ID Akun": user['ID Akun'],
      "Nama Lengkap": user['Nama Lengkap'],
      "Role": user.Role,
      "Tipe Arus Kas": form.tipe,
      "Kategori": form.kategori,
      "Nama Item": form.nama,
      "Nama Barang / Item": form.nama,
      "Jml": form.jumlah,
      "Jumlah Pembelian": form.jumlah,
      "Satuan Beli": form.satuan,
      "Total Transaksi (Kotor)": form.total,
      "Total Harga Transaksi": form.total,
      "Bentuk Usaha": user['Bentuk Usaha'] || 'Personal'
    };

    fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addUsaha",
        payload: submitPayload
      })
    })
      .then(r => r.json()).then(res => {
        if (res.status === 'success') { alert("Data Transaksi Disimpan!"); setForm({ tipe: 'Pemasukan', kategori: '', nama: '', jumlah: '', satuan: '', total: '' }); }
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
      <h3 className="text-xl font-bold mb-6">Formulir Keuangan Usaha</h3>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl border-l-[3px] border-green-500 pl-4 md:pl-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Arus Kas</label>
            <ModernSelect value={form.tipe} onChange={v => setForm({ ...form, tipe: v })} options={['Pemasukan', 'Pengeluaran']} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Kategori Transaksi</label>
            <ModernSelect value={form.kategori} onChange={v => setForm({ ...form, kategori: v })} placeholder="Pilih Kategori" options={['Pakan', 'Obat', 'Penjualan Ternak', 'Limbah', 'Aset', 'Lainnya']} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Item Spesifik</label>
          <input required type="text" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Cth: Rumput Gajah" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 font-medium" />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Kuantitas</label>
            <input required type="number" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 font-medium" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Satuan</label>
            <ModernSelect value={form.satuan} onChange={v => setForm({ ...form, satuan: v })} options={['Kg', 'Ekor', 'Unit', 'Liter', 'Karung', 'Sak']} placeholder="Satuan" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Besar Transaksi (Rp)</label>
          <input required type="number" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-lg text-green-700 font-bold" />
        </div>
        <button disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl mt-4 w-full md:w-auto hover:bg-blue-700">
          {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
        </button>
      </form>
    </div>
  );
};

const RiwayatRekordingView = ({ user, onChangeTab }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // USER MAP FOR MODERATOR
  const [idToNameMap, setIdToNameMap] = useState({});

  // FILTER STATES
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [selectedAkun, setSelectedAkun] = useState(user.Role === 'Moderator' ? "Semua" : user['ID Akun']);
  
  // IP CALC & MISSING DATA STATES
  const [showIPCalc, setShowIPCalc] = useState(false);
  const [ipData, setIpData] = useState(null);
  const [isMissingDataMode, setIsMissingDataMode] = useState(false);
  const [showMissingData, setShowMissingData] = useState(false);

  const fetchRecords = () => {
    setLoading(true);
    fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'getRekording', userId: user['ID Akun'], role: user.Role }) })
      .then(r => r.json()).then(res => { if (res.status === 'success') setRecords(res.data.reverse()); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
    if (user.Role === 'Moderator') {
       fetch(GAS_URL, { method: "POST", body: JSON.stringify({ action: "getUsers", userId: user['ID Akun'], role: user.Role }) })
        .then(r => r.json())
        .then(res => {
           if (res.status === 'success') {
              const map = {};
              res.data.forEach(u => map[u['ID Akun']] = u['Nama Lengkap']);
              setIdToNameMap(map);
           }
        });
    }
  }, [user]);

  const getUserName = (id) => idToNameMap[id] || id;
  const uniqueUsers = Array.from(new Set(records.map(r => r['ID Akun']))).filter(Boolean);

  const filteredRecords = records.filter(r => {
    if (user.Role === 'Moderator' && selectedAkun !== 'Semua' && r['ID Akun'] !== selectedAkun) return false;
    const recordDate = new Date(r['TimeStamp'] || r['Tanggal & Waktu'] || r['Tanggal']);
    if (dateStart && recordDate < new Date(dateStart).setHours(0,0,0,0)) return false;
    if (dateEnd) {
      const end = new Date(dateEnd);
      end.setHours(23, 59, 59, 999);
      if (recordDate > end) return false;
    }
    return true;
  });

  const runCalculation = (recordsToUse) => {
    const popAwalArr = recordsToUse.filter(r => r['Jenis Evaluasi'] === 'Populasi Awal Masuk');
    const sumAwal = popAwalArr.reduce((acc, curr) => acc + (Number(curr['Jumlah Populasi Awal Masuk Ternak'] || curr['Jumlah Ekor Terdampak']) || 0), 0);

    const popTambahArr = recordsToUse.filter(r => r['Jenis Evaluasi'] === 'Penambahan Populasi Ternak');
    const sumTambah = popTambahArr.reduce((acc, curr) => acc + (Number(curr['Jumlah Penambahan Populasi Ternak'] || curr['Jumlah Ekor Terdampak']) || 0), 0);

    const popMatiArr = recordsToUse.filter(r => r['Jenis Evaluasi'] === 'Kematian Ternak (Mortalitas)');
    const sumMati = popMatiArr.reduce((acc, curr) => acc + (Number(curr['Jumlah Kematian Ternak'] || curr['Jumlah Ekor Terdampak']) || 0), 0);

    const populasiAkhir = sumAwal + sumTambah - sumMati;

    let dates = recordsToUse.map(r => new Date(r['TimeStamp'] || r['Tanggal & Waktu'] || r['Tanggal']).getTime()).filter(t => !isNaN(t));
    let durationDays = 1;
    if (dates.length > 0) {
      let minTime = Math.min(...dates);
      let maxTime = Math.max(...dates);
      durationDays = Math.ceil((maxTime - minTime) / (1000 * 3600 * 24));
      if (durationDays < 1) durationDays = 1;
    }

    let guessedJenis = "";
    for (let i = 0; i < recordsToUse.length; i++) {
       if (recordsToUse[i]['Jenis Ternak']) {
           guessedJenis = recordsToUse[i]['Jenis Ternak'];
           break;
       }
    }
    
    let finalJenisForm = "";
    const lowerGuess = guessedJenis.toLowerCase();
    if (lowerGuess.includes("sapi") && lowerGuess.includes("perah")) finalJenisForm = "Sapi Perah";
    else if (lowerGuess.includes("sapi")) finalJenisForm = "Sapi Potong";
    else if (lowerGuess.includes("kambing") && lowerGuess.includes("perah")) finalJenisForm = "Kambing Perah";
    else if (lowerGuess.includes("kambing")) finalJenisForm = "Kambing Potong";
    else if (lowerGuess.includes("broiler")) finalJenisForm = "Ayam Broiler";
    else if (lowerGuess.includes("kampung") || lowerGuess.includes("joper")) finalJenisForm = "Ayam Kampung (Joper)";
    else if (lowerGuess.includes("petelur") && lowerGuess.includes("ayam")) finalJenisForm = "Ayam Petelur";
    else if (lowerGuess.includes("bebek") && lowerGuess.includes("petelur")) finalJenisForm = "Bebek Petelur";
    else if (lowerGuess.includes("bebek")) finalJenisForm = "Bebek Pedaging";
    else if (lowerGuess.includes("domba")) finalJenisForm = "Domba Potong";
    else if (lowerGuess.includes("kerbau")) finalJenisForm = "Kerbau";
    else if (lowerGuess.includes("puyuh")) finalJenisForm = "Puyuh";

    // Auto extract Feed data if it exists
    const pakanArr = recordsToUse.filter(r => r['Jenis Evaluasi'] === 'Pemberian Pakan' || r['Jenis Evaluasi'] === 'Kalkulasi Manual IP');
    const sumPakan = pakanArr.reduce((acc, curr) => acc + (Number(curr['Jumlah Pemberian Pakan (Kg)'] || curr['Total Konsumsi Pakan (Kg)']) || 0), 0);
    
    // Auto extract Harvest weight if it exists mapped manually
    const bobotArr = recordsToUse.filter(r => r['Jenis Evaluasi'] === 'Kalkulasi Manual IP' || r['Jenis Evaluasi'] === 'Pencatatan Bobot Badan');
    let lastBobot = "";
    if (bobotArr.length > 0) {
      const lastR = bobotArr[bobotArr.length - 1];
      lastBobot = Number(lastR['Bobot Badan Rata-Rata Keseluruhan dari Total Populasi'] || lastR['Bobot Panen (Kg)']);
    }

    setIpData({
      jenis: finalJenisForm,
      populasiAwal: sumAwal || "",
      populasiAkhir: populasiAkhir || "",
      lamaPemeliharaan: durationDays,
      totalPakan: sumPakan || "",
      bobotAkhir: lastBobot || ""
    });
    
    setShowIPCalc(true);
  };

  const handleAnalisisIP = () => {
    if (filteredRecords.length === 0) return alert("Tidak ada data dalam rentang filter untuk dihitung.");
    
    // VALIDATOR
    const hasPakanInfo = filteredRecords.some(r => r['Jenis Evaluasi'] === 'Pemberian Pakan' || r['Jenis Evaluasi'] === 'Kalkulasi Manual IP');
    const hasBobotInfo = filteredRecords.some(r => r['Jenis Evaluasi'] === 'Kalkulasi Manual IP' || r['Jenis Evaluasi'] === 'Pencatatan Bobot Badan' || r['Bobot Panen (Kg)']);
    
    if (!(hasPakanInfo && hasBobotInfo)) {
       setShowMissingData(true);
       return;
    }
    
    setIsMissingDataMode(false);
    runCalculation(filteredRecords);
  };



  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-visible shadow-sm relative z-10 transition-all duration-300">
        <div className="p-6 pb-4 font-bold text-lg border-b border-gray-100 dark:border-gray-800">Daftar Rekording</div>
        
        {/* FILTER BAR SECTION */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-end bg-gray-50/50 dark:bg-gray-800/50 relative z-50">
          {user.Role === 'Moderator' && (
            <div className="w-full md:w-1/4">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Pilih Anggota</label>
              <div className="w-full relative z-[110]">
                 <ModernSelect 
                   options={[{label: "Semua Anggota", value: "Semua"}, ...uniqueUsers.map(u => ({label: getUserName(u), value: u}))]}
                   value={selectedAkun === 'Semua' ? 'Semua Anggota' : getUserName(selectedAkun)}
                   onChange={v => setSelectedAkun(v.value || v)}
                   placeholder="Pilih Anggota"
                 />
              </div>
            </div>
          )}
          <div className="w-full md:w-1/4 relative z-[100]">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Mulai Tanggal</label>
            <DatePicker
              selected={dateStart}
              onChange={(date) => setDateStart(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              isClearable
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium cursor-pointer"
              calendarClassName="modern-datepicker-calendar"
            />
          </div>
          <div className="w-full md:w-1/4 relative z-[90]">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Sampai Tanggal</label>
            <DatePicker
              selected={dateEnd}
              onChange={(date) => setDateEnd(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              isClearable
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium cursor-pointer"
              calendarClassName="modern-datepicker-calendar"
              minDate={dateStart}
            />
          </div>
          <div className="w-full md:flex-1 relative z-10">
            <button onClick={handleAnalisisIP} className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-green-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
               <Activity size={16} /> Auto Hitung IP Ternak
            </button>
          </div>
        </div>

        <div className="overflow-x-auto relative z-0">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Nasabah</th><th className="px-6 py-4">Waktu & Tanggal</th><th className="px-6 py-4">Evaluasi</th>
                <th className="px-6 py-4">Jumlah</th><th className="px-6 py-4 whitespace-nowrap">Jenis Ternak</th><th className="px-6 py-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? <tr><td colSpan="6" className="text-center p-6 bg-white dark:bg-gray-900">Loading...</td></tr> : filteredRecords.length === 0 ? <tr><td colSpan="6" className="text-center p-6 bg-white dark:bg-gray-900 text-gray-400">Tidak ada record.</td></tr> : filteredRecords.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 bg-white dark:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 font-medium">{getUserName(r['ID Akun'])}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{parseIndoDate(r['TimeStamp'] || r['Tanggal & Waktu'] || r['Tanggal'])}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-bold text-xs whitespace-nowrap">{r['Jenis Evaluasi']}</span></td>
                  <td className="px-6 py-4 font-bold">{r['Jumlah Pemberian Pakan (Kg)'] || r['Jumlah Stok Gudang (Kg)'] || r['Jumlah Ekor Terdampak'] || r['Jumlah Populasi Awal Masuk Ternak'] || r['Jumlah Kematian Ternak'] || r['Jumlah Penambahan Populasi Ternak'] || r['Total Konsumsi Pakan (Kg)'] || '-'}</td>
                  <td className="px-6 py-4 font-medium text-green-600 dark:text-green-500 whitespace-nowrap">{r['Jenis Ternak'] || '-'}</td>
                  <td className="px-6 py-4 min-w-[200px] text-gray-500 dark:text-gray-400">{r['Keterangan Tambahan'] || r['Catatan Kondisi Ternak']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MISSING DATA GATEWAY OVERLAY */}
      <AnimatePresence>
        {showMissingData && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-0"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: -30 }} 
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 lg:p-8 max-w-xl w-full shadow-2xl relative border border-gray-100 dark:border-gray-800"
            >
               <button onClick={() => setShowMissingData(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={20}/></button>
               
               <div className="flex items-center gap-3 mb-4 text-amber-500">
                 <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-2xl"><AlertTriangle size={24} /></div>
                 <h3 className="text-xl font-bold text-gray-800 dark:text-white">Data Kalkulasi Belum Lengkap</h3>
               </div>
               
               <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">Terdapat data esensial yang kosong di riwayat Anda (khususnya rekaman <b>Pemberian Pakan</b> atau <b>Bobot</b>). Silahkan lengkapi melalui Input Rekording Harian normal atau input manual terintegrasi.</p>

               <div className="flex flex-col sm:flex-row gap-3">
                 <button onClick={() => { setShowMissingData(false); onChangeTab('Input Rekording'); }} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-colors text-sm">Buka Menu Input Rekording</button>
                 <button onClick={() => { setShowMissingData(false); setIsMissingDataMode(true); runCalculation(filteredRecords); }} className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg transition-colors shadow-amber-500/30 text-sm">Lakukan Input Manual Ekstra</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IP CALC OVERLAY */}
      <AnimatePresence>
        {showIPCalc && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[120] bg-gray-900/40 backdrop-blur-md overflow-y-auto custom-scrollbar flex items-start justify-center pt-safe pb-24 md:py-10 px-0 md:px-6"
          >
            <div className="w-full max-w-5xl bg-transparent min-h-screen">
               <HitungIPTernak onBack={() => setShowIPCalc(false)} user={user} initialData={ipData} gasUrl={GAS_URL} isMissingDataMode={isMissingDataMode} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const RiwayatUsahaView = ({ user }) => {
  const [usaha, setUsaha] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsaha', userId: user['ID Akun'], role: user.Role }) })
      .then(r => r.json()).then(res => { if (res.status === 'success') setUsaha(res.data.reverse()); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-6 pb-0 mb-4 font-bold text-lg border-b border-gray-100">Arus Kas Finansial</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-4">Nasabah</th><th className="px-6 py-4">Waktu Transaksi</th><th className="px-6 py-4">Tipe & Item</th>
              <th className="px-6 py-4">Vol</th><th className="px-6 py-4 underline">Nominal (Rp)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan="5" className="text-center p-6">Loading...</td></tr> : usaha.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">{r['ID Akun']}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{parseIndoDate(r['TimeStamp'] || r['Tanggal & Waktu'] || r['Tanggal'])}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{r['Nama Barang / Item'] || r['Nama Item']} <div className="font-normal text-xs text-gray-400">{r['Tipe Arus Kas']}</div></td>
                <td className="px-6 py-4">{r['Jumlah Pembelian'] || r['Jml']} {r['Satuan Beli']}</td>
                <td className="px-6 py-4 font-extrabold text-gray-900">{formatRupiahFull(r['Total Harga Transaksi'] || r['Total Transaksi (Kotor)'])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// NOTIFIKASI VIEW (MODERN CARDS)
// ==========================================
const NotifikasiView = ({ user, isModerator }) => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ judul: '', pesan: '', penerima: 'Semua' });

  const fetchNotifs = () => {
    setLoading(true);
    fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'getNotifikasi', userId: user['ID Akun'], role: user.Role }) })
      .then(r => r.json()).then(res => { if (res.status === 'success') setNotifs(res.data.reverse()); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchNotifs(); }, []);

  const handleBroadcast = (e) => {
    e.preventDefault();
    fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addNotifikasi",
        payload: ['NTF-' + Date.now(), 'Broadcast', form.penerima, user['Nama Lengkap'], form.judul, form.pesan, new Date().toISOString()]
      })
    }).then(r => r.json()).then(res => {
      if (res.status === 'success') { alert("Disiarkan!"); fetchNotifs(); setForm({ ...form, judul: '', pesan: '' }); }
    });
  };

  return (
    <div className="space-y-6">
      {isModerator && (
        <form onSubmit={handleBroadcast} className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg space-y-4">
          <h3 className="font-bold flex items-center gap-2 mb-2"><Bell size={18} /> Siaran Pesan Moderator</h3>
          <div className="grid grid-cols-2 gap-4">
            <input required type="text" placeholder="ID Tujuan / Semua" value={form.penerima} onChange={e => setForm({ ...form, penerima: e.target.value })} className="px-4 py-2 rounded-lg bg-white/20 placeholder-white/60 outline-none text-sm" />
            <input required type="text" placeholder="Judul Singkat" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} className="px-4 py-2 rounded-lg bg-white/20 placeholder-white/60 outline-none text-sm" />
          </div>
          <textarea required placeholder="Pesan..." value={form.pesan} onChange={e => setForm({ ...form, pesan: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-white/20 placeholder-white/60 outline-none resize-none h-20 text-sm"></textarea>
          <button type="submit" className="px-6 py-2 bg-white text-indigo-600 font-bold rounded-lg text-sm shadow hover:bg-gray-50">Tembakkan Notifikasi</button>
        </form>
      )}

      <div className="space-y-4">
        {loading && <p>Mengambil sinyal notifikasi...</p>}
        {notifs.map((n, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 flex gap-4 items-start shadow-sm hover:shadow relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-500"></div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{n.Judul}</h4>
              <p className="text-sm text-gray-500 mt-1">{n.Pesan}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 font-medium">
                <span>Oleh: {n.Penulis}</span> • <span>{new Date(n.Tanggal).toLocaleString('id')}</span>
                {isModerator && <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Target: {n['Penerima (ID Akun/Semua)']}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// KELOLA BERITA VIEW
// ==========================================
const KelolaBeritaView = ({ user }) => {
  const [berita, setBerita] = useState([]);
  const [form, setForm] = useState({ judul: '', konten: '', url: '', pin: 'Tidak', kategori: 'Umum' });
  const [isUploading, setIsUploading] = useState(false);

  const fetchBerita = () => {
    fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'getBerita' }) })
      .then(r => r.json()).then(res => { if (res.status === 'success') setBerita(res.data.reverse()); });
  };
  useEffect(() => { fetchBerita(); }, []);

  const handlePost = (e) => {
    e.preventDefault();
    if (!form.url && !form.fileBase64) return alert("Thumbnail belum dipilih!");

    setIsUploading(true);
    fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addBerita",
        payload: {
          idBerita: 'BRT-' + Date.now(),
          kategori: form.kategori,
          judul: form.judul,
          penulis: user['Nama Lengkap'],
          konten: form.konten,
          pin: form.pin,
          userId: user['ID Akun'],
          folderUrl: user['Link Folder Penyimpanan']
        },
        fileToUpload: form.fileBase64 ? {
          base64Data: form.fileBase64,
          mimeType: form.mimeType,
          fileName: 'Thumb_' + Date.now() + '_' + form.fileName
        } : null,
        explicitUrl: form.fileBase64 ? null : form.url
      })
    }).then(r => r.json()).then(res => {
      setIsUploading(false);
      if (res.status === 'success') { 
        alert("Berita Dipublish!"); 
        fetchBerita(); 
        setForm({ judul: '', konten: '', url: '', pin: 'Tidak', kategori: 'Umum' }); 
      } else alert("Error: " + res.message);
    }).catch(err => { 
      setIsUploading(false); 
      alert("Gagal koneksi server!"); 
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Tampilkan preview foto baru secara lokal seketika
    const previewUrl = URL.createObjectURL(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, url: previewUrl, fileBase64: reader.result.split(',')[1], mimeType: file.type, fileName: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id) => {
    if (!confirm("Yakin hapus?")) return;
    fetch(GAS_URL, { method: "POST", body: JSON.stringify({ action: "deleteBerita", idBerita: id }) }).then(() => fetchBerita());
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handlePost} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-bold text-lg mb-2">Buat Artikel Berita</h3>

        <div className="space-y-2">
          <label className="block w-full h-32 md:h-48 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
                <span className="text-xs font-bold text-gray-500">Mengunggah ke Database...</span>
              </div>
            ) : form.url ? (
              <img src={form.url} className="w-full h-full object-cover group-hover:brightness-75 transition-all" alt="Thumbnail" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <FileEdit className="mb-2" size={32} />
                <span className="text-sm font-bold text-center px-4">Klik untuk Unggah Gambar<br /><span className="text-xs font-normal">atau Tempel Link URL di bawah</span></span>
              </div>
            )}
            {(!isUploading && form.url) && <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white font-bold text-sm">Ganti Gambar</span></div>}
            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={isUploading} />
          </label>
          <input type="url" placeholder="...Atau tempel Direct Link Gambar (.jpg/.png) di sini" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 outline-none text-xs font-medium focus:ring-1 focus:ring-green-500 text-gray-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required type="text" placeholder="Judul Klikbait" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} className="px-4 py-3 rounded-xl bg-gray-50 outline-none text-sm border border-gray-200" />
          <ModernSelect value={form.kategori} onChange={v => setForm({ ...form, kategori: v })} options={['Umum', 'Peternakan', 'Ekonomi', 'Politik', 'Pendidikan', 'Teknologi']} placeholder="Kategori/Tag" />
        </div>
        <textarea required placeholder="Konten Ekstensif..." value={form.konten} onChange={e => setForm({ ...form, konten: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 outline-none resize-none h-32 text-sm border border-gray-200"></textarea>
        <div className="flex justify-between items-center bg-gray-50 p-2 pl-4 rounded-xl border border-gray-200">
          <div className="flex gap-4 items-center text-sm font-bold text-gray-600">Pin Layar Depan? <div className="w-32"><ModernSelect value={form.pin} onChange={v => setForm({ ...form, pin: v })} options={['Ya', 'Tidak']} placeholder="Pilih" /></div></div>
          <button type="submit" className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl text-sm shadow cursor-pointer">Publikasi Live</button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {berita.map((b, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4">
            <img src={b['Thumbnail URL']} alt="" className="w-20 h-20 object-cover rounded-xl shrink-0" />
            <div>
              <h4 className="font-bold text-sm line-clamp-2">{b.Judul}</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{b.Konten}</p>
              <button onClick={() => handleDelete(b['ID Berita'])} className="text-xs text-red-500 font-bold flex items-center gap-1 mt-2 hover:underline"><Trash2 size={12} /> Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// KELOLA ANGGOTA & PROFIL VIEW
// ==========================================
const KelolaAnggotaView = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchU = () => {
    setLoading(true);
    fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsers', userId: user['ID Akun'], role: user.Role }) })
      .then(r => r.json()).then(res => { if (res.status === 'success') setUsers(res.data); setLoading(false); });
  }
  useEffect(() => { fetchU(); }, []);

  const [editTarget, setEditTarget] = useState(null);

  const handleImpersonateSave = (e) => {
    e.preventDefault();
    if (!confirm('PERINGATAN: Mengubah ID Akun akan memicu CASCADE UPDATE (migrasi data massal) ke seluruh sheet secara permanen. Lanjutkan?')) return;

    fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "updateUser",
        callerRole: user.Role, callerUserId: user['ID Akun'],
        oldId: editTarget._oldId,
        payload: editTarget
      })
    }).then(r => r.json()).then(res => {
      alert(res.message);
      setEditTarget(null);
      fetchU();
    });
  };

  if (editTarget) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Edit /> Edit Hak Akses: {editTarget['Nama Lengkap']}</h3>
        <form onSubmit={handleImpersonateSave} className="space-y-4">
          {['ID Akun', 'Username', 'Nama Lengkap', 'Role', 'Password', 'Nomor Telepon'].map(field => (
            <div key={field}>
              <label className="text-xs font-bold text-gray-500 block mb-1">{field}</label>
              <input value={editTarget[field] || ''} onChange={e => setEditTarget({ ...editTarget, [field]: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-gray-50" />
            </div>
          ))}
          <div className="flex gap-4 pt-4">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold">Cascade Simpan</button>
            <button type="button" onClick={() => setEditTarget(null)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl font-bold">Batal</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead><tr className="bg-gray-50"><th className="p-4">Akun ID</th><th className="p-4">Nama</th><th className="p-4">Role</th><th className="p-4">Aksi</th></tr></thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="p-4 font-mono text-xs">{u['ID Akun']}</td>
              <td className="p-4 font-bold">{u['Nama Lengkap']}</td>
              <td className="p-4"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">{u.Role}</span></td>
              <td className="p-4"><button onClick={() => setEditTarget({ ...u, _oldId: u['ID Akun'] })} className="text-blue-500 hover:underline">Kelola Data</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ProfilView = ({ user, setUser }) => {
  const [formData, setFormData] = useState({ ...user });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setIsSaving(true);
    fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "updateUser",
        callerRole: user.Role, callerUserId: user['ID Akun'],
        oldId: user['ID Akun'],
        payload: formData
      })
    }).then(r => r.json()).then(res => {
      if (res.status === 'success') {
        alert("Profil Disimpan!");
        setUser(formData);
        localStorage.setItem('satuternak_user', JSON.stringify(formData));
      } else alert(res.message);
      setIsSaving(false);
    }).catch(() => setIsSaving(false));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!user['Link Folder Penyimpanan'] || user['Link Folder Penyimpanan'] === '-') return alert("Link Folder Kosong.");

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(',')[1];
      try {
        const response = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'uploadProfilePicture', userId: user['ID Akun'], base64Data: base64String, mimeType: file.type, fileName: file.name, folderUrl: user['Link Folder Penyimpanan'] })
        });
        const resJson = await response.json();
        if (resJson.status === 'success') {
          const newUser = { ...user, 'Foto Profil': resJson.data.fileUrl };
          setUser(newUser);
          setFormData(newUser);
          localStorage.setItem('satuternak_user', JSON.stringify(newUser));
        } else alert("Error Drive: " + resJson.message);
      } catch (error) { alert("Network Error"); }
      finally { setIsUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm max-w-4xl">
      <div className="bg-gradient-to-r from-green-500 to-blue-600 h-40 relative">
        <label className="absolute -bottom-12 left-10 w-28 h-28 bg-white rounded-3xl p-1 shadow-lg cursor-pointer group z-10">
          <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden relative">
            {isUploading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div> :
              (user['Foto Profil'] && user['Foto Profil'] !== '-' ? <img src={user['Foto Profil']} className="w-full h-full object-cover" /> : <span className="text-4xl font-extrabold text-gray-300">{user['Nama Lengkap']?.charAt(0)}</span>)}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><FileEdit className="text-white" /></div>
          </div>
          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={isUploading} />
        </label>
      </div>

      <form onSubmit={handleProfileUpdate} className="pt-20 pb-8 px-10">
        <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold">{user['Nama Lengkap']}</h2>
            <p className="font-bold text-green-600 tracking-wider text-sm">{user.Username} • {user['ID Akun']}</p>
          </div>
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 font-bold rounded-xl text-xs uppercase tracking-widest">{user.Role}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 place-items-start">
          <div className="w-full space-y-4">
            {['Email', 'Nomor Telepon', 'Nama Lengkap'].map(label => {
              const mapKey = label === 'Email' ? 'Alamat Email' : label;
              return (
                <div key={label}>
                  <label className="text-xs font-bold text-gray-500 block mb-1">{label}</label>
                  <input type="text" value={formData[mapKey]} onChange={e => setFormData({ ...formData, [mapKey]: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-green-500 font-medium transition-colors" />
                </div>
              )
            })}
          </div>

          <div className="w-full space-y-4">
            {['Pekerjaan', 'Bentuk Usaha', 'Password'].map(label => (
              <div key={label}>
                <label className="text-xs font-bold text-gray-500 block mb-1">{label} {label === 'Password' && '(Kosongkan jika tak diubah)'}</label>
                <input type={label === 'Password' ? 'password' : 'text'} placeholder={label === 'Password' ? '********' : ''} value={label === 'Password' ? '' : formData[label]} onChange={e => setFormData({ ...formData, [label]: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-green-500 font-medium transition-colors" />
              </div>
            ))}
          </div>

          <div className="w-full md:col-span-2 space-y-4 pt-4 border-t border-gray-100">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Alamat Lengkap</label>
              <input value={formData['Alamat Lengkap User']} onChange={e => setFormData({ ...formData, 'Alamat Lengkap User': e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Bio Profil Singkat</label>
              <textarea value={formData['Bio Profil']} onChange={e => setFormData({ ...formData, 'Bio Profil': e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none resize-none h-20 text-sm italic focus:border-green-500"></textarea>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button disabled={isSaving} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow flex gap-2">
            <Save size={20} /> {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
};