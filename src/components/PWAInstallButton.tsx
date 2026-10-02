import React, { useState } from 'react';
import { Download, Smartphone, Laptop } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { InstallAppModal } from './InstallAppModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'floating' | 'banner' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'header',
  className = ''
}) => {
  const { isInstalled, isAndroid, isDesktop } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already installed and variant is floating or banner, we can optionally hide it
  if (isInstalled && variant === 'floating') {
    return null;
  }

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/40 border border-emerald-400/30 transition-all active:scale-95 ${className}`}
          title="Pasang Aplikasi di Android & Laptop"
        >
          {isAndroid ? (
            <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
          ) : isDesktop ? (
            <Laptop className="w-3.5 h-3.5 text-emerald-200" />
          ) : (
            <Download className="w-3.5 h-3.5 text-emerald-200" />
          )}
          <span>Install Aplikasi</span>
          <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 border border-emerald-400/20">
            APK / Laptop
          </span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 border border-emerald-500/30 transition ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Pasang App</span>
        </button>
      )}

      {variant === 'floating' && (
        <div className={`fixed bottom-5 right-5 z-40 ${className}`}>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-950/80 border border-emerald-400/40 hover:brightness-110 active:scale-95 transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-emerald-200 group-hover:animate-bounce" />
            </div>
            <div className="text-left">
              <div className="leading-tight">Pasang Aplikasi</div>
              <div className="text-[10px] text-emerald-200 font-normal">Android & Laptop</div>
            </div>
          </button>
        </div>
      )}

      {variant === 'banner' && (
        <div className={`p-3 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-600/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">
                Gunakan Aplikasi Koperasi HWS di HP Android & Laptop
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Akses cepat dari Home Screen tanpa browser, lebih ringan, dan loading instan.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pasang Sekarang</span>
          </button>
        </div>
      )}

      <InstallAppModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};
