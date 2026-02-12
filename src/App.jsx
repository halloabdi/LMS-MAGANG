/**
 * BACKEND GOOGLE APPS SCRIPT FOR LMS DASHBOARD
 * --------------------------------------------
 * ID Script: [JANGAN LUPA DEPLOY SEBAGAI WEB APP]
 * Akses: Siapa saja (Anyone)
 */

// --- KONFIGURASI CONSTANTS ---
const ID_SPREADSHEET_AKUN = "1T6Li6ogsv1C9pRzzdByc_Ae8mBvmqachppwNnB02is4"; // ID Spreadsheet UTAMA
const SHEET_MAHASISWA = "InfoAkunMahasiswa";
const SHEET_DOSEN = "InfoAkunDosen";
const SHEET_LOGBOOK = "PengumpulanLogbook";
const SHEET_LAPORAN = "PengumpulanLaporanAkhir"; // Asumsi nama sheet laporan

/**
 * Fungsi utama untuk menangani request POST
 */
function doPost(e) {
    try {
        if (!e || !e.postData) throw new Error("No data received");
        const data = JSON.parse(e.postData.contents);
        if (!data) throw new Error("Failed to parse JSON data.");

        const action = data.action;

        let result;
        switch (action) {
            case "login":
                if (!data) throw new Error("Data invalid before login handler.");
                result = handleLogin(data);
                break;
            case "submitLogbook":
                result = handleSubmitLogbook(data);
                break;
            case "submitReport":
                result = handleSubmitReport(data);
                break;
            default:
                throw new Error("Invalid action: " + action);
        }

        return ContentService.createTextOutput(JSON.stringify({ status: "success", data: result }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Fungsi utama untuk menangani request GET
 */
function doGet(e) {
    try {
        const action = e.parameter.action;

        // Parameter opsional
        const userId = e.parameter.userId;
        const role = e.parameter.role;

        if (!action) throw new Error("Missing action parameter");

        let result;
        switch (action) {
            case "getDashboardData":
                // Bisa dikembangkan untuk data spesifik user
                result = { message: "Ready" };
                break;
            case "getAllLogbooks": // Khusus Dosen
                result = handleGetAllLogbooks();
                break;
            default:
                throw new Error("Invalid action: " + action);
        }

        return ContentService.createTextOutput(JSON.stringify({ status: "success", data: result }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// --- FUNGSI LOGIKA UTAMA ---

// --- FUNGSI LOGIKA UTAMA ---

function handleLogin(data) {
    if (!data) throw new Error("Internal Error: handleLogin received empty data.");
    // Debugging: Ensure properties exist
    if (data.identifier === undefined) throw new Error("Login Data Error: Identifier is missing.");

    const { identifier, password } = data;
    const ss = SpreadsheetApp.openById(ID_SPREADSHEET_AKUN);

    // 1. Cek Mahasiswa
    const sheetMhs = ss.getSheetByName(SHEET_MAHASISWA);
    const dataMhs = sheetMhs.getDataRange().getValues();
    // Header Mapping (0-indexed based on Request):
    // 0:id, 1:email, 2:username, 3:full_name, 4:kelas, 5:status, 6:phone, 7:pass, 8:photo, 9:tempat_magang, 10:alamat_magang, 11:dospem_int, 12:dospem_ext, 13:link_folder

    for (let i = 1; i < dataMhs.length; i++) {
        const row = dataMhs[i];
        if ((row[1] == identifier || row[2] == identifier || row[6] == identifier) && row[7] == password) {
            return {
                role: "student",
                id: row[0],
                email: row[1],
                username: row[2], // NIM
                name: row[3],     // Full Name
                class: row[4],
                phone: row[6],
                photoUrl: row[8],
                internship_place: row[9],
                internship_addr: row[10], // Penting untuk validasi
                link_folder: row[13]
            };
        }
    }

    // 2. Cek Dosen
    const sheetDosen = ss.getSheetByName(SHEET_DOSEN);
    const dataDosen = sheetDosen.getDataRange().getValues();
    // Header Mapping: id, username, email, phone, full_name, jabatan, class1, password, photo, bio, link_folder

    for (let i = 1; i < dataDosen.length; i++) {
        const row = dataDosen[i];
        // Asumsi kolom Password index 7 (H)
        if ((row[1] == identifier || row[2] == identifier) && row[7] == password) {
            return {
                role: "lecturer",
                id: row[0],
                username: row[1],
                email: row[2],
                name: row[4],
                jabatan: row[5],
                classId: row[6],
                photoUrl: row[8],
                bio: row[9]
            };
        }
    }

    throw new Error("Login gagal. Periksa Username/Email dan Password.");
}

function handleSubmitLogbook(data) {
    // Data received from frontend
    const { username, fullname, className, link_folder, logEntry } = data;

    // 1. Upload File ke Folder Mahasiswa
    const folderId = getIdFromUrl(link_folder);
    if (!folderId) throw new Error("Link Folder Mahasiswa tidak valid.");
    const folder = DriveApp.getFolderById(folderId);

    // Save Selfie
    let selfieUrl = "";
    if (logEntry.selfieBase64) {
        const blob = Utilities.newBlob(Utilities.base64Decode(logEntry.selfieBase64.split(',')[1]), "image/png", `Selfie_${username}_${Date.now()}.png`);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        selfieUrl = file.getUrl();
    }

    // Save Doc
    let docUrl = "";
    if (logEntry.docBase64) {
        const mimeString = logEntry.docBase64.split(',')[0].split(':')[1].split(';')[0];
        const header = logEntry.docBase64.split(',')[1];
        // Buat nama file default jika tidak ada
        const blob = Utilities.newBlob(Utilities.base64Decode(header), mimeString, `Dok_${username}_${Date.now()}`);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        docUrl = file.getUrl();
    }

    // 2. Simpan ke Sheet "PengumpulanLogbook"
    const ss = SpreadsheetApp.openById(ID_SPREADSHEET_AKUN);
    let sheet = ss.getSheetByName(SHEET_LOGBOOK);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_LOGBOOK);
        sheet.appendRow([
            "TimeStamp", "Nama Lengkap", "Kelas", "username", "Tanggal", "Jam Absen",
            "Status", "Koordinat", "Akurasi_Meter", "Alamat Lengkap",
            "Link Foto Profil", "Detail Kegiatan", "Output yang Dihasilkan", "Link Dokumentasi"
        ]);
    }

    // Format Koordinat
    const coordString = `${logEntry.lat}, ${logEntry.lng}`;

    sheet.appendRow([
        new Date(),       // TimeStamp
        fullname,         // Nama Lengkap
        className,        // Kelas
        username,         // Username (NIM)
        logEntry.date,    // Tanggal
        logEntry.time,    // Jam Absen
        logEntry.status,  // Status
        coordString,      // Koordinat
        logEntry.accuracy,// Akurasi
        logEntry.address, // Alamat Lengkap
        selfieUrl,        // Link Foto Selfie (Profil di sheet)
        logEntry.activity,// Detail
        logEntry.output,  // Output
        docUrl            // Link Dok
    ]);

    return { message: "Logbook berhasil disimpan", selfieUrl, docUrl };
}

function handleSubmitReport(data) {
    const { username, reportData, link_folder } = data;

    // 1. Upload ke Drive
    const folderId = getIdFromUrl(link_folder);
    const folder = DriveApp.getFolderById(folderId);

    let reportFileUrl = "";
    if (reportData.fileBase64) {
        const mimeString = reportData.fileBase64.split(',')[0].split(':')[1].split(';')[0];
        const blob = Utilities.newBlob(Utilities.base64Decode(reportData.fileBase64.split(',')[1]), mimeString, reportData.fileName || `Laporan_${username}`);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        reportFileUrl = file.getUrl();
    }

    // 2. Simpan ke Sheet Laporan
    const ss = SpreadsheetApp.openById(ID_SPREADSHEET_AKUN);
    let sheet = ss.getSheetByName(SHEET_LAPORAN);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_LAPORAN);
        sheet.appendRow(["TimeStamp", "Judul Laporan", "Ringkasan/Overview", "Link Data Laporan"]);
    }

    sheet.appendRow([
        new Date(),
        reportData.title,
        reportData.overview,
        reportFileUrl
    ]);

    return { message: "Laporan berhasil dikumpulkan", reportFileUrl };
}

function handleGetAllLogbooks() {
    const ss = SpreadsheetApp.openById(ID_SPREADSHEET_AKUN);

    // 1. Ambil Data Referensi Mahasiswa (untuk Validasi Alamat)
    const sheetMhs = ss.getSheetByName(SHEET_MAHASISWA);
    const dataMhs = sheetMhs.getDataRange().getValues();
    const mhsMap = {}; // Map: username/NIM -> Alamat Magang

    // Skip header
    for (let i = 1; i < dataMhs.length; i++) {
        const nim = dataMhs[i][2]; // Username/NIM
        const alamatMagang = dataMhs[i][10]; // Alamat tempat magang
        mhsMap[nim] = alamatMagang ? alamatMagang.toLowerCase() : "";
    }

    // 2. Ambil Data Logbook
    const sheetLog = ss.getSheetByName(SHEET_LOGBOOK);
    if (!sheetLog) return []; // Belum ada logbook

    const logs = sheetLog.getDataRange().getValues();
    // Header: TimeStamp, Nama, Kelas, Username, Tanggal, Jam, Status, Coord, Acc, Alamat, Selfie, Activity, Output, Doc
    // Index: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13

    const result = [];
    // Loop dari i=1 (Skip Header)
    for (let i = 1; i < logs.length; i++) {
        const row = logs[i];

        // --- VALIDASI LOGIC ---
        const nim = row[3];
        const alamatLogbook = row[9] ? row[9].toLowerCase() : "";
        const alamatTarget = mhsMap[nim] || "";

        // Cek Sederhana: Apakah kata kunci alamat target ada di alamat logbook?
        // Atau sebaliknya, jika alamat logbook ada di target (misal target lebih lengkap)
        // Kita pakai basic includes check for robustness
        let isValid = false;

        if (alamatTarget && alamatLogbook) {
            // Cek token/kata penting. Misal "Malang", "Batu", "Jalan", dll.
            // Metode paling aman: Cek apakah Logbook Address mengandung bagian dari Target Address
            // Karena Logbook (GPS) biasanya sangat spesifik (Jalan No X..), sedangkan Target mungkin hanya "Dinas Peternakan X"
            // Jadi kita cek: Apakah Alamat Magang TERKANDUNG (sebagian) dalam Alamat GPS?
            // ATAU Apakah Alamat GPS mengandung Alamat Magang? 
            // Mari kita anggap VALID jika ada kesamaan signifikan.

            // Simplifikasi: Jika Alamat Logbook mengandung nama kota/kecamatan dari Alamat Magang
            // Clean strings
            const cleanLog = alamatLogbook.replace(/[^a-z0-9]/g, '');
            const cleanTarget = alamatTarget.replace(/[^a-z0-9]/g, '');

            // Jika salah satu mengandung yang lain -> valid
            if (alamatLogbook.includes(alamatTarget) || alamatTarget.includes(alamatLogbook)) {
                isValid = true;
            } else {
                // Fallback: Word intersection > 30%?
                // Untuk sekarang kita set strict: user manualnya harus sama
                // Kita set false dulu biar Dosen aware
                isValid = false;
            }
        }

        // UPDATE: User meminta "Menyesuaikan Alamat Lengkap dengan alamat_tempat_magang"
        // Jika status "Hadir", validasi penting. Jika "Sakit/Izin", mungkin ignore?
        // Tapi user minta "validasi alamat", asumsi untuk kehadiran.
        const statusAbsen = row[6]; // Hadir/Izin/Sakit
        if (statusAbsen !== 'Hadir') isValid = true; // Bypass jika tidak hadir

        // Split coord back to lat/lng
        const coords = (row[7] || "").split(",");
        const lat = coords[0] ? parseFloat(coords[0].trim()) : 0;
        const lng = coords[1] ? parseFloat(coords[1].trim()) : 0;

        result.push({
            id: i, // Row ID
            timestamp: row[0],
            name: row[1],
            class: row[2],
            nim: row[3],
            date: formatDate(row[4]), // Helper date
            time: formatTime(row[5]), // Helper time
            status: row[6],
            lat: lat,
            lng: lng,
            accuracy: row[8],
            address: row[9],
            selfieUrl: row[10],
            activity: row[11],
            output: row[12],
            docUrl: row[13],
            isLocationValid: isValid,
            targetAddress: mhsMap[nim] // Kirim untuk referensi dosen
        });
    }

    return result.reverse(); // Terbaru paling atas
}

function getIdFromUrl(url) {
    if (!url) return null;
    const match = url.match(/[-\w]{25,}/);
    return match ? match[0] : null;
}

function formatDate(dateObj) {
    if (!dateObj) return "";
    if (typeof dateObj === 'string') return dateObj;
    // Format YYYY-MM-DD
    return Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function formatTime(timeObj) {
    if (!timeObj) return "";
    if (typeof timeObj === 'string') return timeObj;
    // Format HH:mm
    return Utilities.formatDate(timeObj, Session.getScriptTimeZone(), "HH:mm");
}
