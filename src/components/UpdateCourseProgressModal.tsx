import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Calendar, 
  Save, 
  Plus, 
  Minus, 
  FileText, 
  CheckCircle2, 
  UserX, 
  CalendarX, 
  PhoneOff, 
  Clock, 
  Sparkles,
  ArrowRight,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Person, CourseHistoryRecord, BibleCourseInfo, StudySessionResult } from '../types';
import { 
  DAYS_OF_WEEK_ORDER,
  formatDateToISO, 
  formatFullDateES, 
  formatShortDateES, 
  getDayName, 
  getNextAllowedDate, 
  getNextDateForDayName,
  getTodayString,
  normalizeDayName,
  parseISODate
} from '../utils/dateUtils';
import { generateUniqueId } from '../utils/storage';
import { DatePickerAllowedDays } from './DatePickerAllowedDays';

interface UpdateCourseProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onSaveProgress: (updatedPerson: Person) => void;
}

const REASONS_NO_PUDE_IR = [
  'Imprevisto de trabajo',
  'Salud / Malestar',
  'Problema de transporte',
  'Emergencia familiar',
  'Asunto de la congregación',
  'Imprevisto de último momento',
];

const REASONS_ESTUDIANTE_NO_PUDO = [
  'Avisó con anticipación',
  'Estudiante enfermo/a',
  'Ocupado/a con trabajo',
  'Compromiso familiar',
  'Salió de viaje / No disponible',
  'Tuvo un imprevisto',
];

export const UpdateCourseProgressModal: React.FC<UpdateCourseProgressModalProps> = ({
  isOpen,
  onClose,
  person,
  onSaveProgress,
}) => {
  if (!isOpen || !person || !person.bibleCourse) return null;

  const currentCourse = person.bibleCourse;
  const todayStr = getTodayString();

  // Selected session result: 4 options
  const [sessionResult, setSessionResult] = useState<StudySessionResult>('ESTUDIO_DADO');

  // Lesson and point (for ESTUDIO_DADO)
  const [lesson, setLesson] = useState<number>(currentCourse.currentLesson || 1);
  const [point, setPoint] = useState<number>(currentCourse.currentPoint || 1);

  // Date of this scheduled study attempt / session
  const [studyDate, setStudyDate] = useState<string>(() => {
    return currentCourse.nextStudyDate || todayStr;
  });

  // Optional reason (for NO_PUDE_IR and ESTUDIANTE_NO_PUDO)
  const [reason, setReason] = useState<string>('');

  // General notes
  const [notes, setNotes] = useState<string>('');

  // Rescheduled / next study date
  const [nextStudyDate, setNextStudyDate] = useState<string>(() => {
    // If there is already a recurring day, suggest the next occurrence
    if (currentCourse.recurringDayName) {
      return getNextDateForDayName(currentCourse.recurringDayName);
    }
    // Or add 7 days to scheduled date
    const base = currentCourse.nextStudyDate || todayStr;
    try {
      const d = parseISODate(base);
      d.setDate(d.getDate() + 7);
      return formatDateToISO(d);
    } catch {
      return getNextAllowedDate();
    }
  });

  const [recurringDayName, setRecurringDayName] = useState<string>(() => {
    return currentCourse.recurringDayName || currentCourse.nextStudyDayName || '';
  });

  const handleSelectDay = (dayName: string) => {
    setRecurringDayName(dayName);
    const calculatedDate = getNextDateForDayName(dayName);
    setNextStudyDate(calculatedDate);
  };

  const handleQuickAddWeek = () => {
    const base = nextStudyDate || todayStr;
    try {
      const d = parseISODate(base);
      d.setDate(d.getDate() + 7);
      const newIso = formatDateToISO(d);
      setNextStudyDate(newIso);
      setRecurringDayName(getDayName(newIso));
    } catch {
      // fallback
    }
  };

  const handleIncrementLesson = () => setLesson(prev => prev + 1);
  const handleDecrementLesson = () => setLesson(prev => Math.max(1, prev - 1));
  const handleIncrementPoint = () => setPoint(prev => prev + 1);
  const handleDecrementPoint = () => setPoint(prev => Math.max(1, prev - 1));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const studyDateFormatted = formatFullDateES(studyDate);
    const nextFormatted = nextStudyDate ? formatFullDateES(nextStudyDate) : undefined;
    const nextDayName = nextStudyDate ? getDayName(nextStudyDate) : undefined;
    const finalRecurring = recurringDayName || nextDayName || currentCourse.recurringDayName;

    const isGiven = sessionResult === 'ESTUDIO_DADO';
    const finalLesson = isGiven ? (Number(lesson) || 1) : currentCourse.currentLesson;
    const finalPoint = isGiven ? (Number(point) || 1) : currentCourse.currentPoint;

    const newHistoryRecord: CourseHistoryRecord = {
      id: generateUniqueId(),
      result: sessionResult,
      lesson: finalLesson,
      point: finalPoint,
      date: studyDate,
      dateFormatted: studyDateFormatted,
      notes: notes.trim() || undefined,
      reason: (sessionResult === 'NO_PUDE_IR' || sessionResult === 'ESTUDIANTE_NO_PUDO') 
        ? (reason.trim() || undefined) 
        : undefined,
      rescheduledDate: nextStudyDate || undefined,
      rescheduledDateFormatted: nextFormatted,
      timestamp: new Date().toISOString(),
    };

    const updatedCourse: BibleCourseInfo = {
      ...currentCourse,
      currentLesson: finalLesson,
      currentPoint: finalPoint,
      nextStudyDate: nextStudyDate || undefined,
      nextStudyDateFormatted: nextFormatted,
      nextStudyDayName: nextDayName,
      recurringDayName: finalRecurring,
      history: [...(currentCourse.history || []), newHistoryRecord],
    };

    const updatedPerson: Person = {
      ...person,
      updatedAt: new Date().toISOString(),
      bibleCourse: updatedCourse,
    };

    onSaveProgress(updatedPerson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full sm:max-w-lg max-h-[94vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200 border border-slate-200"
        id="modal-actualizar-progreso-curso"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-200 font-bold">
                Estudio Bíblico Programado
              </div>
              <h2 className="text-base font-extrabold uppercase tracking-tight">
                ¿QUÉ OCURRIÓ CON EL ESTUDIO?
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student banner */}
        <div className="bg-indigo-50/80 px-5 py-2.5 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-950 font-medium">
          <div className="truncate">
            Estudiante: <span className="font-extrabold text-indigo-900">{person.name}</span>
          </div>
          <div className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-indigo-200 font-bold text-indigo-800 shrink-0">
            Lección actual: {currentCourse.currentLesson} • Punto {currentCourse.currentPoint}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Main 4 Outcome Selection Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase text-slate-800 tracking-wider">
              Selecciona el resultado del estudio:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: ✅ ESTUDIO DADO */}
              <button
                type="button"
                id="btn-resultado-estudio-dado"
                onClick={() => setSessionResult('ESTUDIO_DADO')}
                className={`p-3 rounded-2xl border-2 text-left transition-all flex items-start gap-2.5 ${
                  sessionResult === 'ESTUDIO_DADO'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-300'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  sessionResult === 'ESTUDIO_DADO'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>✅ ESTUDIO DADO</span>
                  </div>
                  <div className="text-[11px] text-slate-600 leading-snug mt-0.5">
                    El estudio se realizó con éxito
                  </div>
                </div>
              </button>

              {/* Option 2: ⚪ ESTUDIANTE NO ESTABA */}
              <button
                type="button"
                id="btn-resultado-estudiante-no-estaba"
                onClick={() => setSessionResult('ESTUDIANTE_NO_ESTABA')}
                className={`p-3 rounded-2xl border-2 text-left transition-all flex items-start gap-2.5 ${
                  sessionResult === 'ESTUDIANTE_NO_ESTABA'
                    ? 'border-slate-700 bg-slate-100 shadow-xs ring-2 ring-slate-300'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  sessionResult === 'ESTUDIANTE_NO_ESTABA'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  <UserX className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>⚪ ESTUDIANTE NO ESTABA</span>
                  </div>
                  <div className="text-[11px] text-slate-600 leading-snug mt-0.5">
                    Fui al lugar pero no estaba
                  </div>
                </div>
              </button>

              {/* Option 3: 🔵 NO PUDE IR */}
              <button
                type="button"
                id="btn-resultado-no-pude-ir"
                onClick={() => setSessionResult('NO_PUDE_IR')}
                className={`p-3 rounded-2xl border-2 text-left transition-all flex items-start gap-2.5 ${
                  sessionResult === 'NO_PUDE_IR'
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-300'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  sessionResult === 'NO_PUDE_IR'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  <CalendarX className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>🔵 NO PUDE IR</span>
                  </div>
                  <div className="text-[11px] text-slate-600 leading-snug mt-0.5">
                    Por mi parte no pude asistir
                  </div>
                </div>
              </button>

              {/* Option 4: 🟠 ESTUDIANTE NO PUDO */}
              <button
                type="button"
                id="btn-resultado-estudiante-no-pudo"
                onClick={() => setSessionResult('ESTUDIANTE_NO_PUDO')}
                className={`p-3 rounded-2xl border-2 text-left transition-all flex items-start gap-2.5 ${
                  sessionResult === 'ESTUDIANTE_NO_PUDO'
                    ? 'border-amber-600 bg-amber-50/80 shadow-xs ring-2 ring-amber-300'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  sessionResult === 'ESTUDIANTE_NO_PUDO'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  <PhoneOff className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>🟠 ESTUDIANTE NO PUDO</span>
                  </div>
                  <div className="text-[11px] text-slate-600 leading-snug mt-0.5">
                    Avisó o no pudo recibirlo
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Date of the attempt / visit */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>
                {sessionResult === 'ESTUDIO_DADO' 
                  ? 'FECHA EN QUE SE DIO EL ESTUDIO:' 
                  : 'FECHA EN QUE ESTABA PROGRAMADO O SE VISITÓ:'}
              </span>
            </label>
            <input
              type="date"
              value={studyDate}
              onChange={(e) => setStudyDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <div className="text-[11px] text-slate-500 capitalize font-medium">
              {formatFullDateES(studyDate)}
            </div>
          </div>

          {/* Dynamic Content: Section for ESTUDIO DADO */}
          {sessionResult === 'ESTUDIO_DADO' && (
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in duration-150">
              <div className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Avance alcanzado en esta sesión:</span>
              </div>

              {/* Lección Stepper */}
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                <div>
                  <div className="text-xs font-bold text-slate-800">📖 LECCIÓN</div>
                  <div className="text-[11px] text-slate-500">Número de lección alcanzada</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDecrementLesson}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-extrabold flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={lesson}
                    onChange={(e) => setLesson(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 h-9 text-center font-extrabold text-lg text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleIncrementLesson}
                    className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-950 font-extrabold flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Punto Stepper */}
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                <div>
                  <div className="text-xs font-bold text-slate-800">🔖 PUNTO / PÁRRAFO</div>
                  <div className="text-[11px] text-slate-500">Párrafo o subtema donde quedaron</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDecrementPoint}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-extrabold flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={point}
                    onChange={(e) => setPoint(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 h-9 text-center font-extrabold text-lg text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleIncrementPoint}
                    className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-950 font-extrabold flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notes for this session */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Notas de la lección (Opcional):</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Le gustó mucho este punto. Quedó pendiente responder la pregunta final..."
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                />
              </div>
            </div>
          )}

          {/* Dynamic Content: Section for ESTUDIANTE NO ESTABA */}
          {sessionResult === 'ESTUDIANTE_NO_ESTABA' && (
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-2.5 text-xs text-slate-800">
                <div className="w-6 h-6 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  ⚪
                </div>
                <div>
                  <div className="font-extrabold text-slate-900">
                    Fui al lugar pero el estudiante no estaba
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Se guardará en el historial. La lección actual (Lección {currentCourse.currentLesson} • Punto {currentCourse.currentPoint}) se conserva para la siguiente cita.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Observaciones del intento (Opcional):</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Toqué la puerta varias veces, llamé al celular y no contestó..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-500 focus:outline-hidden resize-none"
                />
              </div>
            </div>
          )}

          {/* Dynamic Content: Section for NO PUDE IR */}
          {sessionResult === 'NO_PUDE_IR' && (
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-2.5 text-xs text-blue-950">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  🔵
                </div>
                <div>
                  <div className="font-extrabold text-blue-950">
                    El estudio no se realizó porque yo no pude ir
                  </div>
                  <div className="text-[11px] text-blue-800 mt-0.5">
                    Quedará registrado permanentemente en el historial con el motivo opcional indicado.
                  </div>
                </div>
              </div>

              {/* Motivo Opcional */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Motivo por el que no pudiste ir (Opcional):
                </label>

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {REASONS_NO_PUDE_IR.map((r) => {
                    const isSelected = reason === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReason(isSelected ? '' : r)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50'
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Escribe o personaliza el motivo..."
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Notas adicionales (Opcional):</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Le avisé temprano que no podría asistir..."
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
                />
              </div>
            </div>
          )}

          {/* Dynamic Content: Section for ESTUDIANTE NO PUDO */}
          {sessionResult === 'ESTUDIANTE_NO_PUDO' && (
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-2.5 text-xs text-amber-950">
                <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  🟠
                </div>
                <div>
                  <div className="font-extrabold text-amber-950">
                    El estudiante avisó o no pudo recibir el estudio
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    Quedará registrado permanentemente en el historial quién causó que no se diera.
                  </div>
                </div>
              </div>

              {/* Motivo Opcional */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Motivo o mensaje del estudiante (Opcional):
                </label>

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {REASONS_ESTUDIANTE_NO_PUDO.map((r) => {
                    const isSelected = reason === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReason(isSelected ? '' : r)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Escribe o personaliza el motivo..."
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Notas adicionales (Opcional):</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Quedamos en reanudar la próxima semana..."
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-none"
                />
              </div>
            </div>
          )}

          {/* Reprogramar / Próximo estudio (For ALL 4 options) */}
          <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase text-indigo-950 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-700" />
                <span>
                  {sessionResult === 'ESTUDIO_DADO' 
                    ? '📅 PROGRAMAR PRÓXIMO ESTUDIO:' 
                    : '📅 REPROGRAMAR FECHA DEL ESTUDIO:'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickAddWeek}
                className="text-[11px] font-extrabold px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-300 rounded-lg shadow-2xs transition-colors"
                title="Sumar 7 días"
              >
                +1 Semana
              </button>
            </div>

            {/* Días habituales de la semana */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-600 flex items-center justify-between">
                <span>Día de estudio:</span>
                {recurringDayName && (
                  <span className="text-indigo-800 font-bold capitalize">
                    {recurringDayName}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK_ORDER.map((d) => {
                  const isSelected = normalizeDayName(recurringDayName) === normalizeDayName(d.name);
                  return (
                    <button
                      key={d.dayIndex}
                      type="button"
                      onClick={() => handleSelectDay(d.name)}
                      className={`py-1.5 px-0.5 rounded-lg text-center transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-indigo-700 text-white font-bold shadow-2xs ring-2 ring-indigo-400'
                          : 'bg-white hover:bg-indigo-100 border border-slate-200 text-slate-700 font-semibold'
                      }`}
                    >
                      <span className="text-[11px] leading-tight font-black">{d.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exact Date Picker */}
            <DatePickerAllowedDays
              label="Fecha exacta para el próximo estudio:"
              value={nextStudyDate}
              onChange={(newDate) => {
                setNextStudyDate(newDate);
                if (newDate) {
                  setRecurringDayName(getDayName(newDate));
                }
              }}
              required
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-guardar-progreso-curso"
              className={`flex-1 py-3 px-4 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.99] text-center flex items-center justify-center gap-1.5 text-white ${
                sessionResult === 'ESTUDIO_DADO'
                  ? 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900'
                  : sessionResult === 'ESTUDIANTE_NO_ESTABA'
                  ? 'bg-slate-800 hover:bg-slate-900 active:bg-black'
                  : sessionResult === 'NO_PUDE_IR'
                  ? 'bg-blue-700 hover:bg-blue-800 active:bg-blue-900'
                  : 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {sessionResult === 'ESTUDIO_DADO'
                  ? 'GUARDAR ESTUDIO DADO'
                  : 'GUARDAR Y REPROGRAMAR'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
