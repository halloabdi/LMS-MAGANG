// File ini ditujukan untuk disalin dan dipaste (Copas) ke Google Apps Script (Extensions > Apps Script di Spreadsheet DATABASE-SATUTERNAK Anda).
// Pastikan Anda Deploy as Web App, dengan akses "Anyone" (Siapapun).

const SPREADSHEET_ID = "1gJN7Ej04Cn1IIFXDFISLlAv_cHgrOLqWXl9z7sGoFyg"; // Gunakan ID Spreadsheet Anda

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === "login") {
      return handleLogin(data.emailOrUsername, data.password);
    }

    if (action === "uploadProfilePicture") {
      return handleUpload(data);
    }
    
    if (action === "getRekording") {
      return getSheetData("DataRekording", data.userId, data.role);
    }

    if (action === "getUsaha") {
      return getSheetData("DataUsaha", data.userId, data.role);
    }

    if (action === "addRekording") {
      return addRow("DataRekording", data.payload);
    }

    if (action === "addUsaha") {
      return addRow("DataUsaha", data.payload);
    }

    return respondError("Action not found");

  } catch (error) {
    return respondError(error.toString());
  }
}

function handleLogin(emailOrUsername, password) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("InfoAkun");
  const data = sheet.getDataRange().getValues();

  // Baris pertama adalah Header
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Username di index 1, Email di index 2, Password di index 11
    const username = row[1];
    const email = row[2];
    const pass = row[11];

    if ((username === emailOrUsername || email === emailOrUsername) && pass === password) {
      // Login sukses
      const userObj = {};
      headers.forEach((header, index) => {
        // Jangan kembalikan password
        if (header !== "Password") {
          userObj[header] = row[index];
        }
      });
      return respondSuccess(userObj);
    }
  }

  return respondError("Username/Email atau Password salah");
}

function extractFolderId(url) {
  var match = url.match(/folders\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  match = url.match(/id=([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  return null;
}

function handleUpload(payload) {
  var folderId = extractFolderId(payload.folderUrl);
  if (!folderId) return respondError("URL Folder tidak valid atau tidak mendukung format Google Drive");
  
  var folder;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch(e) {
    return respondError("Folder tidak dapat diakses. Pastikan folder dapat diakses secara publik atau ID valid.");
  }

  var data = Utilities.base64Decode(payload.base64Data);
  var blob = Utilities.newBlob(data, payload.mimeType, payload.fileName);
  
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var fileUrl = file.getUrl();

  // Update URL Foto Profil di InfoAkun
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("InfoAkun");
  var dataSheet = sheet.getDataRange().getValues();
  for (var i = 1; i < dataSheet.length; i++) {
    if (dataSheet[i][0] === payload.userId) {
      sheet.getRange(i + 1, 9).setValue(fileUrl); // Kolom 9 adalah "Foto Profil"
      break;
    }
  }
  
  return respondSuccess({ fileUrl: fileUrl, message: "Foto Profil berhasil diperbarui" });
}

function getSheetData(sheetName, userId, role) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return respondError("Sheet " + sheetName + " tidak ditemukan");
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var result = [];
  
  var idAkunIndex = headers.indexOf("ID Akun");
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    
    // Verifikasi Berlapis Internal: 
    // Apabila role bukan Moderator, dan userId tidak cocok, lompat baris ini (tidak dikirimkan).
    if (role !== "Moderator" && idAkunIndex !== -1) {
      if (row[idAkunIndex] !== userId) {
        continue;
      }
    }
    const obj = {};
    headers.forEach((header, index) => {
      // Handle Date formats
      if (row[index] instanceof Date) {
        obj[header] = row[index].toISOString();
      } else {
        obj[header] = row[index];
      }
    });
    result.push(obj);
  }

  return respondSuccess(result);
}

function addRow(sheetName, payloadArray) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return respondError("Sheet " + sheetName + " tidak ditemukan");

  sheet.appendRow(payloadArray);
  return respondSuccess({ success: true, message: "Data berhasil ditambahkan" });
}

// Handler untuk merespon dengan format JSON
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

// Untuk mengatasi masalah OPTIONS (CORS preflight request yang biasanya terjadi pada fetch)
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
}

// doGet sekadar untuk testing apakah Web App aktif
function doGet(e) {
  return respondSuccess({ message: "SATUTERNAK API is running." });
}