import React from 'react';
import { MemberUser } from '../types';
import { HwsLogo } from './HwsLogo';
import { X, Printer, ShieldCheck, QrCode } from 'lucide-react';

interface KtaDigitalModalProps {
  member: MemberUser;
  onClose: () => void;
}

export const KtaDigitalModal: React.FC<KtaDigitalModalProps> = ({ member, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden print:max-w-none print:border-none print:bg-white print:text-black">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60 print:hidden">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
            <ShieldCheck className="w-5 h-5" /> KTA Digital Resmi Anggota
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak KTA
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Physical KTA Card Simulation */}
        <div className="p-6">
          <div className="relative w-full aspect-[1.586/1] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-5 shadow-xl text-white overflow-hidden print:border-black print:text-black print:bg-white">
            
            {/* Watermark Logo HWS (Point 15: watermark sesuai logo koperasi) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] print:opacity-[0.05]">
              <HwsLogo size={240} className="w-64 h-64" />
            </div>

            {/* KTA Header / Kop Koperasi (Point 15) */}
            <div className="relative z-10 flex items-center justify-between pb-3 border-b border-amber-500/30">
              <div className="flex items-center gap-3">
                <HwsLogo size={42} className="w-10 h-10" />
                <div>
                  <h3 className="text-sm font-black tracking-wider text-amber-400 uppercase leading-tight print:text-black">
                    KOPERASI HWS
                  </h3>
                  <p className="text-[9px] text-slate-300 tracking-tight leading-tight print:text-slate-600">
                    Himpunan Wirausaha Sejahtera Jakarta
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded print:text-black print:border-black">
                  KTA RESMI
                </span>
                <div className="text-[8px] text-slate-400 font-mono mt-0.5">
                  ID: {member.noAnggota}
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="relative z-10 grid grid-cols-12 gap-3 mt-4 items-center">
              {/* Photo */}
              <div className="col-span-4 flex flex-col items-center">
                <div className="w-20 h-24 bg-slate-800 border-2 border-amber-400/50 rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
                  {member.fotoProfil ? (
                    <img src={member.fotoProfil} alt={member.nama} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-1 text-slate-400">
                      <div className="w-10 h-10 mx-auto rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-bold text-sm mb-1">
                        {member.nama.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[7.5px] uppercase font-mono">FOTO KTP</span>
                    </div>
                  )}
                </div>
                <span className="text-[8px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  ● AKTIF
                </span>
              </div>

              {/* Member Details */}
              <div className="col-span-8 space-y-1 font-mono text-[10px]">
                <div>
                  <div className="text-[8px] font-sans uppercase text-slate-400 print:text-slate-600">Nama Anggota</div>
                  <div className="font-bold text-sm font-sans tracking-wide text-white print:text-black uppercase">
                    {member.nama}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 pt-1">
                  <div>
                    <div className="text-[7.5px] font-sans uppercase text-slate-400 print:text-slate-600">Rekening Koperasi</div>
                    <div className="font-bold text-amber-400 print:text-black tracking-wider">
                      {member.noRekKoperasi}
                    </div>
                  </div>
                  <div>
                    <div className="text-[7.5px] font-sans uppercase text-slate-400 print:text-slate-600">Wilayah</div>
                    <div className="font-semibold text-slate-200 print:text-black">
                      {member.wilayah}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  <div>
                    <div className="text-[7.5px] font-sans uppercase text-slate-400 print:text-slate-600">Bergabung</div>
                    <div className="text-slate-300 print:text-black">{member.tanggalBergabung}</div>
                  </div>
                  <div>
                    <div className="text-[7.5px] font-sans uppercase text-slate-400 print:text-slate-600">Bank Terdaftar</div>
                    <div className="text-slate-300 print:text-black truncate">{member.bankAnggota}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar: QR Code + No signature reminder (Point 26: tidak perlu ada tanda tangan pengurus koperasi) */}
            <div className="relative z-10 flex items-center justify-between mt-3 pt-2 border-t border-slate-700/50 text-[7.5px] text-slate-400 print:text-slate-600">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-5 h-5 text-amber-400 print:text-black" />
                <span>KTA Digital Sah • Tanpa Tanda Tangan Basah Sesuai Ketentuan</span>
              </div>
              <span className="font-mono">hws.koperasi.id</span>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-center text-xs text-slate-400 print:hidden">
          Gunakan tombol di atas untuk mencetak atau mendownload KTA dalam format PDF.
        </div>
      </div>
    </div>
  );
};
