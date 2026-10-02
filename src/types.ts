export type WilayahJakarta = 'Cengkareng' | 'Kalideres' | 'Kembangan' | 'Kebon Jeruk';

export const WILAYAH_CONFIG: Record<WilayahJakarta, { code: string; label: string }> = {
  'Kalideres': { code: '76', label: 'Kalideres' },
  'Cengkareng': { code: '77', label: 'Cengkareng' },
  'Kembangan': { code: '78', label: 'Kembangan' },
  'Kebon Jeruk': { code: '79', label: 'Kebon Jeruk' },
};

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN_WRITE' | 'ADMIN_DOWNLOAD' | 'ADMIN_HAPUS';

export interface AdminUser {
  id: string;
  username: string;
  nama: string;
  email: string;
  role: AdminRole;
  roleTitle: string;
  noHp: string;
  nik?: string;
  alamat?: string;
  provinsi?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  rtRw?: string;
  kodePos?: string;
  fotoKtp?: string;
  foto?: string;
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  createdAt: string;
}

export interface MemberUser {
  id: string;
  noAnggota: string;
  nama: string;
  nik: string;
  noHp: string;
  email?: string;
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  wilayah: WilayahJakarta;
  noRekKoperasi: string; // 10 digit: 2 digit wilayah + 3 digit no HP belakang + 5 digit 66666+
  bankAnggota: string;
  noRekBank: string;
  atasNamaRekBank: string;
  alamat: string;
  rtRw: string;
  kelurahan?: string;
  kecamatan: string;
  kota: string;
  provinsi?: string;
  kodePos?: string;
  fotoKtp?: string;
  fotoProfil?: string;
  tanggalBergabung: string;
  isVerified: boolean;
  isPokokLocked: boolean; // default true, admin can unlock
  saldoPokok: number;    // Rp 1.000 / hari
  saldoZakat: number;    // Rp 500 / hari
  saldoQurban: number;   // Rp 500 / hari
  saldoUmum: number;     // Bebas setor & tarik
  statusKeanggotaan: 'AKTIF' | 'NONAKTIF';
}

export type MutasiType = 'MASUK' | 'KELUAR'; // Per point 59: debit -> keluar, kredit -> masuk

export type KategoriTransaksi = 'POKOK' | 'ZAKAT' | 'QURBAN' | 'UMUM' | 'GABUNGAN_KEWAJIBAN' | 'PENYESUAIAN_ADMIN';

export interface MemberTransaction {
  id: string;
  memberId: string;
  namaAnggota: string;
  noRekKoperasi: string;
  tanggal: string; // DD/MM/YYYY or YYYY-MM-DD
  kategori: KategoriTransaksi;
  tipe: MutasiType; // 'MASUK' | 'KELUAR'
  nominal: number;
  keterangan: string;
  cbg: string;
  saldoSetelah: number;
  status: 'TERVERIFIKASI' | 'MENUNGGU_VERIFIKASI' | 'DITOLAK';
  buktiTransfer?: string;
  metodePembayaran?: 'TRANSFER_BANK' | 'QRIS_HWS';
  rincian?: {
    jumlahHari?: number;
    pokok?: number;
    zakat?: number;
    qurban?: number;
    namaBank?: string;
    targetPenyaluran?: string;
  };
  verifiedBy?: string;
  verifiedAt?: string;
  catatanAdmin?: string;
}

export type BukuKasType = 'KAS_ANGGOTA' | 'KAS_KOPERASI';

export interface BukuKasEntry {
  id: string;
  bukuKas: BukuKasType;
  tanggal: string;
  tipe: MutasiType; // 'MASUK' | 'KELUAR'
  kategori: string;
  keterangan: string;
  nominal: number;
  saldoSetelah: number;
  isProtected: boolean; // True if automatically synced from member deposit/withdrawal (cannot be edited by admin per point 50)
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface KasCategory {
  id: string;
  nama: string;
  tipe: MutasiType;
  bukuKas: BukuKasType;
}

export interface DeleteMemberRequest {
  id: string;
  memberId: string;
  memberNama: string;
  memberNoAnggota: string;
  sisaSaldo: number;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DeleteKasRequest {
  id: string;
  kasEntryId: string;
  keterangan: string;
  nominal: number;
  bukuKas: BukuKasType;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface EditKasRequest {
  id: string;
  kasEntryId: string;
  bukuKas: BukuKasType;
  keteranganLama: string;
  nominalLama: number;
  kategoriLama: string;
  keteranganBaru: string;
  nominalBaru: number;
  kategoriBaru: string;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface OfficialLetter {
  id: string;
  nomorSurat: string;
  perihal: string;
  tanggal: string;
  targetType: 'SEMUA' | 'INDIVIDUAL';
  targetMemberId?: string;
  targetMemberName?: string;
  targetNoHp?: string;
  targetEmail?: string;
  isiSurat: string;
  senderName: string;
  createdAt: string;
}

export interface ZakatQurbanDisbursement {
  id: string;
  tanggal: string;
  jenis: 'ZAKAT' | 'QURBAN';
  target: 'ALL' | 'WILAYAH' | 'INDIVIDUAL';
  wilayah?: WilayahJakarta;
  memberId?: string;
  namaAnggota?: string;
  keteranganPenyaluran: string;
  totalDana: number;
  disbursedBy: string;
}

export interface ChatMessage {
  id: string;
  memberId: string;
  memberName: string;
  sender: 'MEMBER' | 'ADMIN';
  adminName?: string;
  text: string;
  timestamp: string; // ISO
  isRead: boolean;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  details: string;
}

export interface CloudBackupInfo {
  lastBackupTime: string;
  backupStatus: 'TERHUBUNG' | 'SINKRON' | 'PROSES';
  googleCloudLocation: string;
  totalRecords: number;
  backupSizeKb: number;
}

export interface KoperasiProfile {
  namaKoperasi: string;
  nomorBadanHukum: string;
  alamatKantor: string;
  rtRw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  noTelepon: string;
  noWhatsapp: string;
  email: string;
  website: string;
  ketuaPengurus: string;
  sekretaris: string;
  bendahara: string;
  bankKoperasi: string;
  noRekKoperasiUtama: string;
  atasNamaRekKoperasi: string;
  npwp: string;
  visiMisi: string;
  slogan: string;
  updatedAt?: string;
  updatedBy?: string;
}

