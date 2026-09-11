import React, { useState, useEffect } from 'react';
import { X, Ban, Calendar, AlertTriangle, FileText, Check } from 'lucide-react';
import { Person } from '../types';
import { formatFullDateES, getTodayString } from '../utils/dateUtils';

interface DiscardRevisitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onConfirmDiscard: (person: Person, discardDate: string, reason?: string) => void;
}

const PRESET_REASONS = [
  'No mostró interés.',
  'Ya recibe ayuda de otra persona.',
  'No desea continuar.',
  'Otro motivo',
];

export const DiscardRevisitaModal: React.FC<DiscardRevisitaModalProps> = ({
  isOpen,
  onClose,
  person,
  onConfirmDiscard,
}) => {
  const [discardDate, setDiscardDate] = useState(getTodayString());
  const [selectedReasonPreset, setSelectedReasonPreset] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setDiscardDate(getTodayString());
      setSelectedReasonPreset('');
      setCustomReason('');
    }
  }, [isOpen, person]);

  if (!isOpen || !person) return null;

  const handleSelectPreset = (preset: string) => {
    if (selectedReasonPreset === preset) {
      setSelectedReasonPreset('');
      if (preset !== 'Otro motivo') {
        setCustomReason('');
      }
    } else {
      setSelectedReasonPreset(preset);
      if (preset !== 'Otro motivo') {
        setCustomReason(preset);
      } else {
        // Limpiar para que el usuario escriba su propio motivo
        setCustomReason('');
      }
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() || (selectedReasonPreset && selectedReasonPreset !== 'Otro motivo' ? selectedReasonPreset : undefined);
    onConfirmDiscard(person, discardDate || getTodayString(), finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full sm:max-w-md max-h-[94vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200 border border-slate-200"
        id="modal-descartar-revisita"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/10 text-white">
              <Ban className="w-5 h-5 text-slate-200" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Finalizar revisita
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                DESCARTAR REVISITA
              </h2>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-discard-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleConfirm} className="p-5 space-y-4 overflow-y-auto">
          {/* Persona Card Context */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs font-bold text-slate-900">{person.name}</div>
            {person.address && (
              <div className="text-[11px] text-slate-600 truncate mt-0.5">
                📍 {person.address}
              </div>
            )}
            {person.currentVisit?.scheduledDateFormatted && (
              <div className="text-[11px] text-slate-500 mt-0.5">
                Fecha programada: <span className="font-semibold text-slate-700">{person.currentVisit.scheduledDateFormatted}</span>
              </div>
            )}
          </div>

          {/* Prompt de confirmación obligatorio */}
          <div className="p-3.5 bg-amber-50/90 border border-amber-300/80 rounded-xl text-amber-950 flex items-start gap-2.5 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs font-semibold leading-relaxed">
              ¿Deseas descartar esta revisita? Ya no se continuará programando.
            </div>
          </div>

          {/* Fecha en que se descartó */}
          <div className="space-y-1.5">
            <label htmlFor="input-discard-date" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>FECHA EN QUE SE DESCARTÓ</span>
            </label>
            <input
              id="input-discard-date"
              type="date"
              value={discardDate}
              onChange={(e) => setDiscardDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-slate-800"
              required
            />
            <p className="text-[11px] text-slate-500 capitalize font-medium">
              {discardDate ? formatFullDateES(discardDate) : ''}
            </p>
          </div>

          {/* Motivo opcional */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>MOTIVO (OPCIONAL)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Sugerencias rápidas:</span>
            </label>

            {/* Sugerencias de motivos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {PRESET_REASONS.map((preset) => {
                const isSelected = selectedReasonPreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'border-slate-800 bg-slate-900 text-white font-bold shadow-2xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <span className="truncate">{preset}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                  </button>
                );
              })}
            </div>

            {/* Campo de texto libre para el motivo */}
            <textarea
              id="input-custom-discard-reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={2}
              placeholder="Escribe o amplía el motivo aquí (opcional)..."
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Explicación de lo que ocurrirá */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
            <p className="font-semibold text-slate-700">Información importante:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              <li>Se quitará de las revisitas pendientes y del calendario.</li>
              <li>La persona y todo su historial permanecerán guardados.</li>
              <li>Podrás consultarla siempre desde el Directorio de Personas.</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              id="btn-confirm-discard-action"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-black active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Ban className="w-4 h-4 text-slate-300" />
              <span>Confirmar y descartar revisita</span>
            </button>
            <button
              type="button"
              id="btn-cancel-discard-action"
              onClick={onClose}
              className="w-full py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold text-center"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
