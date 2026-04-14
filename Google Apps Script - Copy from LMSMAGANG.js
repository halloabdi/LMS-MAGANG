/**
 * BACKEND GOOGLE APPS SCRIPT FOR LMS DASHBOARD
 * --------------------------------------------
 * PENTING: IKUTI PROSEDUR DEPLOYMENT INI DENGAN TEPAT!
 * 
 * 1. Klik "Deploy" -> "New Deployment"
 * 2. Pilih type: "Web app"
 * 3. Configuration:
 *    - Description: (Versi Terbaru)
 *    - Execute as: **Me** (Email Anda/Pemilik Script)  <-- SANGAT PENTING! JANGAN PILIH 'User accessing the web app'
 *    - Who has access: **Anyone** (Siapa saja)
 * 4. Klik "Deploy"
 * 5. Salin URL baru ke file "src/config.js" atau "App.jsx"
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
            case "editLogbook":
                result = handleEditLogbook(data);
                break;
            case "deleteLogbook":
                result = handleDeleteLogbook(data);
                break;
            case "updateProfile":
                result = handleUpdateProfile(data);
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
            case "getAllLogbooks": // Dosen & Mahasiswa Use This
                result = handleGetAllLogbooks(role, userId);
                break;
            case "getUnsubmitted":
                result = handleGetUnsubmitted(e.parameter.startDate, e.parameter.endDate, e.parameter.userId, e.parameter.role);
                break;
            case "getSupervisedStudents":
                result = handleGetSupervisedStudents(e.parameter.userId);
                break;
            case "editLogbook":
                // Edit Logbook likely sends Base64, might be heavy for doGet param but following pattern
                // If previous submit worked via doGet (queryParams), this might fail for images.
                // Checking code: handleSubmitLogbook isn't in doGet switch.
                // It must be in doPost.
                throw new Error("Use doPost for editLogbook");
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

// ... (Existing Functions) ...

function handleGetSupervisedStudents(userId) {
    const ss = SpreadsheetApp.openById(ID_SPREADSHEET_AKUN);

    // 1. Dapatkan Nama Dosen dari userId (NIP/Username)
    let lecturerName = "";
    if (String(userId) === "111223344556677888" || String(userId) === "111222333444") {
        return handleGetAllStudentsForAdmin(ss); // Super Admin lihat semua
    }

    const sheetDosen = ss.getSheetByName(SHEET_DOSEN);
    const dataDosen = sheetDosen.getDataRange().getValues();
    for (let i = 1; i < dataDosen.length; i++) {
        if (String(dataDosen[i][1]).trim() === String(userId).trim()) {
            lecturerName = dataDosen[i][4]; // Full Name
            break;
        }
    }

    if (!lecturerName) return []; // Dosen tidak ditemukan -> Fail Safe

    // 2. Filter Mahasiswa Bimbingan
    const sheetMhs = ss.getSheetByName(SHEET_MAHASISWA);
    const dataMhs = sheetMhs.getDataRange().getValues();
    const supervisedStudents = [];

    // Helper: Normalize & Tokenize
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
    const titleBlacklist = new Set([
        'dr', 'ir', 'prof', 'h', 'hj',
        'sp', 'st', 'se', 'sh', 'skom', 'ss', 'spsi', 'sked', 'spt', 'sn', 'sds', 'sap', 'sos',
        'mp', 'mt', 'mm', 'mh', 'mkom', 'msi', 'mpd', 'mpsi', 'mars', 'magr', 'ms', 'mba',
        'phd', 'agr', 'pt', 'si', 'kep', 'farm', 'pd', 'kom'
    ]);

    const lecClean = normalize(lecturerName);
    const lecTokens = lecClean.split(/\s+/).filter(w => w.length > 1 && !titleBlacklist.has(w));

    for (let i = 1; i < dataMhs.length; i++) {
        const row = dataMhs[i];
        const studentSem = row[5]; // Status Mahasiswa (Aktif/Tidak) - Optional check
        const supervisorName = String(row[11]); // Dospem Internal (Col L)

        if (!supervisorName) continue;

        // Perform Matching
        const supClean = normalize(supervisorName);
        const supTokens = new Set(supClean.split(/\s+/));

        let matchCount = 0;
        lecTokens.forEach(token => {
            if (supTokens.has(token)) matchCount++;
        });

        const threshold = lecTokens.length <= 1 ? 0.9 : 0.5;
        const matchRatio = lecTokens.length > 0 ? (matchCount / lecTokens.length) : 0;

        if (matchRatio >= threshold) {
            supervisedStudents.push({
                id: row[0],
                name: row[3],
                nim: String(row[2]).replace(/^'/, ''),
                class: row[4],
                photoUrl: row[8],
                status: row[5]
            });
        }
    }

    return supervisedStudents;
}

function handleGetAllStudentsForAdmin(ss) {
    const sheetMhs = ss.getSheetByName(SHEET_MAHASISWA);
    const dataMhs = sheetMhs.getDataRange().getValues();
    const students = [];
    for (let i = 1; i < dataMhs.length; i++) {
        const row = dataMhs[i];
        students.push({
            id: row[0],
            name: row[3],
            nim: String(row[2]).replace(/^'/, ''),
            class: row[4],
            photoUrl: row[8],
            status: row[5]
        });
    }
    return students;
}

// --- FUNGSI TEST (JALANKAN INI DI EDITOR SEKALI UNTUK IZIN) ---
function setupAuth() {
    // 1. Spreadsheet Permission
    SpreadsheetApp.getActiveSpreadsheet();

    // 2. Drive Permission (Full Access)
    // Membuat file dummy lalu menghapusnya untuk memancing izin 'https://www.googleapis.com/auth/drive'
    const root = DriveApp.getRootFolder();
    const dummy = root.createFile("temp_auth_check_lms.txt", "Just checking permissions");
    dummy.setTrashed(true); // Langsung hapus

    console.log("Izin LENGKAP berhasil diberikan! Sekarang silakan Deploy.");
}

function setupPermissions() {
    DriveApp.getFiles();
    SpreadsheetApp.getActive();
    console.log("Izin Drive & Spreadsheet berhasil diberikan.");
}

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

    // Header Mapping (User Provided):
    // 0:id(A), 1:email(B), 2:username(C), 3:fullname(D), 4:class(E), 5:status(F), 
    // 6:phone(G), 7:password(H), 8:photo(I), 9:internship(J), 10:address(K), 
    // 11:dospem_int(L), 12:dospem_ext(M), 13:folder(N)

    for (let i = 1; i < dataMhs.length; i++) {
        const row = dataMhs[i];

        // Robust Comparison
        const inputId = String(identifier).trim();
        const inputPass = String(password).trim();

        const dbEmail = String(row[1]).trim();
        const dbUser = String(row[2]).trim();
        const dbPhone = String(row[6]).trim();
        const dbPass = String(row[7]).trim();

        if ((dbEmail == inputId || dbUser == inputId || dbPhone == inputId) && dbPass == inputPass) {
            return {
                role: "student",
                id: row[0],
                email: row[1],
                username: String(row[2]).replace(/^'/, '').trim(), // Ensure clean username
                name: row[3],
                class: row[4],
                status: row[5],
                phone: row[6],
                photoUrl: row[8],
                internship_place: row[9],
                internship_addr: row[10],
                supervisor_internal: row[11], // Mapped to 'supervisor_internal' for App.jsx
                dospem_external: row[12],
                link_folder: row[13],
                bio: row[14] // Added Bio (Col O)
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
                phone: row[3], // Added Phone (Col D)
                name: row[4],
                jabatan: row[5],
                classId: row[6],
                photoUrl: row[8],
                bio: row[9],
                link_folder: row[10] // Added Link Folder (Col K)
            };
        }
    }

    throw new Error("Login gagal. Periksa Username/Email dan Password.");
}

// --- HELPER: Fetch Folder Link Strictly by Username ---
function getStudentFolderUrl(username) {
    const cleanUser = String(username).trim().replace(/^'/, '');
    const ss = SpreadsheetApp.openById(ID_SPREADSHEET_AKUN);
    const sheet = ss.getSheetByName(SHEET_MAHASISWA);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        // Col C (Index 2) is Username
        const rowUser = String(data[i][2]).trim().replace(/^'/, '');
        if (rowUser === cleanUser) {
            // Col N (Index 13) is link_folder
            return data[i][13];
        }
    }
    return null;
}

function handleSubmitLogbook(data) {
    // Data received from frontend
    const { username, fullname, className, logEntry } = data;
    // Note: We IGNORE data.link_folder from frontend for security

    // STRICT SANITIZATION
    const cleanUsername = String(username).trim().replace(/^'/, '');
    if (!cleanUsername) throw new Error("Username (NIM) tidak valid atau kosong.");

    // 1. FETCH FOLDER LINK SERVER-SIDE
    const realFolderLink = getStudentFolderUrl(cleanUsername);
    if (!realFolderLink) throw new Error("Folder penyimpanan tidak ditemukan untuk user ini di Database (Kolom N). Hubungi Admin.");

    const folderId = getIdFromUrl(realFolderLink);
    if (!folderId) throw new Error("Link Folder di database tidak valid. User: " + cleanUsername);

    const folder = DriveApp.getFolderById(folderId);

    // Save Selfie
    let selfieUrl = "";
    if (logEntry.selfieBase64) {
        const blob = Utilities.newBlob(Utilities.base64Decode(logEntry.selfieBase64.split(',')[1]), "image/png", `Selfie_${username}_${Date.now()}.png`);
        const file = folder.createFile(blob);
        try {
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch(e) { /* Abaikan jika error, file akan mewarisi izin dari folder */ }
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
        try {
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch(e) { /* Abaikan jika error, file akan mewarisi izin dari folder */ }
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

    // --- SMART COLUMN MAPPING ---
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const colMap = {};
    headers.forEach((h, i) => colMap[h.trim()] = i);

    // Default Headers if missing (Fallback)
    const requiredHeaders = [
        "TimeStamp", "Nama Lengkap", "Kelas", "username", "Tanggal", "Jam Absen",
        "Status", "Koordinat", "Akurasi_Meter", "Alamat Lengkap",
        "Link Foto Profil", "Detail Kegiatan", "Output yang Dihasilkan", "Link Dokumentasi"
    ];

    // Check if we need to add headers (for new sheets or missing cols)
    // Note: Simplified logic - assumes if headers exist, we use them.

    const newRow = new Array(headers.length).fill(""); // Init empty row

    // Helper to safely set value
    const setVal = (headerName, val) => {
        if (colMap[headerName] !== undefined) {
            newRow[colMap[headerName]] = val;
        } else {
            // If header not found, maybe append? For now, log or skip.
            // Better: Append to end if extremely necessary, but standard columns should exist.
            // Fallback for crucial data:
            if (headerName === "Koordinat") newRow[7] = val; // Fallback to index 7
            if (headerName === "Link Foto Profil") newRow[10] = val; // Fallback to index 10 (Col K)
            if (headerName === "Link Dokumentasi") newRow[13] = val; // Fallback to index 13 (Col N)
        }
    };

    // Format Koordinat
    const suffix = logEntry.locationType === 'automatic' ? ' ## Deteksi Otomatis' : ' ## Input Manual';
    const coordString = `${logEntry.lat}, ${logEntry.lng}${suffix}`;
    const addressString = `${logEntry.address}${suffix}`;

    // Fill Data using Map
    setVal("TimeStamp", new Date());
    setVal("Nama Lengkap", fullname);
    setVal("Kelas", className);
    setVal("username", "'" + cleanUsername);
    setVal("Tanggal", logEntry.date);
    setVal("Jam Absen", logEntry.time);
    setVal("Status", logEntry.status);
    setVal("Koordinat", coordString); // Contains suffix
    setVal("Akurasi_Meter", logEntry.accuracy);
    setVal("Alamat Lengkap", addressString); // Contains suffix
    setVal("Link Foto Profil", selfieUrl);
    setVal("Detail Kegiatan", logEntry.activity);
    setVal("Output yang Dihasilkan", logEntry.output);
    setVal("Link Dokumentasi", docUrl);

    sheet.appendRow(newRow);

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
        try {
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch(e) { /* Abaikan jika error, file akan mewarisi izin dari folder */ }
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

function handleGetAllLogbooks(role, userId) {
    const ss = SpreadsheetApp.openById(ID_SPREADSHEET_AKUN);

    // --- STRICT SECURITY & VALIDATION ---
    if (!userId || !role) return [];

    const requestUserClean = String(userId).trim().replace(/^'/, '');

    // 1. Ambil Data Referensi Mahasiswa (untuk Validasi Alamat & Filter Dosen)
    const sheetMhs = ss.getSheetByName(SHEET_MAHASISWA);
    const dataMhs = sheetMhs.getDataRange().getValues();
    const mhsMap = {}; // Map: username/NIM -> { address: string, supervisor: string }

    // Skip header
    for (let i = 1; i < dataMhs.length; i++) {
        const nim = String(dataMhs[i][2]).trim().replace(/^'/, ''); // Ensure strict NIM clean
        const alamatMagang = dataMhs[i][10];
        const dospemInternal = dataMhs[i][11];

        if (nim) {
            mhsMap[nim] = {
                address: alamatMagang ? alamatMagang.toLowerCase() : "",
                supervisor: dospemInternal ? String(dospemInternal).toLowerCase() : ""
            };
        }
    }

    // 2. Tentukan Filter Logic untuk Dosen
    let filterLecturerName = null;
    let isSuperAdmin = false;

    if (role === 'lecturer') {
        const cleanUserId = requestUserClean;

        // Cek Super Admin (Hardcoded Bypass)
        if (cleanUserId === "111223344556677888" || cleanUserId === "111222333444") {
            isSuperAdmin = true;
        } else {
            // Cari Nama Lengkap Dosen berdasarkan Username/NIP (userId)
            const sheetDosen = ss.getSheetByName(SHEET_DOSEN);
            const dataDosen = sheetDosen.getDataRange().getValues();

            for (let i = 1; i < dataDosen.length; i++) {
                if (String(dataDosen[i][1]).trim() === cleanUserId) {
                    filterLecturerName = dataDosen[i][4]; // Full Name
                    break;
                }
            }
            // Strict: Jika dosen tidak ditemukan, return empty immediately
            if (!filterLecturerName) return [];
        }
    } else if (role !== 'student') {
        // SECURITY: Jika role bukan student dan bukan lecturer, TOLAK AKSES.
        return [];
    }

    // 3. Ambil Data Logbook
    const sheetLog = ss.getSheetByName(SHEET_LOGBOOK);
    if (!sheetLog) return [];

    const logs = sheetLog.getDataRange().getValues();
    const result = [];

    // Loop dari i=1 (Skip Header)
    for (let i = 1; i < logs.length; i++) {
        const row = logs[i];

        // --- VALIDASI LOGIC ---
        let nim = String(row[3]).trim().replace(/^'/, ''); // Strict Clean for Compare

        // --- FILTER ACCESS CONTROL (STRICT) ---
        // 1. Filter Mahasiswa: Hanya lihat punya sendiri
        if (role === 'student') {
            if (nim !== requestUserClean) {
                continue; // Skip miliknya orang lain
            }
        }

        // 2. Filter Dosen: Hanya lihat mahasiswa bimbingan (kecuali Super Admin)
        if (role === 'lecturer' && !isSuperAdmin) {
            const studentInfo = mhsMap[nim]; // Lookup MUST match strict NIM
            if (!studentInfo) continue; // Skip jika data mahasiswa tidak valid/ditemukan

            const studentSupervisor = studentInfo.supervisor;
            if (!studentSupervisor) continue;

            const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
            const supClean = normalize(studentSupervisor);
            const lecClean = normalize(filterLecturerName);

            // Optimization: Simple check first
            if (!supClean.includes(lecClean.split(' ')[0])) {
                // Checking tokens logic below only if needed
            }

            // Reuse existing token logic
            const titleBlacklist = new Set([
                'dr', 'ir', 'prof', 'h', 'hj',
                'sp', 'st', 'se', 'sh', 'skom', 'ss', 'spsi', 'sked', 'spt', 'sn', 'sds', 'sap', 'sos',
                'mp', 'mt', 'mm', 'mh', 'mkom', 'msi', 'mpd', 'mpsi', 'mars', 'magr', 'ms', 'mba',
                'phd', 'agr', 'pt', 'si', 'kep', 'farm', 'pd', 'kom'
            ]);

            const lecTokens = lecClean.split(/\s+/).filter(w => w.length > 1 && !titleBlacklist.has(w));
            const supTokens = new Set(supClean.split(/\s+/));

            let matchCount = 0;
            lecTokens.forEach(token => {
                if (supTokens.has(token)) matchCount++;
            });

            const threshold = lecTokens.length <= 1 ? 0.9 : 0.5;
            const matchRatio = lecTokens.length > 0 ? (matchCount / lecTokens.length) : 0;

            if (matchRatio < threshold) {
                continue;
            }
        }

        // Prepare Data
        const studentInfo = mhsMap[nim] || { address: "", supervisor: "" };
        const alamatLogbook = row[9] ? String(row[9]).toLowerCase() : "";
        const alamatTarget = studentInfo.address;

        // Validation Logic (Keep Existing)
        let isValid = false;
        const statusAbsen = row[6];

        if (statusAbsen === 'Hadir') {
            if (alamatTarget && alamatLogbook) {
                const logTokens = alamatLogbook.split(/[\s,]+/).filter(w => w.length > 3);
                const targetTokens = alamatTarget.split(/[\s,]+/).filter(w => w.length > 3);
                let matches = 0;
                targetTokens.forEach(token => {
                    if (alamatLogbook.includes(token)) matches++;
                });
                if (matches > 0 || alamatLogbook.includes(alamatTarget) || alamatTarget.includes(alamatLogbook)) {
                    isValid = true;
                }
            } else {
                isValid = true;
            }
        } else {
            isValid = true;
        }

        // Fix Image URL
        let selfieUrl = row[10] ? String(row[10]) : "";
        if (selfieUrl && (selfieUrl.includes("drive.google.com") || selfieUrl.includes("open?id="))) {
            const idMatch = getIdFromUrl(selfieUrl);
            if (idMatch) selfieUrl = `https://lh3.googleusercontent.com/d/${idMatch}`;
        }

        let docUrl = row[13] ? String(row[13]) : "";
        if (docUrl && (docUrl.includes("drive.google.com") || docUrl.includes("open?id="))) {
            const idMatch = getIdFromUrl(docUrl);
            if (idMatch) docUrl = `https://lh3.googleusercontent.com/d/${idMatch}`;
        }

        // Parse Location Status from Coordinate string or Address string
        let locationType = 'manual'; // Default
        const coordRaw = row[7] ? String(row[7]) : "";
        const addrRaw = row[9] ? String(row[9]) : "";

        if (coordRaw.includes("## Deteksi Otomatis") || addrRaw.includes("## Deteksi Otomatis")) {
            locationType = 'automatic';
        } else if (coordRaw.includes("## Input Manual") || addrRaw.includes("## Input Manual")) {
            locationType = 'manual';
        }

        // Clean up coordinate string for display
        let lat = 0, lng = 0;
        let displayCoord = coordRaw.replace(" ## Deteksi Otomatis", "").replace(" ## Input Manual", "");

        if (displayCoord) {
            const parts = displayCoord.split(',');
            if (parts.length >= 2) {
                lat = parseFloat(parts[0].trim());
                lng = parseFloat(parts[1].trim());
            }
        }

        // Clean address for display
        let cleanAddress = addrRaw.replace(" ## Deteksi Otomatis", "").replace(" ## Input Manual", "");

        result.push({
            id: i,
            timestamp: row[0],
            name: row[1],
            class: row[2],
            nim: nim, // Use clean NIM
            date: formatDate(row[4]),
            time: formatTime(row[5]),
            status: row[6],
            lat: lat,
            lng: lng,
            accuracy: row[8],
            address: cleanAddress,
            locationType: locationType, // Add explicit status
            selfieUrl: selfieUrl,
            activity: row[11],
            output: row[12],
            docUrl: docUrl,
            isLocationValid: isValid,
            targetAddress: studentInfo.address || "Belum diset di InfoAkunMahasiswa"
        });
    }

    return result.reverse();
}

function handleEditLogbook(data) {
    const { username, originalDate, originalTime, logEntry, link_folder } = data;
    const ss = SpreadsheetApp.openById(ID_SPREADSHEET_AKUN);
    const sheet = ss.getSheetByName(SHEET_LOGBOOK);
    const rows = sheet.getDataRange().getValues();

    const cleanReqUser = String(username).trim().replace(/^'/, '');

    // Find row index (Skipping header)
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
        const rowUser = String(rows[i][3]).trim().replace(/^'/, ''); // Username in Col D
        const rowDateStr = formatDate(rows[i][4]); // Tanggal in Col E
        const rowTimeStr = formatTime(rows[i][5]); // Jam in Col F

        // Robust comparison using exact date and time strings instead of volatile timestamp
        if (rowUser === cleanReqUser && rowDateStr === originalDate && rowTimeStr === originalTime) {
            rowIndex = i + 1; // 1-based index for Sheet operations
            break;
        }
    }

    if (rowIndex === -1) {
        throw new Error("Logbook tidak ditemukan untuk user ini. Cocokkan NIM, Tanggal, dan Jam.");
    }

    // 1. Handle File Uploads (Optional)
    let folder = null;
    if (logEntry.selfieBase64 || logEntry.docBase64) {
        // Enforce Server-Side Lookup
        const realFolderLink = getStudentFolderUrl(cleanReqUser);
        if (!realFolderLink) throw new Error("Folder penyimpanan tidak ditemukan di Database (Kolom N). Hubungi Admin.");

        const folderId = getIdFromUrl(realFolderLink);
        if (!folderId) throw new Error("Link Folder di database tidak valid.");

        folder = DriveApp.getFolderById(folderId);
    }

    let newSelfieUrl = null;
    let newDocUrl = null;

    // Update Selfie if provided
    if (logEntry.selfieBase64 && folder) {
        const blob = Utilities.newBlob(Utilities.base64Decode(logEntry.selfieBase64.split(',')[1]), "image/png", `Selfie_Edit_${username}_${Date.now()}.png`);
        const file = folder.createFile(blob);
        try {
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch(e) {}
        newSelfieUrl = file.getUrl();
        // Column K (Index 11 -> Col 11 is K) -> Wait. 
        // Header: TimeStamp(1), Nama(2), Kelas(3), Username(4), Tanggal(5), Jam(6), Status(7), Coord(8), Acc(9), Alamat(10), Selfie(11), Activity(12), Output(13), Doc(14)
        // Index in getRange: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
        sheet.getRange(rowIndex, 11).setValue(newSelfieUrl);
    }

    // Update Doc if provided
    if (logEntry.docBase64 && folder) {
        const mimeString = logEntry.docBase64.split(',')[0].split(':')[1].split(';')[0];
        const header = logEntry.docBase64.split(',')[1];
        const blob = Utilities.newBlob(Utilities.base64Decode(header), mimeString, `Dok_Edit_${username}_${Date.now()}`);
        const file = folder.createFile(blob);
        try {
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch(e) {}
        newDocUrl = file.getUrl();
        sheet.getRange(rowIndex, 14).setValue(newDocUrl); // Col N is 14
    }

    // 2. Update Text Fields
    // Activity (Col L -> 12), Output (Col M -> 13)
    sheet.getRange(rowIndex, 12).setValue(logEntry.activity);
    sheet.getRange(rowIndex, 13).setValue(logEntry.output);

    // 3. Conditional Update: Location
    if (logEntry.updateLocation) {
        // Coord (Col H -> 8), Acc (Col I -> 9), Alamat (Col J -> 10)
        sheet.getRange(rowIndex, 8).setValue(`${logEntry.lat}, ${logEntry.lng}`);
        sheet.getRange(rowIndex, 9).setValue(logEntry.accuracy);
        sheet.getRange(rowIndex, 10).setValue(logEntry.address);
    }

    // 4. Conditional Update: Date/Time (If manually changed)
    // Tanggal (Col E -> 5), Jam (Col F -> 6), Status (Col G -> 7)
    sheet.getRange(rowIndex, 5).setValue(logEntry.date);
    sheet.getRange(rowIndex, 6).setValue(logEntry.time);
    sheet.getRange(rowIndex, 7).setValue(logEntry.status); // User might change status

    return { message: "Logbook berhasil diperbarui.", selfieUrl: newSelfieUrl, docUrl: newDocUrl };
}

function handleDeleteLogbook(data) {
    const { username, originalDate, originalTime } = data;
    const ss = SpreadsheetApp.openById(ID_SPREADSHEET_AKUN);
    const sheet = ss.getSheetByName(SHEET_LOGBOOK);
    const rows = sheet.getDataRange().getValues();

    const cleanReqUser = String(username).trim().replace(/^'/, '');

    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
        const rowUser = String(rows[i][3]).trim().replace(/^'/, '');
        const rowDateStr = formatDate(rows[i][4]);
        const rowTimeStr = formatTime(rows[i][5]);

        if (rowUser === cleanReqUser && rowDateStr === originalDate && rowTimeStr === originalTime) {
            rowIndex = i + 1;
            break;
        }
    }

    if (rowIndex === -1) {
        throw new Error("Data logbook tidak ditemukan atau sudah dihapus. Data mungkin tidak sinkron.");
    }

    sheet.deleteRow(rowIndex);
    return { message: "Logbook berhasil dihapus." };
}

function getIdFromUrl(url) {
    if (!url) return null;
    let id = "";
    const parts = url.split(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
    if (url.includes("folders/")) {
        const match = url.match(/folders\/([a-zA-Z0-9-_]+)/);
        if (match) id = match[1];
    } else if (url.includes("id=")) {
        const match = url.match(/id=([a-zA-Z0-9-_]+)/);
        if (match) id = match[1];
    } else {
        // Fallback regex
        const match = url.match(/[-\w]{25,}/);
        if (match) id = match[0];
    }
    return id;
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

function handleGetUnsubmitted(startDate, endDate, userId, role) {
    const ss = SpreadsheetApp.openById(ID_SPREADSHEET_AKUN);

    // 1. Tentukan Filter Logic untuk Dosen
    let filterLecturerName = null;
    let isSuperAdmin = false;

    if (role === 'lecturer') {
        const cleanUserId = userId ? String(userId).trim() : "";
        if (cleanUserId === "111223344556677888" || cleanUserId === "111222333444") {
            isSuperAdmin = true;
        } else {
            const sheetDosen = ss.getSheetByName(SHEET_DOSEN);
            const dataDosen = sheetDosen.getDataRange().getValues();
            for (let i = 1; i < dataDosen.length; i++) {
                if (String(dataDosen[i][1]).trim() === cleanUserId) {
                    filterLecturerName = dataDosen[i][4]; // Full Name
                    break;
                }
            }
        }
    }

    // 2. Ambil Mahasiswa & Filter jika perlu
    const sheetMhs = ss.getSheetByName(SHEET_MAHASISWA);
    const dataMhs = sheetMhs.getDataRange().getValues();
    const allStudents = [];

    // Persiapkan Token Matcher jika Lecturer & bukan Super Admin
    let lecTokens = [];
    const titleBlacklist = new Set([
        'dr', 'ir', 'prof', 'h', 'hj',
        'sp', 'st', 'se', 'sh', 'skom', 'ss', 'spsi', 'sked', 'spt', 'sn', 'sds', 'sap', 'sos',
        'mp', 'mt', 'mm', 'mh', 'mkom', 'msi', 'mpd', 'mpsi', 'mars', 'magr', 'ms', 'mba',
        'phd', 'agr', 'pt', 'si', 'kep', 'farm', 'pd', 'kom'
    ]);
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');

    if (role === 'lecturer' && !isSuperAdmin && filterLecturerName) {
        const lecClean = normalize(filterLecturerName);
        lecTokens = lecClean.split(/\s+/).filter(w => w.length > 1 && !titleBlacklist.has(w));
    }

    for (let i = 1; i < dataMhs.length; i++) {
        // Filter Supervisor
        if (role === 'lecturer' && !isSuperAdmin) {
            if (!filterLecturerName) continue; // Fail Safe

            const supervisorName = String(dataMhs[i][11]); // Col L
            if (!supervisorName) continue;

            const supClean = normalize(supervisorName);
            const supTokens = new Set(supClean.split(/\s+/));

            let matchCount = 0;
            lecTokens.forEach(token => {
                if (supTokens.has(token)) matchCount++;
            });

            const threshold = lecTokens.length <= 1 ? 0.9 : 0.5;
            const matchRatio = lecTokens.length > 0 ? (matchCount / lecTokens.length) : 0;

            if (matchRatio < threshold) continue; // Skip jika bukan mahasiswa bimbingan
        }

        const nim = String(dataMhs[i][2]).trim();
        if (nim) {
            allStudents.push({
                nim: nim,
                name: dataMhs[i][3],
                class: dataMhs[i][4]
            });
        }
    }

    // -- Generate array of dates to check --
    const targetDates = [];
    const today = new Date();
    // Use local timezone to avoid UTC offset issues
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localToday = new Date(today.getTime() - tzOffset);
    const defaultDateStr = localToday.toISOString().split('T')[0];

    let start = new Date(startDate || defaultDateStr);
    let end = new Date(endDate || startDate || defaultDateStr);

    // Validate dates
    if (isNaN(start.getTime())) start = new Date(defaultDateStr);
    if (isNaN(end.getTime())) end = new Date(defaultDateStr);

    // Swap if start > end
    if (start > end) {
        const temp = start;
        start = end;
        end = temp;
    }

    // Safety limit: Don't allow checking more than 1 year (366 days)
    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > 366) {
        end = new Date(start.getTime() + (366 * 24 * 60 * 60 * 1000));
    }

    let currentDateCheck = new Date(start);
    while (currentDateCheck <= end) {
        targetDates.push(currentDateCheck.toISOString().split('T')[0]);
        currentDateCheck.setDate(currentDateCheck.getDate() + 1);
    }
    const targetDatesSet = new Set(targetDates);

    // 3. Ambil Logbook & Cek Submission
    const sheetLog = ss.getSheetByName(SHEET_LOGBOOK);
    const submittedMap = {}; // nim -> Set of submitted dates

    if (sheetLog) {
        const dataLog = sheetLog.getDataRange().getValues();

        for (let i = 1; i < dataLog.length; i++) {
            const rowDate = formatDate(dataLog[i][4]);
            if (targetDatesSet.has(rowDate)) {
                let nim = String(dataLog[i][3]).trim();
                if (nim.startsWith("'")) nim = nim.substring(1);

                if (!submittedMap[nim]) {
                    submittedMap[nim] = new Set();
                }
                submittedMap[nim].add(rowDate);
            }
        }
    }

    // 4. Filter Unsubmitted: Check if any student is missing ANY date in the range
    const unsubmitted = [];

    for (const student of allStudents) {
        const studentSubmittedDates = submittedMap[student.nim] || new Set();
        const missingDates = [];

        for (const targetDate of targetDates) {
            if (!studentSubmittedDates.has(targetDate)) {
                missingDates.push(targetDate);
            }
        }

        if (missingDates.length > 0) {
            student.missingDates = missingDates; // Add missingDates array to student object
            unsubmitted.push(student);
        }
    }

    // Sort
    unsubmitted.sort((a, b) => {
        if (a.class < b.class) return -1;
        if (a.class > b.class) return 1;
        return a.name.localeCompare(b.name);
    });

    return unsubmitted;
}

function handleUpdateProfile(data) {
    const { role, id, photoBase64, mimeType, link_folder } = data;
    const ss = SpreadsheetApp.openById(ID_SPREADSHEET_AKUN);

    let sheetName = "";
    if (role === 'student') sheetName = SHEET_MAHASISWA;
    else if (role === 'lecturer') sheetName = SHEET_DOSEN;
    else throw new Error("Role tidak valid: " + role);

    const sheet = ss.getSheetByName(sheetName);
    const rows = sheet.getDataRange().getValues();

    // Find Row by ID (Col A -> 0) or Username (Col B -> 1) for robustness
    let rowIndex = -1;
    let roleLinkFolder = null;
    const searchUsername = data.username ? String(data.username).trim() : "";

    for (let i = 1; i < rows.length; i++) {
        const rowId = String(rows[i][0]).trim();
        const rowUserVal = String(rows[i][2]).trim(); // Col C is Username (index 2)

        // Strict check by ID first
        if (rowId === String(id).trim()) {
            // SECONDARY SECURITY: If username is provided in payload, it MUST match the DB.
            // This prevents changing someone else's profile just by guessing their ID.
            if (searchUsername && rowUserVal !== searchUsername) {
                continue;
            }
            rowIndex = i + 1;
            if (role === 'student') roleLinkFolder = rows[i][13];
            break;
        }

        // Fallback: Check by Username (NIP/NIM) if ID didn't match
        if (searchUsername && rowUserVal === searchUsername) {
            rowIndex = i + 1;
            if (role === 'student') roleLinkFolder = rows[i][13];
            break;
        }
    }

    if (rowIndex === -1) throw new Error("User tidak ditemukan.");

    // 1. Handle Photo Upload
    let photoUrl = "";
    if (photoBase64) {
        // Enforce Server Side Link for Student
        let targetFolder = link_folder;
        if (role === 'student') {
            if (roleLinkFolder) {
                targetFolder = roleLinkFolder;
            } else {
                throw new Error("Gagal Upload: Link Folder Mahasiswa tidak ditemukan di Database (Kolom N).");
            }
        }

        // STRICT VALIDATION: If photo is being uploaded, link_folder MUST exist.
        if (!targetFolder || targetFolder.trim() === "") {
            throw new Error("Gagal Upload: Link Folder penyimpanan tidak ditemukan untuk akun ini. Hubungi Admin.");
        }

        // Upload to Drive
        const folderId = getIdFromUrl(targetFolder);
        if (folderId) {
            const folder = DriveApp.getFolderById(folderId);
            const blob = Utilities.newBlob(Utilities.base64Decode(photoBase64), mimeType || "image/png", `Profile_${data.username || id}_${Date.now()}`);
            const file = folder.createFile(blob);
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            // Use LH3 link if possible for direct embed, or normal URL
            const fileUrl = file.getUrl();
            const idMatch = getIdFromUrl(fileUrl);
            photoUrl = idMatch ? "https://lh3.googleusercontent.com/d/" + idMatch : fileUrl;
        } else {
            throw new Error("Gagal Upload: ID Folder tidak valid dari link penyimpanan.");
        }
    } else if (data.photoUrl) {
        // USER CHANGE: Allow manual photo URL (e.g. Drive Link)
        photoUrl = data.photoUrl;
    }

    // 2. Update Columns based on Role
    if (role === 'student') {
        const { name, email, phone, password, bio, internship_place, supervisor_internal } = data;

        // Email (Col B -> 2)
        if (email) sheet.getRange(rowIndex, 2).setValue(email);
        // Name (Col D -> 4)
        if (name) sheet.getRange(rowIndex, 4).setValue(name);
        // Phone (Col G -> 7)
        if (phone) sheet.getRange(rowIndex, 7).setValue(phone);
        // Password (Col H -> 8)
        if (password) sheet.getRange(rowIndex, 8).setValue(password);
        // Photo (Col I -> 9) - User Request Strict
        if (photoUrl) sheet.getRange(rowIndex, 9).setValue(photoUrl);
        // Internship Place (Col J -> 10)
        if (internship_place) sheet.getRange(rowIndex, 10).setValue(internship_place);
        // Supervisor Internal (Col L -> 12)
        if (supervisor_internal) sheet.getRange(rowIndex, 12).setValue(supervisor_internal);
        // Bio (Col O -> 15) - User Request Strict
        if (bio) sheet.getRange(rowIndex, 15).setValue(bio);

    } else if (role === 'lecturer') {
        const { name, email, phone, password, bio } = data;

        // Header Mapping based on User Input (InfoAkunDosen):
        // ... (Index mapping verified)

        if (email) sheet.getRange(rowIndex, 3).setValue(email); // Col C
        if (phone) sheet.getRange(rowIndex, 4).setValue(phone); // Col D
        if (name) sheet.getRange(rowIndex, 5).setValue(name);   // Col E
        if (password) sheet.getRange(rowIndex, 8).setValue(password); // Col H

        if (photoUrl) {
            sheet.getRange(rowIndex, 9).setValue(photoUrl);  // Col I (Strict Header Match)
            sheet.getRange(rowIndex, 10).setValue(photoUrl); // Col J (USER REQUEST OVERRIDE: Bio Uraian gets Photo URL)
        }

        // Only update Bio text if NO photo was uploaded (otherwise Photo URL overwrites it per user request?)
        // Or should we assume Bio field is abandoned? 
        // User said: "link file foto profil terupdate di kolom 'bio_uraian'"
        // If user sends Bio text AND Photo, strict compliance means Photo URL goes to Col J.
        if (bio && !photoUrl) {
            sheet.getRange(rowIndex, 10).setValue(bio);    // Col J
        }
    }

    return { photoUrl };
}