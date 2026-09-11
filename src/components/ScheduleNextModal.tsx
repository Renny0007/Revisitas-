import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, BookOpen, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { Person } from '../types';
import { DatePickerAllowedDays } from './DatePickerAllowedDays';
import { formatFullDateES, getDayName, getNextAllowedDate, isAllowedDateString } from '../utils/dateUtils';

interface ScheduleNextModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  mode: 'NEW_VISIT' | 'NEW_ATTEMPT'; // NEW_VISIT = found, NEW_ATTEMPT = not found
  onSchedule: (updatedPerson: Person) => void;
}

export const ScheduleNextModal: React.FC<ScheduleNextModalProps> = ({
  isOpen,
  onClose,
  person,
  mode,
  onSchedule,
}) => {
  const [topicSpoken, setTopicSpoken] = useState('');
  const [topicPending, setTopicPending] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (person) {
      const nextDate = getNextAllowedDate();
      setScheduledDate(nextDate);

      if (mode === 'NEW_VISIT') {
        // Al programar nueva revisita después de encontrarla:
        // El tema que quedó pendiente se convierte habitualmente en el tema hablado
        setTopicSpoken(person.currentVisit?.topicPending || person.currentVisit?.topicSpoken || '');
        setTopicPending('');
      } else {
        // Al programar nuevo intento: conservar los temas previstos
        setTopicSpoken(person.currentVisit?.topicSpoken || '');
        setTopicPending(person.currentVisit?.topicPending || '');
      }
      setErrorMessage(null);
    }
  }, [person, mode, isOpen]);

  if (!isOpen || !person) return null;

  const isNewVisit = mode === 'NEW_VISIT';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedTopicSpoken = topicSpoken.trim();
    const trimmedTopicPending = topicPending.trim();

    if (!trimmedTopicSpoken) {
      setErrorMessage('Por favor especifica el tema hablado o a tratar.');
      return;
    }

    if (!trimmedTopicPending) {
      setErrorMessage('Por favor especifica el tema pendiente para la próxima visita.');
      return;
    }

    if (!scheduledDate || !isAllowedDateString(scheduledDate)) {
      setErrorMessage('Por favor selecciona una fecha para la próxima visita.');
      return;
    }

    const updatedPerson: Person = {
      ...person,
      updatedAt: new Date().toISOString(),
      currentVisit: {
        scheduledDate: scheduledDate,
        scheduledDateFormatted: formatFullDateES(scheduledDate),
        scheduledDayName: getDayName(scheduledDate),
        topicSpoken: trimmedTopicSpoken,
        topicPending: trimmedTopicPending,
        result: 'SIN_REGISTRAR', // Nueva revisita queda en estado pendiente
        actualVisitDate: undefined,
        actualVisitDateFormatted: undefined,
        resultRegisteredAt: undefined,
        resultNotes: undefined,
      },
    };

    onSchedule(updatedPerson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        id="modal-programar-siguiente"
      >
        {/* Header */}
        <div className={`px-5 py-4 text-white flex items-center justify-between shrink-0 shadow-xs ${
          isNewVisit 
            ? 'bg-gradient-to-r from-emerald-700 to-teal-800' 
            : 'bg-gradient-to-r from-amber-700 to-orange-800'
        }`}>
          <div>
            <div className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
              {isNewVisit ? 'Visita exitosa registrada' : 'Intento registrado (no estaba)'}
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {isNewVisit ? (
                <>
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                  <span>＋ PROGRAMAR NUEVA REVISITA</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 text-amber-200" />
                  <span>＋ PROGRAMAR NUEVO INTENTO</span>
                </>
              )}
            </h2>
          </div>
          <button
            type="button"
            id="btn-close-schedule-modal"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition-colors active:scale-95"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Person Target Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Persona
            </div>
            <div className="text-base font-bold text-slate-900">{person.name}</div>
            <div className="text-xs text-slate-600 truncate mt-0.5">{person.address}</div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tema hablado en la visita */}
          <div className="space-y-1.5">
            <label htmlFor="next-topic-spoken" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isNewVisit ? 'TEMA QUE HABLAMOS HOY' : 'TEMA A TRATAR'} <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              id="next-topic-spoken"
              rows={2}
              required
              value={topicSpoken}
              onChange={(e) => setTopicSpoken(e.target.value)}
              placeholder="Ej. El Reino de Dios y sus bendiciones"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 resize-none"
            />
          </div>

          {/* Nuevo tema pendiente */}
          <div className="space-y-1.5">
            <label htmlFor="next-topic-pending" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isNewVisit ? 'NUEVO TEMA QUE QUEDA PENDIENTE' : 'TEMA PENDIENTE'} <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              id="next-topic-pending"
              rows={2}
              required
              value={topicPending}
              onChange={(e) => setTopicPending(e.target.value)}
              placeholder="Ej. ¿Qué hará el Reino de Dios por los enfermos?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 resize-none"
            />
          </div>

          {/* Date Picker */}
          <div className="pt-2">
            <DatePickerAllowedDays
              value={scheduledDate}
              onChange={setScheduledDate}
              label={isNewVisit ? "FECHA DE LA PRÓXIMA REVISITA" : "FECHA DEL NUEVO INTENTO"}
              id="picker-schedule-next"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 pb-2">
            <button
              type="submit"
              id="btn-confirm-schedule-next"
              className={`w-full py-3.5 px-4 font-bold text-sm tracking-wide rounded-xl shadow-md transition-all active:scale-[0.99] text-white flex items-center justify-center gap-2 ${
                isNewVisit 
                  ? 'bg-emerald-700 hover:bg-emerald-800' 
                  : 'bg-amber-700 hover:bg-amber-800'
              }`}
            >
              <span>{isNewVisit ? 'GUARDAR PRÓXIMA REVISITA' : 'GUARDAR NUEVO INTENTO'}</span>
            </button>
            <button
              type="button"
              id="btn-cancel-schedule-next"
              onClick={onClose}
              className="w-full mt-2 py-2.5 px-4 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-lg text-center"
            >
              Omitir por ahora
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
