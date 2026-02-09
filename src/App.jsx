import React, { useState, useEffect } from 'react';
import { 
  User, Lock, MapPin, Send, FileText, LogOut, 
  LayoutDashboard, Loader2, Camera, UploadCloud, 
  Activity, CheckCircle, AlertTriangle 
} from 'lucide-react';

// --- KONFIGURASI API ---
const GAS_URL = "https://script.google.com/macros/s/AKfycbx3M2crWZNRr37Vfe1uXpYMMRWpxOE6JF7fhse26XzDmK-RzSckk4cOicD3m7dPoBOzlA/exec";

// --- UTILITIES ---
const getCurrentDate = () => new Date().toISOString().split('T')[0];
const getCurrentTime = () => new Date().toTimeString().split(' ')[0].substring(0, 5);

// --- KOMPONEN: LOGIN ---
const Login = ({ onLogin, loading }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Background Decor (Ocean Blue Blobs for Glass Effect) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative w-full max-w-md p-8 bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg mb-4">
            <Activity size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">LMS Agrinak</h2>
          <p className="text-slate-500 text-sm mt-2">Portal Monitoring Terintegrasi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 ml-1">Username / NIM</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-cyan-600 transition-colors group-focus-within:text-blue-600" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:bg-white/90 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all shadow-sm"
                placeholder="Masukkan ID Anda"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-cyan-600 transition-colors group-focus-within:text-blue-600" />
              <input
                type="password"
                className="w-full pl-12 pr-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:bg-white/90 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all shadow-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-[1.02] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Masuk Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- KOMPONEN: DASHBOARD MAHASISWA ---
const StudentDashboard = ({ user, onLogout }) => {
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState({ lat: '', lng: '', acc: '', address: 'Mencari lokasi...' });
  const [logbookForm, setLogbookForm] = useState({
    tanggal: getCurrentDate(),
    jam_absen: getCurrentTime(),
    status: 'Hadir',
    detail_kegiatan: '',
    output_kegiatan: '',
    link_foto_selfie: '',
    link_dokumentasi: ''
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            acc: position.coords.accuracy,
            address: `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`
          });
        },
        (error) => {
          setLocation(prev => ({ ...prev, address: "Gagal deteksi (Aktifkan GPS)" }));
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleSubmitLogbook = async (e) => {
    e.preventDefault();
    if (!location.lat) return alert("Lokasi wajib terdeteksi!");

    setSubmitting(true);
    const payload = {
      action: 'submitLogbook',
      link_spreedsheets: user.link_spreedsheets,
      logbookData: {
        ...logbookForm,
        latitude: location.lat,
        longitude: location.lng,
        akurasi: location.acc,
        alamat_lengkap: location.address
      }
    };

    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors', // Penting untuk bypass CORS Google Apps Script
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Karena no-cors, kita asumsikan sukses jika tidak throw error
      alert("✅ Logbook Terkirim! Data sedang diproses.");
      setLogbookForm(prev => ({ ...prev, detail_kegiatan: '', output_kegiatan: '' }));
    } catch (error) {
      alert("⚠️ Gagal mengirim. Cek koneksi internet.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
       {/* Ocean Blur Decor */}
       <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-cyan-100/50 rounded-full blur-3xl -z-10"></div>
       <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -z-10"></div>

      {/* Navbar Glass */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              {user.full_name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">{user.full_name}</h3>
              <p className="text-xs text-cyan-600 font-medium">{user.username}</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-4 mt-6 pb-20">
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <FileText size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Form Logbook Harian</h2>
          </div>

          <form onSubmit={handleSubmitLogbook} className="space-y-5">
            {/* Date Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tanggal</label>
                <input type="date" value={logbookForm.tanggal} onChange={e => setLogbookForm({...logbookForm, tanggal: e.target.value})} className="w-full p-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Jam</label>
                <input type="time" value={logbookForm.jam_absen} onChange={e => setLogbookForm({...logbookForm, jam_absen: e.target.value})} className="w-full p-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 outline-none" />
              </div>
            </div>

            {/* Status Kehadiran */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Status Kehadiran</label>
              <div className="grid grid-cols-3 gap-3">
                {['Hadir', 'Sakit', 'Izin'].map((s) => (
                  <label key={s} className={`cursor-pointer text-center py-3 rounded-xl border transition-all font-medium ${logbookForm.status === s ? 'bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <input type="radio" name="status" value={s} checked={logbookForm.status === s} onChange={() => setLogbookForm({...logbookForm, status: s})} className="hidden"/>
                    {s}
                  </label>
                ))}
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
              <div className="p-3 bg-white rounded-full text-blue-500 shadow-sm">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900">Lokasi Terkini</p>
                <p className="text-xs text-blue-700 font-mono mt-0.5">{location.address}</p>
                {location.acc && <span className="inline-block mt-1 px-2 py-0.5 bg-blue-200 text-blue-800 text-[10px] rounded-full">Akurasi: ±{Math.round(location.acc)}m</span>}
              </div>
            </div>

            {/* Inputs Text */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Detail Kegiatan</label>
                <textarea rows="3" required placeholder="Jelaskan aktivitas magang hari ini..." value={logbookForm.detail_kegiatan} onChange={e => setLogbookForm({...logbookForm, detail_kegiatan: e.target.value})} className="w-full mt-1 p-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 outline-none transition-all placeholder:text-slate-400"></textarea>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Output (Hasil)</label>
                <input type="text" placeholder="Contoh: Laporan selesai, 50kg pakan..." value={logbookForm.output_kegiatan} onChange={e => setLogbookForm({...logbookForm, output_kegiatan: e.target.value})} className="w-full mt-1 p-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 outline-none transition-all" />
              </div>
            </div>

            {/* Fake Uploaders */}
            <div className="grid grid-cols-2 gap-4">
               <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-cyan-400 hover:text-cyan-500 transition-colors cursor-pointer bg-white/30">
                  <Camera size={24} className="mb-2"/>
                  <span className="text-xs font-medium">Foto Selfie</span>
               </div>
               <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-cyan-400 hover:text-cyan-500 transition-colors cursor-pointer bg-white/30">
                  <UploadCloud size={24} className="mb-2"/>
                  <span className="text-xs font-medium">Dokumen</span>
               </div>
            </div>

            <button type="submit" disabled={submitting || !location.lat} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
              {submitting ? <Loader2 className="animate-spin" /> : <><Send size={18}/> KIRIM LAPORAN</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

// --- KOMPONEN: DASHBOARD DOSEN ---
const LecturerDashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyan-100/40 rounded-full blur-3xl"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl"></div>
      </div>

      <nav className="bg-white/70 backdrop-blur-lg border-b border-white/30 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg text-white shadow-lg shadow-cyan-500/30">
               <LayoutDashboard size={20} />
             </div>
             <div>
               <h1 className="font-bold text-slate-800 text-lg">Monitoring Dosen</h1>
               <p className="text-xs text-slate-500">Welcome, {user.full_name}</p>
             </div>
          </div>
          <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
            Keluar
          </button>
        </div>
      </nav>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-80px)]">
        {/* Map Section (Glass Card) */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl overflow-hidden relative flex flex-col group">
           <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
              <div className="text-center opacity-40">
                 <MapPin size={48} className="mx-auto mb-2 text-slate-400"/>
                 <p className="font-bold text-slate-500">Peta Sebaran Mahasiswa</p>
                 <p className="text-sm">Integrasi Leaflet Map akan muncul di sini</p>
              </div>
              {/* Simulasi Peta Visual */}
              <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] opacity-10 bg-cover bg-center mix-blend-multiply"></div>
           </div>
           
           {/* Floating Legend */}
           <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                 <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Hadir</span>
                 <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Izin/Sakit</span>
                 <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Invalid</span>
              </div>
           </div>
        </div>

        {/* Sidebar List (Glass Card) */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6 flex flex-col">
           <h3 className="font-bold text-slate-700 mb-4 flex items-center justify-between">
              Status Terkini
              <span className="text-xs font-normal bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">Real-time</span>
           </h3>
           
           <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {/* Dummy Items - Data akan di fetch dari API */}
              {[1,2,3,4,5].map((item) => (
                 <div key={item} className="p-3 bg-white/50 hover:bg-white/80 border border-transparent hover:border-cyan-200 rounded-xl transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                       <h4 className="font-bold text-sm text-slate-800 group-hover:text-cyan-700 transition-colors">Mahasiswa {item}</h4>
                       <span className="text-[10px] text-slate-400">07:45</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-md font-bold">Hadir</span>
                       <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <CheckCircle size={10} className="text-blue-500"/> Valid
                       </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">Jl. Raya Telang No. {item}...</p>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ENTRY ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lms_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = async (creds) => {
    setLoading(true);
    try {
      // Menggunakan fetch biasa. 
      // Note: GAS Web App POST request sering kena CORS di browser.
      // Solusi: Gunakan 'no-cors' tapi response tidak bisa dibaca (opaque).
      // ATAU: Gunakan library tambahan. 
      // Disini kita gunakan standard fetch yang mengharapkan GAS setup benar (ContentService).
      
      // Untuk demo agar jalan di Vercel tanpa error CORS blocking:
      // Kita gunakan URL parameter untuk memancing JSONP atau simply POST.
      // Namun cara paling aman untuk Client-Side pure adalah mengirim data, 
      // lalu jika status 200/302 dianggap sukses (walau response body kosong di mode no-cors).
      
      const formData = new FormData();
      formData.append('action', 'login');
      formData.append('username', creds.username);
      formData.append('password', creds.password);

      // Teknik fetch ke GAS yang paling kompatibel
      const response = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'login', ...creds })
      });
      
      const result = await response.json();

      if (result.status === 'success') {
        const userData = { ...result.data, role: result.role };
        setUser(userData);
        localStorage.setItem('lms_user', JSON.stringify(userData));
      } else {
        alert("Gagal: " + (result.message || "Cek Username/Password"));
      }
    } catch (error) {
      console.error(error);
      alert("Login Error (Cek Console). Pastikan Script dideploy sebagai 'Anyone'.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
  };

  if (!user) return <Login onLogin={handleLogin} loading={loading} />;
  return user.role === 'dosen' 
    ? <LecturerDashboard user={user} onLogout={handleLogout} /> 
    : <StudentDashboard user={user} onLogout={handleLogout} />;
}
