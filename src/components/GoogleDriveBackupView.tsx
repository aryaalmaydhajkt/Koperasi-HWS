import React, { useState, useEffect } from 'react';
import { 
  googleSignIn, 
  logoutGoogle, 
  initAuth, 
  getAccessToken,
  listDriveBackupFiles, 
  uploadFileToDrive, 
  deleteDriveFile, 
  downloadDriveFileContent,
  DriveFileItem 
} from '../services/googleDriveService';
import { User } from 'firebase/auth';
import { appStore } from '../data/store';
import { AdminUser } from '../types';
import { 
  Cloud, 
  HardDrive, 
  UploadCloud, 
  Trash2, 
  RotateCcw, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Database, 
  Clock, 
  ShieldCheck, 
  LogOut,
  FolderOpen
} from 'lucide-react';

interface GoogleDriveBackupViewProps {
  currentAdmin: AdminUser;
}

export const GoogleDriveBackupView: React.FC<GoogleDriveBackupViewProps> = ({ currentAdmin }) => {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Modal for Destructive Operations (MANDATORY per Google Workspace Skill)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [fileToRestore, setFileToRestore] = useState<DriveFileItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        loadFiles(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
        setFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  const loadFiles = async (token?: string) => {
    const tokenToUse = token || accessToken;
    if (!tokenToUse) return;

    setIsLoadingFiles(true);
    try {
      const driveFiles = await listDriveBackupFiles(tokenToUse);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Error fetching Drive files:', err);
      showStatus('error', err.message || 'Gagal memuat file dari Google Drive');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        showStatus('success', `Berhasil terhubung dengan Google Drive (${res.user.email})`);
        await loadFiles(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      showStatus('error', err.message || 'Gagal login ke akun Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutGoogle();
      setGoogleUser(null);
      setAccessToken(null);
      setFiles([]);
      showStatus('success', 'Akun Google Drive berhasil diputuskan');
    } catch (err: any) {
      showStatus('error', 'Gagal logout akun Google');
    }
  };

  // 1. Backup Full App Database to Google Drive
  const handleBackupDatabase = async () => {
    if (!accessToken) {
      showStatus('error', 'Silakan hubungkan akun Google Drive terlebih dahulu');
      return;
    }

    setIsUploading(true);
    try {
      const state = appStore.getState();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `Koperasi_HWS_Full_Backup_${timestamp}.json`;
      
      const payload = {
        exportedAt: new Date().toISOString(),
        exportedBy: currentAdmin.nama,
        adminRole: currentAdmin.role,
        koperasiName: state.koperasiProfile.namaKoperasi,
        databaseVersion: 'V7_FIREBASE_DRIVE',
        appState: state,
      };

      await uploadFileToDrive(accessToken, fileName, JSON.stringify(payload, null, 2), 'application/json');
      showStatus('success', `Database berhasil dicadangkan ke Google Drive: ${fileName}`);
      appStore.logActivity(currentAdmin.nama, 'DRIVE_BACKUP', `Mencadangkan database ke Google Drive: ${fileName}`);
      await loadFiles();
    } catch (err: any) {
      showStatus('error', err.message || 'Gagal mengunggah cadangan ke Google Drive');
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Backup Member Roster
  const handleBackupMembers = async () => {
    if (!accessToken) return;

    setIsUploading(true);
    try {
      const state = appStore.getState();
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `Daftar_Anggota_HWS_${timestamp}.json`;

      const payload = {
        exportedAt: new Date().toISOString(),
        exportedBy: currentAdmin.nama,
        totalAnggota: state.members.length,
        members: state.members,
      };

      await uploadFileToDrive(accessToken, fileName, JSON.stringify(payload, null, 2), 'application/json');
      showStatus('success', `Data anggota berhasil dicadangkan ke Google Drive: ${fileName}`);
      await loadFiles();
    } catch (err: any) {
      showStatus('error', err.message || 'Gagal mencadangkan data anggota ke Drive');
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Backup Kas Ledger
  const handleBackupKas = async () => {
    if (!accessToken) return;

    setIsUploading(true);
    try {
      const state = appStore.getState();
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `Buku_Kas_HWS_${timestamp}.json`;

      const payload = {
        exportedAt: new Date().toISOString(),
        exportedBy: currentAdmin.nama,
        totalEntri: state.kasEntries.length,
        kasEntries: state.kasEntries,
      };

      await uploadFileToDrive(accessToken, fileName, JSON.stringify(payload, null, 2), 'application/json');
      showStatus('success', `Buku kas berhasil dicadangkan ke Google Drive: ${fileName}`);
      await loadFiles();
    } catch (err: any) {
      showStatus('error', err.message || 'Gagal mencadangkan buku kas ke Drive');
    } finally {
      setIsUploading(false);
    }
  };

  // Execute Confirmed Delete (MANDATORY Confirmation requirement)
  const confirmDeleteFile = async () => {
    if (!fileToDelete || !accessToken) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      showStatus('success', `File "${fileToDelete.name}" berhasil dihapus dari Google Drive.`);
      appStore.logActivity(currentAdmin.nama, 'DRIVE_DELETE', `Menghapus file cadangan Drive: ${fileToDelete.name}`);
      setFileToDelete(null);
      await loadFiles();
    } catch (err: any) {
      showStatus('error', err.message || 'Gagal menghapus file dari Google Drive');
    } finally {
      setIsDeleting(false);
    }
  };

  // Execute Confirmed Restore (MANDATORY Confirmation requirement)
  const confirmRestoreFile = async () => {
    if (!fileToRestore || !accessToken) return;
    setIsRestoring(true);
    try {
      const content = await downloadDriveFileContent(accessToken, fileToRestore.id);
      const parsed = JSON.parse(content);

      if (parsed.appState) {
        // Restore full database state
        const state = appStore.getState();
        if (Array.isArray(parsed.appState.members)) state.members = parsed.appState.members;
        if (Array.isArray(parsed.appState.transactions)) state.transactions = parsed.appState.transactions;
        if (Array.isArray(parsed.appState.kasEntries)) state.kasEntries = parsed.appState.kasEntries;
        if (Array.isArray(parsed.appState.admins)) state.admins = parsed.appState.admins;
        if (parsed.appState.koperasiProfile) state.koperasiProfile = parsed.appState.koperasiProfile;
        
        appStore.recalculateKasBalances();
        appStore.triggerGoogleCloudSync();
        showStatus('success', `Database berhasil dipulihkan dari cadangan "${fileToRestore.name}".`);
        appStore.logActivity(currentAdmin.nama, 'DRIVE_RESTORE', `Memulihkan database dari Google Drive: ${fileToRestore.name}`);
      } else if (Array.isArray(parsed.members)) {
        const state = appStore.getState();
        state.members = parsed.members;
        appStore.triggerGoogleCloudSync();
        showStatus('success', `Daftar anggota berhasil dipulihkan dari "${fileToRestore.name}".`);
      } else {
        throw new Error('Format file cadangan tidak dikenali.');
      }
      setFileToRestore(null);
    } catch (err: any) {
      showStatus('error', err.message || 'Gagal memulihkan data dari file Google Drive');
    } finally {
      setIsRestoring(false);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '-';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '-';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-400" />
            Integrasi Google Drive Cloud Backup
          </h3>
          <p className="text-xs text-slate-400">
            Penyimpanan cadangan resmi database, laporan, dan dokumen Koperasi HWS ke akun Google Drive
          </p>
        </div>

        {googleUser && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadFiles()}
              disabled={isLoadingFiles}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              Segarkan
            </button>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Putuskan Akun
            </button>
          </div>
        )}
      </div>

      {/* Alert Notification */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Connection State Panel */}
      {!googleUser ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <HardDrive className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-bold text-white text-sm">Hubungkan Akun Google Drive</h4>
            <p className="text-xs text-slate-400">
              Masuk dengan akun Google Anda untuk mengaktifkan sinkronisasi otomatis, pencadangan database snapshot, dan penyimpanan laporan resmi koperasi ke Google Drive secara aman.
            </p>
          </div>

          {/* Official Google Sign-In Button */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="bg-white hover:bg-slate-100 text-slate-800 font-semibold px-5 py-2.5 rounded-xl shadow-lg border border-slate-300 transition-all flex items-center gap-3 text-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            Folder cadangan khusus <span className="font-mono text-cyan-400 font-bold">Koperasi HWS Cloud Backups</span> akan otomatis dibuat di Google Drive Anda.
          </p>
        </div>
      ) : (
        /* Connected State */
        <div className="space-y-6">
          {/* User Account Info Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {googleUser.photoURL ? (
                <img
                  src={googleUser.photoURL}
                  alt={googleUser.displayName || 'Google User'}
                  className="w-10 h-10 rounded-full border border-slate-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400">
                  {googleUser.displayName?.charAt(0) || 'G'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{googleUser.displayName || 'Pengguna Google'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Terhubung
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">{googleUser.email}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-end">
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                Folder: <span className="font-semibold text-white">Koperasi HWS Cloud Backups</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Pencadangan diisolasi di folder khusus Google Drive
              </div>
            </div>
          </div>

          {/* Quick Backup Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Full Database */}
            <div className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Database className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Lengkap</span>
              </div>
              <div>
                <h5 className="font-bold text-white text-xs">Cadangkan Seluruh Database</h5>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mencakup anggota, transaksi, buku kas, profil, dan konfigurasi sistem.
                </p>
              </div>
              <button
                onClick={handleBackupDatabase}
                disabled={isUploading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                {isUploading ? 'Mengunggah...' : 'Upload Database ke Drive'}
              </button>
            </div>

            {/* Card 2: Members Only */}
            <div className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Anggota</span>
              </div>
              <div>
                <h5 className="font-bold text-white text-xs">Cadangkan Data Anggota</h5>
                <p className="text-[11px] text-slate-400 mt-1">
                  Daftar anggota lengkap, nomor rekening, kontak, dan status keanggotaan.
                </p>
              </div>
              <button
                onClick={handleBackupMembers}
                disabled={isUploading}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload Anggota ke Drive
              </button>
            </div>

            {/* Card 3: Kas Ledger */}
            <div className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Buku Kas</span>
              </div>
              <div>
                <h5 className="font-bold text-white text-xs">Cadangkan Buku Kas</h5>
                <p className="text-[11px] text-slate-400 mt-1">
                  Catatan arus kas masuk/keluar Kas Koperasi dan Kas Anggota.
                </p>
              </div>
              <button
                onClick={handleBackupKas}
                disabled={isUploading}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload Kas ke Drive
              </button>
            </div>
          </div>

          {/* Drive Files List Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Cloud className="w-4 h-4 text-cyan-400" />
                Daftar File Cadangan di Google Drive ({files.length})
              </h4>
              <span className="text-[11px] text-slate-400">
                Lokasi: <span className="font-mono text-cyan-300">Google Drive / Koperasi HWS Cloud Backups</span>
              </span>
            </div>

            {isLoadingFiles ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                Memuat file dari Google Drive...
              </div>
            ) : files.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-2">
                <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Belum ada file cadangan di folder Google Drive ini.</p>
                <p className="text-[11px] text-slate-500">
                  Klik tombol <strong>Upload Database ke Drive</strong> di atas untuk membuat file cadangan pertama Anda.
                </p>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Nama File</th>
                        <th className="py-3 px-4">Ukuran</th>
                        <th className="py-3 px-4">Waktu Cadangan</th>
                        <th className="py-3 px-4 text-center">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {files.map((file) => (
                        <tr key={file.id} className="hover:bg-slate-900/50 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white flex items-center gap-2">
                              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                              <span className="truncate max-w-xs">{file.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{file.mimeType}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-mono">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {file.createdTime ? new Date(file.createdTime).toLocaleString('id-ID') : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                                  title="Buka di Google Drive"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              
                              <button
                                onClick={() => setFileToRestore(file)}
                                className="px-2.5 py-1.5 bg-cyan-600/15 hover:bg-cyan-600/25 text-cyan-400 border border-cyan-500/20 rounded-lg transition text-[11px] font-medium flex items-center gap-1"
                                title="Pulihkan data dari file ini"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Pulihkan
                              </button>

                              <button
                                onClick={() => setFileToDelete(file)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition"
                                title="Hapus file dari Google Drive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION MODAL 1: Hapus File dari Google Drive */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Hapus File dari Google Drive?</h4>
                <p className="text-[11px] text-slate-400">Konfirmasi tindakan destruktif</p>
              </div>
            </div>

            <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[11px]">Nama file yang akan dihapus:</div>
              <div className="font-mono text-rose-300 font-bold break-all">{fileToDelete.name}</div>
              <div className="text-[10px] text-slate-500">Ukuran: {formatFileSize(fileToDelete.size)}</div>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              Apakah Anda yakin ingin menghapus file cadangan ini secara permanen dari Google Drive? File yang sudah dihapus tidak dapat dipulihkan kembali.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-rose-600/25"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus File'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION MODAL 2: Pulihkan Data dari Google Drive */}
      {fileToRestore && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-cyan-400 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Pulihkan Database dari Google Drive?</h4>
                <p className="text-[11px] text-slate-400">Sinkronisasi cadangan ke sistem aktif</p>
              </div>
            </div>

            <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[11px]">Sumber cadangan:</div>
              <div className="font-mono text-cyan-300 font-bold break-all">{fileToRestore.name}</div>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              Tindakan ini akan mengimpor dan memperbarui database aplikasi dengan data dari file cadangan ini, serta menyinkronkannya ke Firebase Cloud Firestore. Lanjutkan pemulihan?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFileToRestore(null)}
                disabled={isRestoring}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmRestoreFile}
                disabled={isRestoring}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-cyan-600/25"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isRestoring ? 'Memulihkan...' : 'Ya, Pulihkan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
