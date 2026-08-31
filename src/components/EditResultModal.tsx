import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Clock, Calendar, FileText } from 'lucide-react';
import { Person, VisitResult } from '../types';
import { formatFullDateES, formatShortDateES, getTodayString } from '../utils/dateUtils';

interface EditResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onSaveResult: (updatedPerson: Person) => void;
}

export const EditResultModal: React.FC<EditResultModalProps> = ({
  isOpen,
  onClose,
  person,
  onSaveResult,
}) => {
  const [selectedResult, setSelectedResult] = useState<VisitResult>('SIN_REGISTRAR');
  const [actualDate, setActualDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (person && person.currentVisit) {
      setSelectedResult(person.currentVisit.result || 'SIN_REGISTRAR');
      setActualDate(person.currentVisit.actualVisitDate || getTodayString());
      setNotes(person.currentVisit.resultNotes || '');
    }
  }, [person, isOpen]);

  if (!isOpen || !person) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isResolved = selectedResult !== 'SIN_REGISTRAR';
    const dateFormatted = isResolved ? formatShortDateES(actualDate) : undefined;

    // Actualizar registro en currentVisit
    const updatedPerson: Person = {
      ...person,
      updatedAt: new Date().toISOString(),
      currentVisit: {
        ...person.currentVisit,
        result: selectedResult,
        actualVisitDate: isResolved ? actualDate : undefined,
        actualVisitDateFormatted: dateFormatted,
        resultNotes: notes.trim() || undefined,
        resultRegisteredAt: isResolved ? (person.currentVisit.resultRegisteredAt || new Date().toISOString()) : undefined,
      }
    };

    onSaveResult(updatedPerson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full sm:max-w-md max-h-[92vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        id="modal-editar-resultado"
      >
        {/* Header */}
        <div className="bg-slate-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Corrección de estado
            </div>
            <h2 className="text-lg font-bold text-white">
              EDITAR RESULTADO
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/15 text-white/90"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs font-bold text-slate-900">{person.name}</div>
            <div className="text-[11px] text-slate-600">
              Fecha programada: <span className="font-semibold">{person.currentVisit.scheduledDateFormatted}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Seleccionar resultado:
            </label>

            {/* Option 1: ENCONTRADA */}
            <label 
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedResult === 'ENCONTRADA'
                  ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
              }`}
            >
              <input
                type="radio"
                name="visit-result-option"
                checked={selectedResult === 'ENCONTRADA'}
                onChange={() => setSelectedResult('ENCONTRADA')}
                className="sr-only"
              />
              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                selectedResult === 'ENCONTRADA' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="font-bold text-slate-900">Fui y la encontré</div>
                <p className="text-slate-500 text-[11px] mt-0.5">Visita realizada satisfactoriamente.</p>
              </div>
            </label>

            {/* Option 2: NO_ENCONTRADA */}
            <label 
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedResult === 'NO_ENCONTRADA'
                  ? 'border-rose-600 bg-rose-50/80 text-rose-950 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
              }`}
            >
              <input
                type="radio"
                name="visit-result-option"
                checked={selectedResult === 'NO_ENCONTRADA'}
                onChange={() => setSelectedResult('NO_ENCONTRADA')}
                className="sr-only"
              />
              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                selectedResult === 'NO_ENCONTRADA' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <XCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="font-bold text-slate-900">Fui y no estaba</div>
                <p className="text-slate-500 text-[11px] mt-0.5">Intento realizado sin encontrar a la persona.</p>
              </div>
            </label>

            {/* Option 3: SIN_REGISTRAR */}
            <label 
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedResult === 'SIN_REGISTRAR'
                  ? 'border-amber-600 bg-amber-50/80 text-amber-950 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
              }`}
            >
              <input
                type="radio"
                name="visit-result-option"
                checked={selectedResult === 'SIN_REGISTRAR'}
                onChange={() => setSelectedResult('SIN_REGISTRAR')}
                className="sr-only"
              />
              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                selectedResult === 'SIN_REGISTRAR' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="font-bold text-slate-900">Sin registrar (Pendiente)</div>
                <p className="text-slate-500 text-[11px] mt-0.5">Dejar la revisita en espera de ser realizada.</p>
              </div>
            </label>
          </div>

          {/* Fecha realizada (si está resuelto) */}
          {selectedResult !== 'SIN_REGISTRAR' && (
            <div className="space-y-1.5 pt-2">
              <label htmlFor="input-actual-visit-date" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>FECHA REALMENTE REALIZADA</span>
              </label>
              <input
                id="input-actual-visit-date"
                type="date"
                value={actualDate}
                onChange={(e) => setActualDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-hidden focus:border-slate-800"
              />
              <p className="text-[11px] text-slate-500">
                {actualDate ? formatFullDateES(actualDate) : ''}
              </p>
            </div>
          )}

          {/* Notas del resultado */}
          <div className="space-y-1.5">
            <label htmlFor="input-result-notes" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>NOTAS DEL RESULTADO (Opcional)</span>
            </label>
            <input
              id="input-result-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Estaba ocupada, volver a las 5pm"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-hidden focus:border-slate-800 focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-3">
            <button
              type="submit"
              id="btn-confirm-edit-result"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.99]"
            >
              GUARDAR RESULTADO
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-2 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold text-center"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
