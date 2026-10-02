import React, { useState } from 'react';
import { AdminUser, KoperasiProfile } from '../types';
import { appStore } from '../data/store';
import { HwsLogo } from './HwsLogo';
import { Building2, Save, X, CheckCircle2, Shield, Phone, Mail, Globe, MapPin, Users, CreditCard } from 'lucide-react';

interface KoperasiProfileModalProps {
  currentAdmin: AdminUser;
  onClose: () => void;
}

export const KoperasiProfileModal: React.FC<KoperasiProfileModalProps> = ({
  currentAdmin,
  onClose,
}) => {
  const profile = appStore.getState().koperasiProfile;

  const [namaKoperasi, setNamaKoperasi] = useState(profile.namaKoperasi);
  const [nomorBadanHukum, setNomorBadanHukum] = useState(profile.nomorBadanHukum);
  const [npwp, setNpwp] = useState(profile.npwp);
  const [slogan, setSlogan] = useState(profile.slogan);
  const [visiMisi, setVisiMisi] = useState(profile.visiMisi);

  const [alamatKantor, setAlamatKantor] = useState(profile.alamatKantor);
  const [rtRw, setRtRw] = useState(profile.rtRw);
  const [kelurahan, setKelurahan] = useState(profile.kelurahan);
  const [kecamatan, setKecamatan] = useState(profile.kecamatan);
  const [kota, setKota] = useState(profile.kota);
  const [provinsi, setProvinsi] = useState(profile.provinsi);
  const [kodePos, setKodePos] = useState(profile.kodePos);

  const [noTelepon, setNoTelepon] = useState(profile.noTelepon);
  const [noWhatsapp, setNoWhatsapp] = useState(profile.noWhatsapp);
  const [email, setEmail] = useState(profile.email);
  const [website, setWebsite] = useState(profile.website);

  const [ketuaPengurus, setKetuaPengurus] = useState(profile.ketuaPengurus);
  const [sekretaris, setSekretaris] = useState(profile.sekretaris);
  const [bendahara, setBendahara] = useState(profile.bendahara);

  const [bankKoperasi, setBankKoperasi] = useState(profile.bankKoperasi);
  const [noRekKoperasiUtama, setNoRekKoperasiUtama] = useState(profile.noRekKoperasiUtama);
  const [atasNamaRekKoperasi, setAtasNamaRekKoperasi] = useState(profile.atasNamaRekKoperasi);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (currentAdmin.role !== 'SUPER_ADMIN') {
      setErrorMsg('Hanya Super Admin yang berhak memperbarui profil koperasi.');
      return;
    }

    try {
      const updates: Partial<KoperasiProfile> = {
        namaKoperasi: namaKoperasi.trim(),
        nomorBadanHukum: nomorBadanHukum.trim(),
        npwp: npwp.trim(),
        slogan: slogan.trim(),
        visiMisi: visiMisi.trim(),
        alamatKantor: alamatKantor.trim(),
        rtRw: rtRw.trim(),
        kelurahan: kelurahan.trim(),
        kecamatan: kecamatan.trim(),
        kota: kota.trim(),
        provinsi: provinsi.trim(),
        kodePos: kodePos.trim(),
        noTelepon: noTelepon.trim(),
        noWhatsapp: noWhatsapp.trim(),
        email: email.trim(),
        website: website.trim(),
        ketuaPengurus: ketuaPengurus.trim(),
        sekretaris: sekretaris.trim(),
        bendahara: bendahara.trim(),
        bankKoperasi: bankKoperasi.trim(),
        noRekKoperasiUtama: noRekKoperasiUtama.trim(),
        atasNamaRekKoperasi: atasNamaRekKoperasi.trim(),
      };

      appStore.updateKoperasiProfile(updates, currentAdmin);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan profil koperasi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <HwsLogo size={36} className="w-9 h-9" />
            <div>
              <h3 className="font-bold text-white text-base">Pengaturan Profil Resmi Koperasi HWS</h3>
              <p className="text-xs text-slate-400">
                Data Lengkap Badan Hukum, Pengurus, Kontak, dan Rekening Operasional (Khusus Super Admin)
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

        {/* Success Alert */}
        {savedSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Data profil koperasi berhasil diperbarui dan disinkronkan ke seluruh dokumen resmi & kop surat!</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* Section 1: Legalitas Koperasi */}
          <div className="space-y-3">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-800 pb-1">
              <Building2 className="w-4 h-4 text-amber-400" /> 1. Legalitas & Identitas Resmi Koperasi
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nama Koperasi *</label>
                <input
                  type="text"
                  required
                  value={namaKoperasi}
                  onChange={(e) => setNamaKoperasi(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nomor Badan Hukum / Kemenkumham *</label>
                <input
                  type="text"
                  required
                  value={nomorBadanHukum}
                  onChange={(e) => setNomorBadanHukum(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nomor NPWP Koperasi</label>
                <input
                  type="text"
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Slogan Koperasi</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Visi & Misi Koperasi</label>
                <textarea
                  rows={2}
                  value={visiMisi}
                  onChange={(e) => setVisiMisi(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Alamat Kantor Koperasi */}
          <div className="space-y-3 pt-2">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-800 pb-1">
              <MapPin className="w-4 h-4 text-cyan-400" /> 2. Alamat Kantor Sekretariat
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Alamat Kantor Lengkap *</label>
                <input
                  type="text"
                  required
                  value={alamatKantor}
                  onChange={(e) => setAlamatKantor(e.target.value)}
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
                  <label className="block text-slate-400 mb-1">Kota</label>
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

          {/* Section 3: Kontak & Komunikasi Resmi */}
          <div className="space-y-3 pt-2">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-800 pb-1">
              <Phone className="w-4 h-4 text-emerald-400" /> 3. Kontak Resmi Koperasi
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">No. WhatsApp Resmi *</label>
                <input
                  type="text"
                  required
                  value={noWhatsapp}
                  onChange={(e) => setNoWhatsapp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">No. Telepon Kantor</label>
                <input
                  type="text"
                  value={noTelepon}
                  onChange={(e) => setNoTelepon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Resmi Koperasi *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Website Resmi</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Pengurus Koperasi */}
          <div className="space-y-3 pt-2">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-800 pb-1">
              <Users className="w-4 h-4 text-purple-400" /> 4. Susunan Pengurus Koperasi
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Ketua Pengurus *</label>
                <input
                  type="text"
                  required
                  value={ketuaPengurus}
                  onChange={(e) => setKetuaPengurus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Sekretaris *</label>
                <input
                  type="text"
                  required
                  value={sekretaris}
                  onChange={(e) => setSekretaris(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Bendahara *</label>
                <input
                  type="text"
                  required
                  value={bendahara}
                  onChange={(e) => setBendahara(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Rekening Bank Resmi Koperasi */}
          <div className="space-y-3 pt-2">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-slate-800 pb-1">
              <CreditCard className="w-4 h-4 text-amber-400" /> 5. Rekening Penampung Resmi Koperasi (Untuk Transfer Setoran)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nama Bank *</label>
                <input
                  type="text"
                  required
                  value={bankKoperasi}
                  onChange={(e) => setBankKoperasi(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nomor Rekening *</label>
                <input
                  type="text"
                  required
                  value={noRekKoperasiUtama}
                  onChange={(e) => setNoRekKoperasiUtama(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Atas Nama Rekening *</label>
                <input
                  type="text"
                  required
                  value={atasNamaRekKoperasi}
                  onChange={(e) => setAtasNamaRekKoperasi(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition font-medium"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Simpan Profil Koperasi
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
