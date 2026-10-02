import { 
  AdminUser, 
  MemberUser, 
  MemberTransaction, 
  BukuKasEntry, 
  ChatMessage, 
  SystemLog, 
  WilayahJakarta, 
  WILAYAH_CONFIG,
  KasCategory,
  OfficialLetter,
  DeleteMemberRequest,
  DeleteKasRequest
} from '../types';

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'superadmin',
    nama: 'H. Suryadi Pratama',
    email: 'suryadi.pratama@hws.koperasi.id',
    role: 'SUPER_ADMIN',
    roleTitle: 'Admin Utama (Super Admin)',
    noHp: '08119882233',
    nik: '3173010101700001',
    alamat: 'Jl. Puri Indah Raya Blok A No. 12',
    provinsi: 'DKI Jakarta',
    kota: 'Jakarta Barat',
    kecamatan: 'Kembangan',
    kelurahan: 'Kembangan Selatan',
    rtRw: 'RT 001 RW 002',
    kodePos: '11610',
    fotoKtp: 'https://placehold.co/600x400/png?text=KTP+SUPER+ADMIN',
    password: 'admin',
    securityQuestion: 'Di kota mana kantor pusat Koperasi HWS berada?',
    securityAnswer: 'Jakarta Barat',
    createdAt: '2026-01-01',
  }
];

export const INITIAL_KAS_CATEGORIES: KasCategory[] = [
  { id: 'cat-1', nama: 'Overhead Operasional Kantor', tipe: 'KELUAR', bukuKas: 'KAS_KOPERASI' },
  { id: 'cat-2', nama: 'Biaya Sewa & Listrik Koperasi', tipe: 'KELUAR', bukuKas: 'KAS_KOPERASI' },
  { id: 'cat-3', nama: 'Penyaluran Zakat Fitrah', tipe: 'KELUAR', bukuKas: 'KAS_ANGGOTA' },
  { id: 'cat-4', nama: 'Penyaluran Tabungan Qurban', tipe: 'KELUAR', bukuKas: 'KAS_ANGGOTA' },
  { id: 'cat-5', nama: 'Modal Operasional Awal Koperasi', tipe: 'MASUK', bukuKas: 'KAS_KOPERASI' },
  { id: 'cat-6', nama: 'Penerimaan Zakat & Qurban', tipe: 'MASUK', bukuKas: 'KAS_ANGGOTA' },
  { id: 'cat-7', nama: 'anggota tutup account', tipe: 'MASUK', bukuKas: 'KAS_KOPERASI' },
  { id: 'cat-8', nama: 'Jasa & Administrasi Koperasi', tipe: 'MASUK', bukuKas: 'KAS_KOPERASI' },
  { id: 'cat-9', nama: 'Setoran Kewajiban Pokok', tipe: 'MASUK', bukuKas: 'KAS_ANGGOTA' },
  { id: 'cat-10', nama: 'Setoran Tunai Umum', tipe: 'MASUK', bukuKas: 'KAS_ANGGOTA' },
  { id: 'cat-11', nama: 'Tarikan Tabungan Pokok', tipe: 'KELUAR', bukuKas: 'KAS_ANGGOTA' },
  { id: 'cat-12', nama: 'Tarikan Tunai Umum', tipe: 'KELUAR', bukuKas: 'KAS_ANGGOTA' },
  { id: 'cat-13', nama: 'pindah kas hapus account', tipe: 'KELUAR', bukuKas: 'KAS_ANGGOTA' },
  { id: 'cat-14', nama: 'Tabungan Zakat Fitrah', tipe: 'MASUK', bukuKas: 'KAS_ANGGOTA' },
  { id: 'cat-15', nama: 'Tabungan Qurban', tipe: 'MASUK', bukuKas: 'KAS_ANGGOTA' },
];

export function generateRekKoperasi(wilayah: WilayahJakarta, noHp: string, index: number = 0): string {
  const prefix = WILAYAH_CONFIG[wilayah]?.code || '77';
  const cleanHp = noHp.replace(/\D/g, '');
  const last3 = cleanHp.slice(-3).padStart(3, '0');
  const seq = (66666 + index).toString();
  return `${prefix}${last3}${seq}`;
}

export function generateNoAnggota(wilayah: WilayahJakarta, index: number = 1): string {
  const codeMap: Record<WilayahJakarta, string> = {
    'Cengkareng': 'CKR',
    'Kalideres': 'KLD',
    'Kembangan': 'KMB',
    'Kebon Jeruk': 'KBJ'
  };
  const code = codeMap[wilayah] || 'HWS';
  const num = index.toString().padStart(3, '0');
  return `HWS-${code}-2026-${num}`;
}

export const CLEAN_MEMBERS: MemberUser[] = [];
export const CLEAN_TRANSACTIONS: MemberTransaction[] = [];
export const CLEAN_KAS_ENTRIES: BukuKasEntry[] = [];
export const CLEAN_CHATS: ChatMessage[] = [];
export const CLEAN_LETTERS: OfficialLetter[] = [];
export const CLEAN_MEMBER_DEL_REQUESTS: DeleteMemberRequest[] = [];
export const CLEAN_KAS_DEL_REQUESTS: DeleteKasRequest[] = [];

export const CLEAN_LOGS: SystemLog[] = [
  {
    id: 'log-init',
    timestamp: new Date().toISOString(),
    adminName: 'Sistem Koperasi HWS',
    action: 'INISIALISASI_SISTEM',
    details: 'Database bersih telah diinisialisasi dengan 1 Super Admin dan saldo awal 0.',
  }
];

export const DEMO_MEMBERS: MemberUser[] = [];

export const KOPERASI_DEFAULT_PROFILE = {
  namaKoperasi: 'KOPERASI HIMPUNAN WIRAUSAHA SEJAHTERA',
  nomorBadanHukum: 'AHU-0004521.AH.01.26.TAHUN.2024',
  alamatKantor: 'Jl. Daan Mogot Raya No. 128, Rawa Buaya',
  rtRw: 'RT 005 RW 003',
  kelurahan: 'Cengkareng Barat',
  kecamatan: 'Cengkareng',
  kota: 'Jakarta Barat',
  provinsi: 'DKI Jakarta',
  kodePos: '11730',
  noTelepon: '(021) 54398822',
  noWhatsapp: '08128899112',
  email: 'sekretariat@koperasi-hws.id',
  website: 'https://koperasi-hws.id',
  ketuaPengurus: 'H. Suryadi Pratama',
  sekretaris: 'Robi Darwis',
  bendahara: 'Jameson',
  bankKoperasi: 'Bank Central Asia (BCA)',
  noRekKoperasiUtama: '8830198822',
  atasNamaRekKoperasi: 'KSP HIMPUNAN WIRAUSAHA SEJAHTERA',
  npwp: '01.234.567.8-038.000',
  visiMisi: 'Mewujudkan kemandirian ekonomi wirausaha mikro dan masyarakat Jakarta Barat melalui gotong royong tabungan kewajiban, zakat, qurban, dan kas bersama.',
  slogan: 'Bersama Membangun Wirausaha Sejahtera & Berkah',
  updatedAt: '2026-09-25',
  updatedBy: 'Super Admin'
};

