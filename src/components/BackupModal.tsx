import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Save, 
  Download, 
  UploadCloud, 
  RotateCcw, 
  Copy, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { BackupData, Person } from '../types';
import { 
  createBackupPayload, 
  downloadBackupFile, 
  executeRestore, 
  getLastBackupTimestamp, 
  parseAndValidateBackup, 
  recordLastBackupTimestamp 
} from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  persons: Person[];
  onDataReloaded: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  persons,
  onDataReloaded,
}) => {
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Restore Preview State
  const [pendingBackupData, setPendingBackupData] = useState<BackupData | null>(null);
  const [pendingSummary, setPendingSummary] = useState<{
    createdAtFormatted: string;
    totalPersons: number;
    totalVisits: number;
    totalHistoryRecords: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLastBackup(getLastBackupTimestamp());
      setFeedbackMessage(null);
      setPendingBackupData(null);
      setPendingSummary(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Export JSON File
  const handleCreateBackup = () => {
    try {
      const filename = downloadBackupFile(persons);
      setLastBackup(getLastBackupTimestamp());
      setFeedbackMessage({
        type: 'success',
        text: `✓ Copia de seguridad descargada exitosamente (${filename}).`,
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (e: any) {
      setFeedbackMessage({
        type: 'error',
        text: `Error al generar la copia: ${e.message}`,
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

  // 3. File Input Selected
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
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  // 4. Confirm Restore Execution
  const handleConfirmRestore = () => {
    if (!pendingBackupData) return;

    const result = executeRestore(pendingBackupData);
    setPendingBackupData(null);
    setPendingSummary(null);

    if (result.success) {
      setLastBackup(getLastBackupTimestamp());
      onDataReloaded();
      setFeedbackMessage({
        type: 'success',
        text: `¡Restauración exitosa! Se cargaron ${result.count} personas con todo su historial.`,
      });
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setFeedbackMessage({
        type: 'error',
        text: `Fallo al restaurar: ${result.error}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        id="modal-backup-datos"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-white/10 border border-white/20">
              <Save className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-tight">
                Copia de Seguridad
              </h3>
              <p className="text-[11px] text-teal-200 font-medium">
                Respaldar o restaurar registros
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Feedback Message */}
          {feedbackMessage && (
            <div className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs font-semibold shadow-xs ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
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
            id="file-input-backup-modal"
          />

          {/* Pending Restore Confirmation Banner if file selected */}
          {pendingSummary ? (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase">
                <RotateCcw className="w-4 h-4 text-amber-700" />
                <span>Archivo de respaldo listo</span>
              </div>

              <div className="space-y-1.5 text-xs bg-white p-3 rounded-xl border border-amber-200">
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="font-bold text-slate-600">Fecha:</span>
                  <span className="font-extrabold text-slate-900">{pendingSummary.createdAtFormatted}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="font-bold text-slate-600">Personas:</span>
                  <span className="font-extrabold text-emerald-700">{pendingSummary.totalPersons}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="font-bold text-slate-600">Historiales:</span>
                  <span className="font-extrabold text-slate-800">{pendingSummary.totalHistoryRecords}</span>
                </div>
              </div>

              <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                ¿Deseas restaurar este respaldo? Se actualizarán los registros con los datos del archivo.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPendingBackupData(null);
                    setPendingSummary(null);
                  }}
                  className="flex-1 py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestore}
                  className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  ✓ Confirmar y Restaurar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Status Box */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-600 block text-[11px]">Último respaldo:</span>
                  <span className="text-slate-900 font-extrabold mt-0.5">
                    {lastBackup || 'No realizado todavía'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[11px]">Total registros:</span>
                  <span className="font-extrabold text-teal-700 text-sm">{persons.length}</span>
                </div>
              </div>

              {/* Action 1: Download JSON Backup */}
              <div className="space-y-2">
                <button
                  type="button"
                  id="btn-modal-descargar-backup"
                  onClick={handleCreateBackup}
                  className="w-full py-3.5 px-4 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>💾 CREAR Y DESCARGAR BACKUP (JSON)</span>
                </button>

                <button
                  type="button"
                  id="btn-modal-copiar-json"
                  onClick={handleCopyJSON}
                  className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>{copySuccess ? '✓ Copiado al portapapeles' : 'Copiar texto JSON al portapapeles'}</span>
                </button>
              </div>

              {/* Action 2: Restore */}
              <div className="pt-3 border-t border-slate-200/70 space-y-2">
                <div className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-amber-600" />
                  <span>Restaurar desde archivo</span>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    Puedes subir tu archivo <strong>.json</strong> descargado anteriormente para restaurar todos tus datos.
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-modal-subir-archivo-restore"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>♻️ SELECCIONAR ARCHIVO Y RESTAURAR</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs rounded-xl transition-colors"
          >
            CERRAR
          </button>
        </div>
      </div>
    </div>
  );
};
