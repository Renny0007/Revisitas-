import React, { useState, useEffect } from 'react';
import { 
  DownloadCloud, 
  X, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  Sparkles,
  Laptop
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstalled?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  onInstalled
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      if (onInstalled) onInstalled();
      onClose();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onClose, onInstalled]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsStandalone(true);
        if (onInstalled) onInstalled();
      }
      setDeferredPrompt(null);
      onClose();
    }
  };

  return (
    <div 
      id="modal-instalacion-completa"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white text-slate-900 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold shadow-xs">
              <DownloadCloud className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                Instalar "Revisitas"
              </h3>
              <p className="text-xs text-slate-500">
                {isIos ? 'Instalación en iPhone / Safari' : 'Aplicación Web Progresiva (PWA)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If already installed */}
        {isStandalone ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-950 text-sm">¡Ya tienes la aplicación instalada!</h4>
            <p className="text-xs text-emerald-800">
              Estás usando "Revisitas" en modo aplicación independiente con soporte sin conexión.
            </p>
          </div>
        ) : (
          <>
            {/* If direct native install prompt is available (Android / Chrome / Edge) */}
            {deferredPrompt && (
              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-teal-600 shrink-0" />
                  <div className="text-xs text-slate-700">
                    Tu navegador permite instalar la aplicación directamente con un solo toque.
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-confirmar-instalacion-nativa"
                  onClick={handleNativeInstall}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <DownloadCloud className="w-4 h-4 stroke-[2.5]" />
                  <span>INSTALAR AHORA EN DISPOSITIVO</span>
                </button>
              </div>
            )}

            {/* iOS Guide */}
            {isIos ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-teal-700 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Abre <strong>Safari</strong> y toca el botón <strong>Compartir</strong> <Share2 className="inline w-3.5 h-3.5 text-blue-600 mx-0.5" /> en la barra inferior.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-teal-700 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Desliza hacia abajo y selecciona <strong className="text-slate-900">"Agregar a inicio"</strong> <PlusSquare className="inline w-3.5 h-3.5 text-slate-800 mx-0.5" />.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-teal-700 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Toca <strong>"Agregar"</strong> arriba a la derecha para ver el icono en tu pantalla de inicio.
                  </div>
                </div>
              </div>
            ) : !deferredPrompt && (
              /* General Chrome/Desktop Guide when prompt is not triggered */
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-teal-700 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    En <strong>Google Chrome</strong> o <strong>Edge</strong> (móvil o PC), abre el menú de <strong>3 puntos (⋮)</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-teal-700 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Elige <strong>"Instalar aplicación"</strong> o <strong>"Instalar Revisitas"</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-teal-700 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Acepta y tendrás acceso instantáneo desde el menú de aplicaciones o escritorio.
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Benefits summary */}
        <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-3 flex items-center gap-2.5 text-teal-900">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
          <p className="text-[11px] font-medium leading-snug">
            Carga ultrarrápida, pantalla completa sin barras de navegador y funcionamiento 100% offline.
          </p>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-extrabold text-xs rounded-2xl transition-all cursor-pointer"
        >
          CERRAR
        </button>
      </div>
    </div>
  );
};
