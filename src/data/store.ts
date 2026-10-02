import { 
  AdminUser, 
  MemberUser, 
  MemberTransaction, 
  BukuKasEntry, 
  ChatMessage, 
  SystemLog, 
  WilayahJakarta,
  CloudBackupInfo,
  KasCategory,
  OfficialLetter,
  DeleteMemberRequest,
  DeleteKasRequest,
  EditKasRequest,
  KoperasiProfile
} from '../types';
import { 
  INITIAL_ADMINS, 
  INITIAL_KAS_CATEGORIES,
  CLEAN_MEMBERS, 
  CLEAN_TRANSACTIONS, 
  CLEAN_KAS_ENTRIES, 
  CLEAN_CHATS, 
  CLEAN_LETTERS,
  CLEAN_MEMBER_DEL_REQUESTS,
  CLEAN_KAS_DEL_REQUESTS,
  CLEAN_LOGS,
  DEMO_MEMBERS,
  generateRekKoperasi,
  generateNoAnggota,
  KOPERASI_DEFAULT_PROFILE
} from './initialData';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('62')) return digits;
  return digits;
}

export function cleanNik(nik: string): string {
  return (nik || '').replace(/\D/g, '').trim();
}

const STORAGE_KEY = 'KOPERASI_HWS_STORAGE_V7_CLEAN_START_ZERO';

interface AppState {
  admins: AdminUser[];
  members: MemberUser[];
  transactions: MemberTransaction[];
  kasEntries: BukuKasEntry[];
  kasCategories: KasCategory[];
  memberDeleteRequests: DeleteMemberRequest[];
  kasDeleteRequests: DeleteKasRequest[];
  kasEditRequests: EditKasRequest[];
  letters: OfficialLetter[];
  chats: ChatMessage[];
  logs: SystemLog[];
  cloudBackup: CloudBackupInfo;
  koperasiProfile: KoperasiProfile;
  activeMemberId: string | null;
  activeAdminId: string | null;
}

function getStoredState(): AppState {
  try {
    // Clean old previous keys to enforce fresh clean start from 0
    localStorage.removeItem('KOPERASI_HWS_STORAGE_V6_SUPERADMIN_ONLY');
    localStorage.removeItem('KOPERASI_HWS_STORAGE_V5_RESET_ZERO');
    localStorage.removeItem('KOPERASI_HWS_STORAGE_V4');
    localStorage.removeItem('KOPERASI_HWS_STORAGE_V3');
    localStorage.removeItem('KOPERASI_HWS_STORAGE_V2');
    
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.kasCategories || parsed.kasCategories.length === 0) {
        parsed.kasCategories = INITIAL_KAS_CATEGORIES;
      }
      if (!parsed.memberDeleteRequests) parsed.memberDeleteRequests = [];
      if (!parsed.kasDeleteRequests) parsed.kasDeleteRequests = [];
      if (!parsed.kasEditRequests) parsed.kasEditRequests = [];
      if (!parsed.letters) parsed.letters = [];
      if (!parsed.koperasiProfile) parsed.koperasiProfile = KOPERASI_DEFAULT_PROFILE;
      
      // Ensure only 1 Super Admin and no lingering demo admins
      if (!parsed.admins || parsed.admins.length === 0 || parsed.admins.some((a: AdminUser) => a.username === 'robidarwis' || a.username === 'adminhapus')) {
        parsed.admins = INITIAL_ADMINS;
      }
      
      return parsed;
    }
  } catch (err) {
    console.error('Failed reading localStorage', err);
  }

  // Default initial clean state (Starting completely from 0: 0 members, 0 transactions, 0 kas entries, only 1 Super Admin)
  return {
    admins: INITIAL_ADMINS,
    members: CLEAN_MEMBERS,
    transactions: CLEAN_TRANSACTIONS,
    kasEntries: CLEAN_KAS_ENTRIES,
    kasCategories: INITIAL_KAS_CATEGORIES,
    memberDeleteRequests: CLEAN_MEMBER_DEL_REQUESTS,
    kasDeleteRequests: CLEAN_KAS_DEL_REQUESTS,
    kasEditRequests: [],
    letters: CLEAN_LETTERS,
    chats: CLEAN_CHATS,
    logs: CLEAN_LOGS,
    cloudBackup: {
      lastBackupTime: new Date().toISOString(),
      backupStatus: 'TERHUBUNG',
      googleCloudLocation: 'asia-southeast1 (Jakarta) - Google Cloud Run & Storage',
      totalRecords: 0,
      backupSizeKb: 14.2,
    },
    koperasiProfile: KOPERASI_DEFAULT_PROFILE,
    activeMemberId: null,
    activeAdminId: null,
  };
}

let currentState: AppState = getStoredState();
const listeners = new Set<() => void>();
let firestoreSyncTimer: any = null;

function syncStateToFirestore() {
  try {
    const docRef = doc(db, 'appState', 'koperasi_data');
    setDoc(docRef, {
      members: currentState.members,
      transactions: currentState.transactions,
      kasEntries: currentState.kasEntries,
      admins: currentState.admins,
      kasCategories: currentState.kasCategories,
      letters: currentState.letters,
      chats: currentState.chats,
      logs: currentState.logs,
      koperasiProfile: currentState.koperasiProfile,
      updatedAt: new Date().toISOString(),
    }, { merge: true }).catch((err) => {
      console.warn('[Firebase] Firestore background sync queued:', err?.message || err);
    });
  } catch (err) {
    console.warn('[Firebase] Firestore sync error:', err);
  }
}

function notify(skipFirestoreSync = false) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  } catch (err) {
    console.warn('LocalStorage save failed', err);
  }
  listeners.forEach((fn) => fn());

  if (!skipFirestoreSync) {
    if (firestoreSyncTimer) clearTimeout(firestoreSyncTimer);
    firestoreSyncTimer = setTimeout(syncStateToFirestore, 600);
  }
}

// Subscribe to Firestore Realtime Updates across devices & tabs
try {
  const stateDocRef = doc(db, 'appState', 'koperasi_data');
  onSnapshot(stateDocRef, (snapshot) => {
    if (snapshot.exists()) {
      const cloudData = snapshot.data();
      if (cloudData) {
        let changed = false;
        if (Array.isArray(cloudData.members) && JSON.stringify(cloudData.members) !== JSON.stringify(currentState.members)) {
          currentState.members = cloudData.members;
          changed = true;
        }
        if (Array.isArray(cloudData.transactions) && JSON.stringify(cloudData.transactions) !== JSON.stringify(currentState.transactions)) {
          currentState.transactions = cloudData.transactions;
          changed = true;
        }
        if (Array.isArray(cloudData.kasEntries) && JSON.stringify(cloudData.kasEntries) !== JSON.stringify(currentState.kasEntries)) {
          currentState.kasEntries = cloudData.kasEntries;
          changed = true;
        }
        if (Array.isArray(cloudData.admins) && cloudData.admins.length > 0 && JSON.stringify(cloudData.admins) !== JSON.stringify(currentState.admins)) {
          currentState.admins = cloudData.admins;
          changed = true;
        }
        if (cloudData.koperasiProfile && JSON.stringify(cloudData.koperasiProfile) !== JSON.stringify(currentState.koperasiProfile)) {
          currentState.koperasiProfile = cloudData.koperasiProfile;
          changed = true;
        }
        if (changed) {
          appStore.recalculateKasBalances();
          notify(true);
        }
      }
    } else {
      // First time initialization in cloud Firestore
      syncStateToFirestore();
    }
  }, (err) => {
    console.warn('[Firebase] Firestore onSnapshot warning:', err?.message || err);
  });
} catch (err) {
  console.warn('[Firebase] Realtime listener setup:', err);
}

export const appStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  getState(): AppState {
    return currentState;
  },

  getKoperasiProfile(): KoperasiProfile {
    return currentState.koperasiProfile;
  },

  // Recalculates running balances of all kas entries (Point C.11)
  recalculateKasBalances() {
    let saldoAnggota = 0;
    let saldoKoperasi = 0;

    currentState.kasEntries.forEach((entry) => {
      if (entry.bukuKas === 'KAS_ANGGOTA') {
        if (entry.tipe === 'MASUK') {
          saldoAnggota += entry.nominal;
        } else {
          saldoAnggota = Math.max(0, saldoAnggota - entry.nominal);
        }
        entry.saldoSetelah = saldoAnggota;
      } else {
        if (entry.tipe === 'MASUK') {
          saldoKoperasi += entry.nominal;
        } else {
          saldoKoperasi = Math.max(0, saldoKoperasi - entry.nominal);
        }
        entry.saldoSetelah = saldoKoperasi;
      }
    });
  },

  // Log action (Point 10: History log ter-record hanya 60 hari)
  logActivity(adminName: string, action: string, details: string) {
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      adminName,
      action,
      details,
    };
    const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
    currentState.logs = [newLog, ...currentState.logs.filter((l) => new Date(l.timestamp).getTime() >= sixtyDaysAgo)];
    notify();
  },

  // Auth
  loginMember(identifier: string, pass: string): MemberUser | null {
    const cleanId = identifier.trim().toLowerCase();
    const member = currentState.members.find((m) => {
      const matchNoAnggota = m.noAnggota.toLowerCase() === cleanId;
      const matchHp = m.noHp === cleanId;
      const matchRek = m.noRekKoperasi === cleanId;
      return (matchNoAnggota || matchHp || matchRek) && m.password === pass;
    });

    if (member) {
      currentState.activeMemberId = member.id;
      currentState.activeAdminId = null; // Strict separation
      notify();
      return member;
    }
    return null;
  },

  loginAdmin(username: string, pass: string): AdminUser | null {
    const cleanUser = username.trim().toLowerCase();
    const admin = currentState.admins.find((a) => {
      const matchUser = a.username.toLowerCase() === cleanUser;
      const matchEmail = a.email.toLowerCase() === cleanUser;
      return (matchUser || matchEmail) && a.password === pass;
    });

    if (admin) {
      currentState.activeAdminId = admin.id;
      currentState.activeMemberId = null;
      this.logActivity(admin.nama, 'LOGIN_ADMIN', `Admin ${admin.nama} (${admin.roleTitle}) berhasil masuk.`);
      notify();
      return admin;
    }
    return null;
  },

  logout() {
    currentState.activeMemberId = null;
    currentState.activeAdminId = null;
    notify();
  },

  // Member Registration (Points B.5, 10, 12, 16, 49)
  registerMember(data: {
    nama: string;
    nik: string;
    noHp: string;
    email?: string;
    password: string;
    securityQuestion?: string;
    securityAnswer?: string;
    wilayah: WilayahJakarta;
    bankAnggota: string;
    noRekBank: string;
    atasNamaRekBank: string;
    alamat: string;
    rtRw: string;
    kelurahan: string;
    kecamatan: string;
    kota: string;
    provinsi: string;
    kodePos: string;
    fotoKtp?: string;
  }): MemberUser {
    const cleanedNik = cleanNik(data.nik);
    const cleanedHp = cleanPhoneNumber(data.noHp);

    if (!cleanedNik || cleanedNik.length < 8) {
      throw new Error('Nomor NIK tidak valid. Harap masukkan nomor NIK KTP yang benar.');
    }
    if (!cleanedHp || cleanedHp.length < 8) {
      throw new Error('Nomor HP tidak valid. Harap masukkan nomor telepon/HP aktif yang benar.');
    }

    // Cek duplikasi NIK: NIK tidak dapat digunakan dua kali
    const existingNik = currentState.members.find((m) => cleanNik(m.nik) === cleanedNik);
    if (existingNik) {
      throw new Error(`NIK "${data.nik}" sudah terdaftar atas nama ${existingNik.nama} (${existingNik.noAnggota})! NIK tidak dapat digunakan dua kali.`);
    }

    // Cek duplikasi No HP: Nomor telepon tidak dapat digunakan dua kali
    const existingHp = currentState.members.find((m) => cleanPhoneNumber(m.noHp) === cleanedHp);
    if (existingHp) {
      throw new Error(`Nomor HP "${data.noHp}" sudah terdaftar atas nama ${existingHp.nama} (${existingHp.noAnggota})! Nomor telepon tidak dapat digunakan dua kali.`);
    }

    const nextIndex = currentState.members.length + 1;
    const noAnggota = generateNoAnggota(data.wilayah, nextIndex);
    const noRekKoperasi = generateRekKoperasi(data.wilayah, data.noHp, currentState.members.length);

    const newMember: MemberUser = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      noAnggota,
      nama: data.nama.trim(),
      nik: data.nik.trim(),
      noHp: data.noHp.trim(),
      email: data.email?.trim() || '',
      password: data.password,
      securityQuestion: data.securityQuestion || 'Apa nama ibu kandung Anda?',
      securityAnswer: data.securityAnswer || 'Siti',
      wilayah: data.wilayah,
      noRekKoperasi,
      bankAnggota: data.bankAnggota,
      noRekBank: data.noRekBank.trim(),
      atasNamaRekBank: data.atasNamaRekBank.trim() || data.nama.trim(),
      alamat: data.alamat.trim(),
      rtRw: data.rtRw.trim(),
      kelurahan: data.kelurahan.trim(),
      kecamatan: data.kecamatan.trim(),
      kota: data.kota.trim() || 'Jakarta Barat',
      provinsi: data.provinsi.trim() || 'DKI Jakarta',
      kodePos: data.kodePos.trim() || '11740',
      fotoKtp: data.fotoKtp,
      tanggalBergabung: new Date().toLocaleDateString('id-ID'),
      isVerified: true,
      isPokokLocked: true,
      saldoPokok: 0,
      saldoZakat: 0,
      saldoQurban: 0,
      saldoUmum: 0,
      statusKeanggotaan: 'AKTIF'
    };

    currentState.members.push(newMember);
    this.logActivity('Sistem Pendaftaran', 'DAFTAR_ANGGOTA_BARU', `Pendaftaran anggota baru: ${newMember.nama} (${newMember.noAnggota}) Wilayah ${newMember.wilayah}`);
    notify();
    return newMember;
  },

  // Edit Member Profile & Password (Point 9, 12)
  updateMember(memberId: string, updates: Partial<MemberUser>, adminName?: string) {
    const idx = currentState.members.findIndex((m) => m.id === memberId);
    if (idx === -1) return;

    if (updates.nik) {
      const cNik = cleanNik(updates.nik);
      const dupNik = currentState.members.find((m) => m.id !== memberId && cleanNik(m.nik) === cNik);
      if (dupNik) {
        throw new Error(`NIK "${updates.nik}" sudah terdaftar atas nama anggota lain (${dupNik.nama})! NIK tidak dapat digunakan dua kali.`);
      }
    }

    if (updates.noHp) {
      const cHp = cleanPhoneNumber(updates.noHp);
      const dupHp = currentState.members.find((m) => m.id !== memberId && cleanPhoneNumber(m.noHp) === cHp);
      if (dupHp) {
        throw new Error(`Nomor HP "${updates.noHp}" sudah terdaftar atas nama anggota lain (${dupHp.nama})! Nomor HP tidak dapat digunakan dua kali.`);
      }
    }

    currentState.members[idx] = { ...currentState.members[idx], ...updates };
    if (adminName) {
      this.logActivity(adminName, 'UPDATE_ANGGOTA', `Update data anggota: ${currentState.members[idx].nama}`);
    }
    notify();
  },

  // Request Delete Member by Admin Write (Point B.4)
  requestDeleteMember(memberId: string, adminUser: AdminUser) {
    const member = currentState.members.find((m) => m.id === memberId);
    if (!member) throw new Error('Anggota tidak ditemukan');

    const totalSaldo = member.saldoPokok + member.saldoUmum;
    const req: DeleteMemberRequest = {
      id: `req-del-mem-${Date.now()}`,
      memberId: member.id,
      memberNama: member.nama,
      memberNoAnggota: member.noAnggota,
      sisaSaldo: totalSaldo,
      requestedBy: adminUser.nama,
      requestedAt: new Date().toLocaleString('id-ID'),
      status: 'PENDING',
    };

    currentState.memberDeleteRequests.push(req);
    this.logActivity(adminUser.nama, 'AJUKAN_HAPUS_ANGGOTA', `Mengajukan penghapusan anggota ${member.nama} (${member.noAnggota}) saldo Rp ${totalSaldo.toLocaleString('id-ID')}`);
    notify();
    return req;
  },

  approveDeleteMemberRequest(requestId: string, superAdminUser: AdminUser) {
    if (superAdminUser.role !== 'SUPER_ADMIN') {
      throw new Error('Hanya Super Admin yang dapat menyetujui penghapusan anggota.');
    }
    const req = currentState.memberDeleteRequests.find((r) => r.id === requestId);
    if (!req || req.status !== 'PENDING') return;

    this.deleteMember(req.memberId, superAdminUser);
    req.status = 'APPROVED';
    notify();
  },

  rejectDeleteMemberRequest(requestId: string, superAdminUser: AdminUser) {
    if (superAdminUser.role !== 'SUPER_ADMIN') {
      throw new Error('Hanya Super Admin yang dapat menolak penghapusan anggota.');
    }
    const req = currentState.memberDeleteRequests.find((r) => r.id === requestId);
    if (!req) return;
    req.status = 'REJECTED';
    this.logActivity(superAdminUser.nama, 'TOLAK_HAPUS_ANGGOTA', `Menolak permohonan hapus anggota ${req.memberNama}`);
    notify();
  },

  // Delete Member (Hanya bisa dilakukan oleh Super Admin)
  deleteMember(memberId: string, adminUser: AdminUser) {
    if (adminUser.role !== 'SUPER_ADMIN') {
      throw new Error('Penghapusan data anggota HANYA dapat dilakukan oleh Super Admin!');
    }

    const member = currentState.members.find((m) => m.id === memberId);
    if (!member) throw new Error('Data anggota tidak ditemukan');

    const totalSisaSaldo = (member.saldoPokok || 0) + (member.saldoUmum || 0) + (member.saldoZakat || 0) + (member.saldoQurban || 0);

    if (totalSisaSaldo > 0) {
      const today = new Date().toLocaleDateString('id-ID');
      
      // Kas Anggota: Pengeluaran "pindah kas hapus account"
      const saldoKasAnggotaSaatIni = this.getSaldoKasAnggota();
      const kasAnggotaBaru: BukuKasEntry = {
        id: `kas-del-ang-${Date.now()}`,
        bukuKas: 'KAS_ANGGOTA',
        tanggal: today,
        tipe: 'KELUAR',
        kategori: 'pindah kas hapus account',
        keterangan: `Pindah kas hapus akun ${member.nama} (${member.noAnggota})`,
        nominal: totalSisaSaldo,
        saldoSetelah: Math.max(0, saldoKasAnggotaSaatIni - totalSisaSaldo),
        isProtected: false,
        createdBy: adminUser.nama,
        createdAt: new Date().toISOString()
      };
      currentState.kasEntries.push(kasAnggotaBaru);

      // Kas Koperasi: Penambahan dengan kategori "anggota tutup account"
      const saldoKasKoperasiSaatIni = this.getSaldoKasKoperasi();
      const kasKoperasiBaru: BukuKasEntry = {
        id: `kas-del-kop-${Date.now() + 1}`,
        bukuKas: 'KAS_KOPERASI',
        tanggal: today,
        tipe: 'MASUK',
        kategori: 'anggota tutup account',
        keterangan: `Tutup acoount ${member.nama} dan sisa saldo Rp ${totalSisaSaldo.toLocaleString('id-ID')}`,
        nominal: totalSisaSaldo,
        saldoSetelah: saldoKasKoperasiSaatIni + totalSisaSaldo,
        isProtected: false,
        createdBy: adminUser.nama,
        createdAt: new Date().toISOString()
      };
      currentState.kasEntries.push(kasKoperasiBaru);
    }

    // Remove member from members list
    currentState.members = currentState.members.filter((m) => m.id !== memberId);
    
    // Clear active session if member is logged in
    if (currentState.activeMemberId === memberId) {
      currentState.activeMemberId = null;
    }

    // Clean up any pending delete requests
    currentState.memberDeleteRequests = currentState.memberDeleteRequests.filter((r) => r.memberId !== memberId);

    this.recalculateKasBalances();
    this.logActivity(adminUser.nama, 'HAPUS_ANGGOTA', `Menghapus anggota ${member.nama} (${member.noAnggota}) dengan pemindahan sisa saldo Rp ${totalSisaSaldo.toLocaleString('id-ID')}`);
    notify();
  },

  // Submit Deposit by Member (Point 1, 2, 20, 38)
  submitDeposit(data: {
    memberId: string;
    jenis: 'SETORAN_KEWAJIBAN' | 'SETORAN_UMUM';
    nominal: number;
    jumlahHari?: number;
    buktiTransfer?: string;
    metodePembayaran: 'TRANSFER_BANK' | 'QRIS_HWS';
  }) {
    const member = currentState.members.find((m) => m.id === data.memberId);
    if (!member) throw new Error('Anggota tidak ditemukan');

    const today = new Date().toLocaleDateString('id-ID');
    const newTx: MemberTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      memberId: member.id,
      namaAnggota: member.nama,
      noRekKoperasi: member.noRekKoperasi,
      tanggal: today,
      kategori: data.jenis === 'SETORAN_KEWAJIBAN' ? 'GABUNGAN_KEWAJIBAN' : 'UMUM',
      tipe: 'MASUK',
      nominal: data.nominal,
      cbg: '0001',
      saldoSetelah: (member.saldoPokok + member.saldoUmum),
      status: 'MENUNGGU_VERIFIKASI',
      buktiTransfer: data.buktiTransfer,
      metodePembayaran: data.metodePembayaran,
      keterangan: data.jenis === 'SETORAN_KEWAJIBAN'
        ? `Setoran Kewajiban ${member.nama} ${data.jumlahHari || 1} x 1000`
        : `Setoran Tunai ${member.nama}`,
      rincian: data.jenis === 'SETORAN_KEWAJIBAN' ? {
        jumlahHari: data.jumlahHari || 1,
        pokok: (data.jumlahHari || 1) * 1000,
        zakat: (data.jumlahHari || 1) * 500,
        qurban: (data.jumlahHari || 1) * 500,
        namaBank: member.bankAnggota,
      } : {
        namaBank: member.bankAnggota
      }
    };

    currentState.transactions.push(newTx);
    notify();
    return newTx;
  },

  // Verify Deposit by Admin (Points A.1, 1, 20, 48, 54)
  verifyDeposit(txId: string, adminUser: AdminUser, approve: boolean, catatan?: string) {
    const tx = currentState.transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'MENUNGGU_VERIFIKASI') return;

    if (!approve) {
      tx.status = 'DITOLAK';
      tx.verifiedBy = adminUser.nama;
      tx.verifiedAt = new Date().toISOString();
      tx.catatanAdmin = catatan || 'Setoran tidak sesuai bukti transfer';
      this.logActivity(adminUser.nama, 'TOLAK_SETORAN', `Menolak setoran ${tx.namaAnggota} senilai Rp ${tx.nominal.toLocaleString('id-ID')}`);
      notify();
      return;
    }

    const member = currentState.members.find((m) => m.id === tx.memberId);
    if (!member) return;

    tx.status = 'TERVERIFIKASI';
    tx.verifiedBy = adminUser.nama;
    tx.verifiedAt = new Date().toISOString();

    const today = new Date().toLocaleDateString('id-ID');

    if (tx.kategori === 'GABUNGAN_KEWAJIBAN') {
      const jmlHari = tx.rincian?.jumlahHari || Math.max(1, Math.floor(tx.nominal / 2000));
      const pokok = jmlHari * 1000;
      const zakat = jmlHari * 500;
      const qurban = jmlHari * 500;

      member.saldoPokok += pokok;
      member.saldoZakat += zakat;
      member.saldoQurban += qurban;
      // Per Request: Saldo mutasi tidak menjumlahkan tabungan umum dan tabungan kewajiban
      tx.saldoSetelah = member.saldoPokok;

      const currentKasAnggota = this.getSaldoKasAnggota();
      const kasAnggotaEntry: BukuKasEntry = {
        id: `kas-dep-ang-${Date.now()}`,
        bukuKas: 'KAS_ANGGOTA',
        tanggal: today,
        tipe: 'MASUK',
        kategori: 'Setoran Kewajiban Pokok',
        keterangan: `Setoran Kewajiban ${member.nama} ${jmlHari} x 1000`,
        nominal: pokok,
        saldoSetelah: currentKasAnggota + pokok,
        isProtected: true,
        createdBy: 'Sistem Terverifikasi',
        createdAt: new Date().toISOString(),
      };
      currentState.kasEntries.push(kasAnggotaEntry);

      // Pindahkan pencatatan setoran kewajiban semula tercatat di buku kas koperasi dan sekarang tercatat di buku kas anggota
      const kasZakatEntry: BukuKasEntry = {
        id: `kas-dep-zk-${Date.now()}`,
        bukuKas: 'KAS_ANGGOTA',
        tanggal: today,
        tipe: 'MASUK',
        kategori: 'Tabungan Zakat Fitrah',
        keterangan: `${member.nama} TAB ZAKAT FITRAH ${jmlHari} HARI DI KALI KEWAJIBAN PERHARI`,
        nominal: zakat,
        saldoSetelah: currentKasAnggota + pokok + zakat,
        isProtected: true,
        createdBy: 'Sistem Terverifikasi',
        createdAt: new Date().toISOString(),
      };
      currentState.kasEntries.push(kasZakatEntry);

      const kasQurbanEntry: BukuKasEntry = {
        id: `kas-dep-qb-${Date.now() + 1}`,
        bukuKas: 'KAS_ANGGOTA',
        tanggal: today,
        tipe: 'MASUK',
        kategori: 'Tabungan Qurban',
        keterangan: `${member.nama} TAB QURBAN ${jmlHari} HARI DI KALI KEWAJIBAN PERHARI`,
        nominal: qurban,
        saldoSetelah: currentKasAnggota + pokok + zakat + qurban,
        isProtected: true,
        createdBy: 'Sistem Terverifikasi',
        createdAt: new Date().toISOString(),
      };
      currentState.kasEntries.push(kasQurbanEntry);

    } else {
      member.saldoUmum += tx.nominal;
      // Per Request: Saldo mutasi tidak menjumlahkan tabungan umum dan tabungan kewajiban
      tx.saldoSetelah = member.saldoUmum;

      const currentKasAnggota = this.getSaldoKasAnggota();
      const kasAnggotaEntry: BukuKasEntry = {
        id: `kas-dep-um-${Date.now()}`,
        bukuKas: 'KAS_ANGGOTA',
        tanggal: today,
        tipe: 'MASUK',
        kategori: 'Setoran Tunai Umum',
        keterangan: `Setoran Tunai ${member.nama}`,
        nominal: tx.nominal,
        saldoSetelah: currentKasAnggota + tx.nominal,
        isProtected: true,
        createdBy: 'Sistem Terverifikasi',
        createdAt: new Date().toISOString(),
      };
      currentState.kasEntries.push(kasAnggotaEntry);
    }

    this.recalculateKasBalances();
    this.logActivity(adminUser.nama, 'VERIFIKASI_SETORAN', `Memverifikasi setoran ${member.nama} senilai Rp ${tx.nominal.toLocaleString('id-ID')}`);
    notify();
  },

  // Withdrawal by Member (Point 10, 21, 42, 47)
  withdrawByMember(data: {
    memberId: string;
    kategori: 'UMUM' | 'POKOK';
    nominal: number;
  }) {
    const member = currentState.members.find((m) => m.id === data.memberId);
    if (!member) throw new Error('Anggota tidak ditemukan');

    if (data.kategori === 'POKOK') {
      if (member.isPokokLocked) {
        throw new Error('Tabungan Pokok sedang dilock oleh Admin Koperasi. Silakan hubungi Admin.');
      }
      if (data.nominal > member.saldoPokok) {
        throw new Error('Nominal penarikan tidak boleh melebihi saldo simpanan pokok yang tersedia.');
      }
    } else {
      if (data.nominal > member.saldoUmum) {
        throw new Error('Nominal penarikan melebihi saldo tabungan umum yang tersedia.');
      }
    }

    const currentKasAnggota = this.getSaldoKasAnggota();
    if (currentKasAnggota < data.nominal) {
      throw new Error('Saldo Buku Kas Anggota saat ini tidak mencukupi untuk penarikan tunai.');
    }

    const today = new Date().toLocaleDateString('id-ID');

    if (data.kategori === 'POKOK') {
      member.saldoPokok -= data.nominal;
    } else {
      member.saldoUmum -= data.nominal;
    }

    const newTx: MemberTransaction = {
      id: `tx-wd-${Date.now()}`,
      memberId: member.id,
      namaAnggota: member.nama,
      noRekKoperasi: member.noRekKoperasi,
      tanggal: today,
      kategori: data.kategori === 'POKOK' ? 'POKOK' : 'UMUM',
      tipe: 'KELUAR',
      nominal: data.nominal,
      cbg: '0001',
      saldoSetelah: data.kategori === 'POKOK' ? member.saldoPokok : member.saldoUmum,
      status: 'TERVERIFIKASI',
      keterangan: data.kategori === 'POKOK'
        ? `Tarikan Tabungan Pokok ${member.nama}`
        : `Tarikan Tunai ${member.nama}`,
      rincian: {
        namaBank: member.bankAnggota,
      },
      verifiedBy: 'Sistem Koperasi',
      verifiedAt: new Date().toISOString()
    };
    currentState.transactions.push(newTx);

    const kasEntry: BukuKasEntry = {
      id: `kas-wd-${Date.now()}`,
      bukuKas: 'KAS_ANGGOTA',
      tanggal: today,
      tipe: 'KELUAR',
      kategori: data.kategori === 'POKOK' ? 'Tarikan Simpanan Pokok' : 'Tarikan Tunai Umum',
      keterangan: data.kategori === 'POKOK' ? `Tarikan Tabungan Pokok ${member.nama}` : `Tarikan Tunai ${member.nama}`,
      nominal: data.nominal,
      saldoSetelah: Math.max(0, currentKasAnggota - data.nominal),
      isProtected: true,
      createdBy: 'Sistem Terverifikasi',
      createdAt: new Date().toISOString()
    };
    currentState.kasEntries.push(kasEntry);

    this.recalculateKasBalances();
    notify();
    return newTx;
  },

  // Direct Admin Fund Adjustment to Member & Kas Anggota (Point F.2)
  directFundAdjustment(params: {
    tipe: 'MASUK' | 'KELUAR';
    target: 'SEMUA' | 'INDIVIDUAL';
    memberId?: string;
    nominalPerMember: number;
    keterangan: string;
    adminUser: AdminUser;
  }) {
    if (params.nominalPerMember <= 0) throw new Error('Nominal harus lebih dari 0');
    
    let targetMembers = currentState.members;
    if (params.target === 'INDIVIDUAL') {
      targetMembers = currentState.members.filter((m) => m.id === params.memberId);
    }
    if (targetMembers.length === 0) throw new Error('Tidak ada anggota yang dipilih');
    const totalDana = params.nominalPerMember * targetMembers.length;
    const currentKasAnggota = this.getSaldoKasAnggota();
    const currentKasKoperasi = this.getSaldoKasKoperasi();

    if (params.tipe === 'KELUAR' && currentKasAnggota < totalDana) {
      throw new Error(`Saldo Buku Kas Anggota (${currentKasAnggota.toLocaleString('id-ID')}) tidak mencukupi untuk penarikan total Rp ${totalDana.toLocaleString('id-ID')}`);
    }

    const today = new Date().toLocaleDateString('id-ID');
    const labelKeterangan = `Sesuaikan Saldo ${params.keterangan}`.trim();

    targetMembers.forEach((member) => {
      if (params.tipe === 'MASUK') {
        member.saldoUmum += params.nominalPerMember;
      } else {
        member.saldoUmum = Math.max(0, member.saldoUmum - params.nominalPerMember);
      }

      // Record to Member Transaction: Mutasi Tabungan Umum (Point 4.9)
      const newTx: MemberTransaction = {
        id: `tx-adj-${Date.now()}-${member.id}`,
        memberId: member.id,
        namaAnggota: member.nama,
        noRekKoperasi: member.noRekKoperasi,
        tanggal: today,
        kategori: 'UMUM',
        tipe: params.tipe,
        nominal: params.nominalPerMember,
        cbg: '0001',
        saldoSetelah: member.saldoUmum,
        status: 'TERVERIFIKASI',
        keterangan: labelKeterangan,
        verifiedBy: params.adminUser.nama,
        verifiedAt: new Date().toISOString()
      };
      currentState.transactions.push(newTx);
    });

    if (params.tipe === 'KELUAR') {
      // Penarikan dari anggota (Point 4.6): Keluar di kas anggota, masuk di kas koperasi
      const kasAnggotaKeluar: BukuKasEntry = {
        id: `kas-adj-ang-${Date.now()}`,
        bukuKas: 'KAS_ANGGOTA',
        tanggal: today,
        tipe: 'KELUAR',
        kategori: 'Penyesuaian Saldo',
        keterangan: labelKeterangan,
        nominal: totalDana,
        saldoSetelah: Math.max(0, currentKasAnggota - totalDana),
        isProtected: true,
        createdBy: params.adminUser.nama,
        createdAt: new Date().toISOString()
      };
      currentState.kasEntries.push(kasAnggotaKeluar);

      const kasKoperasiMasuk: BukuKasEntry = {
        id: `kas-adj-kop-${Date.now() + 1}`,
        bukuKas: 'KAS_KOPERASI',
        tanggal: today,
        tipe: 'MASUK',
        kategori: 'Penyesuaian Saldo',
        keterangan: labelKeterangan,
        nominal: totalDana,
        saldoSetelah: currentKasKoperasi + totalDana,
        isProtected: false,
        createdBy: params.adminUser.nama,
        createdAt: new Date().toISOString()
      };
      currentState.kasEntries.push(kasKoperasiMasuk);
    } else {
      // Penambahan ke anggota (Point 4.8): Keluar di kas koperasi, masuk di kas anggota
      const kasKoperasiKeluar: BukuKasEntry = {
        id: `kas-adj-kop-${Date.now()}`,
        bukuKas: 'KAS_KOPERASI',
        tanggal: today,
        tipe: 'KELUAR',
        kategori: 'Penyesuaian Saldo',
        keterangan: labelKeterangan,
        nominal: totalDana,
        saldoSetelah: Math.max(0, currentKasKoperasi - totalDana),
        isProtected: false,
        createdBy: params.adminUser.nama,
        createdAt: new Date().toISOString()
      };
      currentState.kasEntries.push(kasKoperasiKeluar);

      const kasAnggotaMasuk: BukuKasEntry = {
        id: `kas-adj-ang-${Date.now() + 1}`,
        bukuKas: 'KAS_ANGGOTA',
        tanggal: today,
        tipe: 'MASUK',
        kategori: 'Penyesuaian Saldo',
        keterangan: labelKeterangan,
        nominal: totalDana,
        saldoSetelah: currentKasAnggota + totalDana,
        isProtected: true,
        createdBy: params.adminUser.nama,
        createdAt: new Date().toISOString()
      };
      currentState.kasEntries.push(kasAnggotaMasuk);
    }

    this.recalculateKasBalances();
    this.logActivity(params.adminUser.nama, 'PENYESUAIAN_DANA_ADMIN', `${params.tipe} Rp ${totalDana.toLocaleString('id-ID')} kepada ${targetMembers.length} anggota. Ket: ${params.keterangan}`);
    notify();
  },

  // Toggle Pokok Lock for Member (Point 1, 10, 30)
  setMemberPokokLock(memberId: string, locked: boolean, adminUser: AdminUser) {
    const member = currentState.members.find((m) => m.id === memberId);
    if (!member) return;
    member.isPokokLocked = locked;
    this.logActivity(adminUser.nama, 'UBAH_LOCK_POKOK', `${locked ? 'Mengunci' : 'Membuka'} lock penarikan pokok untuk ${member.nama}`);
    notify();
  },

  // Zakat & Qurban Disbursement (Point 1, 25, 40, 48, 51, 52)
  disburseZakatQurban(params: {
    jenis: 'ZAKAT' | 'QURBAN';
    target: 'ALL' | 'WILAYAH' | 'INDIVIDUAL';
    wilayah?: WilayahJakarta;
    memberId?: string;
    keteranganPenyaluran: string;
    nominalPerAnggota?: number;
    adminUser: AdminUser;
  }) {
    if (params.adminUser.role !== 'SUPER_ADMIN') {
      throw new Error('Penyaluran Zakat & Qurban memerlukan persetujuan Super Admin.');
    }

    let targetMembers = currentState.members;
    if (params.target === 'WILAYAH' && params.wilayah) {
      targetMembers = currentState.members.filter((m) => m.wilayah === params.wilayah);
    } else if (params.target === 'INDIVIDUAL' && params.memberId) {
      targetMembers = currentState.members.filter((m) => m.id === params.memberId);
    }

    if (targetMembers.length === 0) {
      throw new Error('Tidak ada anggota yang dipilih untuk penyaluran.');
    }

    const today = new Date().toLocaleDateString('id-ID');
    let totalCair = 0;

    targetMembers.forEach((member) => {
      const saldoTersedia = params.jenis === 'ZAKAT' ? member.saldoZakat : member.saldoQurban;
      if (saldoTersedia <= 0) return;

      const nominal = params.nominalPerAnggota && params.nominalPerAnggota < saldoTersedia 
        ? params.nominalPerAnggota 
        : saldoTersedia;

      if (params.jenis === 'ZAKAT') {
        member.saldoZakat -= nominal;
      } else {
        member.saldoQurban -= nominal;
      }
      totalCair += nominal;

      const newTx: MemberTransaction = {
        id: `tx-zq-${Date.now()}-${member.id}`,
        memberId: member.id,
        namaAnggota: member.nama,
        noRekKoperasi: member.noRekKoperasi,
        tanggal: today,
        kategori: params.jenis === 'ZAKAT' ? 'ZAKAT' : 'QURBAN',
        tipe: 'KELUAR',
        nominal: nominal,
        cbg: '0001',
        saldoSetelah: member.saldoPokok + member.saldoUmum,
        status: 'TERVERIFIKASI',
        keterangan: 'Disalurkan Oleh Koperasi',
        rincian: {
          targetPenyaluran: params.keteranganPenyaluran,
        },
        verifiedBy: params.adminUser.nama,
        verifiedAt: new Date().toISOString()
      };
      currentState.transactions.push(newTx);
    });

    if (totalCair === 0) {
      throw new Error('Saldo anggota yang dipilih adalah 0, tidak ada dana yang dapat disalurkan.');
    }

    const currentKasKoperasi = this.getSaldoKasKoperasi();
    if (currentKasKoperasi < totalCair) {
      throw new Error('Saldo Buku Kas Koperasi tidak mencukupi untuk penyaluran ini.');
    }

    const kasEntry: BukuKasEntry = {
      id: `kas-zq-${Date.now()}`,
      bukuKas: 'KAS_KOPERASI',
      tanggal: today,
      tipe: 'KELUAR',
      kategori: `Penyaluran ${params.jenis === 'ZAKAT' ? 'Zakat Fitrah' : 'Qurban'}`,
      keterangan: `Penyaluran ${params.jenis === 'ZAKAT' ? 'Zakat' : 'Qurban'}: ${params.keteranganPenyaluran} (${targetMembers.length} anggota)`,
      nominal: totalCair,
      saldoSetelah: Math.max(0, currentKasKoperasi - totalCair),
      isProtected: false,
      createdBy: params.adminUser.nama,
      createdAt: new Date().toISOString()
    };
    currentState.kasEntries.push(kasEntry);

    this.recalculateKasBalances();
    this.logActivity(params.adminUser.nama, 'PENYALURAN_ZAKAT_QURBAN', `Menyalurkan ${params.jenis} total Rp ${totalCair.toLocaleString('id-ID')} kepada ${targetMembers.length} anggota. Ket: ${params.keteranganPenyaluran}`);
    notify();
    return totalCair;
  },

  // Dynamic Kas Categories Management (Point C.7)
  addKasCategory(data: { nama: string; tipe: 'MASUK' | 'KELUAR'; bukuKas: 'KAS_ANGGOTA' | 'KAS_KOPERASI'; adminName: string }) {
    const newCat: KasCategory = {
      id: `cat-${Date.now()}`,
      nama: data.nama.trim(),
      tipe: data.tipe,
      bukuKas: data.bukuKas,
    };
    currentState.kasCategories.push(newCat);
    this.logActivity(data.adminName, 'TAMBAH_KATEGORI_KAS', `Menambahkan kategori baru: ${newCat.nama} (${newCat.tipe} - ${newCat.bukuKas})`);
    notify();
    return newCat;
  },

  deleteKasCategory(catId: string, adminName: string) {
    currentState.kasCategories = currentState.kasCategories.filter((c) => c.id !== catId);
    this.logActivity(adminName, 'HAPUS_KATEGORI_KAS', `Menghapus kategori kas ID: ${catId}`);
    notify();
  },

  // Manual Kas Entry - Supports both Kas Anggota and Kas Koperasi (Point 1: Input nominal bebas)
  addManualKasEntry(data: {
    bukuKas: 'KAS_ANGGOTA' | 'KAS_KOPERASI';
    tipe: 'MASUK' | 'KELUAR';
    kategori: string;
    keterangan: string;
    nominal: number;
    adminUser: AdminUser;
  }) {
    if (data.nominal <= 0) throw new Error('Nominal harus lebih dari 0');
    const isKasAnggota = data.bukuKas === 'KAS_ANGGOTA';
    const currentSaldo = isKasAnggota ? this.getSaldoKasAnggota() : this.getSaldoKasKoperasi();
    if (data.tipe === 'KELUAR' && currentSaldo < data.nominal) {
      throw new Error(`Saldo ${isKasAnggota ? 'Buku Kas Anggota' : 'Buku Kas Koperasi'} tidak mencukupi untuk pengeluaran ini.`);
    }

    const today = new Date().toLocaleDateString('id-ID');
    const newEntry: BukuKasEntry = {
      id: `kas-man-${Date.now()}`,
      bukuKas: data.bukuKas,
      tanggal: today,
      tipe: data.tipe,
      kategori: data.kategori,
      keterangan: data.keterangan,
      nominal: data.nominal,
      saldoSetelah: data.tipe === 'MASUK' ? currentSaldo + data.nominal : Math.max(0, currentSaldo - data.nominal),
      isProtected: false,
      createdBy: data.adminUser.nama,
      createdAt: new Date().toISOString()
    };

    currentState.kasEntries.push(newEntry);
    this.recalculateKasBalances();
    this.logActivity(data.adminUser.nama, 'INPUT_KAS_MANUAL', `${data.tipe === 'MASUK' ? 'Pemasukan' : 'Pengeluaran'} ${isKasAnggota ? 'Kas Anggota' : 'Kas Koperasi'}: ${data.kategori} - Rp ${data.nominal.toLocaleString('id-ID')}`);
    notify();
    return newEntry;
  },

  // Buku Kas Koperasi Overhead / Manual Entry (Point 6, 35, 36b, 47, 58)
  addKasKoperasiEntry(data: {
    tipe: 'MASUK' | 'KELUAR';
    kategori: string;
    keterangan: string;
    nominal: number;
    adminUser: AdminUser;
  }) {
    return this.addManualKasEntry({
      ...data,
      bukuKas: 'KAS_KOPERASI'
    });
  },

  // Edit / Delete Kas Entry (Buku Kas Anggota & Koperasi)
  updateKasEntry(entryId: string, updates: { keterangan?: string; nominal?: number; kategori?: string }, adminUser: AdminUser) {
    const isSuperOrPembukuan = adminUser.role === 'SUPER_ADMIN' || adminUser.role === 'ADMIN_HAPUS';
    if (!isSuperOrPembukuan && adminUser.role !== 'ADMIN_WRITE') {
      throw new Error('Hanya Super Admin, Admin Pembukuan, atau Admin Write yang dapat mengedit transaksi kas.');
    }
    const idx = currentState.kasEntries.findIndex((k) => k.id === entryId);
    if (idx === -1) throw new Error('Entri kas tidak ditemukan');
    const entry = currentState.kasEntries[idx];

    // Admin Write: merubah buku kas akan diverifikasi oleh Super Admin dan Admin Pembukuan
    if (adminUser.role === 'ADMIN_WRITE') {
      const req: EditKasRequest = {
        id: `req-edit-kas-${Date.now()}`,
        kasEntryId: entry.id,
        bukuKas: entry.bukuKas,
        keteranganLama: entry.keterangan,
        nominalLama: entry.nominal,
        kategoriLama: entry.kategori,
        keteranganBaru: updates.keterangan !== undefined ? updates.keterangan : entry.keterangan,
        nominalBaru: updates.nominal !== undefined ? updates.nominal : entry.nominal,
        kategoriBaru: updates.kategori !== undefined ? updates.kategori : entry.kategori,
        requestedBy: adminUser.nama,
        requestedAt: new Date().toLocaleString('id-ID'),
        status: 'PENDING',
      };
      currentState.kasEditRequests.push(req);
      this.logActivity(adminUser.nama, 'AJUKAN_EDIT_KAS', `Mengajukan perubahan kas: ${entry.keterangan} -> ${req.keteranganBaru} (${entry.bukuKas}) untuk diverifikasi Super Admin/Admin Pembukuan.`);
      notify();
      return { isPending: true, request: req };
    }

    // Super Admin & Admin Pembukuan: langsung dirubah
    currentState.kasEntries[idx] = {
      ...currentState.kasEntries[idx],
      ...updates,
      updatedBy: adminUser.nama,
      updatedAt: new Date().toISOString()
    };
    
    // Automatically recalculate running balance
    this.recalculateKasBalances();
    const bukuLabel = entry.bukuKas === 'KAS_ANGGOTA' ? 'Buku Kas Anggota' : 'Buku Kas Koperasi';
    this.logActivity(adminUser.nama, 'EDIT_KAS', `Mengubah transaksi ${bukuLabel}: "${currentState.kasEntries[idx].keterangan}" nominal Rp ${currentState.kasEntries[idx].nominal.toLocaleString('id-ID')}`);
    notify();
    return { isPending: false };
  },

  approveEditKasRequest(requestId: string, adminUser: AdminUser) {
    if (adminUser.role !== 'SUPER_ADMIN' && adminUser.role !== 'ADMIN_HAPUS') {
      throw new Error('Hanya Super Admin dan Admin Pembukuan yang dapat menyetujui perubahan buku kas.');
    }
    const req = currentState.kasEditRequests.find((r) => r.id === requestId);
    if (!req || req.status !== 'PENDING') return;

    const entry = currentState.kasEntries.find((k) => k.id === req.kasEntryId);
    if (entry) {
      entry.keterangan = req.keteranganBaru;
      entry.nominal = req.nominalBaru;
      entry.kategori = req.kategoriBaru;
      entry.updatedBy = `${req.requestedBy} (Diverifikasi ${adminUser.nama})`;
      entry.updatedAt = new Date().toISOString();
      this.recalculateKasBalances();
    }
    req.status = 'APPROVED';
    this.logActivity(adminUser.nama, 'SETUJUI_EDIT_KAS', `Menyetujui perubahan transaksi kas: "${req.keteranganBaru}" - Rp ${req.nominalBaru.toLocaleString('id-ID')}`);
    notify();
  },

  rejectEditKasRequest(requestId: string, adminUser: AdminUser) {
    if (adminUser.role !== 'SUPER_ADMIN' && adminUser.role !== 'ADMIN_HAPUS') {
      throw new Error('Hanya Super Admin dan Admin Pembukuan yang dapat menolak perubahan buku kas.');
    }
    const req = currentState.kasEditRequests.find((r) => r.id === requestId);
    if (!req) return;
    req.status = 'REJECTED';
    this.logActivity(adminUser.nama, 'TOLAK_EDIT_KAS', `Menolak permohonan perubahan kas: "${req.keteranganBaru}"`);
    notify();
  },

  // Request Delete Kas by Admin Write
  requestDeleteKas(entryId: string, adminUser: AdminUser) {
    const entry = currentState.kasEntries.find((k) => k.id === entryId);
    if (!entry) throw new Error('Entri kas tidak ditemukan');

    const req: DeleteKasRequest = {
      id: `req-del-kas-${Date.now()}`,
      kasEntryId: entry.id,
      keterangan: entry.keterangan,
      nominal: entry.nominal,
      bukuKas: entry.bukuKas,
      requestedBy: adminUser.nama,
      requestedAt: new Date().toLocaleString('id-ID'),
      status: 'PENDING',
    };

    currentState.kasDeleteRequests.push(req);
    this.logActivity(adminUser.nama, 'AJUKAN_HAPUS_KAS', `Mengajukan hapus kas: ${entry.keterangan} - Rp ${entry.nominal.toLocaleString('id-ID')} untuk diverifikasi Super Admin/Admin Pembukuan.`);
    notify();
    return { isPending: true, request: req };
  },

  approveDeleteKasRequest(requestId: string, adminUser: AdminUser) {
    if (adminUser.role !== 'SUPER_ADMIN' && adminUser.role !== 'ADMIN_HAPUS') {
      throw new Error('Hanya Super Admin dan Admin Pembukuan yang dapat menyetujui penghapusan kas.');
    }
    const req = currentState.kasDeleteRequests.find((r) => r.id === requestId);
    if (!req || req.status !== 'PENDING') return;

    // Directly delete the entry
    const entry = currentState.kasEntries.find((k) => k.id === req.kasEntryId);
    if (entry) {
      currentState.kasEntries = currentState.kasEntries.filter((k) => k.id !== req.kasEntryId);
      currentState.kasEditRequests = currentState.kasEditRequests.filter((r) => r.kasEntryId !== req.kasEntryId);
      this.recalculateKasBalances();
      const bukuLabel = entry.bukuKas === 'KAS_ANGGOTA' ? 'Buku Kas Anggota' : 'Buku Kas Koperasi';
      this.logActivity(adminUser.nama, 'SETUJUI_HAPUS_KAS', `Menyetujui hapus transaksi ${bukuLabel}: "${entry.keterangan}" - Rp ${entry.nominal.toLocaleString('id-ID')}`);
    }
    req.status = 'APPROVED';
    notify();
  },

  rejectDeleteKasRequest(requestId: string, adminUser: AdminUser) {
    if (adminUser.role !== 'SUPER_ADMIN' && adminUser.role !== 'ADMIN_HAPUS') {
      throw new Error('Hanya Super Admin dan Admin Pembukuan yang dapat menolak penghapusan kas.');
    }
    const req = currentState.kasDeleteRequests.find((r) => r.id === requestId);
    if (!req) return;
    req.status = 'REJECTED';
    this.logActivity(adminUser.nama, 'TOLAK_HAPUS_KAS', `Menolak permohonan hapus kas: ${req.keterangan}`);
    notify();
  },

  deleteKasEntry(entryId: string, adminUser: AdminUser) {
    const isSuperOrPembukuan = adminUser.role === 'SUPER_ADMIN' || adminUser.role === 'ADMIN_HAPUS';
    if (!isSuperOrPembukuan && adminUser.role !== 'ADMIN_WRITE') {
      throw new Error('Anda tidak memiliki izin untuk menghapus transaksi kas.');
    }
    const entry = currentState.kasEntries.find((k) => k.id === entryId);
    if (!entry) return;

    // Admin Write: menghapus buku kas akan diverifikasi oleh super admin dan admin pembukuan
    if (adminUser.role === 'ADMIN_WRITE') {
      return this.requestDeleteKas(entryId, adminUser);
    }

    // Super Admin & Admin Pembukuan: langsung dihapus
    currentState.kasEntries = currentState.kasEntries.filter((k) => k.id !== entryId);
    currentState.kasDeleteRequests = currentState.kasDeleteRequests.filter((r) => r.kasEntryId !== entryId);
    currentState.kasEditRequests = currentState.kasEditRequests.filter((r) => r.kasEntryId !== entryId);
    
    // Saldo otomatis berubah menyesuaikan secara matematis
    this.recalculateKasBalances();
    const bukuLabel = entry.bukuKas === 'KAS_ANGGOTA' ? 'Buku Kas Anggota' : 'Buku Kas Koperasi';
    this.logActivity(adminUser.nama, 'HAPUS_KAS', `Menghapus transaksi ${bukuLabel}: "${entry.keterangan}" - Rp ${entry.nominal.toLocaleString('id-ID')}`);
    notify();
    return { isPending: false };
  },

  // Surat Menyurat (Official Letters) (Point F.1)
  createOfficialLetter(data: {
    nomorSurat: string;
    perihal: string;
    targetType: 'SEMUA' | 'INDIVIDUAL';
    targetMemberId?: string;
    targetMemberName?: string;
    isiSurat: string;
    senderName: string;
  }) {
    let targetNoHp = '';
    let targetEmail = '';

    if (data.targetType === 'INDIVIDUAL' && data.targetMemberId) {
      const mem = currentState.members.find((m) => m.id === data.targetMemberId);
      if (mem) {
        targetNoHp = mem.noHp;
      }
    }

    const newLetter: OfficialLetter = {
      id: `letter-${Date.now()}`,
      nomorSurat: data.nomorSurat.trim(),
      perihal: data.perihal.trim(),
      tanggal: new Date().toLocaleDateString('id-ID'),
      targetType: data.targetType,
      targetMemberId: data.targetMemberId,
      targetMemberName: data.targetMemberName,
      targetNoHp,
      targetEmail,
      isiSurat: data.isiSurat.trim(),
      senderName: data.senderName,
      createdAt: new Date().toISOString(),
    };

    currentState.letters.push(newLetter);
    this.logActivity(data.senderName, 'BUAT_SURAT_RESMI', `Menerbitkan surat resmi: ${newLetter.nomorSurat} (${newLetter.perihal}) untuk ${newLetter.targetType === 'SEMUA' ? 'Seluruh Anggota' : newLetter.targetMemberName}`);
    notify();
    return newLetter;
  },

  // Chat Anggota (Point 14)
  sendChatMessage(params: {
    memberId: string;
    memberName: string;
    sender: 'MEMBER' | 'ADMIN';
    adminName?: string;
    text: string;
  }) {
    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      memberId: params.memberId,
      memberName: params.memberName,
      sender: params.sender,
      adminName: params.adminName,
      text: params.text.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    const twentyDaysAgo = Date.now() - 20 * 24 * 60 * 60 * 1000;
    currentState.chats = [...currentState.chats.filter((c) => new Date(c.timestamp).getTime() >= twentyDaysAgo), newMsg];
    notify();
    return newMsg;
  },

  // Admin Management (Points E.1, E.2, 7, 9, 34, 60)
  addAdmin(data: Omit<AdminUser, 'id' | 'createdAt'>, superAdminUser: AdminUser) {
    if (superAdminUser.role !== 'SUPER_ADMIN') {
      throw new Error('Hanya Super Admin yang dapat menambahkan akun admin.');
    }

    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      username: data.username.toLowerCase().trim(),
      nama: data.nama.trim(),
      email: data.email.trim(),
      role: data.role,
      roleTitle: data.roleTitle,
      noHp: data.noHp.trim(),
      nik: data.nik?.trim() || '',
      alamat: data.alamat?.trim() || '',
      provinsi: data.provinsi?.trim() || 'DKI Jakarta',
      kota: data.kota?.trim() || 'Jakarta Barat',
      kecamatan: data.kecamatan?.trim() || '',
      kelurahan: data.kelurahan?.trim() || '',
      rtRw: data.rtRw?.trim() || '',
      kodePos: data.kodePos?.trim() || '',
      fotoKtp: data.fotoKtp,
      password: data.password || 'admin123',
      createdAt: new Date().toLocaleDateString('id-ID'),
    };

    currentState.admins.push(newAdmin);
    this.logActivity(superAdminUser.nama, 'TAMBAH_ADMIN', `Menambahkan admin baru: ${newAdmin.nama} (${newAdmin.roleTitle})`);
    notify();
    return newAdmin;
  },

  updateAdmin(adminId: string, updates: Partial<AdminUser>, editorAdmin: AdminUser) {
    if (editorAdmin.role !== 'SUPER_ADMIN' && editorAdmin.id !== adminId) {
      throw new Error('Tidak memiliki akses untuk mengubah profil admin ini.');
    }

    const idx = currentState.admins.findIndex((a) => a.id === adminId);
    if (idx === -1) return;

    currentState.admins[idx] = { ...currentState.admins[idx], ...updates };
    this.logActivity(editorAdmin.nama, 'UPDATE_ADMIN', `Memperbarui data admin: ${currentState.admins[idx].nama}`);
    notify();
  },

  deleteAdmin(adminId: string, superAdminUser: AdminUser) {
    if (superAdminUser.role !== 'SUPER_ADMIN') {
      throw new Error('Hanya Super Admin yang dapat menghapus akun admin.');
    }
    if (adminId === superAdminUser.id) {
      throw new Error('Tidak dapat menghapus akun Super Admin yang sedang aktif.');
    }

    const admin = currentState.admins.find((a) => a.id === adminId);
    if (!admin) return;

    currentState.admins = currentState.admins.filter((a) => a.id !== adminId);
    this.logActivity(superAdminUser.nama, 'HAPUS_ADMIN', `Menghapus akun admin: ${admin.nama} (${admin.username})`);
    notify();
  },

  // Koperasi Profile Management (Point 4.14)
  updateKoperasiProfile(profile: Partial<KoperasiProfile>, superAdminUser: AdminUser) {
    if (superAdminUser.role !== 'SUPER_ADMIN') {
      throw new Error('Hanya Super Admin yang dapat mengubah profil koperasi.');
    }
    currentState.koperasiProfile = {
      ...currentState.koperasiProfile,
      ...profile,
      updatedAt: new Date().toLocaleDateString('id-ID'),
      updatedBy: superAdminUser.nama,
    };
    this.logActivity(superAdminUser.nama, 'UPDATE_PROFIL_KOPERASI', 'Memperbarui profil dan identitas resmi Koperasi HWS');
    notify();
  },

  // Reset to 0 (Point 4 & 5: Reset acoount demo ini dari 0, Hanya ada 1 admin super, jangan lagi menggunakan akun demo)
  resetToZero() {
    currentState.members = [];
    currentState.transactions = [];
    currentState.kasEntries = [];
    currentState.memberDeleteRequests = [];
    currentState.kasDeleteRequests = [];
    currentState.letters = [];
    currentState.chats = [];
    currentState.admins = INITIAL_ADMINS; // Hanya 1 Super Admin
    currentState.logs = [
      {
        id: `log-reset-${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminName: 'Super Admin',
        action: 'RESET_DATABASE_BERSIH',
        details: 'Semua data anggota dan transaksi berhasil di-reset dari 0. Hanya ada 1 Super Admin dan tidak lagi menggunakan akun demo.'
      }
    ];
    currentState.cloudBackup.lastBackupTime = new Date().toISOString();
    currentState.cloudBackup.totalRecords = 0;
    this.recalculateKasBalances();
    notify();
  },

  // Per user instruction: No demo accounts
  loadSampleDemoData() {
    this.resetToZero();
  },

  // Calculated Totals
  getSaldoKasAnggota(): number {
    return currentState.kasEntries
      .filter((k) => k.bukuKas === 'KAS_ANGGOTA')
      .reduce((acc, curr) => curr.tipe === 'MASUK' ? acc + curr.nominal : acc - curr.nominal, 0);
  },

  getSaldoKasKoperasi(): number {
    return currentState.kasEntries
      .filter((k) => k.bukuKas === 'KAS_KOPERASI')
      .reduce((acc, curr) => curr.tipe === 'MASUK' ? acc + curr.nominal : acc - curr.nominal, 0);
  },

  getTotalSimpananPokok(): number {
    return currentState.members.reduce((acc, m) => acc + m.saldoPokok, 0);
  },

  getTotalZakat(): number {
    return currentState.members.reduce((acc, m) => acc + m.saldoZakat, 0);
  },

  getTotalQurban(): number {
    return currentState.members.reduce((acc, m) => acc + m.saldoQurban, 0);
  },

  getTotalTabunganUmum(): number {
    return currentState.members.reduce((acc, m) => acc + m.saldoUmum, 0);
  },

  triggerGoogleCloudSync(): CloudBackupInfo {
    syncStateToFirestore();
    const totalRecords = currentState.members.length + currentState.transactions.length + currentState.kasEntries.length + currentState.chats.length;
    currentState.cloudBackup = {
      lastBackupTime: new Date().toISOString(),
      backupStatus: 'SINKRON',
      googleCloudLocation: 'asia-southeast1 (Jakarta) - Firebase Cloud Firestore (folkloric-hull-3ds98)',
      totalRecords,
      backupSizeKb: Math.round(15 + totalRecords * 0.4),
    };
    notify(true);
    return currentState.cloudBackup;
  },

  // Account Recovery: Find Member by NIK, No. HP, No. Anggota, or Email
  findMemberForRecovery(query: string): MemberUser | null {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const cleanDigits = q.replace(/\D/g, '');
    const cleanHp = cleanPhoneNumber(q);

    return currentState.members.find((m) => {
      const mNikClean = cleanNik(m.nik);
      const mHpClean = cleanPhoneNumber(m.noHp);
      const mEmail = (m.email || '').toLowerCase().trim();
      const mNoAnggota = m.noAnggota.toLowerCase().trim();
      const mRek = m.noRekKoperasi.trim();

      if (mNikClean && cleanDigits && mNikClean === cleanDigits) return true;
      if (mHpClean && cleanHp && mHpClean === cleanHp) return true;
      if (mEmail && mEmail === q) return true;
      if (mNoAnggota === q) return true;
      if (mRek === q) return true;
      return false;
    }) || null;
  },

  // Account Recovery: Find Admin by Email, Username, No. HP, or NIK
  findAdminForRecovery(query: string): AdminUser | null {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const cleanDigits = q.replace(/\D/g, '');
    const cleanHp = cleanPhoneNumber(q);

    return currentState.admins.find((a) => {
      const aUsername = a.username.toLowerCase().trim();
      const aEmail = (a.email || '').toLowerCase().trim();
      const aHpClean = cleanPhoneNumber(a.noHp);
      const aNikClean = a.nik ? cleanNik(a.nik) : '';

      if (aUsername === q) return true;
      if (aEmail && aEmail === q) return true;
      if (aHpClean && cleanHp && aHpClean === cleanHp) return true;
      if (aNikClean && cleanDigits && aNikClean === cleanDigits) return true;
      return false;
    }) || null;
  },

  // Reset Member Password
  resetMemberPassword(memberId: string, newPass: string): boolean {
    const mem = currentState.members.find((m) => m.id === memberId);
    if (!mem) throw new Error('Data anggota tidak ditemukan');
    mem.password = newPass;
    this.logActivity(mem.nama, 'RESET_PASSWORD', `Password anggota ${mem.nama} (${mem.noAnggota}) berhasil diperbarui via sistem pemulihan.`);
    notify();
    return true;
  },

  // Reset Admin Password
  resetAdminPassword(adminId: string, newPass: string): boolean {
    const adm = currentState.admins.find((a) => a.id === adminId);
    if (!adm) throw new Error('Data admin tidak ditemukan');
    adm.password = newPass;
    this.logActivity(adm.nama, 'RESET_PASSWORD', `Password admin ${adm.nama} (${adm.username}) berhasil diperbarui via sistem pemulihan.`);
    notify();
    return true;
  }
};
