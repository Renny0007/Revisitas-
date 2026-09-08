import React from 'react';
import { FilterType, Statistics } from '../types';
import { Clock, Calendar, AlertTriangle, CheckCircle2, BookOpen } from 'lucide-react';

interface StatsSummaryProps {
  stats?: Partial<Statistics> | null;
  statistics?: Partial<Statistics> | null;
  activeFilter?: FilterType;
  onSelectFilter?: (filter: FilterType) => void;
}

export const StatsSummary: React.FC<StatsSummaryProps> = (props) => {
  const stats = props?.stats || props?.statistics || {};
  const activeFilter = props?.activeFilter || 'TODAS';
  const onSelectFilter = props?.onSelectFilter || (() => {});

  const currentStats = {
    total: Number(stats?.total ?? 0),
    today: Number(stats?.today ?? 0),
    todayRevisitas: Number(stats?.todayRevisitas ?? 0),
    todayStudies: Number(stats?.todayStudies ?? 0),
    upcoming: Number(stats?.upcoming ?? 0),
    overdue: Number(stats?.overdue ?? 0),
    found: Number(stats?.found ?? 0),
    notFound: Number(stats?.notFound ?? 0),
    couldNotGo: Number(stats?.couldNotGo ?? 0),
    totalCourses: Number(stats?.totalCourses ?? 0),
    activeCourses: Number(stats?.activeCourses ?? 0),
    pausedCourses: Number(stats?.pausedCourses ?? 0),
    completedCourses: Number(stats?.completedCourses ?? 0),
    noContinuaCourses: Number(stats?.noContinuaCourses ?? 0),
    upcomingStudies: Number(stats?.upcomingStudies ?? 0),
  };

  const getTodaySubtitle = () => {
    if (currentStats.todayStudies > 0 && currentStats.todayRevisitas > 0) {
      return `${currentStats.todayRevisitas} rev. • ${currentStats.todayStudies} est.`;
    }
    if (currentStats.todayStudies > 0) {
      return `${currentStats.todayStudies} ${currentStats.todayStudies === 1 ? 'estudio hoy' : 'estudios hoy'}`;
    }
    if (currentStats.todayRevisitas > 0) {
      return `${currentStats.todayRevisitas} ${currentStats.todayRevisitas === 1 ? 'revisita hoy' : 'revisitas hoy'}`;
    }
    return '0 para hoy';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="dashboard-stats-summary">
      {/* HOY */}
      <button
        type="button"
        id="stat-filter-hoy"
        onClick={() => onSelectFilter(activeFilter === 'HOY' ? 'TODAS' : 'HOY')}
        className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
          activeFilter === 'HOY'
            ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/40'
            : 'bg-white hover:bg-amber-50/50 border-slate-200 text-slate-800 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              activeFilter === 'HOY' ? 'text-amber-100' : 'text-amber-800'
            }`}>
              HOY
            </span>
            {currentStats.todayStudies > 0 && (
              <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold flex items-center gap-0.5 ${
                activeFilter === 'HOY' ? 'bg-amber-700/80 text-white' : 'bg-indigo-100 text-indigo-800'
              }`} title={`${currentStats.todayStudies} estudio(s) hoy`}>
                <BookOpen className="w-2.5 h-2.5" />
                <span>{currentStats.todayStudies}</span>
              </span>
            )}
          </div>
          <Clock className={`w-4 h-4 ${activeFilter === 'HOY' ? 'text-white' : 'text-amber-600'}`} />
        </div>
        <div className="text-2xl font-extrabold mt-1 tracking-tight">
          {currentStats.today}
        </div>
        <div className={`text-[10px] mt-0.5 font-semibold truncate ${
          activeFilter === 'HOY' ? 'text-amber-100' : 'text-slate-600'
        }`}>
          {getTodaySubtitle()}
        </div>
      </button>

      {/* PRÓXIMAS */}
      <button
        type="button"
        id="stat-filter-proximas"
        onClick={() => onSelectFilter(activeFilter === 'PROXIMAS' ? 'TODAS' : 'PROXIMAS')}
        className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
          activeFilter === 'PROXIMAS'
            ? 'bg-teal-700 text-white border-teal-800 shadow-sm ring-2 ring-teal-600/40'
            : 'bg-white hover:bg-teal-50/50 border-slate-200 text-slate-800 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            activeFilter === 'PROXIMAS' ? 'text-teal-100' : 'text-teal-800'
          }`}>
            PRÓXIMAS
          </span>
          <Calendar className={`w-4 h-4 ${activeFilter === 'PROXIMAS' ? 'text-white' : 'text-teal-600'}`} />
        </div>
        <div className="text-2xl font-extrabold mt-1 tracking-tight">
          {currentStats.upcoming}
        </div>
        <div className={`text-[10px] mt-0.5 font-medium ${
          activeFilter === 'PROXIMAS' ? 'text-teal-100' : 'text-slate-500'
        }`}>
          En agenda futura
        </div>
      </button>

      {/* ATRASADAS */}
      <button
        type="button"
        id="stat-filter-atrasadas"
        onClick={() => onSelectFilter(activeFilter === 'ATRASADAS' ? 'TODAS' : 'ATRASADAS')}
        className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
          activeFilter === 'ATRASADAS'
            ? 'bg-rose-700 text-white border-rose-800 shadow-sm ring-2 ring-rose-600/40'
            : 'bg-white hover:bg-rose-50/50 border-slate-200 text-slate-800 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            activeFilter === 'ATRASADAS' ? 'text-rose-100' : 'text-rose-800'
          }`}>
            ATRASADAS
          </span>
          <AlertTriangle className={`w-4 h-4 ${activeFilter === 'ATRASADAS' ? 'text-white' : 'text-rose-600'}`} />
        </div>
        <div className="text-2xl font-extrabold mt-1 tracking-tight">
          {currentStats.overdue}
        </div>
        <div className={`text-[10px] mt-0.5 font-medium ${
          activeFilter === 'ATRASADAS' ? 'text-rose-100' : 'text-slate-500'
        }`}>
          Requieren atención
        </div>
      </button>

      {/* VISITADAS */}
      <button
        type="button"
        id="stat-filter-visitadas"
        onClick={() => onSelectFilter(activeFilter === 'VISITADAS' ? 'TODAS' : 'VISITADAS')}
        className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
          activeFilter === 'VISITADAS'
            ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-600/40'
            : 'bg-white hover:bg-emerald-50/50 border-slate-200 text-slate-800 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            activeFilter === 'VISITADAS' ? 'text-emerald-100' : 'text-emerald-800'
          }`}>
            VISITADAS
          </span>
          <CheckCircle2 className={`w-4 h-4 ${activeFilter === 'VISITADAS' ? 'text-white' : 'text-emerald-600'}`} />
        </div>
        <div className="text-2xl font-extrabold mt-1 tracking-tight">
          {currentStats.found}
        </div>
        <div className={`text-[10px] mt-0.5 font-medium ${
          activeFilter === 'VISITADAS' ? 'text-emerald-100' : 'text-slate-500'
        }`}>
          Encontradas con éxito
        </div>
      </button>
    </div>
  );
};
