import { CONFIG } from '../config';
import { ExamResult } from '../types';

/**
 * Service untuk komunikasi dengan Google Apps Script Web App & Penyimpanan Lokal
 */

const STORAGE_LOCAL_RESULTS_KEY = 'sd3_local_exam_results_v2';
const STORAGE_CUSTOM_GAS_URL_KEY = 'sd3_custom_gas_url';

export const gasService = {
  /**
   * Mendapatkan URL Google Apps Script yang aktif
   */
  getGasUrl(): string {
    try {
      const custom = localStorage.getItem(STORAGE_CUSTOM_GAS_URL_KEY);
      if (custom && custom.trim().startsWith('http')) {
        // Jika URL tersimpan adalah URL versi lama, perbarui ke URL aktif bawaan
        if (
          custom.includes('AKfycbzBuJrheUE3MRAvNlUEZut3q0LQL5-J62sy8w_rfsBz72VJGt7IHyFPj0WORSB8dUCmeQ') ||
          custom.includes('AKfycbx6Bki20asJdxZX-I6kmXwGIyd6pOApUMTD-92t7rFVdIuYH86ApVatKYEsBbZYttJSng') ||
          custom.includes('AKfycbygzYgt5yGufQXj0Li0QnAiOLNitswNf0TPQnODZtg7HNgbQOdp1pbEmJruuUvPubDGbw')
        ) {
          localStorage.removeItem(STORAGE_CUSTOM_GAS_URL_KEY);
          return CONFIG.GOOGLE_APPS_SCRIPT_URL;
        }
        return custom.trim();
      }
    } catch {
      // ignore
    }
    return CONFIG.GOOGLE_APPS_SCRIPT_URL;
  },

  /**
   * Menyimpan URL Google Apps Script kustom
   */
  setGasUrl(url: string): void {
    try {
      if (!url || !url.trim()) {
        localStorage.removeItem(STORAGE_CUSTOM_GAS_URL_KEY);
      } else {
        localStorage.setItem(STORAGE_CUSTOM_GAS_URL_KEY, url.trim());
      }
    } catch (e) {
      console.warn('Gagal menyimpan URL GAS kustom ke localStorage:', e);
    }
  },

  /**
   * Mengembalikan URL ke default
   */
  resetGasUrl(): void {
    try {
      localStorage.removeItem(STORAGE_CUSTOM_GAS_URL_KEY);
    } catch {
      // ignore
    }
  },

  /**
   * Mengambil hasil tes yang tersimpan di perangkat lokal
   * (Murni kosong saat baru, dan otomatis membersihkan data uji coba/dummy lama)
   */
  getLocalExamResults(): ExamResult[] {
    try {
      const saved = localStorage.getItem(STORAGE_LOCAL_RESULTS_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Bersihkan data dummy/simulasi lama (id berawalan 'res-default-') jika masih tersimpan di cache peramban
          const cleaned = parsed.filter(
            (item: any) => !String(item?.id || '').startsWith('res-default-')
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(STORAGE_LOCAL_RESULTS_KEY, JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca data hasil tes lokal:', e);
    }

    // Default murni kosong (bersih untuk publikasi produksi)
    return [];
  },


  /**
   * Menyimpan hasil tes ke penyimpanan lokal (Zero Data Loss)
   */
  saveLocalExamResult(result: ExamResult): void {
    try {
      const current = this.getLocalExamResults();
      // Periksa apakah sudah ada (hindari duplikasi berdasarkan nama & timestamp)
      const existingIdx = current.findIndex(
        (item) =>
          item.id === result.id ||
          (item.nama.toLowerCase() === result.nama.toLowerCase() &&
            item.timestamp === result.timestamp)
      );

      if (existingIdx >= 0) {
        current[existingIdx] = result;
      } else {
        current.unshift(result);
      }

      localStorage.setItem(STORAGE_LOCAL_RESULTS_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('Gagal menyimpan hasil tes ke localStorage:', e);
    }
  },

  /**
   * Menghapus hasil tes dari penyimpanan lokal
   */
  deleteLocalExamResult(idOrTimestamp: string, nama?: string): void {
    try {
      const current = this.getLocalExamResults();
      const filtered = current.filter(
        (r) =>
          r.id !== idOrTimestamp &&
          r.timestamp !== idOrTimestamp &&
          !(nama && r.nama.toLowerCase() === nama.toLowerCase())
      );
      localStorage.setItem(STORAGE_LOCAL_RESULTS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Gagal menghapus data hasil tes lokal:', e);
    }
  },

  /**
   * Menguji koneksi ke URL Google Apps Script
   */
  async testGasConnection(
    customUrl?: string
  ): Promise<{ success: boolean; message: string; rowCount?: number }> {
    const url = (customUrl || this.getGasUrl()).trim();
    if (!url || !url.startsWith('http')) {
      return { success: false, message: 'URL Google Apps Script tidak valid.' };
    }

    try {
      const testUrl = `${url}${url.includes('?') ? '&' : '?'}action=read&t=${Date.now()}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(testUrl, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            message:
              'Server merespons HTTP 404 (Not Found). Pastikan Web App sudah di-Deploy dengan jenis "Web App" dan akses "Anyone" (Siapa saja).',
          };
        }
        return {
          success: false,
          message: `Server merespons status HTTP ${response.status}`,
        };
      }

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        return {
          success: true,
          message: 'Terhubung ke server Google Apps Script (Respons non-JSON).',
          rowCount: 0,
        };
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.rows)
        ? data.rows
        : [];

      return {
        success: true,
        message: `Koneksi berhasil! Terhubung ke Google Spreadsheet (${list.length} baris data ditemukan).`,
        rowCount: list.length,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return {
          success: false,
          message: 'Koneksi waktu habis (Timeout 8 detik). Server Google Apps Script lambat merespons.',
        };
      }
      return {
        success: false,
        message:
          err.message ||
          'Gagal terhubung ke Google Apps Script. Periksa koneksi internet atau hak akses Web App.',
      };
    }
  },

  /**
   * Mengirim hasil tes siswa ke Google Apps Script Web App & Penyimpanan Lokal
   */
  async submitExamResult(
    result: ExamResult
  ): Promise<{ success: boolean; message: string; savedLocally: boolean }> {
    // 1. Selalu amankan penyimpanan ke perangkat lokal terlebih dahulu (Zero Data Loss)
    this.saveLocalExamResult(result);

    const url = this.getGasUrl();
    if (!url || !url.startsWith('http')) {
      return {
        success: true,
        savedLocally: true,
        message: 'Hasil tes berhasil disimpan di perangkat ini.',
      };
    }

    const payload = {
      action: 'submit',
      id: result.id || `res-${Date.now()}`,
      timestamp: result.timestamp || new Date().toLocaleString('id-ID'),
      // Format bahasa Indonesia (sesuai template sheet)
      nama: result.nama,
      kelas: result.kelas || CONFIG.KELAS,
      noAbsen: result.noAbsen,
      tglLahir: result.tglLahir || '',
      benar: result.benar,
      salah: result.salah,
      nilai: result.nilai,
      status: result.status,
      mataPelajaran: CONFIG.MATA_PELAJARAN,
      sekolah: CONFIG.SEKOLAH,
      // Format camelCase alternatif (kompatibilitas menyeluruh)
      studentName: result.nama,
      className: result.kelas || CONFIG.KELAS,
      absenNumber: result.noAbsen,
      birthDate: result.tglLahir || '',
      correctCount: result.benar,
      incorrectCount: result.salah,
      totalQuestions: (result.benar || 0) + (result.salah || 0),
      finalScore: result.nilai,
      answers: result.detailJawaban || {},
      // Parameter Keamanan & Anti-Cheat
      violationsCount: result.violationsCount || 0,
      pelanggaran: result.violationsCount || 0,
      violationLogs: result.violationLogs || [],
      submissionReason: result.submissionReason || 'normal',
      terminationNote: result.terminationNote || '',
    };

    try {
      // Mengirim sebagai text/plain untuk mencegah browser memicu CORS preflight OPTIONS
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn(`GAS POST merespons HTTP ${response.status}`);
        return {
          success: true,
          savedLocally: true,
          message: `Hasil tes tersimpan di perangkat ini. (Cloud respons HTTP ${response.status})`,
        };
      }

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: true };
      }

      return {
        success: true,
        savedLocally: true,
        message: data.message || 'Jawaban dan hasil tes berhasil disimpan ke Google Spreadsheet.',
      };
    } catch (err: any) {
      console.warn('Gagal sinkronisasi langsung ke Google Apps Script (tersimpan lokal):', err);
      return {
        success: true,
        savedLocally: true,
        message: 'Hasil tes tersimpan di perangkat ini. (Sinkronisasi cloud tertunda)',
      };
    }
  },

  /**
   * Mengambil rekap hasil ujian dari Google Apps Script Web App dan/atau Penyimpanan Lokal
   */
  async fetchExamResults(): Promise<ExamResult[]> {
    const localResults = this.getLocalExamResults();
    const url = this.getGasUrl();

    if (!url || !url.startsWith('http')) {
      return localResults;
    }

    try {
      const readUrl = `${url}${url.includes('?') ? '&' : '?'}action=read&t=${Date.now()}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      // Gunakan Simple GET tanpa custom Accept header agar tidak ditolak CORS saat 302 redirect
      const response = await fetch(readUrl, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Google Apps Script merespons HTTP ${response.status}, menggunakan data lokal.`);
        return localResults;
      }

      const raw = await response.json();
      let list: any[] = [];

      if (Array.isArray(raw)) {
        list = raw;
      } else if (raw && Array.isArray(raw.data)) {
        list = raw.data;
      } else if (raw && raw.status === 'success' && Array.isArray(raw.rows)) {
        list = raw.rows;
      }

      // Standarisasi pemetaan atribut
      const remoteResults: ExamResult[] = list
        .filter((item: any) => {
          const name = item.Nama || item.nama || item.studentName || item['Nama Siswa'];
          return name && String(name).trim().length > 0;
        })
        .map((item: any, idx: number) => {
          const timestamp =
            item.Timestamp || item.timestamp || item.waktu || new Date().toLocaleString('id-ID');
          const nama =
            item.studentName || item.Nama || item.nama || item['Nama Siswa'] || 'Siswa';
          const kelas = item.className || item.Kelas || item.kelas || CONFIG.KELAS;
          const noAbsen = String(
            item.absenNumber || item['Nomor Absen'] || item.noAbsen || item.NoAbsen || '-'
          );
          const benar = Number(item.correctCount ?? item.Benar ?? item.benar ?? 0);
          const salah = Number(item.incorrectCount ?? item.Salah ?? item.salah ?? 0);
          const nilai = Number(item.finalScore ?? item.Nilai ?? item.nilai ?? 0);
          const status = item.status || (nilai >= CONFIG.KKTP ? 'Lulus' : 'Belum Lulus');
          const tglLahir = item.birthDate || item['Tanggal Lahir'] || item.tglLahir || '';

          return {
            id: item.id || `gas-${idx}-${timestamp}`,
            timestamp,
            nama,
            kelas,
            noAbsen,
            tglLahir,
            benar,
            salah,
            nilai,
            status: status === 'Lulus' ? 'Lulus' : 'Belum Lulus',
            mataPelajaran: item['Mata Pelajaran'] || item.mataPelajaran || item.subject || item._sheetSource || CONFIG.MATA_PELAJARAN,
            violationsCount: Number(item.violationsCount ?? item.pelanggaran ?? item['Pelanggaran'] ?? 0),
            violationLogs: Array.isArray(item.violationLogs) ? item.violationLogs : [],
            submissionReason: item.submissionReason || (Number(item.violationsCount || item.pelanggaran || 0) >= 3 ? 'violation_limit' : 'normal'),
            terminationNote: item.terminationNote || item['Catatan Keamanan'] || item.catatan || '',
          };
        });

      // Gabungkan data remote dengan data lokal yang belum ada di remote
      const combined = [...remoteResults];
      localResults.forEach((loc) => {
        const alreadyInRemote = combined.some(
          (rem) =>
            rem.nama.trim().toLowerCase() === loc.nama.trim().toLowerCase() &&
            rem.noAbsen === loc.noAbsen &&
            (rem.mataPelajaran === loc.mataPelajaran || !loc.mataPelajaran)
        );
        if (!alreadyInRemote) {
          combined.push(loc);
        }
      });

      return combined;
    } catch (err: any) {
      console.warn('Error saat fetch dari Google Apps Script, menampilkan data lokal:', err);
      return localResults;
    }
  },

  /**
   * Menghapus data dari Google Spreadsheet via GAS dan Penyimpanan Lokal
   */
  async deleteExamResult(timestamp: string, nama: string, mataPelajaran?: string): Promise<boolean> {
    // 1. Hapus dari penyimpanan lokal terlebih dahulu
    this.deleteLocalExamResult(timestamp, nama);

    const url = this.getGasUrl();
    if (!url || !url.startsWith('http')) return true;

    const payload = {
      action: 'delete',
      timestamp,
      nama,
      studentName: nama,
      mataPelajaran: mataPelajaran || CONFIG.MATA_PELAJARAN,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (err: any) {
      console.warn('Gagal menghapus di remote GAS (namun sudah terhapus di lokal):', err);
      return true;
    }
  },

  /**
   * Mengosongkan data di penyimpanan lokal perangkat
   */
  clearAllLocalExamResults(): void {
    try {
      localStorage.setItem(STORAGE_LOCAL_RESULTS_KEY, JSON.stringify([]));
    } catch (e) {
      console.warn('Gagal mengosongkan data lokal:', e);
    }
  },

  /**
   * Menghapus SEMUA hasil tes siswa (di penyimpanan lokal dan di remote Google Spreadsheet jika terhubung)
   */
  async clearAllExamResults(mataPelajaran?: string, allSheets: boolean = false): Promise<{ success: boolean; clearedRemote: boolean; message: string }> {
    // 1. Kosongkan penyimpanan lokal segera
    this.clearAllLocalExamResults();

    const url = this.getGasUrl();
    if (!url || !url.startsWith('http')) {
      return {
        success: true,
        clearedRemote: false,
        message: 'Seluruh data nilai di penyimpanan lokal perangkat berhasil dibersihkan.',
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ 
          action: 'clearAll', 
          mataPelajaran: mataPelajaran || CONFIG.MATA_PELAJARAN,
          allSheets: allSheets 
        }),
      });

      if (response.ok) {
        return {
          success: true,
          clearedRemote: true,
          message: 'Seluruh data nilai di Google Spreadsheet dan perangkat lokal berhasil dihapus.',
        };
      } else {
        return {
          success: true,
          clearedRemote: false,
          message: 'Data nilai lokal berhasil dibersihkan. Server Spreadsheet merespons dengan kendala.',
        };
      }
    } catch (err: any) {
      console.warn('Gagal menghapus di remote Google Apps Script secara massal:', err);
      return {
        success: true,
        clearedRemote: false,
        message: 'Data lokal berhasil dihapus. Google Spreadsheet tidak dapat diakses saat ini (koneksi offline/URL tidak valid).',
      };
    }
  },

  /**
   * Sinkronisasi seluruh data lokal yang belum masuk ke Google Apps Script
   */
  async syncAllLocalToCloud(): Promise<{ total: number; success: number }> {
    const local = this.getLocalExamResults();
    if (local.length === 0) return { total: 0, success: 0 };

    let successCount = 0;
    for (const item of local) {
      try {
        const res = await this.submitExamResult(item);
        if (res.success) successCount++;
      } catch {
        // ignore
      }
    }
    return { total: local.length, success: successCount };
  },
};

/**
 * Template Skrip Google Apps Script untuk Google Spreadsheet
 * MENDUKUNG 1 SPREADSHEET UNTUK BERBAGAI MAPEL & BANYAK APLIKASI WEB
 */
export const GAS_SCRIPT_TEMPLATE = `/**
 * SKRIP GOOGLE APPS SCRIPT UNTUK REKAP MULTI-MAPEL & MULTI-APLIKASI
 * DALAM 1 FILE GOOGLE SPREADSHEET (SEKOLAH DASAR - JEMBRANA)
 *
 * FITUR UNGGULAN:
 * 1. Mendukung berbagai Mata Pelajaran (Matematika, IPAS, Bahasa Indonesia, Pendidikan Pancasila, dll.)
 * 2. Mendukung banyak Aplikasi Web yang mengarah ke 1 URL Spreadsheet yang sama.
 * 3. AUTO TAB-ROUTING: Data otomatis masuk ke Tab Sheet sesuai nama Mapel.
 * 4. AUTO-CREATE TAB: Jika Tab Sheet mapel belum ada, skrip OTOMATIS membuatkan Tab baru
 *    lengkap dengan Baris Header berwarna biru profesional dan Freeze Baris 1!
 * 5. Fitur Read Fleksibel: Bisa membaca satu mapel tertentu atau membaca seluruh tab mapel.
 *
 * PANDUAN PEMASANGAN (HANYA 2 MENIT):
 * 1. Buat Spreadsheet baru di https://sheets.new
 * 2. Beri nama file: "Rekap Nilai Siswa - Seluruh Mata Pelajaran"
 * 3. Buka menu "Ekstensi" (Extensions) -> "Apps Script"
 * 4. Hapus semua kode bawaan, lalu tempel SELURUH KODE di bawah ini
 * 5. Klik ikon Simpan (Save)
 * 6. Klik tombol biru "Terapkan" (Deploy) -> "Penerapan Baru" (New Deployment)
 * 7. Pilih jenis: "Aplikasi Web" (Web App)
 * 8. PENGATURAN WAJIB:
 *    - Jalankan sebagai (Execute as): "Saya" (Me)
 *    - Siapa yang memiliki akses (Who has access): "Siapa saja" (Anyone) -> WAJIB!
 * 9. Klik "Terapkan", berikan Otorisasi Akun Google Anda
 * 10. Salin URL Aplikasi Web (berakhiran /exec) dan pasang di aplikasi web Anda.
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var targetSheetName = (e && e.parameter && (e.parameter.mataPelajaran || e.parameter.sheet)) 
      ? String(e.parameter.mataPelajaran || e.parameter.sheet).trim() 
      : "";
    
    var sheetsToRead = [];
    if (targetSheetName && targetSheetName.toUpperCase() !== "ALL") {
      var s = ss.getSheetByName(targetSheetName);
      if (s) {
        sheetsToRead.push(s);
      } else {
        // Coba cari case-insensitive
        var all = ss.getSheets();
        for (var m = 0; m < all.length; m++) {
          if (all[m].getName().toUpperCase() === targetSheetName.toUpperCase()) {
            sheetsToRead.push(all[m]);
            break;
          }
        }
        if (sheetsToRead.length === 0) {
          sheetsToRead.push(ss.getActiveSheet());
        }
      }
    } else {
      // Baca semua tab sheet yang ada dalam spreadsheet
      sheetsToRead = ss.getSheets();
    }
    
    var allResults = [];
    for (var k = 0; k < sheetsToRead.length; k++) {
      var currentSheet = sheetsToRead[k];
      var sheetName = currentSheet.getName();
      var data = currentSheet.getDataRange().getValues();
      if (data.length <= 1) continue;
      
      var headers = data[0];
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        // Lewati baris kosong
        if (!row[1] && !row[0]) continue;
        
        var item = { _sheetSource: sheetName };
        for (var j = 0; j < headers.length; j++) {
          var headerKey = String(headers[j]).trim();
          item[headerKey] = row[j];
        }
        // Pastikan kolom Mata Pelajaran terisi nama sheet jika kosong
        if (!item["Mata Pelajaran"] && !item["mataPelajaran"]) {
          item["Mata Pelajaran"] = sheetName;
        }
        allResults.push(item);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: allResults }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : "{}";
    var contents = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Tentukan Nama Tab Sheet Berdasarkan Mata Pelajaran
    var rawSubject = contents.mataPelajaran || contents.subject || "MATEMATIKA";
    var sheetName = String(rawSubject).trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    if (!sheetName) sheetName = "MATEMATIKA";
    
    var sheet = ss.getSheetByName(sheetName);
    
    // 2. OTOMATIS BUAT TAB SHEET BARU JIKA BELUM TERSEDIA
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      var headerRow = [
        "Timestamp",
        "Nama",
        "Kelas",
        "Nomor Absen",
        "Tanggal Lahir",
        "Benar",
        "Salah",
        "Nilai",
        "Status",
        "Mata Pelajaran",
        "Sekolah"
      ];
      sheet.appendRow(headerRow);
      
      // Berikan style header profesional (Biru Royal, Teks Putih Tebal, Rata Tengah)
      var headerRange = sheet.getRange(1, 1, 1, headerRow.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#1d4ed8");
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    // 3. Fitur Delete Baris Siswa Satuan
    if (contents.action === "delete") {
      var data = sheet.getDataRange().getValues();
      var targetTimestamp = String(contents.timestamp || "").trim();
      var targetNama = String(contents.nama || contents.studentName || "").trim().toLowerCase();
      
      for (var i = data.length - 1; i >= 1; i--) {
        var rowTime = String(data[i][0]).trim();
        var rowName = String(data[i][1]).trim().toLowerCase();
        if ((targetTimestamp && rowTime === targetTimestamp) || (targetNama && rowName === targetNama)) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ 
            success: true, 
            message: "Data siswa berhasil dihapus dari tab [" + sheetName + "]" 
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Data tidak ditemukan di tab " + sheetName }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 4. Fitur Hapus Seluruh Data Siswa (Mempertahankan Baris Header Kolom ke-1)
    if (contents.action === "clearAll" || contents.action === "deleteAll") {
      if (contents.allSheets === true) {
        // Bersihkan semua tab sheet
        var allSheets = ss.getSheets();
        for (var sIdx = 0; sIdx < allSheets.length; sIdx++) {
          var s = allSheets[sIdx];
          var lRow = s.getLastRow();
          if (lRow > 1) {
            s.deleteRows(2, lRow - 1);
          }
        }
        return ContentService.createTextOutput(JSON.stringify({ 
          success: true, 
          message: "Seluruh data siswa di SEMUA tab mata pelajaran berhasil dihapus (Header tetap tersimpan)." 
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        // Bersihkan hanya di tab sheet mapel ini
        var lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          sheet.deleteRows(2, lastRow - 1);
        }
        return ContentService.createTextOutput(JSON.stringify({ 
          success: true, 
          message: "Seluruh data siswa pada tab [" + sheetName + "] berhasil dihapus (Header tetap tersimpan)." 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // 5. Simpan Hasil Tes Siswa (Append Row ke Tab Mapel)
    var timestamp = contents.timestamp || Utilities.formatDate(new Date(), "GMT+8", "dd/MM/yyyy HH:mm:ss");
    var nama = contents.studentName || contents.nama || "";
    var kelas = contents.className || contents.kelas || "VI";
    var noAbsen = contents.absenNumber || contents.noAbsen || "";
    var tglLahir = contents.birthDate || contents.tglLahir || "";
    var benar = contents.correctCount !== undefined ? contents.correctCount : (contents.benar || 0);
    var salah = contents.incorrectCount !== undefined ? contents.incorrectCount : (contents.salah || 0);
    var nilai = contents.finalScore !== undefined ? contents.finalScore : (contents.nilai || 0);
    var status = contents.status || (nilai >= 70 ? "Lulus" : "Belum Lulus");
    var mapel = contents.mataPelajaran || rawSubject;
    var sekolah = contents.sekolah || "SEKOLAH DASAR";
    
    sheet.appendRow([
      timestamp,
      nama,
      kelas,
      noAbsen,
      tglLahir,
      benar,
      salah,
      nilai,
      status,
      mapel,
      sekolah
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Hasil tes siswa berhasil disimpan ke tab [" + sheetName + "] di Google Spreadsheet!"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

