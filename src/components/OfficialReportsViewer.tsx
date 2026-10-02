import React, { useState } from 'react';
import { 
  MemberUser, 
  MemberTransaction, 
  BukuKasEntry, 
  SystemLog, 
  ZakatQurbanDisbursement,
  OfficialLetter,
  WilayahJakarta
} from '../types';
import { HwsLogo } from './HwsLogo';
import { ReportLetterheadWatermark } from './ReportLetterheadWatermark';
import { 
  formatRupiah, 
  formatNumberId, 
  exportAnggotaToExcel, 
  exportKasToExcel, 
  exportLabaRugiToExcel, 
  exportNeracaToExcel,
  exportTransaksiToExcel
} from '../utils/exportUtils';
import { 
  Printer, 
  ArrowLeft, 
  Download, 
  Calendar, 
  Filter, 
  FileText, 
  ShieldCheck, 
  Building2, 
  Users, 
  HeartHandshake 
} from 'lucide-react';

export type ReportType = 
  | 'REKAP_ANGGOTA' 
  | 'BUKU_KAS' 
  | 'LABA_RUGI_NERACA' 
  | 'ZAKAT_QURBAN' 
  | 'RIWAYAT_TRANSAKSI' 
  | 'LOG_HISTORI'
  | 'SURAT_RESMI';

interface OfficialReportsViewerProps {
  reportType: ReportType;
  members: MemberUser[];
  kasEntries: BukuKasEntry[];
  transactions: MemberTransaction[];
  disbursements: ZakatQurbanDisbursement[];
  logs: SystemLog[];
  selectedLetter?: OfficialLetter | null;
  onBack: () => void;
  canViewLogs?: boolean; // Super Admin only
}

export const OfficialReportsViewer: React.FC<OfficialReportsViewerProps> = ({
  reportType,
  members,
  kasEntries,
  transactions,
  disbursements,
  logs,
  selectedLetter,
  onBack,
  canViewLogs = false
}) => {
  // Date period state
  const [periodeType, setPeriodeType] = useState<'SEMUA' | 'HARIAN' | 'BULANAN' | 'TAHUNAN' | 'CUSTOM'>('SEMUA');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Additional sub-filters
  const [selectedWilayah, setSelectedWilayah] = useState<string>('SEMUA');
  const [selectedBukuKas, setSelectedBukuKas] = useState<'GABUNGAN' | 'KAS_ANGGOTA' | 'KAS_KOPERASI'>('GABUNGAN');
  const [selectedTxType, setSelectedTxType] = useState<'SEMUA' | 'MASUK' | 'KELUAR'>('SEMUA');

  // Filter helper by date string (formats: YYYY-MM-DD or DD/MM/YYYY)
  const isDateInFilter = (dateStr: string) => {
    if (periodeType === 'SEMUA') return true;
    
    // Normalize to YYYY-MM-DD
    let normalized = dateStr;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        normalized = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    if (periodeType === 'HARIAN') {
      return normalized === selectedDate;
    }
    if (periodeType === 'BULANAN') {
      return normalized.startsWith(selectedMonth);
    }
    if (periodeType === 'TAHUNAN') {
      return normalized.startsWith(selectedYear);
    }
    if (periodeType === 'CUSTOM') {
      if (dateFrom && normalized < dateFrom) return false;
      if (dateTo && normalized > dateTo) return false;
      return true;
    }
    return true;
  };

  // Periode label for report metadata
  const getPeriodeLabel = () => {
    if (periodeType === 'HARIAN') return `Harian (${selectedDate})`;
    if (periodeType === 'BULANAN') return `Bulanan (${selectedMonth})`;
    if (periodeType === 'TAHUNAN') return `Tahunan (${selectedYear})`;
    if (periodeType === 'CUSTOM') return `Periode ${dateFrom || 'Awal'} s/d ${dateTo || 'Sekarang'}`;
    return 'Seluruh Periode Berjalan';
  };

  const periodeLabel = getPeriodeLabel();

  // Print trigger
  const handlePrint = () => {
    window.print();
  };

  // 1. Filtered Members
  const filteredMembers = members.filter((m) => {
    const matchWilayah = selectedWilayah === 'SEMUA' || m.wilayah === selectedWilayah;
    const matchDate = isDateInFilter(m.tanggalBergabung);
    return matchWilayah && matchDate;
  });

  // 2. Filtered Kas
  const filteredKas = kasEntries.filter((k) => {
    if (selectedBukuKas === 'KAS_ANGGOTA' && k.bukuKas !== 'KAS_ANGGOTA') return false;
    if (selectedBukuKas === 'KAS_KOPERASI' && k.bukuKas !== 'KAS_KOPERASI') return false;
    return isDateInFilter(k.tanggal);
  });

  // 3. Filtered Transactions
  const filteredTxs = transactions.filter((t) => {
    if (selectedTxType === 'MASUK' && t.tipe !== 'MASUK') return false;
    if (selectedTxType === 'KELUAR' && t.tipe !== 'KELUAR') return false;
    return isDateInFilter(t.tanggal);
  });

  // 4. Filtered Disbursements
  const filteredDisbursements = disbursements.filter((d) => isDateInFilter(d.tanggal));

  // 5. Filtered Logs
  const filteredLogs = logs.filter((l) => isDateInFilter(l.timestamp));

  // Profit/Loss & Balance Sheet Calculations
  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};
  let totalIncome = 0;
  let totalExpense = 0;

  filteredKas.forEach((entry) => {
    if (entry.tipe === 'MASUK') {
      incomeByCategory[entry.kategori] = (incomeByCategory[entry.kategori] || 0) + entry.nominal;
      totalIncome += entry.nominal;
    } else {
      expenseByCategory[entry.kategori] = (expenseByCategory[entry.kategori] || 0) + entry.nominal;
      totalExpense += entry.nominal;
    }
  });

  const netSurplus = totalIncome - totalExpense;

  // Balance sheet values
  const kasAnggotaVal = kasEntries
    .filter((k) => k.bukuKas === 'KAS_ANGGOTA')
    .reduce((acc, curr) => (curr.tipe === 'MASUK' ? acc + curr.nominal : acc - curr.nominal), 0);
  
  const kasKoperasiVal = kasEntries
    .filter((k) => k.bukuKas === 'KAS_KOPERASI')
    .reduce((acc, curr) => (curr.tipe === 'MASUK' ? acc + curr.nominal : acc - curr.nominal), 0);

  const totalSimpananPokok = members.reduce((sum, m) => sum + m.saldoPokok, 0);
  const totalTabunganUmum = members.reduce((sum, m) => sum + m.saldoUmum, 0);
  const totalZakatFitrah = members.reduce((sum, m) => sum + m.saldoZakat, 0);
  const totalTabunganQurban = members.reduce((sum, m) => sum + m.saldoQurban, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-6 px-3 print:p-0 print:bg-white print:text-black">
      
      {/* Top Filter and Actions Bar (Hidden on print) */}
      <div className="max-w-[950px] mx-auto mb-6 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Laporan Resmi Koperasi HWS
              </h2>
              <p className="text-[11px] text-slate-400">
                Dilengkapi Kop Resmi, Watermark Anti-Pemalsuan, format PDF & Excel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Excel export buttons based on report type */}
            {reportType === 'REKAP_ANGGOTA' && (
              <button
                onClick={() => exportAnggotaToExcel(filteredMembers, selectedWilayah, periodeLabel)}
                className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Export Excel
              </button>
            )}

            {reportType === 'BUKU_KAS' && (
              <button
                onClick={() => exportKasToExcel(filteredKas, selectedBukuKas, periodeLabel)}
                className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Export Excel
              </button>
            )}

            {reportType === 'LABA_RUGI_NERACA' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => exportLabaRugiToExcel(incomeByCategory, expenseByCategory, totalIncome, totalExpense, netSurplus, periodeLabel)}
                  className="px-2.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition"
                >
                  Laba Rugi (Excel)
                </button>
                <button
                  onClick={() => exportNeracaToExcel(kasAnggotaVal, kasKoperasiVal, totalSimpananPokok, totalTabunganUmum, totalZakatFitrah, totalTabunganQurban, kasKoperasiVal, periodeLabel)}
                  className="px-2.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition"
                >
                  Neraca (Excel)
                </button>
              </div>
            )}

            {reportType === 'RIWAYAT_TRANSAKSI' && (
              <button
                onClick={() => exportTransaksiToExcel(filteredTxs, periodeLabel)}
                className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Export Excel
              </button>
            )}

            {/* Print / Save PDF Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Cetak / Simpan PDF
            </button>
          </div>
        </div>

        {/* Date Filter Toolbar (Harian, Bulanan, Tahunan, Custom) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Periode Penarikan:</label>
            <select
              value={periodeType}
              onChange={(e) => setPeriodeType(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400"
            >
              <option value="SEMUA">Semua Data</option>
              <option value="HARIAN">Harian (Pilih Tanggal)</option>
              <option value="BULANAN">Bulanan</option>
              <option value="TAHUNAN">Tahunan</option>
              <option value="CUSTOM">Rentang Tanggal (Dari - Sampai)</option>
            </select>
          </div>

          {periodeType === 'HARIAN' && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Pilih Tanggal:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {periodeType === 'BULANAN' && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Pilih Bulan:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {periodeType === 'TAHUNAN' && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Pilih Tahun:</label>
              <input
                type="number"
                min="2020"
                max="2035"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {periodeType === 'CUSTOM' && (
            <>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Dari Tanggal:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Sampai Tanggal:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </>
          )}

          {/* Subfilter per report type */}
          {reportType === 'REKAP_ANGGOTA' && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Filter Wilayah:</label>
              <select
                value={selectedWilayah}
                onChange={(e) => setSelectedWilayah(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="SEMUA">Semua Wilayah</option>
                <option value="Cengkareng">Cengkareng</option>
                <option value="Kalideres">Kalideres</option>
                <option value="Kembangan">Kembangan</option>
                <option value="Kebon Jeruk">Kebon Jeruk</option>
              </select>
            </div>
          )}

          {reportType === 'BUKU_KAS' && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Pilih Buku Kas:</label>
              <select
                value={selectedBukuKas}
                onChange={(e) => setSelectedBukuKas(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="GABUNGAN">Konsolidasi (Gabungan Kas)</option>
                <option value="KAS_ANGGOTA">Buku Kas Anggota</option>
                <option value="KAS_KOPERASI">Buku Kas Koperasi</option>
              </select>
            </div>
          )}

          {reportType === 'RIWAYAT_TRANSAKSI' && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Tipe Transaksi:</label>
              <select
                value={selectedTxType}
                onChange={(e) => setSelectedTxType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="SEMUA">Semua (Setor & Tarik)</option>
                <option value="MASUK">Setoran Sahaja</option>
                <option value="KELUAR">Penarikan Sahaja</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Official Printable Statement Sheet (PDF Canvas with Authentic Letterhead and Tiled Anti-Counterfeit Watermark) */}
      <div className="max-w-[950px] mx-auto bg-white text-slate-900 shadow-2xl rounded-sm p-8 print:p-4 print:shadow-none print:m-0 font-sans relative border border-slate-300">
        
        {/* Anti-Counterfeit Watermark Background & Letterhead */}
        {reportType === 'REKAP_ANGGOTA' && (
          <ReportLetterheadWatermark
            title="REKAPITULASI DATA ANGGOTA KOPERASI"
            subtitle={`Wilayah: ${selectedWilayah} | Status: Aktif & Terverifikasi`}
            periodeInfo={periodeLabel}
            documentNumber={`HWS/ANG/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`}
          />
        )}

        {reportType === 'BUKU_KAS' && (
          <ReportLetterheadWatermark
            title={`LAPORAN BUKU KAS: ${selectedBukuKas === 'GABUNGAN' ? 'KONSOLIDASI' : selectedBukuKas}`}
            subtitle="Pencatatan Keluar Masuk Arus Kas Koperasi & Anggota"
            periodeInfo={periodeLabel}
            documentNumber={`HWS/KAS/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`}
          />
        )}

        {reportType === 'LABA_RUGI_NERACA' && (
          <ReportLetterheadWatermark
            title="LAPORAN LABA RUGI & NERACA KEUANGAN"
            subtitle="Rekapitulasi Kategori Keuangan & Posisi Aset Koperasi"
            periodeInfo={periodeLabel}
            documentNumber={`HWS/FIN/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`}
          />
        )}

        {reportType === 'ZAKAT_QURBAN' && (
          <ReportLetterheadWatermark
            title="LAPORAN PENYALURAN DANA ZAKAT FITRAH & TABUNGAN QURBAN"
            subtitle="Laporan Akuntabilitas Titipan Dana Ibadah Anggota"
            periodeInfo={periodeLabel}
            documentNumber={`HWS/ZIS/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`}
          />
        )}

        {reportType === 'RIWAYAT_TRANSAKSI' && (
          <ReportLetterheadWatermark
            title="LAPORAN RIWAYAT TRANSAKSI SETORAN & PENARIKAN"
            subtitle="Arus Mutasi Setoran Harian Kewajiban, Tabungan Umum & Tarikan"
            periodeInfo={periodeLabel}
            documentNumber={`HWS/TX/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`}
          />
        )}

        {reportType === 'LOG_HISTORI' && (
          <ReportLetterheadWatermark
            title="LOG AUDIT HISTORI AKTIVITAS ADMIN (SUPER ADMIN ONLY)"
            subtitle="Rekam Jejak Keamanan Sistem & Perubahan Transaksi"
            periodeInfo={periodeLabel}
            documentNumber={`HWS/AUDIT/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`}
          />
        )}

        {reportType === 'SURAT_RESMI' && (
          <ReportLetterheadWatermark
            title="SURAT EDARAN RESMI KOPERASI HWS"
            subtitle="Himpunan Wirausaha Sejahtera"
            periodeInfo={periodeLabel}
            documentNumber={selectedLetter?.nomorSurat || `HWS/SE/${new Date().getFullYear()}/001`}
          />
        )}

        {/* 1. Content: REKAP ANGGOTA */}
        {reportType === 'REKAP_ANGGOTA' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2 px-2 border-r border-slate-300 text-center">No</th>
                    <th className="py-2 px-2 border-r border-slate-300">No. Anggota / Rekening</th>
                    <th className="py-2 px-2 border-r border-slate-300">Nama & Alamat Lengkap</th>
                    <th className="py-2 px-2 border-r border-slate-300">Wilayah</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right">Pokok</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right">Zakat</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right">Qurban</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right">Umum</th>
                    <th className="py-2 px-2 text-right">Total Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMembers.map((m, idx) => {
                    const totalSaldo = m.saldoPokok + m.saldoZakat + m.saldoQurban + m.saldoUmum;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 font-mono">
                          <div className="font-bold text-slate-900">{m.noAnggota}</div>
                          <div className="text-[10px] text-slate-600">Rek: {m.noRekKoperasi}</div>
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-300">
                          <div className="font-bold text-slate-900">{m.nama}</div>
                          <div className="text-[10px] text-slate-600 leading-tight">
                            {m.rtRw ? `${m.rtRw}, ` : ''}{m.kelurahan ? `${m.kelurahan}, ` : ''}{m.wilayah}, {m.kota || 'Jakarta'} {m.kodePos || ''}
                          </div>
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-slate-800">{m.wilayah}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-right font-mono">{formatNumberId(m.saldoPokok)}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-right font-mono">{formatNumberId(m.saldoZakat)}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-right font-mono">{formatNumberId(m.saldoQurban)}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-right font-mono">{formatNumberId(m.saldoUmum)}</td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">{formatNumberId(totalSaldo)}</td>
                      </tr>
                    );
                  })}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-slate-500 italic">
                        Tidak ada data anggota sesuai filter yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td colSpan={4} className="py-2 px-2 text-center uppercase">Total Keseluruhan ({filteredMembers.length} Anggota)</td>
                    <td className="py-2 px-2 text-right font-mono">{formatNumberId(filteredMembers.reduce((s, m) => s + m.saldoPokok, 0))}</td>
                    <td className="py-2 px-2 text-right font-mono">{formatNumberId(filteredMembers.reduce((s, m) => s + m.saldoZakat, 0))}</td>
                    <td className="py-2 px-2 text-right font-mono">{formatNumberId(filteredMembers.reduce((s, m) => s + m.saldoQurban, 0))}</td>
                    <td className="py-2 px-2 text-right font-mono">{formatNumberId(filteredMembers.reduce((s, m) => s + m.saldoUmum, 0))}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                      {formatNumberId(filteredMembers.reduce((s, m) => s + m.saldoPokok + m.saldoZakat + m.saldoQurban + m.saldoUmum, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 2. Content: BUKU KAS */}
        {reportType === 'BUKU_KAS' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2 px-2 border-r border-slate-300 text-center">No</th>
                    <th className="py-2 px-2 border-r border-slate-300">Tanggal</th>
                    <th className="py-2 px-2 border-r border-slate-300">Buku Kas</th>
                    <th className="py-2 px-2 border-r border-slate-300">Tipe & Kategori</th>
                    <th className="py-2 px-2 border-r border-slate-300">Keterangan</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right">Nominal (Rp)</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right">Saldo Setelah (Rp)</th>
                    <th className="py-2 px-2 text-center">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredKas.map((k, idx) => (
                    <tr key={k.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="py-1.5 px-2 border-r border-slate-300 font-mono text-slate-800">{k.tanggal}</td>
                      <td className="py-1.5 px-2 border-r border-slate-300 text-slate-700 font-semibold">
                        {k.bukuKas === 'KAS_ANGGOTA' ? 'Kas Anggota' : 'Kas Koperasi'}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-300">
                        <span className={`font-bold mr-1 ${k.tipe === 'MASUK' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          [{k.tipe}]
                        </span>
                        <span className="text-slate-800">{k.kategori}</span>
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-300 text-slate-800">{k.keterangan}</td>
                      <td className={`py-1.5 px-2 border-r border-slate-300 text-right font-mono font-bold ${k.tipe === 'MASUK' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatNumberId(k.nominal)}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-300 text-right font-mono font-bold text-slate-900">
                        {formatNumberId(k.saldoSetelah)}
                      </td>
                      <td className="py-1.5 px-2 text-center text-[10px] text-slate-600">{k.createdBy}</td>
                    </tr>
                  ))}
                  {filteredKas.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500 italic">
                        Tidak ada transaksi kas dalam periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Content: LABA RUGI & NERACA */}
        {reportType === 'LABA_RUGI_NERACA' && (
          <div className="space-y-6">
            
            {/* Bagian I: Laporan Laba Rugi */}
            <div className="border border-slate-300 p-4 rounded-sm">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-300 pb-2 mb-3 uppercase tracking-wide">
                I. Laporan Laba Rugi / Sisa Hasil Usaha (SHU)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pemasukan */}
                <div>
                  <div className="font-bold text-xs text-emerald-800 bg-emerald-50 p-2 border-b border-emerald-200">
                    A. PENDAPATAN & PENERIMAAN KAS
                  </div>
                  <table className="w-full text-xs mt-1">
                    <tbody>
                      {Object.entries(incomeByCategory).map(([cat, val]) => (
                        <tr key={cat} className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-700">{cat}</td>
                          <td className="py-1.5 text-right font-mono font-semibold text-slate-900">{formatRupiah(val)}</td>
                        </tr>
                      ))}
                      {Object.keys(incomeByCategory).length === 0 && (
                        <tr>
                          <td colSpan={2} className="py-3 text-center text-slate-400 italic">Belum ada pemasukan</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold bg-slate-50">
                        <td className="py-2 text-slate-900">TOTAL PENDAPATAN</td>
                        <td className="py-2 text-right font-mono text-emerald-700">{formatRupiah(totalIncome)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Pengeluaran */}
                <div>
                  <div className="font-bold text-xs text-rose-800 bg-rose-50 p-2 border-b border-rose-200">
                    B. BEBAN & BIAYA OPERASIONAL
                  </div>
                  <table className="w-full text-xs mt-1">
                    <tbody>
                      {Object.entries(expenseByCategory).map(([cat, val]) => (
                        <tr key={cat} className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-700">{cat}</td>
                          <td className="py-1.5 text-right font-mono font-semibold text-slate-900">{formatRupiah(val)}</td>
                        </tr>
                      ))}
                      {Object.keys(expenseByCategory).length === 0 && (
                        <tr>
                          <td colSpan={2} className="py-3 text-center text-slate-400 italic">Belum ada beban pengeluaran</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold bg-slate-50">
                        <td className="py-2 text-slate-900">TOTAL BEBAN</td>
                        <td className="py-2 text-right font-mono text-rose-700">{formatRupiah(totalExpense)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-slate-400 flex justify-between items-center bg-slate-100 p-3 rounded">
                <span className="font-black text-xs text-slate-900 uppercase">
                  SURPLUS / (DEFISIT) BERSIH OPERASIONAL
                </span>
                <span className={`font-mono text-sm font-black ${netSurplus >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatRupiah(netSurplus)}
                </span>
              </div>
            </div>

            {/* Bagian II: Neraca Keuangan */}
            <div className="border border-slate-300 p-4 rounded-sm">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-300 pb-2 mb-3 uppercase tracking-wide">
                II. Laporan Posisi Keuangan (Neraca)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Aktiva */}
                <div>
                  <div className="font-bold text-xs text-blue-900 bg-blue-50 p-2 border-b border-blue-200">
                    AKTIVA / ASET
                  </div>
                  <table className="w-full text-xs mt-1">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2 text-slate-700">Kas Anggota (Bank Koperasi)</td>
                        <td className="py-2 text-right font-mono font-semibold">{formatRupiah(kasAnggotaVal)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700">Kas Operasional Koperasi</td>
                        <td className="py-2 text-right font-mono font-semibold">{formatRupiah(kasKoperasiVal)}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="font-bold bg-slate-100 border-t border-slate-300">
                        <td className="py-2 text-slate-900">TOTAL AKTIVA (ASET)</td>
                        <td className="py-2 text-right font-mono font-black text-blue-900">
                          {formatRupiah(kasAnggotaVal + kasKoperasiVal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Pasiva */}
                <div>
                  <div className="font-bold text-xs text-slate-900 bg-slate-100 p-2 border-b border-slate-200">
                    PASIVA (KEWAJIBAN & EKUITAS)
                  </div>
                  <table className="w-full text-xs mt-1">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-1.5 text-slate-700">Simpanan Pokok Anggota</td>
                        <td className="py-1.5 text-right font-mono font-semibold">{formatRupiah(totalSimpananPokok)}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Tabungan Umum Anggota</td>
                        <td className="py-1.5 text-right font-mono font-semibold">{formatRupiah(totalTabunganUmum)}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Dana Titipan Zakat Fitrah</td>
                        <td className="py-1.5 text-right font-mono font-semibold">{formatRupiah(totalZakatFitrah)}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Dana Titipan Qurban</td>
                        <td className="py-1.5 text-right font-mono font-semibold">{formatRupiah(totalTabunganQurban)}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-700">Modal Cadangan Kas Koperasi</td>
                        <td className="py-1.5 text-right font-mono font-semibold">{formatRupiah(kasKoperasiVal)}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="font-bold bg-slate-100 border-t border-slate-300">
                        <td className="py-2 text-slate-900">TOTAL PASIVA</td>
                        <td className="py-2 text-right font-mono font-black text-slate-900">
                          {formatRupiah(totalSimpananPokok + totalTabunganUmum + totalZakatFitrah + totalTabunganQurban + kasKoperasiVal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 4. Content: ZAKAT & QURBAN */}
        {reportType === 'ZAKAT_QURBAN' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded">
                <div className="text-[11px] text-emerald-800 font-bold uppercase">Saldo Terkumpul Zakat Fitrah</div>
                <div className="text-lg font-black font-mono text-emerald-900">{formatRupiah(totalZakatFitrah)}</div>
              </div>
              <div className="bg-teal-50 border border-teal-200 p-3 rounded">
                <div className="text-[11px] text-teal-800 font-bold uppercase">Saldo Terkumpul Tabungan Qurban</div>
                <div className="text-lg font-black font-mono text-teal-900">{formatRupiah(totalTabunganQurban)}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2 px-2 border-r border-slate-300 text-center">No</th>
                    <th className="py-2 px-2 border-r border-slate-300">Tanggal Penyaluran</th>
                    <th className="py-2 px-2 border-r border-slate-300">Jenis Dana</th>
                    <th className="py-2 px-2 border-r border-slate-300">Target Distribusi</th>
                    <th className="py-2 px-2 border-r border-slate-300">Keterangan / Penerima</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right">Nominal (Rp)</th>
                    <th className="py-2 px-2 text-center">Disetujui Oleh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDisbursements.map((d, idx) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="py-2 px-2 border-r border-slate-300 font-mono text-slate-800">{d.tanggal}</td>
                      <td className="py-2 px-2 border-r border-slate-300 font-bold text-emerald-800">
                        {d.jenis === 'ZAKAT' ? 'Zakat Fitrah' : 'Tabungan Qurban'}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-300 text-slate-800">
                        {d.target === 'ALL' && 'Seluruh Anggota'}
                        {d.target === 'WILAYAH' && `Wilayah ${d.wilayah}`}
                        {d.target === 'INDIVIDUAL' && `Perorangan (${d.namaAnggota})`}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-300 text-slate-800">{d.keteranganPenyaluran}</td>
                      <td className="py-2 px-2 border-r border-slate-300 text-right font-mono font-bold text-slate-900">
                        {formatNumberId(d.totalDana)}
                      </td>
                      <td className="py-2 px-2 text-center text-[10px] text-slate-700 font-semibold">{d.disbursedBy}</td>
                    </tr>
                  ))}
                  {filteredDisbursements.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500 italic">
                        Belum ada riwayat penyaluran zakat dan qurban pada periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Content: RIWAYAT TRANSAKSI */}
        {reportType === 'RIWAYAT_TRANSAKSI' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2 px-2 border-r border-slate-300 text-center">No</th>
                    <th className="py-2 px-2 border-r border-slate-300">Tanggal</th>
                    <th className="py-2 px-2 border-r border-slate-300">Nama & No. Rekening</th>
                    <th className="py-2 px-2 border-r border-slate-300">Tipe / Kategori</th>
                    <th className="py-2 px-2 border-r border-slate-300">Keterangan</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right">Nominal (Rp)</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-center">Status</th>
                    <th className="py-2 px-2 text-center">Verifikator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTxs.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="py-1.5 px-2 border-r border-slate-300 font-mono text-slate-800">{t.tanggal}</td>
                      <td className="py-1.5 px-2 border-r border-slate-300">
                        <div className="font-bold text-slate-900">{t.namaAnggota}</div>
                        <div className="text-[10px] text-slate-600 font-mono">Rek: {t.noRekKoperasi}</div>
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-300">
                        <span className={`font-bold mr-1 ${t.tipe === 'MASUK' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          [{t.tipe === 'MASUK' ? 'SETOR' : 'TARIK'}]
                        </span>
                        <span className="text-slate-800">{t.kategori}</span>
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-300 text-slate-800">{t.keterangan}</td>
                      <td className={`py-1.5 px-2 border-r border-slate-300 text-right font-mono font-bold ${t.tipe === 'MASUK' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatNumberId(t.nominal)}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-300 text-center">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-center text-[10px] text-slate-600 font-mono">{t.verifiedBy || '-'}</td>
                    </tr>
                  ))}
                  {filteredTxs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500 italic">
                        Tidak ada transaksi ditemukan untuk filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Content: LOG HISTORI ADMIN (Super Admin Only) */}
        {reportType === 'LOG_HISTORI' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2 px-2 border-r border-slate-300 text-center">No</th>
                    <th className="py-2 px-2 border-r border-slate-300">Waktu Log</th>
                    <th className="py-2 px-2 border-r border-slate-300">Admin Pelaksana</th>
                    <th className="py-2 px-2 border-r border-slate-300">Aksi / Kegiatan</th>
                    <th className="py-2 px-2">Detail Perubahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLogs.map((l, idx) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="py-1.5 px-2 border-r border-slate-300 font-mono text-slate-700 whitespace-nowrap">
                        {l.timestamp}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-300 font-bold text-slate-900 whitespace-nowrap">
                        {l.adminName}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-300 font-bold text-blue-900 whitespace-nowrap">
                        {l.action}
                      </td>
                      <td className="py-1.5 px-2 text-slate-800">{l.details}</td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                        Tidak ada log histori dalam periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Content: SURAT MENYURAT RESMI */}
        {reportType === 'SURAT_RESMI' && selectedLetter && (
          <div className="space-y-6 pt-2">
            <div className="text-right text-xs text-slate-700 font-medium">
              Jakarta Barat, {selectedLetter.tanggal}
            </div>

            <div className="text-xs space-y-1">
              <div><strong>Nomor :</strong> {selectedLetter.nomorSurat}</div>
              <div><strong>Lampiran :</strong> 1 (Satu) Berkas</div>
              <div><strong>Perihal :</strong> {selectedLetter.perihal}</div>
            </div>

            <div className="text-xs pt-2">
              <p>Kepada Yth,</p>
              <p className="font-bold uppercase text-slate-900">
                {selectedLetter.targetType === 'SEMUA' ? 'SELURUH ANGGOTA KOPERASI HWS' : `ANGGOTA KOPERASI: ${selectedLetter.targetMemberName || 'Anggota Terpilih'}`}
              </p>
              <p>Di Tempat</p>
            </div>

            <div className="text-xs leading-relaxed text-slate-900 space-y-3 pt-3 text-justify">
              <p>Dengan hormat,</p>
              <p className="whitespace-pre-line">{selectedLetter.isiSurat}</p>
              <p>
                Demikian surat pemberitahuan ini kami sampaikan agar menjadi perhatian seluruh anggota Koperasi Himpunan Wirausaha Sejahtera. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.
              </p>
            </div>

            <div className="pt-8 flex justify-end text-right">
              <div className="w-64 text-center">
                <p className="text-xs text-slate-700 font-medium">Pengurus Koperasi HWS,</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-slate-400 italic">[Telah Ditandatangani Secara Elektronik]</span>
                </div>
                <p className="text-xs font-bold text-slate-900 underline uppercase">{selectedLetter.senderName}</p>
                <p className="text-[10px] text-slate-600">Pengurus Himpunan Wirausaha Sejahtera</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between items-center font-mono">
          <span>Dicetak otomatis melalui Sistem Koperasi HWS • Valid tanpa tanda tangan basah</span>
          <span>Halaman 1 / 1</span>
        </div>

      </div>

    </div>
  );
};
