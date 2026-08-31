import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, AlertCircle, Info } from 'lucide-react';
import { 
  formatDateToISO, 
  formatFullDateES, 
  getDayName, 
  getTodayString, 
  getUpcomingAllowedDates, 
  isAllowedDateString, 
  isAllowedDayOfWeek, 
  parseISODate,
  MONTH_NAMES_ES,
  DAY_NAMES_ES
} from '../utils/dateUtils';

interface DatePickerAllowedDaysProps {
  value: string; // YYYY-MM-DD
  onChange: (newIsoDate: string) => void;
  label?: string;
  id?: string;
  required?: boolean;
}

export const DatePickerAllowedDays: React.FC<DatePickerAllowedDaysProps> = ({
  value,
  onChange,
  label = 'Día de la próxima revisita',
  id = 'date-picker',
  required,
}) => {
  const [viewDate, setViewDate] = useState<Date>(() => {
    return value ? parseISODate(value) : new Date();
  });

  const todayStr = getTodayString();
  const upcomingList = getUpcomingAllowedDates(6);

  // Month navigation
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Generate calendar grid for current viewDate month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    iso: string;
    isAllowed: boolean;
    isSelected: boolean;
    isToday: boolean;
    dayOfWeek: number;
  }> = [];

  // Padding days before start of month
  for (let i = 0; i < startDayOfWeek; i++) {
    // Empty spacer
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dDate = new Date(currentYear, currentMonth, d);
    const iso = formatDateToISO(dDate);
    const dayOfWeek = dDate.getDay();
    const isAllowed = isAllowedDayOfWeek(dayOfWeek);
    const isSelected = iso === value;
    const isToday = iso === todayStr;

    calendarDays.push({
      dayNumber: d,
      iso,
      isAllowed,
      isSelected,
      isToday,
      dayOfWeek,
    });
  }

  const selectedDayName = value ? getDayName(value) : '';
  const isCurrentlyAllowed = isAllowedDateString(value);

  return (
    <div className="space-y-3" id={id}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {label} <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          Solo Mar • Jue • Sáb • Dom
        </span>
      </div>

      {/* Selected Date Summary Banner */}
      <div className={`p-3 rounded-xl border transition-all ${
        isCurrentlyAllowed 
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-200 text-emerald-950 shadow-xs' 
          : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}>
        <div className="flex items-start gap-2.5">
          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
            isCurrentlyAllowed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Fecha seleccionada
            </div>
            <div className="text-sm font-bold text-slate-900 capitalize break-words">
              {value ? formatFullDateES(value) : 'Ninguna fecha seleccionada'}
            </div>
            {!isCurrentlyAllowed && value && (
              <div className="flex items-center gap-1 text-xs text-rose-600 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Solo puedes seleccionar Martes, Jueves, Sábado o Domingo.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick selection chips for next allowed days */}
      <div>
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <span>Accesos rápidos (próximos días permitidos)</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {upcomingList.map((item) => {
            const isSelected = item.iso === value;
            return (
              <button
                key={item.iso}
                type="button"
                id={`btn-quick-date-${item.iso}`}
                onClick={() => onChange(item.iso)}
                className={`text-left p-2 rounded-lg border text-xs transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 font-semibold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
                    {item.dayName}
                  </span>
                  {item.isToday && (
                    <span className={`text-[9px] uppercase px-1 rounded font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Hoy
                    </span>
                  )}
                </div>
                <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {parseISODate(item.iso).getDate()} de {MONTH_NAMES_ES[parseISODate(item.iso).getMonth()].slice(0, 3)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Calendar Month Picker */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            id="btn-prev-month-picker"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            {MONTH_NAMES_ES[currentMonth]} {currentYear}
          </div>

          <button
            type="button"
            id="btn-next-month-picker"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((abbr, idx) => {
            const isAllowedDay = isAllowedDayOfWeek(idx);
            return (
              <div 
                key={abbr} 
                className={`text-[10px] font-bold py-1 ${
                  isAllowedDay ? 'text-emerald-700 font-extrabold' : 'text-slate-300'
                }`}
                title={isAllowedDay ? 'Día permitido para revisitas' : 'Día bloqueado'}
              >
                {abbr}
              </div>
            );
          })}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Spacer items for starting day */}
          {Array.from({ length: startDayOfWeek }).map((_, idx) => (
            <div key={`spacer-${idx}`} className="h-8" />
          ))}

          {calendarDays.map((cell) => {
            if (!cell.isAllowed) {
              return (
                <div
                  key={cell.iso}
                  className="h-8 flex items-center justify-center text-xs text-slate-300 bg-slate-50/50 rounded-md cursor-not-allowed select-none"
                  title="Solo permitido Martes, Jueves, Sábado y Domingo"
                >
                  {cell.dayNumber}
                </div>
              );
            }

            return (
              <button
                key={cell.iso}
                type="button"
                id={`calendar-day-btn-${cell.iso}`}
                onClick={() => onChange(cell.iso)}
                className={`h-8 flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all active:scale-95 relative ${
                  cell.isSelected
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : cell.isToday
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold hover:bg-emerald-100'
                    : 'text-slate-800 bg-slate-50 hover:bg-emerald-100 hover:text-emerald-900 border border-slate-100'
                }`}
              >
                <span>{cell.dayNumber}</span>
                {cell.isToday && !cell.isSelected && (
                  <span className="w-1 h-1 bg-emerald-600 rounded-full -mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-700 inline-block"></span>
            <span>Permitido (Mar, Jue, Sáb, Dom)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200 inline-block text-slate-300"></span>
            <span>Bloqueado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
