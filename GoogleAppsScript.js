// File ini ditujukan untuk disalin dan dipaste (Copas) ke Google Apps Script (Extensions > Apps Script di Spreadsheet DATABASE-SATUTERNAK Anda).
// Pastikan Anda Deploy as Web App, dengan akses "Anyone" (Siapapun) / Siapa saja.

const SPREADSHEET_ID = "1gJN7Ej04Cn1IIFXDFISLlAv_cHgrOLqWXl9z7sGoFyg"; // Gunakan ID Spreadsheet Anda

function doPost(e) {
  try {
    // Jalankan pengecekan tabel otomatis
    initializeMissingSheets();

    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === "login") return handleLogin(data.emailOrUsername, data.password);
    if (action === "uploadProfilePicture") return handleUpload(data);

    // CRUD DATA
    if (action === "getRekording") return getSheetData("DataRekording", data.userId, data.role);
    if (action === "getUsaha") return getSheetData("DataUsaha", data.userId, data.role);
    if (action === "getIPTernak") return getSheetData("SimpanIPTernak", data.userId, data.role);
    if (action === "addRekording") return addRow("DataRekording", data.payload);
    if (action === "addUsaha") return addRow("DataUsaha", data.payload);
    if (action === "addIPTernak") return addRow("SimpanIPTernak", data.payload);

    // KELOLA ANGGOTA
    if (action === "getUsers") return getUsers(data.userId, data.role);
    if (action === "updateUser") return updateUser(data.callerRole, data.userId, data.oldId, data.payload);

    // BERITA TINGKAT LANJUT
    if (action === "getBerita") return getSheetData("BeritaTerkini", null, "Moderator"); 
    if (action === "addBerita") {
      let finalUrl = data.explicitUrl;
      
      if (data.fileToUpload) {
        var matchId = null;
        if (data.payload.folderUrl) {
          var m = data.payload.folderUrl.match(/folders\/([a-zA-Z0-9-_]+)/);
          if (m) matchId = m[1];
          else {
            m = data.payload.folderUrl.match(/id=([a-zA-Z0-9-_]+)/);
            if (m) matchId = m[1];
          }
        }
        if (!matchId) return respondError("URL Folder Anda di Kolom M tidak sah.");
        
        var folder = DriveApp.getFolderById(matchId);
        
        // PEMBERSIHAN BASE64 UNTUK BERITA
        var cleanBase64Berita = data.fileToUpload.base64Data;
        if (cleanBase64Berita.indexOf("base64,") !== -1) {
          cleanBase64Berita = cleanBase64Berita.split("base64,")[1];
        }

        var b64 = Utilities.base64Decode(cleanBase64Berita);
        var blob = Utilities.newBlob(b64, data.fileToUpload.mimeType, data.fileToUpload.fileName);
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        finalUrl = file.getUrl();
      }
      
      return addRow("BeritaTerkini", [
        data.payload.idBerita, data.payload.kategori, data.payload.judul, 
        finalUrl, data.payload.penulis, data.payload.konten, 
        data.payload.pin, new Date().toISOString()
      ]);
    }
    if (action === "deleteBerita") return deleteRow("BeritaTerkini", "ID Berita", data.idBerita);

    // NOTIFIKASI
    if (action === "getNotifikasi") return getSheetData("Notifikasi", data.userId, data.role);
    if (action === "addNotifikasi") return addRow("Notifikasi", data.payload);

    return respondError("Action not found: " + action);

  } catch (error) {
    return respondError(error.toString());
  }
}

// ============================================
// AUTO-INITIALIZE SHEETS
// ============================================
function initializeMissingSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. Notifikasi
  if (!ss.getSheetByName("Notifikasi")) {
    const notifSheet = ss.insertSheet("Notifikasi");
    notifSheet.appendRow(["ID Notifikasi", "Kategori", "Penerima (ID Akun/Semua)", "Penulis", "Judul", "Pesan", "Tanggal"]);
    // Freeze header
    notifSheet.setFrozenRows(1);
    notifSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#f3f4f6");
  }

  // 2. Berita Terkini
  if (!ss.getSheetByName("BeritaTerkini")) {
    const beritaSheet = ss.insertSheet("BeritaTerkini");
    beritaSheet.appendRow(["ID Berita", "Kategori", "Judul", "Thumbnail URL", "Penulis", "Konten", "isPinned", "Waktu Publish"]);
    beritaSheet.setFrozenRows(1);
    beritaSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#f3f4f6");

    // Auto-populate 3 berita default agar tak kosong
    const now = new Date().toISOString();
    const defaultNews = [
      ["BRT-01", "Peternakan, Ekonomi", "Tengkulak Sapi Menangis Darah!", "https://i.ibb.co.com/27YG689r/Gemini-Generated-Image-4kz96f4kz96f4kz9.jpg", "Moderator Abdi", "Era penindasan harga oleh tengkulak di pedesaan kini resmi berakhir dengan kehancuran total. Peternak kecil tidak lagi perlu merasa takut dan pasrah saat menjual hewan peliharaan mereka ke pasar berkat SATUTERNAK.", "Ya", now],
      ["BRT-02", "Pendidikan, Peternakan", "Peternak Sepuh Tak Lagi Gaptek!", "https://i.ibb.co.com/LX4xHYdP/Gemini-Generated-Image-d5037nd5037nd503.jpg", "Moderator Abdi", "Siapa sangka kakek-kakek di pelosok desa saat ini sangat mahir mengoperasikan layar sentuh ponsel mereka? Pandangan meremehkan terhadap kemampuan peternak lanjut usia kini berhasil dipatahkan dengan SATUTERNAK.", "Ya", now],
      ["BRT-03", "Ekonomi", "Rahasia Cuan Peternak Tiba-tiba Meroket", "https://i.ibb.co.com/xK9QQph2/Gemini-Generated-Image-z2khmmz2khmmz2kh.jpg", "Moderator Abdi", "Platform SATUTERNAK adalah satu-satunya kunci utama yang membuka gerbang kekayaan bagi para pengrajin daging di pedesaan. Aplikasi kebanggaan ini dengan jujur membongkar kenyataan pahit mengenai biaya siluman.", "Tidak", now]
    ];
    defaultNews.forEach(row => beritaSheet.appendRow(row));
  }

  // 3. Simpan IP Ternak
  if (!ss.getSheetByName("SimpanIPTernak")) {
    const ipSheet = ss.insertSheet("SimpanIPTernak");
    ipSheet.appendRow(["ID Akun", "Username", "Nama Lengkap", "Role", "Waktu Kalkulasi", "Jenis Ternak", "Nilai IP", "Rating", "Populasi Awal", "Populasi Akhir", "Lama Pemeliharaan", "Analisis Tambahan"]);
    ipSheet.setFrozenRows(1);
    ipSheet.getRange("A1:L1").setFontWeight("bold").setBackground("#dcfce3");
  }
}

// ============================================
// HANDLER LOGIN & AKUN
// ============================================
function handleLogin(emailOrUsername, password) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("InfoAkun");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const username = row[1];
    const email = row[2];
    const pass = row[11]; // Password

    if ((username === emailOrUsername || email === emailOrUsername) && pass === password) {
      const userObj = {};
      headers.forEach((header, index) => {
        // Jangan ekspos password ke localstorage
        if (header !== "Password") {
          userObj[header] = row[index];
        }
      });
      return respondSuccess(userObj);
    }
  }
  return respondError("Username/Email atau Password salah");
}

function getUsers(callerUserId, callerRole) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("InfoAkun");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const result = [];

  const idAkunIndex = headers.indexOf("ID Akun");

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Jika regular, dia cuma boleh narik datanya dia (untuk profil pribadi)
    if (callerRole !== "Moderator" && idAkunIndex !== -1) {
      if (row[idAkunIndex] !== callerUserId) continue;
    }
    const obj = {};
    headers.forEach((header, index) => {
      // Jika yang request bukan moderator dan baris ini BUKAN dirinya sndiri, 
      // JANGAN PERNAH berikan password orang lain!
      if (header === "Password" && callerRole !== "Moderator" && row[idAkunIndex] !== callerUserId) {
        obj[header] = "***";
      } else {
        obj[header] = row[index];
      }
    });
    result.push(obj);
  }
  return respondSuccess(result);
}

// --- CASCADING ID UPDATE LOGIC ---
function updateUser(callerRole, callerUserId, targetOldId, payloadObj) {
  // Hanya Moderator atau Pengguna Asli Pemilik Data yang boleh update
  if (callerRole !== "Moderator" && callerUserId !== targetOldId) {
    return respondError("Akses Ditolak: Anda tidak berhak mengubah akun ini.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("InfoAkun");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idAkunIndex = headers.indexOf("ID Akun");

  let userRowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idAkunIndex] === targetOldId) {
      userRowIndex = i + 1; // 1-based index di Spreadsheet
      break;
    }
  }

  if (userRowIndex === -1) return respondError("Akun tidak ditemukan untuk diperbarui.");

  // Timpa nilai berdasarkan Key di Payload
  // Payload contoh: {'Nama Lengkap': 'Baru', 'ID Akun': 'ID_BARU'}
  // Password juga bisa diupdate lewat sinj
  Object.keys(payloadObj).forEach(key => {
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1) {
      sheet.getRange(userRowIndex, colIndex + 1).setValue(payloadObj[key]);
    }
  });

  // Jika ID Akun bergeser, jalankan CASCADING / PENULARAN PERUBAHAN ke seluruh Sheet Record
  const newId = payloadObj["ID Akun"];
  if (newId && newId !== targetOldId) {
    cascadeUpdateId("DataRekording", targetOldId, newId);
    cascadeUpdateId("DataUsaha", targetOldId, newId);
    cascadeUpdateId("Notifikasi", targetOldId, newId);
  }

  return respondSuccess({ success: true, message: "Profil dan Relasi " + targetOldId + " berhasil diperbarui!" });
}

function cascadeUpdateId(sheetName, oldId, newId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let idIndex = headers.indexOf("ID Akun");
  if (idIndex === -1) idIndex = headers.indexOf("Penerima (ID Akun/Semua)"); // Untuk notifikasi
  if (idIndex === -1) return; // Abaikan jika sheet tak punya ID relasi

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === oldId) {
      sheet.getRange(i + 1, idIndex + 1).setValue(newId);
    }
  }
}

// ============================================
// WAKTU PERTAMA KALI: JALANKAN FUNGSI INI DARI EDITOR UNTUK MEMAKSA MUNCULNYA IZIN!
// ============================================
function JALANKAN_UNTUK_MENGELUARKAN_IZIN_GO_UNSAFE() {
  // HARUS MENGGUNAKAN CREATEFILE! JANGAN diganti ke getRootFolder.
  // Google butuh melihat perintah createFile ini secara eksplisit untuk membuka pintu masuk (Write Access).
  var dummy = DriveApp.createFile("Pancingan_Izin_Upload.txt", "Jika file ini muncul, izin Upload berhasil 100%");
  dummy.setTrashed(true);
  var checkSheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return "BERHASIL! Google Script kini mendapat Izin Penuh (Write Access) untuk Upload Foto ke Google Drive.";
}

// ============================================
// UPLOAD HANDLER
// ============================================
function extractFolderId(url) {
  if (!url || url === "-") return null;
  var match = url.match(/folders\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  match = url.match(/id=([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  return null;
}

function handleUpload(payload) {
  var folderId = extractFolderId(payload.folderUrl);
  if (!folderId) return respondError("GAGAL_URL_FOLDER: Link Folder Penyimpanan Anda pada Kolom M tidak sah.");

  var folder;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (e) {
    return respondError("AKSES_DITOLAK_DRIVE: Skrip gagal mengakses Folder. Pastikan izin akses Drive sudah Anyone with link.");
  }

  // PEMBERSIHAN BASE64 SEBELUM DECODE
  var cleanBase64 = payload.base64Data;
  if (cleanBase64.indexOf("base64,") !== -1) {
    cleanBase64 = cleanBase64.split("base64,")[1];
  }

  var data = Utilities.base64Decode(cleanBase64);
  var blob = Utilities.newBlob(data, payload.mimeType, payload.fileName);

  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var fileUrl = file.getUrl();

  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("InfoAkun");
  var dataSheet = sheet.getDataRange().getValues();
  
  for (var i = 1; i < dataSheet.length; i++) {
    // GANTI KE == AGAR TOLERAN TERHADAP STRING VS NUMBER
    if (dataSheet[i][0] == payload.userId) { 
      sheet.getRange(i + 1, 9).setValue(fileUrl); // Sukses masuk ke Kolom I
      break;
    }
  }

  return respondSuccess({ fileUrl: fileUrl, message: "Foto berhasil diupload!" });
}

// ============================================
// DATA GENERIC (GET, ADD, DELETE)
// ============================================
function getSheetData(sheetName, userId, role) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return respondError("Sheet " + sheetName + " tidak ditemukan");

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return respondSuccess([]); // Kosong 

  var headers = data[0];
  var result = [];

  // Deteksi di mana ID Relasi Akun disimpan pada Header Name
  var idAkunIndex = headers.indexOf("ID Akun");
  if (idAkunIndex === -1) idAkunIndex = headers.indexOf("Penerima (ID Akun/Semua)"); // Untuk Notifikasi

  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    // Fitur Notifikasi: Tampilkan pesan khusus ke pengguna atau "Semua" (Broadcast Global)
    if (sheetName === "Notifikasi" && role !== "Moderator") {
      const receiver = row[idAkunIndex];
      if (receiver !== "Semua" && receiver !== userId) {
        continue;
      }
    } else {
      // LAYER VERIFIKASI BIASA (Untuk DataUsaha & DataRekording)
      if (role !== "Moderator" && idAkunIndex !== -1) {
        if (row[idAkunIndex] !== userId) {
          continue;
        }
      }
    }

    const obj = {};
    headers.forEach((header, index) => {
      // JSON Serialization untuk Tanggal
      if (row[index] instanceof Date) {
        obj[header] = row[index].toISOString();
      } else {
        obj[header] = row[index];
      }
    });

    // Abaikan baris tak bertuan
    if (Object.values(obj).join('').trim() === '') continue;

    result.push(obj);
  }

  return respondSuccess(result);
}

function addRow(sheetName, payloadArrayOrObj) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return respondError("Sheet " + sheetName + " tidak ditemukan");

  if (!Array.isArray(payloadArrayOrObj) && typeof payloadArrayOrObj === 'object') {
    let headers = sheet.getDataRange().getValues()[0] || [];

    // Auto-tambah kolom baru di Spreadsheet jika Payload memiliki Key yang belum ada di Header
    let headersAdded = false;
    Object.keys(payloadArrayOrObj).forEach(key => {
      if (!headers.includes(key)) {
        headers.push(key);
        sheet.getRange(1, headers.length).setValue(key);
        sheet.getRange(1, headers.length).setFontWeight("bold").setBackground("#e0f2fe");
        headersAdded = true;
      }
    });

    const row = new Array(headers.length).fill("");
    headers.forEach((header, i) => {
      if (payloadArrayOrObj[header] !== undefined) {
        row[i] = payloadArrayOrObj[header];
      }
    });
    sheet.appendRow(row);
  } else {
    sheet.appendRow(payloadArrayOrObj);
  }
  return respondSuccess({ success: true, message: "Berhasil menambahkan item baru!" });
}

function deleteRow(sheetName, matchColumnName, matchValue) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return respondError("Sheet " + sheetName + " tidak ditemukan");

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const colIndex = headers.indexOf(matchColumnName);

  if (colIndex === -1) return respondError("Kolom acuan hapus tidak ditemukan.");

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][colIndex] == matchValue) { // Gunakan '==' agar ID numerik dan string match
      sheet.deleteRow(i + 1);
      return respondSuccess({ success: true, message: "Data baris ke-" + (i + 1) + " terhapus!" });
    }
  }

  return respondError("Baris target tidak ditemukan.");
}

// ============================================
// CORE JSON HELPER
// ============================================
function respondSuccess(data) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    data: data
  })).setMimeType(ContentService.MimeType.JSON);
}

function respondError(message) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "error",
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return respondSuccess({ message: "SATUTERNAK Modern API V2 is Running. (Auto Data-Cascade Enabled)" });
}