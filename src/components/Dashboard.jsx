import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileEdit, History, Wallet, Receipt, 
  BookOpen, Bell, User, LogOut, ChevronRight, Activity, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TAB_MENUS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'input-rekording', label: 'Input Rekording', icon: FileEdit },
  { id: 'riwayat-rekording', label: 'Riwayat Rekording', icon: History },
  { id: 'input-usaha', label: 'Input Usaha', icon: Wallet },
  { id: 'riwayat-usaha', label: 'Riwayat Usaha', icon: Receipt },
  { id: 'perpustakaan', label: 'Perpustakaan', icon: BookOpen },
  { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
  { id: 'profil', label: 'Profil Saya', icon: User },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0,0);
    const storedUser = localStorage.getItem('satuternak_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Not logged in, redirect to home
      window.location.hash = '';
      window.location.pathname = '/';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('satuternak_user');
    window.location.hash = '';
    window.location.pathname = '/';
  };

  const navItemClass = (id) => `
    flex items-center gap-3 px-4 py-3 rounded-2xl md:rounded-xl transition-all cursor-pointer font-semibold w-full
    ${activeTab === id 
      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30' 
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
  `;

  if (!user) return <div className="min-h-screen bg-gray-50 flex justify-center items-center">Loading...</div>;

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
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex flex-shrink-0 items-center justify-center text-green-700 dark:text-green-400 font-bold text-xl uppercase">
              {user['Nama Lengkap'] ? user['Nama Lengkap'].charAt(0) : 'U'}
            </div>
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
        {/* Mobile Top Header */}
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
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm uppercase">
              {user['Nama Lengkap'] ? user['Nama Lengkap'].charAt(0) : 'U'}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
          {/* Header Title */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white capitalize">{activeTab.replace('-', ' ')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mt-1">Kelola data peternakan Anda dengan mudah dan cepat.</p>
          </div>

          {/* Dynamic Content Views */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewView user={user} />}
              {activeTab === 'input-rekording' && <InputRekordingView user={user} />}
              {activeTab === 'riwayat-rekording' && <RiwayatRekordingView user={user} />}
              {activeTab === 'input-usaha' && <InputUsahaView user={user} />}
              {activeTab === 'riwayat-usaha' && <RiwayatUsahaView user={user} />}
              {activeTab === 'perpustakaan' && <div className="p-10 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">Modul Perpustakaan Segera Hadir</div>}
              {activeTab === 'notifikasi' && <div className="p-10 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">Tidak Ada Notifikasi</div>}
              {activeTab === 'profil' && <ProfilView user={user} />}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pb-safe z-40">
        <div className="flex flex-row overflow-x-auto hide-scrollbar px-2 py-2 gap-2 pb-6">
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
          <button 
            onClick={handleLogout} 
            className="flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-14 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={22} />
            <span className="text-[9px] font-bold mt-1">Keluar</span>
          </button>
        </div>
      </nav>

    </div>
  );
}

// --- SUB VIEWS ---

const OverviewView = ({ user }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg shadow-blue-900/20">
        <h3 className="font-bold mb-1 opacity-80">Populasi Aktif</h3>
        <p className="text-4xl font-extrabold font-['Poppins']">142 <span className="text-lg opacity-80 font-medium">Ekor</span></p>
      </div>
      <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl p-6 text-white shadow-lg shadow-green-900/20">
        <h3 className="font-bold mb-1 opacity-80">Perkiraan Nilai Aset</h3>
        <p className="text-3xl font-extrabold font-['Poppins']">Rp1.42B</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
         <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
         </div>
         <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Peringatan Stok</h3>
            <p className="text-sm text-gray-500 mt-1">Stok Konsentrat BR-1 tersisa 2 Sak. Segera restock!</p>
         </div>
      </div>
    </div>
    
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Activity className="text-green-500"/> Ringkasan Arus Kas Bulan Ini</h3>
      <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
         <p className="text-gray-400 font-medium">Area ini disiapkan untuk Plugin Grafik Eksternal</p>
      </div>
    </div>
  </div>
);

const InputRekordingView = ({ user }) => (
  <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
    <h3 className="text-xl font-bold mb-6">Formulir Pencatatan Ternak</h3>
    <form className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Jenis Evaluasi</label>
          <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium">
            <option>Populasi Awal Masuk</option>
            <option>Angka Kematian (Mortalitas)</option>
            <option>Program Vaksinasi</option>
            <option>Catatan Kondisi Lainnya</option>
          </select>
        </div>
        <div>
           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tanggal & Waktu</label>
           <input type="datetime-local" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium"/>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Jumlah Ekor Terdampak</label>
        <input type="number" placeholder="Contoh: 10" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium"/>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Keterangan Tambahan / Jenis Vaksin</label>
        <textarea rows="4" placeholder="Tuliskan catatan selengkapnya..." className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium resize-none"></textarea>
      </div>
      <button type="button" className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all">
        Simpan Rekording
      </button>
    </form>
  </div>
);

const RiwayatRekordingView = ({ user }) => (
  <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th className="px-6 py-4 rounded-tl-3xl font-extrabold tracking-wider">Tanggal</th>
            <th className="px-6 py-4 font-extrabold tracking-wider">Jenis Evaluasi</th>
            <th className="px-6 py-4 font-extrabold tracking-wider">Jml. Ekor</th>
            <th className="px-6 py-4 font-extrabold tracking-wider">Keterangan</th>
            <th className="px-6 py-4 rounded-tr-3xl font-extrabold tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td className="px-6 py-4 font-medium whitespace-nowrap">14 April 2026</td>
            <td className="px-6 py-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Populasi Awal</span>
            </td>
            <td className="px-6 py-4 font-medium">145 Ekor</td>
            <td className="px-6 py-4 truncate max-w-[200px]">Pemasukan benih ke kandang utama</td>
            <td className="px-6 py-4">
               {user.Role === 'Moderator' ? (
                 <button className="text-blue-500 font-bold hover:underline text-xs">Edit Laporan (Moderator)</button>
               ) : (
                 <button className="text-gray-400 font-medium hover:text-gray-900 text-xs">Detail</button>
               )}
            </td>
          </tr>
          <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td className="px-6 py-4 font-medium whitespace-nowrap">15 April 2026</td>
            <td className="px-6 py-4">
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Mortalitas</span>
            </td>
            <td className="px-6 py-4 font-medium text-red-500">3 Ekor</td>
            <td className="px-6 py-4 truncate max-w-[200px]">Indikasi masalah pernafasan malam hari</td>
            <td className="px-6 py-4">
               {user.Role === 'Moderator' ? (
                 <button className="text-blue-500 font-bold hover:underline text-xs">Edit Laporan (Moderator)</button>
               ) : (
                 <button className="text-gray-400 font-medium hover:text-gray-900 text-xs">Detail</button>
               )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const InputUsahaView = ({ user }) => (
  <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
    <h3 className="text-xl font-bold mb-6">Formulir Pencatatan Usaha</h3>
    <form className="space-y-5 max-w-2xl border-l-[3px] border-green-500 pl-4 md:pl-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tipe Arus Kas</label>
          <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium">
            <option value="Pemasukan">Pemasukan (Pendapatan)</option>
            <option value="Pengeluaran">Pengeluaran (Belanja)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Kategori Transaksi</label>
          <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium">
            <option>Pakan Ternak</option>
            <option>Obat & Vitamin</option>
            <option>Hasil Ternak Utama</option>
            <option>Penjualan Limbah / Olahan</option>
            <option>Investasi / Aset Tetap</option>
            <option>Lainnya</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nama Barang / Item</label>
        <input type="text" placeholder="Cth: Pembelian Konsentrat Sapi" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium"/>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Jumlah Pembelian</label>
          <input type="number" placeholder="0" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium"/>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Satuan Beli</label>
          <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium">
            <option>Sak</option><option>Karung</option><option>Kg</option><option>Liter</option><option>Botol</option><option>Unit</option><option>Ekor</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Total Harga Transaksi (Rp)</label>
        <input type="number" placeholder="Rp" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-medium text-lg text-green-700 dark:text-green-400 font-bold tracking-wider"/>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 mt-4">
        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3">Informasi Admin Marketplace (Opsional)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="number" placeholder="Biaya Admin Shopee (Rp)" className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 text-sm"/>
          <input type="number" placeholder="Biaya Admin Tokopedia (Rp)" className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 text-sm"/>
        </div>
      </div>

      <button type="button" className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all mt-6">
        Simpan Pencatatan Usaha
      </button>
    </form>
  </div>
);

const RiwayatUsahaView = ({ user }) => (
  <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
    <div className="p-4 md:p-6 pb-0 flex flex-wrap gap-4 items-center justify-between border-b border-gray-100 dark:border-gray-800 mb-2">
      <h3 className="font-bold text-lg">Catatan Keuangan {user.Role === 'Moderator' ? 'Keseluruhan' : 'Anda'}</h3>
      <div className="flex gap-2">
        <button className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800">Export CSV</button>
      </div>
    </div>
    <div className="overflow-x-auto p-2 md:p-4">
      <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
        <thead className="text-[11px] text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th className="px-4 py-3 rounded-l-xl">Waktu</th>
            {user.Role === 'Moderator' && <th className="px-4 py-3">Nasabah</th>}
            <th className="px-4 py-3">Tipe</th>
            <th className="px-4 py-3">Item / Kategori</th>
            <th className="px-4 py-3">Jml & Satuan</th>
            <th className="px-4 py-3">Total (Rp)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td className="px-4 py-3 text-xs whitespace-nowrap">13/04/2026 07:15</td>
            {user.Role === 'Moderator' && <td className="px-4 py-3 font-medium text-xs">REGULAR001</td>}
            <td className="px-4 py-3">
              <span className="flex items-center gap-1 text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded w-max text-[10px]"><ChevronRight className="rotate-90" size={14}/> Keluar</span>
            </td>
            <td className="px-4 py-3">
              <div className="font-bold text-gray-800 dark:text-gray-200">Konsentrat BR-1</div>
              <div className="text-[10px]">Pakan</div>
            </td>
            <td className="px-4 py-3 text-xs">10 Sak</td>
            <td className="px-4 py-3 font-extrabold text-gray-900 dark:text-white">1.500.000</td>
          </tr>
          <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td className="px-4 py-3 text-xs whitespace-nowrap">16/04/2026 09:05</td>
            {user.Role === 'Moderator' && <td className="px-4 py-3 font-medium text-xs">REGULAR002</td>}
            <td className="px-4 py-3">
              <span className="flex items-center gap-1 text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded w-max text-[10px]"><ChevronRight className="-rotate-90" size={14}/> Masuk</span>
            </td>
            <td className="px-4 py-3">
              <div className="font-bold text-gray-800 dark:text-gray-200">Sapi Potong Hidup</div>
              <div className="text-[10px]">Hasil Ternak Utama</div>
            </td>
            <td className="px-4 py-3 text-xs">3 Ekor</td>
            <td className="px-4 py-3 font-extrabold text-green-600 dark:text-green-400">45.000.000</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const ProfilView = ({ user }) => (
  <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm max-w-3xl">
    <div className="bg-gradient-to-r from-green-500 to-blue-600 h-32 md:h-40 relative">
      <div className="absolute -bottom-12 left-6 md:left-10 w-24 h-24 bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-lg">
        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-4xl font-extrabold text-gray-300">
           {user['Nama Lengkap']?.charAt(0)}
        </div>
      </div>
    </div>
    <div className="pt-16 pb-8 px-6 md:px-10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{user['Nama Lengkap']}</h2>
          <p className="font-medium text-green-600 tracking-wider text-sm mt-0.5">{user.Username} • {user['ID Akun']}</p>
        </div>
        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-bold rounded-full text-xs border border-yellow-200 dark:border-yellow-700/50">
          Role: {user.Role}
        </span>
      </div>
      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Email:</strong> {user['Alamat Email']}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Telepon:</strong> {user['Nomor Telepon']}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Pekerjaan:</strong> {user.Pekerjaan}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Bentuk Usaha:</strong> {user['Bentuk Usaha']}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Alamat:</strong> {user['Alamat Lengkap User']}</p>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm italic text-gray-500">"{user['Bio Profil']}"</p>
        </div>
      </div>
      
      {user.Role === 'Moderator' && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
          <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-2">Panel Administrator</h4>
          <p className="text-xs text-blue-600 dark:text-blue-400">Sebagai Moderator, Anda memiliki akses untuk melihat semua riwayat user, mengubah rol reguler menjadi nonaktif, menjatuhkan notifikasi, dan pengelolaan user lainnya.</p>
        </div>
      )}
    </div>
  </div>
);
