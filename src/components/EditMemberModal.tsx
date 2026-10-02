import React, { useState } from 'react';
import { MemberUser, AdminUser, WilayahJakarta } from '../types';
import { appStore } from '../data/store';
import { formatRupiah } from '../utils/exportUtils';
import { User, X, Save, CheckCircle2, Shield, Lock, MapPin, Building, FileImage, Eye, Trash2 } from 'lucide-react';

interface EditMemberModalProps {
  member: MemberUser;
  currentAdmin: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
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

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  member,
  currentAdmin,
  onClose,
  onSuccess,
}) => {
  const [nama, setNama] = useState(member.nama);
  const [nik, setNik] = useState(member.nik);
  const [noHp, setNoHp] = useState(member.noHp);
  const [email, setEmail] = useState(member.email || '');
  const [password, setPassword] = useState(member.password || '');
  const [wilayah, setWilayah] = useState<WilayahJakarta>(member.wilayah);
  const [statusKeanggotaan, setStatusKeanggotaan] = useState<'AKTIF' | 'NONAKTIF'>(member.statusKeanggotaan);

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

  const [showKtpViewer, setShowKtpViewer] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const updates: Partial<MemberUser> = {
        nama: nama.trim(),
        nik: nik.trim(),
        noHp: noHp.trim(),
        email: email.trim(),
        password: password.trim(),
        wilayah,
        statusKeanggotaan,
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

      appStore.updateMember(member.id, updates, currentAdmin.nama);
      setSavedSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan perubahan.');
    }
  };

  const handleDeleteMember = () => {
    const totalSaldo = (member.saldoPokok || 0) + (member.saldoUmum || 0) + (member.saldoZakat || 0) + (member.saldoQurban || 0);
    if (confirm(`HAPUS ANGGOTA: "${member.nama}" (${member.noAnggota})?\n\nSisa Total Saldo: ${formatRupiah(totalSaldo)}\n(Sisa saldo akan otomatis dipindahkan ke Kas Koperasi sebagai penutupan akun).\n\nApakah Anda yakin ingin menghapus anggota ini secara permanen?`)) {
      try {
        appStore.deleteMember(member.id, currentAdmin);
        alert(`Anggota "${member.nama}" (${member.noAnggota}) telah berhasil dihapus.`);
        onSuccess();
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal menghapus anggota');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Detail & Edit Profil Anggota</h3>
              <p className="text-xs text-slate-400 font-mono">
                No. Anggota: <span className="text-amber-400 font-bold">{member.noAnggota}</span> • Rek Koperasi: <span className="text-cyan-400">{member.noRekKoperasi}</span>
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

        {/* Saldo Summary Header Card */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-sans">Simpanan Pokok</div>
            <div className="font-bold text-amber-400 text-sm">{formatRupiah(member.saldoPokok)}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-sans">Zakat Fitrah</div>
            <div className="font-bold text-emerald-400 text-sm">{formatRupiah(member.saldoZakat)}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-sans">Tabungan Qurban</div>
            <div className="font-bold text-teal-400 text-sm">{formatRupiah(member.saldoQurban)}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-sans">Tabungan Umum</div>
            <div className="font-bold text-cyan-400 text-sm">{formatRupiah(member.saldoUmum)}</div>
          </div>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Data anggota berhasil diperbarui!</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* Section 1: Data Identitas & Login */}
          <div className="space-y-3">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-cyan-400" /> 1. Data Identitas & Akun Login
              </span>
              {member.fotoKtp && (
                <button
                  type="button"
                  onClick={() => setShowKtpViewer(!showKtpViewer)}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold text-[11px] normal-case"
                >
                  <Eye className="w-3.5 h-3.5" /> {showKtpViewer ? 'Tutup Foto KTP' : 'Lihat Foto KTP'}
                </button>
              )}
            </div>

            {/* KTP Viewer toggle */}
            {showKtpViewer && member.fotoKtp && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
                <p className="text-[11px] text-slate-400">Dokumen KTP yang Diunggah Anggota:</p>
                <img
                  src={member.fotoKtp}
                  alt="KTP Anggota"
                  className="max-h-48 rounded-lg mx-auto object-contain border border-slate-700 shadow"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">NIK (16 Digit) *</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Status Keanggotaan</label>
                <select
                  value={statusKeanggotaan}
                  onChange={(e) => setStatusKeanggotaan(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NONAKTIF">NONAKTIF</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nomor HP / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Alamat Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Password Masuk Akun</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Reset password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Wilayah Anggota</label>
                <select
                  value={wilayah}
                  onChange={(e) => setWilayah(e.target.value as WilayahJakarta)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Kalideres">Kalideres</option>
                  <option value="Cengkareng">Cengkareng</option>
                  <option value="Kembangan">Kembangan</option>
                  <option value="Kebon Jeruk">Kebon Jeruk</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Rekening Bank Anggota */}
          <div className="space-y-3 pt-2">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-800 pb-1">
              <Building className="w-3.5 h-3.5 text-emerald-400" /> 2. Rekening Bank Anggota (Untuk Penarikan)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nama Bank</label>
                <select
                  value={bankAnggota}
                  onChange={(e) => setBankAnggota(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Atas Nama Rekening</label>
                <input
                  type="text"
                  value={atasNamaRekBank}
                  onChange={(e) => setAtasNamaRekBank(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Alamat Domisili */}
          <div className="space-y-3 pt-2">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-800 pb-1">
              <MapPin className="w-3.5 h-3.5 text-purple-400" /> 3. Alamat Domisili Sesuai KTP
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Alamat Jalan / No. Rumah *</label>
                <input
                  type="text"
                  required
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">RT / RW</label>
                  <input
                    type="text"
                    value={rtRw}
                    onChange={(e) => setRtRw(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Kelurahan</label>
                  <input
                    type="text"
                    value={kelurahan}
                    onChange={(e) => setKelurahan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={kodePos}
                    onChange={(e) => setKodePos(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Kota</label>
                  <input
                    type="text"
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={provinsi}
                    onChange={(e) => setProvinsi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
            {currentAdmin.role === 'SUPER_ADMIN' ? (
              <button
                type="button"
                onClick={handleDeleteMember}
                className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition font-bold text-xs flex items-center gap-1.5"
                title="Hanya Super Admin yang dapat menghapus anggota"
              >
                <Trash2 className="w-4 h-4" /> Hapus Anggota (Super Admin)
              </button>
            ) : (
              <div className="text-[11px] text-slate-500 italic">
                * Penghapusan anggota hanya dapat dilakukan oleh Super Admin
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition font-medium text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/20 transition flex items-center gap-2 text-xs"
              >
                <Save className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
