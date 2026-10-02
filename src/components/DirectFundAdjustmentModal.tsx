import React, { useState } from 'react';
import { MemberUser, AdminUser } from '../types';
import { appStore } from '../data/store';
import { formatRupiah } from '../utils/exportUtils';
import { DollarSign, PlusCircle, MinusCircle, Users, User, X } from 'lucide-react';

interface DirectFundAdjustmentModalProps {
  currentAdmin: AdminUser;
  members: MemberUser[];
  onClose: () => void;
}

export const DirectFundAdjustmentModal: React.FC<DirectFundAdjustmentModalProps> = ({
  currentAdmin,
  members,
  onClose,
}) => {
  const [target, setTarget] = useState<'SEMUA' | 'INDIVIDUAL'>('SEMUA');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [jenisAksi, setJenisAksi] = useState<'PENAMBAHAN' | 'PENGELUARAN'>('PENAMBAHAN');
  const [nominal, setNominal] = useState<number>(50000);
  const [keterangan, setKeterangan] = useState('Insentif partisipasi kegiatan koperasi');

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nominal <= 0) {
      alert('Nominal harus lebih dari 0.');
      return;
    }

    try {
      appStore.directFundAdjustment({
        tipe: jenisAksi === 'PENAMBAHAN' ? 'MASUK' : 'KELUAR',
        target,
        memberId: target === 'INDIVIDUAL' ? selectedMemberId : undefined,
        nominalPerMember: nominal,
        keterangan,
        adminUser: currentAdmin,
      });

      alert(
        `Berhasil memproses ${jenisAksi === 'PENAMBAHAN' ? 'penambahan dana' : 'pengeluaran dana'} sebesar ${formatRupiah(nominal)} untuk ${
          target === 'SEMUA' ? 'seluruh anggota' : selectedMember?.nama
        }. Mutasi rekening anggota dan Buku Kas Anggota telah diperbarui.`
      );
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal memproses penyesuaian dana.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-white text-sm">Penyesuaian Saldo Langsung Anggota</h3>
              <p className="text-[11px] text-slate-400">
                Menu penambahan / pengeluaran dana langsung ke mutasi anggota & buku kas (Point F.2)
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Jenis Aksi: Penambahan vs Pengeluaran */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Jenis Tindakan Dana:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setJenisAksi('PENAMBAHAN');
                  setKeterangan('Bonus / insentif kegiatan koperasi');
                }}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  jenisAksi === 'PENAMBAHAN'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" /> Penambahan Dana (+)
              </button>

              <button
                type="button"
                onClick={() => {
                  setJenisAksi('PENGELUARAN');
                  setKeterangan('Iuran khusus / potongan administrasi');
                }}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  jenisAksi === 'PENGELUARAN'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <MinusCircle className="w-4 h-4" /> Pengeluaran / Potong (-)
              </button>
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Penerima Dana:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTarget('SEMUA')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  target === 'SEMUA'
                    ? 'bg-amber-500/10 border-amber-400 text-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" /> Seluruh Anggota ({members.length})
              </button>

              <button
                type="button"
                onClick={() => setTarget('INDIVIDUAL')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  target === 'INDIVIDUAL'
                    ? 'bg-amber-500/10 border-amber-400 text-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" /> Anggota Tertentu
              </button>
            </div>
          </div>

          {/* Member Dropdown */}
          {target === 'INDIVIDUAL' && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Pilih Anggota:</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-amber-400"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} ({m.noAnggota}) - Umum: {formatRupiah(m.saldoUmum)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nominal */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Nominal Per Anggota ({target === 'SEMUA' ? `Total: ${formatRupiah(nominal * members.length)}` : ''}):
            </label>
            <input
              type="number"
              step="1000"
              min="1000"
              value={nominal}
              onChange={(e) => setNominal(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Keterangan Transaksi:</label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Insentif omset koperasi triwulan"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg ${
                jenisAksi === 'PENAMBAHAN'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
              }`}
            >
              Proses Transaksi Langsung Ke Mutasi & Kas
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
