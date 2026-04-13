import React, { useState, useEffect } from 'react';
import {
  Home, Briefcase, Users, Info, MessageSquare, User, Moon, Sun,
  Activity, Calculator, ShoppingCart, BookOpen, Stethoscope,
  ClipboardList, CheckCircle, Star, ChevronLeft, ChevronRight, X,
  ArrowRight, Globe, Store, Code, FileText, TrendingUp, Menu,
  Database, FilePlus, Heart, MapPin, Phone, Mail, Utensils,
  Syringe, Egg, Drumstick, Milk, Sprout, Hammer, AlertTriangle,
  PenTool, Pin, Instagram, Facebook, Twitter, Youtube, Music, AtSign, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HitungIPTernak from './components/HitungIPTernak';
import Dashboard from './components/Dashboard';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbySu3THdMbdj61t2jhA-d-ICbvE7Dn6L82NQQrscfx56InSfINq8L0rRMuDJpqqfCOV/exec';

// --- DATA FROM ORIGINAL JS ---
// Berita kini dimuat dari Database Google Apps Script

const sponsorsData = [
  {
    id: 1,
    name: "Hallo Abdi by Mas Abdi",
    logo: "https://turquoise-bernete-41.tiiny.site/NEW-LOGO-ABDI.svg",
    description: "Saya, Muhammad Abdi Firmansyah dari Kabupaten Bangkalan merupakan seorang mahasiswa Program Studi Agribisnis Peternakan semester enam di Politeknik Pembangunan Pertanian Malang. Saat ini, Saya sedang melaksanakan program magang berdampak di Dinas Peternakan dan Kesehatan Hewan Kabupaten Bangkalan untuk memberdayakan kelompok peternak lokal. Sebagai wujud nyata pengabdian, Saya berinovasi dengan merancang platform digital SATUTERNAK secara mandiri serta memelopori program hilirisasi produk olahan daging.",
    socials: [
      { icon: '<Instagram size={18} />', url: "https://instagram.com/hallo.abdi", label: "Instagram" },
      { icon: '<Youtube size={18} />', url: "https://youtube.com/@halloabdi/", label: "YouTube" },
      { icon: '<Globe size={18} />', url: "https://tiktok.com/@hallo.abdi", label: "TikTok" },
      { icon: '<Globe size={18} />', url: "https://threads.com/@hallo.abdi/", label: "Threads" },
      { icon: '<Globe size={18} />', url: "https://patreon.com/halloabdi/", label: "Patreon" },
      { icon: '<Facebook size={18} />', url: "https://facebook.com/MasAbdiA1/", label: "Facebook" },
    ]
  },
  {
    id: 2,
    name: "Hallo Abdi Store",
    logo: "https://turquoise-bernete-41.tiiny.site/HALLO-ABDI-STORE-NEW-transparan.svg",
    description: "Hallo Abdi Store hadir sebagai mitra digital terpercaya yang menyediakan berbagai kebutuhan akun premium resmi dan layanan produktivitas terbaik untuk menunjang keseharian Anda. Berkomitmen penuh pada keamanan, kami menjamin seluruh langganan aplikasi yang ditawarkan 100% legal dan bebas dari risiko penggunaan crack atau mod berbahaya. Mulai dari akses ke platform desain, kecerdasan buatan mutakhir, hingga layanan pendampingan akademik, semuanya tersedia lengkap dengan harga yang sangat ramah di kantong. Mari tingkatkan efisiensi kerja dan pengalaman digital Anda ke level berikutnya bersama kami, solusi palugada yang cerdas, aman, dan dapat diandalkan.",
    socials: [
      { icon: '<Instagram size={18} />', url: "https://instagram.com/halloabdistore/", label: "Instagram" },
      { icon: '<Youtube size={18} />', url: "https://youtube.com/@halloabdistore/", label: "YouTube" },
      { icon: '<Globe size={18} />', url: "https://tiktok.com/@halloabdistore/", label: "TikTok" },
      { icon: '<Globe size={18} />', url: "https://threads.com/@halloabdistore/", label: "Threads" },
    ]
  },
  {
    id: 3,
    name: "Ny. Harmoni",
    logo: "https://turquoise-bernete-41.tiiny.site/560562387_18199694734314364_5190531604413534985_n.svg",
    description: "Ny. Harmoni merupakan seseorang misterius sekaligus pendana untuk Hallo Abdi Store serta pengembang program A1Byte. Tidak ada informasi kapan lahir dan tinggal di mana. #SetiaBersamaHarmoni",
    socials: [
      { icon: '<Facebook size={18} />', url: "https://facebook.com/A1ByteOfficial/", label: "Facebook" },
      { icon: '<Instagram size={18} />', url: "https://instagram.com/nyhmny0/", label: "Instagram" },
      { icon: '<Twitter size={18} />', url: "https://twitter.com/A1ByteOfficial/", label: "Twitter" },
    ]
  }
];

const getSocialStyle = (label) => {
  switch (label.toLowerCase()) {
    case 'instagram': return 'bg-[#d6249f] hover:bg-[#b01d83] text-white border border-[#d6249f]/30 shadow-lg shadow-pink-900/20';
    case 'youtube': return 'bg-[#c4302b] hover:bg-[#a01d19] text-white border border-[#c4302b]/30 shadow-lg shadow-red-900/20';
    case 'tiktok': return 'bg-black hover:bg-gray-900 text-white border border-gray-800 shadow-lg shadow-gray-900/20';
    case 'threads': return 'bg-black hover:bg-gray-900 text-white border border-gray-800 shadow-lg shadow-gray-900/20';
    case 'patreon': return 'bg-[#FF424D] hover:bg-[#d6333d] text-white border border-[#FF424D]/30 shadow-lg shadow-red-900/20';
    case 'facebook': return 'bg-[#1877F2] hover:bg-[#166fe5] text-white border border-[#1877F2]/30 shadow-lg shadow-blue-900/20';
    case 'twitter': return 'bg-[#1DA1F2] hover:bg-[#1a91da] text-white border border-[#1DA1F2]/30 shadow-lg shadow-blue-900/20';
    default: return 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200';
  }
};

const Footer = () => (
  <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pt-16 pb-24 md:pb-8 transition-colors duration-500">
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="text-3xl md:text-4xl font-extrabold tracking-tighter text-gray-900 dark:text-white">SATUTERNAK</span>
            <span className="w-2 h-2 rounded-full bg-green-500 mt-2"></span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Copyright &copy; 2025 All Rights Reserved.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://youtube.com/@SATUTERNAKID" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c4302b] hover:bg-[#a01d19] text-white transition-all duration-300 hover:scale-105 group border border-[#c4302b]/30 shadow-lg shadow-red-900/20">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.498-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            <span className="font-bold text-sm">YouTube</span>
          </a>

          <a href="https://instagram.com/SATUTERNAKID" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d6249f] hover:bg-[#b01d83] text-white transition-all duration-300 hover:scale-105 group border border-[#d6249f]/30 shadow-lg shadow-pink-900/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            <span className="font-bold text-sm">Instagram</span>
          </a>

          <a href="https://threads.net/@SATUTERNAKID" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-gray-900 text-white transition-all duration-300 hover:scale-105 group border border-gray-800 shadow-lg">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M17.74 16.51c-.69 1.55-2.14 2.49-4.22 2.49-2.32 0-4.32-1.63-4.32-4.51 0-2.76 2.05-4.63 4.67-4.63 1.63 0 2.85.75 3.32 1.57.18-.18.36-.36.52-.55-.78-1.43-2.31-2.45-4.35-2.45-3.55 0-6.42 2.82-6.42 6.37 0 3.42 2.76 6.13 6.31 6.13 1.98 0 3.68-.87 4.81-2.28l-1.32-1.14z" /><path d="M12.87 12.3c-.87 0-1.63.66-1.63 1.83 0 1.05.69 1.69 1.52 1.69.84 0 1.55-.66 1.55-1.8 0-1.08-.66-1.72-1.44-1.72z" /></svg>
            <span className="font-bold text-sm">Threads</span>
          </a>

          <a href="https://www.patreon.com/checkout/halloabdi?rid=23390429" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF424D] hover:bg-[#d6333d] text-white transition-all duration-300 hover:scale-105 group border border-[#FF424D]/30 shadow-lg shadow-red-900/20">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white"><path d="M0 .48v23.04h4.22V.48zm15.385 0c-4.764 0-8.641 3.88-8.641 8.65 0 4.755 3.877 8.623 8.641 8.623 4.75 0 8.615-3.868 8.615-8.623C24 .48 20.136.48 15.385.48z" /></svg>
            <span className="font-bold text-sm">Patreon</span>
          </a>

          <a href="https://wa.oia.bio/SatuTernak" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebc59] text-white transition-all duration-300 hover:scale-105 group border border-[#25D366]/30 shadow-lg shadow-green-900/20">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            <span className="font-bold text-sm">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
);




// --- DATA FROM ORIGINAL JS ---
const SERVICES = [
  { id: 1, title: 'Rekording', icon: ClipboardList, hasSubMenu: true },
  { id: 2, title: 'Hitung Bisnis', icon: Calculator, hasSubMenu: true },
  { id: 3, title: 'Susun Kebutuhan', icon: Activity, hasSubMenu: true },
  { id: 4, title: 'Analisa Kesehatan', icon: Stethoscope, hasSubMenu: true },
  { id: 8, title: 'Cek Harga Pasar', icon: TrendingUp, hasSubMenu: true },
  { id: 9, title: 'Konsultasi Ahli', icon: Users, hasSubMenu: false },
  { id: 6, title: 'Perpustakaan', icon: BookOpen, hasSubMenu: false },
  { id: 7, title: 'Toko Ternak', icon: ShoppingCart, hasSubMenu: false },
];
const RECORDING_ACTIONS = [
  { id: 'pakan', title: 'Catatan Pakan', icon: Utensils },
  { id: 'ternak', title: 'Catat Ternak', icon: ClipboardList },
  { id: 'vitamin', title: 'Catat Vitamin', icon: Syringe },
  { id: 'ip', title: 'Hitung IP Ternak', icon: Calculator },
];
const MARKET_PRICE_ACTIONS = [
  { id: 'telur', title: 'Cek Harga Telur', icon: Egg },
  { id: 'daging', title: 'Cek Harga Daging', icon: Drumstick },
  { id: 'susu', title: 'Cek Harga Susu', icon: Milk },
  { id: 'bibit', title: 'Cek Harga Bibit/Benih', icon: Sprout },
  { id: 'bahan', title: 'Cek Harga Bahan Kandang', icon: Hammer },
];
const TESTIMONIALS = [
  { name: "Drh. Siti Aminah", role: "Dokter Hewan", text: "Fitur AI diagnosa awalnya sangat membantu sebelum pemeriksaan fisik. Sangat akurat dan berbasis data ilmiah terbaru. Ini benar-benar menghemat waktu saya dalam menentukan diagnosa awal di lapangan." },
  { name: "Budi Santoso", role: "Peternak Sapi Perah", text: "Menghitung ransum jadi lebih hemat dan efisien. Produksi susu sapi saya meningkat 20% sejak pakai Satuternak. Dulu saya sering rugi di pakan, sekarang margin keuntungan jadi lebih tebal berkat fitur formulasinya." },
  { name: "Prof. Dr. Bambang", role: "Analisis Nutrisi", text: "Platform yang revolusioner. Standar perhitungan IP yang digunakan sudah sesuai dengan standar internasional. Data yang disajikan sangat komprehensif untuk kebutuhan riset maupun industri skala besar." },
  { name: "Rina Wijaya", role: "Mahasiswa Peternakan", text: "Sangat membantu untuk skripsi dan penelitian. Data perpustakaan pakannya sangat lengkap! Saya tidak perlu lagi mencari referensi manual dari buku-buku lama, semua sudah terdigitalisasi di sini." },
  { name: "Kelompok Ternak Maju", role: "Komunitas", text: "Budgeting ternak jadi transparan. Anggota kelompok kami jadi lebih percaya diri dalam investasi. Laporan keuangannya otomatis dan mudah dipahami oleh semua anggota, bahkan yang awam teknologi sekalipun." },
  { name: "Dr. Hendra", role: "Praktisi Bedah Hewan", text: "Interface sangat modern dan mudah digunakan bahkan oleh peternak senior. Solusi nyata untuk industri 4.0. Saya sering merekomendasikan aplikasi ini kepada klien-klien saya untuk manajemen pasca operasi." },
  { name: "Andi Pratama", role: "Peternak Kambing", text: "Aplikasi ini mengubah cara saya beternak. Monitoring kesehatan kambing jadi jauh lebih mudah dan terkontrol setiap saat. Notifikasi jadwal pemberian vitamin dan vaksinnya sangat membantu agar tidak terlewat." },
  { name: "CV. Berkah Ternak", role: "Distributor Pakan", text: "Kami merekomendasikan platform ini ke semua klien kami. Sangat membantu optimalisasi penggunaan ransum harian. Klien kami jadi lebih loyal karena hasil ternak mereka membaik signifikan." },
  { name: "Sari Murni", role: "Pengusaha Susu", text: "Efisiensi pakan meningkat drastis, kualitas susu yang dihasilkan pun jadi lebih premium dan harga jual naik. Analisis nutrisinya sangat detail membantu kami menjaga kualitas susu grade A." },
  { name: "Doni Kusuma", role: "Mahasiswa IPB", text: "Referensi terbaik untuk belajar manajemen ternak digital. UI/UX nya juga sangat user friendly bagi pemula. Sangat inspiratif melihat integrasi AI dalam dunia peternakan yang selama ini dianggap konvensional." },
  { name: "Farm Sejahtera", role: "Peternakan Ayam", text: "Fitur recordingnya sangat detail. Kami bisa melacak performa setiap periode panen dengan sangat baik dan akurat. Grafik pertumbuhannya memudahkan kami mengambil keputusan cepat saat ada anomali." },
  { name: "Drh. Indah", role: "Konsultan Kesehatan", text: "AI-nya sangat responsif dalam memberikan saran awal penanganan penyakit. Sangat inovatif untuk daerah terpencil yang akses ke dokter hewannya terbatas. Solusi cerdas untuk pemerataan kesehatan ternak." },
];
const PRICING = [
  {
    title: "Pemula",
    price: "Rp0",
    period: "/bulan",
    textColor: "text-gray-900 dark:text-white",
    btnColor: "bg-gray-800 text-white",
    btnHover: "hover:bg-black",
    features: ["Gratis Akses Fitur Standar"],
    style: "bg-white/40 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700",
    glow: false
  },
  {
    title: "Premium Student",
    price: "Rp35.000",
    period: "/bulan",
    textColor: "text-yellow-700 dark:text-yellow-500",
    btnColor: "bg-yellow-600 text-white",
    btnHover: "hover:bg-yellow-700",
    features: [
      "Gratis Akses Fitur Standar",
      "Gratis Akses Fitur Lanjutan",
      "Gratis Storage 5 GB",
      "Gratis Konsultasi Ahli (3 sesi/hari)",
      "Gratis Gabung Komunitas WhatsApp"
    ],
    style: "bg-gradient-to-b from-yellow-50/80 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)]",
    glow: true
  },
  {
    title: "Platinum Student",
    price: "USD$15K",
    period: "/bulan",
    textColor: "bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400",
    btnColor: "bg-gradient-to-r from-blue-900 to-purple-900 text-white",
    btnHover: "hover:brightness-110",
    features: [
      "Gratis Akses Fitur Standar",
      "Gratis Akses Fitur Lanjutan",
      "Gratis Akses Awal Fitur",
      "Gratis Storage 35 TB",
      "Gratis Analisa AI (Gemini, ChatGPT, etc)",
      "Gratis Konsultasi Ahli (20 sesi/hari)",
      "Prioritas Live Chat",
      "Gratis Gabung Komunitas WhatsApp dan Discord"
    ],
    style: "bg-gradient-to-b from-blue-50/80 to-purple-100/50 dark:from-blue-900/20 dark:to-purple-900/10 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.4)] transform md:scale-105 z-10",
    glow: true,
    recom: true
  }
];

// --- Custom Hooks & Utilities ---
const useScroller = () => {
  useEffect(() => {
    const scrollers = document.querySelectorAll(".scroller");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      scrollers.forEach((scroller) => {
        const inner = scroller.querySelector(".scroller__inner");
        if (!inner) return;
        if (scroller.getAttribute("data-animated")) return;

        scroller.setAttribute("data-animated", true);
        const scrollerContent = Array.from(inner.children);

        scrollerContent.forEach((item) => {
          const duplicatedItem = item.cloneNode(true);
          duplicatedItem.setAttribute("aria-hidden", true);
          inner.appendChild(duplicatedItem);
        });
      });
    }
  }, []);
};


const NavItem = ({ label, icon: Icon, active, onClick, mobile }) => (
  <button
    onClick={onClick}
    className={`
        flex items-center justify-center transition-all duration-300
        ${mobile
        ? 'flex-col w-full py-2 relative h-12 overflow-visible'
        : 'space-x-1 px-1.5 py-1 md:space-x-0.5 md:px-2 md:py-1 lg:space-x-2 lg:px-6 lg:py-3 rounded-full hover:bg-white/20'
      }
        ${active ? (mobile ? 'text-green-500' : 'bg-white/20 text-green-600 font-bold') : 'text-gray-700 dark:text-gray-300 font-semibold'}
      `}
  >
    <div className={`transition-all duration-300 flex items-center justify-center ${mobile ? (active ? '-translate-y-2' : 'translate-y-0.5') : ''}`}>
      <Icon size={28} className="w-7 h-7 md:w-4 md:h-4 lg:w-7 lg:h-7 flex-shrink-0" />
    </div>
    {(mobile && active) && (
      <div className="absolute bottom-0 w-[150%] left-1/2 -translate-x-1/2 flex justify-center pointer-events-none">
        <span className="text-center text-[9px] font-bold tracking-tighter animate-fade-in truncate">{label}</span>
      </div>
    )}
    {(!mobile) && <span className="text-xs md:text-[11px] lg:text-lg whitespace-nowrap">{label}</span>}
  </button>
);


const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-12 text-center">
    <h2 className="text-3xl md:text-5xl font-bold font-['Poppins'] mb-3 text-gray-800 dark:text-white">
      {title}
    </h2>
    <div className="h-1.5 w-24 bg-gradient-to-r from-green-400 to-blue-500 mx-auto rounded-full"></div>
    {subtitle && <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">{subtitle}</p>}
  </div>
);


const ServiceBox = ({ item, onClick }) => (
  <div
    onClick={onClick}
    className="group relative overflow-hidden rounded-3xl transition-all duration-500 cursor-pointer aspect-square w-full flex flex-col items-center justify-center gap-1 md:gap-2 border border-transparent hover:border-green-500 hover:shadow-[0_10px_40px_-10px_rgba(34,197,94,0.4)] bg-gradient-to-br from-green-900 to-green-500"
  >
    <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:group-hover:bg-gray-800"></div>
    <div className="relative z-10 flex flex-col items-center text-white transition-colors duration-500 group-hover:text-green-600 text-center px-1 md:px-1 lg:px-2">
      <div className="transform transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-2">
        <item.icon className="w-10 h-10 md:w-10 md:h-10 lg:w-14 lg:h-14" />
      </div>
      <span className="font-['Poppins'] mt-1 md:mt-2 text-sm md:text-[10px] lg:text-2xl font-bold leading-tight">
        {item.title}
      </span>
    </div>
  </div>
);

// FIX: SubServiceBox yang ukurannya disesuaikan sama persis dengan ServiceBox (Aspect Square)

const SubServiceBox = ({ title, icon: Icon, onClick }) => (
  <div
    onClick={onClick}
    className="group relative overflow-hidden rounded-3xl transition-all duration-500 cursor-pointer aspect-square w-full flex flex-col items-center justify-center gap-1 md:gap-2 border border-transparent hover:border-green-500 hover:shadow-[0_10px_40px_-10px_rgba(34,197,94,0.4)] bg-gradient-to-br from-green-900 to-green-500"
  >
    <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:group-hover:bg-gray-800"></div>
    <div className="relative z-10 flex flex-col items-center text-white transition-colors duration-500 group-hover:text-green-600 text-center px-1 md:px-1 lg:px-2">
      <div className="transform transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-2">
        <Icon className="w-10 h-10 md:w-10 md:h-10 lg:w-14 lg:h-14" />
      </div>
      <span className="font-['Poppins'] mt-1 md:mt-2 text-sm md:text-[10px] lg:text-2xl font-bold leading-tight">
        {title}
      </span>
    </div>
  </div>
);



const PricingCard = ({ plan, expanded, onToggle }) => {
  const visibleFeatures = expanded ? plan.features : plan.features.slice(0, 2);

  return (
    <div className={`relative p-8 rounded-[2rem] backdrop-blur-md flex flex-col ${plan.style} transition-all duration-500 hover:-translate-y-2 border group/card`}>
      {plan.recom && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg tracking-wider">
          REKOMENDASI
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2 text-black dark:text-white">{plan.title}</h3>
      <div className="flex items-baseline mb-6">
        <span className={`text-4xl font-extrabold ${plan.textColor}`}>{plan.price}</span>
        <span className="text-sm ml-1 text-gray-500 dark:text-gray-400 font-medium">{plan.period}</span>
      </div>

      <div className={`space-y-4 mb-8 flex-grow transition-all duration-500 ease-in-out overflow-hidden`}>
        {visibleFeatures.map((feat, i) => (
          <li key={i} className="flex items-start gap-3 animate-fade-in list-none">
            <CheckCircle size={20} className="mt-0.5 flex-shrink-0 text-green-500" />
            <span className="text-sm font-medium text-black dark:text-gray-200">{feat}</span>
          </li>
        ))}
      </div>

      {plan.features.length > 2 && (
        <button
          onClick={onToggle}
          className="mb-4 text-sm font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 underline-offset-4 transition-colors self-center flex items-center gap-1 group/btn relative overflow-hidden"
        >
          {/* Shine effect on text */}
          <span className="relative z-10 group-hover/btn:animate-text-shine bg-clip-text group-hover/btn:text-transparent group-hover/btn:bg-gradient-to-r group-hover/btn:from-gray-500 group-hover/btn:via-gray-800 group-hover/btn:to-gray-500 dark:group-hover/btn:from-gray-400 dark:group-hover/btn:via-white dark:group-hover/btn:to-gray-400 bg-300% no-underline">
            {expanded ? "Tutup" : "Selengkapnya"}
          </span>
        </button>
      )}

      <button className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl ${plan.btnColor} ${plan.btnHover} relative overflow-hidden group/shine`}>
        <span className="relative z-10">Pilih Paket</span>
        {/* Shine Animation on Button Background */}
        <div className="absolute inset-0 -translate-x-full group-hover/shine:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0"></div>
      </button>
    </div>
  );
};


const getToastStyles = (type) => {
  switch (type) {
    case 'error':
    case 'failed':
    case 'fatal':
      return {
        bg: 'bg-gradient-to-r from-red-600 to-red-500',
        icon: <X className="w-6 h-6 text-white" />,
        border: 'border-red-400 dark:border-red-600'
      };
    case 'success':
      return {
        bg: 'bg-gradient-to-r from-green-600 to-emerald-500',
        icon: <CheckCircle className="w-6 h-6 text-white" />,
        border: 'border-green-400 dark:border-green-600'
      };
    case 'warning':
      return {
        bg: 'bg-gradient-to-r from-amber-600 to-yellow-600',
        icon: <AlertTriangle className="w-6 h-6 text-white" />,
        border: 'border-amber-500 dark:border-amber-700'
      };
    case 'info':
    default:
      return {
        bg: 'bg-gradient-to-r from-blue-500 to-sky-500',
        icon: <Info className="w-6 h-6 text-white" />,
        border: 'border-blue-400 dark:border-blue-600'
      };
  }
};

const ToastNotification = ({ type, title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const style = getToastStyles(type);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, x: "-50%" }}
      animate={{ y: 24, opacity: 1, x: "-50%" }}
      exit={{ y: -100, opacity: 0, x: "-50%" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="fixed top-0 left-1/2 z-[100] w-full max-w-sm px-4 md:max-w-md pointer-events-none"
    >
      <div className={`pointer-events-auto flex items-center gap-4 p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border backdrop-blur-md text-white ${style.bg} ${style.border}`}>
        <div className="bg-white/20 p-2 rounded-full shrink-0 backdrop-blur-sm shadow-inner">
          {style.icon}
        </div>
        <div className="flex-1 pt-0.5">
          <h4 className="font-extrabold text-[15px] tracking-wide drop-shadow-sm leading-tight">{title}</h4>
          <p className="text-[12px] opacity-95 mt-1 leading-relaxed font-medium drop-shadow-sm">{message}</p>
        </div>
        <button onClick={onClose} className="shrink-0 p-1.5 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm">
          <X size={18} className="text-white drop-shadow-sm" />
        </button>
      </div>
    </motion.div>
  );
};



// --- Main Application ---
export function LandingPage() {
  const [activeSection, setActiveSection] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [showLogin, setShowLogin] = useState(window.location.hash === '#login');
  const [allPricesExpanded, setAllPricesExpanded] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [modalState, setModalState] = useState({ isOpen: false, type: null, data: null });
  const openModal = (type, data) => setModalState({ isOpen: true, type, data });
  const closeModal = () => setModalState({ isOpen: false, type: null, data: null });

  const [newsData, setNewsData] = useState([]);
  const [currentNewsPage, setCurrentNewsPage] = useState(1);
  const [rememberLogin, setRememberLogin] = useState(true);

  // AUTO REDIRECT LOGIC
  useEffect(() => {
    const rawData = localStorage.getItem('satuternak_user');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        if (parsed && parsed.expiry) {
          if (Date.now() > parsed.expiry) {
            localStorage.removeItem('satuternak_user'); // Sesi habis
          } else {
            // Valid, lompat ke dashboard
            window.location.hash = '';
            window.location.pathname = '/Dashboard';
          }
        } else if (parsed) {
          // Format lama tanpa expiry
          window.location.hash = '';
          window.location.pathname = '/Dashboard';
        }
      } catch (e) { }
    }
  }, []);

  // FETCH NEWS DATA DARI GOOGLE APPS SCRIPT
  useEffect(() => {
    fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action: "getBerita" })
    })
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success') {
          // Transform data dari array object Spreadsheet
          const formatted = res.data.map(item => ({
            id: item['ID Berita'],
            title: item['Judul'],
            category: item['Kategori'],
            thumbnail: item['Thumbnail URL'],
            author: item['Penulis'],
            content: item['Konten'],
            isPinned: item['isPinned'] === "Ya"
          }));
          setNewsData(formatted);
        }
      })
      .catch(console.error);
  }, []);

  const pinnedNews = newsData.filter(n => n.isPinned);
  const regularNews = newsData.filter(n => !n.isPinned);
  const totalNewsPages = Math.ceil(regularNews.length / 4);

  const [activeService, setActiveService] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);

  const [toast, setToast] = useState(null);
  const showToast = (type, title, message) => {
    setToast({ type, title, message, id: Date.now() });
  };

  useScroller();

  // FIX: Bulletproof JS Marquee to entirely prevent CSS jumping when tab is inactive
  useEffect(() => {
    let animFrameIds = [];
    let state = [];

    const elements = document.querySelectorAll('.animate-loop-scroll, .marquee-content');

    elements.forEach((el, index) => {
      // Disable CSS animations gracefully to let JS take over
      el.style.animation = 'none';

      let xPos = 0;
      let speed = el.classList.contains('marquee-content') ? 1.2 : 1.5;
      let isHovered = false;

      const animate = () => {
        if (!isHovered) {
          xPos -= speed;
          // Loop cleanly at exactly half width (since children are duplicated perfectly)
          const maxScroll = el.scrollWidth / 2;
          if (maxScroll > 0 && Math.abs(xPos) >= maxScroll) {
            xPos += maxScroll; // Seamless sub-pixel reset
          }
          el.style.transform = `translate3d(${xPos}px, 0, 0)`;
        }
        animFrameIds[index] = requestAnimationFrame(animate);
      };

      const hEnter = () => isHovered = true;
      const hLeave = () => isHovered = false;

      el.addEventListener('mouseenter', hEnter);
      el.addEventListener('mouseleave', hLeave);

      state.push({ el, hEnter, hLeave });
      animFrameIds[index] = requestAnimationFrame(animate);
    });

    return () => {
      animFrameIds.forEach(id => cancelAnimationFrame(id));
      state.forEach(s => {
        s.el.removeEventListener('mouseenter', s.hEnter);
        s.el.removeEventListener('mouseleave', s.hLeave);
      });
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'info', 'sponsor', 'testi', 'pricing'];
      const scrollPosition = window.scrollY + 150;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleServiceClick = (service) => {
    if (service.hasSubMenu) {
      setActiveService(service.id);
      setActiveSubMenu(null);
      setTimeout(() => {
        const element = document.getElementById('services');
        if (element) {
          const headerOffset = 100;
          const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 50);
    } else {
      handleFeatureClick(service.title);
    }
  };

  const handleBackToServices = () => {
    setActiveService(null);
    setActiveSubMenu(null);
    setTimeout(() => {
      const element = document.getElementById('services');
      if (element) {
        const headerOffset = 100;
        const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }, 50);
  };

  const handleBackToSubMenu = () => {
    setActiveSubMenu(null);
  };

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    showToast('info', 'Harap Tunggu', 'Mencoba masuk ke sistem...');

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbw8PPdSeOky1W3VIWur2hgnEqsshfMKFie7EMPNEzfoBrr7aW56eMtak14LUem3s3jE/exec', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', emailOrUsername: loginEmail, password: loginPassword })
      });

      const resJson = await response.json();

      if (resJson.status === 'success') {
        const payloadToSave = { ...resJson.data };
        if (rememberLogin) {
          payloadToSave.expiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 hari dari sekarang
        } else {
          payloadToSave.expiry = Date.now() + (24 * 60 * 60 * 1000); // 1 hari saja (default minimal)
        }
        localStorage.setItem('satuternak_user', JSON.stringify(payloadToSave));
        setShowLogin(false);
        showToast('success', 'Login Berhasil', 'Mengarahkan ke Dashboard...');
        setTimeout(() => {
          window.location.hash = '';
          window.location.pathname = '/Dashboard';
        }, 1000);
      } else {
        showToast('error', 'Gagal', resJson.message || 'Username/Email atau Password salah!');
      }
    } catch (error) {
      showToast('error', 'Koneksi Gagal', 'Gagal terhubung ke server database. Error: ' + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFeatureClick = (featureName) => {
    const premiumFeatures = ["Catatan Pakan", "Catat Ternak", "Catat Vitamin", "Data Tersimpan"];
    if (premiumFeatures.includes(featureName)) {
      showToast('warning', 'Akses Terbatas', `Silahkan melakukan Login untuk menggunakan fitur ${featureName} atau kontak Developer untuk dapat uji coba gratis.`);
    } else {
      showToast('info', 'Sedang Dikembangkan', `Fitur ${featureName} masih dalam pengembangan. Silahkan hubungi Developer untuk info lebih lanjut.`);
    }
  };

  const truncateString = (str, num) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
  };

  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0);
  useEffect(() => {
    if (pinnedNews.length <= 1) return;

    let timeoutId;
    const slideNext = () => {
      setCurrentPinnedIndex((prev) => (prev + 1) % pinnedNews.length);
      const nextTime = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;
      timeoutId = setTimeout(slideNext, nextTime);
    };
    const initialTime = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;
    timeoutId = setTimeout(slideNext, initialTime);

    return () => clearTimeout(timeoutId);
  }, [pinnedNews.length]);

  const handlePrevPinned = () => {
    setCurrentPinnedIndex((prev) => (prev === 0 ? pinnedNews.length - 1 : prev - 1));
  };

  const handleNextPinned = () => {
    setCurrentPinnedIndex((prev) => (prev + 1) % pinnedNews.length);
  };

  const marqueeSponsors = [...sponsorsData, ...sponsorsData, ...sponsorsData, ...sponsorsData];

  const renderLoginModal = () => (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowLogin(false)}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden p-8 border border-white/20 z-10"
      >
        <button onClick={() => setShowLogin(false)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-xl transition-all">
          <X size={22} />
        </button>
        <h2 className="text-2xl font-extrabold text-center mb-6 font-['Poppins'] text-green-600">Login SATUTERNAK</h2>
        <form className="space-y-4" onSubmit={handleLoginSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email / Username</label>
            <input type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 outline-none" placeholder="peternak@contoh.com" required disabled={isLoggingIn} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 outline-none" placeholder="••••••••" required disabled={isLoggingIn} />
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="remember" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300" checked={rememberLogin} onChange={(e) => setRememberLogin(e.target.checked)} />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Ingat Saya 30 Hari
            </label>
          </div>
          <button type="submit" disabled={isLoggingIn} className={`w-full ${isLoggingIn ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white py-3 rounded-xl font-bold transition shadow-lg hover:shadow-green-500/30`}>
            {isLoggingIn ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>
      </motion.div>
    </div>
  );

  return (
    <div className={`min-h-[100dvh] overflow-x-hidden font-['Poppins'] transition-colors duration-500 ${darkMode ? 'dark bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes loop-scroll {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(-50%, 0, 0); }
        }
        .animate-loop-scroll {
            animation: loop-scroll 50s linear infinite;
        }
        .scroller:hover .animate-loop-scroll {
            animation-play-state: paused;
        }
        
        .glass-header {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          transform: translateZ(0); 
          will-change: transform;
        }
        .dark .glass-header {
          background: rgba(17, 24, 39, 0.7);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .glass-nav-mobile {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .dark .glass-nav-mobile {
          background: rgba(10, 10, 10, 0.95);
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        @keyframes text-shine {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }
        .bg-300% { background-size: 300% auto; }

        .scroller { max-width: 100%; }
        .scroller__inner {
            padding-block: 1rem;
            display: flex;
            flex-wrap: nowrap;
            gap: 10rem; 
        }
        .scroller[data-animated="true"] { overflow: hidden; -webkit-mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent); mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent); }
        .scroller[data-animated="true"] .scroller__inner { width: max-content; flex-wrap: nowrap; animation: scroll var(--_animation-duration, 40s) var(--_animation-direction, forwards) linear infinite; }
        .scroller[data-animated="true"] .scroller__inner:hover { animation-play-state: paused; }
        
        @keyframes scroll { to { transform: translate(calc(-50% - 0.5rem)); } }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        /* Global Modern Scrollbar */
        ::-webkit-scrollbar {
          width: 12px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .dark ::-webkit-scrollbar-track {
          background: #0f172a;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #3b82f6);
          border-radius: 100vh;
          border: 3px solid #f1f5f9;
        }
        .dark ::-webkit-scrollbar-thumb {
          border: 3px solid #0f172a;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #2563eb);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
          border: none;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border: none;
        }

        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
          width: 100%;
          position: relative;
        }

        .marquee-content {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
          will-change: transform;
        }

        .marquee-content:hover {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }

        .tab-inactive .animate-loop-scroll,
        .tab-inactive .marquee-content,
        .tab-inactive .scroller[data-animated="true"] .scroller__inner {
            animation-play-state: paused !important;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .dark .glass-card {
          background: rgba(31, 41, 55, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}} />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:bg-green-600/10"></div>
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:bg-blue-600/10"></div>
      </div>

      <AnimatePresence>
        {toast && (
          <ToastNotification
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
        {/* --- MODAL LOGIN PINTASAN --- */}
        {showLogin && renderLoginModal()}
      </AnimatePresence>

      {/* --- Header (Desktop & Tablet) --- */}
      <header className="hidden md:flex fixed top-0 w-full z-50 glass-header px-2 md:px-2 lg:px-4 py-3 md:py-2 lg:py-3 justify-between items-center transition-all">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('home')}>
          <div className="w-8 h-8 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow-lg">S</div>
          <span className="font-bold text-xl md:text-lg lg:text-3xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">SATUTERNAK</span>
        </div>

        <nav className="flex items-center space-x-1 md:space-x-0 lg:space-x-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-full p-1 backdrop-blur-md border border-white/20 shadow-sm flex-shrink">
          <NavItem label="Beranda" icon={Home} active={activeSection === 'home'} onClick={() => scrollTo('home')} />
          <NavItem label="Tentang" icon={Info} active={activeSection === 'about'} onClick={() => scrollTo('about')} />
          <NavItem label="Layanan" icon={Briefcase} active={activeSection === 'services'} onClick={() => scrollTo('services')} />
          <NavItem label="Informasi" icon={FileText} active={activeSection === 'info'} onClick={() => scrollTo('info')} />
          <NavItem label="Sponsor" icon={Users} active={activeSection === 'sponsor'} onClick={() => scrollTo('sponsor')} />
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 lg:mx-2"></div>
          <NavItem label="Login" icon={User} active={showLogin} onClick={() => { setShowLogin(true); window.location.hash = '#login'; }} />
        </nav>

        <button onClick={toggleTheme} className="p-2 lg:p-3 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition flex-shrink-0">
          {darkMode ? <Sun size={20} className="lg:w-6 lg:h-6 text-yellow-400" /> : <Moon size={20} className="lg:w-6 lg:h-6 text-gray-600" />}
        </button>
      </header>

      {/* --- Mobile Header --- */}
      <div className="md:hidden fixed top-0 left-0 w-full z-40 glass-header px-4 py-3 flex justify-between items-center" style={{ width: '100vw' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600 tracking-tighter">SATUTERNAK</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur">
            {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
          </button>
        </div>
      </div>

      <main className="relative z-10 pt-20 md:pt-32 pb-12 md:pb-10">

        {/* 1. Beranda */}
        <section id="home" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 pt-6 md:pt-32">
          <div className="text-center mb-16">
            <h1 className="font-extrabold mb-8 flex flex-col items-center">
              <span className="block text-[46px] sm:text-5xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-emerald-400 drop-shadow-sm pb-1 leading-none z-10 tracking-tight">SATUTERNAK</span>
              <span className="block text-[1.4rem] sm:text-2xl md:text-4xl lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-600 -mt-1 md:-mt-4 z-20 tracking-tighter">#MenujuPeternakanModern</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 font-medium">
              Transformasi peternakan rakyat ke era digital. Pantau, analisis, dan tingkatkan performa ternak Anda dalam satu genggaman.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
            <div className="glass-card p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300 group flex items-center md:flex-col md:justify-center md:text-center gap-4 md:gap-0">
              <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center md:mb-6 group-hover:scale-110 transition-transform">
                <PenTool className="w-7 h-7 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base md:text-xl font-bold">Rekording Data Ternak</h3>
            </div>

            <div className="glass-card p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300 group flex items-center md:flex-col md:justify-center md:text-center gap-4 md:gap-0">
              <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center md:mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 md:w-8 md:h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-base md:text-xl font-bold">Analisis Performa & Usaha</h3>
            </div>

            <div className="glass-card p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300 group flex items-center md:flex-col md:justify-center md:text-center gap-4 md:gap-0">
              <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center md:mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-base md:text-xl font-bold">Perpustakaan Digital</h3>
            </div>
          </div>
        </section>

        {/* 2. Tentang */}
        <section id="about" className="py-16 md:py-24 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-sm mb-2 block">Tentang Platform</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Mengenal SATUTERNAK</h2>
            <div className="glass-card p-8 md:p-10 rounded-3xl shadow-2xl relative">
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                "SATUTERNAK adalah platform digital gratis yang dirancang bagi peternak pemula hingga profesional dalam mengelola usaha peternakan."
              </p>
              <button
                onClick={() => openModal('about', aboutText)}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center mx-auto gap-2"
              >
                Baca Selengkapnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* 3. Layanan */}
        <section id="services" className="px-4 md:px-12 max-w-[1440px] mx-auto w-full mb-10 md:mb-14">
          <SectionHeader title="Layanan Kami" subtitle="Fitur lengkap untuk menunjang produktivitas ternak Anda" />

          {/* Tampilan Level 1: Default Grid Layanan */}
          {!activeService && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 xl:gap-8">
              {SERVICES.map((service) => (
                <ServiceBox
                  key={service.id}
                  item={service}
                  onClick={() => handleServiceClick(service)}
                />
              ))}
            </div>
          )}

          {/* Tampilan Level 2: Sub-Menu (Data Tersimpan / Buat Baru) */}
          {activeService && !activeSubMenu && (
            <div className="flex flex-col items-center animate-fade-in w-full">
              <button
                onClick={handleBackToServices}
                className="mb-8 flex items-center gap-2 px-6 py-2 bg-white/50 hover:bg-white text-gray-700 font-bold rounded-full backdrop-blur-md shadow-sm border border-white/20 transition-all hover:scale-105"
              >
                <ChevronLeft size={20} /> Kembali
              </button>

              {/* FIX: Container flex untuk memastikan ukuran kotak proporsional */}
              {/* LOGIC FIX: Render menu khusus Cek Harga Pasar langsung jika activeService === 8 */}
              {activeService === 8 ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 xl:gap-8 w-full">
                  {MARKET_PRICE_ACTIONS.map((action) => (
                    <SubServiceBox
                      key={action.id}
                      title={action.title}
                      icon={action.icon}
                      onClick={() => handleFeatureClick(action.title)}
                    />
                  ))}
                </div>
              ) : (
                /* Default Sub-Menu (Data Tersimpan / Buat Baru) untuk layanan selain Cek Harga Pasar (misal Rekording) */
                <div className="flex flex-wrap justify-center gap-3 md:gap-4 xl:gap-8 w-full">
                  <div className="w-[48%] md:w-[19%]">
                    <SubServiceBox
                      title="Data Tersimpan"
                      icon={Database}
                      onClick={() => handleFeatureClick("Data Tersimpan")}
                    />
                  </div>
                  <div className="w-[48%] md:w-[19%]">
                    <SubServiceBox
                      title="Buat Data Baru"
                      icon={FilePlus}
                      onClick={() => {
                        if (activeService === 1) {
                          setActiveSubMenu('create_new');
                        } else {
                          handleFeatureClick("Buat Data Baru");
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tampilan Level 3: Menu Buat Data Baru (Khusus Rekording) */}
          {activeService && activeSubMenu === 'create_new' && !activeFeature && (
            <div className="flex flex-col items-center animate-fade-in w-full">
              <button
                onClick={handleBackToSubMenu}
                className="mb-8 flex items-center gap-2 px-6 py-2 bg-white/50 hover:bg-white text-gray-700 font-bold rounded-full backdrop-blur-md shadow-sm border border-white/20 transition-all hover:scale-105"
              >
                <ChevronLeft size={20} /> Kembali
              </button>

              <div className="flex flex-wrap justify-center gap-3 md:gap-4 xl:gap-8 w-full">
                {/* LOGIC FIX: Pastikan ini hanya untuk Rekording (ID 1) atau layanan lain yang menggunakan struktur ini */}
                {activeService === 1 ? (
                  RECORDING_ACTIONS.map((action) => (
                    <div key={action.id} className="w-[48%] md:w-[19%]">
                      <SubServiceBox
                        title={action.title}
                        icon={action.icon}
                        onClick={() => {
                          if (action.id === 'ip') {
                            setActiveFeature('hitung_ip');
                          } else {
                            handleFeatureClick(action.title);
                          }
                        }}
                      />
                    </div>
                  ))
                ) : (
                  // Fallback jika layanan lain masuk ke sini tanpa konfigurasi
                  <div className="w-full text-center p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                    <p className="text-gray-500 dark:text-gray-400">Fitur masih dalam pengembangan. Silahkan hubungi Developer untuk info lebih lanjut.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tampilan Level 4: Fitur Spesifik */}
          {activeFeature === 'hitung_ip' && (
            <HitungIPTernak onBack={() => setActiveFeature(null)} />
          )}

        </section>



        {/* 4. Informasi */}
        <section id="info" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="mb-12 flex justify-between items-end border-b border-gray-200 dark:border-gray-800 pb-4">
            <div>
              <span className="text-green-600 dark:text-green-400 font-bold tracking-wider uppercase text-sm mb-1 block">Berita & Edukasi</span>
              <h2 className="text-3xl md:text-4xl font-bold">Informasi Terkini</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-10 items-stretch min-h-[450px] lg:min-h-[550px]">

            {/* Pinned News */}
            <div className="relative overflow-hidden glass-card rounded-3xl shadow-xl group h-full flex flex-col">
              <motion.div
                className="flex flex-1 w-full"
                animate={{ x: `-${currentPinnedIndex * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = offset.x;
                  if (swipe < -50) {
                    handleNextPinned();
                  } else if (swipe > 50) {
                    handlePrevPinned();
                  }
                }}
              >
                {pinnedNews.map((news) => (
                  <div
                    key={news.id}
                    className="w-full h-full flex-shrink-0 relative flex flex-col cursor-pointer"
                    onClick={() => openModal('news', news)}
                  >
                    <img src={news.thumbnail} alt={news.title} className="absolute inset-0 w-full h-full object-cover z-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10 z-10"></div>

                    <div className="relative z-20 flex flex-col h-full p-5 md:p-8 text-white">
                      <div className="mb-auto">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 w-max">
                          <Pin className="w-3.5 h-3.5 fill-white" /> Sorotan
                        </span>
                      </div>

                      <div className="mt-auto pt-10">
                        <div className="text-xs md:text-sm font-bold text-blue-300 mb-2 uppercase tracking-wider">{news.category}</div>
                        <h3 className="text-3xl md:text-4xl font-extrabold mb-3 md:mb-4 leading-snug">{news.title}</h3>

                        <p className="text-sm md:text-base text-gray-200 mb-10 md:mb-12 line-clamp-2 md:line-clamp-3 text-justify">
                          {news.content}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/20 relative z-40">
                          <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-gradient-to-r from-green-800 via-green-500 to-sky-400 text-white text-[10px] md:text-xs font-bold shadow-md truncate max-w-[60%]">
                            Oleh {news.author}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal('news', news); }}
                            className="text-xs md:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 md:px-5 py-2 md:py-2.5 rounded-xl transition-colors shadow-lg shrink-0"
                          >
                            Yuk Baca!
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>

              <button
                onClick={(e) => { e.stopPropagation(); handlePrevPinned(); }}
                className="absolute top-1/2 -translate-y-1/2 left-4 z-30 p-2 md:p-3 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNextPinned(); }}
                className="absolute top-1/2 -translate-y-1/2 right-4 z-30 p-2 md:p-3 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-[5.5rem] md:bottom-[6.5rem] left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {pinnedNews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentPinnedIndex(idx); }}
                    className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${idx === currentPinnedIndex ? 'w-6 md:w-8 bg-blue-500' : 'w-1.5 md:w-2 bg-white/50 hover:bg-white/80'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Regular News */}
            <div className="h-full flex flex-col pt-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentNewsPage}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="grid grid-cols-2 grid-rows-2 gap-4 md:gap-6 flex-grow"
                >
                  {regularNews.slice((currentNewsPage - 1) * 4, currentNewsPage * 4).map((news) => (
                    <div key={news.id} className="glass-card rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col group h-full cursor-pointer" onClick={() => openModal('news', news)}>
                      <div className="h-32 md:h-44 xl:h-52 relative overflow-hidden shrink-0">
                        <img src={news.thumbnail} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4 flex flex-col flex-grow justify-between">
                        <div>
                          <div className="text-xs md:text-sm font-bold text-green-600 dark:text-green-400 mb-2 uppercase line-clamp-1 tracking-wide">{news.category}</div>
                          <h3 className="text-base md:text-lg xl:text-xl font-extrabold mb-2 md:mb-3 leading-snug line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{news.title}</h3>
                          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-5 line-clamp-3 text-justify">
                            {news.content}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); openModal('news', news); }}
                          className="text-sm md:text-base font-bold text-center w-full text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/50 px-4 py-2.5 md:py-3 rounded-xl transition-colors mt-auto"
                        >
                          Yuk Baca!
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Pagination Controls */}
              {(totalNewsPages > 1 || regularNews.length > 0) && (
                <div className="flex justify-center items-center gap-1.5 md:gap-2 mt-6 pt-2 shrink-0">
                  <button
                    onClick={() => setCurrentNewsPage(p => Math.max(1, p - 1))}
                    disabled={currentNewsPage === 1}
                    className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow transition-all duration-300 flex items-center gap-1 border border-gray-100 dark:border-gray-700"
                  >
                    <ChevronLeft size={16} /> <span className="hidden md:inline">Before</span>
                  </button>

                  {Array.from({ length: totalNewsPages > 0 ? totalNewsPages : 1 }, (_, i) => i + 1).map(page => {
                    if (
                      page === 1 ||
                      page === totalNewsPages ||
                      page === currentNewsPage ||
                      (page === currentNewsPage - 1 && page > 1) ||
                      (page === currentNewsPage + 1 && page < totalNewsPages)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentNewsPage(page)}
                          className={`w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm font-bold rounded-xl shadow transition-all duration-300 flex items-center justify-center border ${currentNewsPage === page ? 'bg-gradient-to-br from-green-500 to-blue-600 text-white scale-110 shadow-green-500/30 border-transparent' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-700'}`}
                        >
                          {page}
                        </button>
                      )
                    }
                    if (
                      (page === currentNewsPage - 2 && page > 1) ||
                      (page === currentNewsPage + 2 && page < totalNewsPages)
                    ) {
                      return <span key={page} className="text-gray-500 font-bold px-1 md:px-2">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setCurrentNewsPage(p => Math.min(totalNewsPages, p + 1))}
                    disabled={currentNewsPage === totalNewsPages || totalNewsPages === 0}
                    className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow transition-all duration-300 flex items-center gap-1 border border-gray-100 dark:border-gray-700"
                  >
                    <span className="hidden md:inline">Next</span> <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* 5. Sponsor */}
        <section id="sponsor" className="py-16 overflow-hidden">
          <div className="text-center mb-2 relative z-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Didukung Oleh</h2>
          </div>

          <div className="marquee-container pt-24 -mt-20 pb-12 md:pb-16">
            <div className="marquee-content items-center gap-12 md:gap-24 px-6 md:px-12 relative z-0">
              {marqueeSponsors.map((sponsor, index) => (
                <div
                  key={`${sponsor.id}-${index}`}
                  className="relative group cursor-pointer shrink-0 z-10 hover:z-50"
                  onClick={() => openModal('sponsor', sponsor)}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-2 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-[60] shadow-xl border border-gray-700/50">
                    {sponsor.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>

                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Testimoni */}
        <section id="testi" className="pt-[4.5rem] pb-20 mb-20 bg-blue-900 text-white overflow-hidden relative">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-4xl font-[900] mb-2 font-['Poppins']">APA KATA MEREKA?</h2>
                <div className="h-1 w-32 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                <Star className="text-yellow-400 fill-yellow-400 w-16 h-16" />
                <div>
                  <div className="text-5xl font-[900] tracking-tighter font-['Poppins']">4.9 to 5</div>
                  <div className="text-sm font-bold text-blue-200 uppercase tracking-widest">100 Reviews Non-Spam</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full">
            {/* Gradients */}
            <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-blue-900 to-transparent z-20 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-blue-900 to-transparent z-20 pointer-events-none"></div>

            {/* ANIMASI LOOP SCROLL DARI INDEX.HTML */}
            <div className="flex w-full overflow-hidden scroller">
              <div className="flex animate-loop-scroll w-max will-change-transform" style={{ backfaceVisibility: 'hidden' }}>
                {/* Set 1 */}
                <div className="flex gap-6 pr-6 items-stretch">
                  {TESTIMONIALS.map((review, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-[400px] bg-white text-gray-800 p-8 rounded-2xl shadow-xl hover:bg-blue-50 transition-colors cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex gap-1 mb-4">
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="text-yellow-400 fill-yellow-400" />)}
                        </div>
                        <p className="text-base italic mb-6 text-gray-600 leading-relaxed whitespace-normal font-['Poppins']">
                          "{review.text}"
                        </p>
                      </div>
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                        <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-gray-900">{review.name}</h4>
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{review.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Set 2 (Duplikasi untuk Loop) */}
                <div className="flex gap-6 pr-6 items-stretch">
                  {TESTIMONIALS.map((review, i) => (
                    <div
                      key={`dup-${i}`}
                      className="flex-shrink-0 w-[400px] bg-white text-gray-800 p-8 rounded-2xl shadow-xl hover:bg-blue-50 transition-colors cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex gap-1 mb-4">
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="text-yellow-400 fill-yellow-400" />)}
                        </div>
                        <p className="text-base italic mb-6 text-gray-600 leading-relaxed whitespace-normal font-['Poppins']">
                          "{review.text}"
                        </p>
                      </div>
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                        <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-gray-900">{review.name}</h4>
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{review.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* 7. Pricelist */}
        <section id="pricing" className="px-4 md:px-12 max-w-[1440px] mx-auto pb-10 md:pb-20">
          <SectionHeader title="Paket Langganan" subtitle="Investasi terbaik untuk masa depan peternakan Anda" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start md:items-stretch">
            {PRICING.map((plan, idx) => (
              <PricingCard
                key={idx}
                plan={plan}
                expanded={allPricesExpanded}
                onToggle={() => setAllPricesExpanded(!allPricesExpanded)}
              />
            ))}
          </div>
        </section>



      </main>

      <Footer />

      {/* --- Mobile Bottom Nav --- */}
      <nav className="md:hidden fixed bottom-0 w-full z-[100] glass-nav-mobile px-6 py-2 pb-6 flex justify-around items-end shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
        <div className="flex-1 flex justify-center">
          <NavItem label="Beranda" icon={Home} active={activeSection === 'home'} onClick={() => scrollTo('home')} mobile />
        </div>

        {/* Dynamic Center Node ("Lainnya") */}
        <div className="flex-1 flex justify-center">
          {(() => {
            let dynId = 'lainnya';
            let dynLabel = 'Lainnya';
            let DynIcon = LayoutGrid;

            if (['about', 'services', 'info', 'sponsor'].includes(activeSection)) {
              dynId = activeSection;
              switch (activeSection) {
                case 'about': dynLabel = 'Tentang'; DynIcon = Info; break;
                case 'services': dynLabel = 'Layanan'; DynIcon = Briefcase; break;
                case 'info': dynLabel = 'Informasi'; DynIcon = FileText; break;
                case 'sponsor': dynLabel = 'Sponsor'; DynIcon = Users; break;
                default: break;
              }
            }

            const isLainnya = dynId === 'lainnya';
            const isActive = !isLainnya;

            return (
              <div className="relative flex flex-col items-center justify-center w-full">


                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className={`flex items-center justify-center transition-colors duration-300 flex-col w-full py-2 relative h-12 overflow-visible outline-none z-[100] ${isActive ? 'text-green-500' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={dynId}
                      initial={{ scale: 0.2, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.2, opacity: 0, y: -20 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                      <div className={`transition-all duration-300 flex items-center justify-center ${isActive ? '-translate-y-2' : ''}`}>
                        <DynIcon className={`flex-shrink-0 ${isLainnya ? 'w-10 h-10 opacity-80 text-gray-800 dark:text-gray-200 drop-shadow-sm' : 'w-7 h-7'}`} />
                      </div>
                      {isActive && <span className="absolute bottom-0 w-[150%] left-1/2 -translate-x-1/2 text-center text-[9px] font-bold tracking-tighter truncate text-green-600">{dynLabel}</span>}
                      {isLainnya && <span className="absolute -bottom-1.5 w-[150%] left-1/2 -translate-x-1/2 text-center text-[9px] font-bold tracking-tighter truncate">{dynLabel}</span>}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            );
          })()}
        </div>

        <div className="flex-1 flex justify-center">
          <NavItem label="Akun" icon={User} active={showLogin} onClick={() => { setShowLogin(true); window.location.hash = '#login'; }} mobile />
        </div>
      </nav>

      {/* --- Mobile Popup Menu (Detached from Nav) --- */}
      <AnimatePresence>
        {showMobileMenu && (
          <div className="md:hidden fixed inset-0 z-[110] flex flex-col justify-end items-center pointer-events-none pb-[5.5rem] px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto"
              onClick={() => setShowMobileMenu(false)}
            />
            {/* Box Menu */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border border-gray-200/60 dark:border-gray-700/60 p-2 flex flex-col gap-1 w-64 pointer-events-auto z-10"
            >
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-1 flex items-center justify-center">
                <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Pilih Menu</span>
              </div>
              {[
                { id: 'about', label: 'Tentang SATUTERNAK', icon: Info },
                { id: 'services', label: 'Layanan Fitur', icon: Briefcase },
                { id: 'info', label: 'Berita & Informasi', icon: FileText },
                { id: 'sponsor', label: 'Mitra Sponsor', icon: Users }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    scrollTo(m.id);
                    setShowMobileMenu(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${activeSection === m.id ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'hover:bg-gray-100/80 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}
                >
                  <m.icon size={20} className={activeSection === m.id ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'} />
                  <span className="font-bold text-xs">{m.label}</span>
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- GLOBAL MODAL --- */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity">
          <div
            className="absolute inset-0"
            onClick={closeModal}
          ></div>

          <div className="relative bg-white dark:bg-gray-900 w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_0.3s_ease-out]">

            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 z-10 shrink-0">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate pr-4">
                {modalState.type === 'news' && "Detail Berita"}
                {modalState.type === 'about' && "Tentang SATUTERNAK"}
                {modalState.type === 'sponsor' && "Profil Mitra"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 pb-12 md:p-8 md:pb-10 overflow-y-auto custom-scrollbar">

              {/* NEWS TYPE */}
              {modalState.type === 'news' && (
                <div>
                  <div className="mb-4 text-sm font-bold text-blue-600 dark:text-blue-400 uppercase">{modalState.data.category}</div>
                  <h2 className="text-2xl md:text-4xl font-extrabold mb-6 leading-tight">{modalState.data.title}</h2>
                  <img src={modalState.data.thumbnail} alt={modalState.data.title} className="w-full h-auto rounded-2xl mb-6 shadow-md" />

                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-800 via-green-500 to-sky-400 text-white font-bold text-sm shadow-md flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-white/80" />
                      Oleh {modalState.data.author}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Penulis Artikel</div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line text-left md:text-justify">
                    {modalState.data.content}
                  </p>
                </div>
              )}

              {/* ABOUT TYPE */}
              {modalState.type === 'about' && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-xl mb-8">S</div>
                  <h2 className="text-3xl font-extrabold mb-6">SATUTERNAK</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mx-auto text-justify">
                    {modalState.data}
                  </p>
                </div>
              )}

              {/* SPONSOR TYPE */}
              {modalState.type === 'sponsor' && (
                <div className="text-center">
                  <div className="w-40 h-40 mx-auto mb-6 bg-gray-50 dark:bg-gray-800 rounded-3xl p-4 shadow-inner flex items-center justify-center">
                    <img src={modalState.data.logo} alt={modalState.data.name} className="max-w-full max-h-full object-contain drop-shadow-md" />
                  </div>
                  <h2 className="text-3xl font-extrabold mb-6">{modalState.data.name}</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-10 text-justify">
                    {modalState.data.description}
                  </p>

                  <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Kunjungi Sosial Media</h4>
                    <div className="flex flex-wrap justify-center gap-4">
                      {modalState.data.socials.map((social, idx) => (
                        <a
                          key={idx}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 font-bold text-sm ${getSocialStyle(social.label)}`}
                        >
                          {social.label.toLowerCase() === 'instagram' && <Instagram size={18} />}
                          {social.label.toLowerCase() === 'youtube' && <Youtube size={18} />}
                          {social.label.toLowerCase() === 'tiktok' && <Music size={18} />}
                          {social.label.toLowerCase() === 'threads' && <AtSign size={18} />}
                          {social.label.toLowerCase() === 'patreon' && <Globe size={18} />}
                          {social.label.toLowerCase() === 'facebook' && <Facebook size={18} />}
                          {social.label.toLowerCase() === 'twitter' && <Twitter size={18} />}
                          {social.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AppRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  if (currentPath === '/Dashboard' || currentPath === '/dashboard') {
    return <Dashboard />;
  }

  return <LandingPage />;
}