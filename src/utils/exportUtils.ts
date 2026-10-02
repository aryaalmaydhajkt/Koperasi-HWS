import { MemberUser, MemberTransaction, BukuKasEntry, WilayahJakarta, SystemLog, ZakatQurbanDisbursement } from '../types';

export function formatRupiah(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val || 0);
}

export function formatNumberId(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val || 0);
}

// Download formatted CSV/Excel with BOM for Excel compatibility
export function exportToCSV(filename: string, rows: string[][]) {
  const processRow = (row: string[]) => {
    return row.map((val) => {
      let result = val === null || val === undefined ? '' : val.toString();
      result = result.replace(/"/g, '""');
      if (result.search(/("|,|\n|\r)/g) >= 0) {
        result = `"${result}"`;
      }
      return result;
    }).join(',');
  };

  const csvContent = '\uFEFF' + rows.map(processRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Rekap Anggota to Excel with Header Metadata & Period
export function exportAnggotaToExcel(
  members: MemberUser[], 
  filterWilayah: string = 'SEMUA',
  periodeLabel: string = 'Seluruh Periode'
) {
  const titleHeader = [
    ['KOPERASI HIMPUNAN WIRAUSAHA SEJAHTERA (HWS)'],
    ['REKAPITULASI DATA ANGGOTA RESMI'],
    [`Wilayah: ${filterWilayah} | Periode Penarikan: ${periodeLabel} | Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}`],
    []
  ];

  const header = [
    'No',
    'No. Anggota',
    'Nama Lengkap',
    'NIK',
    'Wilayah (Kecamatan)',
    'Kelurahan',
    'RT/RW',
    'Kota',
    'Provinsi',
    'Kode Pos',
    'No. Rekening HWS (10 Digit)',
    'Bank Terdaftar',
    'No. Rek Bank Anggota',
    'Atas Nama Rek Bank',
    'Simpanan Pokok (Rp)',
    'Tabungan Zakat Fitrah (Rp)',
    'Tabungan Qurban (Rp)',
    'Tabungan Umum (Rp)',
    'Total Akumulasi Saldo (Rp)',
    'Status Lock Tarik Pokok',
    'Tanggal Bergabung',
    'Status Anggota'
  ];

  const rows = members.map((m, idx) => [
    (idx + 1).toString(),
    m.noAnggota,
    m.nama,
    m.nik || '-',
    m.wilayah,
    m.kelurahan || '-',
    m.rtRw || '-',
    m.kota || 'Jakarta Barat',
    m.provinsi || 'DKI Jakarta',
    m.kodePos || '-',
    m.noRekKoperasi,
    m.bankAnggota,
    m.noRekBank,
    m.atasNamaRekBank,
    m.saldoPokok.toString(),
    m.saldoZakat.toString(),
    m.saldoQurban.toString(),
    m.saldoUmum.toString(),
    (m.saldoPokok + m.saldoZakat + m.saldoQurban + m.saldoUmum).toString(),
    m.isPokokLocked ? 'TERKUNCI' : 'DIBUKA',
    m.tanggalBergabung,
    m.statusKeanggotaan
  ]);

  const filename = `Rekap_Anggota_HWS_${filterWilayah}_${new Date().toISOString().slice(0, 10)}`;
  exportToCSV(filename, [...titleHeader, header, ...rows]);
}

// Laporan Buku Kas to Excel with Period & Category details
export function exportKasToExcel(
  entries: BukuKasEntry[], 
  bukuKasName: string = 'Buku Kas Konsolidasi',
  periodeLabel: string = 'Semua Periode'
) {
  const titleHeader = [
    ['KOPERASI HIMPUNAN WIRAUSAHA SEJAHTERA (HWS)'],
    [`LAPORAN BUKU KAS: ${bukuKasName.toUpperCase()}`],
    [`Periode Penarikan: ${periodeLabel} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`],
    []
  ];

  const header = [
    'No',
    'Tanggal Transaksi',
    'Buku Kas',
    'Tipe (Debet/Kredit)',
    'Kategori Transaksi',
    'Keterangan Lengkap',
    'Nominal Transaksi (Rp)',
    'Saldo Setelah Transaksi (Rp)',
    'Dicatat / Diverifikasi Oleh'
  ];

  const rows = entries.map((e, idx) => [
    (idx + 1).toString(),
    e.tanggal,
    e.bukuKas === 'KAS_ANGGOTA' ? 'Buku Kas Anggota' : 'Buku Kas Koperasi',
    e.tipe === 'MASUK' ? 'Pemasukan (Masuk)' : 'Pengeluaran (Keluar)',
    e.kategori,
    e.keterangan,
    e.nominal.toString(),
    e.saldoSetelah.toString(),
    e.createdBy
  ]);

  const filename = `Laporan_Kas_${bukuKasName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`;
  exportToCSV(filename, [...titleHeader, header, ...rows]);
}

// Laporan Laba Rugi to Excel
export function exportLabaRugiToExcel(
  incomeByCategory: Record<string, number>,
  expenseByCategory: Record<string, number>,
  totalIncome: number,
  totalExpense: number,
  netSurplus: number,
  periodeLabel: string
) {
  const rows: string[][] = [
    ['KOPERASI HIMPUNAN WIRAUSAHA SEJAHTERA (HWS)'],
    ['LAPORAN LABA RUGI / SISA HASIL USAHA (SHU)'],
    [`Periode: ${periodeLabel} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`],
    [],
    ['I. PENDAPATAN / PEMASUKAN', 'NOMINAL (RP)'],
    ...Object.entries(incomeByCategory).map(([cat, val]) => [`   - ${cat}`, val.toString()]),
    ['TOTAL PENDAPATAN', totalIncome.toString()],
    [],
    ['II. BEBAN OPERASIONAL / PENGELUARAN', 'NOMINAL (RP)'],
    ...Object.entries(expenseByCategory).map(([cat, val]) => [`   - ${cat}`, val.toString()]),
    ['TOTAL PENGELUARAN', totalExpense.toString()],
    [],
    ['SURPLUS / DEFISIT BERSIH (LABA RUGI)', netSurplus.toString()]
  ];

  exportToCSV(`Laporan_Laba_Rugi_HWS_${new Date().toISOString().slice(0, 10)}`, rows);
}

// Laporan Neraca to Excel
export function exportNeracaToExcel(
  kasAnggota: number,
  kasKoperasi: number,
  simpananPokok: number,
  tabunganUmum: number,
  zakatPool: number,
  qurbanPool: number,
  cadanganKoperasi: number,
  periodeLabel: string
) {
  const totalAset = kasAnggota + kasKoperasi;
  const totalLiabilitasEkuitas = simpananPokok + tabunganUmum + zakatPool + qurbanPool + cadanganKoperasi;

  const rows: string[][] = [
    ['KOPERASI HIMPUNAN WIRAUSAHA SEJAHTERA (HWS)'],
    ['LAPORAN NERACA KEUANGAN'],
    [`Periode: ${periodeLabel} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`],
    [],
    ['AKTIVA / ASET', 'NOMINAL (RP)'],
    ['   - Kas Anggota (Rekening Bank Koperasi)', kasAnggota.toString()],
    ['   - Kas Operasional Koperasi', kasKoperasi.toString()],
    ['TOTAL AKTIVA (ASET)', totalAset.toString()],
    [],
    ['PASIVA: KEWAJIBAN & EKUITAS', 'NOMINAL (RP)'],
    ['   - Simpanan Pokok Anggota', simpananPokok.toString()],
    ['   - Tabungan Umum Anggota', tabunganUmum.toString()],
    ['   - Dana Titipan Zakat Fitrah', zakatPool.toString()],
    ['   - Dana Titipan Qurban', qurbanPool.toString()],
    ['   - Modal Cadangan & Kas Koperasi', cadanganKoperasi.toString()],
    ['TOTAL PASIVA (KEWAJIBAN & EKUITAS)', totalLiabilitasEkuitas.toString()]
  ];

  exportToCSV(`Laporan_Neraca_HWS_${new Date().toISOString().slice(0, 10)}`, rows);
}

// Laporan Riwayat Transaksi to Excel
export function exportTransaksiToExcel(
  transactions: MemberTransaction[],
  periodeLabel: string
) {
  const titleHeader = [
    ['KOPERASI HIMPUNAN WIRAUSAHA SEJAHTERA (HWS)'],
    ['RIWAYAT TRANSAKSI SETORAN & PENARIKAN ANGGOTA'],
    [`Periode: ${periodeLabel} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`],
    []
  ];

  const header = [
    'No',
    'Tanggal',
    'No. Anggota',
    'Nama Anggota',
    'No. Rekening Koperasi',
    'Tipe Transaksi',
    'Kategori Tabungan',
    'Metode Pembayaran',
    'Nominal (Rp)',
    'Status Verifikasi',
    'Diverifikasi Oleh',
    'Keterangan'
  ];

  const rows = transactions.map((t, idx) => [
    (idx + 1).toString(),
    t.tanggal,
    t.namaAnggota,
    t.noRekKoperasi,
    t.tipe === 'MASUK' ? 'SETORAN' : 'PENARIKAN',
    t.kategori,
    t.metodePembayaran || 'Transfer Bank',
    t.nominal.toString(),
    t.status,
    t.verifiedBy || '-',
    t.keterangan
  ]);

  exportToCSV(`Riwayat_Transaksi_HWS_${new Date().toISOString().slice(0, 10)}`, [...titleHeader, header, ...rows]);
}

// Trigger browser print
export function triggerPrintReport() {
  window.print();
}
