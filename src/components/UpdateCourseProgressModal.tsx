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
import { 
  getCourseProgressDetails, 
  formatParagraphsText, 
  calculateNextStudy, 
  PARAGRAPHS_LIST, 
  MAX_PARAGRAPHS_PER_LESSON 
} from '../utils/courseProgress';

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

  // Progress calculations from previous sessions
  const progressInfo = getCourseProgressDetails(currentCourse);

  // Selected session result: 4 options
  const [sessionResult, setSessionResult] = useState<StudySessionResult>('ESTUDIO_DADO');

  // Lesson to study (defaults to the next lesson to continue)
  const [lesson, setLesson] = useState<number>(() => progressInfo.nextLesson || 1);

  // Selected paragraphs (1 to 8)
  const [selectedParagraphs, setSelectedParagraphs] = useState<number[]>(() => {
    const initialP = Math.min(MAX_PARAGRAPHS_PER_LESSON, Math.max(1, progressInfo.nextParagraph || 1));
    return [initialP];
  });

  // Range helper inputs
  const [rangeFrom, setRangeFrom] = useState<number>(() => {
    return Math.min(MAX_PARAGRAPHS_PER_LESSON, Math.max(1, progressInfo.nextParagraph || 1));
  });
  const [rangeTo, setRangeTo] = useState<number>(() => {
    const initialP = Math.min(MAX_PARAGRAPHS_PER_LESSON, Math.max(1, progressInfo.nextParagraph || 1));
    return Math.min(MAX_PARAGRAPHS_PER_LESSON, initialP + 2);
  });

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
    if (currentCourse.recurringDayName) {
      return getNextDateForDayName(currentCourse.recurringDayName);
    }
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

  const applyRange = (from: number, to: number) => {
    const min = Math.min(from, to);
    const max = Math.max(from, to);
    setRangeFrom(min);
    setRangeTo(max);
    const list: number[] = [];
    for (let i = min; i <= max; i++) {
      list.push(i);
    }
    setSelectedParagraphs(list);
  };

  const handleToggleParagraph = (pNum: number) => {
    setSelectedParagraphs(prev => {
      let updated: number[];
      if (prev.includes(pNum)) {
        if (prev.length === 1) return prev; // keep at least one
        updated = prev.filter(p => p !== pNum);
      } else {
        updated = [...prev, pNum];
      }
      updated.sort((a, b) => a - b);
      if (updated.length > 0) {
        setRangeFrom(updated[0]);
        setRangeTo(updated[updated.length - 1]);
      }
      return updated;
    });
  };

  const currentSortedParagraphs = selectedParagraphs.length > 0
    ? [...selectedParagraphs].sort((a, b) => a - b)
    : [1];
  const currentStartParagraph = currentSortedParagraphs[0];
  const currentEndParagraph = currentSortedParagraphs[currentSortedParagraphs.length - 1];
  const currentParagraphsFormatted = formatParagraphsText(currentSortedParagraphs);
  const nextStudyPreview = calculateNextStudy(lesson, currentEndParagraph);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const studyDateFormatted = formatFullDateES(studyDate);
    const nextFormatted = nextStudyDate ? formatFullDateES(nextStudyDate) : undefined;
    const nextDayName = nextStudyDate ? getDayName(nextStudyDate) : undefined;
    const finalRecurring = recurringDayName || nextDayName || currentCourse.recurringDayName;

    const isGiven = sessionResult === 'ESTUDIO_DADO';

    let updatedCourse: BibleCourseInfo;
    let newHistoryRecord: CourseHistoryRecord;

    if (isGiven) {
      newHistoryRecord = {
        id: generateUniqueId(),
        result: 'ESTUDIO_DADO',
        lesson: Number(lesson) || 1,
        point: currentEndParagraph,
        paragraphStart: currentStartParagraph,
        paragraphEnd: currentEndParagraph,
        paragraphs: currentSortedParagraphs,
        paragraphsText: currentParagraphsFormatted,
        date: studyDate,
        dateFormatted: studyDateFormatted,
        notes: notes.trim() || undefined,
        rescheduledDate: nextStudyDate || undefined,
        rescheduledDateFormatted: nextFormatted,
        timestamp: new Date().toISOString(),
      };

      updatedCourse = {
        ...currentCourse,
        currentLesson: nextStudyPreview.nextLesson,
        currentPoint: nextStudyPreview.nextParagraph,
        lastStudiedLesson: Number(lesson) || 1,
        lastStudiedParagraphsText: currentParagraphsFormatted,
        lastStudiedEndParagraph: currentEndParagraph,
        nextStudyDate: nextStudyDate || undefined,
        nextStudyDateFormatted: nextFormatted,
        nextStudyDayName: nextDayName,
        recurringDayName: finalRecurring,
        history: [...(currentCourse.history || []), newHistoryRecord],
      };
    } else {
      // Study was NOT given: DO NOT advance lesson nor paragraphs!
      newHistoryRecord = {
        id: generateUniqueId(),
        result: sessionResult,
        lesson: currentCourse.currentLesson,
        point: currentCourse.currentPoint,
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

      updatedCourse = {
        ...currentCourse,
        // preserve currentLesson, currentPoint, and last studied paragraph data!
        nextStudyDate: nextStudyDate || undefined,
        nextStudyDateFormatted: nextFormatted,
        nextStudyDayName: nextDayName,
        recurringDayName: finalRecurring,
        history: [...(currentCourse.history || []), newHistoryRecord],
      };
    }

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
        <div className="bg-indigo-50/80 px-4 sm:px-5 py-2.5 border-b border-indigo-100 flex items-center justify-between gap-2 text-xs text-indigo-950 font-medium flex-wrap">
          <div className="truncate">
            Estudiante: <span className="font-extrabold text-indigo-900">{person.name}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {progressInfo.hasStudiedBefore && progressInfo.lastStudiedText && (
              <span className="text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold text-emerald-900">
                ✅ Última vez: {progressInfo.lastStudiedText}
              </span>
            )}
            <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-indigo-200 font-bold text-indigo-800 shrink-0">
              ▶️ Continuar: {progressInfo.continueText}
            </span>
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
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-3.5 animate-in fade-in duration-150">
              <div className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Parte de la lección analizada hoy:</span>
              </div>

              {/* Lección Stepper */}
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                <div>
                  <div className="text-xs font-black text-slate-900">📖 LECCIÓN</div>
                  <div className="text-[11px] text-slate-500">Número de lección tratada</div>
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
                    className="w-14 h-9 text-center font-black text-lg text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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

              {/* Párrafos analizados (máximo 8 párrafos: checkboxes 1 a 8) */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="text-xs font-black text-slate-900 uppercase">
                      Párrafos analizados (1 al 8)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Marca los párrafos o selecciona un rango
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-950 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300">
                    {currentParagraphsFormatted}
                  </span>
                </div>

                {/* The 8 Checkboxes (1 al 8) */}
                <div className="space-y-1">
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-0.5">
                    {PARAGRAPHS_LIST.map((pNum) => {
                      const isChecked = selectedParagraphs.includes(pNum);
                      return (
                        <label
                          key={`paragraph-check-${pNum}`}
                          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border-2 cursor-pointer transition-all select-none ${
                            isChecked
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300 scale-[1.02]'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleParagraph(pNum)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-1">
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-black border ${
                              isChecked ? 'bg-white text-emerald-700 border-white' : 'border-slate-400 bg-white'
                            }`}>
                              {isChecked ? '✓' : ''}
                            </span>
                            <span className="text-sm font-black">{pNum}</span>
                          </div>
                          <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5 font-bold">
                            Párr.
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Rango rápido: Selector y atajos */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-700 font-bold flex-wrap gap-2">
                    <span className="text-[11px] text-slate-600 font-black">
                      SELECCIONAR RANGO:
                    </span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-500 font-semibold">Del</span>
                      <select
                        value={rangeFrom}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setRangeFrom(val);
                          applyRange(val, Math.max(val, rangeTo));
                        }}
                        className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      >
                        {PARAGRAPHS_LIST.map(n => (
                          <option key={`from-${n}`} value={n}>Párrafo {n}</option>
                        ))}
                      </select>
                      <span className="text-slate-500 font-semibold">al</span>
                      <select
                        value={rangeTo}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setRangeTo(val);
                          applyRange(Math.min(val, rangeFrom), val);
                        }}
                        className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      >
                        {PARAGRAPHS_LIST.map(n => (
                          <option key={`to-${n}`} value={n}>Párrafo {n}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Range shortcut chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Atajos:</span>
                    <button
                      type="button"
                      onClick={() => applyRange(1, 3)}
                      className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 transition-colors shadow-2xs"
                    >
                      Párrafos 1–3
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRange(4, 8)}
                      className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 transition-colors shadow-2xs"
                    >
                      Párrafos 4–8
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRange(1, 8)}
                      className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 transition-colors shadow-2xs"
                    >
                      Toda (1 al 8)
                    </button>
                    {progressInfo.nextParagraph > 1 && progressInfo.nextParagraph < 8 && (
                      <button
                        type="button"
                        onClick={() => applyRange(progressInfo.nextParagraph, 8)}
                        className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 transition-colors shadow-2xs"
                      >
                        Párr. {progressInfo.nextParagraph} al 8
                      </button>
                    )}
                  </div>
                </div>

                {/* Calculation preview */}
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-1.5">
                  <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <span>📖 Registrando: Lección {lesson}, {currentParagraphsFormatted}</span>
                  </div>
                  <div className="text-xs text-slate-800 flex items-center gap-1.5">
                    <span className="font-bold text-indigo-700">▶️ Continuar:</span>
                    <span className="font-black text-slate-950">{nextStudyPreview.continueText}</span>
                  </div>
                  <div className="text-[11px] font-bold text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center justify-between">
                    <span>Próximo estudio:</span>
                    <span className="font-black text-indigo-950">{nextStudyPreview.nextStudySummary}</span>
                  </div>
                  {nextStudyPreview.isLessonFinished && (
                    <div className="text-xs font-black text-emerald-900 bg-emerald-100 p-2 rounded-lg border border-emerald-300">
                      🎉 Lección terminada. Próximo estudio: Lección {nextStudyPreview.nextLesson} — párrafo 1
                    </div>
                  )}
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
