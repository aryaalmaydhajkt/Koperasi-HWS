import React, { useState } from 'react';
import { WilayahJakarta, MemberUser } from '../types';
import { appStore, cleanNik, cleanPhoneNumber } from '../data/store';
import { HwsLogo } from './HwsLogo';
import { X, Upload, CheckCircle2, ShieldCheck, UserCheck, MapPin, AlertCircle, HelpCircle } from 'lucide-react';

interface RegisterModalProps {
  onClose: () => void;
  onRegistered: (member: MemberUser) => void;
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

export const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onRegistered }) => {
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('Apa nama ibu kandung Anda?');
  const [securityAnswer, setSecurityAnswer] = useState('');
  
  // Point 49: Pada pendaftaran anggota pemilihan wilayah JANGAN tampilkan angka kode wilayah 76, 77, 78, 79
  const [wilayah, setWilayah] = useState<WilayahJakarta>('Cengkareng');
  const [provinsi, setProvinsi] = useState('DKI Jakarta');
  const [kota, setKota] = useState('Jakarta Barat');
  const [kelurahan, setKelurahan] = useState('');
  const [rtRw, setRtRw] = useState('');
  const [kodePos, setKodePos] = useState('11740');
  const [alamat, setAlamat] = useState('');

  const [bankAnggota, setBankAnggota] = useState(BANK_OPTIONS[0]);
  const [noRekBank, setNoRekBank] = useState('');
  const [atasNamaRekBank, setAtasNamaRekBank] = useState('');
  const [fotoKtp, setFotoKtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMemberCreated, setNewMemberCreated] = useState<MemberUser | null>(null);

  const handleKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoKtp(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFotoKtp('https://placehold.co/600x400/png?text=E-KTP+TERVERIFIKASI');
    }
  };

  const existingMembers = appStore.getState().members;
  const isDuplicateNik = nik.trim().length >= 8 && existingMembers.some((m) => cleanNik(m.nik) === cleanNik(nik));
  const isDuplicateHp = noHp.trim().length >= 8 && existingMembers.some((m) => cleanPhoneNumber(m.noHp) === cleanPhoneNumber(noHp));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !nik || !noHp || !password || !noRekBank || !alamat) {
      alert('Harap lengkapi semua kolom wajib bertanda bintang (*) !');
      return;
    }

    if (isDuplicateNik) {
      alert('Nomor NIK ini sudah terdaftar atas nama anggota lain. NIK KTP tidak dapat digunakan dua kali!');
      return;
    }

    if (isDuplicateHp) {
      alert('Nomor HP ini sudah terdaftar atas nama anggota lain. Nomor telepon tidak dapat digunakan dua kali!');
      return;
    }

    setIsSubmitting(true);
    try {
      const member = appStore.registerMember({
        nama,
        nik,
        noHp,
        email,
        password,
        securityQuestion,
        securityAnswer: securityAnswer.trim() || 'Siti',
        wilayah,
        bankAnggota,
        noRekBank,
        atasNamaRekBank: atasNamaRekBank || nama,
        alamat,
        rtRw: rtRw || 'RT 001 RW 001',
        kecamatan: wilayah,
        kelurahan: kelurahan || 'Kelurahan Setempat',
        kota: kota || 'Jakarta Barat',
        provinsi: provinsi || 'DKI Jakarta',
        kodePos: kodePos || '11740',
        fotoKtp: fotoKtp || 'BUKTI_KTP_OK',
      });

      setNewMemberCreated(member);
    } catch (err: any) {
      alert(err.message || 'Gagal mendaftar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HwsLogo size={36} className="w-9 h-9" />
            <div>
              <h3 className="text-sm font-bold text-white">Formulir Pendaftaran Anggota Koperasi HWS</h3>
              <p className="text-[11px] text-slate-400">
                Pendaftaran Resmi Wilayah DKI Jakarta & Data Domisili Lengkap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {newMemberCreated ? (
          <div className="p-6 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <div>
              <h4 className="text-lg font-bold text-white">Pendaftaran Berhasil!</h4>
              <p className="text-xs text-slate-300 mt-1">
                Selamat datang di Koperasi Himpunan Wirausaha Sejahtera.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left font-mono text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Nama:</span>
                <span className="font-bold text-white">{newMemberCreated.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">No. Anggota:</span>
                <span className="text-amber-400 font-bold">{newMemberCreated.noAnggota}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Rekening Koperasi (10 Digit):</span>
                <span className="text-emerald-400 font-bold">{newMemberCreated.noRekKoperasi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Wilayah & Kota:</span>
                <span className="text-slate-200">{newMemberCreated.wilayah}, {newMemberCreated.kota}</span>
              </div>
            </div>

            <button
              onClick={() => onRegistered(newMemberCreated)}
              className="w-full max-w-sm py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
            >
              Masuk ke Aplikasi Anggota Sekarang
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
            
            {/* Section 1: Data Diri */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
                <UserCheck className="w-3.5 h-3.5" /> 1. Data Diri & Identitas Anggota
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-slate-300 font-medium">Nama Lengkap Sesuai KTP *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-medium">Nomor NIK (16 Digit) *</label>
                    {isDuplicateNik && (
                      <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3" /> NIK Sudah Digunakan!
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="31730..."
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                    className={`w-full bg-slate-950 border ${isDuplicateNik ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-amber-500'} rounded-lg px-3 py-2 text-white font-mono focus:outline-none`}
                  />
                  {isDuplicateNik && (
                    <p className="text-[10px] text-rose-400">
                      Satu NIK hanya dapat didaftarkan satu kali untuk satu akun anggota.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-medium">Nomor HP / WhatsApp *</label>
                    {isDuplicateHp && (
                      <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3" /> No. HP Terdaftar!
                      </span>
                    )}
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className={`w-full bg-slate-950 border ${isDuplicateHp ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-amber-500'} rounded-lg px-3 py-2 text-white font-mono focus:outline-none`}
                  />
                  {isDuplicateHp && (
                    <p className="text-[10px] text-rose-400">
                      Nomor HP ini sudah dipakai. Harap gunakan nomor telepon Anda sendiri.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Alamat Email</label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Password Masuk Akun *</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 4 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Pertanyaan Keamanan untuk Pemulihan Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    Pertanyaan Keamanan (Pemulihan Password) *
                  </label>
                  <select
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="Apa nama ibu kandung Anda?">Apa nama ibu kandung Anda?</option>
                    <option value="Di kota mana Anda dilahirkan?">Di kota mana Anda dilahirkan?</option>
                    <option value="Apa nama sekolah dasar pertama Anda?">Apa nama sekolah dasar pertama Anda?</option>
                    <option value="Apa makanan atau hobi favorit Anda?">Apa makanan atau hobi favorit Anda?</option>
                    <option value="Siapa nama sahabat masa kecil Anda?">Siapa nama sahabat masa kecil Anda?</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Jawaban Pertanyaan Keamanan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Siti Rahayu"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Data Alamat Lengkap Sesuai Permintaan B.5 (Provinsi, Kota, Kelurahan, Kecamatan, RT/RW, Kode Pos) */}
            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
                <MapPin className="w-3.5 h-3.5" /> 2. Wilayah Domisili (Provinsi, Kota, Kecamatan, Kelurahan, RT/RW & Kode Pos)
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Provinsi *</label>
                  <input
                    type="text"
                    required
                    value={provinsi}
                    onChange={(e) => setProvinsi(e.target.value)}
                    placeholder="DKI Jakarta"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Kota / Kabupaten *</label>
                  <input
                    type="text"
                    required
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    placeholder="Jakarta Barat"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Point 16 & Point 49: Pemilihan wilayah tanpa angka kode 76,77,78,79 */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Kecamatan (Wilayah) *</label>
                  <select
                    value={wilayah}
                    onChange={(e) => setWilayah(e.target.value as WilayahJakarta)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Cengkareng">Cengkareng</option>
                    <option value="Kalideres">Kalideres</option>
                    <option value="Kembangan">Kembangan</option>
                    <option value="Kebon Jeruk">Kebon Jeruk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Kelurahan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rawa Buaya"
                    value={kelurahan}
                    onChange={(e) => setKelurahan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">RT / RW *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: RT 003 RW 002"
                    value={rtRw}
                    onChange={(e) => setRtRw(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Kode Pos *</label>
                  <input
                    type="text"
                    required
                    placeholder="11740"
                    value={kodePos}
                    onChange={(e) => setKodePos(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Alamat Lengkap (Jalan, No. Rumah/Bangunan) *</label>
                <input
                  type="text"
                  required
                  placeholder="Jl. Albarkah Raya No. 8"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Section 3: Rekening Bank Anggota (Point 10) */}
            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 3. Rekening Bank Pribadi (Untuk Pencairan Dana)
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Nama Bank *</label>
                  <select
                    value={bankAnggota}
                    onChange={(e) => setBankAnggota(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {BANK_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Nomor Rekening Bank *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1234567890"
                    value={noRekBank}
                    onChange={(e) => setNoRekBank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Atas Nama Rekening Bank</label>
                <input
                  type="text"
                  placeholder="Sesuai buku tabungan nasabah"
                  value={atasNamaRekBank}
                  onChange={(e) => setAtasNamaRekBank(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Section 4: Upload KTP (Point 12) */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
                <Upload className="w-3.5 h-3.5" /> 4. Foto Kartu Tanda Penduduk (KTP) Asli
              </div>

              <div className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-3 text-center bg-slate-950/40 cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleKtpUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <div className="text-xs text-slate-300 font-medium">
                  {fotoKtp ? '✓ Foto KTP berhasil diunggah' : 'Klik atau Drag Foto KTP Asli'}
                </div>
                <div className="text-[10px] text-slate-500">
                  Format JPG, PNG (Pastikan NIK dan nama terbaca jelas)
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-3 flex gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sebagai Anggota'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
