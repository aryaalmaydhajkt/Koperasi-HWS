import React, { useState } from 'react';
import { AdminUser, KoperasiProfile } from '../types';
import { appStore } from '../data/store';
import { 
  Building2, 
  FileCheck2, 
  Cloud, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  CreditCard, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Printer, 
  Search,
  AlertTriangle,
  Smartphone,
  Laptop,
  Download,
  Share2,
  Copy,
  Check,
  Package,
  FolderDown
} from 'lucide-react';
import { HwsLogo } from './HwsLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { InstallAppModal } from './InstallAppModal';

interface SettingsViewProps {
  currentAdmin: AdminUser;
  initialTab?: 'PROFIL' | 'LOGS' | 'SERVER' | 'ADMINS' | 'APP';
  onPrintLogs: () => void;
  onAddAdmin: () => void;
  onEditAdmin: (admin: AdminUser) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentAdmin,
  initialTab = 'PROFIL',
  onPrintLogs,
  onAddAdmin,
  onEditAdmin,
}) => {
  const isSuperAdmin = currentAdmin.role === 'SUPER_ADMIN';
  const state = appStore.getState();
  const profile = state.koperasiProfile;

  const [activeTab, setActiveTab] = useState<'PROFIL' | 'LOGS' | 'SERVER' | 'ADMINS' | 'APP'>(initialTab);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);

  // Koperasi Profile Form State
  const [namaKoperasi, setNamaKoperasi] = useState(profile.namaKoperasi);
  const [nomorBadanHukum, setNomorBadanHukum] = useState(profile.nomorBadanHukum);
  const [npwp, setNpwp] = useState(profile.npwp);
  const [slogan, setSlogan] = useState(profile.slogan);
  const [visiMisi, setVisiMisi] = useState(profile.visiMisi);

  const [alamatKantor, setAlamatKantor] = useState(profile.alamatKantor);
  const [rtRw, setRtRw] = useState(profile.rtRw);
  const [kelurahan, setKelurahan] = useState(profile.kelurahan);
  const [kecamatan, setKecamatan] = useState(profile.kecamatan);
  const [kota, setKota] = useState(profile.kota);
  const [provinsi, setProvinsi] = useState(profile.provinsi);
  const [kodePos, setKodePos] = useState(profile.kodePos);

  const [noTelepon, setNoTelepon] = useState(profile.noTelepon);
  const [noWhatsapp, setNoWhatsapp] = useState(profile.noWhatsapp);
  const [email, setEmail] = useState(profile.email);
  const [website, setWebsite] = useState(profile.website);

  const [ketuaPengurus, setKetuaPengurus] = useState(profile.ketuaPengurus);
  const [sekretaris, setSekretaris] = useState(profile.sekretaris);
  const [bendahara, setBendahara] = useState(profile.bendahara);

  const [bankKoperasi, setBankKoperasi] = useState(profile.bankKoperasi);
  const [noRekKoperasiUtama, setNoRekKoperasiUtama] = useState(profile.noRekKoperasiUtama);
  const [atasNamaRekKoperasi, setAtasNamaRekKoperasi] = useState(profile.atasNamaRekKoperasi);

  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Logs Filter State
  const [searchLog, setSearchLog] = useState('');

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg('');

    if (!isSuperAdmin) {
      setProfileErrorMsg('Hanya Super Admin yang berhak mengubah profil koperasi.');
      return;
    }

    try {
      const updates: Partial<KoperasiProfile> = {
        namaKoperasi: namaKoperasi.trim(),
        nomorBadanHukum: nomorBadanHukum.trim(),
        npwp: npwp.trim(),
        slogan: slogan.trim(),
        visiMisi: visiMisi.trim(),
        alamatKantor: alamatKantor.trim(),
        rtRw: rtRw.trim(),
        kelurahan: kelurahan.trim(),
        kecamatan: kecamatan.trim(),
        kota: kota.trim(),
        provinsi: provinsi.trim(),
        kodePos: kodePos.trim(),
        noTelepon: noTelepon.trim(),
        noWhatsapp: noWhatsapp.trim(),
        email: email.trim(),
        website: website.trim(),
        ketuaPengurus: ketuaPengurus.trim(),
        sekretaris: sekretaris.trim(),
        bendahara: bendahara.trim(),
        bankKoperasi: bankKoperasi.trim(),
        noRekKoperasiUtama: noRekKoperasiUtama.trim(),
        atasNamaRekKoperasi: atasNamaRekKoperasi.trim(),
      };

      appStore.updateKoperasiProfile(updates, currentAdmin);
      setProfileSuccessMsg(true);
      setTimeout(() => setProfileSuccessMsg(false), 3000);
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Gagal menyimpan profil koperasi.');
    }
  };

  // Handle Delete Admin
  const handleDeleteAdmin = (adminUser: AdminUser) => {
    if (!isSuperAdmin) {
      alert('Hanya Super Admin yang dapat menghapus admin.');
      return;
    }
    if (adminUser.id === currentAdmin.id) {
      alert('Anda tidak dapat menghapus akun Super Admin yang sedang aktif.');
      return;
    }
    if (confirm(`Hapus admin ${adminUser.nama} (${adminUser.username})?`)) {
      try {
        appStore.deleteAdmin(adminUser.id, currentAdmin);
        alert(`Admin ${adminUser.nama} berhasil dihapus.`);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus admin.');
      }
    }
  };


  // Filtered Logs
  const filteredLogs = state.logs.filter((log) => {
    if (!searchLog.trim()) return true;
    const q = searchLog.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.adminName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
      
      {/* Settings Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">⚙</span>
            Menu Setting & Pengaturan Koperasi HWS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pusat konfigurasi Profile Koperasi, Log Audit, Cloud Server, dan Kelola Admin
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation Pills (5 Items: Profil, Logs, Server, Admins, App) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('PROFIL')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
            activeTab === 'PROFIL'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Profile Koperasi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LOGS')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
            activeTab === 'LOGS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Log Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SERVER')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
            activeTab === 'SERVER'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Cloud Server</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ADMINS')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
            activeTab === 'ADMINS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Kelola Admin ({state.admins.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('APP')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition col-span-2 sm:col-span-1 ${
            activeTab === 'APP'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/20 border border-emerald-500/20'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>App Android & Laptop</span>
        </button>
      </div>

      {/* SUB-TAB 1: PROFILE KOPERASI */}
      {activeTab === 'PROFIL' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm">Profil Resmi & Rekening Operasional Koperasi</h3>
              <p className="text-xs text-slate-400">
                Informasi badan hukum, pengurus, dan rekening tujuan setoran anggota
              </p>
            </div>
            {profile.updatedAt && (
              <span className="text-[11px] text-slate-500 font-mono">
                Terakhir Diperbarui: {profile.updatedAt} oleh {profile.updatedBy || 'Super Admin'}
              </span>
            )}
          </div>

          {/* Success / Error notification */}
          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profil Koperasi berhasil disimpan! Rekening koperasi pada setoran anggota telah otomatis diperbarui.</span>
            </div>
          )}

          {profileErrorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs">
              {profileErrorMsg}
            </div>
          )}

          {/* Rekening Synchronized Alert Callout */}
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-start gap-2.5">
            <CreditCard className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-white">Sinkronisasi Rekening Koperasi Otomatis:</span>
              <p className="text-blue-200/90 leading-relaxed text-[11px]">
                Nomor rekening koperasi yang Anda ubah di bagian ini akan <strong>langsung otomatis berubah</strong> pada halaman setoran anggota (metode Transfer Bank & QRIS) tanpa perlu merestart sistem.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            
            {/* 1. Legalitas */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="font-bold text-slate-300 text-xs flex items-center gap-2 border-b border-slate-800 pb-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>1. Legalitas & Identitas Resmi</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nama Koperasi *</label>
                  <input
                    type="text"
                    required
                    value={namaKoperasi}
                    onChange={(e) => setNamaKoperasi(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nomor Badan Hukum / Kemenkumham *</label>
                  <input
                    type="text"
                    required
                    value={nomorBadanHukum}
                    onChange={(e) => setNomorBadanHukum(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">NPWP Koperasi</label>
                  <input
                    type="text"
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Slogan Koperasi</label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Visi & Misi Koperasi</label>
                  <textarea
                    rows={2}
                    value={visiMisi}
                    onChange={(e) => setVisiMisi(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* 2. Rekening Bank Koperasi Utama (Point 3) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3">
              <div className="font-bold text-amber-400 text-xs flex items-center gap-2 border-b border-slate-800 pb-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>2. Rekening Bank Koperasi Utama (Tujuan Setoran Anggota)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nama Bank Koperasi *</label>
                  <input
                    type="text"
                    required
                    value={bankKoperasi}
                    onChange={(e) => setBankKoperasi(e.target.value)}
                    placeholder="Contoh: Bank Central Asia (BCA)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nomor Rekening Koperasi *</label>
                  <input
                    type="text"
                    required
                    value={noRekKoperasiUtama}
                    onChange={(e) => setNoRekKoperasiUtama(e.target.value)}
                    placeholder="Contoh: 8830198822"
                    className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Atas Nama Rekening *</label>
                  <input
                    type="text"
                    required
                    value={atasNamaRekKoperasi}
                    onChange={(e) => setAtasNamaRekKoperasi(e.target.value)}
                    placeholder="Contoh: KSP HIMPUNAN WIRAUSAHA SEJAHTERA"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* 3. Alamat Kantor */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="font-bold text-slate-300 text-xs flex items-center gap-2 border-b border-slate-800 pb-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>3. Alamat Kantor Sekretariat</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-slate-400 mb-1">Alamat Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={alamatKantor}
                    onChange={(e) => setAlamatKantor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">RT / RW</label>
                  <input
                    type="text"
                    value={rtRw}
                    onChange={(e) => setRtRw(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Kelurahan</label>
                  <input
                    type="text"
                    value={kelurahan}
                    onChange={(e) => setKelurahan(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={provinsi}
                    onChange={(e) => setProvinsi(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={kodePos}
                    onChange={(e) => setKodePos(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* 4. Kontak & Susunan Pengurus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="font-bold text-slate-300 text-xs flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>4. Kontak Resmi Koperasi</span>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">No. Telepon Kantor</label>
                    <input
                      type="text"
                      value={noTelepon}
                      onChange={(e) => setNoTelepon(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">No. WhatsApp Resmi</label>
                    <input
                      type="text"
                      value={noWhatsapp}
                      onChange={(e) => setNoWhatsapp(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Email Resmi</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Website Resmi</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="font-bold text-slate-300 text-xs flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>5. Susunan Pengurus Inti</span>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">Ketua Pengurus *</label>
                    <input
                      type="text"
                      required
                      value={ketuaPengurus}
                      onChange={(e) => setKetuaPengurus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Sekretaris *</label>
                    <input
                      type="text"
                      required
                      value={sekretaris}
                      onChange={(e) => setSekretaris(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Bendahara *</label>
                    <input
                      type="text"
                      required
                      value={bendahara}
                      onChange={(e) => setBendahara(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isSuperAdmin && (
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Save className="w-4 h-4" /> Simpan Perubahan Profil Koperasi
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* SUB-TAB 2: LOG AUDIT */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Log Audit Aktivitas Sistem & Pengurus</h3>
              <p className="text-xs text-slate-400">
                Riwayat tindakan admin, verifikasi setoran, penyesuaian dana, dan pemeliharaan data
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari aksi, admin, keterangan..."
                  value={searchLog}
                  onChange={(e) => setSearchLog(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={onPrintLogs}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Cetak Log PDF
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 italic text-xs bg-slate-950 rounded-xl border border-slate-800">
                Tidak ada log aktivitas yang cocok dengan pencarian.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:border-slate-700 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono text-[10px] font-bold">
                        {log.action}
                      </span>
                      <span className="text-white font-semibold">{log.adminName}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{log.details}</p>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CLOUD SERVER */}
      {activeTab === 'SERVER' && (
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Cloud className="w-5 h-5 text-cyan-400" />
              Google Cloud Database & Server Backup
            </h3>
            <p className="text-xs text-slate-400">
              Pemantauan sinkronisasi cloud real-time, lokasi server Google Cloud, dan kontrol database bersih
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs text-slate-400 uppercase font-semibold">Status Cloud Database</div>
              <div className="text-emerald-400 font-bold flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {state.cloudBackup.backupStatus} (Firebase Firestore)
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Project: folkloric-hull-3ds98
              </p>
              <p className="text-[10px] text-cyan-400 font-mono truncate" title="ai-studio-koperasihimpunan-c9f42355-5cbb-4139-be58-3af5e24d1c86">
                DB: ai-studio-koperasihimpunan...
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs text-slate-400 uppercase font-semibold">Sinkronisasi Realtime</div>
              <div className="text-white font-mono font-bold text-sm">
                {new Date(state.cloudBackup.lastBackupTime).toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-500">Auto-sync realtime Firestore setiap ada transaksi atau perubahan data</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs text-slate-400 uppercase font-semibold">Total Cloud Records</div>
              <div className="text-amber-400 font-mono font-bold text-sm">
                {state.members.length + state.transactions.length + state.kasEntries.length} Entri Tercatat
              </div>
              <p className="text-[11px] text-slate-500">Asia Southeast 1 (Jakarta) • Firestore Multi-Region</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => {
                appStore.triggerGoogleCloudSync();
                alert('Sinkronisasi Google Cloud berhasil dijalankan!');
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Trigger Sinkronisasi Google Cloud Sekarang
            </button>
          </div>


        </div>
      )}

      {/* SUB-TAB 4: KELOLA ADMIN */}
      {activeTab === 'ADMINS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Kelola Profil Admin & Hak Akses Pengurus</h3>
              <p className="text-xs text-slate-400">
                Pengelolaan akun pengurus koperasi (Super Admin, Admin Tulis, Admin Unduh, Admin Pembukuan)
              </p>
            </div>

            {isSuperAdmin && (
              <button
                onClick={onAddAdmin}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" /> Tambah Admin Baru
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.admins.map((adm) => (
              <div key={adm.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">{adm.nama}</div>
                    <div className="text-xs font-mono text-cyan-400">@{adm.username} • {adm.email}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded uppercase">
                      {adm.role.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditAdmin(adm)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Edit
                    </button>
                    {isSuperAdmin && adm.id !== currentAdmin.id && (
                      <button
                        onClick={() => handleDeleteAdmin(adm)}
                        className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-xs font-medium transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-lg text-[11px] text-slate-400 space-y-1 font-mono">
                  <div>NIK: {adm.nik || '31730xxxxxxxxxxx'}</div>
                  <div>No. HP / WhatsApp: {adm.noHp}</div>
                  <div className="truncate">Alamat: {adm.alamat || 'Jakarta Barat'}</div>
                  <div className="flex items-center gap-2 pt-1 font-sans">
                    <span className="text-slate-300">Status KTP:</span>
                    {adm.fotoKtp ? (
                      <span className="text-emerald-400 font-bold">✓ KTP Terupload</span>
                    ) : (
                      <span className="text-amber-400 font-semibold">Belum Terupload</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: APP ANDROID & LAPTOP (PWA CONFIGURATION & BROADCAST) */}
      {activeTab === 'APP' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PWA Standalone Active
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Android APK & Laptop Ready
                </span>
              </div>
              <h3 className="font-bold text-white text-base mt-1">
                Distribusi & Pemasangan Aplikasi (Android & Laptop)
              </h3>
              <p className="text-xs text-slate-400">
                Panduan, tautan resmi, dan materi siaran untuk membagikan aplikasi kepada seluruh anggota koperasi
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowInstallModal(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 shrink-0"
            >
              <Smartphone className="w-4 h-4" />
              <span>Buka Menu Pasang Aplikasi</span>
            </button>
          </div>

          {/* Quick Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Android WebAPK */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Aplikasi HP Android</h4>
                    <p className="text-xs text-slate-400">PWA / WebAPK Mandiri</p>
                  </div>
                </div>
                <div className="text-xs text-slate-300 space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                  <p>• Ikon di Home Screen HP Android.</p>
                  <p>• Loading instan via Service Worker Cache.</p>
                  <p>• Ringan & hemat memori.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallModal(true)}
                className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 mt-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instal di Android</span>
              </button>
            </div>

            {/* Card 2: Laptop & Desktop */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Aplikasi Laptop / PC</h4>
                    <p className="text-xs text-slate-400">Windows, MacOS, dan Linux</p>
                  </div>
                </div>
                <div className="text-xs text-slate-300 space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                  <p>• Window mandiri tanpa address bar.</p>
                  <p>• Pin ke Taskbar Windows / Dock Mac.</p>
                  <p>• Fitur cetak mutasi PDF & KTA digital.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallModal(true)}
                className="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 mt-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instal di Laptop</span>
              </button>
            </div>

            {/* Card 3: Download Complete Source / Offline ZIP Package */}
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-4 flex flex-col justify-between bg-gradient-to-b from-amber-950/20 to-slate-950">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Master File Aplikasi (.ZIP)</h4>
                    <p className="text-xs text-slate-400">Offline Portable & Source Code</p>
                  </div>
                </div>
                <div className="text-xs text-slate-300 space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                  <p>• Termasuk launcher otomatis Windows (.bat).</p>
                  <p>• Termasuk launcher Mac & Linux (.sh).</p>
                  <p>• Ukuran ~285 KB, siap diekstrak & dijalankan.</p>
                </div>
              </div>
              <a
                href="/api/download-zip"
                download="koperasi-hws-aplikasi-lengkap.zip"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950/50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mt-2"
              >
                <FolderDown className="w-4 h-4" />
                <span>Unduh File .ZIP Sekarang</span>
              </a>
            </div>
          </div>

          {/* Copyable Broadcast Template */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-white text-sm">Template Pesan WhatsApp untuk Dibagikan ke Anggota</h4>
                <p className="text-xs text-slate-400">
                  Salin teks di bawah ini dan kirimkan ke grup WhatsApp anggota koperasi
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const url = typeof window !== 'undefined' ? window.location.origin : 'https://koperasi-hws.app';
                  const msg = `📢 *PENGUMUMAN APLIKASI KOPERASI HWS*\n\nYth. Seluruh Anggota Koperasi Himpunan Wirausaha Sejahtera (HWS),\n\nKini sistem informasi Koperasi HWS telah dapat dipasang langsung sebagai aplikasi di HP Android dan Laptop/Komputer Anda tanpa perlu membuka browser secara manual!\n\n📲 *Cara Pasang di HP Android:*\n1. Buka tautan: ${url}\n2. Ketuk menu titik tiga (⋮) di pojok kanan atas Chrome / Samsung Internet\n3. Pilih "Instal Aplikasi" atau "Tambahkan ke Layar Utama"\n4. Ikon Koperasi HWS otomatis muncul di layar HP Anda!\n\n💻 *Cara Pasang di Laptop/PC (Windows/Mac):*\n1. Buka tautan: ${url} di Google Chrome atau Microsoft Edge\n2. Klik ikon Instal (tanda monitor/download) di samping bilah alamat URL\n3. Aplikasi akan langsung terpasang di Desktop & Taskbar laptop Anda!\n\nMari manfaatkan kemudahan cek tabungan pokok, tabungan umum, cetak mutasi resmi, dan KTA digital di aplikasi Koperasi HWS. Terima kasih! 🙏`;
                  navigator.clipboard.writeText(msg);
                  setCopiedBroadcast(true);
                  setTimeout(() => setCopiedBroadcast(false), 2500);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shrink-0"
              >
                {copiedBroadcast ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBroadcast ? 'Pesan Tersalin!' : 'Salin Pesan WhatsApp'}</span>
              </button>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl text-xs text-slate-300 font-mono whitespace-pre-line border border-slate-800/80 leading-relaxed max-h-48 overflow-y-auto">
              {`📢 PENGUMUMAN APLIKASI KOPERASI HWS

Yth. Seluruh Anggota Koperasi Himpunan Wirausaha Sejahtera (HWS),

Kini sistem informasi Koperasi HWS telah dapat dipasang langsung sebagai aplikasi di HP Android dan Laptop/Komputer Anda tanpa perlu membuka browser secara manual!

📲 Cara Pasang di HP Android:
1. Buka tautan Koperasi HWS di Google Chrome / Samsung Internet
2. Ketuk menu titik tiga (⋮) di pojok kanan atas
3. Pilih "Instal Aplikasi" atau "Tambahkan ke Layar Utama"

💻 Cara Pasang di Laptop/PC (Windows/Mac):
1. Buka tautan di Google Chrome / Microsoft Edge
2. Klik ikon Instal di samping bilah alamat URL
3. Aplikasi akan langsung terpasang di Desktop & Taskbar laptop Anda!`}
            </div>
          </div>
        </div>
      )}

      {/* App Install Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

    </div>
  );
};
