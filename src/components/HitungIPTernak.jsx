import React, { useState, useEffect } from 'react';
import { ChevronLeft, Info, HelpCircle, ArrowRight, RefreshCw, Calculator, BarChart3, Target } from 'lucide-react';
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

export default function HitungIPTernak({ onBack }) {
  const [form, setForm] = useState({
    jenis: "",
    populasiAwal: "",
    populasiAkhir: "",
    bobotAwal: "",
    bobotAkhir: "",
    satuanPakan: "kg",
    beratSak: "50",
    totalPakan: "",
    lamaPemeliharaan: "",
    produksiHarian: ""
  });
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);

  const selectedType = JENIS_TERNAK_OPTIONS.find(o => o.value === form.jenis)?.type;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isFormValid = () => {
    if (!form.jenis) return false;
    if (selectedType === "potong_besar" || selectedType === "potong_kecil") {
      return form.populasiAwal && form.populasiAkhir && form.bobotAwal && form.bobotAkhir && form.lamaPemeliharaan && form.totalPakan;
    }
    if (selectedType === "unggas_pedaging") {
      return form.populasiAwal && form.populasiAkhir && form.bobotAkhir && form.lamaPemeliharaan && form.totalPakan;
    }
    if (selectedType === "unggas_petelur") {
      return form.populasiAwal && form.populasiAkhir && form.produksiHarian;
    }
    if (selectedType === "perah") {
      return form.populasiAkhir && form.produksiHarian;
    }
    return false;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    
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
      const bAwal = parseFloat(form.bobotAwal);
      const bAkhir = parseFloat(form.bobotAkhir); // Bisa Rata-rata atau Total tergantung jenis
      const lama = parseFloat(form.lamaPemeliharaan);
      const pakanRaw = parseFloat(form.totalPakan);
      const pakanKg = form.satuanPakan === "sak" ? pakanRaw * parseFloat(form.beratSak || 50) : pakanRaw;
      const produksi = parseFloat(form.produksiHarian);

      if (pAwal > 0) sr = (pAkhir / pAwal) * 100;

      if (selectedType === "potong_besar" || selectedType === "potong_kecil") {
        const adg = (bAkhir - bAwal) / lama;
        const totalPakanPerEkor = pakanKg / pAkhir;
        fcr = totalPakanPerEkor / (bAkhir - bAwal);
        ip = adg;

        additionalInfo.push({ label: "Survival Rate", value: sr.toFixed(2) + " %" });
        additionalInfo.push({ label: "ADG", value: adg.toFixed(2) + " kg/hari" });
        additionalInfo.push({ label: "FCR", value: fcr.toFixed(3) });

        if (form.jenis === "Sapi Potong") {
           if (adg > 1.5) rating = "Istimewa";
           else if (adg >= 1.1) rating = "Baik";
           else if (adg >= 0.8) rating = "Cukup";
           else rating = "Terburuk";
        } else if (form.jenis === "Kerbau") {
           if (adg > 1.0) rating = "Istimewa";
           else if (adg >= 0.8) rating = "Baik";
           else if (adg >= 0.5) rating = "Cukup";
           else rating = "Terburuk";
        } else if (form.jenis === "Kambing Potong") {
           if (adg > 0.20) rating = "Istimewa";
           else if (adg >= 0.15) rating = "Baik";
           else if (adg >= 0.10) rating = "Cukup";
           else rating = "Terburuk";
        } else if (form.jenis === "Domba Potong") {
           if (adg > 0.25) rating = "Istimewa";
           else if (adg >= 0.15) rating = "Baik";
           else if (adg >= 0.10) rating = "Cukup";
           else rating = "Terburuk";
        }
      } 
      else if (selectedType === "unggas_pedaging") {
        // bAkhir dalam form di sini kita anggap 'Total Bobot Panen (Kg)' 
        // sehingga ABW = Total / pAkhir
        abw = bAkhir / pAkhir;
        fcr = pakanKg / bAkhir;
        ip = (sr * abw) / (fcr * lama) * 100;
        
        additionalInfo.push({ label: "Survival Rate", value: sr.toFixed(2) + " %" });
        additionalInfo.push({ label: "ABW (Rata-rata)", value: abw.toFixed(3) + " kg/ekor" });
        additionalInfo.push({ label: "FCR", value: fcr.toFixed(3) });

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
        } else {
           if (ip > 250) rating = "Istimewa";
           else if (ip >= 200) rating = "Baik";
           else if (ip >= 150) rating = "Cukup";
           else rating = "Terburuk";
        }
      } 
      else if (selectedType === "unggas_petelur") {
        const hdp = (produksi / pAkhir) * 100;
        ip = hdp;
        
        additionalInfo.push({ label: "Survival Rate", value: sr.toFixed(2) + " %" });
        additionalInfo.push({ label: "Hen-Day Production (HDP)", value: hdp.toFixed(2) + " %" });

        if (form.jenis === "Ayam Petelur") {
           if (hdp > 92) rating = "Istimewa";
           else if (hdp >= 85) rating = "Baik";
           else if (hdp >= 75) rating = "Cukup";
           else rating = "Terburuk";
        } else if (form.jenis === "Puyuh") {
           if (hdp > 85) rating = "Istimewa";
           else if (hdp >= 75) rating = "Baik";
           else if (hdp >= 65) rating = "Cukup";
           else rating = "Terburuk";
        } else {
           if (hdp > 80) rating = "Istimewa";
           else if (hdp >= 70) rating = "Baik";
           else if (hdp >= 60) rating = "Cukup";
           else rating = "Terburuk";
        }
      } 
      else if (selectedType === "perah") {
        const avg = produksi / pAkhir;
        ip = avg;

        additionalInfo.push({ label: "Rata-Rata Produksi", value: avg.toFixed(2) + " Liter/ekor/hari" });

        if (form.jenis === "Sapi Perah") {
           if (avg > 20) rating = "Istimewa";
           else if (avg >= 15) rating = "Baik";
           else if (avg >= 10) rating = "Cukup";
           else rating = "Terburuk";
        } else { // Kambing Perah
           if (avg > 1.5) rating = "Istimewa";
           else if (avg >= 1.0) rating = "Baik";
           else if (avg >= 0.5) rating = "Cukup";
           else rating = "Terburuk";
        }
      }

      let badgeColor = "bg-green-500 shadow-green-500/50";
      let ringColor = "ring-green-500";
      let titleResult = "IP (Indeks Performa)";

      if (selectedType === "unggas_petelur") titleResult = "HDP (Hen-Day Production)";
      if (selectedType === "perah") titleResult = "Produksi Susu";
      if (selectedType === "potong_besar" || selectedType === "potong_kecil") titleResult = "ADG (Average Daily Gain)";

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
      satuanPakan: "kg", beratSak: "50", totalPakan: "", lamaPemeliharaan: "", produksiHarian: ""
    });
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all placeholder:text-sm";
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
        <div className="lg:col-span-7 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700 shadow-2xl rounded-[2rem] p-6 md:p-8 overflow-hidden relative z-10">
          
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-100/50 dark:border-blue-800/50">
            <Info className="flex-shrink-0 text-blue-500 w-6 h-6" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Isi data di bawah ini untuk mengetahui nilai performa (IP) beserta konversi pakan ternak Anda. Hasil didasarkan pada standar industri dan dokumen petunjuk.
            </p>
          </div>

          <form onSubmit={handleCalculate} className="space-y-5">
            <div>
              <label className={labelClass}>Jenis Ternak</label>
              <select 
                name="jenis" 
                value={form.jenis} 
                onChange={(e) => {
                  handleChange(e);
                  setResult(null); // Reset hasil saat ganti jenis
                }}
                className={inputClass + " font-medium appearance-none custom-select"}
              >
                <option value="" disabled>-- Pilih Jenis Ternak --</option>
                {JENIS_TERNAK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.value}</option>
                ))}
              </select>
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
                     {selectedType !== "perah" && (
                       <div>
                         <label className={labelClass}>Populasi Awal Masuk <span>(Ekor)</span></label>
                         <input type="number" name="populasiAwal" value={form.populasiAwal} onChange={handleChange} className={inputClass} placeholder="Contoh: 1000" min="1" required />
                       </div>
                     )}
                     <div>
                       <label className={labelClass}>
                         {selectedType === "perah" ? "Populasi Sapi Laktasi" : "Populasi Hidup/Panen"} 
                         <span>(Ekor)</span>
                       </label>
                       <input type="number" name="populasiAkhir" value={form.populasiAkhir} onChange={handleChange} className={inputClass} placeholder="Contoh: 980" min="1" required />
                     </div>

                     {/* BOBOT GROUP (Hanya Potong) */}
                     {(selectedType === "potong_besar" || selectedType === "potong_kecil") && (
                       <>
                         <div>
                           <label className={labelClass}>Rata² Bobot Awal <span className="text-green-600">Per Ekor (Kg)</span></label>
                           <input type="number" step="0.01" name="bobotAwal" value={form.bobotAwal} onChange={handleChange} className={inputClass} placeholder="Contoh: 300" min="0" required />
                         </div>
                         <div>
                           <label className={labelClass}>Rata² Bobot Akhir <span className="text-green-600">Per Ekor (Kg)</span></label>
                           <input type="number" step="0.01" name="bobotAkhir" value={form.bobotAkhir} onChange={handleChange} className={inputClass} placeholder="Contoh: 420" min="0" required />
                         </div>
                       </>
                     )}

                     {/* BOBOT UNGGAS PEDAGING */}
                     {selectedType === "unggas_pedaging" && (
                       <div className="md:col-span-2">
                         <label className={labelClass}>Total Bobot Keseluruhan Panen <span className="text-green-600">(Kg)</span></label>
                         <input type="number" step="0.01" name="bobotAkhir" value={form.bobotAkhir} onChange={handleChange} className={inputClass} placeholder="Contoh: 1960" min="0" required />
                       </div>
                     )}

                     {/* DURASI */}
                     {(selectedType === "potong_besar" || selectedType === "potong_kecil" || selectedType === "unggas_pedaging") && (
                       <div className="md:col-span-2">
                         <label className={labelClass}>Lama Pemeliharaan / Umur Panen <span>(Hari)</span></label>
                         <input type="number" name="lamaPemeliharaan" value={form.lamaPemeliharaan} onChange={handleChange} className={inputClass} placeholder="Contoh: 35" min="1" required />
                       </div>
                     )}

                     {/* PAKAN GROUP */}
                     {(selectedType !== "unggas_petelur" && selectedType !== "perah") && (
                       <div className="md:col-span-2 p-5 rounded-2xl bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/80 space-y-4">
                         <div className="flex items-center justify-between mb-2">
                             <div className="font-bold text-gray-800 dark:text-gray-200">Total Konsumsi Pakan</div>
                             <div className="flex bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                               <button type="button" onClick={() => setForm({...form, satuanPakan: "kg"})} className={`px-4 py-1.5 text-xs font-bold transition-colors ${form.satuanPakan === 'kg' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Kg</button>
                               <button type="button" onClick={() => setForm({...form, satuanPakan: "sak"})} className={`px-4 py-1.5 text-xs font-bold transition-colors ${form.satuanPakan === 'sak' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Sak</button>
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
                     )}

                     {/* PRODUKSI (TELUR/SUSU) */}
                     {(selectedType === "unggas_petelur" || selectedType === "perah") && (
                       <div className="md:col-span-2">
                         <label className={labelClass}>Total Produksi Harian <span className="text-green-600">{selectedType === "perah" ? "(Liter)" : "(Butir Telur)"}</span></label>
                         <input type="number" step="0.01" name="produksiHarian" value={form.produksiHarian} onChange={handleChange} className={inputClass} placeholder={selectedType === "perah" ? "Contoh: 120" : "Contoh: 850"} min="0" required />
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
