import React, { useState, useEffect } from 'react';
import { 
  DownloadCloud, 
  X, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  Monitor, 
  CheckCircle2, 
  Info,
  Sparkles
} from 'lucide-react';

interface PwaInstallBannerProps {
  onInstalled?: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ onInstalled }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS devices (iPhone, iPad, iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser mini-infobar
      e.preventDefault();
      // Save the event to trigger it on user click
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setShowModal(false);
      if (onInstalled) onInstalled();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Direct native install prompt for Chrome/Edge/Android
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowModal(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show instructional modal (especially for iOS Safari or other browsers)
      setShowModal(true);
    }
  };

  // If already standalone installed or explicitly dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Top Floating Installation Notification Banner */}
      <div 
        id="banner-instalar-pwa"
        className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-3.5 sm:p-4 rounded-3xl border border-emerald-500/30 shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-300"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
            <Smartphone className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs tracking-tight text-white uppercase">
                Instalar Revisitas
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-400/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-teal-200/90 font-medium truncate mt-0.5">
              {deferredPrompt 
                ? 'Toca instalar para tener la app en tu pantalla' 
                : isIos 
                  ? 'Disponible para iPhone / iPad' 
                  : 'Funciona 100% sin conexión y pantalla completa'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            id="btn-instalar-app-pwa"
            onClick={handleInstallClick}
            className="py-2 px-3.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <DownloadCloud className="w-4 h-4 stroke-[2.5]" />
            <span>INSTALAR</span>
          </button>

          <button
            type="button"
            id="btn-cerrar-banner-instalar"
            onClick={() => setIsDismissed(true)}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step-by-Step Installation Modal for iOS and Desktop */}
      {showModal && (
        <div 
          id="modal-guia-instalacion-pwa"
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white text-slate-900 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                  <DownloadCloud className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    Cómo Instalar "Revisitas"
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isIos ? 'Guía para iPhone / Safari' : 'Instalación en tu dispositivo'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* iOS Guide */}
            {isIos ? (
              <div className="space-y-3.5">
                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="w-7 h-7 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Abre esta página en el navegador <strong>Safari</strong> de tu iPhone o iPad y presiona el botón <strong>Compartir</strong> <Share2 className="inline w-3.5 h-3.5 text-blue-600 mx-1" /> en la barra inferior.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="w-7 h-7 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Desplázate hacia abajo y pulsa en <strong className="text-slate-900">"Agregar a inicio"</strong> <PlusSquare className="inline w-3.5 h-3.5 text-slate-700 mx-1" />.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="w-7 h-7 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Toca <strong>"Agregar"</strong> en la esquina superior derecha. ¡Listo! La app aparecerá en tu pantalla de inicio como una app nativa.
                  </div>
                </div>
              </div>
            ) : (
              /* Android / Desktop General Guide */
              <div className="space-y-3.5">
                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="w-7 h-7 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    En <strong>Google Chrome</strong> o <strong>Edge</strong>, presiona el menú de <strong>3 puntos (⋮)</strong> en la esquina superior derecha.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="w-7 h-7 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Instalar Revisitas"</strong> en el menú.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="w-7 h-7 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Confirma la instalación y se agregará el icono en tu pantalla de inicio o escritorio sin necesidad de tiendas de aplicaciones.
                  </div>
                </div>
              </div>
            )}

            {/* Benefits Badge */}
            <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-3 flex items-center gap-2.5 text-teal-900">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
              <p className="text-[11px] font-medium leading-snug">
                Disfruta de carga instantánea, pantalla completa y acceso a todas tus revisitas sin conexión a internet.
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs rounded-2xl shadow-sm transition-all"
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}
    </>
  );
};
