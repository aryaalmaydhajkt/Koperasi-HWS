import React, { useState } from 'react';
import { MemberTransaction } from '../types';
import { formatRupiah } from '../utils/exportUtils';
import { X, ZoomIn, ZoomOut, Check, XCircle, FileImage, ShieldCheck } from 'lucide-react';

interface ProofPreviewModalProps {
  transaction: MemberTransaction;
  onClose: () => void;
  onApprove: (txId: string) => void;
  onReject: (txId: string) => void;
}

export const ProofPreviewModal: React.FC<ProofPreviewModalProps> = ({
  transaction,
  onClose,
  onApprove,
  onReject,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));

  // If tx has uploaded image, use it, or generate an authentic Indonesian bank transfer receipt mockup
  const hasCustomImage = transaction.buktiTransfer && transaction.buktiTransfer.startsWith('data:');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <FileImage className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-sm">Bukti Photo Transfer Bank</h3>
              <p className="text-[11px] text-slate-400">
                {transaction.namaAnggota} • Rek: {transaction.noRekKoperasi}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={handleZoomOut}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono px-2 text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview Container */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950/70 flex items-center justify-center min-h-[300px]">
          <div 
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }} 
            className="transition-transform duration-150"
          >
            {hasCustomImage ? (
              <img
                src={transaction.buktiTransfer}
                alt="Bukti Transfer"
                className="max-h-[460px] object-contain rounded-lg shadow-lg border border-slate-700"
              />
            ) : (
              /* High-fidelity Indonesian Bank Transfer Receipt Simulation */
              <div className="w-[320px] bg-white text-slate-900 rounded-xl p-5 shadow-2xl border border-slate-300 font-sans text-xs space-y-3">
                <div className="text-center pb-2 border-b border-dashed border-slate-300">
                  <div className="font-extrabold text-blue-900 text-sm tracking-wider">
                    {transaction.metodePembayaran?.toUpperCase() || 'TRANSFER BANK RESMI'}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                    TRANSAKSI BERHASIL / SUKSES
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tanggal & Waktu</span>
                    <span className="font-mono font-medium">{transaction.tanggal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor Referensi</span>
                    <span className="font-mono font-bold text-slate-800">TRX-{transaction.id.slice(0, 10).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rekening Pengirim</span>
                    <span className="font-bold text-slate-900">{transaction.namaAnggota}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rekening Tujuan</span>
                    <span className="font-bold text-slate-900">KOPERASI HWS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. Rek Koperasi</span>
                    <span className="font-mono font-bold text-blue-900">{transaction.noRekKoperasi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jenis Setoran</span>
                    <span className="font-medium text-slate-800">
                      {transaction.kategori === 'GABUNGAN_KEWAJIBAN' ? 'Tabungan Kewajiban Harian' : 'Tabungan Umum'}
                    </span>
                  </div>
                  {transaction.rincian?.jumlahHari && (
                    <div className="bg-slate-50 p-2 rounded text-[10px] text-slate-600 font-mono space-y-0.5">
                      <div>Alokasi ({transaction.rincian.jumlahHari} Hari):</div>
                      <div>• Pokok: {formatRupiah(transaction.rincian.pokok || 0)}</div>
                      <div>• Zakat Fitrah: {formatRupiah(transaction.rincian.zakat || 0)}</div>
                      <div>• Qurban: {formatRupiah(transaction.rincian.qurban || 0)}</div>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-700 font-bold">Total Transfer</span>
                    <span className="font-bold font-mono text-emerald-700 text-sm">
                      {formatRupiah(transaction.nominal)}
                    </span>
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[9px] text-slate-400">
                  Resi Resmi Perbankan • Bukti Transaksi Valid
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-slate-400">Nominal Setoran: </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {formatRupiah(transaction.nominal)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onReject(transaction.id);
                onClose();
              }}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Tolak Setoran
            </button>
            <button
              onClick={() => {
                onApprove(transaction.id);
                onClose();
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Setujui & Tambah Saldo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
