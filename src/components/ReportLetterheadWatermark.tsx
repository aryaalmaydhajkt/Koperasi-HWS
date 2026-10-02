import React from 'react';
import { HwsLogo } from './HwsLogo';

interface ReportLetterheadWatermarkProps {
  title: string;
  subtitle?: string;
  periodeInfo?: string;
  documentNumber?: string;
}

export const ReportLetterheadWatermark: React.FC<ReportLetterheadWatermarkProps> = ({
  title,
  subtitle = 'Koperasi Himpunan Wirausaha Sejahtera Jakarta',
  periodeInfo,
  documentNumber,
}) => {
  return (
    <div className="relative mb-6 pb-4 border-b-2 border-slate-900">
      <div className="flex items-center justify-between gap-4">
        {/* Logo and Institution Header */}
        <div className="flex items-center gap-3.5">
          <HwsLogo size={60} className="w-16 h-16 shrink-0" />
          <div>
            <div className="text-xl font-black tracking-tight text-blue-950 uppercase leading-none">
              KOPERASI HWS
            </div>
            <div className="text-xs font-bold text-slate-800 tracking-wide mt-0.5">
              HIMPUNAN WIRAUSAHA SEJAHTERA
            </div>
            <div className="text-[10px] text-slate-600 font-medium">
              Wilayah Operasional: Cengkareng • Kalideres • Kembangan • Kebon Jeruk
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              SK Menkumham & Kemenkop UKM RI • Cloud Server: asia-southeast1
            </div>
          </div>
        </div>

        {/* Document Title & Meta */}
        <div className="text-right">
          <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
            {title}
          </h2>
          {periodeInfo && (
            <div className="text-xs font-bold text-amber-700 font-mono mt-0.5">
              {periodeInfo}
            </div>
          )}
          {documentNumber && (
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              No. Dokumen: {documentNumber}
            </div>
          )}
          <div className="text-[9.5px] text-slate-500 font-sans mt-0.5">
            Dicetak: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Watermark pattern component: renders numerous repeated small HWS logos across the page
export const TiledWatermarkHWS: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-[0.045] print:opacity-[0.06] z-0">
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-y-16 gap-x-12 p-8 transform -rotate-12 scale-110">
        {Array.from({ length: 48 }).map((_, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center">
            <HwsLogo size={64} className="w-16 h-16" />
            <span className="text-[8px] font-black uppercase text-slate-900 tracking-widest mt-1">
              HWS ASLI
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
