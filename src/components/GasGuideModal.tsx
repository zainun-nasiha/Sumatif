import React, { useState } from 'react';
import { GAS_SCRIPT_TEMPLATE } from '../services/gasService';
import { CONFIG } from '../config';
import {
  X,
  Copy,
  Check,
  Code2,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Sparkles,
  BookOpen,
  Share2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface GasGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasGuideModal: React.FC<GasGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'arsitektur' | 'panduan'>('arsitektur');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(GAS_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Integrasi 1 Spreadsheet untuk Banyak Mapel &amp; Aplikasi
              </h3>
              <p className="text-xs text-slate-500">
                Arsitektur cerdas Google Apps Script untuk merekap nilai berbagai mata pelajaran
              </p>
            </div>
          </div>
          <button
            id="btn-close-gas-guide"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigasi Modal */}
        <div className="flex border-b border-slate-200 pt-3 gap-4 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('arsitektur')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'arsitektur'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Arsitektur &amp; Jawaban (Bisa Banget!)</span>
          </button>

          <button
            onClick={() => setActiveTab('panduan')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'panduan'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Panduan Pasang &amp; Skrip Lengkap</span>
          </button>
        </div>

        {/* Konten Scrollable */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-slate-700 pr-1 flex-1">
          {activeTab === 'arsitektur' && (
            <div className="space-y-4">
              {/* Highlight Utama */}
              <div className="p-4 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-950">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-900 mb-1">
                      JAWABAN: BISA BANGET, SANGAT PRAKTIS &amp; 100% GRATIS!
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Satu file Google Spreadsheet dapat menampung hasil ujian dari <strong>berbagai mata pelajaran</strong> (Matematika, IPAS, Bahasa Indonesia, Pendidikan Pancasila, dll.) dan dari <strong>banyak aplikasi web sekaligus</strong> menggunakan <strong>satu URL Google Apps Script yang sama</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagram Visual Alur Kerja */}
              <div className="p-4 rounded-xl bg-slate-900 text-white shadow-inner">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Diagram Alur Sistem 1 Spreadsheet Terpusat:</span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs items-center">
                  {/* Kolom 1: Banyak Aplikasi Web */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Aplikasi Web Mapel</div>
                    <div className="p-2.5 bg-blue-950/80 rounded-lg border border-blue-500/30 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span>Web Tes <strong>Matematika</strong></span>
                    </div>
                    <div className="p-2.5 bg-emerald-950/80 rounded-lg border border-emerald-500/30 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Web Tes <strong>IPAS</strong></span>
                    </div>
                    <div className="p-2.5 bg-purple-950/80 rounded-lg border border-purple-500/30 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      <span>Web Tes <strong>B. Indonesia</strong></span>
                    </div>
                    <div className="p-2.5 bg-amber-950/80 rounded-lg border border-amber-500/30 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>Web Tes <strong>PPKn / Lainnya</strong></span>
                    </div>
                  </div>

                  {/* Kolom 2: 1 Endpoint Google Apps Script */}
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-slate-200 text-xs">1 URL Web App GAS</div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      Menerima data nilai dan mendeteksi nama <code>mataPelajaran</code> secara otomatis
                    </div>
                  </div>

                  {/* Kolom 3: 1 Google Spreadsheet Multi-Tab */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">1 File Spreadsheet</div>
                    <div className="p-2.5 bg-slate-800/90 rounded-lg border border-blue-500/40 text-blue-300 font-mono text-[11px]">
                      📑 Tab Sheet: [MATEMATIKA]
                    </div>
                    <div className="p-2.5 bg-slate-800/90 rounded-lg border border-emerald-500/40 text-emerald-300 font-mono text-[11px]">
                      📑 Tab Sheet: [IPAS]
                    </div>
                    <div className="p-2.5 bg-slate-800/90 rounded-lg border border-purple-500/40 text-purple-300 font-mono text-[11px]">
                      📑 Tab Sheet: [BAHASA_INDONESIA]
                    </div>
                    <div className="p-2.5 bg-slate-800/90 rounded-lg border border-teal-500/40 text-teal-300 font-mono text-[11px]">
                      📑 Tab Sheet: [REKAP_GABUNGAN]
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Keunggulan Utama Fitur Baru Ini */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                  <div className="font-bold text-blue-900 text-xs mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Auto-Create Tab Sheet</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Guru tidak perlu membuat tab manual! Jika aplikasi mengirim data mapel baru (cth: "IPAS"), Google Apps Script akan <strong>otomatis membuatkan Tab "IPAS" lengkap dengan baris Header berformat rapi</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                  <div className="font-bold text-purple-900 text-xs mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>Data Tidak Tertukar</span>
                  </div>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    Setiap mapel memiliki lembar terpisah, sehingga nilai Matematika, IPAS, dan Bahasa Indonesia tetap terorganisir rapi per lembar kerja di spreadsheet Anda.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="font-bold text-emerald-900 text-xs mb-1 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Rapor Nilai Terpadu</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Karena berada di 1 file spreadsheet yang sama, guru dapat menggunakan rumus <code>=VLOOKUP()</code> atau <code>=QUERY()</code> untuk membuat lembar Rapor Kumulatif Semester secara instan.
                  </p>
                </div>
              </div>

              {/* Cara Menghubungkan Banyak Web App */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Bagaimana Cara Menghubungkan Aplikasi Web Lainnya?</span>
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cukup salin <strong>URL Google Apps Script (berakhiran /exec)</strong> yang sama, lalu tempelkan ke konfigurasi aplikasi web Anda yang lain. Pada saat aplikasi mengirimkan data nilai siswa, pastikan menambahkan nama mata pelajaran di payload:
                </p>
                <div className="p-2.5 bg-slate-900 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre">
{`// Contoh pada aplikasi web IPAS:
const payload = {
  nama: "I Putu Arya",
  kelas: "VI",
  noAbsen: "01",
  benar: 28,
  salah: 2,
  nilai: 93,
  status: "Lulus",
  mataPelajaran: "IPAS" // <-- Skrip otomatis memasukkan ke tab sheet "IPAS"
};`}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'panduan' && (
            <div className="space-y-4">
              {/* Info URL Aktif */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                <span className="font-bold block mb-1">URL Endpoint Google Apps Script Terpasang:</span>
                <code className="font-mono text-[11px] break-all bg-white px-2 py-1 rounded border border-blue-200 block text-blue-800">
                  {CONFIG.GOOGLE_APPS_SCRIPT_URL}
                </code>
              </div>

              {/* Langkah demi langkah */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Langkah Konfigurasi di Google Spreadsheet (Hanya 2 Menit):
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed text-slate-600">
                  <li>
                    Buka <strong className="text-slate-800">Google Spreadsheet</strong> baru di{' '}
                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline font-semibold"
                    >
                      sheets.new
                    </a>
                    .
                  </li>
                  <li>
                    Beri nama file Spreadsheet Anda, misalnya: <em>"Rekap Nilai Siswa - Seluruh Mata Pelajaran"</em>.
                  </li>
                  <li>
                    Klik menu <strong className="text-slate-800">Ekstensi (Extensions)</strong> &gt;{' '}
                    <strong className="text-slate-800">Apps Script</strong>.
                  </li>
                  <li>
                    Hapus seluruh kode default yang ada di editor Apps Script, lalu salin dan tempel <strong>SELURUH KODE</strong> di bawah ini.
                  </li>
                  <li>
                    Klik ikon <strong className="text-slate-800">Simpan (Save)</strong>.
                  </li>
                  <li>
                    Klik tombol biru <strong className="text-slate-800">Terapkan (Deploy)</strong> &gt;{' '}
                    <strong className="text-slate-800">Penerapan baru (New Deployment)</strong>.
                  </li>
                  <li>
                    Pilih jenis <strong className="text-slate-800">Aplikasi Web (Web App)</strong>.
                  </li>
                  <li>
                    <strong className="text-rose-600 font-bold">PENGATURAN WAJIB:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-slate-700">
                      <li>Jalankan sebagai (Execute as): <strong>Saya (Me)</strong></li>
                      <li>Siapa yang memiliki akses (Who has access): <strong className="text-blue-700">Siapa saja (Anyone)</strong> (agar browser siswa dapat mengirim data tanpa login Google)</li>
                    </ul>
                  </li>
                  <li>
                    Klik <strong className="text-slate-800">Terapkan</strong>, setujui izin akses Google Anda, lalu salin URL Web App yang berakhiran <code>/exec</code>.
                  </li>
                </ol>
              </div>

              {/* Box Kode Skrip */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    Kode Skrip Google Apps Script Multi-Mapel Terbaru:
                  </span>
                  <button
                    id="btn-copy-gas-script"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Skrip'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-60 leading-normal border border-slate-800">
                  {GAS_SCRIPT_TEMPLATE}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center shrink-0">
          <div className="text-[11px] text-slate-500">
            Dapat digunakan untuk UN, PAS, PTS, dan Asesmen Sumatif Kurikulum Merdeka.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
