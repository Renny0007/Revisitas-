import React, { useState } from 'react';
import { 
  MapPin, 
  MessageSquare, 
  BookOpen, 
  Calendar, 
  CalendarX,
  CheckCircle2, 
  XCircle, 
  Clock, 
  History, 
  Edit3, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  Phone,
  ChevronRight,
  RotateCcw,
  Ban
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Person, RevisitaStatus, VisitHistoryRecord } from '../types';
import { formatFullDateES, formatShortDateES, getTodayString } from '../utils/dateUtils';
import { generateUniqueId, getPersonStatus } from '../utils/storage';
import { DiscardRevisitaModal } from './DiscardRevisitaModal';

interface RevisitaCardProps {
  person: Person;
  onUpdatePerson?: (updatedPerson: Person) => void;
  onOpenHistory?: (person: Person) => void;
  onHistory?: (person: Person) => void;
  onOpenEdit?: (person: Person) => void;
  onEdit?: (person: Person) => void;
  onOpenScheduleNext?: (person: Person, mode: 'NEW_VISIT' | 'NEW_ATTEMPT') => void;
  onScheduleNext?: (person: Person, mode: 'NEW_VISIT' | 'NEW_ATTEMPT') => void;
  onOpenEditResult?: (person: Person) => void;
  onEditResult?: (person: Person) => void;
  onOpenPassToCourse?: (person: Person) => void;
  onPassToCourse?: (person: Person) => void;
  onCourseDetail?: (person: Person) => void;
}

export const RevisitaCard: React.FC<RevisitaCardProps> = ({
  person,
  onUpdatePerson,
  onOpenHistory,
  onHistory,
  onOpenEdit,
  onEdit,
  onOpenScheduleNext,
  onScheduleNext,
  onOpenEditResult,
  onEditResult,
  onOpenPassToCourse,
  onPassToCourse,
  onCourseDetail,
}) => {
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const status = getPersonStatus(person);
  const currentVisit = person.currentVisit;
  const historyCount = person.history?.length || 0;

  const handleTriggerHistory = () => {
    if (onOpenHistory) onOpenHistory(person);
    else if (onHistory) onHistory(person);
  };

  const handleTriggerEdit = () => {
    if (onOpenEdit) onOpenEdit(person);
    else if (onEdit) onEdit(person);
  };

  const handleTriggerScheduleNext = (mode: 'NEW_VISIT' | 'NEW_ATTEMPT') => {
    if (onOpenScheduleNext) onOpenScheduleNext(person, mode);
    else if (onScheduleNext) onScheduleNext(person, mode);
  };

  const handleTriggerEditResult = () => {
    if (onOpenEditResult) onOpenEditResult(person);
    else if (onEditResult) onEditResult(person);
    else handleResetToPending();
  };

  const handleTriggerPassToCourse = () => {
    if (onOpenPassToCourse) onOpenPassToCourse(person);
    else if (onPassToCourse) onPassToCourse(person);
  };

  const handleConfirmDiscard = (personToDiscard: Person, discardDate: string, reason?: string) => {
    if (!onUpdatePerson) return;
    const todayFormatted = formatShortDateES(discardDate);
    const attemptNumber = (personToDiscard.history?.length || 0) + 1;
    const reasonText = reason ? `Revisita descartada. Motivo: ${reason}` : 'Revisita descartada.';

    const newHistoryRecord: VisitHistoryRecord = {
      id: generateUniqueId(),
      attemptNumber,
      scheduledDate: currentVisit.scheduledDate,
      scheduledDateFormatted: currentVisit.scheduledDateFormatted,
      actualVisitDate: discardDate,
      actualVisitDateFormatted: todayFormatted,
      result: 'DESCARTADA',
      topicSpoken: currentVisit.topicSpoken,
      topicPending: currentVisit.topicPending,
      notes: reasonText,
      timestamp: new Date().toISOString(),
    };

    const updated: Person = {
      ...personToDiscard,
      updatedAt: new Date().toISOString(),
      currentVisit: {
        ...currentVisit,
        result: 'DESCARTADA',
        actualVisitDate: discardDate,
        actualVisitDateFormatted: todayFormatted,
        resultNotes: reason || undefined,
        resultRegisteredAt: new Date().toISOString(),
      },
      history: [...(personToDiscard.history || []), newHistoryRecord],
    };

    onUpdatePerson(updated);
  };

  // Handle Mark "FUI Y LA ENCONTRÉ"
  const handleMarkFound = () => {
    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#059669', '#10b981', '#34d399', '#f59e0b'],
      });
    } catch (e) {
      // safe fallback
    }

    const today = getTodayString();
    const todayFormatted = formatShortDateES(today);

    // 1. Create history record
    const attemptNumber = (person.history?.length || 0) + 1;
    const newHistoryRecord: VisitHistoryRecord = {
      id: generateUniqueId(),
      attemptNumber,
      scheduledDate: currentVisit.scheduledDate,
      scheduledDateFormatted: currentVisit.scheduledDateFormatted,
      actualVisitDate: today,
      actualVisitDateFormatted: todayFormatted,
      result: 'ENCONTRADA',
      topicSpoken: currentVisit.topicSpoken,
      topicPending: currentVisit.topicPending,
      timestamp: new Date().toISOString(),
    };

    // 2. Update current visit status
    const updated: Person = {
      ...person,
      updatedAt: new Date().toISOString(),
      currentVisit: {
        ...currentVisit,
        result: 'ENCONTRADA',
        actualVisitDate: today,
        actualVisitDateFormatted: todayFormatted,
        resultRegisteredAt: new Date().toISOString(),
      },
      history: [...(person.history || []), newHistoryRecord],
    };

    onUpdatePerson(updated);
  };

  // Handle Mark "FUI Y NO ESTABA"
  const handleMarkNotFound = () => {
    const today = getTodayString();
    const todayFormatted = formatShortDateES(today);

    const attemptNumber = (person.history?.length || 0) + 1;
    const newHistoryRecord: VisitHistoryRecord = {
      id: generateUniqueId(),
      attemptNumber,
      scheduledDate: currentVisit.scheduledDate,
      scheduledDateFormatted: currentVisit.scheduledDateFormatted,
      actualVisitDate: today,
      actualVisitDateFormatted: todayFormatted,
      result: 'NO_ENCONTRADA',
      topicSpoken: currentVisit.topicSpoken,
      topicPending: currentVisit.topicPending,
      notes: 'No se encontraba en el domicilio.',
      timestamp: new Date().toISOString(),
    };

    const updated: Person = {
      ...person,
      updatedAt: new Date().toISOString(),
      currentVisit: {
        ...currentVisit,
        result: 'NO_ENCONTRADA',
        actualVisitDate: today,
        actualVisitDateFormatted: todayFormatted,
        resultRegisteredAt: new Date().toISOString(),
      },
      history: [...(person.history || []), newHistoryRecord],
    };

    onUpdatePerson(updated);
  };

  // Handle Mark "NO PUDE IR"
  const handleMarkCouldNotGo = () => {
    const today = getTodayString();
    const todayFormatted = formatShortDateES(today);

    const attemptNumber = (person.history?.length || 0) + 1;
    const newHistoryRecord: VisitHistoryRecord = {
      id: generateUniqueId(),
      attemptNumber,
      scheduledDate: currentVisit.scheduledDate,
      scheduledDateFormatted: currentVisit.scheduledDateFormatted,
      actualVisitDate: today,
      actualVisitDateFormatted: todayFormatted,
      result: 'NO_PUDE_IR',
      topicSpoken: currentVisit.topicSpoken,
      topicPending: currentVisit.topicPending,
      notes: 'No pude ir en la fecha programada.',
      timestamp: new Date().toISOString(),
    };

    const updated: Person = {
      ...person,
      updatedAt: new Date().toISOString(),
      currentVisit: {
        ...currentVisit,
        result: 'NO_PUDE_IR',
        actualVisitDate: today,
        actualVisitDateFormatted: todayFormatted,
        resultRegisteredAt: new Date().toISOString(),
      },
      history: [...(person.history || []), newHistoryRecord],
    };

    onUpdatePerson(updated);
  };

  // Reset to SIN_REGISTRAR
  const handleResetToPending = () => {
    const updated: Person = {
      ...person,
      updatedAt: new Date().toISOString(),
      currentVisit: {
        ...currentVisit,
        result: 'SIN_REGISTRAR',
        actualVisitDate: undefined,
        actualVisitDateFormatted: undefined,
        resultRegisteredAt: undefined,
      },
    };
    onUpdatePerson(updated);
  };

  // Status Badge Rendering
  const renderStatusBadge = () => {
    switch (status) {
      case 'HOY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>🔔 HOY</span>
          </span>
        );
      case 'ATRASADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>🔴 ATRASADA</span>
          </span>
        );
      case 'ENCONTRADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>🟢 ENCONTRADA</span>
          </span>
        );
      case 'NO_ENCONTRADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>🔴 NO ESTABA</span>
          </span>
        );
      case 'NO_PUDE_IR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
            <CalendarX className="w-3.5 h-3.5 text-slate-600" />
            <span>⚪ NO PUDE IR</span>
          </span>
        );
      case 'DESCARTADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
            <Ban className="w-3.5 h-3.5 text-slate-500" />
            <span>⚪ DESCARTADA</span>
          </span>
        );
      case 'PROXIMA':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>🟡 PENDIENTE</span>
          </span>
        );
    }
  };

  const isFound = currentVisit.result === 'ENCONTRADA';
  const isNotFound = currentVisit.result === 'NO_ENCONTRADA';
  const isCouldNotGo = currentVisit.result === 'NO_PUDE_IR';
  const isDiscarded = currentVisit.result === 'DESCARTADA';
  const isUnregistered = currentVisit.result === 'SIN_REGISTRAR';

  return (
    <div 
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md overflow-hidden ${
        status === 'HOY'
          ? 'border-amber-400 ring-2 ring-amber-400/20'
          : status === 'ATRASADA'
          ? 'border-rose-300 ring-2 ring-rose-400/15'
          : status === 'ENCONTRADA'
          ? 'border-emerald-300'
          : 'border-slate-200/90'
      }`}
      id={`revisita-card-${person.id}`}
    >
      {/* Top Header Card */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug break-words">
              {person.name}
            </h3>
            {/* Address */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="break-words font-medium">{person.address}</span>
            </div>
            {person.notes && (
              <div className="text-[11px] text-slate-500 italic mt-0.5 pl-5">
                Ref: {person.notes}
              </div>
            )}
          </div>
          <div className="shrink-0">
            {renderStatusBadge()}
          </div>
        </div>

        {/* Details Box: Temas y Fechas */}
        <div className="mt-3.5 space-y-2.5 bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/80">
          {/* Tema hablado (Agrandado y destacado) */}
          <div className="bg-white rounded-xl p-3 border border-emerald-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">
              <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Tema hablado:</span>
            </div>
            <div className="text-base sm:text-[17px] font-extrabold text-slate-900 leading-snug break-words">
              {currentVisit.topicSpoken || 'Sin tema registrado'}
            </div>
          </div>

          {/* Tema pendiente */}
          <div className="flex items-start gap-2 text-xs px-1">
            <BookOpen className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-bold text-slate-700">Tema pendiente: </span>
              <span className="text-slate-900 font-semibold text-xs sm:text-[13px]">{currentVisit.topicPending}</span>
            </div>
          </div>

          {/* Próxima revisita programada */}
          <div className="flex items-start gap-2 pt-1.5 px-1 border-t border-slate-200/60 text-xs">
            <Calendar className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-bold text-slate-700">Próxima revisita: </span>
              <span className="text-slate-900 font-bold capitalize">
                {currentVisit.scheduledDateFormatted || currentVisit.scheduledDate}
              </span>
            </div>
          </div>

          {/* Fecha realmente realizada (si ya fue registrada) */}
          {currentVisit.actualVisitDate && (
            <div className="flex items-start gap-2 pt-1.5 px-1 border-t border-slate-200/60 text-xs text-slate-800">
              {isFound ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : isNotFound ? (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CalendarX className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <span className="font-bold">
                  {isFound 
                    ? 'Visitado el: ' 
                    : isNotFound 
                    ? 'Intento realizado el: ' 
                    : 'Registrado (no se pudo ir): '}
                </span>
                <span className="font-extrabold capitalize">
                  {currentVisit.actualVisitDateFormatted || currentVisit.actualVisitDate}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sección: REGISTRAR QUÉ OCURRIÓ CUANDO FUI (Selección exclusiva clara de 3 casillas) */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-2 flex items-center justify-between">
            <span>¿QUÉ OCURRIÓ CUANDO FUISTE?</span>
            {!isUnregistered && (
              <button
                type="button"
                onClick={handleTriggerEditResult}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-900 underline flex items-center gap-1"
                title="Editar resultado o corregir fecha"
              >
                <span>Editar resultado</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Opción 1: FUI Y LA ENCONTRÉ */}
            <button
              type="button"
              id={`btn-encontrada-${person.id}`}
              onClick={handleMarkFound}
              className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all active:scale-[0.98] ${
                isFound
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs font-semibold'
                  : 'bg-white hover:bg-emerald-50/70 border-slate-200 text-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-md mt-0.5 border flex items-center justify-center shrink-0 ${
                isFound ? 'bg-white border-white text-emerald-700' : 'border-slate-300 bg-white'
              }`}>
                {isFound && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold leading-tight ${isFound ? 'text-white' : 'text-slate-900'}`}>
                  FUI Y LA ENCONTRÉ
                </div>
                <div className={`text-[10px] mt-0.5 ${isFound ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {isFound && currentVisit.actualVisitDateFormatted 
                    ? `Visitado: ${currentVisit.actualVisitDateFormatted}` 
                    : 'Registra fecha'}
                </div>
              </div>
            </button>

            {/* Opción 2: FUI Y NO ESTABA */}
            <button
              type="button"
              id={`btn-no-encontrada-${person.id}`}
              onClick={handleMarkNotFound}
              className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all active:scale-[0.98] ${
                isNotFound
                  ? 'bg-rose-700 text-white border-rose-700 shadow-xs font-semibold'
                  : 'bg-white hover:bg-rose-50/70 border-slate-200 text-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-md mt-0.5 border flex items-center justify-center shrink-0 ${
                isNotFound ? 'bg-white border-white text-rose-700' : 'border-slate-300 bg-white'
              }`}>
                {isNotFound && <XCircle className="w-3.5 h-3.5 fill-current" />}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold leading-tight ${isNotFound ? 'text-white' : 'text-slate-900'}`}>
                  FUI Y NO ESTABA
                </div>
                <div className={`text-[10px] mt-0.5 ${isNotFound ? 'text-rose-100' : 'text-slate-500'}`}>
                  {isNotFound && currentVisit.actualVisitDateFormatted 
                    ? `Intento: ${currentVisit.actualVisitDateFormatted}` 
                    : 'No estaba'}
                </div>
              </div>
            </button>

            {/* Opción 3: NO PUDE IR */}
            <button
              type="button"
              id={`btn-no-pude-ir-${person.id}`}
              onClick={handleMarkCouldNotGo}
              className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all active:scale-[0.98] ${
                isCouldNotGo
                  ? 'bg-slate-800 text-white border-slate-800 shadow-xs font-semibold'
                  : 'bg-white hover:bg-slate-100/90 border-slate-200 text-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-md mt-0.5 border flex items-center justify-center shrink-0 ${
                isCouldNotGo ? 'bg-white border-white text-slate-800' : 'border-slate-300 bg-white'
              }`}>
                {isCouldNotGo && <CalendarX className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold leading-tight ${isCouldNotGo ? 'text-white' : 'text-slate-900'}`}>
                  NO PUDE IR
                </div>
                <div className={`text-[10px] mt-0.5 ${isCouldNotGo ? 'text-slate-300' : 'text-slate-500'}`}>
                  {isCouldNotGo && currentVisit.actualVisitDateFormatted 
                    ? `Fecha: ${currentVisit.actualVisitDateFormatted}` 
                    : 'Registrar fecha'}
                </div>
              </div>
            </button>
          </div>

          {/* Opción 4: DESCARTAR REVISITA (Debajo de No pude ir) */}
          <div className="mt-2">
            <button
              type="button"
              id={`btn-descartar-revisita-${person.id}`}
              onClick={() => setIsDiscardModalOpen(true)}
              className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all active:scale-[0.98] ${
                isDiscarded
                  ? 'bg-slate-100 text-slate-900 border-slate-400 shadow-xs font-semibold'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-md mt-0.5 border flex items-center justify-center shrink-0 ${
                isDiscarded ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-300 bg-white'
              }`}>
                {isDiscarded ? <Ban className="w-3 h-3 text-white" /> : <span className="w-2 h-2 rounded-full border border-slate-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <div className={`text-xs font-bold leading-tight ${isDiscarded ? 'text-slate-900' : 'text-slate-700'}`}>
                    ⚪ DESCARTAR REVISITA
                  </div>
                  {isDiscarded && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                      Finalizada
                    </span>
                  )}
                </div>
                <div className={`text-[10px] mt-0.5 ${isDiscarded ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                  {isDiscarded && currentVisit.actualVisitDateFormatted 
                    ? `Descartada el: ${currentVisit.actualVisitDateFormatted}${currentVisit.resultNotes ? ` • Motivo: ${currentVisit.resultNotes}` : ''}`
                    : 'Finalizar revisita y guardar motivo en su historial'}
                </div>
              </div>
            </button>
          </div>

          {/* Botones de acción posterior al marcar */}
          {isFound && (
            <div className="mt-2.5 space-y-2">
              <button
                type="button"
                id={`btn-programar-nueva-revisita-${person.id}`}
                onClick={() => handleTriggerScheduleNext('NEW_VISIT')}
                className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>＋ PROGRAMAR NUEVA REVISITA</span>
              </button>
            </div>
          )}

          {isNotFound && (
            <div className="mt-2.5">
              <button
                type="button"
                id={`btn-programar-nuevo-intento-${person.id}`}
                onClick={() => handleTriggerScheduleNext('NEW_ATTEMPT')}
                className="w-full py-2.5 px-3 bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <RefreshCw className="w-4 h-4 text-amber-200" />
                <span>＋ PROGRAMAR NUEVO INTENTO</span>
              </button>
            </div>
          )}

          {isCouldNotGo && (
            <div className="mt-2.5">
              <button
                type="button"
                id={`btn-reprogramar-revisita-${person.id}`}
                onClick={() => handleTriggerScheduleNext('NEW_ATTEMPT')}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Calendar className="w-4 h-4 text-slate-300" />
                <span>＋ REPROGRAMAR PARA OTRO DÍA</span>
              </button>
            </div>
          )}

          {isDiscarded && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <Ban className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">
                    Revisita descartada y finalizada
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {currentVisit.actualVisitDateFormatted ? `Fecha: ${currentVisit.actualVisitDateFormatted}` : ''}
                    {currentVisit.resultNotes ? ` • Motivo: ${currentVisit.resultNotes}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80">
                <button
                  type="button"
                  id={`btn-ver-historial-descartada-${person.id}`}
                  onClick={handleTriggerHistory}
                  className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ver Historial Guardado</span>
                </button>
                <button
                  type="button"
                  id={`btn-reactivar-revisita-${person.id}`}
                  onClick={() => handleTriggerScheduleNext('NEW_ATTEMPT')}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-2xs text-center flex items-center justify-center gap-1.5 transition-colors"
                  title="Reactivar y programar nueva fecha"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-200" />
                  <span>Reactivar</span>
                </button>
              </div>
            </div>
          )}

          {/* Opción destacada: PASÓ A CURSO BÍBLICO */}
          {(onOpenPassToCourse || onPassToCourse) && (
            <div className="mt-3 pt-2.5 border-t border-slate-200/80">
              <button
                type="button"
                id={`btn-pasar-a-curso-${person.id}`}
                onClick={handleTriggerPassToCourse}
                className="w-full p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/80 active:bg-indigo-200 text-indigo-950 flex items-center justify-between transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-indigo-400 bg-white group-hover:border-indigo-600 flex items-center justify-center">
                  </div>
                  <span className="text-xs font-black tracking-wide text-indigo-900">
                    ☐ PASÓ A CURSO BÍBLICO
                  </span>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                  Transferir ➔
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Bar: Historial & Editar & Acciones rápidas */}
      <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        {/* Historial Button */}
        <button
          type="button"
          id={`btn-ver-historial-${person.id}`}
          onClick={handleTriggerHistory}
          className="font-bold text-slate-700 hover:text-emerald-800 flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
        >
          <History className="w-3.5 h-3.5 text-teal-600" />
          <span>HISTORIAL ({historyCount})</span>
        </button>

        {/* Right actions: Phone/Maps & Edit */}
        <div className="flex items-center gap-1">
          {person.phone && (
            <a
              href={`tel:${person.phone}`}
              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-white"
              title="Llamar a la persona"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
          {person.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(person.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-white"
              title="Abrir dirección en Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            type="button"
            id={`btn-editar-revisita-${person.id}`}
            onClick={handleTriggerEdit}
            className="font-extrabold text-xs text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 flex items-center gap-1.5 py-1.5 px-3 rounded-xl shadow-xs border border-blue-700 transition-all active:scale-95"
            title="Editar datos de la persona"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-100" />
            <span>EDITAR</span>
          </button>
        </div>
      </div>

      {/* Modal para descartar revisita con confirmación y motivo */}
      <DiscardRevisitaModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        person={person}
        onConfirmDiscard={handleConfirmDiscard}
      />
    </div>
  );
};
