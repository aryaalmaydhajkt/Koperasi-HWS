import React, { useState } from 'react';
import { MemberUser } from '../types';
import { appStore } from '../data/store';
import { User, Lock, MapPin, Building, Mail, Phone, CheckCircle2, X, Eye, EyeOff, Save } from 'lucide-react';

interface MemberSettingsModalProps {
  member: MemberUser;
  onClose: () => void;
  onUpdated: (updatedMember: MemberUser) => void;
}

const BANK_OPTIONS = [
  'Bank Central Asia (BCA)',
  'Bank Mandiri',
  'Bank Rakyat Indonesia (BRI)',
  'Bank Negara Indonesia (BNI)',
  'Bank Syariah Indonesia (BSI)',
  'CIMB Niaga',
  'Bank Permata',
  'Bank Danamon',
  'Bank DKI'
];

export const MemberSettingsModal: React.FC<MemberSettingsModalProps> = ({
  member,
  onClose,
  onUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'PROFIL' | 'PASSWORD'>('PROFIL');

  // Form states
  const [nama, setNama] = useState(member.nama);
  const [email, setEmail] = useState(member.email || '');
  const [noHp, setNoHp] = useState(member.noHp);
  const [bankAnggota, setBankAnggota] = useState(member.bankAnggota);
  const [noRekBank, setNoRekBank] = useState(member.noRekBank);
  const [atasNamaRekBank, setAtasNamaRekBank] = useState(member.atasNamaRekBank);
  const [alamat, setAlamat] = useState(member.alamat);
  const [rtRw, setRtRw] = useState(member.rtRw);
  const [kelurahan, setKelurahan] = useState(member.kelurahan || '');
  const [kecamatan, setKecamatan] = useState(member.kecamatan);
  const [kota, setKota] = useState(member.kota);
  const [provinsi, setProvinsi] = useState(member.provinsi || 'DKI Jakarta');
  const [kodePos, setKodePos] = useState(member.kodePos || '11740');

  // Password state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nama.trim() || !noHp.trim()) {
      setErrorMsg('Nama dan No. HP wajib diisi.');
      return;
    }

    try {
      const updates: Partial<MemberUser> = {
        nama: nama.trim(),
        email: email.trim(),
        noHp: noHp.trim(),
        bankAnggota,
        noRekBank: noRekBank.trim(),
        atasNamaRekBank: atasNamaRekBank.trim() || nama.trim(),
        alamat: alamat.trim(),
        rtRw: rtRw.trim(),
        kelurahan: kelurahan.trim(),
        kecamatan: kecamatan.trim(),
        kota: kota.trim(),
        provinsi: provinsi.trim(),
        kodePos: kodePos.trim(),
      };

      appStore.updateMember(member.id, updates, member.nama);
      const updated = { ...member, ...updates };
      onUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan perubahan profil.');
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (member.password && currentPasswordInput !== member.password) {
      setErrorMsg('Password saat ini salah.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('Password baru minimal 4 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    try {
      appStore.updateMember(member.id, { password: newPassword }, member.nama);
      const updated = { ...member, password: newPassword };
      onUpdated(updated);
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Pengaturan Akun & Profil Anggota</h3>
              <p className="text-xs text-slate-400 font-mono">
                No. Anggota: <span className="text-amber-400 font-bold">{member.noAnggota}</span> • Wilayah {member.wilayah}
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

        {/* Tab Selection */}
        <div className="px-6 pt-3 bg-slate-950/60 border-b border-slate-800 flex gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('PROFIL'); setErrorMsg(''); }}
            className={`pb-2.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'PROFIL'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Data Diri & Rekening
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('PASSWORD'); setErrorMsg(''); }}
            className={`pb-2.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'PASSWORD'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Ganti Password
          </button>
        </div>

        {/* Success / Error alerts */}
        {savedSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Perubahan berhasil disimpan! Data Anda telah terupdate di sistem koperasi.</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'PROFIL' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Info Read-only Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-[11px]">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-sans">No. Rek Koperasi</div>
                  <div className="font-bold text-amber-400">{member.noRekKoperasi}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-sans">NIK Anggota</div>
                  <div className="font-semibold text-slate-200">{member.nik}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-sans">Wilayah</div>
                  <div className="font-semibold text-blue-400">{member.wilayah}</div>
                </div>
              </div>

              {/* Data Diri Fields */}
              <div className="space-y-3">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-1">
                  <User className="w-3.5 h-3.5 text-amber-400" /> Informasi Pribadi
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Nomor HP / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Alamat Email</label>
                    <input
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Rekening Bank */}
              <div className="space-y-3 pt-2">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-1">
                  <Building className="w-3.5 h-3.5 text-emerald-400" /> Rekening Bank Pribadi (Untuk Penarikan)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Bank</label>
                    <select
                      value={bankAnggota}
                      onChange={(e) => setBankAnggota(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    >
                      {BANK_OPTIONS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Nomor Rekening Bank *</label>
                    <input
                      type="text"
                      required
                      value={noRekBank}
                      onChange={(e) => setNoRekBank(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Atas Nama Rekening</label>
                    <input
                      type="text"
                      value={atasNamaRekBank}
                      onChange={(e) => setAtasNamaRekBank(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Alamat Domisili */}
              <div className="space-y-3 pt-2">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Alamat Domisili Lengkap
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Alamat Jalan / Gang / No. Rumah *</label>
                    <input
                      type="text"
                      required
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">RT / RW</label>
                      <input
                        type="text"
                        value={rtRw}
                        onChange={(e) => setRtRw(e.target.value)}
                        placeholder="RT 001 / RW 002"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Kelurahan</label>
                      <input
                        type="text"
                        value={kelurahan}
                        onChange={(e) => setKelurahan(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Kecamatan</label>
                      <input
                        type="text"
                        value={kecamatan}
                        onChange={(e) => setKecamatan(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Kode Pos</label>
                      <input
                        type="text"
                        value={kodePos}
                        onChange={(e) => setKodePos(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Kota / Kabupaten</label>
                      <input
                        type="text"
                        value={kota}
                        onChange={(e) => setKota(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Provinsi</label>
                      <input
                        type="text"
                        value={provinsi}
                        onChange={(e) => setProvinsi(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Simpan Perubahan Profil
                </button>
              </div>

            </form>
          ) : (
            <form onSubmit={handleSavePassword} className="space-y-4 max-w-md mx-auto py-2">
              <div className="text-center pb-2">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-sm">Ubah Password Akun Anggota</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Gunakan password yang aman dan mudah Anda ingat untuk login ke aplikasi anggota.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Password Saat Ini *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="Masukkan password lama"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Password Baru *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Konfirmasi Password Baru *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Update Password
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
