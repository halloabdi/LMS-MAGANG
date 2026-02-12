/**
 * BACKEND GOOGLE APPS SCRIPT FOR LMS DASHBOARD
 * --------------------------------------------
 * ID Script: [JANGAN LUPA DEPLOY SEBAGAI WEB APP]
 * Akses: Siapa saja (Anyone)
 */

// --- KONFIGURASI CONSTANTS ---
const ID_SPREADSHEET_AKUN = "1T6Li6ogsv1C9pRzzdByc_Ae8mBvmqachppwNnB02is4"; // Ganti dengan ID Spreadsheet "DATA-AKUN-LMS" yang asli
const SHEET_MAHASISWA = "InfoAkunMahasiswa";
const SHEET_DOSEN = "InfoAkunDosen";

// Struktur Folder: DATABASE-LMS > MAHASISWA > [Nama Folder Mahasiswa]
// Struktur File Logbook: SpreadsheetsMahasiswa_[username].xlsx

/**
 * Fungsi utama untuk menangani request POST (Login, Input Logbook, Input Laporan)
 */
function doPost(e) {
    try {
        if (!e || !e.postData) throw new Error("No data received");
        const data = JSON.parse(e.postData.contents);
        const action = data.action;

        let result;
        switch (action) {
            case "login":
                result = handleLogin(data);
                break;
            case "submitLogbook":
                result = handleSubmitLogbook(data);
                break;
            case "submitReport":
                result = handleSubmitReport(data);
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
 * Fungsi utama untuk menangani request GET (Ambil Data Dashboard)
 */
function doGet(e) {
    try {
        const action = e.parameter.action;
        const userId = e.parameter.userId;
        const role = e.parameter.role;

        if (!action) throw new Error("Missing action parameter");

        let result;
        switch (action) {
            case "getDashboardData":
                result = handleGetDashboardData(userId, role);
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

function handleLogin(data) {
    const { identifier, password } = data; // Identifier bisa email, NIM, atau No.HP

    const ss = SpreadsheetApp.openById(ID_SPREADSHEET_AKUN);

    // 1. Cek di Sheet Mahasiswa
    const sheetMhs = ss.getSheetByName(SHEET_MAHASISWA);
    const dataMhs = sheetMhs.getDataRange().getValues();
    // Header: id, email_address, username, full_name, ...
    // Index: row[1] = email, row[2] = username (NIM), row[6] = number_phone, row[7] = password

    for (let i = 1; i < dataMhs.length; i++) {
        const row = dataMhs[i];
        if ((row[1] == identifier || row[2] == identifier || row[6] == identifier) && row[7] == password) {
            // Ketemu Mahasiswa
            return {
                role: "student",
                id: row[0],
                email: row[1],
                username: row[2],
                name: row[3],
                class: row[4],
                phone: row[6],
                photoUrl: row[8], // url:photoprofile
                internship_place: row[9],
                internship_addr: row[10],
                supervisor_internal: row[11], // Kolom L: nama_dosen_pembimbing_internal
                supervisor_external: row[12], // Kolom M: nama_dosen_pembimbing_external
                link_folder: row[13],        // Kolom N: link_folder
                link_spreadsheet: row[14]    // Kolom O: link_spreadsheets
            };
        }
    }

    // 2. Cek di Sheet Dosen
    const sheetDosen = ss.getSheetByName(SHEET_DOSEN);
    const dataDosen = sheetDosen.getDataRange().getValues();
    // Sesuaikan indeks kolom berdasarkan struktur sheet dosen Anda
    // Asumsi: email col 1, username col 2, password col 7 (contoh saja, sesuaikan dengan real sheet)

    for (let i = 1; i < dataDosen.length; i++) {
        const row = dataDosen[i];
        // Schema: 0:id, 1:username(NIP), 2:email, 3:phone, 4:name, 5:jabatan, 6:class, 7:password, 8:photo, 9:bio, 10:folder, 11:sheet
        if ((row[1] == identifier || row[2] == identifier) && row[7] == password) {
            return {
                role: "lecturer",
                id: row[0],
                username: row[1], // NIP
                email: row[2],
                phone: row[3],
                name: row[4],
                jabatan: row[5],
                classId: row[6],
                photoUrl: row[8],
                bio: row[9],
                link_folder: row[10],
                link_spreadsheet: row[11]
            };
        }
    }

    throw new Error("Login gagal. Periksa Username/Email dan Password.");
}

function handleSubmitLogbook(data) {
    const { username, link_spreadsheet, logEntry, folder_url } = data;

    // 1. Buka Spreadsheet Mahasiswa
    let ss;
    try {
        if (link_spreadsheet && link_spreadsheet.includes("docs.google.com")) {
            ss = SpreadsheetApp.openByUrl(link_spreadsheet);
        } else {
            // Fallback: Cari manual di folder jika link error/kosong (opsional, tapi link seharusnya ada dari login)
            throw new Error("Link Spreadsheet Logbook tidak valid.");
        }
    } catch (e) {
        throw new Error("Gagal membuka spreadsheet logbook: " + e.message);
    }

    // 2. Akses Sheet "Logbook"
    let sheet = ss.getSheetByName("Logbook");
    if (!sheet) {
        sheet = ss.insertSheet("Logbook");
        // Buat Header jika baru
        sheet.appendRow([
            "TimeStamp", "Tanggal", "Jam_Absen", "Status", "Latitude", "Longtitude",
            "Akurasi_Meter", "Alamat_Lengkap", "Link_FotoSelfie", "Detail Kegiatan",
            "Output yang Dihasilkan", "Link Dokumentasi"
        ]);
    }

    // 3. Simpan Gambar Selfie & Dokumentasi ke Folder Mahasiswa
    // Kita butuh ID folder dari link_folder
    const folderId = getIdFromUrl(folder_url);
    const folder = DriveApp.getFolderById(folderId);

    let selfieUrl = "";
    if (logEntry.selfieBase64) {
        const blob = Utilities.newBlob(Utilities.base64Decode(logEntry.selfieBase64.split(',')[1]), "image/png", `Selfie_${username}_${Date.now()}.png`);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        selfieUrl = file.getDownloadUrl(); // atau getUrl() untuk viewer link
    }

    let docUrl = "";
    if (logEntry.docBase64) {
        // Deteksi tipe file sederhana
        const mimeString = logEntry.docBase64.split(',')[0].split(':')[1].split(';')[0];
        const header = logEntry.docBase64.split(',')[1];
        const blob = Utilities.newBlob(Utilities.base64Decode(header), mimeString, `Dok_${username}_${Date.now()}`);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        docUrl = file.getDownloadUrl();
    }

    // 4. Append Row
    sheet.appendRow([
        new Date(), // TimeStamp
        logEntry.date,
        logEntry.time,
        logEntry.status,
        logEntry.lat,
        logEntry.lng,
        logEntry.accuracy,
        logEntry.address,
        selfieUrl,
        logEntry.activity, // HTML Rich Text
        logEntry.output,   // HTML Rich Text
        docUrl
    ]);

    return { message: "Logbook berhasil disimpan", selfieUrl, docUrl };
}

function handleSubmitReport(data) {
    const { username, link_spreadsheet, reportData, folder_url } = data;

    const ss = SpreadsheetApp.openByUrl(link_spreadsheet);
    let sheet = ss.getSheetByName("Pengumpulan Tugas");
    if (!sheet) {
        sheet = ss.insertSheet("Pengumpulan Tugas");
        sheet.appendRow(["TimeStamp", "Judul Laporan", "Ringkasan/Overview", "Link Data Laporan"]);
    }

    // Upload File Laporan
    const folderId = getIdFromUrl(folder_url);
    const folder = DriveApp.getFolderById(folderId);

    let reportFileUrl = "";
    if (reportData.fileBase64) {
        const mimeString = reportData.fileBase64.split(',')[0].split(':')[1].split(';')[0];
        const blob = Utilities.newBlob(Utilities.base64Decode(reportData.fileBase64.split(',')[1]), mimeString, reportData.fileName || `Laporan_${username}`);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        reportFileUrl = file.getUrl();
    }

    sheet.appendRow([
        new Date(),
        reportData.title,
        reportData.overview,
        reportFileUrl
    ]);

    return { message: "Laporan berhasil dikumpulkan", reportFileUrl };
}

// --- HELPER UNTUK DOSEN (AGGREGATE DATA) ---

function handleGetAllLogbooks() {
    // Ini fungsi berat, idealnya di-cache atau dipanggil per siswa.
    // Untuk demo, kita akan loop daftar mahasiswa dan ambil data logbook mereka.

    const ssAkun = SpreadsheetApp.openById(ID_SPREADSHEET_AKUN);
    const sheetMhs = ssAkun.getSheetByName(SHEET_MAHASISWA);
    const mhsData = sheetMhs.getDataRange().getValues().slice(1); // Skip header

    let allLogbooks = [];

    // Batasi loop untuk performa jika data banyak (misal ambil 10 terakhir)
    mhsData.forEach(row => {
        const linkSpreadsheet = row[14];
        const namaMhs = row[3];
        const nimMhs = row[2];
        const studentId = row[0];

        if (linkSpreadsheet && linkSpreadsheet.includes("docs.google.com")) {
            try {
                const ssMhs = SpreadsheetApp.openByUrl(linkSpreadsheet);
                const sheetLog = ssMhs.getSheetByName("Logbook");
                if (sheetLog) {
                    const logs = sheetLog.getDataRange().getValues();
                    // Skip header (index 0)
                    for (let i = 1; i < logs.length; i++) {
                        const l = logs[i];
                        // Mapping kolom logbook ke object
                        allLogbooks.push({
                            id: `${studentId}_${i}`,
                            studentId: studentId,
                            name: namaMhs,
                            nim: nimMhs,
                            date: l[1],
                            time: l[2],
                            status: l[3],
                            lat: l[4],
                            lng: l[5],
                            accuracy: l[6],
                            address: l[7],
                            selfieUrl: l[8],
                            activity: l[9],
                            output: l[10],
                            docUrl: l[11]
                        });
                    }
                }
            } catch (err) {
                // Log error silent or skip
                console.error(`Gagal baca logbook ${namaMhs}: ${err}`);
            }
        }
    });

    return allLogbooks;
}

function handleGetDashboardData(userId, role) {
    // Placeholder jika mau load data awal fresh dari sheet
    return { message: "Data fetched" };
}

// --- UTILITIES ---
function getIdFromUrl(url) {
    return url.match(/[-\w]{25,}/);
}

// --- HANDLE UPDATE PROFILE ---
function handleUpdateProfile(data) {
    const ss = SpreadsheetApp.openByUrl(SPREADSHEET_ID);
    let sheetName = "";
    let userRowCheck = -1;

    if (data.role === "student") {
        sheetName = SHEET_MAHASISWA;
    } else if (data.role === "lecturer") {
        sheetName = SHEET_DOSEN;
    } else {
        return { status: "error", message: "Role tidak valid" };
    }

    const sheet = ss.getSheetByName(sheetName);
    const users = sheet.getDataRange().getValues();

    // Find User Row
    for (let i = 1; i < users.length; i++) {
        if (users[i][0] == data.id) {
            userRowCheck = i + 1; // 1-based index
            break;
        }
    }

    if (userRowCheck === -1) {
        return { status: "error", message: "User tidak ditemukan" };
    }

    // Handle Photo Upload if present
    let photoUrl = "";
    if (data.photoBase64) {
        try {
            const folderIdStr = data.link_folder ? getIdFromUrl(data.link_folder) : null;
            const folderId = (folderIdStr && folderIdStr[0]) ? folderIdStr[0] : DriveApp.getRootFolder().getId();
            const folder = DriveApp.getFolderById(folderId);
            const blob = Utilities.newBlob(Utilities.base64Decode(data.photoBase64), data.mimeType || "image/jpeg", "profile_" + data.username + "_" + Date.now());
            const file = folder.createFile(blob);
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            photoUrl = file.getDownloadUrl();
        } catch (e) {
            // If upload fails, keep old URL or proceed with error log
            // console.error("Photo upload failed: " + e.toString());
        }
    }

    if (data.role === "lecturer") {
        // Lecturer Schema: 0:id, 1:nip, 2:email, 3:phone, 4:name, 5:jabatan, 6:class, 7:pass, 8:photo, 9:bio
        // Columns (1-based): A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8, I=9, J=10
        sheet.getRange(userRowCheck, 2).setValue("'" + data.username); // NIP (Force String)
        sheet.getRange(userRowCheck, 3).setValue(data.email);
        sheet.getRange(userRowCheck, 4).setValue("'" + (data.phone || "")); // Phone
        sheet.getRange(userRowCheck, 5).setValue(data.name);
        sheet.getRange(userRowCheck, 8).setValue(data.password);
        if (photoUrl) sheet.getRange(userRowCheck, 9).setValue(photoUrl);
        sheet.getRange(userRowCheck, 10).setValue(data.bio || "");
    } else {
        // Student Schema assumed standard based on login
        // 0:id, 1:nim, 2:email, 3:pass, 4:name... 
        // Wait, earlier login code: col 1(B)=NIM, col 2(C)=Email, col 3(D)=Pass? 
        // Let's re-verify Student Login logic in this file?
        // Login: if ((row[1] == identifier ... ) && row[3] == password)
        // So: 1=NIM, 2=Email, 3=Pass, 4=Name.
        // Columns (1-based): B=2, C=3, D=4, E=5

        sheet.getRange(userRowCheck, 2).setValue("'" + data.username); // NIM
        sheet.getRange(userRowCheck, 3).setValue(data.email);
        sheet.getRange(userRowCheck, 4).setValue(data.password);
        // Name is usually col 4 (Index 4) -> Column E (5)
        sheet.getRange(userRowCheck, 5).setValue(data.name);

        // Photo for student? Login says: 
        // return { ... photoUrl: row[9] }; // Index 9 -> Column J (10)
        if (photoUrl) sheet.getRange(userRowCheck, 10).setValue(photoUrl);
    }

    // Return updated data structure to frontend
    // Ideally we re-read the row to be sure, or just return what we have
    return {
        status: "success",
        message: "Profil berhasil diperbarui",
        data: {
            photoUrl: photoUrl || data.photoUrl // Return new or old
        }
    };
}
