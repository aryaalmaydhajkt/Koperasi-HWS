import React, { useState } from 'react';
import { MemberUser } from '../types';
import { appStore } from '../data/store';
import { formatRupiah } from '../utils/exportUtils';
import { X, Lock, CheckCircle2, AlertCircle, ArrowDownCircle } from 'lucide-react';

interface TarikModalProps {
  member: MemberUser;
  onClose: () => void;
  onSuccess: () => void;
}

export const TarikModal: React.FC<TarikModalProps> = ({ member, onClose, onSuccess }) => {
  const [kategori, setKategori] = useState<'UMUM' | 'POKOK'>('UMUM');
  const [nominal, setNominal] = useState<number>(50000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const saldoMaks = kategori === 'UMUM' ? member.saldoUmum : member.saldoPokok;
  const isLocked = kategori === 'POKOK' && member.isPokokLocked;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (nominal <= 0) {
      setErrorMsg('Nominal penarikan harus lebih dari Rp 0.');
      return;
    }
    if (nominal > saldoMaks) {
      setErrorMsg(`Nominal melebihi saldo tersedia (${formatRupiah(saldoMaks)}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      appStore.withdrawByMember({
        memberId: member.id,
        kategori,
        nominal,
      });

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal melakukan penarikan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-base font-bold text-white">Penarikan Dana Anggota</h3>
              <p className="text-xs text-slate-400">
                Pencairan langsung ke rekening terdaftar
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

        {showSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">Penarikan Berhasil Diproses!</h4>
            <p className="text-xs text-slate-300">
              Dana senilai <span className="text-amber-400 font-bold">{formatRupiah(nominal)}</span> telah dicairkan ke rekening {member.bankAnggota} ({member.noRekBank}).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            {/* Tab Pilihan Sumber Tabungan */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setKategori('UMUM');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  kategori === 'UMUM'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tabungan Umum (Bebas)
              </button>
              <button
                type="button"
                onClick={() => {
                  setKategori('POKOK');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 ${
                  kategori === 'POKOK'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {member.isPokokLocked && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                Tabungan Pokok
              </button>
            </div>

            {/* Locked Warning for Tabungan Pokok (Point 1, 10) */}
            {isLocked ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <Lock className="w-4 h-4" /> Penarikan Tabungan Pokok Dikunci
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Sesuai AD/ART Koperasi HWS, tabungan pokok bersifat wajib dan dikunci oleh Admin Koperasi. Untuk membuka lock penarikan, hubungi Admin melalui menu Chat Bantuan.
                </p>
                <div className="pt-1 text-slate-400 font-mono text-[11px]">
                  Saldo Pokok Tersedia: <span className="text-white font-bold">{formatRupiah(member.saldoPokok)}</span>
                </div>
              </div>
            ) : (
              <>
                {/* Saldo info */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Saldo Dapat Ditarik:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {formatRupiah(saldoMaks)}
                  </span>
                </div>

                {/* Input Nominal */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Nominal Penarikan (Rp):
                  </label>
                  <input
                    type="number"
                    min={10000}
                    max={saldoMaks}
                    step={5000}
                    value={nominal}
                    onChange={(e) => setNominal(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span>* Penarikan tabungan umum tanpa syarat keterangan</span>
                    <button
                      type="button"
                      onClick={() => setNominal(saldoMaks)}
                      className="text-amber-400 font-bold hover:underline"
                    >
                      Tarik Semua
                    </button>
                  </div>
                </div>

                {/* Bank Anggota Penerima (Point 10) */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <div className="text-slate-400">Rekening Tujuan Pencairan:</div>
                  <div className="font-bold text-white">
                    {member.bankAnggota} • <span className="font-mono text-amber-400">{member.noRekBank}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    a.n. {member.atasNamaRekBank || member.nama}
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </>
            )}

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
                disabled={isLocked || isSubmitting || nominal <= 0 || nominal > saldoMaks}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Memproses...' : 'Konfirmasi Penarikan'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
