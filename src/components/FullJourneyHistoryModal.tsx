import React, { useState } from 'react';
import { 
  X, 
  History, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  FileText, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Trash2
} from 'lucide-react';
import { Person } from '../types';

interface FullJourneyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onDeleteHistoryItem?: (personId: string, historyId: string) => void;
  onDeleteRevisitaHistoryItem?: (personId: string, historyId: string) => void;
  onDeleteCourseHistoryItem?: (personId: string, courseHistId: string) => void;
}

export const FullJourneyHistoryModal: React.FC<FullJourneyHistoryModalProps> = ({
  isOpen,
  onClose,
  person,
  onDeleteHistoryItem,
  onDeleteRevisitaHistoryItem,
  onDeleteCourseHistoryItem,
}) => {
  const handleDeleteHistory = (personId: string, historyId: string) => {
    if (onDeleteRevisitaHistoryItem) onDeleteRevisitaHistoryItem(personId, historyId);
    else if (onDeleteHistoryItem) onDeleteHistoryItem(personId, historyId);
  };
  const [activeView, setActiveView] = useState<'ALL' | 'REVISITAS' | 'CURSO'>('ALL');

  if (!isOpen || !person) return null;

  const revisitaHistory = person.history || [];
  const courseHistory = person.bibleCourse?.history || [];
  const hasCourse = Boolean(person.bibleCourse);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200 border border-slate-200"
        id="modal-historial-completo"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Trayectoria Completa</span>
            </div>
            <h2 className="text-base font-extrabold uppercase tracking-tight text-white mt-0.5 truncate max-w-[280px] sm:max-w-sm">
              HISTORIAL DE {person.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Address and Stats pill */}
        <div className="bg-slate-100 px-5 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <div className="truncate font-medium flex items-center gap-1">
            <span>📍 {person.address}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="bg-teal-100 text-teal-950 text-[11px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
              {revisitaHistory.length} revisitas
            </span>
            {hasCourse && (
              <span className="bg-indigo-100 text-indigo-950 text-[11px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                {courseHistory.length} estudios
              </span>
            )}
          </div>
        </div>

        {/* View Segmented Tabs */}
        {hasCourse && (
          <div className="bg-white px-4 pt-2.5 pb-1 border-b border-slate-100 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveView('ALL')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors text-center ${
                activeView === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todo el Historial
            </button>
            <button
              type="button"
              onClick={() => setActiveView('REVISITAS')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors text-center ${
                activeView === 'REVISITAS'
                  ? 'bg-teal-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              1. Revisitas ({revisitaHistory.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView('CURSO')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors text-center ${
                activeView === 'CURSO'
                  ? 'bg-indigo-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              2. Curso Bíblico ({courseHistory.length})
            </button>
          </div>
        )}

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* ETAPA 2: CURSO BÍBLICO */}
          {hasCourse && (activeView === 'ALL' || activeView === 'CURSO') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-indigo-200">
                <div className="w-6 h-6 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-extrabold text-xs">
                  2
                </div>
                <div className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-700" />
                  <span>ETAPA 2 — CURSO BÍBLICO</span>
                </div>
                <span className="ml-auto text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  Iniciado: {person.bibleCourse?.courseStartedAtFormatted}
                </span>
              </div>

              {courseHistory.length === 0 ? (
                <div className="bg-indigo-50/50 p-4 rounded-xl text-center text-xs text-indigo-900 border border-indigo-100">
                  Aún no se han registrado sesiones de estudio para este curso bíblico.
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-indigo-200">
                  {courseHistory.map((rec, idx) => (
                    <div key={rec.id || idx} className="relative pl-7">
                      <div className="absolute left-1 top-3 w-4 h-4 -translate-x-1/2 rounded-full border-2 border-white bg-indigo-700 text-white flex items-center justify-center text-[9px] font-extrabold shadow-xs">
                        {idx + 1}
                      </div>

                      <div className="bg-white border border-indigo-200 rounded-xl p-3.5 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between gap-2 border-b border-indigo-100 pb-2">
                          <div className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            <span>LECCIÓN {rec.lesson} — PUNTO {rec.point}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            📅 {rec.dateFormatted || rec.date}
                          </div>
                        </div>

                        {rec.notes && (
                          <div className="text-xs text-slate-700 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                            "{rec.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TRANSITION CONNECTOR */}
          {hasCourse && activeView === 'ALL' && (
            <div className="flex items-center justify-center my-2">
              <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                <span>Pasó de Revisita a Curso Bíblico</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
              </div>
            </div>
          )}

          {/* ETAPA 1: REVISITAS */}
          {(activeView === 'ALL' || activeView === 'REVISITAS') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-teal-200">
                <div className="w-6 h-6 rounded-lg bg-teal-800 text-white flex items-center justify-center font-extrabold text-xs">
                  1
                </div>
                <div className="text-xs font-extrabold text-teal-950 uppercase tracking-wide flex items-center gap-1.5">
                  <History className="w-4 h-4 text-teal-700" />
                  <span>ETAPA 1 — REVISITAS Y CONTACTOS</span>
                </div>
              </div>

              {revisitaHistory.length === 0 ? (
                <div className="bg-slate-50 p-4 rounded-xl text-center text-xs text-slate-500 border border-slate-200">
                  Sin registros previos en la etapa de revisitas.
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                  {revisitaHistory.map((rec, idx) => {
                    const isFound = rec.result === 'ENCONTRADA';
                    const isNotFound = rec.result === 'NO_ENCONTRADA';

                    return (
                      <div key={rec.id || idx} className="relative pl-7">
                        <div className={`absolute left-1 top-3 w-4 h-4 -translate-x-1/2 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                          isFound ? 'bg-emerald-600 text-white' : isNotFound ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {isFound ? (
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          ) : isNotFound ? (
                            <XCircle className="w-2.5 h-2.5" />
                          ) : (
                            <Clock className="w-2.5 h-2.5" />
                          )}
                        </div>

                        <div className={`rounded-xl border p-3.5 space-y-2 shadow-2xs ${
                          isFound 
                            ? 'bg-emerald-50/50 border-emerald-200' 
                            : isNotFound 
                            ? 'bg-rose-50/40 border-rose-200' 
                            : 'bg-white border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
                            <span className="text-xs font-extrabold uppercase text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              Intento {rec.attemptNumber || idx + 1}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isFound ? 'bg-emerald-100 text-emerald-900' : isNotFound ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {isFound ? '🟢 Fui y la encontré' : isNotFound ? '🔴 Fui y no estaba' : '⚪ Sin registrar'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 flex items-center justify-between">
                            <span>📅 Fui el: <strong className="text-slate-900">{rec.actualVisitDateFormatted || rec.actualVisitDate || 'No especificada'}</strong></span>
                            <span>Agendada: {rec.scheduledDateFormatted || rec.scheduledDate}</span>
                          </div>

                          {rec.topicSpoken && (
                            <div className="bg-white p-2.5 rounded-xl border border-emerald-200/90 shadow-2xs">
                              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">
                                <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                                <span>Tema hablado:</span>
                              </div>
                              <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug break-words">
                                {rec.topicSpoken}
                              </div>
                            </div>
                          )}

                          {rec.topicPending && (
                            <div className="text-xs flex items-start gap-1.5 px-1">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-700">Tema pendiente: </span>
                                <span className="text-slate-900 font-semibold text-xs sm:text-[13px]">{rec.topicPending}</span>
                              </div>
                            </div>
                          )}

                          {rec.notes && (
                            <div className="text-xs text-slate-600 italic pt-1 border-t border-slate-200/50">
                              "{rec.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors text-center"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};
