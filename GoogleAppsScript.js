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

    if (action === "getRekording") {
      return getSheetData("DataRekording");
    }

    if (action === "getUsaha") {
      return getSheetData("DataUsaha");
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

function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return respondError("Sheet " + sheetName + " tidak ditemukan");

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const result = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
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