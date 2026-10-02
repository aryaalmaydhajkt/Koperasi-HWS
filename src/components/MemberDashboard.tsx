import React, { useState } from 'react';
import { MemberUser } from '../types';
import { appStore } from '../data/store';
import { HwsLogo } from './HwsLogo';
import { formatRupiah, formatNumberId } from '../utils/exportUtils';
import { 
  Lock, 
  LogOut, 
  MessageSquare, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BadgeCheck,
  User,
  ExternalLink,
  Settings
} from 'lucide-react';
import { SetorModal } from './SetorModal';
import { TarikModal } from './TarikModal';
import { ChatDrawer } from './ChatDrawer';
import { KtaDigitalModal } from './KtaDigitalModal';
import { MutasiPrintView } from './MutasiPrintView';
import { MemberSettingsModal } from './MemberSettingsModal';
import { PWAInstallButton } from './PWAInstallButton';

interface MemberDashboardProps {
  member: MemberUser;
  onLogout: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({ member, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'RINGKASAN' | 'SETOR' | 'TARIK' | 'MUTASI'>('RINGKASAN');
  const [showSetorModal, setShowSetorModal] = useState(false);
  const [showTarikModal, setShowTarikModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showKtaModal, setShowKtaModal] = useState(false);
  const [showMutasiPrint, setShowMutasiPrint] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mutasiFilter, setMutasiFilter] = useState<'SEMUA' | 'POKOK' | 'UMUM'>('SEMUA');
  const [periodeFilter, setPeriodeFilter] = useState<string>('September 2026');

  const state = appStore.getState();
  const currentMember = state.members.find((m) => m.id === member.id) || member;

  // Member transactions
  const myTransactions = state.transactions
    .filter((t) => t.memberId === currentMember.id)
    .sort((a, b) => {
      // Sort for recent display
      return b.id.localeCompare(a.id);
    });

  // Unread chats
  const unreadChats = state.chats.filter(
    (c) => c.memberId === currentMember.id && c.sender === 'ADMIN' && !c.isRead
  ).length;

  if (showMutasiPrint) {
    return (
      <MutasiPrintView
        member={currentMember}
        transactions={myTransactions}
        periodeLabel={periodeFilter}
        filterKategori={mutasiFilter}
        onBack={() => setShowMutasiPrint(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation Bar (Matches dashboard pada anggota.png) */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <HwsLogo size={40} className="w-10 h-10" />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-wide">
                KOPERASI HWS
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 rounded">
                ANGGOTA
              </span>
            </div>
            <span className="hidden sm:inline text-xs text-slate-400 border-l border-slate-700 pl-3">
              {currentMember.nama} • {currentMember.wilayah}
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <PWAInstallButton variant="header" />

            <button
              onClick={() => setShowChatDrawer(true)}
              className="relative p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              title="Chat Admin Koperasi"
            >
              <MessageSquare className="w-5 h-5 text-blue-400" />
              {unreadChats > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadChats}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              title="Pengaturan Profil & Password"
            >
              <Settings className="w-5 h-5 text-amber-400" />
            </button>

            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        
        {/* Banner with 4 Balances (Matches dashboard pada anggota.png) */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
            <HwsLogo size={180} className="w-48 h-48" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            
            {/* Card 1: Tabungan Pokok */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 backdrop-blur-xs">
              <div className="text-xs text-slate-400 font-medium">
                Tabungan Pokok (Rp1.000/hr)
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {formatRupiah(currentMember.saldoPokok)}
              </div>
              <div className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3" /> Lock Admin
              </div>
            </div>

            {/* Card 2: Zakat Fitrah */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 backdrop-blur-xs">
              <div className="text-xs text-slate-400 font-medium">
                Zakat Fitrah (Rp500/hr)
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {formatRupiah(currentMember.saldoZakat)}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                Dikelola Pengurus
              </div>
            </div>

            {/* Card 3: Tabungan Qurban */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 backdrop-blur-xs">
              <div className="text-xs text-slate-400 font-medium">
                Tabungan Qurban (Rp500/hr)
              </div>
              <div className="text-xl font-bold font-mono text-teal-400 mt-1">
                {formatRupiah(currentMember.saldoQurban)}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                Dikelola Pengurus
              </div>
            </div>

            {/* Card 4: Tabungan Umum */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 backdrop-blur-xs">
              <div className="text-xs text-slate-400 font-medium">
                Tabungan Umum
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {formatRupiah(currentMember.saldoUmum)}
              </div>
              <div className="text-[11px] text-blue-400 font-medium mt-1">
                Bebas Setor & Tarik
              </div>
            </div>

          </div>
        </div>

        {/* Interactive Segmented Tabs (Matches dashboard pada anggota.png) */}
        <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('RINGKASAN')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition text-center ${
              activeTab === 'RINGKASAN'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ringkasan
          </button>
          
          <button
            onClick={() => {
              setActiveTab('SETOR');
              setShowSetorModal(true);
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'SETOR'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Setor
          </button>

          <button
            onClick={() => {
              setActiveTab('TARIK');
              setShowTarikModal(true);
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'TARIK'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" /> Tarik
          </button>

          <button
            onClick={() => {
              setActiveTab('MUTASI');
              setShowMutasiPrint(true);
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'MUTASI'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" /> Mutasi PDF
          </button>
        </div>

        {/* Member Profile Card (Matches dashboard pada anggota.png) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-amber-500 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl font-bold text-amber-400">
                  {currentMember.nama.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                  {currentMember.nama}
                </h2>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  No. Anggota: <span className="text-slate-200">{currentMember.noAnggota}</span>
                </div>
                <div className="text-xs font-semibold text-blue-400 mt-0.5">
                  Wilayah {currentMember.wilayah}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
              >
                <Settings className="w-4 h-4 text-amber-400" /> Pengaturan
              </button>

              <button
                onClick={() => setShowKtaModal(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition"
              >
                <BadgeCheck className="w-4 h-4" /> KTA Digital
              </button>

              <button
                onClick={() => setShowMutasiPrint(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition"
              >
                <FileText className="w-4 h-4" /> Cetak Mutasi
              </button>
            </div>
          </div>

          {/* Account Details Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-sans">REKENING KOPERASI</div>
              <div className="font-bold text-amber-400 text-sm mt-0.5">
                {currentMember.noRekKoperasi}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase font-sans">BANK ANGGOTA</div>
              <div className="font-semibold text-white truncate mt-0.5">
                {currentMember.bankAnggota}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase font-sans">NO. REK BANK</div>
              <div className="font-semibold text-slate-300 mt-0.5">
                {currentMember.noRekBank}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase font-sans">TANGGAL BERGABUNG</div>
              <div className="font-semibold text-slate-300 mt-0.5">
                {currentMember.tanggalBergabung}
              </div>
            </div>
          </div>
        </div>

        {/* Riwayat Mutasi Terakhir (Matches dashboard pada anggota.png) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Riwayat Mutasi Terakhir
            </h3>
            <button
              onClick={() => setShowMutasiPrint(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition"
            >
              Lihat Selengkapnya & Unduh PDF →
            </button>
          </div>

          <div className="space-y-3">
            {myTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>Belum ada riwayat transaksi.</p>
                <p className="text-[10px] text-slate-600 mt-1">
                  Gunakan tombol "Setor" untuk melakukan setoran tabungan kewajiban atau tabungan umum.
                </p>
              </div>
            ) : (
              myTransactions.slice(0, 10).map((tx) => (
                <div
                  key={tx.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded ${
                          tx.status === 'TERVERIFIKASI'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : tx.status === 'MENUNGGU_VERIFIKASI'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tx.status === 'TERVERIFIKASI'
                          ? 'Terverifikasi'
                          : tx.status === 'MENUNGGU_VERIFIKASI'
                          ? 'Menunggu Verifikasi Admin'
                          : 'Ditolak'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {tx.tanggal}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white">
                      {tx.keterangan}
                    </div>

                    {tx.rincian?.targetPenyaluran && (
                      <div className="text-[11px] text-slate-400">
                        {tx.rincian.targetPenyaluran}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-black font-mono ${
                        tx.tipe === 'MASUK' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.tipe === 'MASUK' ? '+' : '-'} {formatNumberId(tx.nominal)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">
                      {tx.kategori === 'GABUNGAN_KEWAJIBAN' || tx.kategori === 'POKOK'
                        ? 'TAB. KEWAJIBAN'
                        : tx.kategori === 'UMUM'
                        ? 'TAB. UMUM'
                        : `PENYALURAN ${tx.kategori}`}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* Floating Chat Admin Button (Matches dashboard pada anggota.png) */}
      <button
        onClick={() => setShowChatDrawer(true)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-blue-400/40 transition transform hover:scale-105 active:scale-95"
      >
        <MessageSquare className="w-5 h-5" />
        <span>Chat Admin HWS</span>
        {unreadChats > 0 && (
          <span className="w-5 h-5 bg-amber-400 text-slate-950 rounded-full font-black text-[10px] flex items-center justify-center">
            {unreadChats}
          </span>
        )}
      </button>

      {/* Modals */}
      {showSetorModal && (
        <SetorModal
          member={currentMember}
          onClose={() => setShowSetorModal(false)}
          onSuccess={() => setActiveTab('RINGKASAN')}
        />
      )}

      {showTarikModal && (
        <TarikModal
          member={currentMember}
          onClose={() => setShowTarikModal(false)}
          onSuccess={() => setActiveTab('RINGKASAN')}
        />
      )}

      {showChatDrawer && (
        <ChatDrawer
          currentMember={currentMember}
          onClose={() => setShowChatDrawer(false)}
        />
      )}

      {showKtaModal && (
        <KtaDigitalModal
          member={currentMember}
          onClose={() => setShowKtaModal(false)}
        />
      )}

      {showSettingsModal && (
        <MemberSettingsModal
          member={currentMember}
          onClose={() => setShowSettingsModal(false)}
          onUpdated={() => {}}
        />
      )}

    </div>
  );
};
