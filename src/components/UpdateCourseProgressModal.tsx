import React, { useState } from 'react';
import { X, BookOpen, Calendar, Save, Plus, Minus, FileText, CheckCircle2 } from 'lucide-react';
import { Person, CourseHistoryRecord, BibleCourseInfo } from '../types';
import { 
  formatDateToISO, 
  formatFullDateES, 
  formatShortDateES, 
  getDayName, 
  getNextAllowedDate, 
  getTodayString 
} from '../utils/dateUtils';
import { generateUniqueId } from '../utils/storage';
import { DatePickerAllowedDays } from './DatePickerAllowedDays';

interface UpdateCourseProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onSaveProgress: (updatedPerson: Person) => void;
}

export const UpdateCourseProgressModal: React.FC<UpdateCourseProgressModalProps> = ({
  isOpen,
  onClose,
  person,
  onSaveProgress,
}) => {
  if (!isOpen || !person || !person.bibleCourse) return null;

  const currentCourse = person.bibleCourse;
  const todayStr = getTodayString();

  const [lesson, setLesson] = useState<number>(currentCourse.currentLesson || 1);
  const [point, setPoint] = useState<number>(currentCourse.currentPoint || 1);
  const [studyDate, setStudyDate] = useState<string>(todayStr);
  const [notes, setNotes] = useState<string>('');
  const [nextStudyDate, setNextStudyDate] = useState<string>(() => {
    return currentCourse.nextStudyDate || getNextAllowedDate();
  });

  const handleIncrementLesson = () => setLesson(prev => prev + 1);
  const handleDecrementLesson = () => setLesson(prev => Math.max(1, prev - 1));
  const handleIncrementPoint = () => setPoint(prev => prev + 1);
  const handleDecrementPoint = () => setPoint(prev => Math.max(1, prev - 1));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const studyDateFormatted = formatFullDateES(studyDate);
    const nextFormatted = nextStudyDate ? formatFullDateES(nextStudyDate) : undefined;
    const nextDayName = nextStudyDate ? getDayName(nextStudyDate) : undefined;

    const newHistoryRecord: CourseHistoryRecord = {
      id: generateUniqueId(),
      lesson: Number(lesson) || 1,
      point: Number(point) || 1,
      date: studyDate,
      dateFormatted: studyDateFormatted,
      notes: notes.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    const updatedCourse: BibleCourseInfo = {
      ...currentCourse,
      currentLesson: Number(lesson) || 1,
      currentPoint: Number(point) || 1,
      nextStudyDate: nextStudyDate || undefined,
      nextStudyDateFormatted: nextFormatted,
      nextStudyDayName: nextDayName,
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
        className="bg-white w-full sm:max-w-md max-h-[92vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200 border border-slate-200"
        id="modal-actualizar-progreso-curso"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-800 to-indigo-700 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-200" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-200 font-semibold">
                Estudio Bíblico
              </div>
              <h2 className="text-base font-extrabold uppercase tracking-tight">
                ACTUALIZAR PROGRESO
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

        {/* Student banner */}
        <div className="bg-indigo-50/70 px-5 py-2.5 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-950 font-medium">
          <div className="truncate">
            Estudiante: <span className="font-extrabold text-indigo-900">{person.name}</span>
          </div>
          <div className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-indigo-200 font-bold text-indigo-800">
            Lección {currentCourse.currentLesson} • Punto {currentCourse.currentPoint}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Lesson & Point Steppers */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
            <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Nuevo avance alcanzado hoy:
            </div>

            {/* Lección */}
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div>
                <div className="text-xs font-bold text-slate-700">📖 LECCIÓN</div>
                <div className="text-[11px] text-slate-500">Número de lección</div>
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
                  className="w-14 h-9 text-center font-extrabold text-lg text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleIncrementLesson}
                  className="w-8 h-8 rounded-lg bg-indigo-100 hover:bg-indigo-200 active:bg-indigo-300 text-indigo-900 font-extrabold flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Punto */}
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div>
                <div className="text-xs font-bold text-slate-700">🔖 PUNTO / PÁRRAFO</div>
                <div className="text-[11px] text-slate-500">Punto o subtema</div>
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
                  className="w-14 h-9 text-center font-extrabold text-lg text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleIncrementPoint}
                  className="w-8 h-8 rounded-lg bg-indigo-100 hover:bg-indigo-200 active:bg-indigo-300 text-indigo-900 font-extrabold flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Date of study (defaults to today) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>FECHA DEL ESTUDIO:</span>
            </label>
            <input
              type="date"
              value={studyDate}
              onChange={(e) => setStudyDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <div className="text-[11px] text-slate-500 mt-1 capitalize font-medium">
              {formatFullDateES(studyDate)}
            </div>
          </div>

          {/* Notes for this study session */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>NOTAS DE LA LECCIÓN (Opcional):</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Le gustó mucho este punto. Quedó pendiente explicar el video..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Next Study Date Picker */}
          <div className="pt-1">
            <DatePickerAllowedDays
              label="📅 PRÓXIMO ESTUDIO:"
              value={nextStudyDate}
              onChange={setNextStudyDate}
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
              className="flex-1 py-3 px-4 bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.99] text-center flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>GUARDAR PROGRESO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
