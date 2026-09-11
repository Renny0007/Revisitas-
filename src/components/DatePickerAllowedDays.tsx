import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { 
  formatDateToISO, 
  formatFullDateES, 
  getDayName, 
  getTodayString, 
  getUpcomingAllowedDates, 
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
  label = 'Día de la próxima revisita o estudio',
  id = 'date-picker',
  required,
}) => {
  const [viewDate, setViewDate] = useState<Date>(() => {
    return value ? parseISODate(value) : new Date();
  });

  // Sincronizar la vista del calendario cuando cambia la fecha seleccionada
  useEffect(() => {
    if (value) {
      const parsed = parseISODate(value);
      if (!isNaN(parsed.getTime())) {
        setViewDate(parsed);
      }
    }
  }, [value]);

  const todayStr = getTodayString();
  const upcomingList = getUpcomingAllowedDates(7);

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
    isSelected: boolean;
    isToday: boolean;
    dayOfWeek: number;
  }> = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dDate = new Date(currentYear, currentMonth, d);
    const iso = formatDateToISO(dDate);
    const dayOfWeek = dDate.getDay();
    const isSelected = iso === value;
    const isToday = iso === todayStr;

    calendarDays.push({
      dayNumber: d,
      iso,
      isSelected,
      isToday,
      dayOfWeek,
    });
  }

  return (
    <div className="space-y-3" id={id}>
      <div className="flex items-center justify-between">
        <label htmlFor={`${id}-native-date`} className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      </div>

      {/* Selected Date Summary Banner with direct native date input */}
      <div className="p-3 rounded-xl border transition-all bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-200 text-emerald-950 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-lg shrink-0 mt-0.5 bg-emerald-700 text-white shadow-xs">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Fecha seleccionada
              </div>
              <div className="text-sm font-bold text-slate-900 capitalize break-words">
                {value ? formatFullDateES(value) : 'Ninguna fecha seleccionada'}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            <input
              type="date"
              id={`${id}-native-date`}
              value={value || ''}
              onChange={(e) => {
                if (e.target.value) {
                  onChange(e.target.value);
                }
              }}
              className="px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-slate-900 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              title="Seleccionar fecha directamente"
            />
          </div>
        </div>
      </div>

      {/* Quick selection chips */}
      <div>
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <span>Accesos rápidos (próximos días)</span>
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
                  <span className={`font-bold ${isSelected ? 'text-white' : 'text-emerald-800'}`}>
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
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((abbr) => (
            <div 
              key={abbr} 
              className="text-[10px] font-bold py-1 text-slate-600"
            >
              {abbr}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Spacer items for starting day */}
          {Array.from({ length: startDayOfWeek }).map((_, idx) => (
            <div key={`spacer-${idx}`} className="h-8" />
          ))}

          {calendarDays.map((cell) => {
            return (
              <button
                key={cell.iso}
                type="button"
                id={`calendar-day-btn-${cell.iso}`}
                onClick={() => onChange(cell.iso)}
                className={`h-8 flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all active:scale-95 relative ${
                  cell.isSelected
                    ? 'bg-emerald-700 text-white font-bold shadow-xs ring-2 ring-emerald-500/40'
                    : cell.isToday
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 font-bold hover:bg-amber-100'
                    : 'text-slate-800 bg-slate-50/80 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-100'
                }`}
              >
                <span>{cell.dayNumber}</span>
                {cell.isToday && !cell.isSelected && (
                  <span className="w-1 h-1 bg-amber-600 rounded-full -mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
