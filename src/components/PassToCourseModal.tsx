import React, { useState } from 'react';
import { X, BookOpen, CheckCircle2, ShieldCheck, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BibleCourseInfo, Person } from '../types';
import { formatFullDateES, getDayName, getNextAllowedDate, getTodayString } from '../utils/dateUtils';
import { generateUniqueId } from '../utils/storage';

interface PassToCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onConfirmPassToCourse?: (updatedPerson: Person) => void;
  onConfirmPass?: (updatedPerson: Person) => void;
}

export const PassToCourseModal: React.FC<PassToCourseModalProps> = ({
  isOpen,
  onClose,
  person,
  onConfirmPassToCourse,
  onConfirmPass,
}) => {
  const todayStr = getTodayString();
  const [startLesson, setStartLesson] = useState(1);
  const [startPoint, setStartPoint] = useState(1);
  const [initialNotes, setInitialNotes] = useState('');

  if (!isOpen || !person) return null;

  const handleConfirm = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b'],
      });
    } catch (e) {
      // safe fallback
    }

    const nextAllowed = getNextAllowedDate();
    const todayFormatted = formatFullDateES(todayStr);

    // If person previously had course data, retain or merge
    const existingCourse = person.bibleCourse;

    const initialHistoryRecord = {
      id: generateUniqueId(),
      lesson: Number(startLesson) || 1,
      point: Number(startPoint) || 1,
      date: todayStr,
      dateFormatted: todayFormatted,
      notes: initialNotes.trim() || 'Inicio formal del curso bíblico.',
      timestamp: new Date().toISOString(),
    };

    const newBibleCourse: BibleCourseInfo = {
      courseStartedAt: existingCourse?.courseStartedAt || todayStr,
      courseStartedAtFormatted: existingCourse?.courseStartedAtFormatted || todayFormatted,
      status: 'ACTIVO',
      currentLesson: Number(startLesson) || 1,
      currentPoint: Number(startPoint) || 1,
      totalLessons: existingCourse?.totalLessons || 60,
      nextStudyDate: nextAllowed,
      nextStudyDateFormatted: formatFullDateES(nextAllowed),
      nextStudyDayName: getDayName(nextAllowed),
      notes: initialNotes.trim() || existingCourse?.notes || '',
      history: existingCourse?.history?.length
        ? [...existingCourse.history, initialHistoryRecord]
        : [initialHistoryRecord],
    };

    const updatedPerson: Person = {
      ...person,
      isBibleCourse: true,
      updatedAt: new Date().toISOString(),
      bibleCourse: newBibleCourse,
    };

    const callback = onConfirmPassToCourse || onConfirmPass;
    if (callback) {
      callback(updatedPerson);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        id="modal-confirmar-pasar-a-curso"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-800 to-indigo-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-200" />
            <h3 className="font-extrabold text-base tracking-tight">
              PASAR A CURSO BÍBLICO
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="text-center">
            <h4 className="text-base font-extrabold text-slate-900 leading-snug">
              ¿Quieres pasar a <span className="text-indigo-800">{person.name}</span> a Cursos bíblicos?
            </h4>
            <p className="text-xs text-slate-600 mt-1.5">
              Esta persona aparecerá en la sección <strong>📖 CURSOS BÍBLICOS</strong> con su ficha de estudio.
            </p>
          </div>

          {/* Data preservation guarantee box */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
              <span>Garantía de conservación de datos:</span>
            </div>
            <ul className="text-[11px] text-indigo-900/90 list-disc pl-4 space-y-0.5">
              <li>Conserva todo el historial anterior de revisitas e intentos.</li>
              <li>Conserva nombre, dirección, teléfono y referencias.</li>
              <li>Registra la fecha actual como inicio del curso.</li>
            </ul>
          </div>

          {/* Initial Lesson & Point configuration */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-700">
              Punto de partida del estudio:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Lección inicial:
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={startLesson}
                  onChange={(e) => setStartLesson(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Punto inicial:
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={startPoint}
                  onChange={(e) => setStartPoint(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Nota u observación inicial (opcional):
              </label>
              <input
                type="text"
                value={initialNotes}
                onChange={(e) => setInitialNotes(e.target.value)}
                placeholder="Ej. Iniciamos con el libro 'Disfrute de la vida'"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              id="btn-cancelar-pasar-curso"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors text-center"
            >
              CANCELAR
            </button>
            <button
              type="button"
              id="btn-confirmar-pasar-curso"
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.99] text-center flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>SÍ, PASAR A CURSO</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
