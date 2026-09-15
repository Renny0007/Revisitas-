import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  Edit3, 
  CheckCircle2, 
  RotateCcw, 
  History, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  PauseCircle,
  PlayCircle,
  XCircle,
  AlertTriangle,
  UserX,
  CalendarX,
  PhoneOff
} from 'lucide-react';
import { CourseStatus, Person } from '../types';
import { 
  DAYS_OF_WEEK_ORDER, 
  formatFullDateES, 
  getDayName, 
  getNextDateForDayName, 
  getTodayString, 
  normalizeDayName, 
  parseISODate, 
  formatDateToISO 
} from '../utils/dateUtils';
import { isBibleCourseDueToday } from '../utils/storage';
import { getCourseProgressDetails } from '../utils/courseProgress';

interface BibleCourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onUpdatePerson: (updatedPerson: Person) => void;
  onOpenUpdateProgress: (person: Person) => void;
  onOpenFullHistory?: (person: Person) => void;
  onOpenFullJourney?: (person: Person) => void;
  onReturnToRevisitas: (person: Person) => void;
}

export const BibleCourseDetailModal: React.FC<BibleCourseDetailModalProps> = ({
  isOpen,
  onClose,
  person,
  onUpdatePerson,
  onOpenUpdateProgress,
  onOpenFullHistory,
  onOpenFullJourney,
  onReturnToRevisitas,
}) => {
  const triggerFullHistory = () => {
    if (person) {
      if (onOpenFullHistory) onOpenFullHistory(person);
      else if (onOpenFullJourney) onOpenFullJourney(person);
    }
  };
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [editingTotalLessons, setEditingTotalLessons] = useState(false);
  const [tempTotalLessons, setTempTotalLessons] = useState(60);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [tempStudyTime, setTempStudyTime] = useState('');
  const [dayFeedbackMessage, setDayFeedbackMessage] = useState<string | null>(null);

  if (!isOpen || !person || !person.bibleCourse) return null;

  const course = person.bibleCourse;
  const history = course.history || [];
  const totalLessons = course.totalLessons || 60;
  const progressPercent = Math.min(100, Math.round((course.currentLesson / totalLessons) * 100));

  const isDueToday = isBibleCourseDueToday(person);
  const todayStr = getTodayString();
  const todayDayName = getDayName(todayStr);

  const progressInfo = getCourseProgressDetails(course);

  const currentStudyDay = course.recurringDayName || course.nextStudyDayName || '';
  const currentStudyDayNorm = normalizeDayName(currentStudyDay);
  const todayDayNorm = normalizeDayName(todayDayName);

  const handleSelectStudyDay = (dayName: string) => {
    const nextDate = getNextDateForDayName(dayName);
    const updated: Person = {
      ...person,
      updatedAt: new Date().toISOString(),
      bibleCourse: {
        ...course,
        recurringDayName: dayName,
        nextStudyDayName: dayName,
        nextStudyDate: nextDate,
        nextStudyDateFormatted: formatFullDateES(nextDate),
      }
    };
    onUpdatePerson(updated);
    const isNowToday = normalizeDayName(dayName) === todayDayNorm;
    if (isNowToday) {
      setDayFeedbackMessage(`¡Día guardado: ${dayName}! Como hoy es ${dayName}, este curso ya aparece activo en el botón «Hoy».`);
    } else {
      setDayFeedbackMessage(`¡Día guardado: ${dayName}! Este curso aparecerá en el botón «Hoy» cada ${dayName}.`);
    }
    setTimeout(() => setDayFeedbackMessage(null), 5000);
  };

  const handleCustomDateChange = (dateISO: string) => {
    if (!dateISO) return;
    const dayName = getDayName(dateISO);
    const updated: Person = {
      ...person,
      updatedAt: new Date().toISOString(),
      bibleCourse: {
        ...course,
        recurringDayName: dayName,
        nextStudyDayName: dayName,
        nextStudyDate: dateISO,
        nextStudyDateFormatted: formatFullDateES(dateISO),
      }
    };
    onUpdatePerson(updated);
  };

  const handleAdvanceWeek = () => {
    const baseDate = course.nextStudyDate ? parseISODate(course.nextStudyDate) : new Date();
    baseDate.setDate(baseDate.getDate() + 7);
    const newISO = formatDateToISO(baseDate);
    const dayName = getDayName(newISO);
    const updated: Person = {
      ...person,
      updatedAt: new Date().toISOString(),
      bibleCourse: {
        ...course,
        nextStudyDate: newISO,
        nextStudyDateFormatted: formatFullDateES(newISO),
        nextStudyDayName: dayName,
      }
    };
    onUpdatePerson(updated);
  };

  const handleSaveStudyTime = () => {
    const trimmed = tempStudyTime.trim();
    if (trimmed === (course.studyTime || '')) return;
    const updated: Person = {
      ...person,
      updatedAt: new Date().toISOString(),
      bibleCourse: {
        ...course,
        studyTime: trimmed || undefined,
      }
    };
    onUpdatePerson(updated);
  };

  const handleStatusChange = (newStatus: CourseStatus) => {
    const updated: Person = {
      ...person,
      updatedAt: new Date().toISOString(),
      bibleCourse: {
        ...course,
        status: newStatus,
      }
    };
    onUpdatePerson(updated);
  };

  const handleSaveTotalLessons = () => {
    const validTotal = Math.max(1, tempTotalLessons);
    const updated: Person = {
      ...person,
      updatedAt: new Date().toISOString(),
      bibleCourse: {
        ...course,
        totalLessons: validTotal,
      }
    };
    onUpdatePerson(updated);
    setEditingTotalLessons(false);
  };

  const handleConfirmReturnToRevisitas = () => {
    onReturnToRevisitas(person);
    setShowRevertConfirm(false);
    onClose();
  };

  const getStatusBadge = () => {
    switch (course.status) {
      case 'ACTIVO':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            🟢 Curso activo
          </span>
        );
      case 'PAUSADO':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            <PauseCircle className="w-3.5 h-3.5 text-amber-700" />
            🟡 Pausado
          </span>
        );
      case 'TERMINADO':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
            <Award className="w-3.5 h-3.5 text-blue-700" />
            🔵 Terminado
          </span>
        );
      case 'NO_CONTINUA':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            🔴 No continúa
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200 border border-slate-200"
        id="modal-detalle-curso-biblico"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">
                FICHA DE CURSO BÍBLICO
              </div>
              <h2 className="text-base font-extrabold text-white tracking-tight uppercase truncate max-w-[220px] sm:max-w-xs">
                {person.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status selection bar */}
        <div className="bg-indigo-50/80 px-5 py-2.5 border-b border-indigo-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-indigo-950 font-bold">
            <span>Estado:</span>
            {getStatusBadge()}
          </div>

          {/* Quick status toggle pills */}
          <div className="flex items-center gap-1">
            {(['ACTIVO', 'PAUSADO', 'TERMINADO', 'NO_CONTINUA'] as CourseStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusChange(st)}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                  course.status === st
                    ? 'bg-indigo-900 text-white shadow-2xs scale-105'
                    : 'bg-white text-slate-600 hover:bg-indigo-100 border border-slate-200'
                }`}
              >
                {st === 'ACTIVO' && 'Activo'}
                {st === 'PAUSADO' && 'Pausar'}
                {st === 'TERMINADO' && 'Terminado'}
                {st === 'NO_CONTINUA' && 'No cont.'}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Progress Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-4 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-200">
                PROGRESO DEL ESTUDIO
              </span>
              <button
                type="button"
                onClick={() => {
                  setTempTotalLessons(totalLessons);
                  setEditingTotalLessons(!editingTotalLessons);
                }}
                className="text-[10px] font-semibold text-indigo-300 hover:text-white underline"
              >
                {editingTotalLessons ? 'Cancelar meta' : `Meta: ${totalLessons} lecc.`}
              </button>
            </div>

            {editingTotalLessons && (
              <div className="bg-indigo-800/80 p-2.5 rounded-xl flex items-center gap-2">
                <span className="text-xs text-indigo-200">Total lecciones del libro:</span>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={tempTotalLessons}
                  onChange={(e) => setTempTotalLessons(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 bg-white text-slate-900 text-xs font-bold rounded-md"
                />
                <button
                  type="button"
                  onClick={handleSaveTotalLessons}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md"
                >
                  Guardar
                </button>
              </div>
            )}

            {/* Clear Student Study Tracking Panel */}
            <div className="bg-indigo-950/70 border border-indigo-700/60 rounded-xl p-3.5 space-y-2 text-xs text-white">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-amber-300">
                  📖 Estudio actual: Lección {progressInfo.displayLesson}
                </span>
                <span className="text-[11px] font-bold text-indigo-200">
                  {progressPercent}% completado
                </span>
              </div>

              {progressInfo.hasStudiedBefore && progressInfo.lastStudiedText && (
                <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <span>✅ Última vez:</span>
                  <span className="font-extrabold text-white">{progressInfo.lastStudiedText}</span>
                </div>
              )}

              <div className="text-indigo-100 font-bold flex items-center gap-1.5">
                <span className="text-amber-300 font-extrabold">▶️ Continuar:</span>
                <span className="font-black text-white">{progressInfo.continueText}</span>
              </div>

              {progressInfo.isLessonFinished && (
                <div className="text-[11px] font-black text-emerald-200 bg-emerald-900/70 p-2 rounded-lg border border-emerald-500/50">
                  🎉 Lección terminada. Próximo estudio: Lección {progressInfo.nextLesson} — párrafo 1
                </div>
              )}

              <div className="text-[11px] text-indigo-200 pt-1.5 border-t border-indigo-800/80 flex items-center justify-between">
                <span>Próximo estudio:</span>
                <strong className="text-white font-black">{progressInfo.nextStudySummary}</strong>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-indigo-950/60 rounded-full h-3 p-0.5 border border-indigo-700/50 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Next study info */}
            <div className="pt-1 border-t border-indigo-800/80 flex items-center justify-between text-xs text-indigo-200">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                <span>Fecha agendada:</span>
              </div>
              <strong className="text-white font-bold capitalize">
                {course.nextStudyDateFormatted || course.nextStudyDate || 'Sin agendar'}
              </strong>
            </div>
          </div>

          {/* DÍA EN QUE LE DOY ESTUDIO (Selector para sincronizar con el botón Hoy) */}
          <div 
            id="card-selector-dia-estudio"
            className="bg-white p-4 rounded-2xl border-2 border-indigo-200/90 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span>Día en que le doy estudio</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Toca un día para agendarlo semanalmente en el botón <strong>«Hoy»</strong>
                  </p>
                </div>
              </div>

              {isDueToday && (
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 shrink-0 animate-pulse">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  ¡Toca hoy!
                </span>
              )}
            </div>

            {/* Selector de los 7 días de la semana */}
            <div>
              <div className="text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 flex items-center justify-between">
                <span>Días de la semana:</span>
                {currentStudyDay && (
                  <span className="text-indigo-700 font-bold capitalize">
                    Día fijado: <strong>{currentStudyDay}</strong>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {DAYS_OF_WEEK_ORDER.map((d) => {
                  const isSelected = currentStudyDayNorm === normalizeDayName(d.name);
                  const isTodayDay = todayDayNorm === normalizeDayName(d.name);

                  return (
                    <button
                      key={d.dayIndex}
                      type="button"
                      id={`btn-seleccionar-dia-${d.short.toLowerCase()}`}
                      onClick={() => handleSelectStudyDay(d.name)}
                      className={`py-2 px-0.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-indigo-700 text-white shadow-md ring-2 ring-indigo-400 font-black scale-[1.03]'
                          : isTodayDay
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold'
                          : 'bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 font-semibold'
                      }`}
                      title={`Fijar estudio los días ${d.name}`}
                    >
                      <span className="text-xs font-black">{d.short}</span>
                      <span className="text-[8px] uppercase tracking-tight opacity-75">{d.name.slice(0, 3)}</span>
                      {isTodayDay && (
                        <span className={`text-[7px] font-black uppercase mt-0.5 ${isSelected ? 'text-amber-200' : 'text-amber-700'}`}>
                          Hoy
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Próxima fecha calculada y opciones */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-600" />
                  <span>Próximo estudio agendado:</span>
                </div>
                <div className="text-xs font-black text-slate-900 capitalize">
                  {course.nextStudyDateFormatted || course.nextStudyDate || 'Selecciona un día'}
                  {course.studyTime && (
                    <span className="ml-1.5 text-indigo-700 font-semibold text-[11px]">
                      a las {course.studyTime}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  id="btn-cambiar-fecha-especifica"
                  onClick={() => setShowCustomDate(!showCustomDate)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors shadow-2xs"
                >
                  {showCustomDate ? 'Ocultar fecha' : 'Elegir otra fecha'}
                </button>

                <button
                  type="button"
                  id="btn-posponer-una-semana"
                  onClick={handleAdvanceWeek}
                  className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg transition-colors shadow-2xs"
                  title="Avanzar 1 semana (+7 días)"
                >
                  +1 Sem.
                </button>
              </div>
            </div>

            {/* Selector de fecha y hora específica expandible */}
            {showCustomDate && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-2 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                      Fecha específica de la cita:
                    </label>
                    <input
                      type="date"
                      value={course.nextStudyDate || todayStr}
                      onChange={(e) => handleCustomDateChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                      Hora habitual (opcional):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 10:00 AM o 16:30"
                      value={tempStudyTime}
                      onChange={(e) => setTempStudyTime(e.target.value)}
                      onBlur={handleSaveStudyTime}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de feedback temporal */}
            {dayFeedbackMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{dayFeedbackMessage}</span>
              </div>
            )}

            {/* Nota informativa */}
            <div className="text-[11px] px-3 py-2 rounded-xl bg-indigo-50/90 border border-indigo-100 text-indigo-950 font-medium flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                {isDueToday ? (
                  <span>
                    <strong>¡Estudio activo hoy!</strong> Como este curso está programado para el día de hoy, lo verás destacado en el botón principal <strong>«Hoy»</strong>.
                  </span>
                ) : (
                  <span>
                    Cada <strong>{currentStudyDay || 'día que selecciones'}</strong>, este curso se incluirá automáticamente en la lista del botón <strong>«Hoy»</strong> junto a las revisitas correspondientes.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-modal-actualizar-progreso"
              onClick={() => onOpenUpdateProgress(person)}
              className="py-3 px-4 bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>✏️ REGISTRAR RESULTADO / PROGRESO</span>
            </button>

            <button
              type="button"
              id="btn-modal-ver-historial-completo"
              onClick={triggerFullHistory}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <History className="w-4 h-4 text-indigo-300" />
              <span>VER HISTORIAL COMPLETO</span>
            </button>
          </div>

          {/* Personal Contact Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Datos del estudiante
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">Dirección:</span>
                  <p className="text-slate-900 font-medium">{person.address || 'Sin dirección registrada'}</p>
                </div>
              </div>

              {person.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(person.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-teal-800 hover:bg-teal-50 shrink-0"
                >
                  Mapa
                </a>
              )}
            </div>

            {person.phone && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Teléfono: <strong className="text-slate-900">{person.phone}</strong></span>
                </div>
                <a
                  href={`tel:${person.phone}`}
                  className="px-2.5 py-1 bg-emerald-100 text-emerald-950 font-bold text-[10px] rounded-lg hover:bg-emerald-200"
                >
                  Llamar
                </a>
              </div>
            )}

            <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-slate-600 text-[11px]">
              <span>📅 Curso iniciado el:</span>
              <strong className="text-slate-900">{course.courseStartedAtFormatted}</strong>
            </div>

            {person.notes && (
              <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-600 italic">
                "{person.notes}"
              </div>
            )}
          </div>

          {/* Study Sessions History List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-700" />
                <span>HISTORIAL DE ESTUDIOS BÍBLICOS ({history.length})</span>
              </h3>
            </div>

            {history.length === 0 ? (
              <div className="bg-slate-50 p-4 rounded-xl text-center text-xs text-slate-500 border border-slate-200">
                No hay sesiones de estudio registradas aún. Pulsa <strong>"ACTUALIZAR PROGRESO"</strong> para registrar la primera sesión.
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.slice().reverse().map((rec, index) => {
                  const result = rec.result || 'ESTUDIO_DADO';
                  const isGiven = result === 'ESTUDIO_DADO';
                  const isStudentAbsent = result === 'ESTUDIANTE_NO_ESTABA';
                  const isCouldNotGo = result === 'NO_PUDE_IR';
                  const isStudentCouldNot = result === 'ESTUDIANTE_NO_PUDO';

                  return (
                    <div 
                      key={rec.id || index}
                      className={`p-3.5 rounded-xl border shadow-2xs space-y-2 ${
                        isGiven
                          ? 'bg-white border-indigo-100'
                          : isStudentAbsent
                          ? 'bg-slate-50/90 border-slate-300'
                          : isCouldNotGo
                          ? 'bg-blue-50/70 border-blue-200'
                          : 'bg-amber-50/70 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${
                          isGiven
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                            : isStudentAbsent
                            ? 'bg-slate-200 text-slate-900 border-slate-400'
                            : isCouldNotGo
                            ? 'bg-blue-100 text-blue-950 border-blue-300'
                            : 'bg-amber-100 text-amber-950 border-amber-300'
                        }`}>
                          {isGiven && (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>✅ ESTUDIO DADO</span>
                            </>
                          )}
                          {isStudentAbsent && (
                            <>
                              <UserX className="w-3.5 h-3.5 text-slate-700" />
                              <span>⚪ ESTUDIANTE NO ESTABA</span>
                            </>
                          )}
                          {isCouldNotGo && (
                            <>
                              <CalendarX className="w-3.5 h-3.5 text-blue-700" />
                              <span>🔵 NO PUDE IR</span>
                            </>
                          )}
                          {isStudentCouldNot && (
                            <>
                              <PhoneOff className="w-3.5 h-3.5 text-amber-700" />
                              <span>🟠 ESTUDIANTE NO PUDO</span>
                            </>
                          )}
                        </span>

                        <span className="text-[11px] font-bold text-slate-600">
                          📅 {rec.dateFormatted || rec.date}
                        </span>
                      </div>

                      {/* Lesson and Point context */}
                      <div className="text-xs text-slate-800 flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-extrabold text-indigo-950 bg-indigo-50/80 px-2.5 py-1 rounded-md border border-indigo-200">
                          📖 Lección {rec.lesson} — {rec.paragraphsText || `Punto ${rec.point}`}
                          {!isGiven && <span className="font-normal text-slate-500 ml-1">(sin avance)</span>}
                        </span>
                        {rec.rescheduledDateFormatted && (
                          <span className="text-[11px] text-indigo-800 font-semibold">
                            🗓️ Reprogramado: <strong>{rec.rescheduledDateFormatted}</strong>
                          </span>
                        )}
                      </div>

                      {/* Who/What caused it explanation */}
                      {!isGiven && (
                        <div className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border ${
                          isStudentAbsent 
                            ? 'bg-slate-100 border-slate-200 text-slate-700' 
                            : isCouldNotGo 
                            ? 'bg-blue-100/60 border-blue-200 text-blue-900' 
                            : 'bg-amber-100/60 border-amber-200 text-amber-900'
                        }`}>
                          {isStudentAbsent && 'Fui al lugar pero el estudiante no se encontraba.'}
                          {isCouldNotGo && 'El estudio no se realizó porque el publicador no pudo asistir.'}
                          {isStudentCouldNot && 'El estudiante avisó o no pudo recibir el estudio.'}
                          {rec.reason && (
                            <div className="mt-1 font-bold">
                              Motivo: <span className="font-normal italic">"{rec.reason}"</span>
                            </div>
                          )}
                        </div>
                      )}

                      {rec.notes && (
                        <p className="text-xs text-slate-700 italic pl-2 border-l-2 border-indigo-400 bg-white/70 p-1.5 rounded-r-lg">
                          "{rec.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* VOLVER A REVISITAS Option */}
          <div className="pt-3 border-t border-slate-200">
            {!showRevertConfirm ? (
              <button
                type="button"
                id="btn-opcion-volver-a-revisitas"
                onClick={() => setShowRevertConfirm(true)}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>VOLVER A REVISITAS (MANTENIENDO HISTORIAL)</span>
              </button>
            ) : (
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-start gap-2 text-rose-950 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-rose-900">
                      ¿Deseas regresar a {person.name} a la sección de Revisitas?
                    </div>
                    <p className="text-[11px] text-rose-800 mt-0.5">
                      Aparecerá nuevamente en tus revisitas activas y se conservarán todas las lecciones e historial.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRevertConfirm(false)}
                    className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    id="btn-confirmar-volver-a-revisitas"
                    onClick={handleConfirmReturnToRevisitas}
                    className="flex-1 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Sí, volver a revisitas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors text-center"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
