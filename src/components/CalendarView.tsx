import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  User, 
  MapPin, 
  Clock, 
  AlertCircle, 
  Sparkles,
  CheckCircle2,
  BookOpen,
  Edit3
} from 'lucide-react';
import { Person } from '../types';
import { 
  formatDateToISO, 
  formatFullDateES, 
  getDayName, 
  getTodayString, 
  isAllowedDateString, 
  isAllowedDayOfWeek, 
  MONTH_NAMES_ES, 
  DAY_NAMES_ES 
} from '../utils/dateUtils';
import { RevisitaCard } from './RevisitaCard';
import { isRevisitaDueToday, isBibleCourseDueToday } from '../utils/storage';

interface CalendarViewProps {
  persons: Person[];
  onOpenNewRevisita?: (date?: string) => void;
  onOpenNewWithDate?: (date?: string) => void;
  onUpdatePerson?: (person: Person) => void;
  onOpenHistory?: (person: Person) => void;
  onSelectPersonForHistory?: (person: Person) => void;
  onOpenEdit?: (person: Person) => void;
  onSelectPersonForEdit?: (person: Person) => void;
  onOpenScheduleNext?: (person: Person, mode: 'NEW_VISIT' | 'NEW_ATTEMPT') => void;
  onSelectPersonForSchedule?: (person: Person, mode: 'NEW_VISIT' | 'NEW_ATTEMPT') => void;
  onOpenEditResult?: (person: Person) => void;
  onSelectPersonForEditResult?: (person: Person) => void;
  onOpenPassToCourse?: (person: Person) => void;
  onOpenCourseDetail?: (person: Person) => void;
  onOpenUpdateCourseProgress?: (person: Person) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  persons,
  onOpenNewRevisita,
  onOpenNewWithDate,
  onUpdatePerson,
  onOpenHistory,
  onSelectPersonForHistory,
  onOpenEdit,
  onSelectPersonForEdit,
  onOpenScheduleNext,
  onSelectPersonForSchedule,
  onOpenEditResult,
  onSelectPersonForEditResult,
  onOpenPassToCourse,
  onOpenCourseDetail,
  onOpenUpdateCourseProgress,
}) => {
  const handleAddNew = (date?: string) => {
    if (onOpenNewRevisita) onOpenNewRevisita(date);
    else if (onOpenNewWithDate) onOpenNewWithDate(date);
  };

  const handleEdit = (person: Person) => {
    if (onOpenEdit) onOpenEdit(person);
    else if (onSelectPersonForEdit) onSelectPersonForEdit(person);
  };

  const handleHistory = (person: Person) => {
    if (onOpenHistory) onOpenHistory(person);
    else if (onSelectPersonForHistory) onSelectPersonForHistory(person);
  };

  const handleScheduleNext = (person: Person, mode: 'NEW_VISIT' | 'NEW_ATTEMPT') => {
    if (onOpenScheduleNext) onOpenScheduleNext(person, mode);
    else if (onSelectPersonForSchedule) onSelectPersonForSchedule(person, mode);
  };

  const handleEditResult = (person: Person) => {
    if (onOpenEditResult) onOpenEditResult(person);
    else if (onSelectPersonForEditResult) onSelectPersonForEditResult(person);
  };
  const todayStr = getTodayString();
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());
  const [selectedDayISO, setSelectedDayISO] = useState<string>(todayStr);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleGoToToday = () => {
    setCurrentMonthDate(new Date());
    setSelectedDayISO(todayStr);
  };

  // Build calendar matrix
  const firstDay = new Date(year, month, 1);
  const startDayIndex = firstDay.getDay(); // 0 = Domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map revisitas and courses by scheduled date
  const revisitasByDate: Record<string, Person[]> = {};
  const coursesByDate: Record<string, Person[]> = {};

  for (const person of persons) {
    if (person.isBibleCourse && person.bibleCourse) {
      const sDate = person.bibleCourse.nextStudyDate;
      if (sDate) {
        if (!coursesByDate[sDate]) coursesByDate[sDate] = [];
        if (!coursesByDate[sDate].some(p => p.id === person.id)) {
          coursesByDate[sDate].push(person);
        }
      }
      if (isBibleCourseDueToday(person)) {
        if (!coursesByDate[todayStr]) coursesByDate[todayStr] = [];
        if (!coursesByDate[todayStr].some(p => p.id === person.id)) {
          coursesByDate[todayStr].push(person);
        }
      }
    } else {
      const sDate = person.currentVisit?.scheduledDate;
      if (sDate) {
        if (!revisitasByDate[sDate]) revisitasByDate[sDate] = [];
        if (!revisitasByDate[sDate].some(p => p.id === person.id)) {
          revisitasByDate[sDate].push(person);
        }
      }
      if (isRevisitaDueToday(person)) {
        if (!revisitasByDate[todayStr]) revisitasByDate[todayStr] = [];
        if (!revisitasByDate[todayStr].some(p => p.id === person.id)) {
          revisitasByDate[todayStr].push(person);
        }
      }
    }
  }

  const selectedRevisitas = revisitasByDate[selectedDayISO] || [];
  const selectedCourses = coursesByDate[selectedDayISO] || [];
  const totalSelectedEvents = selectedRevisitas.length + selectedCourses.length;

  const isSelectedDateAllowed = isAllowedDateString(selectedDayISO);
  const selectedDayFormatted = formatFullDateES(selectedDayISO);

  return (
    <div className="space-y-4 pb-20" id="vista-calendario">
      {/* Month Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-cal-prev-month"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide capitalize">
              {MONTH_NAMES_ES[month]} {year}
            </h2>
            <button
              type="button"
              id="btn-cal-next-month"
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            id="btn-cal-today"
            onClick={handleGoToToday}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
          >
            Hoy
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center mt-4 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((name) => {
            return (
              <div
                key={name}
                className="text-[11px] font-bold py-1 text-slate-700"
              >
                {name}
              </div>
            );
          })}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: startDayIndex }).map((_, idx) => (
            <div key={`spacer-${idx}`} className="h-12" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dDate = new Date(year, month, dayNum);
            const iso = formatDateToISO(dDate);
            const isSelected = iso === selectedDayISO;
            const isToday = iso === todayStr;
            
            const revCount = revisitasByDate[iso]?.length || 0;
            const courseCount = coursesByDate[iso]?.length || 0;
            const totalCount = revCount + courseCount;

            return (
              <button
                key={iso}
                type="button"
                id={`cal-grid-day-${iso}`}
                onClick={() => setSelectedDayISO(iso)}
                className={`h-12 relative flex flex-col items-center justify-start pt-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white font-extrabold shadow-sm ring-2 ring-slate-800/40'
                    : isToday
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 font-bold hover:bg-amber-100'
                    : 'bg-slate-50 hover:bg-teal-50 text-slate-800 font-semibold border border-slate-100'
                }`}
              >
                <span className="text-xs">{dayNum}</span>

                {/* Event Dots / Badges container */}
                {totalCount > 0 && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {revCount > 0 && (
                      <span 
                        className={`min-w-[12px] h-3 px-0.5 rounded-full text-[8px] font-extrabold flex items-center justify-center ${
                          isSelected ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-600 text-white'
                        }`}
                        title={`${revCount} revisitas`}
                      >
                        {revCount}
                      </span>
                    )}
                    {courseCount > 0 && (
                      <span 
                        className={`min-w-[12px] h-3 px-0.5 rounded-full text-[8px] font-extrabold flex items-center justify-center ${
                          isSelected ? 'bg-indigo-300 text-slate-950' : 'bg-indigo-700 text-white'
                        }`}
                        title={`${courseCount} cursos bíblicos`}
                      >
                        {courseCount}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend info */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            <span>Revisitas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-700 inline-block"></span>
            <span>Cursos Bíblicos</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Todos los días habilitados</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Día seleccionado
            </div>
            <h3 className="text-base font-extrabold text-slate-900 capitalize">
              {selectedDayFormatted}
            </h3>
            {selectedDayISO === todayStr && (
              <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 mt-1">
                Hoy
              </span>
            )}
          </div>

          {/* Button: Nueva Revisita para este día */}
          <button
            type="button"
            id="btn-add-revisita-on-date"
            onClick={() => handleAddNew(selectedDayISO)}
            className="py-2 px-3 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>＋ Agendar aquí</span>
          </button>
        </div>

        {/* Combined List for Selected Day */}
        <div className="mt-4 space-y-4">
          {totalSelectedEvents === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-700">
                No hay revisitas ni estudios bíblicos para este día
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Pulsa "＋ Agendar aquí" para registrar una nueva persona para este día.
              </p>
            </div>
          ) : (
            <>
              {/* Cursos Bíblicos Section for this day */}
              {selectedCourses.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-700" />
                    <span>CURSOS BÍBLICOS PARA ESTE DÍA ({selectedCourses.length})</span>
                  </div>

                  {selectedCourses.map((person) => {
                    const course = person.bibleCourse;
                    if (!course) return null;

                    return (
                      <div
                        key={person.id}
                        className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-extrabold text-indigo-950">
                              {person.name}
                            </div>
                            <div className="text-xs text-slate-600 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{person.address}</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-900">
                            📖 Lección {course.currentLesson} — Punto {course.currentPoint}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-indigo-200/60">
                          {onOpenCourseDetail && (
                            <button
                              type="button"
                              onClick={() => onOpenCourseDetail(person)}
                              className="flex-1 py-1.5 px-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center justify-center gap-1"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Ver Curso</span>
                            </button>
                          )}
                          {onOpenUpdateCourseProgress && (
                            <button
                              type="button"
                              onClick={() => onOpenUpdateCourseProgress(person)}
                              className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs rounded-lg flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Progreso</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Revisitas Section for this day */}
              {selectedRevisitas.length > 0 && (
                <div className="space-y-3">
                  {selectedCourses.length > 0 && (
                    <div className="text-xs font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1.5 pt-2 border-t border-slate-200">
                      <span>REVISITAS PROGRAMADAS ({selectedRevisitas.length})</span>
                    </div>
                  )}

                  {selectedRevisitas.map((person) => (
                    <RevisitaCard
                      key={person.id}
                      person={person}
                      onUpdatePerson={onUpdatePerson}
                      onOpenHistory={handleHistory}
                      onOpenEdit={handleEdit}
                      onOpenScheduleNext={handleScheduleNext}
                      onOpenEditResult={handleEditResult}
                      onOpenPassToCourse={onOpenPassToCourse}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
