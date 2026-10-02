import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-xl shadow-amber-950/40 border border-amber-400/40 animate-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
      <span>Mode Offline — Aplikasi menggunakan data tersimpan lokal.</span>
      <button 
        onClick={() => window.location.reload()} 
        className="ml-1 p-1 hover:bg-amber-700 rounded-lg transition"
        title="Muat ulang"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
