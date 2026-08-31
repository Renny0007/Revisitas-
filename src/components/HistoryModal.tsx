import React from 'react';
import { X, History, Calendar, CheckCircle2, XCircle, Clock, MessageSquare, BookOpen, FileText, Trash2, ChevronRight } from 'lucide-react';
import { Person, VisitHistoryRecord } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onDeleteHistoryItem?: (personId: string, historyId: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  person,
  onDeleteHistoryItem,
}) => {
  if (!isOpen || !person) return null;

  const history = person.history || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        id="modal-historial"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div>
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-teal-400" />
              <span>Registro histórico</span>
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">
              HISTORIAL DE {person.name}
            </h2>
          </div>
          <button
            type="button"
            id="btn-close-history-modal"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition-colors active:scale-95"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Address and Stats bar */}
        <div className="bg-slate-100/90 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <div className="truncate font-medium flex items-center gap-1">
            <span>📍 {person.address}</span>
          </div>
          <div className="font-bold text-slate-900 shrink-0 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
            {history.length} {history.length === 1 ? 'registro' : 'registros'}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <History className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Sin historial previo aún</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Cuando marques "Fui y la encontré" o "Fui y no estaba", cada intento y visita quedará registrado aquí de forma permanente.
              </p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
              {history.map((record, index) => {
                const isFound = record.result === 'ENCONTRADA';
                const isNotFound = record.result === 'NO_ENCONTRADA';

                return (
                  <div 
                    key={record.id || index}
                    className="relative pl-8 group"
                    id={`history-item-${record.id || index}`}
                  >
                    {/* Timeline Node Dot */}
                    <div className={`absolute left-1.5 top-3.5 w-4.5 h-4.5 -translate-x-1/2 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                      isFound 
                        ? 'bg-emerald-600 text-white' 
                        : isNotFound 
                        ? 'bg-rose-600 text-white' 
                        : 'bg-amber-500 text-white'
                    }`}>
                      {isFound ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : isNotFound ? (
                        <XCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                    </div>

                    {/* Timeline Card */}
                    <div className={`rounded-2xl border p-4 transition-all shadow-2xs ${
                      isFound 
                        ? 'bg-emerald-50/50 border-emerald-200/80' 
                        : isNotFound 
                        ? 'bg-rose-50/40 border-rose-200/80' 
                        : 'bg-white border-slate-200'
                    }`}>
                      {/* Top status bar */}
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/60 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                            Intento {record.attemptNumber || index + 1}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isFound 
                              ? 'bg-emerald-100 text-emerald-900' 
                              : isNotFound 
                              ? 'bg-rose-100 text-rose-900' 
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {isFound && '🟢 Fui y la encontré'}
                            {isNotFound && '🔴 Fui y no estaba'}
                            {!isFound && !isNotFound && '⚪ Sin registrar'}
                          </span>
                        </div>

                        {onDeleteHistoryItem && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('¿Eliminar este registro específico del historial?')) {
                                onDeleteHistoryItem(person.id, record.id);
                              }
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                            title="Eliminar este intento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Dates comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 bg-white/80 p-2.5 rounded-xl border border-slate-200/60 text-xs">
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Programado:</span>
                          </div>
                          <div className="font-semibold text-slate-800 capitalize mt-0.5">
                            {record.scheduledDateFormatted || record.scheduledDate}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-emerald-600" />
                            <span>Fui el:</span>
                          </div>
                          <div className="font-semibold text-emerald-900 capitalize mt-0.5">
                            {record.actualVisitDateFormatted || record.actualVisitDate || 'No especificada'}
                          </div>
                        </div>
                      </div>

                      {/* Topics */}
                      <div className="space-y-2.5">
                        {record.topicSpoken && (
                          <div className="bg-white p-3 rounded-xl border border-emerald-200/90 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">
                              <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span>Tema hablado:</span>
                            </div>
                            <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug break-words">
                              {record.topicSpoken}
                            </div>
                          </div>
                        )}

                        {record.topicPending && (
                          <div className="flex items-start gap-2 text-xs px-1">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-700">Tema pendiente: </span>
                              <span className="text-slate-900 font-semibold text-xs sm:text-[13px]">{record.topicPending}</span>
                            </div>
                          </div>
                        )}

                        {record.notes && (
                          <div className="flex items-start gap-2 pt-1 border-t border-slate-200/50 text-xs px-1">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <div className="text-slate-600 italic">
                              "{record.notes}"
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs text-center uppercase tracking-wider"
          >
            Cerrar historial
          </button>
        </div>
      </div>
    </div>
  );
};
