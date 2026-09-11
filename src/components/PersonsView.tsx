import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Users, ArrowUpDown, Filter, X, BookOpen } from 'lucide-react';
import { FilterType, Person } from '../types';
import { RevisitaCard } from './RevisitaCard';
import { getPersonStatus } from '../utils/storage';

interface PersonsViewProps {
  persons: Person[];
  onOpenNewRevisita?: () => void;
  onOpenNew?: () => void;
  onUpdatePerson?: (person: Person) => void;
  onOpenHistory: (person: Person) => void;
  onOpenEdit: (person: Person) => void;
  onOpenScheduleNext: (person: Person, mode: 'NEW_VISIT' | 'NEW_ATTEMPT') => void;
  onOpenEditResult: (person: Person) => void;
  onOpenPassToCourse?: (person: Person) => void;
  onOpenCourseDetail?: (person: Person) => void;
}

export const PersonsView: React.FC<PersonsViewProps> = ({
  persons,
  onOpenNewRevisita,
  onOpenNew,
  onUpdatePerson,
  onOpenHistory,
  onOpenEdit,
  onOpenScheduleNext,
  onOpenEditResult,
  onOpenPassToCourse,
  onOpenCourseDetail,
}) => {
  const handleAddNew = () => {
    if (onOpenNew) onOpenNew();
    else if (onOpenNewRevisita) onOpenNewRevisita();
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [filterType, setFilterType] = useState<FilterType | 'CURSOS'>('TODAS');

  const filteredPersons = useMemo(() => {
    return persons
      .filter((p) => {
        // Search filter (Name or Address or Notes)
        const term = searchTerm.toLowerCase().trim();
        if (term) {
          const matchName = p.name.toLowerCase().includes(term);
          const matchAddress = p.address.toLowerCase().includes(term);
          const matchTopic = (p.currentVisit?.topicSpoken || '').toLowerCase().includes(term) ||
                             (p.currentVisit?.topicPending || '').toLowerCase().includes(term);
          const matchCourse = p.bibleCourse ? `leccion ${p.bibleCourse.currentLesson}`.includes(term) : false;
          if (!matchName && !matchAddress && !matchTopic && !matchCourse) {
            return false;
          }
        }

        // Status filter
        if (filterType === 'CURSOS') {
          return Boolean(p.isBibleCourse || p.bibleCourse);
        }

        const status = getPersonStatus(p);
        if (filterType === 'HOY') return status === 'HOY';
        if (filterType === 'PROXIMAS') return status === 'PROXIMA';
        if (filterType === 'ATRASADAS') return status === 'ATRASADA';
        if (filterType === 'VISITADAS') return status === 'ENCONTRADA';
        if (filterType === 'NO_ENCONTRADAS') return status === 'NO_ENCONTRADA';
        if (filterType === 'DESCARTADAS') return status === 'DESCARTADA';

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
        } else {
          // Sort by scheduled date
          const dateA = a.isBibleCourse ? (a.bibleCourse?.nextStudyDate || '') : (a.currentVisit?.scheduledDate || '');
          const dateB = b.isBibleCourse ? (b.bibleCourse?.nextStudyDate || '') : (b.currentVisit?.scheduledDate || '');
          return dateA.localeCompare(dateB);
        }
      });
  }, [persons, searchTerm, filterType, sortBy]);

  const coursesCount = persons.filter(p => p.isBibleCourse || p.bibleCourse).length;

  return (
    <div className="space-y-4 pb-20" id="vista-directorio-personas">
      {/* Search and Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              DIRECTORIO DE PERSONAS
            </h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {filteredPersons.length} de {persons.length}
          </span>
        </div>

        {/* Real-time Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="input-search-person-directory"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔎 Buscar por nombre, dirección o tema..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600 focus:bg-white transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {(['TODAS', 'HOY', 'PROXIMAS', 'ATRASADAS', 'VISITADAS', 'DESCARTADAS', 'CURSOS'] as (FilterType | 'CURSOS')[]).map((f) => (
              <button
                key={f}
                type="button"
                id={`filter-pill-${f}`}
                onClick={() => setFilterType(f)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                  filterType === f
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'TODAS' && 'Todas'}
                {f === 'HOY' && '🔔 Hoy'}
                {f === 'PROXIMAS' && '📅 Próximas'}
                {f === 'ATRASADAS' && '⚠️ Atrasadas'}
                {f === 'VISITADAS' && '🟢 Visitadas'}
                {f === 'DESCARTADAS' && '⚪ Descartadas'}
                {f === 'CURSOS' && `📖 Cursos (${coursesCount})`}
              </button>
            ))}
          </div>

          {/* Sort button */}
          <button
            type="button"
            id="btn-toggle-sort"
            onClick={() => setSortBy(sortBy === 'name' ? 'date' : 'name')}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg shrink-0 border border-slate-200 transition-colors ml-auto"
            title="Cambiar orden"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>{sortBy === 'name' ? 'A-Z' : 'Fecha'}</span>
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {filteredPersons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">
              No se encontraron personas
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {searchTerm 
                ? `No hay resultados para "${searchTerm}". Intenta con otro nombre o dirección.`
                : 'No hay personas en este filtro actualmente.'}
            </p>
            <button
              type="button"
              onClick={handleAddNew}
              className="mt-4 px-4 py-2 bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-teal-800"
            >
              ＋ Nueva Revisita
            </button>
          </div>
        ) : (
          filteredPersons.map((person) => {
            if (person.isBibleCourse && person.bibleCourse) {
              // Bible Course Card representation in Directory
              return (
                <div
                  key={person.id}
                  className="bg-white rounded-2xl border border-indigo-200 p-4 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{person.name}</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200">
                          📖 Curso Bíblico
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        📍 {person.address}
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-950 font-semibold">
                    <span>Lección {person.bibleCourse.currentLesson} — Punto {person.bibleCourse.currentPoint}</span>
                    <span className="text-[11px] font-bold text-indigo-800">
                      Próximo: {person.bibleCourse.nextStudyDateFormatted || person.bibleCourse.nextStudyDate || 'Por agendar'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    {onOpenCourseDetail && (
                      <button
                        type="button"
                        onClick={() => onOpenCourseDetail(person)}
                        className="flex-1 py-2 px-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-2xs text-center"
                      >
                        Ver Curso Completo
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenHistory(person)}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Historial
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <RevisitaCard
                key={person.id}
                person={person}
                onUpdatePerson={onUpdatePerson}
                onOpenHistory={onOpenHistory}
                onOpenEdit={onOpenEdit}
                onOpenScheduleNext={onOpenScheduleNext}
                onOpenEditResult={onOpenEditResult}
                onOpenPassToCourse={onOpenPassToCourse}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
