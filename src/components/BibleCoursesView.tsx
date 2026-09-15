import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Calendar, 
  MapPin, 
  Phone, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  PauseCircle, 
  XCircle,
  Filter,
  UserCheck
} from 'lucide-react';
import { CourseStatus, Person } from '../types';
import { formatFullDateES } from '../utils/dateUtils';
import { isBibleCourseDueToday } from '../utils/storage';
import { getCourseProgressDetails } from '../utils/courseProgress';

interface BibleCoursesViewProps {
  persons: Person[];
  onOpenCourseDetail: (person: Person) => void;
  onOpenUpdateProgress: (person: Person) => void;
  onOpenNewRevisita: () => void;
  onOpenNewCourse?: () => void;
}

export const BibleCoursesView: React.FC<BibleCoursesViewProps> = ({
  persons,
  onOpenCourseDetail,
  onOpenUpdateProgress,
  onOpenNewRevisita,
  onOpenNewCourse,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | CourseStatus>('TODOS');

  // Filter persons who have a Bible Course
  const courseStudents = useMemo(() => {
    return persons.filter(p => p.isBibleCourse || (p.bibleCourse && p.bibleCourse.status !== 'NO_CONTINUA'));
  }, [persons]);

  // Apply search & status filter
  const filteredStudents = useMemo(() => {
    let result = courseStudents;

    if (statusFilter !== 'TODOS') {
      result = result.filter(p => p.bibleCourse?.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(term);
        const addressMatch = p.address.toLowerCase().includes(term);
        const notesMatch = p.bibleCourse?.notes?.toLowerCase().includes(term) || false;
        const lessonMatch = p.bibleCourse ? `lección ${p.bibleCourse.currentLesson}`.includes(term) : false;
        return nameMatch || addressMatch || notesMatch || lessonMatch;
      });
    }

    return result;
  }, [courseStudents, statusFilter, searchTerm]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      total: courseStudents.length,
      activos: courseStudents.filter(p => p.bibleCourse?.status === 'ACTIVO').length,
      pausados: courseStudents.filter(p => p.bibleCourse?.status === 'PAUSADO').length,
      terminados: courseStudents.filter(p => p.bibleCourse?.status === 'TERMINADO').length,
      noContinua: courseStudents.filter(p => p.bibleCourse?.status === 'NO_CONTINUA').length,
    };
  }, [courseStudents]);

  return (
    <div className="space-y-4 pb-20" id="vista-cursos-biblicos">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 rounded-2xl p-4 text-white shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
                Gestión de Estudios
              </div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                CURSOS BÍBLICOS
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-nuevo-curso-biblico-header"
              onClick={onOpenNewCourse || onOpenNewRevisita}
              className="py-1.5 px-3 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 active:bg-indigo-100 font-extrabold text-xs shadow-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-700" />
              <span>Nuevo Curso</span>
            </button>
            <div className="text-right bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <div className="text-base font-black text-white">{counts.activos}</div>
              <div className="text-[10px] font-bold text-indigo-200 uppercase">Activos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="search-cursos-biblicos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por estudiante, dirección o lección..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('TODOS')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
              statusFilter === 'TODOS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVO')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 ${
              statusFilter === 'ACTIVO'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Activos ({counts.activos})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('PAUSADO')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 ${
              statusFilter === 'PAUSADO'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <PauseCircle className="w-3.5 h-3.5 text-amber-700" />
            Pausados ({counts.pausados})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('TERMINADO')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 ${
              statusFilter === 'TERMINADO'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-blue-700" />
            Terminados ({counts.terminados})
          </button>

          {counts.noContinua > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter('NO_CONTINUA')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 ${
                statusFilter === 'NO_CONTINUA'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-700" />
              No continúan ({counts.noContinua})
            </button>
          )}
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              {courseStudents.length === 0 
                ? 'No hay cursos bíblicos registrados aún' 
                : 'No se encontraron estudiantes con ese criterio'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
              {courseStudents.length === 0
                ? 'Puedes registrar un nuevo curso bíblico directamente o pasar una persona de tus revisitas.'
                : 'Intenta limpiar el buscador o seleccionar otro filtro de estado.'}
            </p>
            {courseStudents.length === 0 && (
              <button
                type="button"
                id="btn-empty-nuevo-curso"
                onClick={onOpenNewCourse || onOpenNewRevisita}
                className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Nuevo Curso Bíblico</span>
              </button>
            )}
          </div>
        ) : (
          filteredStudents.map((person) => {
            const course = person.bibleCourse;
            if (!course) return null;

            const totalLessons = course.totalLessons || 60;
            const progressPercent = Math.min(100, Math.round((course.currentLesson / totalLessons) * 100));
            const isDueToday = isBibleCourseDueToday(person);
            const studyDay = course.recurringDayName || course.nextStudyDayName;
            const progressInfo = getCourseProgressDetails(course);

            return (
              <div
                key={person.id}
                id={`card-curso-${person.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all overflow-hidden"
              >
                {/* Card Top: Student name + Status Badge */}
                <div className="p-4 pb-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {person.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{person.address || 'Sin dirección'}</span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {isDueToday && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 animate-pulse">
                          <Sparkles className="w-3 h-3 text-amber-700" />
                          ¡Toca hoy!
                        </span>
                      )}

                      {course.status === 'ACTIVO' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          🟢 Activo
                        </span>
                      )}
                      {course.status === 'PAUSADO' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                          🟡 Pausado
                        </span>
                      )}
                      {course.status === 'TERMINADO' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                          🔵 Terminado
                        </span>
                      )}
                      {course.status === 'NO_CONTINUA' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-rose-50 text-rose-900 border border-rose-200">
                          🔴 No continúa
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course Started date info */}
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <span>📅 Curso iniciado:</span>
                    <strong className="text-slate-700">{course.courseStartedAtFormatted}</strong>
                  </div>

                  {/* Progress Box with Student Study Tracking */}
                  <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                    {/* Clear Student Study Tracking Panel */}
                    <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-2xs space-y-1.5">
                      <div className="text-xs font-black text-indigo-950 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span>📖 Estudio actual:</span>
                          <strong className="text-indigo-700 font-extrabold">Lección {progressInfo.displayLesson}</strong>
                        </span>
                        <span className="text-[11px] font-black text-indigo-900 bg-indigo-100/70 px-2 py-0.5 rounded-md border border-indigo-200">
                          {progressPercent}%
                        </span>
                      </div>

                      {progressInfo.hasStudiedBefore && progressInfo.lastStudiedText && (
                        <div className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                          <span>✅ Última vez:</span>
                          <span className="font-extrabold text-emerald-950">{progressInfo.lastStudiedText}</span>
                        </div>
                      )}

                      <div className="text-xs text-slate-800 font-bold flex items-center gap-1.5">
                        <span className="text-indigo-700 font-extrabold">▶️ Continuar:</span>
                        <span className="font-black text-slate-950">{progressInfo.continueText}</span>
                      </div>

                      {progressInfo.isLessonFinished && (
                        <div className="text-[11px] font-black text-emerald-900 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-300">
                          🎉 Lección terminada. Próximo estudio: Lección {progressInfo.nextLesson} — párrafo 1
                        </div>
                      )}

                      <div className="text-[11px] font-bold text-slate-600 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-slate-500">Próximo estudio:</span>
                        <strong className="text-slate-900 font-black">{progressInfo.nextStudySummary}</strong>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-indigo-200/70 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Next study info and study day tag */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-indigo-950 pt-0.5 gap-1 font-semibold">
                      <div className="flex items-center gap-1">
                        <span>📅 Fecha agendada:</span>
                        <strong className="font-extrabold text-indigo-900 capitalize">
                          {course.nextStudyDateFormatted || course.nextStudyDate || 'Por agendar'}
                        </strong>
                      </div>

                      {studyDay && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCourseDetail(person);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-200 self-start sm:self-auto transition-colors shadow-2xs"
                          title="Toca para cambiar el día de estudio"
                        >
                          <span className="text-slate-500 font-semibold">Día:</span>
                          <span className="font-black text-indigo-700 capitalize">{studyDay}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenCourseDetail(person)}
                    className="flex-1 py-2.5 px-3 bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>VER CURSO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenUpdateProgress(person)}
                    className="py-2.5 px-3 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                    title="Registrar resultado o avance del estudio"
                  >
                    <Edit3 className="w-4 h-4 text-indigo-600" />
                    <span>Registrar</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
