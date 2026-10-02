import React, { useState } from 'react';
import { AdminUser, AdminRole, WilayahJakarta } from '../types';
import { appStore } from '../data/store';
import { Shield, Upload, CheckCircle2, User, Key, X } from 'lucide-react';

interface AdminProfileModalProps {
  currentAdmin: AdminUser;
  targetAdmin?: AdminUser; // if editing existing admin
  isNew?: boolean;
  onClose: () => void;
}

const ROLE_TITLES: Record<AdminRole, string> = {
  SUPER_ADMIN: 'SUPER ADMIN (Pimpinan / Utama)',
  ADMIN_WRITE: 'ADMIN WRITE (Operator & Verifikasi)',
  ADMIN_HAPUS: 'ADMIN PEMBUKUAN (Kas & Hapus)',
  ADMIN_DOWNLOAD: 'ADMIN LAPORAN (Khusus Unduh Data)',
};

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  currentAdmin,
  targetAdmin,
  isNew = false,
  onClose,
}) => {
  const isSuperAdmin = currentAdmin.role === 'SUPER_ADMIN';

  // Form states
  const [username, setUsername] = useState(targetAdmin?.username || '');
  const [nama, setNama] = useState(targetAdmin?.nama || '');
  const [email, setEmail] = useState(targetAdmin?.email || '');
  const [noHp, setNoHp] = useState(targetAdmin?.noHp || '');
  const [role, setRole] = useState<AdminRole>(targetAdmin?.role || 'ADMIN_WRITE');
  const [password, setPassword] = useState(targetAdmin?.password || '');
  
  // Mandatory identity fields like members (E.1)
  const [nik, setNik] = useState(targetAdmin?.nik || '');
  const [provinsi, setProvinsi] = useState(targetAdmin?.provinsi || 'DKI Jakarta');
  const [kota, setKota] = useState(targetAdmin?.kota || 'Jakarta Barat');
  const [kecamatan, setKecamatan] = useState<WilayahJakarta>(
    (targetAdmin?.kecamatan as WilayahJakarta) || 'Cengkareng'
  );
  const [kelurahan, setKelurahan] = useState(targetAdmin?.kelurahan || '');
  const [rtRw, setRtRw] = useState(targetAdmin?.rtRw || '');
  const [kodePos, setKodePos] = useState(targetAdmin?.kodePos || '11740');
  const [alamat, setAlamat] = useState(targetAdmin?.alamat || '');
  const [fotoKtp, setFotoKtp] = useState<string | undefined>(targetAdmin?.fotoKtp);

  // KTP Upload simulation
  const handleKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFotoKtp(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nik.trim() || nik.length < 16) {
      alert('NIK Admin wajib 16 digit sesuai KTP.');
      return;
    }

    if (isNew) {
      if (!isSuperAdmin) {
        alert('Hanya Super Admin yang dapat menambahkan Admin baru.');
        return;
      }
      appStore.addAdmin({
        username,
        nama,
        email,
        role,
        roleTitle: ROLE_TITLES[role],
        noHp,
        password,
        nik,
        provinsi,
        kota,
        kecamatan,
        kelurahan,
        rtRw,
        kodePos,
        alamat,
        fotoKtp,
      }, currentAdmin);
      alert('Admin baru berhasil ditambahkan!');
    } else if (targetAdmin) {
      appStore.updateAdmin(targetAdmin.id, {
        username,
        nama,
        email,
        noHp,
        role: isSuperAdmin ? role : targetAdmin.role,
        roleTitle: ROLE_TITLES[isSuperAdmin ? role : targetAdmin.role],
        password,
        nik,
        provinsi,
        kota,
        kecamatan,
        kelurahan,
        rtRw,
        kodePos,
        alamat,
        fotoKtp,
      }, currentAdmin);
      alert('Data admin berhasil diperbarui!');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-sm">
                {isNew ? 'Tambah Admin Baru' : 'Kelola Profil & Kredensial Admin'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Wajib mengisi data identitas diri lengkap & upload KTP (Point E.1)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* Account Credential Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="font-bold text-white text-xs flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-cyan-400" /> Kredensial Login
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Username Login:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Password:</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Hak Akses (Role):</label>
                <select
                  disabled={!isSuperAdmin}
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400 disabled:opacity-50"
                >
                  <option value="SUPER_ADMIN">SUPER ADMIN (Semua Akses & Cloud)</option>
                  <option value="ADMIN_WRITE">ADMIN WRITE (Tulis & Verifikasi)</option>
                  <option value="ADMIN_HAPUS">ADMIN PEMBUKUAN (Buku Kas & Hapus Kas)</option>
                  <option value="ADMIN_DOWNLOAD">ADMIN LAPORAN (Hanya Unduh Laporan)</option>
                </select>
                {role === 'ADMIN_DOWNLOAD' && (
                  <p className="text-[10px] text-amber-400 mt-1">
                    * Admin Laporan hanya bisa mengunduh rekap anggota, kas, zakat & qurban. Menu lain tersembunyi.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">No. WhatsApp / HP:</label>
                <input
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Mandatory Identity Details (E.1) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="font-bold text-white text-xs flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Shield className="w-4 h-4 text-amber-400" /> Data Identitas & KTP Wajib
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nomor Induk Kependudukan (NIK 16 Digit):</label>
                <input
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="317301xxxxxxxxxx"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kecamatan:</label>
                <select
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value as WilayahJakarta)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Cengkareng">Cengkareng</option>
                  <option value="Kalideres">Kalideres</option>
                  <option value="Kembangan">Kembangan</option>
                  <option value="Kebon Jeruk">Kebon Jeruk</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Provinsi:</label>
                <input
                  type="text"
                  value={provinsi}
                  onChange={(e) => setProvinsi(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kota / Kabupaten:</label>
                <input
                  type="text"
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kelurahan:</label>
                <input
                  type="text"
                  value={kelurahan}
                  onChange={(e) => setKelurahan(e.target.value)}
                  placeholder="Contoh: Duri Kosambi"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">RT / RW:</label>
                  <input
                    type="text"
                    value={rtRw}
                    onChange={(e) => setRtRw(e.target.value)}
                    placeholder="004/002"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Kode Pos:</label>
                  <input
                    type="text"
                    maxLength={5}
                    value={kodePos}
                    onChange={(e) => setKodePos(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Alamat Domisili:</label>
                <textarea
                  rows={2}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jalan, Gang, Nomor Rumah..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Upload Foto KTP */}
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Upload Foto KTP Asli:</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 flex items-center gap-2 transition">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Pilih Foto KTP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleKtpUpload}
                      className="hidden"
                    />
                  </label>
                  {fotoKtp ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> KTP Terupload
                      <img
                        src={fotoKtp}
                        alt="KTP Preview"
                        className="w-10 h-7 object-cover rounded border border-slate-600 ml-2"
                      />
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">Belum ada file KTP</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              Simpan Data Admin
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
