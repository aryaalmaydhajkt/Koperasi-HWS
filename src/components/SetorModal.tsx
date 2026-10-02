import React, { useState } from 'react';
import { MemberUser } from '../types';
import { appStore } from '../data/store';
import { formatRupiah } from '../utils/exportUtils';
import { X, QrCode, CreditCard, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface SetorModalProps {
  member: MemberUser;
  onClose: () => void;
  onSuccess: () => void;
}

export const SetorModal: React.FC<SetorModalProps> = ({ member, onClose, onSuccess }) => {
  const profile = appStore.getKoperasiProfile();
  const [tabJenis, setTabJenis] = useState<'KEWAJIBAN' | 'UMUM'>('KEWAJIBAN');
  const [jumlahHari, setJumlahHari] = useState<number>(30); // Default 30 hari = 60.000
  const [nominalUmum, setNominalUmum] = useState<number>(100000);
  const [metode, setMetode] = useState<'QRIS' | 'TRANSFER'>('QRIS');
  const [buktiUploaded, setBuktiUploaded] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const nominalKewajiban = jumlahHari * 2000;
  const currentTotal = tabJenis === 'KEWAJIBAN' ? nominalKewajiban : nominalUmum;

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiUploaded(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // simulated default proof
      setBuktiUploaded('https://placehold.co/400x600/png?text=Bukti+Transfer+Terverifikasi');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tabJenis === 'KEWAJIBAN' && jumlahHari <= 0) return;
    if (tabJenis === 'UMUM' && nominalUmum <= 0) return;

    setIsSubmitting(true);

    try {
      appStore.submitDeposit({
        memberId: member.id,
        jenis: tabJenis === 'KEWAJIBAN' ? 'SETORAN_KEWAJIBAN' : 'SETORAN_UMUM',
        nominal: currentTotal,
        jumlahHari: tabJenis === 'KEWAJIBAN' ? jumlahHari : undefined,
        buktiTransfer: buktiUploaded || 'BUKTI_TRANSFER_ATTACHED_OK',
        metodePembayaran: metode === 'QRIS' ? 'QRIS_HWS' : 'TRANSFER_BANK',
      });

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim setoran');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Setor Tabungan Anggota</h3>
            <p className="text-xs text-slate-400">
              {member.nama} • Rek: <span className="font-mono text-amber-400">{member.noRekKoperasi}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {showSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">Setoran Berhasil Diajukan!</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bukti pembayaran Anda telah dikirim ke sistem. Sesuai ketentuan, saldo akan bertambah setelah diverifikasi oleh Admin Koperasi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            {/* Tab Jenis */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setTabJenis('KEWAJIBAN')}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  tabJenis === 'KEWAJIBAN'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tabungan Kewajiban (Rp2.000/hr)
              </button>
              <button
                type="button"
                onClick={() => setTabJenis('UMUM')}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  tabJenis === 'UMUM'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tabungan Umum (Bebas)
              </button>
            </div>

            {/* Content for Kewajiban */}
            {tabJenis === 'KEWAJIBAN' ? (
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="space-y-1">
                  <label className="text-slate-300 text-xs font-semibold block">
                    Ketik / Masukkan Jumlah Hari yang Diinginkan:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={jumlahHari}
                      onChange={(e) => setJumlahHari(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                      placeholder="Contoh: 2 hari (Rp 4.000)"
                    />
                    <span className="text-slate-300 font-bold text-xs px-3 py-2 bg-slate-800 rounded-xl shrink-0">
                      Hari
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Kewajiban Rp 2.000/hari: Rp 1.000 pokok, Rp 500 zakat fitrah, Rp 500 qurban.
                  </p>
                </div>

                {/* Quick Presets */}
                <div>
                  <div className="text-[10px] text-slate-400 mb-1.5 font-medium">Pilihan Cepat Hari:</div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[2, 7, 14, 30, 60, 90].map((hari) => (
                      <button
                        key={hari}
                        type="button"
                        onClick={() => setJumlahHari(hari)}
                        className={`py-1.5 px-1 text-center text-xs rounded-lg border font-mono transition ${
                          jumlahHari === hari
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {hari} hr
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Tabungan Pokok (Rp1.000/hr):</span>
                    <span className="font-mono font-medium text-white">{formatRupiah(jumlahHari * 1000)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tabungan Zakat Fitrah (Rp500/hr):</span>
                    <span className="font-mono font-medium text-white">{formatRupiah(jumlahHari * 500)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tabungan Qurban (Rp500/hr):</span>
                    <span className="font-mono font-medium text-white">{formatRupiah(jumlahHari * 500)}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold pt-1 border-t border-slate-800/80">
                    <span>Total Pembayaran:</span>
                    <span className="font-mono text-sm">{formatRupiah(nominalKewajiban)}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Content for Umum */
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Nominal Setoran Tabungan Umum (Rp):
                </label>
                <input
                  type="number"
                  min={10000}
                  step={5000}
                  value={nominalUmum}
                  onChange={(e) => setNominalUmum(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none focus:border-amber-500"
                />

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[50000, 100000, 250000, 500000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNominalUmum(val)}
                      className={`py-1 px-1.5 text-[11px] rounded-lg border font-mono transition ${
                        nominalUmum === val
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      {val / 1000}rb
                    </button>
                  ))}
                </div>

                <div className="flex justify-between text-amber-400 font-bold pt-2 border-t border-slate-800">
                  <span className="text-xs">Total Pembayaran:</span>
                  <span className="font-mono text-sm">{formatRupiah(nominalUmum)}</span>
                </div>
              </div>
            )}

            {/* Metode Pembayaran: QRIS Dinamis vs Transfer */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Pilih Metode Pembayaran:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetode('QRIS')}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition ${
                    metode === 'QRIS'
                      ? 'border-amber-500 bg-amber-500/15 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">QRIS Bank HWS</div>
                    <div className="text-[10px] text-slate-400">Otomatis Sesuai Nominal</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMetode('TRANSFER')}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition ${
                    metode === 'TRANSFER'
                      ? 'border-amber-500 bg-amber-500/15 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Transfer Bank</div>
                    <div className="text-[10px] text-slate-400">Rekening Koperasi</div>
                  </div>
                </button>
              </div>
            </div>

            {/* QRIS / Transfer Display (Point 38: Munculkan QRIS sesuai nominal) */}
            {metode === 'QRIS' ? (
              <div className="bg-white text-slate-900 p-4 rounded-xl text-center space-y-2 border border-slate-300">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  QRIS STANDAR PEMBAYARAN NASIONAL
                </div>
                <div className="text-xs font-semibold text-blue-900">
                  {profile.namaKoperasi}
                </div>

                {/* Simulated QR Code with exact nominal embedding */}
                <div className="w-44 h-44 mx-auto bg-slate-100 border-2 border-slate-800 p-2 flex flex-col items-center justify-center relative rounded-lg">
                  <div className="grid grid-cols-6 gap-1 w-full h-full opacity-90 p-2">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 && i % 3 === 0) || i < 8 || i > 28
                            ? 'bg-black'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white px-2 py-1 rounded shadow text-[9px] font-bold font-mono text-slate-900 border">
                      HWS QRIS
                    </div>
                  </div>
                </div>

                <div className="font-mono font-black text-sm text-slate-900">
                  {formatRupiah(currentTotal)}
                </div>
                <div className="text-[10px] text-slate-500">
                  NMID: ID102438891024 • Berlaku 24 Jam
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-slate-300">Rekening Koperasi Tujuan:</div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center font-mono">
                  <div>
                    <div className="text-[10px] text-slate-400 font-sans">{profile.bankKoperasi || 'Bank Central Asia (BCA)'}</div>
                    <div className="font-bold text-white text-sm">{profile.noRekKoperasiUtama || '8830198822'}</div>
                    <div className="text-[10px] text-slate-400 font-sans">a.n. {profile.atasNamaRekKoperasi || 'KSP HIMPUNAN WIRAUSAHA SEJAHTERA'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText((profile.noRekKoperasiUtama || '8830198822').replace(/\D/g, ''))}
                    className="text-[10px] px-2 py-1 bg-slate-800 text-amber-400 rounded hover:bg-slate-700"
                  >
                    Salin
                  </button>
                </div>
              </div>
            )}

            {/* Upload Bukti Transfer (Point 20: Wajib melampirkan bukti transfer) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Lampirkan Bukti Transfer / Pembayaran: <span className="text-rose-400">*</span>
              </label>
              <div className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-3 text-center bg-slate-950/40 cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSimulatedUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <div className="text-xs text-slate-300 font-medium">
                  {buktiUploaded ? '✓ Bukti transfer terlampir (Klik ganti)' : 'Upload Struk / Screenshot Bukti Transfer'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Format JPG, PNG atau PDF (Maks. 5MB)
                </div>
              </div>
            </div>

            {/* Notice Point 20 */}
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300/90 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                Setelah mengirimkan setoran dan bukti, data akan diverifikasi oleh Admin. Saldo tabungan resmi bertambah setelah verifikasi berhasil.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || currentTotal <= 0}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Memproses...' : 'Kirim Bukti & Setor Sekarang'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
