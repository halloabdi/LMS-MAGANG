import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, Cell,
} from "recharts";
import {
    Menu, X, ChevronDown, Calendar as CalendarIcon, MapPin, Clock, Users,
    Youtube, Instagram, Globe, ShieldAlert, LogIn, ArrowRight, ChevronLeft,
    ChevronRight, BookOpen, Radar, ClipboardCheck, Eye, Database, GraduationCap, Play,
} from "lucide-react";

/* ---------------------------------------------------------
   Brand tokens
   bg:        #F5FAFD  (paper-blue)
   bg-alt:    #EAF3FA
   surface:   #FFFFFF
   ink:       #12161F  (near-black)
   ink-soft:  #4B5563
   blue:      #2F7FB8  (primary light-blue)
   blue-soft: #7FBFE6
   blue-tint: #E4F1FA
   gold:      #C69327
   gold-soft: #E7C567
--------------------------------------------------------- */

const WA_LINK = "https://wa.me/6285179852558";
const LOGO_URL = "https://gistcdn.githack.com/halloabdi/2df803d48e71f16a80c5b20658641c39/raw/82ccceb7d25df5cefe59cba7f71001ebeccc40c0/agrinak.svg";

/* ---------------- tiny brand icons not in lucide ---------------- */
const WhatsAppIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.36a9.9 9.9 0 0 0 4.62 1.14h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.51 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.12-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.16-4.94-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.15.07.14.11.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.72 1.19 1.55 1.92 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.19.7-.81.89-1.09.19-.28.38-.23.63-.14.26.09 1.64.77 1.92.91.28.14.47.21.53.33.07.12.07.68-.17 1.36Z" />
    </svg>
);
const TikTokIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.6 2h-3.2v13.9c0 1.4-1.1 2.5-2.5 2.5a2.5 2.5 0 0 1-.4-4.97V10.1a5.7 5.7 0 0 0-2.1-.4A5.8 5.8 0 1 0 14.2 15.5V8.9a7 7 0 0 0 4.5 1.6V7.3a3.9 3.9 0 0 1-2.1-5.3Z" />
    </svg>
);
const PatreonIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="15.2" cy="8.4" r="5.6" />
        <rect x="3" y="2.8" width="2.8" height="18.4" />
    </svg>
);

/* ---------------- date helpers (DD/MM/YYYY) ---------------- */
const pad = (n) => String(n).padStart(2, "0");
const toDMY = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const parseDMY = (s) => {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((s || "").trim());
    if (!m) return null;
    const [, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (d.getMonth() !== Number(mm) - 1) return null;
    return d;
};
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const MONTHS_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const DOW_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/* ---------------- dummy dataset ---------------- */
const BASE_MONTH = { year: 2026, monthIndex: 6 }; // Juli 2026
const daysInMonth = new Date(BASE_MONTH.year, BASE_MONTH.monthIndex + 1, 0).getDate();

const trendData = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(BASE_MONTH.year, BASE_MONTH.monthIndex, i + 1);
    const wobble = Math.sin(i / 2.3) * 0.35;
    const jam8 = 20 + Math.round(Math.sin(i / 3) * 1);
    const jam5 = 8 - Math.round(Math.sin(i / 4) * 1);
    const jam2 = 30 - jam8 - jam5;
    const avgJam = +(7.35 + wobble * 0.4).toFixed(2);
    return {
        date,
        label: `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`,
        jam8, jam5, jam2,
        avgJam,
        hadir: jam8 + jam5 + jam2,
    };
});

const durationSummary = [
    { name: "8 jam/hari", value: 20, fill: "#2F7FB8" },
    { name: "5 jam/hari", value: 8, fill: "#7FBFE6" },
    { name: "2 jam/hari", value: 2, fill: "#C69327" },
];

const locationDetail = [
    { name: "Jawa Timur", classA: 4, classB: 3, classC: 1, x: 610, y: 330 },
    { name: "Jawa Tengah", classA: 2, classB: 2, classC: 1, x: 480, y: 325 },
    { name: "Jawa Barat", classA: 2, classB: 1, classC: 1, x: 400, y: 325 },
    { name: "Sumatera Utara", classA: 1, classB: 1, classC: 1, x: 155, y: 110 },
    { name: "Bali", classA: 2, classB: 1, classC: 0, x: 737, y: 327 },
    { name: "Sulawesi Selatan", classA: 1, classB: 2, classC: 0, x: 730, y: 300 },
    { name: "Kalimantan Timur", classA: 1, classB: 1, classC: 0, x: 560, y: 190 },
    { name: "Nusa Tenggara Barat", classA: 1, classB: 0, classC: 1, x: 785, y: 324 },
].map((p) => ({ ...p, total: p.classA + p.classB + p.classC }));

const aboutTujuan = [
    { icon: ClipboardCheck, text: "Pencatatan absensi digital mahasiswa magang secara real-time" },
    { icon: MapPin, text: "Monitoring lokasi dan sebaran titik magang seluruh mahasiswa Agrinak" },
    { icon: Clock, text: "Rekap otomatis jam kerja magang berbasis data" },
    { icon: CalendarIcon, text: "Filter data historis berdasarkan rentang tanggal untuk audit dan evaluasi" },
    { icon: Eye, text: "Akses terbuka bagi dosen pembimbing, mitra magang, dan calon mahasiswa untuk melihat transparansi data" },
];
const aboutManfaat = [
    { icon: Radar, text: "Dosen pembimbing dapat memantau progres secara langsung" },
    { icon: ShieldAlert, text: "Meningkatkan akuntabilitas dan kedisiplinan kehadiran" },
    { icon: Database, text: "Mempercepat proses rekapitulasi dan laporan data" },
    { icon: GraduationCap, text: "Visual nyata mengetahui mahasiswa Agrinak magang di mana" },
    { icon: BookOpen, text: "Mengurangi risiko data hilang atau rusak" },
];

/* =========================================================
   Calendar (custom, modern)
========================================================= */
function Calendar({ selected, onSelect, onClose }) {
    const [view, setView] = useState(() => selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date(BASE_MONTH.year, BASE_MONTH.monthIndex, 1));
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose?.(); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));

    const today = new Date();

    return (
        <div ref={ref} className="la-calendar">
            <div className="la-cal-head">
                <button type="button" className="la-cal-nav" onClick={() => setView(new Date(year, month - 1, 1))} aria-label="Bulan sebelumnya">
                    <ChevronLeft size={16} />
                </button>
                <span className="la-cal-title">{MONTHS_ID[month]} {year}</span>
                <button type="button" className="la-cal-nav" onClick={() => setView(new Date(year, month + 1, 1))} aria-label="Bulan berikutnya">
                    <ChevronRight size={16} />
                </button>
            </div>
            <div className="la-cal-dow">
                {DOW_ID.map((d) => <span key={d}>{d}</span>)}
            </div>
            <div className="la-cal-grid">
                {cells.map((d, i) => {
                    if (!d) return <span key={i} className="la-cal-cell la-cal-empty" />;
                    const isSelected = sameDay(d, selected);
                    const isToday = sameDay(d, today);
                    return (
                        <button
                            type="button"
                            key={i}
                            className={`la-cal-cell la-cal-day${isSelected ? " la-cal-selected" : ""}${isToday && !isSelected ? " la-cal-today" : ""}`}
                            onClick={() => { onSelect(d); onClose?.(); }}
                        >
                            {d.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function DateField({ label, value, onChange }) {
    const [text, setText] = useState(value ? toDMY(value) : "");
    const [open, setOpen] = useState(false);

    useEffect(() => { setText(value ? toDMY(value) : ""); }, [value]);

    const commitText = (v) => {
        setText(v);
        const parsed = parseDMY(v);
        if (parsed) onChange(parsed);
    };

    return (
        <div className="la-datefield">
            <label>{label}</label>
            <div className="la-datefield-row">
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="DD/MM/YYYY"
                    value={text}
                    onChange={(e) => commitText(e.target.value)}
                />
                <button type="button" className="la-datefield-btn" onClick={() => setOpen((o) => !o)} aria-label="Buka kalender">
                    <CalendarIcon size={16} />
                </button>
            </div>
            {open && (
                <div className="la-cal-popover">
                    <Calendar selected={value} onSelect={(d) => onChange(d)} onClose={() => setOpen(false)} />
                </div>
            )}
        </div>
    );
}

/* =========================================================
   Header
========================================================= */
function Header({ onLogin }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropOpen, setDropOpen] = useState(false);
    const dropRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const scrollTo = (id) => {
        setMobileOpen(false);
        setDropOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <header className="la-header">
            <div className="la-header-inner">
                <button className="la-brand" onClick={() => scrollTo("beranda")}>
                    <img src={LOGO_URL} alt="Logo Agrinak" className="la-brand-mark" />
                    <span className="la-brand-text">Logbook Agrinak</span>
                </button>

                <nav className="la-nav-desktop">
                    <button onClick={() => scrollTo("beranda")}>Beranda</button>
                    <button onClick={() => scrollTo("tentang")}>Tentang</button>

                    <div className="la-dropdown-wrap" ref={dropRef}>
                        <button className="la-dropdown-trigger" onClick={() => setDropOpen((o) => !o)}>
                            Monitor <ChevronDown size={14} className={dropOpen ? "la-rot" : ""} />
                        </button>
                        {dropOpen && (
                            <div className="la-dropdown">
                                <button onClick={() => scrollTo("monitoring")}>Ringkasan Magang</button>
                                <button onClick={() => scrollTo("monitoring")}>Grafik Jam Kerja</button>
                                <button onClick={() => scrollTo("monitoring")}>Sebaran Lokasi</button>
                            </div>
                        )}
                    </div>

                    <button onClick={() => scrollTo("kontak")}>Contact Us</button>
                </nav>

                <div className="la-header-actions">
                    <button className="la-btn la-btn-primary la-btn-sm" onClick={onLogin}>
                        <LogIn size={15} /> Login
                    </button>
                    <button className="la-burger" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <nav className="la-nav-mobile">
                    <button onClick={() => scrollTo("beranda")}>Beranda</button>
                    <button onClick={() => scrollTo("tentang")}>Tentang</button>
                    <button onClick={() => scrollTo("monitoring")}>Monitor</button>
                    <button onClick={() => scrollTo("kontak")}>Contact Us</button>
                </nav>
            )}
        </header>
    );
}

/* =========================================================
   Hero / Beranda
========================================================= */
function Hero() {
    return (
        <section id="beranda" className="la-hero">
            <div className="la-hero-inner">
                <div className="la-hero-copy">
                    <span className="la-eyebrow">Program Studi Agribisnis Peternakan &middot; Polbangtan Malang</span>
                    <h1 className="la-title">Logbook Agrinak</h1>
                    <p className="la-motto">Platform Monitoring Magang Agrinak</p>
                    <p className="la-hero-desc">
                        Satu ruang untuk mencatat kehadiran, memantau titik magang, dan merekap jam kerja
                        mahasiswa Agribisnis Peternakan yang sedang magang di luar kampus, secara terbuka dan berbasis data.
                    </p>
                    <div className="la-hero-cta">
                        <button className="la-btn la-btn-primary" onClick={() => document.getElementById("monitoring")?.scrollIntoView({ behavior: "smooth" })}>
                            Lihat Monitoring <ArrowRight size={16} />
                        </button>
                        <button className="la-btn la-btn-ghost" onClick={() => document.getElementById("tentang")?.scrollIntoView({ behavior: "smooth" })}>
                            Tentang Website
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   Tentang
========================================================= */
function About() {
    return (
        <section id="tentang" className="la-section">
            <div className="la-section-inner">
                <div className="la-section-head">
                    <span className="la-eyebrow">Tentang</span>
                    <h2 className="la-h2">Kenapa Logbook Agrinak dibuat</h2>
                </div>
                <div className="la-about-grid">
                    <div className="la-about-col">
                        <h3>Tujuan</h3>
                        <ul className="la-check-list">
                            {aboutTujuan.map(({ icon: Icon, text }, i) => (
                                <li key={i}><span className="la-check-ico"><Icon size={16} /></span>{text}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="la-about-col">
                        <h3>Manfaat</h3>
                        <ul className="la-check-list">
                            {aboutManfaat.map(({ icon: Icon, text }, i) => (
                                <li key={i}><span className="la-check-ico la-check-ico-gold"><Icon size={16} /></span>{text}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   ProvinceMap — stylized mini map with click-to-detail markers
   (hand-drawn simplified island shapes, not precise cartography)
========================================================= */
const MAP_W = 900;
const MAP_H = 400;
const clampPct = (v, min, max) => Math.min(max, Math.max(min, v));

function ProvinceMap() {
    const [active, setActive] = useState(null); // province name or null
    const wrapRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setActive(null); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const activeData = locationDetail.find((p) => p.name === active) || null;

    return (
        <div className="la-map-wrap" ref={wrapRef}>
            <svg className="la-map-svg" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Peta sebaran titik magang">
                <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="var(--blue-tint)" />
                {/* stylized, simplified island shapes — bukan peta geografis presisi */}
                <rect x="110" y="50" width="90" height="300" rx="45" className="la-map-land" />
                <rect x="300" y="305" width="400" height="50" rx="25" className="la-map-land" />
                <rect x="430" y="90" width="240" height="190" rx="50" className="la-map-land" />
                <rect x="690" y="140" width="90" height="210" rx="40" className="la-map-land" />
                <rect x="715" y="310" width="45" height="35" rx="14" className="la-map-land" />
                <rect x="770" y="312" width="30" height="25" rx="10" className="la-map-land" />
                <rect x="815" y="316" width="28" height="24" rx="10" className="la-map-land" />
                <text x="155" y="42" className="la-map-label">Sumatera</text>
                <text x="500" y="298" className="la-map-label">Jawa</text>
                <text x="550" y="82" className="la-map-label">Kalimantan</text>
                <text x="735" y="132" className="la-map-label">Sulawesi</text>
            </svg>

            {locationDetail.map((p) => {
                const leftPct = (p.x / MAP_W) * 100;
                const topPct = (p.y / MAP_H) * 100;
                const isActive = active === p.name;
                return (
                    <button
                        key={p.name}
                        type="button"
                        className={`la-map-pin${isActive ? " la-map-pin-active" : ""}`}
                        style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                        onClick={() => setActive(isActive ? null : p.name)}
                        aria-label={`Lihat rincian ${p.name}`}
                    >
                        <span className="la-map-pin-dot" />
                    </button>
                );
            })}

            {activeData && (
                <div
                    className="la-map-popup"
                    style={{
                        left: `${clampPct((activeData.x / MAP_W) * 100, 16, 84)}%`,
                        top: `${(activeData.y / MAP_H) * 100}%`,
                    }}
                >
                    <div className="la-map-popup-head">
                        <h4>{activeData.name}</h4>
                        <button type="button" onClick={() => setActive(null)} aria-label="Tutup"><X size={14} /></button>
                    </div>
                    <p className="la-map-popup-total">{activeData.total} mahasiswa magang</p>
                    <ul className="la-map-popup-classes">
                        <li><span className="la-map-class-dot la-map-class-a" />Kelas A<b>{activeData.classA}</b></li>
                        <li><span className="la-map-class-dot la-map-class-b" />Kelas B<b>{activeData.classB}</b></li>
                        <li><span className="la-map-class-dot la-map-class-c" />Kelas C<b>{activeData.classC}</b></li>
                    </ul>
                    <p className="la-map-popup-note">Data contoh (dummy).</p>
                </div>
            )}
        </div>
    );
}

/* =========================================================
   Monitoring
========================================================= */
function Monitoring() {
    const [start, setStart] = useState(new Date(BASE_MONTH.year, BASE_MONTH.monthIndex, 1));
    const [end, setEnd] = useState(new Date(BASE_MONTH.year, BASE_MONTH.monthIndex, 14));

    const filtered = useMemo(() => {
        if (!start || !end) return trendData;
        const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return trendData.filter((d) => d.date >= s && d.date <= e);
    }, [start, end]);

    const avgHadir = filtered.length ? Math.round(filtered.reduce((a, b) => a + b.hadir, 0) / filtered.length) : 0;
    const avgJam = filtered.length ? (filtered.reduce((a, b) => a + b.avgJam, 0) / filtered.length).toFixed(2) : "0.00";

    return (
        <section id="monitoring" className="la-section la-section-alt">
            <div className="la-section-inner">
                <div className="la-section-head">
                    <span className="la-eyebrow">Monitoring Magang</span>
                    <h2 className="la-h2">Data terbuka, tanpa perlu login</h2>
                    <p className="la-section-desc">
                        Tahun ajar {BASE_MONTH.year}/{BASE_MONTH.year + 1}, periode {MONTHS_ID[BASE_MONTH.monthIndex]} &mdash; data di bawah adalah data
                        contoh (dummy) untuk menggambarkan tampilan monitoring.
                    </p>
                </div>

                {/* stat cards */}
                <div className="la-stat-row">
                    <div className="la-stat-card">
                        <Users size={18} />
                        <div>
                            <span className="la-stat-num">30</span>
                            <span className="la-stat-label">Mahasiswa magang aktif</span>
                        </div>
                    </div>
                    <div className="la-stat-card">
                        <MapPin size={18} />
                        <div>
                            <span className="la-stat-num">{locationDetail.length}</span>
                            <span className="la-stat-label">Provinsi titik magang</span>
                        </div>
                    </div>
                    <div className="la-stat-card">
                        <Clock size={18} />
                        <div>
                            <span className="la-stat-num">{avgJam} jam</span>
                            <span className="la-stat-label">Rata-rata jam kerja/hari</span>
                        </div>
                    </div>
                    <div className="la-stat-card">
                        <ClipboardCheck size={18} />
                        <div>
                            <span className="la-stat-num">{avgHadir}/30</span>
                            <span className="la-stat-label">Rata-rata hadir/hari</span>
                        </div>
                    </div>
                </div>

                {/* filter */}
                <div className="la-filter-bar">
                    <div className="la-filter-fields">
                        <DateField label="Dari tanggal" value={start} onChange={setStart} />
                        <DateField label="Sampai tanggal" value={end} onChange={setEnd} />
                    </div>
                    <div className="la-filter-hint">Format bebas ketik <code>DD/MM/YYYY</code> atau pilih lewat kalender.</div>
                </div>

                {/* charts */}
                <div className="la-chart-grid">
                    <div className="la-chart-card">
                        <h3>Distribusi jam kerja per hari (30 mahasiswa)</h3>
                        <p className="la-chart-caption">Contoh: 20 dari 30 mahasiswa magang 8 jam/hari, 8 mahasiswa 5 jam/hari, 2 mahasiswa 2 jam/hari.</p>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={durationSummary} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                                <CartesianGrid stroke="#E1EDF6" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "#4B5563", fontSize: 12 }} axisLine={{ stroke: "#D8E6F0" }} tickLine={false} />
                                <YAxis tick={{ fill: "#4B5563", fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E1EDF6", fontSize: 13 }} />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
                                    {durationSummary.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="la-chart-card">
                        <h3>Tren rata-rata jam kerja harian</h3>
                        <p className="la-chart-caption">Berdasarkan rentang tanggal yang dipilih pada filter di atas.</p>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={filtered} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                                <CartesianGrid stroke="#E1EDF6" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: "#4B5563", fontSize: 11 }} axisLine={{ stroke: "#D8E6F0" }} tickLine={false} />
                                <YAxis domain={[0, 9]} tick={{ fill: "#4B5563", fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E1EDF6", fontSize: 13 }} />
                                <Line type="monotone" dataKey="avgJam" name="Rata-rata jam" stroke="#C69327" strokeWidth={2.5} dot={{ r: 2.5, fill: "#C69327" }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="la-chart-card la-chart-card-wide">
                        <h3>Sebaran titik magang per provinsi</h3>
                        <p className="la-chart-caption">Klik titik pada peta untuk melihat rincian jumlah mahasiswa per kelas (A/B/C).</p>
                        <ProvinceMap />
                    </div>
                </div>
            </div>
        </section>
    );
}

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzaco-dXLF5q72ch6Ravny5dsZ19tH8Og-aDUoV2GJeHT_bUuOZ7-k9YbjKmfWR8K-B/exec';

function LoginModal({ open, onClose, onLoginSuccess }) {
    const [nim, setNim] = useState("");
    const [pwd, setPwd] = useState("");
    const [msg, setMsg] = useState("");
    const [statusType, setStatusType] = useState("info"); // info | error | success
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("Mencoba masuk ke sistem...");
        setStatusType("info");

        try {
            const response = await fetch(GAS_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'login', emailOrUsername: nim.trim(), password: pwd.trim() })
            });

            const resJson = await response.json();

            if (resJson.status === 'success') {
                const payloadToSave = { ...resJson.data };
                payloadToSave.expiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 hari
                localStorage.setItem('satuternak_user', JSON.stringify(payloadToSave));
                
                setMsg("Login berhasil! Mengarahkan ke Dashboard...");
                setStatusType("success");
                
                setTimeout(() => {
                    if (onLoginSuccess) {
                        onLoginSuccess(payloadToSave);
                    } else {
                        window.location.hash = '';
                        window.location.pathname = '/Dashboard';
                    }
                }, 800);
            } else {
                setMsg(resJson.message || "Username/NIM atau Password salah!");
                setStatusType("error");
            }
        } catch (error) {
            setMsg("Gagal terhubung ke server. Error: " + error.message);
            setStatusType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="la-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}>
            <div className="la-modal">
                <button className="la-modal-close" onClick={onClose} disabled={loading} aria-label="Tutup"><X size={18} /></button>
                <h3 className="la-modal-title">Masuk ke Logbook Agrinak</h3>
                <p className="la-modal-sub">Khusus mahasiswa, dosen pembimbing, dan admin terdaftar.</p>
                <form onSubmit={submit} className="la-form">
                    <label>Username / NIM
                        <input type="text" value={nim} onChange={(e) => setNim(e.target.value)} placeholder="Contoh: 23421xxxx" required disabled={loading} />
                    </label>
                    <label>Password
                        <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="********" required disabled={loading} />
                    </label>
                    {msg && (
                        <p className={`la-form-note ${statusType === 'error' ? 'la-field-error bg-red-50 p-2 rounded' : ''}`} style={statusType === 'error' ? { color: '#C23B2E', background: '#FDEBE9' } : {}}>
                            {msg}
                        </p>
                    )}
                    <button type="submit" className="la-btn la-btn-primary la-btn-block" disabled={loading}>
                        {loading ? "Memproses..." : "Login"}
                    </button>
                </form>
                <p className="la-modal-foot">
                    Belum punya akun? <a href={WA_LINK} target="_blank" rel="noreferrer">Hubungi developer via WhatsApp</a>
                </p>
            </div>
        </div>
    );
}

/* =========================================================
   Anonymous report modal
========================================================= */
/* ---------------- NIK & phone validation ---------------- */
function validateNIK(nik) {
    if (!/^\d{16}$/.test(nik)) return "NIK harus tepat 16 digit angka.";
    if (/^(\d)\1{15}$/.test(nik)) return "NIK tidak valid (semua digit sama).";
    let asc = true, desc = true;
    for (let i = 1; i < nik.length; i++) {
        if (Number(nik[i]) !== (Number(nik[i - 1]) + 1) % 10) asc = false;
        if (Number(nik[i]) !== (Number(nik[i - 1]) + 9) % 10) desc = false;
    }
    if (asc || desc) return "NIK tidak valid (pola berurutan).";
    if (nik.slice(0, 6) === "000000") return "NIK tidak valid (kode wilayah kosong).";
    let day = parseInt(nik.slice(6, 8), 10);
    const month = parseInt(nik.slice(8, 10), 10);
    if (day > 40) day -= 40;
    if (day < 1 || day > 31) return "NIK tidak valid (tanggal lahir tidak masuk akal).";
    if (month < 1 || month > 12) return "NIK tidak valid (bulan lahir tidak masuk akal).";
    return "";
}
function validatePhone(v) {
    const digits = v.replace(/[^\d]/g, "");
    if (!/^(0|62)8\d{7,11}$/.test(digits)) return "Gunakan format nomor Indonesia yang valid, contoh 08123456789.";
    return "";
}

const REPORT_FIELDS_INITIAL = {
    namaLengkap: "", nik: "", tempatMagang: "", lokasiMagang: "",
    namaTerlapor: "", telepon: "", kronologi: "",
};

function ReportModal({ open, onClose }) {
    const [step, setStep] = useState("form"); // form | confirm | success
    const [fields, setFields] = useState(REPORT_FIELDS_INITIAL);
    const [errors, setErrors] = useState({});
    const [attachments, setAttachments] = useState([]);
    const [previewIndex, setPreviewIndex] = useState(null);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    if (!open) return null;

    const reset = () => {
        setStep("form"); setFields(REPORT_FIELDS_INITIAL); setErrors({}); setPreviewIndex(null);
        attachments.forEach((a) => URL.revokeObjectURL(a.url));
        setAttachments([]);
    };
    const handleClose = () => { reset(); onClose(); };

    const setField = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

    const addFiles = (fileList) => {
        const items = Array.from(fileList).map((file) => ({
            file, name: file.name, url: URL.createObjectURL(file), isVideo: file.type.startsWith("video"),
        }));
        setAttachments((prev) => [...prev, ...items]);
    };
    const removeAttachment = (idx) => {
        setAttachments((prev) => {
            const next = [...prev];
            URL.revokeObjectURL(next[idx].url);
            next.splice(idx, 1);
            return next;
        });
    };

    const validateForm = () => {
        const e = {};
        if (!fields.namaLengkap.trim()) e.namaLengkap = "Nama lengkap wajib diisi.";
        const nikErr = validateNIK(fields.nik.trim());
        if (nikErr) e.nik = nikErr;
        if (!fields.tempatMagang.trim()) e.tempatMagang = "Tempat magang wajib diisi.";
        if (!fields.lokasiMagang.trim()) e.lokasiMagang = "Lokasi magang wajib diisi.";
        if (!fields.namaTerlapor.trim()) e.namaTerlapor = "Nama mahasiswa yang dilaporkan wajib diisi.";
        const phoneErr = validatePhone(fields.telepon.trim());
        if (phoneErr) e.telepon = phoneErr;
        if (!fields.kronologi.trim() || fields.kronologi.trim().length < 20) e.kronologi = "Jelaskan kronologi minimal 20 karakter.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (validateForm()) setStep("confirm");
    };

    const confirmSend = () => {
        // NOTE: demo only — belum terhubung ke server admin sungguhan.
        setStep("success");
    };

    return (
        <div className="la-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
            <div className="la-modal la-modal-wide">
                <button className="la-modal-close" onClick={handleClose} aria-label="Tutup"><X size={18} /></button>

                {step === "form" && (
                    <>
                        <h3 className="la-modal-title">Lapor Anonim</h3>
                        <p className="la-modal-sub">
                            Laporkan perilaku tidak sopan dari mahasiswa magang. Data identitas pelapor hanya digunakan untuk
                            verifikasi laporan dan tidak ditampilkan ke publik.
                        </p>
                        <form onSubmit={submitForm} className="la-form la-form-scroll">
                            <label>Nama lengkap
                                <input type="text" value={fields.namaLengkap} onChange={setField("namaLengkap")} placeholder="Nama lengkap Anda" />
                                {errors.namaLengkap && <span className="la-field-error">{errors.namaLengkap}</span>}
                            </label>

                            <label>NIK
                                <input
                                    type="text" inputMode="numeric" maxLength={16}
                                    value={fields.nik}
                                    onChange={(e) => setField("nik")({ target: { value: e.target.value.replace(/[^\d]/g, "") } })}
                                    placeholder="16 digit sesuai KTP"
                                />
                                {errors.nik && <span className="la-field-error">{errors.nik}</span>}
                            </label>

                            <div className="la-form-row">
                                <label>Tempat magang
                                    <input type="text" value={fields.tempatMagang} onChange={setField("tempatMagang")} placeholder="Contoh: PT Sinar Ternak" />
                                    {errors.tempatMagang && <span className="la-field-error">{errors.tempatMagang}</span>}
                                </label>
                                <label>Lokasi magang
                                    <input type="text" value={fields.lokasiMagang} onChange={setField("lokasiMagang")} placeholder="Kota / Provinsi" />
                                    {errors.lokasiMagang && <span className="la-field-error">{errors.lokasiMagang}</span>}
                                </label>
                            </div>

                            <label>Nama mahasiswa yang ingin dilaporkan
                                <input type="text" value={fields.namaTerlapor} onChange={setField("namaTerlapor")} placeholder="Nama lengkap mahasiswa terlapor" />
                                {errors.namaTerlapor && <span className="la-field-error">{errors.namaTerlapor}</span>}
                            </label>

                            <label>Nomor telepon (WhatsApp &amp; telepon biasa)
                                <input type="tel" value={fields.telepon} onChange={setField("telepon")} placeholder="08xxxxxxxxxx" />
                                {errors.telepon && <span className="la-field-error">{errors.telepon}</span>}
                            </label>

                            <label>Kronologi kejadian
                                <textarea rows={5} value={fields.kronologi} onChange={setField("kronologi")} placeholder="Tuliskan kejadian secara singkat dan jelas..." />
                                {errors.kronologi && <span className="la-field-error">{errors.kronologi}</span>}
                            </label>

                            <div className="la-upload-block">
                                <span className="la-upload-label">Unggah bukti (foto/video)</span>
                                <div className="la-upload-actions">
                                    <button type="button" className="la-btn la-btn-ghost la-btn-sm" onClick={() => fileInputRef.current?.click()}>
                                        Pilih dari galeri
                                    </button>
                                    <button type="button" className="la-btn la-btn-ghost la-btn-sm" onClick={() => cameraInputRef.current?.click()}>
                                        Ambil dari kamera
                                    </button>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                                <input ref={cameraInputRef} type="file" accept="image/*,video/*" capture="environment" hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />

                                {attachments.length > 0 && (
                                    <div className="la-attachment-grid">
                                        {attachments.map((a, i) => (
                                            <div key={i} className="la-attachment-cell">
                                                <button
                                                    type="button"
                                                    className="la-attachment-thumb-btn"
                                                    onClick={() => setPreviewIndex(i)}
                                                    aria-label={`Lihat pratinjau penuh ${a.name}`}
                                                >
                                                    {a.isVideo ? (
                                                        <span className="la-attachment-video-tile"><Play size={20} /></span>
                                                    ) : (
                                                        <img src={a.url} alt={a.name} />
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="la-attachment-remove"
                                                    onClick={() => removeAttachment(i)}
                                                    aria-label={`Hapus ${a.name}`}
                                                >
                                                    <X size={13} />
                                                </button>
                                                <span className="la-attachment-caption">{a.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="la-btn la-btn-primary la-btn-block">
                                <ShieldAlert size={16} /> Kirim laporan
                            </button>
                            <p className="la-form-hint">Tampilan formulir demo — laporan belum tersambung ke sistem penerima.</p>
                        </form>
                    </>
                )}

                {previewIndex !== null && attachments[previewIndex] && (
                    <div className="la-preview-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setPreviewIndex(null); }}>
                        <div className="la-preview-box">
                            <button className="la-modal-close" onClick={() => setPreviewIndex(null)} aria-label="Tutup pratinjau"><X size={18} /></button>
                            {attachments[previewIndex].isVideo ? (
                                <video src={attachments[previewIndex].url} controls autoPlay className="la-preview-media" />
                            ) : (
                                <img src={attachments[previewIndex].url} alt={attachments[previewIndex].name} className="la-preview-media" />
                            )}
                            <p className="la-preview-caption">{attachments[previewIndex].name}</p>
                            <p className="la-preview-note">Ini file asli yang utuh, tidak dipotong — inilah yang akan terkirim ke server.</p>
                        </div>
                    </div>
                )}

                {step === "confirm" && (
                    <div className="la-confirm">
                        <div className="la-confirm-icon"><ShieldAlert size={26} /></div>
                        <h3 className="la-modal-title la-confirm-title">Apakah anda ingin melaporkan mahasiswa ini?</h3>
                        <p className="la-confirm-warning">
                            Jika laporan tersebut ternyata palsu, maka dapat dikenakan pasal pencemaran nama baik.
                        </p>
                        <div className="la-confirm-actions">
                            <button className="la-btn la-btn-ghost la-btn-block" onClick={() => setStep("form")}>Batal, kembali</button>
                            <button className="la-btn la-btn-primary la-btn-block" onClick={confirmSend}>Ya, kirim laporan</button>
                        </div>
                    </div>
                )}

                {step === "success" && (
                    <div className="la-form-success">
                        <p>Terima kasih, laporan Anda telah tercatat dan akan diverifikasi oleh admin.</p>
                        <button className="la-btn la-btn-ghost" onClick={handleClose}>Tutup</button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* =========================================================
   Footer / Contact Us
========================================================= */
function Footer({ onReport }) {
    return (
        <footer id="kontak" className="la-footer">
            <div className="la-footer-inner">
                <div className="la-footer-top">
                    <div className="la-footer-brand">
                        <img src={LOGO_URL} alt="Logo Agrinak" className="la-brand-mark la-brand-mark-dark" />
                        <div>
                            <p className="la-footer-brand-name">Logbook Agrinak</p>
                            <p className="la-footer-brand-sub">Dibuat oleh Muhammad Abdi Firmansyah (Mas Abdi), mahasiswa Agrinak Polbangtan Malang.</p>
                        </div>
                    </div>
                    <button className="la-btn la-btn-report" onClick={onReport}>
                        <ShieldAlert size={16} /> Lapor Anonim
                    </button>
                </div>

                <div className="la-footer-grid">
                    <div className="la-footer-col">
                        <h4>Kontak Agrinak</h4>
                        <div className="la-social-grid">
                            <a className="la-social la-social-youtube" href="https://www.youtube.com/@programstudiagribisnispeternak" target="_blank" rel="noreferrer"><Youtube size={16} /> YouTube</a>
                            <a className="la-social la-social-web" href="https://agrinak.polbangtanmalang.ac.id" target="_blank" rel="noreferrer"><Globe size={16} /> Website</a>
                            <a className="la-social la-social-instagram" href="https://www.instagram.com/agrinak_polbangtanmlg/" target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram</a>
                        </div>
                    </div>
                    <div className="la-footer-col">
                        <h4>Kontak Developer</h4>
                        <div className="la-social-grid">
                            <a className="la-social la-social-youtube" href="https://youtube.com/@halloabdi" target="_blank" rel="noreferrer"><Youtube size={16} /> YouTube</a>
                            <a className="la-social la-social-instagram" href="https://instagram.com/hallo.abdi" target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram</a>
                            <a className="la-social la-social-tiktok" href="https://tiktok.com/@hallo.abdi" target="_blank" rel="noreferrer"><TikTokIcon size={16} /> TikTok</a>
                            <a className="la-social la-social-patreon" href="https://patreon.com/@halloabdi" target="_blank" rel="noreferrer"><PatreonIcon size={16} /> Patreon</a>
                            <a className="la-social la-social-web" href="https://halloabdistore.vercel.app" target="_blank" rel="noreferrer"><Globe size={16} /> Website</a>
                            <a className="la-social la-social-whatsapp" href={WA_LINK} target="_blank" rel="noreferrer"><WhatsAppIcon size={16} /> WhatsApp</a>
                        </div>
                    </div>
                </div>

                <div className="la-footer-bottom">
                    <span>&copy; {new Date().getFullYear()} Logbook Agrinak &mdash; dibangun oleh Mas Abdi untuk Program Studi Agribisnis Peternakan, Polbangtan Malang.</span>
                </div>
            </div>
        </footer>
    );
}

/* =========================================================
   Global styles
========================================================= */
const GlobalStyle = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

    #la-root, #la-root * { box-sizing: border-box; }
    #la-root {
      --bg: #F5FAFD;
      --bg-alt: #EAF3FA;
      --surface: #FFFFFF;
      --ink: #12161F;
      --ink-soft: #4B5563;
      --blue: #2F7FB8;
      --blue-dark: #1F5E8C;
      --blue-soft: #7FBFE6;
      --blue-tint: #E4F1FA;
      --gold: #C69327;
      --gold-soft: #E7C567;
      --line: #DCEAF3;
      font-family: 'Inter', system-ui, sans-serif;
      color: var(--ink);
      background: var(--bg);
      -webkit-font-smoothing: antialiased;
    }

    #la-root ::-webkit-scrollbar { width: 11px; height: 11px; }
    #la-root ::-webkit-scrollbar-track { background: var(--bg-alt); }
    #la-root ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, var(--blue-soft), var(--gold-soft));
      border-radius: 8px;
      border: 2px solid var(--bg-alt);
    }
    #la-root ::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, var(--blue), var(--gold)); }
    #la-root { scrollbar-width: thin; scrollbar-color: var(--blue-soft) var(--bg-alt); }

    #la-root h1, #la-root h2, #la-root h3, #la-root .la-brand-text {
      font-family: 'Space Grotesk', 'Inter', sans-serif;
    }
    .la-stat-num { font-family: 'JetBrains Mono', monospace; }

    button { font-family: inherit; cursor: pointer; }

    /* ---- header ---- */
    .la-header {
      position: sticky; top: 0; z-index: 40;
      background: rgba(245,250,253,0.85);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--line);
    }
    .la-header-inner {
      max-width: 1160px; margin: 0 auto; padding: 14px 24px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .la-brand { display: flex; align-items: center; gap: 10px; background: none; border: none; padding: 0; }
    .la-brand-mark {
      display: inline-flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; border-radius: 9px;
      background: var(--surface); border: 1px solid var(--line);
      padding: 5px; object-fit: contain; flex-shrink: 0;
    }
    .la-brand-mark-dark { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.14); }
    .la-brand-text { font-weight: 700; font-size: 17px; color: var(--ink); }

    .la-nav-desktop { display: flex; align-items: center; gap: 6px; }
    .la-nav-desktop > button {
      background: none; border: none; padding: 9px 14px; border-radius: 8px;
      font-size: 14.5px; font-weight: 500; color: var(--ink-soft);
      transition: background .15s, color .15s;
    }
    .la-nav-desktop > button:hover { background: var(--blue-tint); color: var(--blue-dark); }

    .la-dropdown-wrap { position: relative; }
    .la-dropdown-trigger {
      display: flex; align-items: center; gap: 4px;
      background: none; border: none; padding: 9px 14px; border-radius: 8px;
      font-size: 14.5px; font-weight: 500; color: var(--ink-soft);
    }
    .la-dropdown-trigger:hover { background: var(--blue-tint); color: var(--blue-dark); }
    .la-rot { transform: rotate(180deg); transition: transform .15s; }
    .la-dropdown {
      position: absolute; top: calc(100% + 8px); left: 0; min-width: 210px;
      background: var(--surface); border: 1px solid var(--line); border-radius: 12px;
      box-shadow: 0 12px 28px rgba(18,22,31,0.12); padding: 6px; z-index: 50;
      animation: la-pop .14s ease;
    }
    .la-dropdown button {
      display: block; width: 100%; text-align: left; background: none; border: none;
      padding: 9px 10px; border-radius: 8px; font-size: 13.5px; color: var(--ink);
    }
    .la-dropdown button:hover { background: var(--bg-alt); color: var(--blue-dark); }

    .la-header-actions { display: flex; align-items: center; gap: 10px; }
    .la-burger { display: none; background: none; border: none; color: var(--ink); }

    .la-nav-mobile { display: flex; flex-direction: column; padding: 6px 24px 16px; gap: 2px; border-top: 1px solid var(--line); }
    .la-nav-mobile button { text-align: left; background: none; border: none; padding: 11px 4px; font-size: 15px; color: var(--ink); border-bottom: 1px solid var(--line); }

    @media (max-width: 860px) {
      .la-nav-desktop { display: none; }
      .la-burger { display: inline-flex; }
    }

    /* ---- buttons ---- */
    .la-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 11px 20px; border-radius: 10px; font-size: 14.5px; font-weight: 600;
      border: 1px solid transparent; transition: transform .12s, box-shadow .12s, background .15s;
      white-space: nowrap;
    }
    .la-btn:active { transform: translateY(1px); }
    .la-btn-primary { background: linear-gradient(135deg, var(--blue), var(--blue-dark)); color: #fff; box-shadow: 0 6px 16px rgba(47,127,184,0.28); }
    .la-btn-primary:hover { box-shadow: 0 8px 20px rgba(47,127,184,0.36); }
    .la-btn-sm { padding: 8px 14px; font-size: 13.5px; }
    .la-btn-ghost { background: var(--surface); color: var(--ink); border-color: var(--line); }
    .la-btn-ghost:hover { border-color: var(--blue-soft); color: var(--blue-dark); }
    .la-btn-block { width: 100%; }
    .la-btn-report { background: #D8342A; color: #fff; }
    .la-btn-report:hover { background: #A32419; }

    /* ---- hero ---- */
    .la-hero { padding: 76px 24px 56px; }
    .la-hero-inner {
      max-width: 760px; margin: 0 auto; text-align: center;
    }
    .la-eyebrow {
      display: inline-block; font-size: 12.5px; font-weight: 600; letter-spacing: 0.04em;
      color: var(--blue-dark); background: var(--blue-tint); padding: 6px 12px; border-radius: 999px;
      margin-bottom: 18px;
    }
    .la-title { font-size: clamp(40px, 6vw, 60px); font-weight: 700; line-height: 1.02; margin: 0 0 10px; color: var(--ink); }
    .la-motto { font-size: 19px; font-weight: 600; color: var(--gold); margin: 0 0 16px; }
    .la-hero-desc { font-size: 15.5px; line-height: 1.65; color: var(--ink-soft); max-width: 560px; margin: 0 auto 28px; }
    .la-hero-cta { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

    /* ---- sections ---- */
    .la-section { padding: 56px 24px; }
    .la-section-alt { background: var(--bg-alt); }
    .la-section-inner { max-width: 1160px; margin: 0 auto; }
    .la-section-head { max-width: 640px; margin: 0 auto; text-align: center; }
    .la-h2 { font-size: clamp(26px, 3.4vw, 34px); font-weight: 700; margin: 6px 0 14px; }
    .la-section-desc { color: var(--ink-soft); font-size: 15px; max-width: 640px; margin: 0 auto; }

    .la-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 32px; }
    .la-about-col h3 { font-size: 16px; font-weight: 700; margin: 0 0 14px; }
    .la-check-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .la-check-list li { display: flex; gap: 12px; align-items: flex-start; font-size: 14.5px; line-height: 1.55; color: var(--ink); background: var(--surface); border: 1px solid var(--line); padding: 13px 14px; border-radius: 12px; }
    .la-check-ico { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; background: var(--blue-tint); color: var(--blue-dark); }
    .la-check-ico-gold { background: #FBF0D6; color: #8A6A16; }
    @media (max-width: 760px) { .la-about-grid { grid-template-columns: 1fr; } }

    /* ---- monitoring ---- */
    .la-stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 32px 0 28px; }
    .la-stat-card {
      display: flex; align-items: center; gap: 12px; background: var(--surface);
      border: 1px solid var(--line); border-radius: 14px; padding: 16px;
      color: var(--blue-dark);
    }
    .la-stat-card > div { display: flex; flex-direction: column; }
    .la-stat-num { font-size: 20px; font-weight: 700; color: var(--ink); line-height: 1.15; }
    .la-stat-label { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
    @media (max-width: 860px) { .la-stat-row { grid-template-columns: 1fr 1fr; } }

    .la-filter-bar {
      display: flex; flex-direction: column; align-items: center; gap: 14px;
      background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 20px;
      margin-bottom: 28px;
    }
    .la-filter-fields { display: flex; gap: 16px; align-items: flex-end; justify-content: center; flex-wrap: wrap; }
    .la-datefield { display: flex; flex-direction: column; gap: 6px; position: relative; }
    .la-datefield label { font-size: 12.5px; font-weight: 600; color: var(--ink-soft); }
    .la-datefield-row { display: flex; align-items: center; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--bg); }
    .la-datefield-row input { border: none; background: transparent; padding: 10px 12px; font-size: 13.5px; width: 130px; outline: none; font-family: 'JetBrains Mono', monospace; }
    .la-datefield-btn { border: none; background: var(--blue-tint); color: var(--blue-dark); padding: 10px 11px; display: flex; align-items: center; }
    .la-datefield-btn:hover { background: var(--blue-soft); color: #fff; }
    .la-filter-hint { font-size: 12.5px; color: var(--ink-soft); text-align: center; }
    .la-filter-hint code { background: var(--bg-alt); padding: 2px 6px; border-radius: 5px; font-family: 'JetBrains Mono', monospace; }

    .la-cal-popover { position: absolute; top: calc(100% + 8px); left: 0; z-index: 60; }
    .la-calendar {
      width: 268px; background: var(--surface); border: 1px solid var(--line); border-radius: 14px;
      box-shadow: 0 16px 34px rgba(18,22,31,0.16); padding: 14px; animation: la-pop .14s ease;
    }
    .la-cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .la-cal-title { font-size: 13.5px; font-weight: 700; }
    .la-cal-nav { background: var(--bg-alt); border: none; border-radius: 8px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; color: var(--blue-dark); }
    .la-cal-nav:hover { background: var(--blue-tint); }
    .la-cal-dow { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 4px; }
    .la-cal-dow span { font-size: 10.5px; font-weight: 600; color: var(--ink-soft); text-align: center; }
    .la-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
    .la-cal-cell { height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12.5px; border-radius: 8px; }
    .la-cal-empty { visibility: hidden; }
    .la-cal-day { background: none; border: none; color: var(--ink); }
    .la-cal-day:hover { background: var(--blue-tint); }
    .la-cal-today { border: 1px solid var(--gold); color: #8A6A16; font-weight: 700; }
    .la-cal-selected { background: var(--blue) !important; color: #fff !important; font-weight: 700; }

    .la-chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .la-chart-card-wide { grid-column: 1 / -1; }
    .la-chart-card { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 20px; }
    .la-chart-card h3 { font-size: 15px; font-weight: 700; margin: 0 0 4px; }
    .la-chart-caption { font-size: 12.5px; color: var(--ink-soft); margin: 0 0 8px; }
    @media (max-width: 860px) { .la-chart-grid { grid-template-columns: 1fr; } }

    /* ---- province mini map ---- */
    .la-map-wrap {
      position: relative; width: 100%; height: 0; padding-top: 44.4%;
      border-radius: 14px; overflow: hidden; border: 1px solid var(--line); min-width: 0;
    }
    .la-map-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    .la-map-land { fill: #DCEFDD; stroke: #BFE0C4; stroke-width: 2; }
    .la-map-label { fill: #6B8F73; font-size: 15px; font-weight: 600; font-family: 'Inter', sans-serif; }

    .la-map-pin {
      position: absolute; transform: translate(-50%, -50%); background: none; border: none; padding: 8px;
      display: flex; align-items: center; justify-content: center; z-index: 5;
    }
    .la-map-pin-dot {
      display: block; width: 13px; height: 13px; border-radius: 50%;
      background: var(--blue); border: 2.5px solid #fff; box-shadow: 0 0 0 3px rgba(47,127,184,0.35), 0 2px 6px rgba(18,22,31,0.25);
      transition: transform .12s, background .12s;
    }
    .la-map-pin:hover .la-map-pin-dot { transform: scale(1.15); }
    .la-map-pin-active .la-map-pin-dot { background: var(--gold); box-shadow: 0 0 0 4px rgba(198,147,39,0.35), 0 2px 6px rgba(18,22,31,0.3); transform: scale(1.2); }

    .la-map-popup {
      position: absolute; transform: translate(-50%, calc(-100% - 16px)); z-index: 10;
      width: 200px; max-width: 78vw; background: var(--surface); border-radius: 12px;
      box-shadow: 0 14px 30px rgba(18,22,31,0.22); padding: 12px 13px; border: 1px solid var(--line);
    }
    .la-map-popup-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; }
    .la-map-popup-head h4 { font-size: 13.5px; font-weight: 700; margin: 0; color: var(--ink); line-height: 1.3; }
    .la-map-popup-head button { flex-shrink: 0; background: var(--bg-alt); border: none; border-radius: 6px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: var(--ink-soft); }
    .la-map-popup-head button:hover { background: var(--blue-tint); color: var(--blue-dark); }
    .la-map-popup-total { font-size: 12px; font-weight: 700; color: var(--blue-dark); margin: 4px 0 8px; }
    .la-map-popup-classes { list-style: none; margin: 0 0 6px; padding: 0; display: flex; flex-direction: column; gap: 4px; }
    .la-map-popup-classes li { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink); }
    .la-map-popup-classes li b { margin-left: auto; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
    .la-map-class-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .la-map-class-a { background: var(--blue); }
    .la-map-class-b { background: var(--gold); }
    .la-map-class-c { background: var(--ink); }
    .la-map-popup-note { font-size: 10.5px; color: var(--ink-soft); margin: 0; }

    /* ---- modals ---- */
    .la-modal-overlay {
      position: fixed; inset: 0; background: rgba(18,22,31,0.45); backdrop-filter: blur(2px);
      display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px;
      animation: la-fade .15s ease;
    }
    .la-modal {
      position: relative; width: 100%; max-width: 400px; background: var(--surface);
      border-radius: 18px; padding: 28px 26px 24px; box-shadow: 0 24px 60px rgba(18,22,31,0.28);
      animation: la-pop .16s ease;
    }
    .la-modal-close { position: absolute; top: 14px; right: 14px; background: var(--bg-alt); border: none; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: var(--ink-soft); }
    .la-modal-close:hover { background: var(--blue-tint); color: var(--blue-dark); }
    .la-modal-title { font-size: 19px; font-weight: 700; margin: 0 0 4px; }
    .la-modal-sub { font-size: 13px; color: var(--ink-soft); margin: 0 0 18px; }
    .la-form { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
    .la-form label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; font-weight: 600; color: var(--ink-soft); min-width: 0; }
    .la-form input, .la-form textarea {
      width: 100%; min-width: 0; box-sizing: border-box;
      border: 1px solid var(--line); border-radius: 10px; padding: 11px 12px; font-size: 14px;
      font-family: 'Inter', sans-serif; outline: none; color: var(--ink); background: var(--bg);
    }
    .la-form input:focus, .la-form textarea:focus { border-color: var(--blue-soft); box-shadow: 0 0 0 3px var(--blue-tint); }
    .la-form-note { font-size: 12.5px; color: var(--blue-dark); background: var(--blue-tint); padding: 8px 10px; border-radius: 8px; margin: 0; }
    .la-form-hint { font-size: 11.5px; color: var(--ink-soft); text-align: center; margin: 0; }
    .la-form-success { text-align: center; padding: 10px 0; display: flex; flex-direction: column; gap: 14px; }
    .la-modal-foot { text-align: center; font-size: 13px; color: var(--ink-soft); margin: 18px 0 0; }
    .la-modal-foot a { color: var(--blue-dark); font-weight: 600; text-decoration: none; }
    .la-modal-foot a:hover { text-decoration: underline; }

    .la-modal-wide { max-width: 460px; overflow-x: hidden; }
    .la-form-scroll { max-height: 58vh; overflow-y: auto; overflow-x: hidden; padding-right: 6px; margin-right: -6px; }
    .la-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; min-width: 0; }
    .la-form-row > label { min-width: 0; }
    @media (max-width: 480px) { .la-form-row { grid-template-columns: 1fr; } }
    .la-field-error { color: #C23B2E; font-size: 12px; font-weight: 500; margin-top: -2px; }

    .la-upload-block { display: flex; flex-direction: column; gap: 10px; border: 1px dashed var(--line); border-radius: 12px; padding: 14px; background: var(--bg); }
    .la-upload-label { font-size: 12.5px; font-weight: 600; color: var(--ink-soft); }
    .la-upload-actions { display: flex; gap: 10px; flex-wrap: wrap; }

    .la-attachment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 4px; min-width: 0; }
    .la-attachment-cell { position: relative; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .la-attachment-thumb-btn {
      position: relative; display: block; width: 100%; height: 0; padding: 100% 0 0 0;
      border: 1px solid var(--line); border-radius: 12px; overflow: hidden; background: var(--surface); min-width: 0;
    }
    .la-attachment-thumb-btn img { position: absolute; inset: 0; width: 100%; height: 100%; max-width: 100%; object-fit: cover; display: block; }
    .la-attachment-thumb-btn:hover { border-color: var(--blue-soft); }
    .la-attachment-video-tile { position: absolute; inset: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--ink); color: #fff; }
    .la-attachment-remove {
      position: absolute; top: 6px; right: 6px; background: rgba(18,22,31,0.6); border: none; border-radius: 7px;
      width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: #fff;
    }
    .la-attachment-remove:hover { background: #C23B2E; }
    .la-attachment-caption { font-size: 11.5px; color: var(--ink-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }

    .la-preview-overlay {
      position: fixed; inset: 0; background: rgba(18,22,31,0.72); z-index: 120;
      display: flex; align-items: center; justify-content: center; padding: 24px;
      animation: la-fade .15s ease;
    }
    .la-preview-box {
      position: relative; max-width: 520px; width: 100%; background: var(--surface);
      border-radius: 16px; padding: 18px; display: flex; flex-direction: column; align-items: center; gap: 10px;
      animation: la-pop .16s ease;
    }
    .la-preview-media { max-width: 100%; max-height: 62vh; width: auto; height: auto; border-radius: 10px; object-fit: contain; }
    .la-preview-caption { font-size: 13px; font-weight: 600; color: var(--ink); margin: 0; text-align: center; word-break: break-all; }
    .la-preview-note { font-size: 12px; color: var(--blue-dark); background: var(--blue-tint); padding: 7px 12px; border-radius: 8px; margin: 0; text-align: center; }

    .la-confirm { text-align: center; padding: 6px 4px 2px; }
    .la-confirm-icon { width: 52px; height: 52px; border-radius: 50%; background: #FDEBE9; color: #C23B2E; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .la-confirm-title { font-size: 17px; margin-bottom: 10px; }
    .la-confirm-warning { font-size: 13.5px; color: var(--ink-soft); line-height: 1.55; margin: 0 0 22px; }
    .la-confirm-actions { display: flex; flex-direction: column; gap: 10px; }

    /* ---- footer ---- */
    .la-footer { background: var(--ink); color: #E7ECF2; padding: 48px 24px 24px; }
    .la-footer-inner { max-width: 1160px; margin: 0 auto; }
    .la-footer-top { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; padding-bottom: 28px; border-bottom: 1px solid rgba(255,255,255,0.12); margin-bottom: 28px; }
    .la-footer-brand { display: flex; align-items: center; gap: 12px; max-width: 480px; }
    .la-footer-brand-name { font-weight: 700; font-size: 15.5px; margin: 0; color: #fff; }
    .la-footer-brand-sub { font-size: 12.5px; color: #A6B0BE; margin: 3px 0 0; line-height: 1.5; }
    .la-footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 32px; }
    .la-footer-col h4 { font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gold-soft); margin: 0 0 14px; }
    .la-footer-col { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .la-footer-bottom { font-size: 12px; color: #8592A3; text-align: center; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.08); }
    @media (max-width: 640px) { .la-footer-grid { grid-template-columns: 1fr; } }

    .la-social-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; min-width: 0; }
    .la-social {
      display: flex; align-items: center; justify-content: center; gap: 7px; min-width: 0;
      color: #fff; text-decoration: none; font-size: 13px; font-weight: 700;
      padding: 11px 12px; border-radius: 14px;
      transition: transform .12s, filter .12s, box-shadow .12s;
    }
    .la-social:hover { filter: brightness(1.06); transform: translateY(-1px); }
    .la-social span, .la-social svg { flex-shrink: 0; }
    .la-social-youtube { background: #C0392B; box-shadow: 0 8px 16px -4px rgba(192,57,43,0.55); }
    .la-social-instagram { background: #C2189D; box-shadow: 0 8px 16px -4px rgba(194,24,157,0.55); }
    .la-social-tiktok { background: #101010; box-shadow: 0 8px 16px -4px rgba(0,0,0,0.5); }
    .la-social-patreon { background: #FF5D5B; box-shadow: 0 8px 16px -4px rgba(255,93,91,0.55); }
    .la-social-whatsapp { background: #35C759; box-shadow: 0 8px 16px -4px rgba(53,199,89,0.55); }
    .la-social-web { background: var(--blue-dark); box-shadow: 0 8px 16px -4px rgba(31,94,140,0.55); }
    @media (max-width: 380px) { .la-social-grid { grid-template-columns: 1fr; } }

    @keyframes la-pop { from { opacity: 0; transform: translateY(-4px) scale(0.98); } to { opacity: 1; transform: none; } }
    @keyframes la-fade { from { opacity: 0; } to { opacity: 1; } }

    @media (prefers-reduced-motion: reduce) {
      #la-root * { animation: none !important; transition: none !important; }
    }
  `}</style>
);

/* =========================================================
   App
========================================================= */
export default function LogbookAgrinak({ onLoginSuccess }) {
    const [loginOpen, setLoginOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

    useEffect(() => {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        link.href = LOGO_URL;
        document.title = "Logbook Agrinak";
    }, []);

    return (
        <div id="la-root">
            <GlobalStyle />
            <Header onLogin={() => setLoginOpen(true)} />
            <Hero />
            <About />
            <Monitoring />
            <Footer onReport={() => setReportOpen(true)} />
            <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLoginSuccess={onLoginSuccess} />
            <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
        </div>
    );
}