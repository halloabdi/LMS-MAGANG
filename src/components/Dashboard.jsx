import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, FileEdit, History, Wallet, Receipt,
  BookOpen, Bell, User, LogOut, ChevronRight, Activity,
  AlertTriangle, Settings, Newspaper, UserCog, Edit,
  Save, Trash2, MoreVertical, X, Check, Search, ChevronDown, Plus, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbx-QH-7eY81o9X9uw1cxpTxnnNRlJ-hZbUsgy5oUKIF642jnA3BawrcHIqwT0RLt7o/exec';

// --- FORMATTER HELPER ---
const formatIndoNumber = (numStr) => {
  const num = Number(numStr) || 0;
  if (num >= 1e12) return (num / 1e12).toFixed(1) + ' Tr';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + ' M';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + ' Jt';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + ' Rb';
  return num.toString();
};

const formatRupiahFull = (num) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
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
        <div className="flex flex-row overflow-x-auto custom-scrollbar px-2 py-2 gap-2 pb-6">
          {TAB_MENUS.map(menu => (
            <button
              key={menu.id}
              onClick={() => setActiveTab(menu.id)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-14 rounded-2xl transition-all
                ${activeTab === menu.id ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'text-gray-500'}
              `}
            >
              <menu.icon size={22} className={activeTab === menu.id ? '-translate-y-0.5 transition-transform' : ''} />
              <span className="text-[9px] font-bold mt-1 text-center leading-tight truncate w-full px-1">{menu.label.replace('Rekording', 'R krd').replace('Usaha', 'Ush')}</span>
            </button>
          ))}
          <button onClick={handleLogout} className="flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-14 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut size={22} />
            <span className="text-[9px] font-bold mt-1">Keluar</span>
          </button>
        </div>
      </nav>
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
      if (resRek.status === 'success') {
        resRek.data.forEach(r => {
          if (r['Jenis Evaluasi'] === 'Populasi Awal Masuk') pop += Number(r['Jumlah Ekor Terdampak'] || 0);
          if (r['Jenis Evaluasi'] === 'Angka Kematian (Mortalitas)') pop -= Number(r['Jumlah Ekor Terdampak'] || 0);
        });
      }
      if (resUsh.status === 'success') {
        resUsh.data.forEach(r => {
          if (r['Tipe Arus Kas'] === 'Pemasukan') asset += Number(r['Total Harga Transaksi'] || 0);
          if (r['Tipe Arus Kas'] === 'Pengeluaran') asset -= Number(r['Total Harga Transaksi'] || 0);
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
          <p className="text-4xl font-extrabold font-['Poppins']">{formatIndoNumber(summary.populasi)} <span className="text-lg opacity-80 font-medium">Ekor</span></p>
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
  const [form, setForm] = useState({ jenis: '', tanggal: '', jumlah: '', keterangan: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.jenis || !form.tanggal || !form.jumlah) return alert("Harap lengkapi field wajib");
    setLoading(true);
    fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addRekording",
        payload: [user['ID Akun'], form.tanggal, form.jenis, form.jumlah, form.keterangan]
      })
    })
      .then(r => r.json()).then(res => {
        if (res.status === 'success') { alert("Disimpan!"); setForm({ jenis: '', tanggal: '', jumlah: '', keterangan: '' }); }
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
      <h3 className="text-xl font-bold mb-6">Pencatatan Ternak Harian</h3>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Jenis Evaluasi</label>
            <ModernSelect
              value={form.jenis}
              onChange={(v) => setForm({ ...form, jenis: v })}
              options={['Populasi Awal Masuk', 'Angka Kematian (Mortalitas)', 'Program Vaksinasi', 'Lainnya']}
              placeholder="- Pilih Evaluasi -"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
            <input type="datetime-local" required value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Jumlah Ekor Terdampak</label>
          <input type="number" required value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} placeholder="Contoh: 10" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Keterangan / Memo</label>
          <textarea rows="3" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium resize-none"></textarea>
        </div>
        <button disabled={loading} className="px-8 py-3 bg-green-600 font-bold text-white rounded-xl shadow-lg w-full md:w-auto hover:bg-green-700">
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
    fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addUsaha",
        payload: [user['ID Akun'], new Date().toISOString(), form.tipe, form.kategori, form.nama, form.jumlah, form.satuan, form.total]
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

// ==========================================
// RIWAYAT TABLES 
// ==========================================
const RiwayatRekordingView = ({ user }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'getRekording', userId: user['ID Akun'], role: user.Role }) })
      .then(r => r.json()).then(res => { if (res.status === 'success') setRecords(res.data.reverse()); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-6 pb-0 mb-4 font-bold text-lg border-b border-gray-100">Daftar Rekording</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-4">Nasabah</th><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Evaluasi</th>
              <th className="px-6 py-4">Jumlah</th><th className="px-6 py-4">Catatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan="5" className="text-center p-6">Loading...</td></tr> : records.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">{r['ID Akun']}</td>
                <td className="px-6 py-4">{new Date(r['Tanggal & Waktu']).toLocaleDateString('id')}</td>
                <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">{r['Jenis Evaluasi']}</span></td>
                <td className="px-6 py-4">{r['Jumlah Ekor Terdampak']}</td>
                <td className="px-6 py-4">{r['Keterangan Tambahan']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
              <th className="px-6 py-4">Nasabah</th><th className="px-6 py-4">Tipe & Item</th>
              <th className="px-6 py-4">Vol</th><th className="px-6 py-4 underline">Nominal (Rp)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan="4" className="text-center p-6">Loading...</td></tr> : usaha.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">{r['ID Akun']}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{r['Nama Barang / Item']} <div className="font-normal text-xs text-gray-400">{r['Tipe Arus Kas']}</div></td>
                <td className="px-6 py-4">{r['Jumlah Pembelian']} {r['Satuan Beli']}</td>
                <td className="px-6 py-4 font-extrabold text-gray-900">{formatRupiahFull(r['Total Harga Transaksi'])}</td>
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
  const [form, setForm] = useState({ judul: '', konten: '', url: '', pin: 'Tidak' });

  const fetchBerita = () => {
    fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'getBerita' }) })
      .then(r => r.json()).then(res => { if (res.status === 'success') setBerita(res.data.reverse()); });
  };
  useEffect(() => { fetchBerita(); }, []);

  const handlePost = (e) => {
    e.preventDefault();
    fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addBerita",
        payload: ['BRT-' + Date.now(), 'Umum', form.judul, form.url, user['Nama Lengkap'], form.konten, form.pin, new Date().toISOString()]
      })
    }).then(r => r.json()).then(res => {
      if (res.status === 'success') { alert("Berita Dipublish!"); fetchBerita(); }
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Yakin hapus?")) return;
    fetch(GAS_URL, { method: "POST", body: JSON.stringify({ action: "deleteBerita", idBerita: id }) }).then(() => fetchBerita());
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handlePost} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-bold text-lg">Buat Artikel Berita</h3>
        <div className="grid grid-cols-2 gap-4">
          <input required type="text" placeholder="Judul Klikbait" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} className="px-4 py-3 rounded-xl bg-gray-50 outline-none text-sm border border-gray-200" />
          <input required type="text" placeholder="URL Foto Thumbnail" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="px-4 py-3 rounded-xl bg-gray-50 outline-none text-sm border border-gray-200" />
        </div>
        <textarea required placeholder="Konten Ekstensif..." value={form.konten} onChange={e => setForm({ ...form, konten: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 outline-none resize-none h-32 text-sm border border-gray-200"></textarea>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">Pin di Atas? <ModernSelect value={form.pin} onChange={v => setForm({ ...form, pin: v })} options={['Ya', 'Tidak']} placeholder="Pilih" /></div>
          <button type="submit" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl text-sm shadow">Publikasi Live</button>
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