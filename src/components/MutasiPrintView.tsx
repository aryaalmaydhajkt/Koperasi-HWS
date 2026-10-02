import React, { useState } from 'react';
import { MemberUser, MemberTransaction } from '../types';
import { HwsLogo } from './HwsLogo';
import { formatNumberId } from '../utils/exportUtils';
import { ArrowLeft, Printer, Calendar, CheckCircle2, ShieldCheck, Scale } from 'lucide-react';

interface MutasiPrintViewProps {
  member: MemberUser;
  transactions: MemberTransaction[];
  periodeLabel?: string;
  filterKategori?: 'SEMUA' | 'POKOK' | 'UMUM';
  onBack: () => void;
}

export const MutasiPrintView: React.FC<MutasiPrintViewProps> = ({
  member,
  transactions,
  periodeLabel: initialPeriodeLabel = 'Semua Periode',
  filterKategori: initialFilterKategori = 'SEMUA',
  onBack,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'SEMUA' | 'POKOK' | 'UMUM'>(initialFilterKategori);
  const [periodeType, setPeriodeType] = useState<'SEMUA' | 'HARIAN' | 'BULANAN' | 'TAHUNAN' | 'CUSTOM'>('SEMUA');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Helper to parse DD/MM/YYYY or YYYY-MM-DD into YYYY-MM-DD
  const parseToIso = (dateStr: string): string => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return dateStr;
  };

  // Helper to get formatted previous day label (DD/MM/YYYY)
  const getPreviousDayDateString = (isoDateStr: string): string => {
    if (!isoDateStr) return '';
    const d = new Date(isoDateStr);
    d.setDate(d.getDate() - 1);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Helper to determine the start date ISO string for the active period
  const getPeriodStartDateIso = (): string => {
    if (periodeType === 'HARIAN') return selectedDate;
    if (periodeType === 'BULANAN') return `${selectedMonth}-01`;
    if (periodeType === 'TAHUNAN') return `${selectedYear}-01-01`;
    if (periodeType === 'CUSTOM') return dateFrom || '';
    return '';
  };

  // Check if a transaction date falls within the selected period
  const isDateInFilter = (dateStr: string) => {
    if (periodeType === 'SEMUA') return true;
    const normalized = parseToIso(dateStr);
    if (periodeType === 'HARIAN') return normalized === selectedDate;
    if (periodeType === 'BULANAN') return normalized.startsWith(selectedMonth);
    if (periodeType === 'TAHUNAN') return normalized.startsWith(selectedYear);
    if (periodeType === 'CUSTOM') {
      if (dateFrom && normalized < dateFrom) return false;
      if (dateTo && normalized > dateTo) return false;
      return true;
    }
    return true;
  };

  // Periode display string
  const getPeriodeDisplay = () => {
    if (periodeType === 'HARIAN') {
      const parts = selectedDate.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (periodeType === 'BULANAN') {
      const parts = selectedMonth.split('-');
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const mIdx = parseInt(parts[1], 10) - 1;
      return `${monthNames[mIdx] || parts[1]} ${parts[0]}`;
    }
    if (periodeType === 'TAHUNAN') return `Tahun ${selectedYear}`;
    if (periodeType === 'CUSTOM') {
      const formatCustom = (dStr: string) => {
        if (!dStr) return '';
        const p = dStr.split('-');
        return `${p[2]}/${p[1]}/${p[0]}`;
      };
      return `${formatCustom(dateFrom) || 'Awal'} s/d ${formatCustom(dateTo) || 'Sekarang'}`;
    }
    return initialPeriodeLabel;
  };

  const activePeriodeLabel = getPeriodeDisplay();

  // Document title dynamically matching the downloaded account statement per user request:
  // "untuk mutasi pada anggota pada pdf terdapat tulisan sesuai yang di download rekening tabungan wajib / rekening tabungan umum / rekening semua tabungan"
  const getDocumentTitle = () => {
    if (selectedFilter === 'POKOK') return 'REKENING TABUNGAN WAJIB';
    if (selectedFilter === 'UMUM') return 'REKENING TABUNGAN UMUM';
    return 'REKENING SEMUA TABUNGAN';
  };

  const getDocumentSubtitle = () => {
    if (selectedFilter === 'POKOK') return 'MUTASI REKENING TABUNGAN WAJIB RESMI';
    if (selectedFilter === 'UMUM') return 'MUTASI REKENING TABUNGAN UMUM RESMI';
    return 'MUTASI REKENING SEMUA TABUNGAN RESMI';
  };

  // Filter category membership test
  const isTxInFilterCategory = (tx: MemberTransaction): boolean => {
    if (selectedFilter === 'POKOK') {
      return tx.kategori === 'POKOK' || tx.kategori === 'GABUNGAN_KEWAJIBAN';
    }
    if (selectedFilter === 'UMUM') {
      return tx.kategori === 'UMUM';
    }
    return true; // SEMUA
  };

  // Effective nominal calculation for balance accuracy between debet and kredit
  const getTxEffectiveNominal = (tx: MemberTransaction): number => {
    if (selectedFilter === 'POKOK') {
      if (tx.kategori === 'GABUNGAN_KEWAJIBAN') {
        return tx.rincian?.pokok ?? Math.max(1, Math.floor(tx.nominal / 2));
      }
      if (tx.kategori === 'POKOK') {
        return tx.nominal;
      }
      return 0;
    }
    if (selectedFilter === 'UMUM') {
      if (tx.kategori === 'UMUM') {
        return tx.nominal;
      }
      return 0;
    }
    // SEMUA: full transaction amount
    return tx.nominal;
  };

  // Sort all transactions chronologically (oldest to newest)
  const allMemberTxsSorted = [...transactions].sort((a, b) => {
    const parseD = (d: string) => {
      const parts = d.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[2].length === 4) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
        return new Date(d).getTime();
      }
      return 0;
    };
    return parseD(a.tanggal) - parseD(b.tanggal);
  });

  // Calculate Saldo Awal from transactions strictly before the period start date (Saldo dari hari sebelumnya)
  const startDateIso = getPeriodStartDateIso();
  const priorTxs = startDateIso
    ? allMemberTxsSorted.filter((t) => parseToIso(t.tanggal) < startDateIso && isTxInFilterCategory(t))
    : [];

  const saldoAwal = priorTxs.reduce((acc, tx) => {
    const nom = getTxEffectiveNominal(tx);
    return tx.tipe === 'MASUK' ? acc + nom : acc - nom;
  }, 0);

  // Transactions within the current filtered period
  const currentPeriodTxs = allMemberTxsSorted.filter((t) => {
    if (!isTxInFilterCategory(t)) return false;
    return isDateInFilter(t.tanggal);
  });

  // Calculate running balance starting strictly from saldoAwal
  let running = saldoAwal;
  const currentPeriodTxsWithBalance = currentPeriodTxs.map((tx) => {
    const nom = getTxEffectiveNominal(tx);
    if (tx.tipe === 'MASUK') {
      running += nom;
    } else {
      running -= nom;
    }
    return {
      ...tx,
      effectiveNominal: nom,
      runningBalance: running,
    };
  });

  // Stats calculation
  let totalMasuk = 0;
  let countMasuk = 0;
  let totalKeluar = 0;
  let countKeluar = 0;

  currentPeriodTxsWithBalance.forEach((tx) => {
    if (tx.tipe === 'MASUK') {
      totalMasuk += tx.effectiveNominal;
      countMasuk++;
    } else {
      totalKeluar += tx.effectiveNominal;
      countKeluar++;
    }
  });

  // Saldo Akhir and Balance Verification
  const saldoAkhir = saldoAwal + totalMasuk - totalKeluar;
  const totalKreditDanSaldoAwal = totalMasuk + saldoAwal;
  const totalDebetDanSaldoAkhir = totalKeluar + saldoAkhir;
  const isBalanced = Math.abs(totalKreditDanSaldoAwal - totalDebetDanSaldoAkhir) < 0.01;

  // Initial balance date string (hari sebelumnya dari awal periode)
  const saldoAwalDateLabel = startDateIso
    ? getPreviousDayDateString(startDateIso)
    : (currentPeriodTxs[0]?.tanggal 
        ? getPreviousDayDateString(parseToIso(currentPeriodTxs[0].tanggal)) 
        : (member.tanggalBergabung || new Date().toLocaleDateString('id-ID')));

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${getDocumentTitle()} - ${member.nama} (${member.noAnggota})`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-6 px-4 print:p-0 print:bg-white print:text-black">
      
      {/* Control Toolbar - Hidden on Print */}
      <div className="max-w-[850px] mx-auto mb-6 bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-xl print:hidden space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-700 px-3 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-cyan-400 font-mono font-bold flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1.5 rounded-lg">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              Status: {isBalanced ? 'BALANCE (SEIMBANG)' : 'CEK REKONSILIASI'}
            </span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak / Unduh PDF Mutasi
            </button>
          </div>
        </div>

        {/* Filter Controls: Jenis Tabungan & Periode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Jenis Tabungan Yang Dicetak:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="SEMUA">Rekening Semua Tabungan</option>
              <option value="POKOK">Rekening Tabungan Wajib</option>
              <option value="UMUM">Rekening Tabungan Umum</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Periode Mutasi:</label>
            <select
              value={periodeType}
              onChange={(e) => setPeriodeType(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="SEMUA">Seluruh Waktu</option>
              <option value="HARIAN">Harian (Pilih Tanggal Cetak)</option>
              <option value="BULANAN">Bulanan</option>
              <option value="TAHUNAN">Tahunan</option>
              <option value="CUSTOM">Rentang Tanggal</option>
            </select>
          </div>

          {periodeType === 'HARIAN' && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Tanggal Cetak Mutasi:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {periodeType === 'BULANAN' && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Bulan Mutasi:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {periodeType === 'TAHUNAN' && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Tahun Mutasi:</label>
              <input
                type="number"
                min="2020"
                max="2035"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Sampai Tanggal:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Official Bank-Style Statement Paper (Matches BCA/Mandiri format) */}
      <div className="max-w-[850px] mx-auto bg-white text-slate-900 border border-slate-300 p-8 shadow-2xl print:shadow-none print:border-none print:p-4 text-xs font-sans relative overflow-hidden">
        
        {/* Tiled Watermark Background - anti counterfeit */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.045] z-0 select-none overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(#1e3a8a 0.75px, transparent 0.75px), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='110' height='70' viewBox='0 0 110 70'><g transform='rotate(-25 55 35)'><text x='10' y='30' font-family='Arial, sans-serif' font-size='10' font-weight='900' fill='%231e3a8a'>KOPERASI HWS</text><text x='25' y='44' font-family='Arial, sans-serif' font-size='7' font-weight='700' fill='%23b45309'>ORIGINAL</text></g></svg>")`,
            backgroundRepeat: 'repeat',
            backgroundPosition: '0 0, 0 0',
          }}
        />

        {/* Paper Content Layer */}
        <div className="relative z-10">
          
          {/* Top Header */}
          <div className="flex items-start justify-between pb-4 border-b border-black mb-4">
            <div className="flex items-center gap-3">
              <HwsLogo size={56} className="w-14 h-14" />
              <div>
                <div className="text-lg font-black tracking-tight text-blue-900 leading-tight">
                  KOPERASI HWS
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-600">
                  KCP {member.wilayah.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Dynamic Title Matching Download Selection per User Request */}
            <div className="text-center pt-2">
              <h1 className="text-xl font-black tracking-wider text-slate-900 uppercase">
                {getDocumentTitle()}
              </h1>
              <p className="text-[10.5px] text-slate-600 tracking-wide font-bold uppercase">
                {getDocumentSubtitle()}
              </p>
            </div>

            <div className="w-20"></div> {/* spacer */}
          </div>

          {/* Address and Account Details Boxes */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Box 1 (Left): Member Address */}
            <div className="border border-black p-3 rounded-sm leading-relaxed">
              <div className="font-bold text-[13px] uppercase tracking-wide">
                {member.nama}
              </div>
              <div className="text-[11px] uppercase font-semibold">
                KEC {member.wilayah}
              </div>
              <div className="text-[11px] uppercase">
                {member.rtRw ? `${member.rtRw}, ` : ''}{member.kelurahan ? `${member.kelurahan}, ` : ''}{member.alamat || 'JAKARTA'}
              </div>
              <div className="text-[11px] uppercase">
                {member.kota || 'JAKARTA BARAT'} {member.kodePos || '11740'}
              </div>
              <div className="text-[11px] uppercase font-semibold">
                INDONESIA
              </div>
            </div>

            {/* Box 2 (Right): Account Meta */}
            <div className="border border-black p-3 rounded-sm leading-relaxed font-mono">
              <div className="grid grid-cols-12 gap-1 text-[11px]">
                <span className="col-span-5 font-bold font-sans">NO. REKENING</span>
                <span className="col-span-1">:</span>
                <span className="col-span-6 font-bold">{member.noRekKoperasi}</span>

                <span className="col-span-5 font-bold font-sans">NO. ANGGOTA</span>
                <span className="col-span-1">:</span>
                <span className="col-span-6">{member.noAnggota}</span>

                <span className="col-span-5 font-bold font-sans">JENIS REKENING</span>
                <span className="col-span-1">:</span>
                <span className="col-span-6 font-bold text-blue-900 uppercase">{getDocumentTitle()}</span>

                <span className="col-span-5 font-bold font-sans">PERIODE</span>
                <span className="col-span-1">:</span>
                <span className="col-span-6 uppercase font-bold">{activePeriodeLabel}</span>

                <span className="col-span-5 font-bold font-sans">TANGGAL CETAK</span>
                <span className="col-span-1">:</span>
                <span className="col-span-6 font-bold">{new Date().toLocaleDateString('id-ID')}</span>

                <span className="col-span-5 font-bold font-sans">MATA UANG</span>
                <span className="col-span-1">:</span>
                <span className="col-span-6">IDR</span>
              </div>
            </div>
          </div>

          {/* Catatan Box */}
          <div className="border border-black p-2.5 rounded-sm mb-4 text-[9.5px] leading-tight bg-slate-50/50">
            <div className="font-bold mb-0.5">CATATAN:</div>
            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div>
                • Apabila anggota tidak melakukan sanggahan atas Laporan Mutasi Rekening ini sampai dengan akhir bulan berikutnya, anggota dianggap telah menyetujui segala data yang tercantum pada Laporan Mutasi Rekening ini.
              </div>
              <div>
                • Koperasi berhak setiap saat melakukan koreksi pembukuan apabila terdapat kesalahan pada Laporan Mutasi Rekening.
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <table className="w-full border-collapse border-y-2 border-black text-[10.5px]">
            <thead>
              <tr className="border-b border-black font-bold uppercase text-slate-800 text-[10px]">
                <th className="py-1.5 px-1 text-left w-16">TANGGAL</th>
                <th className="py-1.5 px-2 text-left">KETERANGAN</th>
                <th className="py-1.5 px-1 text-center w-12">CBG</th>
                <th className="py-1.5 px-2 text-right w-36">MUTASI</th>
                <th className="py-1.5 px-2 text-right w-36">SALDO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Row 0: Saldo Awal di tanggal cetak mutasi yang berdasarkan saldo dari hari sebelumnya per user request */}
              <tr className="align-top font-mono bg-slate-50/80">
                <td className="py-2 px-1 text-slate-800 font-semibold">
                  {saldoAwalDateLabel ? saldoAwalDateLabel.slice(0, 5) : '-'}
                </td>
                <td className="py-2 px-2 text-slate-900 font-sans">
                  <div className="font-bold text-[11px] text-blue-950 uppercase">
                    SALDO AWAL PINDAHAN
                  </div>
                  <div className="text-[9.5px] text-slate-600 leading-snug">
                    Saldo awal s/d hari sebelumnya ({saldoAwalDateLabel})
                  </div>
                </td>
                <td className="py-2 px-1 text-center text-slate-600">0001</td>
                <td className="py-2 px-2 text-right tabular-nums font-semibold text-slate-400">
                  -
                </td>
                <td className="py-2 px-2 text-right tabular-nums font-bold text-slate-900">
                  {formatNumberId(saldoAwal)}
                </td>
              </tr>

              {/* Transactions in period */}
              {currentPeriodTxsWithBalance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 italic font-mono">
                    Tidak ada mutasi transaksi pada periode ini.
                  </td>
                </tr>
              ) : (
                currentPeriodTxsWithBalance.map((tx) => (
                  <tr key={tx.id} className="align-top font-mono">
                    <td className="py-2 px-1 text-slate-900 font-medium">
                      {tx.tanggal.slice(0, 5)}
                    </td>
                    <td className="py-2 px-2 text-slate-900 font-sans">
                      <div className="font-bold text-[11px] text-slate-900 uppercase">
                        {tx.tipe === 'MASUK' ? 'TRSF MASUK CR' : 'TRSF KELUAR DB'}
                      </div>
                      <div className="text-[10px] text-slate-700 leading-snug">
                        {tx.keterangan}
                      </div>
                      {tx.rincian?.targetPenyaluran && (
                        <div className="text-[9px] text-slate-500 italic">
                          {tx.rincian.targetPenyaluran}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-1 text-center text-slate-600">
                      {tx.cbg || '0001'}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums font-semibold">
                      <span>{formatNumberId(tx.effectiveNominal)}</span>
                      <span className={`ml-1 text-[10px] font-bold ${tx.tipe === 'MASUK' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {tx.tipe === 'MASUK' ? 'CR' : 'DB'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums font-semibold text-slate-900">
                      {formatNumberId(tx.runningBalance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Bottom Summary Box with Exact Mathematical Balance Proof */}
          <div className="mt-8 flex justify-end">
            <div className="w-96 border-t-2 border-black pt-3 font-mono text-[10.5px]">
              
              <div className="flex justify-between py-0.5">
                <span className="font-sans font-bold text-slate-800">SALDO AWAL (HARI SEBELUMNYA) :</span>
                <span className="tabular-nums font-bold">{formatNumberId(saldoAwal)}</span>
              </div>
              
              <div className="flex justify-between py-0.5">
                <span className="font-sans font-bold text-emerald-800">MUTASI MASUK (KREDIT / CR) :</span>
                <div className="flex gap-4">
                  <span className="tabular-nums font-bold text-emerald-700">+{formatNumberId(totalMasuk)}</span>
                  <span className="w-8 text-right text-slate-500 font-sans">[{countMasuk}]</span>
                </div>
              </div>

              <div className="flex justify-between py-0.5">
                <span className="font-sans font-bold text-rose-800">MUTASI KELUAR (DEBET / DB) :</span>
                <div className="flex gap-4">
                  <span className="tabular-nums font-bold text-rose-700">-{formatNumberId(totalKeluar)}</span>
                  <span className="w-8 text-right text-slate-500 font-sans">[{countKeluar}]</span>
                </div>
              </div>

              <div className="flex justify-between py-1 border-t border-black font-bold text-blue-950 text-xs mt-1">
                <span className="font-sans">SALDO AKHIR {getDocumentTitle()} :</span>
                <span className="tabular-nums">{formatNumberId(saldoAkhir)}</span>
              </div>

              {/* Box Keseimbangan Debet & Kredit (Balance Proof) */}
              <div className="mt-2.5 p-2 bg-slate-50 border border-slate-300 rounded text-[9.5px] space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200 pb-1">
                  <span className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-blue-800" /> REKONSILIASI KESEIMBANGAN
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${isBalanced ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'}`}>
                    {isBalanced ? 'BALANCE / SEIMBANG' : 'BELUM SEIMBANG'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700 pt-0.5">
                  <span className="font-sans font-medium">Total Mutasi Kredit + Saldo Awal :</span>
                  <span className="tabular-nums font-bold">{formatNumberId(totalKreditDanSaldoAwal)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="font-sans font-medium">Total Mutasi Debet + Saldo Akhir :</span>
                  <span className="tabular-nums font-bold">{formatNumberId(totalDebetDanSaldoAkhir)}</span>
                </div>
                <div className="text-[8.5px] text-slate-500 italic pt-1 border-t border-slate-200">
                  * Terbukti balance: Saldo Akhir = Saldo Awal + Total Kredit (Masuk) - Total Debet (Keluar)
                </div>
              </div>

              {/* Sub-breakdown for Semua Tabungan */}
              {selectedFilter === 'SEMUA' && (
                <div className="mt-2 pt-2 border-t border-dashed border-slate-300 text-[10px] space-y-0.5">
                  <div className="flex justify-between font-bold text-amber-900">
                    <span className="font-sans">Saldo Tabungan Wajib (Pokok):</span>
                    <span className="tabular-nums">{formatNumberId(member.saldoPokok)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-900">
                    <span className="font-sans">Saldo Tabungan Umum:</span>
                    <span className="tabular-nums">{formatNumberId(member.saldoUmum)}</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer note: strictly NO signatures */}
          <div className="mt-8 pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-400 flex justify-between items-center font-mono">
            <span>Sistem Otomasi Koperasi HWS • Dicetak Tanpa Tanda Tangan Basah</span>
            <span>ID Dokumen: HWS-MUT-{selectedFilter}-{member.noRekKoperasi}-{new Date().getFullYear()}</span>
          </div>

        </div>

      </div>

    </div>
  );
};
