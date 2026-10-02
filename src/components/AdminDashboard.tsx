import React, { useState } from 'react';
import { 
  AdminUser, 
  MemberUser, 
  BukuKasType, 
  WilayahJakarta, 
  AdminRole, 
  BukuKasEntry,
  OfficialLetter,
  MemberTransaction
} from '../types';
import { appStore } from '../data/store';
import { HwsLogo } from './HwsLogo';
import { 
  formatRupiah, 
  formatNumberId, 
  exportAnggotaToExcel, 
  exportKasToExcel,
  exportLabaRugiToExcel,
  exportNeracaToExcel
} from '../utils/exportUtils';
import { 
  Users, 
  CreditCard, 
  BookOpen, 
  HeartHandshake, 
  ShieldCheck, 
  Cloud, 
  MessageSquare, 
  LogOut, 
  FileText, 
  Lock, 
  Unlock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  RefreshCw, 
  Search, 
  Check, 
  AlertTriangle,
  Server,
  DollarSign,
  Building2,
  BadgeCheck,
  Mail,
  Eye,
  Sliders,
  Printer,
  FileCheck2,
  Send,
  PlusCircle,
  Key,
  Settings
} from 'lucide-react';
import { MutasiPrintView } from './MutasiPrintView';
import { KtaDigitalModal } from './KtaDigitalModal';
import { ChatDrawer } from './ChatDrawer';
import { OfficialReportsViewer, ReportType } from './OfficialReportsViewer';
import { ProofPreviewModal } from './ProofPreviewModal';
import { LettersModal } from './LettersModal';
import { DirectFundAdjustmentModal } from './DirectFundAdjustmentModal';
import { AdminProfileModal } from './AdminProfileModal';
import { EditMemberModal } from './EditMemberModal';
import { KoperasiProfileModal } from './KoperasiProfileModal';
import { SettingsView } from './SettingsView';
import { PWAInstallButton } from './PWAInstallButton';

interface AdminDashboardProps {
  admin: AdminUser;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout }) => {
  const state = appStore.getState();
  const currentAdmin = state.admins.find((a) => a.id === admin.id) || admin;
  
  // Role checks
  const isSuperAdmin = currentAdmin.role === 'SUPER_ADMIN';
  const isDownloadOnly = currentAdmin.role === 'ADMIN_DOWNLOAD';
  const isPembukuan = currentAdmin.role === 'ADMIN_HAPUS';
  const canWrite = isSuperAdmin || currentAdmin.role === 'ADMIN_WRITE';
  const canDeleteKasDirect = isSuperAdmin || isPembukuan;

  // Active navigation tab
  const [activeNav, setActiveNav] = useState<
    'DASHBOARD' | 'VERIFIKASI' | 'ANGGOTA' | 'KAS' | 'ZAKAT' | 'ADMINS' | 'SERVER' | 'CHAT' | 'SURAT' | 'LOGS' | 'SETTING' | 'LAPORAN_ONLY'
  >(isDownloadOnly ? 'LAPORAN_ONLY' : 'DASHBOARD');

  // Filters
  const [wilayahFilter, setWilayahFilter] = useState<string>('SEMUA');
  const [searchMember, setSearchMember] = useState<string>('');
  const [selectedBukuKas, setSelectedBukuKas] = useState<'ANGGOTA' | 'KAS_KOPERASI' | 'GABUNGAN'>('GABUNGAN');
  const [kasPeriodeType, setKasPeriodeType] = useState<'SEMUA' | 'BULAN' | 'RANGE'>('SEMUA');
  const [kasDateFrom, setKasDateFrom] = useState('');
  const [kasDateTo, setKasDateTo] = useState('');

  // Modals & subviews
  const [inspectMemberMutasi, setInspectMemberMutasi] = useState<MemberUser | null>(null);
  const [inspectMemberKta, setInspectMemberKta] = useState<MemberUser | null>(null);
  const [chatTargetMemberId, setChatTargetMemberId] = useState<string | null>(null);
  const [showAddKasModal, setShowAddKasModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [editingAdminUser, setEditingAdminUser] = useState<AdminUser | null>(null);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [showLettersModal, setShowLettersModal] = useState(false);
  const [showDirectAdjustmentModal, setShowDirectAdjustmentModal] = useState(false);
  const [viewingProofTx, setViewingProofTx] = useState<MemberTransaction | null>(null);
  const [editingKasEntry, setEditingKasEntry] = useState<BukuKasEntry | null>(null);
  const [editingMember, setEditingMember] = useState<MemberUser | null>(null);
  const [showKoperasiProfileModal, setShowKoperasiProfileModal] = useState(false);
  
  // Setting SubTab
  const [settingSubTab, setSettingSubTab] = useState<'PROFIL' | 'LOGS' | 'SERVER' | 'ADMINS'>('PROFIL');

  // Custom Category State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'MASUK' | 'KELUAR'>('KELUAR');

  // Dedicated Official Report Viewer State
  const [officialReportType, setOfficialReportType] = useState<ReportType | null>(null);
  const [selectedLetterForReport, setSelectedLetterForReport] = useState<OfficialLetter | null>(null);

  // Form states for adding Buku Kas (Point 1: Bebas input nominal tanpa pilihan nilai)
  const [kasFormBuku, setKasFormBuku] = useState<'KAS_ANGGOTA' | 'KAS_KOPERASI'>('KAS_KOPERASI');
  const [kasFormTipe, setKasFormTipe] = useState<'MASUK' | 'KELUAR'>('KELUAR');
  const [kasFormKategori, setKasFormKategori] = useState('Overhead Operasional Kantor');
  const [kasFormKeterangan, setKasFormKeterangan] = useState('');
  const [kasFormNominal, setKasFormNominal] = useState<number | ''>('');

  // Form states for Disburse Zakat/Qurban
  const [disburseJenis, setDisburseJenis] = useState<'ZAKAT' | 'QURBAN'>('ZAKAT');
  const [disburseTarget, setDisburseTarget] = useState<'ALL' | 'WILAYAH' | 'INDIVIDUAL'>('ALL');
  const [disburseWilayah, setDisburseWilayah] = useState<WilayahJakarta>('Cengkareng');
  const [disburseMemberId, setDisburseMemberId] = useState('');
  const [disburseKeterangan, setDisburseKeterangan] = useState('Penyaluran Zakat Fitrah oleh pengurus');

  // Calculations
  const pendingDeposits = state.transactions.filter((t) => t.status === 'MENUNGGU_VERIFIKASI');
  const totalAnggota = state.members.length;
  const totalPokok = appStore.getTotalSimpananPokok();
  const totalZakat = appStore.getTotalZakat();
  const totalQurban = appStore.getTotalQurban();
  const saldoKasAnggota = appStore.getSaldoKasAnggota();
  const saldoKasKoperasi = appStore.getSaldoKasKoperasi();
  const saldoKasGabungan = saldoKasAnggota + saldoKasKoperasi;

  // Filtered Members
  const filteredMembers = state.members.filter((m) => {
    const matchWilayah = wilayahFilter === 'SEMUA' || m.wilayah === wilayahFilter;
    const matchSearch = 
      m.nama.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.noAnggota.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.noRekKoperasi.includes(searchMember);
    return matchWilayah && matchSearch;
  });

  // Filtered Kas Entries
  const filteredKas = state.kasEntries.filter((k) => {
    if (selectedBukuKas === 'ANGGOTA' && k.bukuKas !== 'KAS_ANGGOTA') return false;
    if (selectedBukuKas === 'KAS_KOPERASI' && k.bukuKas !== 'KAS_KOPERASI') return false;
    return true;
  });

  // Handle Verify Deposit
  const handleVerify = (txId: string, approve: boolean) => {
    if (!canWrite) {
      alert('Akun Anda tidak memiliki izin verifikasi setoran.');
      return;
    }
    appStore.verifyDeposit(txId, currentAdmin, approve);
  };

  // Handle Disburse Zakat/Qurban
  const handleExecuteDisburse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Pencairan Zakat/Qurban harus disetujui Super Admin.');
      return;
    }
    try {
      appStore.disburseZakatQurban({
        jenis: disburseJenis,
        target: disburseTarget,
        wilayah: disburseTarget === 'WILAYAH' ? disburseWilayah : undefined,
        memberId: disburseTarget === 'INDIVIDUAL' ? disburseMemberId : undefined,
        keteranganPenyaluran: disburseKeterangan,
        adminUser: currentAdmin,
      });
      setShowDisburseModal(false);
      alert('Penyaluran berhasil dicairkan dan tercatat pada mutasi anggota & buku kas koperasi!');
    } catch (err: any) {
      alert(err.message || 'Gagal menyalurkan dana');
    }
  };

  // Handle Add Kas (Anggota & Koperasi) - Point 1: Bebas input nominal
  const handleAddKasKoperasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) {
      alert('Anda tidak memiliki izin mencatat kas.');
      return;
    }
    const nominalNum = Number(kasFormNominal);
    if (!nominalNum || nominalNum <= 0) {
      alert('Silakan ketik nominal yang valid.');
      return;
    }
    try {
      appStore.addManualKasEntry({
        bukuKas: kasFormBuku,
        tipe: kasFormTipe,
        kategori: kasFormKategori,
        keterangan: kasFormKeterangan || 'Transaksi Kas',
        nominal: nominalNum,
        adminUser: currentAdmin,
      });
      setShowAddKasModal(false);
      setKasFormKeterangan('');
      setKasFormNominal('');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan transaksi kas');
    }
  };

  // Handle Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    appStore.addKasCategory({
      nama: newCategoryName.trim(),
      tipe: newCategoryType,
      bukuKas: 'KAS_KOPERASI',
      adminName: currentAdmin.nama,
    });
    setNewCategoryName('');
    setShowAddCategoryModal(false);
  };

  // Handle Member Deletion (HANYA BISA DILAKUKAN OLEH SUPER ADMIN)
  const handleDeleteMember = (member: MemberUser) => {
    if (!isSuperAdmin) {
      alert('Penghapusan data anggota HANYA dapat dilakukan oleh Super Admin!');
      return;
    }

    const totalSaldo = (member.saldoPokok || 0) + (member.saldoUmum || 0) + (member.saldoZakat || 0) + (member.saldoQurban || 0);

    if (confirm(`HAPUS ANGGOTA (SUPER ADMIN):\n\nNama: "${member.nama}" (${member.noAnggota})\nSisa Total Saldo: ${formatRupiah(totalSaldo)}\n(Sisa saldo jika ada akan otomatis dipindahkan ke Buku Kas Koperasi sebagai penutupan akun).\n\nApakah Anda yakin ingin menghapus data anggota ini secara permanen?`)) {
      try {
        appStore.deleteMember(member.id, currentAdmin);
        alert(`Anggota "${member.nama}" (${member.noAnggota}) berhasil dihapus oleh Super Admin.`);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus anggota');
      }
    }
  };

  // Handle Kas Entry Deletion (Super Admin & Admin Pembukuan: langsung; Admin Write: diajukan ke Super Admin & Admin Pembukuan)
  const handleDeleteKasEntry = (entry: BukuKasEntry) => {
    const bukuLabel = entry.bukuKas === 'KAS_ANGGOTA' ? 'Buku Kas Anggota' : 'Buku Kas Koperasi';

    if (canDeleteKasDirect) {
      if (confirm(`HAPUS TRANSAKSI ${bukuLabel.toUpperCase()}:\n\nKeterangan: "${entry.keterangan}"\nNominal: ${formatRupiah(entry.nominal)}\n\nSaldo berjalan akan otomatis dihitung ulang secara matematis.\nApakah Anda yakin ingin menghapus transaksi ini?`)) {
        try {
          appStore.deleteKasEntry(entry.id, currentAdmin);
          alert(`Transaksi ${bukuLabel} berhasil dihapus dan saldo telah disesuaikan.`);
        } catch (err: any) {
          alert(err.message || 'Gagal menghapus transaksi kas');
        }
      }
    } else if (canWrite) {
      if (confirm(`Ajukan penghapusan transaksi ${bukuLabel} "${entry.keterangan}" (${formatRupiah(entry.nominal)}) ke Super Admin / Admin Pembukuan untuk diverifikasi?`)) {
        try {
          appStore.deleteKasEntry(entry.id, currentAdmin);
          alert(`Permohonan penghapusan transaksi ${bukuLabel} telah dikirim ke Super Admin & Admin Pembukuan untuk diverifikasi.`);
        } catch (err: any) {
          alert(err.message || 'Gagal mengajukan penghapusan kas');
        }
      }
    } else {
      alert('Anda tidak memiliki wewenang untuk menghapus transaksi kas.');
    }
  };

  // If viewing official printable report modal
  if (officialReportType) {
    const disbursementsList = state.transactions
      .filter((t) => (t.kategori === 'ZAKAT' || t.kategori === 'QURBAN') && t.tipe === 'KELUAR')
      .map((t) => ({
        id: t.id,
        tanggal: t.tanggal,
        jenis: t.kategori as 'ZAKAT' | 'QURBAN',
        target: 'ALL' as const,
        keteranganPenyaluran: t.rincian?.targetPenyaluran || t.keterangan,
        totalDana: t.nominal,
        disbursedBy: t.verifiedBy || 'Pengurus Koperasi',
        namaAnggota: t.namaAnggota,
      }));

    return (
      <OfficialReportsViewer
        reportType={officialReportType}
        members={state.members}
        kasEntries={state.kasEntries}
        transactions={state.transactions}
        disbursements={disbursementsList}
        logs={state.logs}
        selectedLetter={selectedLetterForReport}
        onBack={() => {
          setOfficialReportType(null);
          setSelectedLetterForReport(null);
        }}
        canViewLogs={isSuperAdmin}
      />
    );
  }

  // If inspecting individual member mutasi bank statement
  if (inspectMemberMutasi) {
    const memberTxs = state.transactions.filter((t) => t.memberId === inspectMemberMutasi.id);
    return (
      <MutasiPrintView
        member={inspectMemberMutasi}
        transactions={memberTxs}
        periodeLabel="Semua Periode"
        filterKategori="SEMUA"
        onBack={() => setInspectMemberMutasi(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <HwsLogo size={42} className="w-10 h-10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">KOPERASI HWS</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-md">
                  ADMIN PORTAL
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md uppercase">
                  {currentAdmin.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Himpunan Wirausaha Sejahtera • {currentAdmin.nama}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Action: Penyesuaian Saldo Langsung (F.2) */}
            {canWrite && !isDownloadOnly && (
              <button
                onClick={() => setShowDirectAdjustmentModal(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition"
                title="Penyesuaian Saldo Langsung ke Anggota (Point F.2)"
              >
                <DollarSign className="w-3.5 h-3.5" /> Sesuaikan Saldo
              </button>
            )}

            {/* Quick Action: Surat Menyurat (F.1) */}
            {canWrite && !isDownloadOnly && (
              <button
                onClick={() => setShowLettersModal(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition"
                title="Kirim Surat Resmi ke WA / Email Anggota (Point F.1)"
              >
                <Mail className="w-3.5 h-3.5" /> Surat Menyurat
              </button>
            )}

            {/* PWA Install Button for Android & Laptop */}
            <PWAInstallButton variant="header" />

            {/* Super Admin: Menu Setting (Point 2: Profile Koperasi, Log Audit, Cloud Server, Kelola Admin) */}
            {isSuperAdmin && (
              <button
                onClick={() => {
                  setActiveNav('SETTING');
                  setSettingSubTab('PROFIL');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeNav === 'SETTING'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
                title="Menu Setting: Profile Koperasi, Log Audit, Cloud Server, Kelola Admin"
              >
                <Settings className="w-3.5 h-3.5" /> Menu Setting
              </button>
            )}

            {/* Profile Self-Edit */}
            <button
              onClick={() => setEditingAdminUser(currentAdmin)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" /> Profil
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-medium transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>

        </div>

        {/* Navigation Tabs based on Role */}
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto flex gap-1 border-t border-slate-800/80 text-xs">
          
          {isDownloadOnly ? (
            /* Admin Laporan is strictly limited to Reports (E.3, E.4) */
            <div className="py-2.5 px-4 font-bold text-amber-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Menu Unduh Laporan Resmi Sahaja (Hak Akses Terbatas)
            </div>
          ) : (
            <>
              <button
                onClick={() => setActiveNav('DASHBOARD')}
                className={`py-2.5 px-3.5 font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeNav === 'DASHBOARD'
                    ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Dashboard
              </button>

              <button
                onClick={() => setActiveNav('VERIFIKASI')}
                className={`py-2.5 px-3.5 font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeNav === 'VERIFIKASI'
                    ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Verifikasi Setoran
                {pendingDeposits.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">
                    {pendingDeposits.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveNav('ANGGOTA')}
                className={`py-2.5 px-3.5 font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeNav === 'ANGGOTA'
                    ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Data Anggota ({totalAnggota})
              </button>

              <button
                onClick={() => setActiveNav('KAS')}
                className={`py-2.5 px-3.5 font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeNav === 'KAS'
                    ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Buku Kas & Neraca
              </button>

              <button
                onClick={() => setActiveNav('ZAKAT')}
                className={`py-2.5 px-3.5 font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeNav === 'ZAKAT'
                    ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" /> Zakat & Qurban
              </button>

              <button
                onClick={() => setActiveNav('SURAT')}
                className={`py-2.5 px-3.5 font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeNav === 'SURAT'
                    ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Surat Menyurat
              </button>

              {/* Super Admin Only: Menu Setting (Point 2: Profile Koperasi, Log Audit, Cloud Server, Kelola Admin) */}
              {isSuperAdmin && (
                <button
                  onClick={() => setActiveNav('SETTING')}
                  className={`py-2.5 px-3.5 font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                    activeNav === 'SETTING' || activeNav === 'ADMINS' || activeNav === 'SERVER' || activeNav === 'LOGS'
                      ? 'border-amber-400 text-amber-400 bg-slate-800/40'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" /> Menu Setting
                </button>
              )}

              {/* Chat Anggota (Hidden from Admin Laporan per E.4) */}
              <button
                onClick={() => setActiveNav('CHAT')}
                className={`py-2.5 px-3.5 font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeNav === 'CHAT'
                    ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat Anggota (20 Hari)
              </button>
            </>
          )}

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        
        {/* KPI Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">TOTAL SIMPANAN POKOK</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">
              {formatRupiah(totalPokok)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Rp1.000 / hari • Terkunci oleh Admin
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">TOTAL TABUNGAN UMUM</div>
            <div className="text-2xl font-extrabold text-cyan-400 mt-1 font-mono">
              {formatRupiah(appStore.getTotalTabunganUmum())}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Bisa setor & tarik kapan saja
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">DANA ZAKAT & QURBAN</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
              {formatRupiah(totalZakat + totalQurban)}
            </div>
            <div className="text-xs text-slate-400 mt-1 truncate">
              Fitrah: {formatRupiah(totalZakat)} • Qurban: {formatRupiah(totalQurban)}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold uppercase text-cyan-400">SALDO KAS BERJALAN</div>
            <div className="text-2xl font-extrabold text-white mt-1 font-mono">
              {formatRupiah(saldoKasGabungan)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Kas Anggota: {formatRupiah(saldoKasAnggota)} | Kas Koperasi: {formatRupiah(saldoKasKoperasi)}
            </div>
          </div>
        </div>

        {/* View: LAPORAN ONLY for Admin Download (E.3, E.4) */}
        {(isDownloadOnly || activeNav === 'LAPORAN_ONLY') && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Pusat Unduh Laporan Resmi Koperasi HWS
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Sebagai Admin Laporan, Anda memiliki otorisasi penuh untuk mengunduh seluruh laporan resmi dalam format PDF ber-watermark & Excel dengan periode harian, bulanan, atau tahunan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Laporan Rekap Anggota */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Users className="w-4 h-4 text-cyan-400" /> Rekapitulasi Data Anggota
                </div>
                <p className="text-xs text-slate-400">
                  Data seluruh anggota, alamat lengkap per wilayah (Cengkareng, Kalideres, Kembangan, Kebon Jeruk), saldo simpanan pokok, umum, zakat, qurban.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setOfficialReportType('REKAP_ANGGOTA')}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Buka Laporan PDF
                  </button>
                  <button
                    onClick={() => exportAnggotaToExcel(state.members, 'SEMUA', 'Seluruh Periode')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Excel
                  </button>
                </div>
              </div>

              {/* Laporan Buku Kas & Keuangan */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Building2 className="w-4 h-4 text-amber-400" /> Laporan Buku Kas (Anggota, Koperasi, Konsolidasi)
                </div>
                <p className="text-xs text-slate-400">
                  Pencatatan keluar masuk kas, saldo berjalan, tanggal periode penarikan, kategori dan penanggung jawab input.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setOfficialReportType('BUKU_KAS')}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Buka Laporan PDF
                  </button>
                  <button
                    onClick={() => exportKasToExcel(state.kasEntries, 'Buku Kas Konsolidasi', 'Seluruh Periode')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Excel
                  </button>
                </div>
              </div>

              {/* Laporan Laba Rugi & Neraca */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Sliders className="w-4 h-4 text-emerald-400" /> Laporan Laba Rugi (SHU) & Neraca
                </div>
                <p className="text-xs text-slate-400">
                  Rekapitulasi pendapatan dan beban sesuai kategori yang dibuat, serta posisi aktiva dan pasiva koperasi.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setOfficialReportType('LABA_RUGI_NERACA')}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Buka Laporan PDF Laba Rugi & Neraca
                  </button>
                </div>
              </div>

              {/* Laporan Zakat & Qurban */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <HeartHandshake className="w-4 h-4 text-rose-400" /> Laporan Penyaluran Zakat & Qurban
                </div>
                <p className="text-xs text-slate-400">
                  Laporan pertanggungjawaban penyaluran dana titipan zakat fitrah dan tabungan qurban kepada mustahik/anggota.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setOfficialReportType('ZAKAT_QURBAN')}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Buka Laporan PDF Zakat & Qurban
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* View: DASHBOARD */}
        {!isDownloadOnly && activeNav === 'DASHBOARD' && (
          <div className="space-y-6">
            
            {/* Quick Action Cards & Pending notice */}
            {pendingDeposits.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    {pendingDeposits.length}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ada Setoran Anggota Menunggu Verifikasi</h4>
                    <p className="text-xs text-slate-400">
                      Saldo anggota belum bertambah sebelum Anda memeriksa bukti transfer dan menyetujuinya.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveNav('VERIFIKASI')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition"
                >
                  Buka Verifikasi →
                </button>
              </div>
            )}

            {/* Pending Delete Member Approval Notice for Super Admin */}
            {isSuperAdmin && state.memberDeleteRequests.filter((r) => r.status === 'PENDING').length > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-rose-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Permohonan Hapus Anggota Menunggu Persetujuan Super Admin (Point B.4)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Ada {state.memberDeleteRequests.filter((r) => r.status === 'PENDING').length} akun anggota yang diajukan oleh Admin Write untuk dihapus.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveNav('ANGGOTA')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Tinjau Permohonan →
                </button>
              </div>
            )}

            {/* Overview Grid: 2 Buku Kas Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Buku Kas Anggota Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="font-bold text-white text-sm">Buku Kas Anggota</h3>
                      <p className="text-[11px] text-slate-400">Tabungan Pokok & Tabungan Umum Seluruh Anggota</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Saldo Berjalan</div>
                    <div className="text-base font-bold font-mono text-emerald-400">
                      {formatRupiah(saldoKasAnggota)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg">
                    <span className="text-slate-400">Total Simpanan Pokok:</span>
                    <span className="font-mono font-bold text-white">{formatRupiah(totalPokok)}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg">
                    <span className="text-slate-400">Total Tabungan Umum Anggota:</span>
                    <span className="font-mono font-bold text-white">{formatRupiah(appStore.getTotalTabunganUmum())}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setOfficialReportType('BUKU_KAS')}
                    className="flex-1 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Cetak Laporan PDF
                  </button>
                  <button
                    onClick={() => exportKasToExcel(state.kasEntries.filter((k) => k.bukuKas === 'KAS_ANGGOTA'), 'Buku_Kas_Anggota')}
                    className="flex-1 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Excel
                  </button>
                </div>
              </div>

              {/* Buku Kas Koperasi Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="font-bold text-white text-sm">Buku Kas Koperasi</h3>
                      <p className="text-[11px] text-slate-400">Overhead Operasional, Penyaluran Zakat & Qurban</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Saldo Berjalan</div>
                    <div className="text-base font-bold font-mono text-cyan-400">
                      {formatRupiah(saldoKasKoperasi)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg">
                    <span className="text-slate-400">Total Zakat Fitrah Tersedia:</span>
                    <span className="font-mono font-bold text-emerald-400">{formatRupiah(totalZakat)}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg">
                    <span className="text-slate-400">Total Tabungan Qurban Tersedia:</span>
                    <span className="font-mono font-bold text-teal-400">{formatRupiah(totalQurban)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowAddKasModal(true)}
                    className="flex-1 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
                  >
                    + Input Kas Koperasi
                  </button>
                  <button
                    onClick={() => setShowDisburseModal(true)}
                    className="flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                  >
                    Salurkan Zakat & Qurban
                  </button>
                </div>
              </div>

            </div>

            {/* Quick Recent Transactions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Aktivitas Transaksi Terbaru</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOfficialReportType('RIWAYAT_TRANSAKSI')}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Printer className="w-3.5 h-3.5" /> Unduh Riwayat Transaksi (PDF)
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={() => setActiveNav('KAS')}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Buka Seluruh Buku Kas →
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Anggota / Keterangan</th>
                      <th className="py-2.5 px-3">Buku Kas</th>
                      <th className="py-2.5 px-3">Tipe</th>
                      <th className="py-2.5 px-3 text-right">Nominal</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {state.transactions.slice(0, 5).map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 text-slate-300">{t.tanggal}</td>
                        <td className="py-3 px-3 font-sans">
                          <div className="font-bold text-white">{t.namaAnggota}</div>
                          <div className="text-[11px] text-slate-400">{t.keterangan}</div>
                        </td>
                        <td className="py-3 px-3 font-sans text-slate-400">
                          {t.kategori === 'POKOK' || t.kategori === 'UMUM' || t.kategori === 'GABUNGAN_KEWAJIBAN'
                            ? 'Kas Anggota'
                            : 'Kas Koperasi'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.tipe === 'MASUK'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {t.tipe}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold">
                          {formatRupiah(t.nominal)}
                        </td>
                        <td className="py-3 px-3 text-center font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.status === 'TERVERIFIKASI'
                                ? 'text-emerald-400'
                                : t.status === 'MENUNGGU_VERIFIKASI'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {state.transactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 italic font-sans">
                          Belum ada transaksi (Data 0).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* View: VERIFIKASI SETORAN (Point A.1, A.2, 20) */}
        {!isDownloadOnly && activeNav === 'VERIFIKASI' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">Verifikasi Bukti Setoran Anggota</h3>
                <p className="text-xs text-slate-400">
                  Periksa foto struk transfer resmi sebelum menyetujui penambahan saldo anggota (Point A.1).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOfficialReportType('RIWAYAT_TRANSAKSI')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> Riwayat Transaksi (PDF)
                </button>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold">
                  {pendingDeposits.length} Antrian Verifikasi
                </span>
              </div>
            </div>

            {pendingDeposits.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                <CheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-400">Semua setoran telah diverifikasi</p>
                <p className="text-slate-500 mt-1">Tidak ada setoran yang menunggu konfirmasi admin saat ini.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDeposits.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{tx.namaAnggota}</span>
                        <span className="text-xs font-mono text-amber-400">({tx.noRekKoperasi})</span>
                        <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded font-bold">
                          {tx.kategori === 'GABUNGAN_KEWAJIBAN' ? 'Tabungan Kewajiban' : 'Tabungan Umum'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        {tx.keterangan}
                      </div>

                      {tx.rincian?.jumlahHari && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-3 font-mono">
                          <span>Pokok: {formatRupiah(tx.rincian.pokok || 0)}</span>
                          <span>Fitrah: {formatRupiah(tx.rincian.zakat || 0)}</span>
                          <span>Qurban: {formatRupiah(tx.rincian.qurban || 0)}</span>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-500 flex items-center gap-3">
                        <span>Metode: {tx.metodePembayaran || 'Transfer Bank'}</span>
                        <span>•</span>
                        <span>Waktu: {tx.tanggal}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-base font-bold font-mono text-emerald-400">
                          {formatRupiah(tx.nominal)}
                        </div>
                        {/* Tombol Lihat Foto Struk Transfer (Point A.1) */}
                        <button
                          onClick={() => setViewingProofTx(tx)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center justify-end gap-1 mt-0.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Lihat Bukti Foto Transfer
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerify(tx.id, false)}
                          className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Tolak
                        </button>
                        <button
                          onClick={() => handleVerify(tx.id, true)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Setujui
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* View: DATA ANGGOTA (Point B.3, B.4, B.5) */}
        {!isDownloadOnly && activeNav === 'ANGGOTA' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            
            {/* Header + Filter Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">Data Keanggotaan Koperasi HWS</h3>
                <p className="text-xs text-slate-400">
                  Pengelompokan anggota per wilayah DKI Jakarta & pengelolaan saldo
                </p>
              </div>

              {/* Action: Export & Reports */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setOfficialReportType('REKAP_ANGGOTA')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  <FileText className="w-4 h-4" /> Rekap Anggota (PDF Resmi)
                </button>
                <button
                  onClick={() => exportAnggotaToExcel(filteredMembers, wilayahFilter)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition"
                >
                  <Download className="w-4 h-4" /> Unduh Rekap Anggota (Excel)
                </button>
              </div>
            </div>

            {/* Pending Delete Member Approval Section for Super Admin (B.4) */}
            {isSuperAdmin && state.memberDeleteRequests.filter((r) => r.status === 'PENDING').length > 0 && (
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 font-bold text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Permohonan Hapus Akun Anggota Menunggu Persetujuan Super Admin (Point B.4)
                </div>
                <div className="space-y-2">
                  {state.memberDeleteRequests.filter((r) => r.status === 'PENDING').map((req) => (
                    <div key={req.id} className="bg-slate-950 p-3 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{req.memberNama} ({req.memberNoAnggota})</div>
                        <div className="text-slate-400 text-[11px]">
                          Sisa Saldo: <strong className="text-emerald-400 font-mono">{formatRupiah(req.sisaSaldo)}</strong> • Diajukan oleh: {req.requestedBy} ({req.requestedAt})
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => appStore.rejectDeleteMemberRequest(req.id, currentAdmin)}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => {
                            appStore.approveDeleteMemberRequest(req.id, currentAdmin);
                            alert(`Penghapusan anggota disetujui. Sisa saldo ${formatRupiah(req.sisaSaldo)} otomatis masuk ke Kas Koperasi.`);
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
                        >
                          Setujui & Hapus Akun
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama, No. Anggota, atau No. Rek..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-4 flex items-center gap-2">
                <span className="text-slate-400 text-[11px] whitespace-nowrap">Wilayah:</span>
                <select
                  value={wilayahFilter}
                  onChange={(e) => setWilayahFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                >
                  <option value="SEMUA">Semua Wilayah Jakarta</option>
                  <option value="Kalideres">Kalideres (Kode 76)</option>
                  <option value="Cengkareng">Cengkareng (Kode 77)</option>
                  <option value="Kembangan">Kembangan (Kode 78)</option>
                  <option value="Kebon Jeruk">Kebon Jeruk (Kode 79)</option>
                </select>
              </div>

              <div className="md:col-span-3 text-right self-center text-xs text-slate-400 font-mono">
                Menampilkan: <strong>{filteredMembers.length}</strong> Anggota
              </div>
            </div>

            {/* Table of Members */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">No. Anggota / Rek</th>
                    <th className="py-2.5 px-3">Nama & Alamat</th>
                    <th className="py-2.5 px-3">Wilayah</th>
                    <th className="py-2.5 px-3 text-right">Pokok</th>
                    <th className="py-2.5 px-3 text-right">Zakat</th>
                    <th className="py-2.5 px-3 text-right">Qurban</th>
                    <th className="py-2.5 px-3 text-right">Umum</th>
                    <th className="py-2.5 px-3 text-center">Lock Tarik Pokok</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{m.noAnggota}</div>
                        <div className="text-[11px] text-amber-400">{m.noRekKoperasi}</div>
                      </td>

                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-white">{m.nama}</div>
                        <div className="text-[11px] text-slate-400">
                          {m.rtRw ? `${m.rtRw}, ` : ''}{m.kelurahan ? `${m.kelurahan}, ` : ''}{m.wilayah}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-sans text-slate-300">
                        {m.wilayah}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-amber-400">
                        {formatRupiah(m.saldoPokok)}
                      </td>

                      <td className="py-3 px-3 text-right text-emerald-400">
                        {formatRupiah(m.saldoZakat)}
                      </td>

                      <td className="py-3 px-3 text-right text-teal-400">
                        {formatRupiah(m.saldoQurban)}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-cyan-400">
                        {formatRupiah(m.saldoUmum)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {isSuperAdmin ? (
                          <button
                            onClick={() => appStore.setMemberPokokLock(m.id, !m.isPokokLocked, currentAdmin)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition flex items-center justify-center gap-1 mx-auto ${
                              m.isPokokLocked
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                          >
                            {m.isPokokLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            {m.isPokokLocked ? 'Terkunci' : 'Terbuka'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-sans">
                            {m.isPokokLocked ? '🔒 Terkunci' : '🔓 Terbuka'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-sans">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Mutasi Bank Rekening Print */}
                          <button
                            onClick={() => setInspectMemberMutasi(m)}
                            className="p-1.5 text-cyan-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                            title="Lihat Mutasi Rekening Resmi"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* KTA Digital */}
                          <button
                            onClick={() => setInspectMemberKta(m)}
                            className="p-1.5 text-amber-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                            title="Lihat Kartu Anggota (KTA Digital)"
                          >
                            <BadgeCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Direct Chat */}
                          <button
                            onClick={() => setChatTargetMemberId(m.id)}
                            className="p-1.5 text-emerald-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                            title="Chat Anggota"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit & Detail Profile Anggota (Super Admin, Audit, Write per Point 4.12) */}
                          {canWrite && (
                            <button
                              onClick={() => setEditingMember(m)}
                              className="p-1.5 text-amber-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                              title="Lihat Profil Lengkap & Edit Anggota"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Member (Hanya Super Admin) */}
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteMember(m)}
                              className="p-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition"
                              title="Hapus Anggota Secara Permanen (Hanya Super Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500 italic font-sans">
                        Tidak ada anggota yang sesuai pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* View: BUKU KAS & NERACA (Point C.6, C.7, C.8, C.9, C.10, C.11) */}
        {!isDownloadOnly && activeNav === 'KAS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">Buku Kas & Laporan Neraca Koperasi HWS</h3>
                <p className="text-xs text-slate-400">
                  Konsolidasi kas anggota, kas koperasi, laporan laba rugi per kategori, dan neraca keuangan (Point C.6 - C.11)
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Tambah Kategori (Point C.7) */}
                {canWrite && (
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" /> + Kategori Kas
                  </button>
                )}

                {/* Buka Laporan Laba Rugi & Neraca */}
                <button
                  onClick={() => setOfficialReportType('LABA_RUGI_NERACA')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition"
                >
                  <Sliders className="w-4 h-4" /> Laba Rugi & Neraca (PDF)
                </button>

                {/* Cetak Laporan PDF Buku Kas */}
                <button
                  onClick={() => setOfficialReportType('BUKU_KAS')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  <FileText className="w-4 h-4" /> Cetak Buku Kas (PDF)
                </button>

                {/* Unduh Excel */}
                <button
                  onClick={() => exportKasToExcel(filteredKas, selectedBukuKas)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition"
                >
                  <Download className="w-4 h-4" /> Unduh Excel
                </button>

                {/* Input Kas Koperasi Button */}
                {canWrite && (
                  <button
                    onClick={() => setShowAddKasModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Input Transaksi Kas
                  </button>
                )}
              </div>
            </div>

            {/* Sub-selector Buku Kas */}
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setSelectedBukuKas('GABUNGAN')}
                className={`px-4 py-2 rounded-xl font-bold transition ${
                  selectedBukuKas === 'GABUNGAN'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Konsolidasi Kas Gabungan ({formatRupiah(saldoKasGabungan)})
              </button>
              <button
                onClick={() => setSelectedBukuKas('ANGGOTA')}
                className={`px-4 py-2 rounded-xl font-bold transition ${
                  selectedBukuKas === 'ANGGOTA'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Buku Kas Anggota ({formatRupiah(saldoKasAnggota)})
              </button>
              <button
                onClick={() => setSelectedBukuKas('KAS_KOPERASI')}
                className={`px-4 py-2 rounded-xl font-bold transition ${
                  selectedBukuKas === 'KAS_KOPERASI'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Buku Kas Koperasi ({formatRupiah(saldoKasKoperasi)})
              </button>
            </div>

            {/* Pending Kas Edit Requests from Admin Write (Diverifikasi Super Admin & Admin Pembukuan) */}
            {(isSuperAdmin || isPembukuan) && (state.kasEditRequests || []).filter((r) => r.status === 'PENDING').length > 0 && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 space-y-2">
                <div className="font-bold text-cyan-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Permohonan Perubahan (Edit) Buku Kas dari Admin Write Menunggu Verifikasi
                </div>
                {(state.kasEditRequests || []).filter((r) => r.status === 'PENDING').map((req) => (
                  <div key={req.id} className="bg-slate-950 p-3 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">
                        {req.bukuKas === 'KAS_ANGGOTA' ? 'Kas Anggota' : 'Kas Koperasi'}: {req.keteranganLama} ({formatRupiah(req.nominalLama)}) ➔ <span className="text-cyan-400 font-bold">{req.keteranganBaru} ({formatRupiah(req.nominalBaru)})</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Diajukan oleh: {req.requestedBy} ({req.requestedAt})
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => appStore.rejectEditKasRequest(req.id, currentAdmin)}
                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded hover:text-white"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => {
                          appStore.approveEditKasRequest(req.id, currentAdmin);
                          alert('Perubahan transaksi kas disetujui & diverifikasi. Saldo berjalan otomatis disesuaikan.');
                        }}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded"
                      >
                        Setujui Perubahan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Kas Deletion Requests (C.10) */}
            {(isSuperAdmin || isPembukuan) && state.kasDeleteRequests.filter((r) => r.status === 'PENDING').length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <div className="font-bold text-amber-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Permohonan Hapus Transaksi Kas Menunggu Persetujuan
                </div>
                {state.kasDeleteRequests.filter((r) => r.status === 'PENDING').map((req) => (
                  <div key={req.id} className="bg-slate-950 p-3 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">Trans: {req.keterangan} ({formatRupiah(req.nominal)})</div>
                      <div className="text-slate-400 text-[11px]">
                        Diajukan oleh: {req.requestedBy} ({req.requestedAt})
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => appStore.rejectDeleteKasRequest(req.id, currentAdmin)}
                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded hover:text-white"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => {
                          appStore.approveDeleteKasRequest(req.id, currentAdmin);
                          alert('Penghapusan kas disetujui. Saldo berjalan otomatis disesuaikan.');
                        }}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded"
                      >
                        Setujui Hapus Kas
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Kas Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Buku Kas</th>
                    <th className="py-2.5 px-3">Tipe & Kategori</th>
                    <th className="py-2.5 px-3">Keterangan</th>
                    <th className="py-2.5 px-3 text-right">Nominal</th>
                    <th className="py-2.5 px-3 text-right">Saldo Setelah</th>
                    <th className="py-2.5 px-3 text-center">Petugas</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredKas.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 text-slate-300">{k.tanggal}</td>
                      <td className="py-3 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {k.bukuKas === 'KAS_ANGGOTA' ? 'Kas Anggota' : 'Kas Koperasi'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              k.tipe === 'MASUK'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {k.tipe}
                          </span>
                          <span className="text-white font-medium">{k.kategori}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-300 max-w-xs truncate">
                        {k.keterangan}
                      </td>
                      <td className={`py-3 px-3 text-right font-bold ${k.tipe === 'MASUK' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatRupiah(k.nominal)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {formatRupiah(k.saldoSetelah)}
                      </td>
                      <td className="py-3 px-3 text-center font-sans text-[11px] text-slate-400">
                        {k.createdBy}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        {canWrite && (
                          <div className="flex items-center justify-center gap-1">
                            {/* Edit Kas: Super Admin & Admin Pembukuan langsung; Admin Write diajukan untuk verifikasi */}
                            <button
                              onClick={() => setEditingKasEntry(k)}
                              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
                              title={canDeleteKasDirect ? "Edit Transaksi Kas (Langsung & Saldo Disesuaikan)" : "Ajukan Perubahan Transaksi Kas (Diverifikasi Super Admin & Admin Pembukuan)"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Kas: Super Admin & Admin Pembukuan langsung; Admin Write diajukan untuk verifikasi */}
                            <button
                              onClick={() => handleDeleteKasEntry(k)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                              title={canDeleteKasDirect ? `Hapus Transaksi ${k.bukuKas === 'KAS_ANGGOTA' ? 'Kas Anggota' : 'Kas Koperasi'} (Langsung & Saldo Disesuaikan)` : `Ajukan Hapus Transaksi ${k.bukuKas === 'KAS_ANGGOTA' ? 'Kas Anggota' : 'Kas Koperasi'} (Diverifikasi Super Admin & Admin Pembukuan)`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredKas.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 italic font-sans">
                        Tidak ada transaksi kas dalam buku ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* View: ZAKAT & QURBAN (Point D.1) */}
        {!isDownloadOnly && activeNav === 'ZAKAT' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">Pengelolaan Dana Zakat Fitrah & Tabungan Qurban</h3>
                <p className="text-xs text-slate-400">
                  Dana titipan anggota dari simpanan kewajiban Rp500/hari masing-masing (Point D.1)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOfficialReportType('ZAKAT_QURBAN')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Cetak Laporan Zakat & Qurban (PDF)
                </button>
                {isSuperAdmin && (
                  <button
                    onClick={() => setShowDisburseModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <HeartHandshake className="w-4 h-4" /> Salurkan Dana
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
                <div className="text-xs font-bold uppercase text-emerald-400">TOTAL DANA ZAKAT FITRAH TERKUMPUL</div>
                <div className="text-2xl font-black font-mono text-white">{formatRupiah(totalZakat)}</div>
                <p className="text-[11px] text-slate-400">
                  Terkumpul otomatis dari alokasi Rp 500 per anggota per hari. Hanya admin yang dapat menyalurkannya.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
                <div className="text-xs font-bold uppercase text-teal-400">TOTAL TABUNGAN QURBAN TERKUMPUL</div>
                <div className="text-2xl font-black font-mono text-white">{formatRupiah(totalQurban)}</div>
                <p className="text-[11px] text-slate-400">
                  Terkumpul otomatis dari alokasi Rp 500 per anggota per hari untuk persiapan hewan qurban.
                </p>
              </div>
            </div>

            {/* Riwayat Penyaluran */}
            <div className="space-y-3 pt-3">
              <h4 className="font-bold text-white text-sm">Riwayat Penyaluran Zakat & Qurban</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Jenis</th>
                      <th className="py-2.5 px-3">Target Distribusi</th>
                      <th className="py-2.5 px-3">Keterangan</th>
                      <th className="py-2.5 px-3 text-right">Nominal</th>
                      <th className="py-2.5 px-3 text-center">Disalurkan Oleh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {state.transactions
                      .filter((t) => (t.kategori === 'ZAKAT' || t.kategori === 'QURBAN') && t.tipe === 'KELUAR')
                      .map((d) => (
                        <tr key={d.id} className="hover:bg-slate-800/30">
                          <td className="py-3 px-3 text-slate-300">{d.tanggal}</td>
                          <td className="py-3 px-3 font-sans font-bold text-emerald-400">
                            {d.kategori === 'ZAKAT' ? 'Zakat Fitrah' : 'Tabungan Qurban'}
                          </td>
                          <td className="py-3 px-3 font-sans text-slate-300">
                            {d.namaAnggota ? `Anggota (${d.namaAnggota})` : 'Penerima / Mustahik'}
                          </td>
                          <td className="py-3 px-3 font-sans text-slate-300">{d.rincian?.targetPenyaluran || d.keterangan}</td>
                          <td className="py-3 px-3 text-right font-bold text-white">{formatRupiah(d.nominal)}</td>
                          <td className="py-3 px-3 text-center font-sans text-slate-400">{d.verifiedBy || 'Pengurus'}</td>
                        </tr>
                      ))}
                    {state.transactions.filter((t) => (t.kategori === 'ZAKAT' || t.kategori === 'QURBAN') && t.tipe === 'KELUAR').length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 italic font-sans">
                          Belum ada penyaluran dana zakat atau qurban.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* View: SURAT MENYURAT (Point F.1) */}
        {!isDownloadOnly && activeNav === 'SURAT' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">Surat Menyurat & Edaran Resmi Koperasi HWS</h3>
                <p className="text-xs text-slate-400">
                  Kirim surat resmi langsung ke nomor WhatsApp dan Email anggota perorangan atau seluruh anggota (Point F.1)
                </p>
              </div>

              {canWrite && (
                <button
                  onClick={() => setShowLettersModal(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Terbitkan Surat Baru
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Nomor Surat</th>
                    <th className="py-2.5 px-3">Penerima</th>
                    <th className="py-2.5 px-3">Perihal</th>
                    <th className="py-2.5 px-3 text-center">Pengirim</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {state.letters.map((letter) => (
                    <tr key={letter.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 text-slate-300">{letter.tanggal}</td>
                      <td className="py-3 px-3 font-bold text-amber-400">{letter.nomorSurat}</td>
                      <td className="py-3 px-3 font-sans text-slate-200">
                        {letter.targetType === 'SEMUA' ? 'Seluruh Anggota' : (letter.targetMemberName || 'Anggota')}
                      </td>
                      <td className="py-3 px-3 font-sans text-white font-medium">{letter.perihal}</td>
                      <td className="py-3 px-3 text-center font-sans text-slate-400">{letter.senderName}</td>
                      <td className="py-3 px-3 text-center font-sans">
                        <button
                          onClick={() => {
                            setSelectedLetterForReport(letter);
                            setOfficialReportType('SURAT_RESMI');
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto"
                        >
                          <Printer className="w-3.5 h-3.5" /> Buka & Cetak PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                  {state.letters.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 italic font-sans">
                        Belum ada surat menyurat yang diterbitkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View: MENU SETTING (Point 2: Profile Koperasi, Log Audit, Cloud Server, Kelola Admin) */}
        {!isDownloadOnly && isSuperAdmin && (activeNav === 'SETTING' || activeNav === 'ADMINS' || activeNav === 'SERVER' || activeNav === 'LOGS') && (
          <SettingsView
            currentAdmin={currentAdmin}
            initialTab={
              activeNav === 'ADMINS' ? 'ADMINS' :
              activeNav === 'SERVER' ? 'SERVER' :
              activeNav === 'LOGS' ? 'LOGS' :
              settingSubTab
            }
            onPrintLogs={() => setOfficialReportType('LOG_HISTORI')}
            onAddAdmin={() => setShowAddAdminModal(true)}
            onEditAdmin={(adm) => setEditingAdminUser(adm)}
          />
        )}

        {/* View: CHAT ANGGOTA */}
        {!isDownloadOnly && activeNav === 'CHAT' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Pusat Komunikasi & Chat Anggota</h3>
              <p className="text-xs text-slate-400">
                Pesan tersimpan selama 20 hari dan dapat diunduh oleh admin (Point 14)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.members.map((m) => {
                const memberChats = state.chats.filter((c) => c.memberId === m.id);
                return (
                  <div key={m.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{m.nama}</div>
                      <div className="text-xs font-mono text-amber-400">{m.noAnggota} ({m.wilayah})</div>
                      <div className="text-[11px] text-slate-400 mt-2">
                        {memberChats.length > 0 ? (
                          <span>{memberChats.length} pesan dalam histori</span>
                        ) : (
                          <span className="italic text-slate-600">Belum ada percakapan</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900 flex gap-2">
                      <button
                        onClick={() => setChatTargetMemberId(m.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Buka Obrolan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* MODAL: Input Transaksi Buku Kas (Point 1: Bebas input nominal tanpa pilihan nilai) */}
      {showAddKasModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Input Transaksi Buku Kas</h3>
              <button onClick={() => setShowAddKasModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddKasKoperasi} className="space-y-3">
              {/* Pilihan Buku Kas */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Pilih Buku Kas Tujuan:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKasFormBuku('KAS_ANGGOTA')}
                    className={`py-2 rounded-lg font-bold border transition ${
                      kasFormBuku === 'KAS_ANGGOTA'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Buku Kas Anggota
                  </button>
                  <button
                    type="button"
                    onClick={() => setKasFormBuku('KAS_KOPERASI')}
                    className={`py-2 rounded-lg font-bold border transition ${
                      kasFormBuku === 'KAS_KOPERASI'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Buku Kas Koperasi
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tipe Mutasi:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKasFormTipe('MASUK')}
                    className={`py-2 rounded-lg font-bold border transition ${
                      kasFormTipe === 'MASUK'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Pemasukan (Masuk)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKasFormTipe('KELUAR')}
                    className={`py-2 rounded-lg font-bold border transition ${
                      kasFormTipe === 'KELUAR'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Pengeluaran (Keluar)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kategori Kas:</label>
                <select
                  value={kasFormKategori}
                  onChange={(e) => setKasFormKategori(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  {state.kasCategories
                    .filter((c) => c.tipe === kasFormTipe && (c.bukuKas === kasFormBuku || !c.bukuKas))
                    .map((c) => (
                      <option key={c.id} value={c.nama}>{c.nama}</option>
                    ))}
                  <option value="Operasional Umum">Operasional Umum</option>
                  <option value="Penyesuaian Saldo Kas">Penyesuaian Saldo Kas</option>
                  <option value="Lain-Lain">Lain-Lain</option>
                </select>
              </div>

              {/* Nominal: Bebas ketik tanpa pilihan nilai atau kelipatan (Point 1) */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nominal (Rp) *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={kasFormNominal}
                  onChange={(e) => setKasFormNominal(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Ketik nominal yang diinginkan (bebas tanpa preset)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  * Ketik nominal sesuai yang diinginkan secara langsung tanpa pilihan nilai tetap.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Keterangan Transaksi:</label>
                <input
                  type="text"
                  value={kasFormKeterangan}
                  onChange={(e) => setKasFormKeterangan(e.target.value)}
                  placeholder="Contoh: Pembelian ATK, iuran operasional, dll."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold transition shadow-md"
                >
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Kategori Kas Baru (Point C.7) */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Tambah Kategori Kas Baru (Point C.7)</h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Tipe Kategori:</label>
                <select
                  value={newCategoryType}
                  onChange={(e) => setNewCategoryType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="MASUK">Pemasukan</option>
                  <option value="KELUAR">Pengeluaran</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nama Kategori Baru:</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Contoh: Biaya Listrik & Air"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition"
                >
                  Simpan Kategori Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Transaksi Kas (Point C.9, C.11) */}
      {editingKasEntry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Edit Transaksi Kas (Point C.9, C.11)</h3>
              <button onClick={() => setEditingKasEntry(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  const res = appStore.updateKasEntry(
                    editingKasEntry.id,
                    {
                      keterangan: editingKasEntry.keterangan,
                      nominal: Number(editingKasEntry.nominal),
                      kategori: editingKasEntry.kategori,
                    },
                    currentAdmin
                  );
                  setEditingKasEntry(null);
                  if (res?.isPending) {
                    alert('Permohonan perubahan transaksi buku kas telah dikirim ke Super Admin & Admin Pembukuan untuk diverifikasi.');
                  } else {
                    alert('Transaksi kas berhasil diperbarui dan saldo otomatis disesuaikan.');
                  }
                } catch (err: any) {
                  alert(err.message || 'Gagal mengubah transaksi kas');
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-slate-400 mb-1">Nominal (Rp):</label>
                <input
                  type="number"
                  value={editingKasEntry.nominal}
                  onChange={(e) => setEditingKasEntry({ ...editingKasEntry, nominal: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Keterangan:</label>
                <input
                  type="text"
                  value={editingKasEntry.keterangan}
                  onChange={(e) => setEditingKasEntry({ ...editingKasEntry, keterangan: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <p className="text-[11px] text-amber-400">
                * Perubahan nominal akan secara otomatis menghitung ulang saldo berjalan seluruh transaksi berikutnya (Point C.11).
              </p>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition"
                >
                  Simpan Perubahan & Sesuaikan Saldo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Salurkan Zakat / Qurban */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Penyaluran Zakat Fitrah & Qurban</h3>
              <button onClick={() => setShowDisburseModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleExecuteDisburse} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Jenis Dana Yang Disalurkan:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDisburseJenis('ZAKAT');
                      setDisburseKeterangan('Penyaluran Zakat Fitrah Menjelang Idul Fitri');
                    }}
                    className={`py-2 rounded-lg font-bold border transition ${
                      disburseJenis === 'ZAKAT'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Zakat Fitrah ({formatRupiah(totalZakat)})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDisburseJenis('QURBAN');
                      setDisburseKeterangan('Penyaluran Tabungan Qurban Menjelang Idul Adha');
                    }}
                    className={`py-2 rounded-lg font-bold border transition ${
                      disburseJenis === 'QURBAN'
                        ? 'bg-teal-500/20 text-teal-400 border-teal-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Tabungan Qurban ({formatRupiah(totalQurban)})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Penyaluran:</label>
                <select
                  value={disburseTarget}
                  onChange={(e) => setDisburseTarget(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="ALL">Seluruh Anggota Koperasi</option>
                  <option value="WILAYAH">Berdasarkan Wilayah Tertentu</option>
                  <option value="INDIVIDUAL">Perorangan Anggota</option>
                </select>
              </div>

              {disburseTarget === 'WILAYAH' && (
                <div>
                  <label className="block text-slate-400 mb-1">Pilih Wilayah:</label>
                  <select
                    value={disburseWilayah}
                    onChange={(e) => setDisburseWilayah(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Cengkareng">Cengkareng</option>
                    <option value="Kalideres">Kalideres</option>
                    <option value="Kembangan">Kembangan</option>
                    <option value="Kebon Jeruk">Kebon Jeruk</option>
                  </select>
                </div>
              )}

              {disburseTarget === 'INDIVIDUAL' && (
                <div>
                  <label className="block text-slate-400 mb-1">Pilih Anggota:</label>
                  <select
                    value={disburseMemberId}
                    onChange={(e) => setDisburseMemberId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  >
                    <option value="">-- Pilih Anggota --</option>
                    {state.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama} - {m.noAnggota} ({m.wilayah})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Keterangan Penyaluran:</label>
                <input
                  type="text"
                  value={disburseKeterangan}
                  onChange={(e) => setDisburseKeterangan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition"
                >
                  Eksekusi Penyaluran Dana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Foto Struk Transfer Viewer (Point A.1) */}
      {viewingProofTx && (
        <ProofPreviewModal
          transaction={viewingProofTx}
          onClose={() => setViewingProofTx(null)}
          onApprove={(txId) => handleVerify(txId, true)}
          onReject={(txId) => handleVerify(txId, false)}
        />
      )}

      {/* MODAL: Surat Menyurat (Point F.1) */}
      {showLettersModal && (
        <LettersModal
          currentAdmin={currentAdmin}
          members={state.members}
          onClose={() => setShowLettersModal(false)}
          onPreviewLetter={(letter) => {
            setSelectedLetterForReport(letter);
            setOfficialReportType('SURAT_RESMI');
            setShowLettersModal(false);
          }}
        />
      )}

      {/* MODAL: Penyesuaian Saldo Langsung (Point F.2) */}
      {showDirectAdjustmentModal && (
        <DirectFundAdjustmentModal
          currentAdmin={currentAdmin}
          members={state.members}
          onClose={() => setShowDirectAdjustmentModal(false)}
        />
      )}

      {/* MODAL: Admin Profile / Tambah Admin (Point E.1, E.2) */}
      {(showAddAdminModal || editingAdminUser) && (
        <AdminProfileModal
          currentAdmin={currentAdmin}
          targetAdmin={editingAdminUser || undefined}
          isNew={showAddAdminModal}
          onClose={() => {
            setShowAddAdminModal(false);
            setEditingAdminUser(null);
          }}
        />
      )}

      {/* MODAL: KTA Digital Modal */}
      {inspectMemberKta && (
        <KtaDigitalModal
          member={inspectMemberKta}
          onClose={() => setInspectMemberKta(null)}
        />
      )}

      {/* DRAWER: Chat Anggota */}
      {chatTargetMemberId && (
        <ChatDrawer
          targetMemberId={chatTargetMemberId}
          currentAdmin={currentAdmin}
          onClose={() => setChatTargetMemberId(null)}
        />
      )}

      {/* MODAL: Edit Member (Point 4.12: Super Admin, Audit, Write) */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          currentAdmin={currentAdmin}
          onClose={() => setEditingMember(null)}
          onSuccess={() => setEditingMember(null)}
        />
      )}

      {/* MODAL: Profil Koperasi HWS (Point 4.14: Super Admin) */}
      {showKoperasiProfileModal && (
        <KoperasiProfileModal
          currentAdmin={currentAdmin}
          onClose={() => setShowKoperasiProfileModal(false)}
        />
      )}

    </div>
  );
};
