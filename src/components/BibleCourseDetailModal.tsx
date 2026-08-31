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
  AlertTriangle
} from 'lucide-react';
import { CourseStatus, Person } from '../types';
import { formatFullDateES, getDayName, getNextAllowedDate, getTodayString } from '../utils/dateUtils';

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

  if (!isOpen || !person || !person.bibleCourse) return null;

  const course = person.bibleCourse;
  const history = course.history || [];
  const totalLessons = course.totalLessons || 60;
  const progressPercent = Math.min(100, Math.round((course.currentLesson / totalLessons) * 100));

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

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-black tracking-tight text-white">
                  Lección {course.currentLesson}
                </div>
                <div className="text-xs text-indigo-200 font-semibold mt-0.5">
                  Punto {course.currentPoint}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold text-amber-400">
                  {progressPercent}%
                </div>
                <div className="text-[10px] text-indigo-300">
                  completado
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-indigo-950/60 rounded-full h-3.5 p-0.5 border border-indigo-700/50 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Next study info */}
            <div className="pt-2 border-t border-indigo-800/80 flex items-center justify-between text-xs text-indigo-200">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                <span>Próximo estudio:</span>
              </div>
              <strong className="text-white font-bold capitalize">
                {course.nextStudyDateFormatted || course.nextStudyDate || 'Sin agendar'}
              </strong>
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
              <span>✏️ ACTUALIZAR PROGRESO</span>
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
              <div className="space-y-2">
                {history.slice().reverse().map((rec, index) => (
                  <div 
                    key={rec.id || index}
                    className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-indigo-950 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        📖 Lección {rec.lesson} — Punto {rec.point}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600">
                        📅 {rec.dateFormatted || rec.date}
                      </span>
                    </div>

                    {rec.notes && (
                      <p className="text-xs text-slate-700 italic pl-1 border-l-2 border-indigo-400">
                        "{rec.notes}"
                      </p>
                    )}
                  </div>
                ))}
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
