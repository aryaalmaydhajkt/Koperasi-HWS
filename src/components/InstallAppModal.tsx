import React, { useState } from 'react';
import { 
  Smartphone, 
  Laptop, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Monitor, 
  Share2, 
  ShieldCheck, 
  Zap, 
  WifiOff,
  ChevronRight,
  Info,
  Package,
  FolderDown
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { HwsLogo } from './HwsLogo';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isDesktop, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'ANDROID' | 'LAPTOP' | 'ZIP' | 'IOS'>(
    isAndroid ? 'ANDROID' : isDesktop ? 'LAPTOP' : isIOS ? 'IOS' : 'ANDROID'
  );
  const [copied, setCopied] = useState(false);
  const [copiedZip, setCopiedZip] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://koperasi-hws.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeInstall = async () => {
    setIsInstalling(true);
    try {
      const res = await install();
      if (res) {
        // Installed successfully
      }
    } finally {
      setIsInstalling(false);
    }
  };

  // Generate desktop launcher file (.url for Windows or .html launcher for all OS)
  const handleDownloadDesktopLauncher = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Koperasi HWS - Launcher</title>
  <meta http-equiv="refresh" content="0; url=${currentUrl}">
  <script>
    window.location.href = "${currentUrl}";
  </script>
</head>
<body style="background:#0f172a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;">
    <h2>Membuka Aplikasi Koperasi HWS...</h2>
    <p>Jika tidak terbuka otomatis, <a href="${currentUrl}" style="color:#38bdf8;">klik di sini</a>.</p>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Koperasi-HWS-Aplikasi-Laptop.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-b border-slate-800 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-800/90 rounded-2xl border border-slate-700 shadow-md">
              <HwsLogo size={48} className="w-12 h-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Resmi PWA Ready
                </span>
                {isInstalled && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Sudah Terpasang
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Pasang Aplikasi Koperasi HWS
              </h2>
              <p className="text-sm text-slate-400">
                Gunakan sebagai aplikasi mandiri di HP Android & Komputer / Laptop Anda
              </p>
            </div>
          </div>

          {/* Quick 1-Click Install Banner if browser supports beforeinstallprompt */}
          {isInstallable && !isInstalled && (
            <div className="mt-4 p-3.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs sm:text-sm text-emerald-200">
                  <span className="font-semibold text-white">Browser Anda Mendukung 1-Klik Pasang!</span>
                  <p className="text-emerald-300/80 text-xs">Klik tombol pasang untuk langsung menginstal ke perangkat ini.</p>
                </div>
              </div>
              <button
                onClick={handleNativeInstall}
                disabled={isInstalling}
                className="shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                {isInstalling ? 'Memasang...' : 'Pasang Sekarang'}
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('ANDROID')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              activeTab === 'ANDROID'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Aplikasi Android</span>
            {isAndroid && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          </button>

          <button
            onClick={() => setActiveTab('LAPTOP')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              activeTab === 'LAPTOP'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Aplikasi Laptop / PC</span>
            {isDesktop && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          </button>

          <button
            onClick={() => setActiveTab('ZIP')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              activeTab === 'ZIP'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Paket File .ZIP</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 font-mono">
              285KB
            </span>
          </button>

          <button
            onClick={() => setActiveTab('IOS')}
            className={`py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition ${
              activeTab === 'IOS'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>iPhone</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* ANDROID TAB */}
          {activeTab === 'ANDROID' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200">
                <Smartphone className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white text-sm sm:text-base">
                    Pengalaman Aplikasi Android Asli (WebAPK / PWA)
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-300/80 mt-1">
                    Aplikasi Koperasi HWS berjalan mandiri di layar penuh HP Android Anda, lengkap dengan ikon di Menu Aplikasi, notifikasi, dan performa cepat hemat memori.
                  </p>
                </div>
              </div>

              {/* Direct Install Button if available */}
              {isInstallable && (
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h5 className="font-medium text-white text-sm">Instalasi Otomatis (1-Klik)</h5>
                    <p className="text-xs text-slate-400 mt-0.5">Sistem mendeteksi HP Android mendukung pemasangan langsung.</p>
                  </div>
                  <button
                    onClick={handleNativeInstall}
                    disabled={isInstalling}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {isInstalling ? 'Memproses...' : 'Pasang ke HP Android'}
                  </button>
                </div>
              )}

              {/* Step-by-Step Android Guide */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Panduan Pasang di HP Android (Google Chrome & Samsung Internet):
                </h4>
                <div className="grid gap-2.5">
                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-800 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div className="text-xs sm:text-sm text-slate-300">
                      Buka aplikasi <strong>Google Chrome</strong> atau <strong>Samsung Internet</strong> di HP Android Anda.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-800 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div className="text-xs sm:text-sm text-slate-300">
                      Ketuk menu <strong>Titik Tiga (⋮)</strong> di pojok kanan atas browser.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-800 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div className="text-xs sm:text-sm text-slate-300">
                      Pilih menu <strong className="text-emerald-400">"Instal Aplikasi"</strong> atau <strong className="text-emerald-400">"Tambahkan ke Layar Utama" (Add to Home screen)</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-800 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                      4
                    </span>
                    <div className="text-xs sm:text-sm text-slate-300">
                      Klik <strong>"Instal"</strong>. Ikon <strong>Koperasi HWS</strong> akan langsung terpasang di Home Screen dan Daftar Aplikasi HP Anda!
                    </div>
                  </div>
                </div>
              </div>

              {/* Link Sharing / QR Action */}
              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left w-full">
                  <div className="text-xs font-semibold text-slate-300">Link Akses Aplikasi Koperasi HWS:</div>
                  <div className="text-xs text-slate-400 font-mono truncate mt-0.5">{currentUrl}</div>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="w-full sm:w-auto shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Tersalin!' : 'Salin Link'}
                </button>
              </div>
            </div>
          )}

          {/* LAPTOP / PC TAB */}
          {activeTab === 'LAPTOP' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-200">
                <Laptop className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white text-sm sm:text-base">
                    Aplikasi Desktop untuk Windows, MacOS & Linux
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-300/80 mt-1">
                    Jalankan Koperasi HWS seperti software desktop profesional. Membuka di jendela tersendiri tanpa tab browser, muncul di Taskbar & Start Menu, dan loading instan.
                  </p>
                </div>
              </div>

              {/* Direct Install Button if available on Desktop */}
              {isInstallable && (
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h5 className="font-medium text-white text-sm">Pasang Langsung ke Komputer / Laptop</h5>
                    <p className="text-xs text-slate-400 mt-0.5">Chrome/Edge mendeteksi aplikasi siap diinstal ke Desktop.</p>
                  </div>
                  <button
                    onClick={handleNativeInstall}
                    disabled={isInstalling}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {isInstalling ? 'Memproses...' : 'Pasang di Laptop Sekarang'}
                  </button>
                </div>
              )}

              {/* Step-by-Step Desktop Guide */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cara Pasang di Laptop (Google Chrome, Microsoft Edge, Brave, Opera):
                </h4>
                <div className="grid gap-2.5">
                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-800 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div className="text-xs sm:text-sm text-slate-300">
                      Lihat ke pojok kanan <strong>Address Bar</strong> (bilah alamat browser Anda).
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-800 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div className="text-xs sm:text-sm text-slate-300">
                      Klik ikon <strong>Komputer dengan tanda panah ke bawah (📥)</strong> atau ikon <strong>"Instal Koperasi HWS"</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-800 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div className="text-xs sm:text-sm text-slate-300">
                      Klik <strong>"Instal"</strong>. Aplikasi langsung terbuka di jendela mandiri dan pintasan dibuat di <strong>Desktop & Start Menu Windows / Launchpad Mac</strong>.
                    </div>
                  </div>
                </div>
              </div>

              {/* Option to download full ZIP package */}
              <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm">Download Paket Lengkap Aplikasi (.ZIP)</h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ingin menyimpan seluruh program di flashdisk atau laptop lain? Unduh arsip .ZIP lengkap berisi source code dan peluncur otomatis Windows/Mac/Linux.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="/api/download-zip"
                    download="koperasi-hws-aplikasi-lengkap.zip"
                    className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File .ZIP Sekarang (285 KB)</span>
                  </a>
                  <button
                    onClick={() => setActiveTab('ZIP')}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
                  >
                    Lihat Isi Paket & Petunjuk
                  </button>
                </div>
              </div>

              {/* Quick Offline Launcher File Generator */}
              <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-white text-sm">Unduh File Pintasan Desktop (.html Launcher)</h5>
                    <p className="text-xs text-slate-400">
                      Simpan file ini di Desktop Laptop Anda untuk membuka Koperasi HWS kapan saja dengan sekali klik ganda.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadDesktopLauncher}
                  className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 border border-slate-600"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  Unduh File Pintasan Desktop Koperasi HWS
                </button>
              </div>
            </div>
          )}

          {/* ZIP ARCHIVE TAB */}
          {activeTab === 'ZIP' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                      <FolderDown className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ARSIP RESMI
                        </span>
                        <span className="text-xs text-slate-400 font-mono">koperasi-hws-aplikasi-lengkap.zip</span>
                      </div>
                      <h3 className="font-bold text-white text-base sm:text-lg mt-0.5">
                        Paket Master Aplikasi Koperasi HWS (.ZIP)
                      </h3>
                      <p className="text-xs text-slate-300">
                        File arsip lengkap siap pakai untuk dijalankan secara offline atau disalin ke komputer / laptop lain.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/30">
                      ~285 KB (Ringan)
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <a
                    href="/api/download-zip"
                    download="koperasi-hws-aplikasi-lengkap.zip"
                    className="flex-1 py-3 px-5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download File .ZIP Sekarang</span>
                  </a>
                  <button
                    onClick={() => {
                      const zipUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/download-zip`;
                      navigator.clipboard.writeText(zipUrl);
                      setCopiedZip(true);
                      setTimeout(() => setCopiedZip(false), 2500);
                    }}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {copiedZip ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedZip ? 'Link Tersalin!' : 'Salin Tautan Unduh'}</span>
                  </button>
                </div>
              </div>

              {/* What is inside the zip */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Package className="w-4 h-4" /> Isi Paket Dalam File .ZIP:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Jalankan-Aplikasi-Windows.bat</span>
                      <p className="text-[11px] text-slate-400">Skrip peluncur otomatis 1-klik untuk PC & Laptop Windows.</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">jalankan-aplikasi-mac-linux.sh</span>
                      <p className="text-[11px] text-slate-400">Skrip terminal peluncur otomatis untuk MacOS dan Linux.</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Seluruh Kode Sumber Lengkap (src/)</span>
                      <p className="text-[11px] text-slate-400">React 19, TypeScript, Tailwind CSS, State Store, dan UI.</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Buku Panduan README.md</span>
                      <p className="text-[11px] text-slate-400">Petunjuk instalasi, akun login demo, dan panduan fitur.</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Mesin Cetak PDF & KTA Digital</span>
                      <p className="text-[11px] text-slate-400">Template cetak buku mutasi kas, KTA digital, dan surat resmi.</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Aset Ikon & PWA Manifest</span>
                      <p className="text-[11px] text-slate-400">Logo SVG resmi, icon Android (192/512px), dan apple-touch-icon.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Step Tutorial */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Cara Menjalankan Setelah Diekstrak di Laptop:
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div className="text-xs sm:text-sm text-slate-300">
                      <strong>Ekstrak file ZIP</strong> ke folder yang diinginkan (misal di folder Dokumen atau Desktop laptop Anda).
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div className="text-xs sm:text-sm text-slate-300">
                      Pastikan laptop Anda sudah memiliki <strong>Node.js</strong> (bisa diunduh gratis di <span className="text-amber-400 font-mono">nodejs.org</span> jika belum ada).
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div className="text-xs sm:text-sm text-slate-300">
                      Klik 2x file <strong>Jalankan-Aplikasi-Windows.bat</strong> (untuk Windows) atau jalankan <span className="font-mono text-amber-300">./jalankan-aplikasi-mac-linux.sh</span>. Server otomatis berjalan dan membuka browser di <span className="text-emerald-400 font-mono">http://localhost:3000</span>!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IOS TAB */}
          {activeTab === 'IOS' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-200">
                <Info className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white text-sm sm:text-base">
                    Pemasangan di iPhone & iPad (Safari)
                  </h4>
                  <p className="text-xs sm:text-sm text-purple-300/80 mt-1">
                    iOS mendukung pemasangan PWA langsung melalui browser Safari dengan fitur Add to Home Screen.
                  </p>
                </div>
              </div>

              <div className="grid gap-2.5">
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-800 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="text-xs sm:text-sm text-slate-300">
                    Buka link aplikasi di browser <strong>Safari</strong> pada iPhone/iPad Anda.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-800 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="text-xs sm:text-sm text-slate-300">
                    Ketuk tombol <strong>Bagikan / Share (<Share2 className="w-3.5 h-3.5 inline mx-1" />)</strong> di bilah menu bawah Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-800 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="text-xs sm:text-sm text-slate-300">
                    Gulir ke bawah dan pilih menu <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-800/50 border border-slate-800 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div className="text-xs sm:text-sm text-slate-300">
                    Ketuk <strong>"Tambah" (Add)</strong> di pojok kanan atas. Ikon Koperasi HWS siap digunakan!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Benefits Grid */}
          <div className="pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Keunggulan Aplikasi Koperasi HWS (PWA):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium">Buka Cepat & Tanpa Menunggu</span>
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium">Aman & Terenkripsi Resmi</span>
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center gap-2.5">
                <WifiOff className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium">Cache Offline Data Ringan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Koperasi HWS v2.4 • Progressive Web App
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
