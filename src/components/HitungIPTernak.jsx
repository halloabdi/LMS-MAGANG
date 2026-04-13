import React, { useState, useEffect } from 'react';
import { ChevronLeft, Info, HelpCircle, ArrowRight, RefreshCw, Calculator, BarChart3, Target, ChevronDown, Save, AlertTriangle, Plus, X } from 'lucide-react';
import { BlinkBlur } from 'react-loading-indicators';
import { motion, AnimatePresence } from 'framer-motion';

const JENIS_TERNAK_OPTIONS = [
  { value: "Sapi Potong", type: "potong_besar" },
  { value: "Kerbau", type: "potong_besar" },
  { value: "Kambing Potong", type: "potong_kecil" },
  { value: "Domba Potong", type: "potong_kecil" },
  { value: "Sapi Perah", type: "perah" },
  { value: "Kambing Perah", type: "perah" },
  { value: "Ayam Broiler", type: "unggas_pedaging" },
  { value: "Bebek Pedaging", type: "unggas_pedaging" },
  { value: "Ayam Kampung (Joper)", type: "unggas_pedaging" },
  { value: "Ayam Petelur", type: "unggas_petelur" },
  { value: "Bebek Petelur", type: "unggas_petelur" },
  { value: "Itik Petelur", type: "unggas_petelur" },
  { value: "Puyuh", type: "unggas_petelur" }
];

export default function HitungIPTernak({ onBack, user = null, initialData = null, gasUrl = "", isMissingDataMode = false }) {
  const [form, setForm] = useState({
    jenis: "",
    populasiAwal: "",
    populasiAkhir: "",
    bobotAwal: "",
    bobotAkhir: "",
    bobotMode: "RataRata",
    bobotSamples: ["", "", ""],
    satuanPakan: "kg",
    beratSak: "50",
    totalPakan: "",
    lamaPemeliharaan: "",
    produksiHarian: "",
    beratTelur: ""
  });

  useEffect(() => {
    if (initialData) {
      setForm(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedType = JENIS_TERNAK_OPTIONS.find(o => o.value === form.jenis)?.type;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      alert("Minimal 3 sampel ekor diperlukan!");
    }
  };
  const handleSampleChange = (index, val) => {
    const newSamples = [...form.bobotSamples];
    newSamples[index] = val;
    setForm({...form, bobotSamples: newSamples});
  };

  const isFormValid = () => {
    if (!form.jenis) return false;
    const hasBobotAkhirValid = form.bobotMode === 'RataRata' ? form.bobotAkhir : getAverageBobot() > 0;
    if (selectedType === "potong_besar" || selectedType === "potong_kecil") {
      return form.populasiAwal && form.populasiAkhir && form.bobotAwal && hasBobotAkhirValid && form.lamaPemeliharaan && form.totalPakan;
    }
    if (selectedType === "unggas_pedaging") {
      return form.populasiAwal && form.populasiAkhir && hasBobotAkhirValid && form.lamaPemeliharaan && form.totalPakan;
    }
    if (selectedType === "unggas_petelur") {
      return form.populasiAwal && form.populasiAkhir && form.produksiHarian && form.beratTelur && form.totalPakan && form.lamaPemeliharaan;
    }
    if (selectedType === "perah") {
      return form.populasiAwal && form.populasiAkhir && form.produksiHarian && form.totalPakan && form.lamaPemeliharaan;
    }
    return false;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const finalBobotAkhirValue = form.bobotMode === 'RataRata' ? parseFloat(form.bobotAkhir) : getAverageBobot();

    if (isMissingDataMode && user) {
      setIsCalculating(true);
      const pakanKg = form.satuanPakan === "sak" ? parseFloat(form.totalPakan) * parseFloat(form.beratSak || 50) : parseFloat(form.totalPakan);
      const manualPayload = {
        "TimeStamp": new Date().toISOString(),
        "ID Akun": user['ID Akun'],
        "Username": user['Username'],
        "Nama Lengkap": user['Nama Lengkap'],
        "Role": user.Role,
        "Jenis Evaluasi": "Kalkulasi Manual IP",
        "Jenis Ternak": form.jenis,
        "Jumlah Populasi Awal Masuk Ternak": form.populasiAwal,
        "Bobot Badan Rata-Rata Keseluruhan dari Total Populasi": finalBobotAkhirValue,
        "Total Konsumsi Pakan (Kg)": pakanKg,
        "Keterangan Tambahan": "Disimpan Otomatis melalui form Kalkulator IP (Auto-Sync Missing Data)"
      };
      if (form.bobotMode !== 'RataRata') {
        manualPayload["Bobot Badan Per Ekor"] = form.bobotSamples.map(Number).filter(n => n > 0).join(', ');
      }
      
      fetch(gasUrl, { method: "POST", body: JSON.stringify({ action: "addRekording", payload: manualPayload }) }).catch(()=>{});
    }

    setIsCalculating(true);
    setResult(null);

    setTimeout(() => {
      let ip = 0;
      let rating = "N/A";
      let fcr = 0;
      let abw = 0;
      let sr = 0;
      let additionalInfo = [];

      const pAwal = parseFloat(form.populasiAwal);
      const pAkhir = parseFloat(form.populasiAkhir);
      const bAwal = parseFloat(form.bobotAwal) || 0;
      const bAkhir = parseFloat(finalBobotAkhirValue); // Rata-rata atau Hasil Array
      const lama = parseFloat(form.lamaPemeliharaan);
      const pakanRaw = parseFloat(form.totalPakan);
      const pakanKg = form.satuanPakan === "sak" ? pakanRaw * parseFloat(form.beratSak || 50) : pakanRaw;
      const produksi = parseFloat(form.produksiHarian);

      if (pAwal > 0) sr = (pAkhir / pAwal) * 100;

      if (selectedType === "potong_besar" || selectedType === "potong_kecil") {
        const adg = (bAkhir - bAwal) / lama;
        const fi = pAkhir > 0 ? pakanKg / lama / pAkhir : 0;
        fcr = (bAkhir - bAwal) > 0 ? (pakanKg / pAkhir) / (bAkhir - bAwal) : 0;

        // IP (Efisiensi Pakan) = (ADG / Konsumsi Pakan Harian) * 100%
        ip = fi > 0 ? (adg / fi) * 100 : 0;

        additionalInfo.push({ label: "Survival Rate", value: sr.toFixed(2) + " %" });
        additionalInfo.push({ label: "ADG", value: adg.toFixed(2) + " kg/hari" });
        additionalInfo.push({ label: "Feed Intake (FI)", value: fi.toFixed(2) + " kg/ekor/hari" });
        additionalInfo.push({ label: "FCR", value: fcr.toFixed(3) });

        if (form.jenis === "Sapi Potong") {
          if (ip > 12) rating = "Istimewa";
          else if (ip >= 9) rating = "Baik";
          else if (ip >= 6) rating = "Cukup";
          else rating = "Terburuk";
        } else if (form.jenis === "Kerbau") {
          if (ip > 10) rating = "Istimewa";
          else if (ip >= 7) rating = "Baik";
          else if (ip >= 5) rating = "Cukup";
          else rating = "Terburuk";
        } else if (form.jenis === "Kambing Potong") {
          if (ip > 13) rating = "Istimewa";
          else if (ip >= 10) rating = "Baik";
          else if (ip >= 7) rating = "Cukup";
          else rating = "Terburuk";
        } else if (form.jenis === "Domba Potong") {
          if (ip > 14) rating = "Istimewa";
          else if (ip >= 11) rating = "Baik";
          else if (ip >= 8) rating = "Cukup";
          else rating = "Terburuk";
        }
      }
      else if (selectedType === "unggas_pedaging") {
        abw = pAkhir > 0 ? bAkhir / pAkhir : 0;
        fcr = bAkhir > 0 ? pakanKg / bAkhir : 0;
        ip = (fcr * lama) > 0 ? (sr * abw) / (fcr * lama) * 100 : 0;
        const fi = pAkhir > 0 ? (pakanKg * 1000) / lama / pAkhir : 0; // dalam gram

        additionalInfo.push({ label: "Survival Rate", value: sr.toFixed(2) + " %" });
        additionalInfo.push({ label: "ABW (Rata-rata)", value: abw.toFixed(3) + " kg/ekor" });
        additionalInfo.push({ label: "FCR", value: fcr.toFixed(3) });
        additionalInfo.push({ label: "Feed Intake (FI)", value: fi.toFixed(1) + " gr/ekor/hari" });

        if (form.jenis === "Ayam Broiler") {
          if (ip > 400) rating = "Istimewa";
          else if (ip >= 350) rating = "Baik";
          else if (ip >= 300) rating = "Cukup";
          else rating = "Terburuk";
        } else if (form.jenis === "Bebek Pedaging") {
          if (ip > 300) rating = "Istimewa";
          else if (ip >= 250) rating = "Baik";
          else if (ip >= 200) rating = "Cukup";
          else rating = "Terburuk";
        } else { // Joper
          if (ip > 250) rating = "Istimewa";
          else if (ip >= 200) rating = "Baik";
          else if (ip >= 150) rating = "Cukup";
          else rating = "Terburuk";
        }
      }
      else if (selectedType === "unggas_petelur") {
        const hdp = pAkhir > 0 ? (produksi / pAkhir) * 100 : 0;
        const fiGram = pAkhir > 0 ? (pakanKg * 1000) / lama / pAkhir : 0;
        const beratTelurGram = parseFloat(form.beratTelur || 0);
        ip = fiGram > 0 ? (hdp * beratTelurGram) / fiGram : 0;

        additionalInfo.push({ label: "Survival Rate", value: sr.toFixed(2) + " %" });
        additionalInfo.push({ label: "Hen-Day Production (HDP)", value: hdp.toFixed(2) + " %" });
        additionalInfo.push({ label: "Feed Intake (FI)", value: fiGram.toFixed(1) + " gr/ekor/hari" });

        if (form.jenis === "Ayam Petelur") {
          if (ip > 45) rating = "Istimewa";
          else if (ip >= 40) rating = "Baik";
          else if (ip >= 35) rating = "Cukup";
          else rating = "Terburuk";
        } else if (form.jenis === "Puyuh") {
          if (ip > 42) rating = "Istimewa";
          else if (ip >= 35) rating = "Baik";
          else if (ip >= 28) rating = "Cukup";
          else rating = "Terburuk";
        } else { // Itik Petelur
          if (ip > 40) rating = "Istimewa";
          else if (ip >= 33) rating = "Baik";
          else if (ip >= 28) rating = "Cukup";
          else rating = "Terburuk";
        }
      }
      else if (selectedType === "perah") {
        const avg = pAkhir > 0 ? produksi / pAkhir : 0;
        const fi = pAkhir > 0 ? pakanKg / lama / pAkhir : 0;
        ip = fi > 0 ? avg / fi : 0; // Liter per kg konsumsi pakan

        additionalInfo.push({ label: "Survival Rate", value: sr.toFixed(2) + " %" });
        additionalInfo.push({ label: "Rata-Rata Produksi", value: avg.toFixed(2) + " Liter/ekor/hari" });
        additionalInfo.push({ label: "Feed Intake (FI)", value: fi.toFixed(2) + " kg/ekor/hari" });

        if (form.jenis === "Sapi Perah") {
          if (ip > 1.5) rating = "Istimewa";
          else if (ip >= 1.3) rating = "Baik";
          else if (ip >= 1.1) rating = "Cukup";
          else rating = "Terburuk";
        } else { // Kambing Perah
          if (ip > 1.0) rating = "Istimewa";
          else if (ip >= 0.8) rating = "Baik";
          else if (ip >= 0.5) rating = "Cukup";
          else rating = "Terburuk";
        }
      }

      let badgeColor = "bg-green-500 shadow-green-500/50";
      let ringColor = "ring-green-500";
      let titleResult = "Nilai IP Ternak";

      if (rating === "Istimewa") { badgeColor = "bg-blue-600 shadow-blue-500/50"; ringColor = "ring-blue-500"; }
      if (rating === "Baik") { badgeColor = "bg-emerald-500 shadow-emerald-500/50"; ringColor = "ring-emerald-500"; }
      if (rating === "Cukup") { badgeColor = "bg-amber-500 shadow-amber-500/50"; ringColor = "ring-amber-500"; }
      if (rating === "Terburuk") { badgeColor = "bg-rose-600 shadow-rose-500/50"; ringColor = "ring-rose-500"; }

      setResult({
        ip: ip.toFixed(2),
        rating,
        badgeColor,
        ringColor,
        additionalInfo,
        titleResult
      });
      setIsCalculating(false);
    }, 2000);
  };

  const handleReset = () => {
    setResult(null);
    setForm({
      jenis: "", populasiAwal: "", populasiAkhir: "", bobotAwal: "", bobotAkhir: "",
      bobotMode: "RataRata", bobotSamples: ["", "", ""],
      satuanPakan: "kg", beratSak: "50", totalPakan: "", lamaPemeliharaan: "", produksiHarian: "", beratTelur: ""
    });
  };

  const handleSaveToGAS = () => {
    if (!user) return;
    setIsSaving(true);
    
    const payload = {
      "ID Akun": user['ID Akun'],
      "Username": user['Username'],
      "Nama Lengkap": user['Nama Lengkap'],
      "Role": user.Role,
      "Waktu Kalkulasi": new Date().toISOString(),
      "Jenis Ternak": form.jenis,
      "Nilai IP": result.ip,
      "Rating": result.rating,
      "Populasi Awal": form.populasiAwal,
      "Populasi Akhir": form.populasiAkhir,
      "Lama Pemeliharaan": form.lamaPemeliharaan,
      "Analisis Tambahan": JSON.stringify(result.additionalInfo)
    };

    fetch(gasUrl, {
      method: "POST",
      body: JSON.stringify({ action: "addIPTernak", payload })
    }).then(r => r.json()).then(res => {
      if (res.status === 'success') {
        alert("Data IP Berhasil Disimpan ke Riwayat Anda!");
      } else {
        alert("Gagal menyimpan data.");
      }
      setIsSaving(false);
    }).catch(e => {
      alert("Error: " + e.message);
      setIsSaving(false);
    });
  };

  const inputClass = "w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-400 font-bold text-gray-800 dark:text-gray-100 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)]";
  const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between";

  return (
    <div className="w-full flex flex-col items-center animate-fade-in font-['Poppins']">
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 z-10 px-4 md:px-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/70 hover:bg-white dark:bg-gray-800/70 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-full backdrop-blur-md shadow-sm border border-gray-200/50 dark:border-gray-700 transition-all hover:scale-105"
        >
          <ChevronLeft size={20} /> Kembali
        </button>
        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 text-lg md:text-xl flex items-center gap-2">
          <Calculator className="text-green-500" /> Kalkulator IP
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl px-4 md:px-0">

        {/* FORM PANEL */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700 shadow-2xl rounded-[2rem] p-6 md:p-8 relative z-20">

          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-100/50 dark:border-blue-800/50">
            <Info className="flex-shrink-0 text-blue-500 w-6 h-6" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Isi data di bawah ini untuk mengetahui nilai performa (IP) beserta konversi pakan ternak Anda. Hasil didasarkan pada standar industri dan dokumen petunjuk.
            </p>
          </div>

          {isMissingDataMode && (
            <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="flex-shrink-0 text-amber-500 w-6 h-6" />
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                <strong>Data Riwayat Belum Memadai:</strong> Sistem tidak mendeteksi rekording Pakan atau Bobot yang cukup. Form yang Anda isi di bawah akan kami <strong>simpan otomatis ke Database Rekording Harian</strong> Anda agar terekam abadi!
              </p>
            </div>
          )}

          <form onSubmit={handleCalculate} className="space-y-5">
            <div>
              <label className={labelClass}>Jenis Ternak</label>
              <div className="relative">
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`${inputClass} flex justify-between items-center cursor-pointer min-h-[56px] select-none`}
                >
                  <span className={form.jenis ? "text-gray-800 dark:text-white font-bold" : "text-gray-400 font-medium"}>
                    {form.jenis || "-- Pilih Jenis Ternak --"}
                  </span>
                  <ChevronDown className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-green-500' : ''}`} size={20} />
                </div>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                      className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-green-900/10 dark:shadow-black/50 border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto custom-scrollbar p-2"
                    >
                      {JENIS_TERNAK_OPTIONS.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setForm({ ...form, jenis: opt.value });
                            setResult(null);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-5 py-3.5 rounded-xl cursor-pointer transition-all duration-200 font-bold text-sm md:text-base mb-1 last:mb-0 ${form.jenis === opt.value ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/20 translate-x-1' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600'}`}
                        >
                          {opt.value}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {form.jenis && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* POPULASI GROUP */}
                    <div>
                      <label className={labelClass}>
                        {selectedType === "perah" ? "Populasi Awal Masuk Kandang" : "Populasi Awal Masuk"}
                        <span>(Ekor)</span>
                      </label>
                      <input type="number" name="populasiAwal" value={form.populasiAwal} onChange={handleChange} className={inputClass} placeholder="Contoh: 1000" min="1" required />
                    </div>
                    <div>
                      <label className={labelClass}>
                        {selectedType === "perah" ? "Populasi Sapi Laktasi" : "Populasi Hidup/Panen"}
                        <span>(Ekor)</span>
                      </label>
                      <input type="number" name="populasiAkhir" value={form.populasiAkhir} onChange={handleChange} className={inputClass} placeholder="Contoh: 980" min="1" required />
                    </div>

                    {/* BOBOT GROUP */}
                    {(selectedType === "potong_besar" || selectedType === "potong_kecil" || selectedType === "unggas_pedaging") && (
                      <div className="md:col-span-2 p-5 rounded-2xl bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/80 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                           <div className="font-bold text-gray-800 dark:text-gray-200">Pengisian Bobot Panen/Akhir</div>
                           <select value={form.bobotMode} onChange={e => setForm({...form, bobotMode: e.target.value})} className="px-3 py-2 md:py-1.5 text-sm md:text-xs font-bold rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white outline-none cursor-pointer">
                             <option value="RataRata">Isi Manual Rata-rata Bobot</option>
                             <option value="PerEkor">Hitung dari Sampel Per Ekor</option>
                             <option value="SeluruhEkor">Hitung dari Seluruh Ekor Terdata</option>
                           </select>
                        </div>
                        
                        {(selectedType === "potong_besar" || selectedType === "potong_kecil") && (
                          <div className="mb-5">
                            <label className={labelClass}>Rata² Bobot Awal Masuk <span className="text-green-600">Per Ekor (Kg)</span></label>
                            <input type="number" step="0.01" name="bobotAwal" value={form.bobotAwal} onChange={handleChange} className={inputClass} placeholder="Contoh: 300" min="0" required />
                          </div>
                        )}

                        {form.bobotMode === 'RataRata' ? (
                          <div>
                            <label className={labelClass}>{selectedType === "unggas_pedaging" ? "Total Bobot Keseluruhan Panen / Akhir" : "Rata² Bobot Akhir"} <span className="text-green-600">(Kg)</span></label>
                            <input type="number" step="0.01" name="bobotAkhir" value={form.bobotAkhir} onChange={handleChange} className={inputClass} placeholder="Contoh: 420" min="0" required />
                          </div>
                        ) : (
                          <div className="space-y-3 pt-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                               {form.bobotMode === 'PerEkor' ? 'Input Sampel Bobot Per Ekor (Minimum 3)' : 'Input Bobot Secara Keseluruhan (Satu Per Satu)'} <span className="text-green-600">(Kg)</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                              {form.bobotSamples.map((samp, idx) => (
                                <div key={idx} className="relative group">
                                  <input type="number" step="0.01" placeholder={`Ekor ${idx+1}`} value={samp} onChange={e => handleSampleChange(idx, e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 font-bold text-gray-800 dark:text-white cursor-text pr-8 text-center" />
                                  <button type="button" onClick={() => handleRemoveSample(idx)} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></button>
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 gap-3">
                              <button type="button" onClick={handleAddSample} className="text-sm px-4 py-2 bg-green-100/50 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-400 font-bold rounded-lg transition-colors flex items-center gap-1 w-full sm:w-auto justify-center"><Plus size={16}/> Tambah Kolom Isian</button>
                              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold rounded-lg text-sm border border-blue-100 dark:border-blue-800 w-full sm:w-auto text-center flex items-center justify-center">
                                  Rata-Rata: {getAverageBobot()} Kg
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* DURASI */}
                    <div className="md:col-span-2">
                      <label className={labelClass}>Lama Pemeliharaan / Umur Panen <span>(Hari)</span></label>
                      <input type="number" name="lamaPemeliharaan" value={form.lamaPemeliharaan} onChange={handleChange} className={inputClass} placeholder="Contoh: 35" min="1" required />
                    </div>

                    {/* PAKAN GROUP */}
                    <div className="md:col-span-2 p-5 rounded-2xl bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/80 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-gray-800 dark:text-gray-200">Total Konsumsi Pakan Selama Pemeliharaan</div>
                        <div className="flex bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                          <button type="button" onClick={() => setForm({ ...form, satuanPakan: "kg" })} className={`px-4 py-1.5 text-xs font-bold transition-colors ${form.satuanPakan === 'kg' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Kg</button>
                          <button type="button" onClick={() => setForm({ ...form, satuanPakan: "sak" })} className={`px-4 py-1.5 text-xs font-bold transition-colors ${form.satuanPakan === 'sak' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Sak</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <input type="number" step="0.01" name="totalPakan" value={form.totalPakan} onChange={handleChange} className={inputClass} placeholder={`Jumlah (${form.satuanPakan === 'sak' ? 'Sak' : 'Kg'})`} min="0" required />
                        </div>
                        {form.satuanPakan === "sak" && (
                          <div>
                            <input type="number" step="0.01" name="beratSak" value={form.beratSak} onChange={handleChange} className={inputClass} placeholder="Isi per sak (kg)" min="1" required />
                            <span className="text-[11px] text-gray-500 mt-1 block">Default: 50 kg / sak</span>
                          </div>
                        )}
                        {form.satuanPakan === "gak_ada" && <div></div>}
                      </div>
                    </div>

                    {/* PRODUKSI (TELUR/SUSU) */}
                    {(selectedType === "unggas_petelur" || selectedType === "perah") && (
                      <div className="md:col-span-2">
                        <label className={labelClass}>Total Produksi Harian <span className="text-green-600">{selectedType === "perah" ? "(Liter)" : "(Butir Telur)"}</span></label>
                        <input type="number" step="0.01" name="produksiHarian" value={form.produksiHarian} onChange={handleChange} className={inputClass} placeholder={selectedType === "perah" ? "Contoh: 120" : "Contoh: 850"} min="0" required />
                      </div>
                    )}

                    {/* BERAT TELUR (Hanya Petelur) */}
                    {selectedType === "unggas_petelur" && (
                      <div className="md:col-span-2">
                        <label className={labelClass}>Berat Rata-Rata 1 Butir Telur <span>(Gram)</span></label>
                        <input type="number" step="0.01" name="beratTelur" value={form.beratTelur} onChange={handleChange} className={inputClass} placeholder="Contoh: 60" min="0.1" required />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={!isFormValid() || isCalculating}
              className={`w-full py-4 mt-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg overflow-hidden group 
                ${isFormValid() ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-green-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
            >
              {isCalculating ? "Menghitung..." : (
                <>Cek Performa Sekarang <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" /></>
              )}
            </button>
          </form>
        </div>

        {/* RESULT SECTION */}
        <div className="lg:col-span-5 relative z-10 flex flex-col justify-start">
          <AnimatePresence mode="sync">
            {isCalculating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700 shadow-2xl rounded-[2rem] p-10 flex flex-col items-center justify-center text-center min-h-[400px]"
              >
                <div className="mb-6 transform scale-150">
                  <BlinkBlur color="#32cd32" size="medium" text="" textColor="" />
                </div>
                <h3 className="text-2xl font-extrabold text-green-500 animate-pulse">Sistem Sedang Menghitung...</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-3 text-sm">Menyusun analisis algoritma dan mencocokkan standar industri.</p>
              </motion.div>
            )}

            {!isCalculating && result && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className={`w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-2 ${result.ringColor.replace('ring-', 'border-')} shadow-2xl rounded-[2rem] p-6 md:p-8 overflow-hidden relative`}
              >
                <div className={`absolute -top-14 -right-14 w-40 h-40 ${result.badgeColor} rounded-full blur-3xl opacity-20`}></div>

                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
                    <Target className="text-blue-500" /> Hasil Analisis
                  </h3>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-extrabold text-white shadow-lg ${result.badgeColor}`}>
                    {result.rating}
                  </div>
                </div>

                <div className="text-center mb-8 bg-gray-50/80 dark:bg-gray-800/80 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
                  <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">{result.titleResult}</div>
                  <div className="text-5xl lg:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 font-['Poppins']">
                    {result.ip}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-4">
                    <BarChart3 size={18} /> Metrik Pendukung:
                  </h4>
                  {result.additionalInfo.map((info, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 px-2 rounded-lg transition-colors">
                      <span className="font-medium text-gray-500 dark:text-gray-400 text-sm">{info.label}</span>
                      <span className="font-extrabold text-gray-800 dark:text-gray-200">{info.value}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleReset}
                  className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} /> Hitung Ulang Data Lain
                </button>

                {user && (
                  <button
                    onClick={handleSaveToGAS}
                    disabled={isSaving}
                    className={`w-full mt-3 py-3.5 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-500/30'}`}
                  >
                    <Save size={18} /> {isSaving ? "Menyimpan ke Riwayat..." : "Simpan Data IP ke Riwayat"}
                  </button>
                )}
              </motion.div>
            )}

            {!isCalculating && !result && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700 shadow-xl rounded-[2rem] p-10 flex flex-col items-center justify-center text-center min-h-[400px] border-dashed border-2 opacity-70"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <Calculator className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500 mb-2">Area Hasil</h3>
                <p className="text-sm font-medium text-gray-400 w-3/4 mx-auto">Silakan isi formulir di samping dan tekan tombol hitung untuk melihat performa peternakan Anda.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
