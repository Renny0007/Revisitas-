import React, { useState, useEffect } from 'react';
import { Plus, BookOpenCheck, Save, DownloadCloud } from 'lucide-react';
import { formatFullDateES, getTodayString } from '../utils/dateUtils';

interface HeaderProps {
  onOpenNewRevisita: () => void;
  onOpenBackup?: () => void;
  onOpenInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenNewRevisita, 
  onOpenBackup,
  onOpenInstall 
}) => {
  const todayStr = getTodayString();
  const todayFormatted = formatFullDateES(todayStr);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white shadow-md safe-top">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* App Branding */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-tight text-white">
                MIS REVISITAS
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-teal-200 capitalize font-medium">
                <span>{todayFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: 📲 INSTALAR, 💾 BACKUP y ＋ NUEVA REVISITA */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isStandalone && onOpenInstall && (
            <button
              type="button"
              id="btn-header-instalar-app"
              onClick={onOpenInstall}
              title="Instalar aplicación en dispositivo"
              className="py-2 px-2.5 sm:px-3 bg-emerald-400/20 hover:bg-emerald-400/30 active:bg-emerald-400/40 text-emerald-300 font-extrabold text-xs tracking-wide rounded-xl border border-emerald-400/30 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">INSTALAR</span>
            </button>
          )}

          {onOpenBackup && (
            <button
              type="button"
              id="btn-header-backup"
              onClick={onOpenBackup}
              title="Copia de seguridad y restaurar"
              className="py-2 px-2.5 sm:px-3 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-extrabold text-xs tracking-wide rounded-xl border border-white/20 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">BACKUP</span>
            </button>
          )}

          <button
            type="button"
            id="btn-header-nueva-revisita"
            onClick={onOpenNewRevisita}
            className="py-2 px-3 sm:px-3.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-extrabold text-xs tracking-wide rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="text-xs">＋ NUEVA</span>
          </button>
        </div>
      </div>
    </header>
  );
};
