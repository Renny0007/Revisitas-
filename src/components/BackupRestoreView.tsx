import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, 
  UploadCloud, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  FileCode, 
  Bell, 
  Smartphone, 
  Database,
  Trash2,
  CalendarCheck2,
  DownloadCloud,
  Share2,
  Info
} from 'lucide-react';
import { BackupData, Person } from '../types';
import { 
  createBackupPayload, 
  downloadBackupFile, 
  executeRestore, 
  getInitialSampleData, 
  getLastBackupTimestamp, 
  parseAndValidateBackup, 
  recordLastBackupTimestamp, 
  savePersonsToStorage 
} from '../utils/storage';
import { getNotificationPermission, isNotificationSupported, requestNotificationPermission, sendLocalNotification } from '../utils/notifications';
import { InstallAppModal } from './InstallAppModal';

interface BackupRestoreViewProps {
  persons: Person[];
  onDataReloaded: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  persons,
  onDataReloaded,
}) => {
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Restore Preview Modal State
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [pendingBackupData, setPendingBackupData] = useState<BackupData | null>(null);
  const [pendingSummary, setPendingSummary] = useState<{
    createdAtFormatted: string;
    totalPersons: number;
    totalVisits: number;
    totalHistoryRecords: number;
  } | null>(null);

  // Notification State
  const [notificationState, setNotificationState] = useState<NotificationPermission>('default');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLastBackup(getLastBackupTimestamp());
    setNotificationState(getNotificationPermission());
  }, []);

  // 1. Create and Download JSON Backup
  const handleCreateBackup = () => {
    try {
      const filename = downloadBackupFile(persons);
      recordLastBackupTimestamp();
      setLastBackup(getLastBackupTimestamp());
      setFeedbackMessage({
        type: 'success',
        text: `Copia de seguridad generada y descargada exitosamente como "${filename}".`,
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (e: any) {
      setFeedbackMessage({
        type: 'error',
        text: `Error al generar la copia de seguridad: ${e.message}`,
      });
    }
  };

  // 2. Copy JSON text to clipboard
  const handleCopyJSON = () => {
    try {
      const payload = createBackupPayload(persons);
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      recordLastBackupTimestamp();
      setLastBackup(getLastBackupTimestamp());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (e) {
      alert('No se pudo copiar al portapapeles.');
    }
  };

  // 3. File Input Changed
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = parseAndValidateBackup(content);
      if (!result.valid || !result.data || !result.summary) {
        setFeedbackMessage({
          type: 'error',
          text: result.error || 'El archivo seleccionado no tiene un formato válido.',
        });
        return;
      }

      setPendingBackupData(result.data);
      setPendingSummary(result.summary);
      setShowRestoreModal(true);
    };

    reader.readAsText(file);
    // Reset input so same file can be reselected
    e.target.value = '';
  };

  // 4. Confirm Restore Execution
  const handleConfirmRestore = () => {
    if (!pendingBackupData) return;

    const result = executeRestore(pendingBackupData);
    setShowRestoreModal(false);

    if (result.success) {
      setLastBackup(getLastBackupTimestamp());
      onDataReloaded();
      setFeedbackMessage({
        type: 'success',
        text: `¡Restauración exitosa! Se cargaron ${result.count} personas con todo su historial.`,
      });
      setTimeout(() => setFeedbackMessage(null), 6000);
    } else {
      setFeedbackMessage({
        type: 'error',
        text: result.error || 'Ocurrió un error al restaurar los datos.',
      });
    }
  };

  // 5. Request Notifications
  const handleRequestNotifications = async () => {
    if (!isNotificationSupported()) {
      alert('Tu navegador no soporta notificaciones de escritorio/móviles.');
      return;
    }

    const permission = await requestNotificationPermission();
    setNotificationState(permission);

    if (permission === 'granted') {
      sendLocalNotification(
        '🔔 Notificaciones Activadas',
        {
          body: 'Recibirás recordatorios visuales de tus revisitas programadas para el día.',
        }
      );
      setFeedbackMessage({
        type: 'success',
        text: 'Permisos de notificación otorgados exitosamente.',
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } else {
      setFeedbackMessage({
        type: 'error',
        text: 'Permisos de notificación no autorizados o denegados.',
      });
    }
  };

  // 6. Load Sample Data
  const handleLoadSampleData = () => {
    if (confirm('¿Cargar datos de ejemplo? Esto reemplazará los datos actuales.')) {
      const sample = getInitialSampleData();
      savePersonsToStorage(sample);
      onDataReloaded();
      setFeedbackMessage({
        type: 'success',
        text: 'Datos de ejemplo cargados exitosamente.',
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // 7. Clear all data
  const handleClearAllData = () => {
    if (confirm('⚠️ ¿Estás COMPLETAMENTE SEGURO de vaciar todos los registros? Esta acción no se puede deshacer si no tienes un backup.')) {
      if (confirm('Por favor confirma por segunda vez que deseas borrar todos los datos:')) {
        savePersonsToStorage([]);
        onDataReloaded();
        setFeedbackMessage({
          type: 'success',
          text: 'Todos los registros han sido borrados.',
        });
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    }
  };

  return (
    <div className="space-y-5 pb-24" id="view-backup-restore">
      {/* View Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-4 sm:p-5 rounded-3xl shadow-sm space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-white/10 text-emerald-300">
            <Save className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase leading-tight">
              MÁS OPCIONES & BACKUP
            </h1>
            <p className="text-xs text-teal-200">
              Copias de seguridad, instalación PWA y configuración.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs font-semibold shadow-xs animate-in fade-in duration-200 ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{feedbackMessage.text}</div>
        </div>
      )}

      {/* Hidden File Input for Restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileSelected}
        id="file-input-backup"
      />

      {/* Section 0: PWA Installation Options */}
      <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-5 shadow-sm space-y-3.5 border border-teal-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight uppercase text-white">
                Instalar Aplicación (PWA)
              </h2>
              <p className="text-[11px] text-teal-200">
                Instala "Revisitas" en tu Android, iPhone o PC.
              </p>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-lg border border-emerald-400/20">
            OFFLINE
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Al instalarla tendrás el icono oficial en tu pantalla de inicio, modo pantalla completa sin barra de navegador y acceso 100% independiente a tus datos.
        </p>

        <button
          type="button"
          id="btn-abrir-guia-instalacion"
          onClick={() => setIsInstallModalOpen(true)}
          className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
        >
          <Smartphone className="w-4 h-4 stroke-[2.5]" />
          <span>Ver Guía / Instalar en Dispositivo</span>
        </button>
      </div>

      {/* Section 1: Backup & Export */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
            <Save className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              COPIA DE SEGURIDAD
            </h2>
            <p className="text-xs text-slate-500">
              Guarda un archivo de respaldo con todos tus registros e historiales.
            </p>
          </div>
        </div>

        {/* Info of last backup */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-700 block">Último backup:</span>
            <span className="text-slate-900 font-extrabold mt-0.5">
              {lastBackup ? lastBackup : 'No realizado'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[11px]">Personas actuales:</span>
            <span className="font-extrabold text-teal-700 text-sm">{persons.length}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            id="btn-crear-backup-descargar"
            onClick={handleCreateBackup}
            className="w-full py-3.5 px-4 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>💾 CREAR BACKUP (DESCARGAR JSON)</span>
          </button>

          <button
            type="button"
            id="btn-copiar-json-backup"
            onClick={handleCopyJSON}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-slate-600" />
            <span>{copySuccess ? '✓ ¡COPIADO AL PORTAPAPELES!' : 'Copiar texto JSON al portapapeles'}</span>
          </button>
        </div>
      </div>

      {/* Section 2: Restore from Backup */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              RESTAURAR COPIA DE SEGURIDAD
            </h2>
            <p className="text-xs text-slate-500">
              Recupera tus datos a partir de un archivo JSON descargado previamente.
            </p>
          </div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 text-xs flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            El archivo de respaldo contiene el formato seguro con firma de integridad.
          </span>
        </div>

        <button
          type="button"
          id="btn-cargar-archivo-restore"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>CARGAR ARCHIVO JSON DE RESPALDO</span>
        </button>
      </div>

      {/* Section 3: Notification settings & Android rules */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              RECORDATORIOS Y NOTIFICACIONES
            </h2>
            <p className="text-xs text-slate-500">
              Avisos locales para las revisitas programadas de hoy.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <div className="font-bold text-slate-900">Estado de notificaciones:</div>
            <div className="text-slate-500 font-medium">
              {notificationState === 'granted' ? '🟢 Permitidas' : notificationState === 'denied' ? '🔴 Bloqueadas' : '⚪ Sin configurar'}
            </div>
          </div>

          <button
            type="button"
            id="btn-solicitar-permiso-notif"
            onClick={handleRequestNotifications}
            className="py-1.5 px-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
          >
            {notificationState === 'granted' ? 'Probar aviso' : 'Activar permisos'}
          </button>
        </div>
      </div>

      {/* Section 4: Rules and Allowed Days Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
          <CalendarCheck2 className="w-4 h-4 text-teal-700" />
          <span>REGLAS DE DÍAS PERMITIDOS</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Las revisitas se programan exclusivamente en los siguientes 4 días de la semana:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs text-center">
            ✓ MARTES
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs text-center">
            ✓ JUEVES
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs text-center">
            ✓ SÁBADO
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs text-center">
            ✓ DOMINGO
          </div>
        </div>
        <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          🚫 Lunes, Miércoles y Viernes están estrictamente bloqueados en toda la aplicación.
        </div>
      </div>

      {/* Section 5: Diagnostic and Reset Tools */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
          <Database className="w-4 h-4 text-slate-600" />
          <span>HERRAMIENTAS DE DATOS</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            id="btn-recargar-ejemplos"
            onClick={handleLoadSampleData}
            className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            Cargar datos de ejemplo
          </button>

          <button
            type="button"
            id="btn-vaciar-datos-todos"
            onClick={handleClearAllData}
            className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Vaciar todo</span>
          </button>
        </div>
      </div>

      {/* RESTORE CONFIRMATION MODAL */}
      {showRestoreModal && pendingSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            id="modal-confirmar-restore"
          >
            <div className="bg-amber-600 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                <span>BACKUP ENCONTRADO</span>
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="font-bold text-slate-600">Fecha del respaldo:</span>
                  <span className="font-extrabold text-slate-900 text-right">{pendingSummary.createdAtFormatted}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="font-bold text-slate-600">Personas:</span>
                  <span className="font-extrabold text-emerald-800">{pendingSummary.totalPersons}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="font-bold text-slate-600">Revisitas programadas:</span>
                  <span className="font-extrabold text-teal-800">{pendingSummary.totalVisits}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-bold text-slate-600">Registros de historial:</span>
                  <span className="font-extrabold text-slate-900">{pendingSummary.totalHistoryRecords}</span>
                </div>
              </div>

              <div className="text-center font-bold text-slate-900 text-sm">
                ¿Deseas restaurar este backup?
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Se actualizarán los registros con los datos contenidos en el archivo de respaldo.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  id="btn-cancelar-restore-modal"
                  onClick={() => setShowRestoreModal(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  id="btn-ejecutar-restore-modal"
                  onClick={handleConfirmRestore}
                  className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  RESTAURAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSTALL APP MODAL */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstalled={() => {
          setFeedbackMessage({
            type: 'success',
            text: '¡Aplicación instalada exitosamente!',
          });
          setTimeout(() => setFeedbackMessage(null), 4000);
        }}
      />
    </div>
  );
};
