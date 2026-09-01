/**
 * Utilidades de fecha para MIS REVISITAS
 * Regla fundamental: Sólo se permiten MARTES (2), JUEVES (4), SÁBADO (6) y DOMINGO (0).
 */

import { AllowedDayOfWeek } from '../types';

export const ALLOWED_DAYS: AllowedDayOfWeek[] = [0, 1, 2, 3, 4, 5, 6]; // Todos los días permitidos (Domingo a Sábado)

export const DAY_NAMES_ES = [
  'Domingo',    // 0
  'Lunes',      // 1
  'Martes',     // 2
  'Miércoles',  // 3
  'Jueves',     // 4
  'Viernes',    // 5
  'Sábado',     // 6
];

export const MONTH_NAMES_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD en la zona horaria local
 */
export function getTodayString(): string {
  const now = new Date();
  return formatDateToISO(now);
}

/**
 * Convierte un objeto Date a formato YYYY-MM-DD
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parsea un string YYYY-MM-DD a un objeto Date local sin desajuste de zona horaria
 */
export function parseISODate(isoString: string): Date {
  const [yearStr, monthStr, dayStr] = isoString.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  return new Date(year, month, day, 12, 0, 0); // Mediodía para evitar cualquier salto
}

/**
 * Verifica si un día de la semana es válido (Permite todos los días de la semana: Domingo a Sábado)
 */
export function isAllowedDayOfWeek(dayIndex: number): boolean {
  return dayIndex >= 0 && dayIndex <= 6;
}

/**
 * Verifica si un string de fecha (YYYY-MM-DD) es válido
 */
export function isAllowedDateString(isoString: string): boolean {
  if (!isoString) return false;
  const date = parseISODate(isoString);
  return !isNaN(date.getTime());
}

/**
 * Devuelve el nombre del día en español (ej: "Martes", "Jueves", "Sábado", "Domingo")
 */
export function getDayName(dateOrISO: Date | string): string {
  const date = typeof dateOrISO === 'string' ? parseISODate(dateOrISO) : dateOrISO;
  return DAY_NAMES_ES[date.getDay()];
}

/**
 * Formatea una fecha completa en español incluyendo día de la semana:
 * Ejemplo: "Domingo 16 de agosto de 2026"
 */
export function formatFullDateES(dateOrISO: Date | string): string {
  if (!dateOrISO) return '';
  const date = typeof dateOrISO === 'string' ? parseISODate(dateOrISO) : dateOrISO;
  const dayName = DAY_NAMES_ES[date.getDay()];
  const dayNum = date.getDate();
  const monthName = MONTH_NAMES_ES[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName} ${dayNum} de ${monthName} de ${year}`;
}

/**
 * Formatea una fecha corta en español (sin día de la semana):
 * Ejemplo: "16 de agosto de 2026"
 */
export function formatShortDateES(dateOrISO: Date | string): string {
  if (!dateOrISO) return '';
  const date = typeof dateOrISO === 'string' ? parseISODate(dateOrISO) : dateOrISO;
  const dayNum = date.getDate();
  const monthName = MONTH_NAMES_ES[date.getMonth()];
  const year = date.getFullYear();
  return `${dayNum} de ${monthName} de ${year}`;
}

/**
 * Compara dos fechas en string YYYY-MM-DD
 * -1 si a < b, 0 si a === b, 1 si a > b
 */
export function compareDateStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Calcula si una fecha programada está atrasada respecto a hoy
 */
export function isDateOverdue(scheduledISO: string): boolean {
  const today = getTodayString();
  return scheduledISO < today;
}

/**
 * Calcula si una fecha programada es hoy
 */
export function isDateToday(scheduledISO: string): boolean {
  const today = getTodayString();
  return scheduledISO === today;
}

/**
 * Calcula si una fecha programada es futura (posterior a hoy)
 */
export function isDateFuture(scheduledISO: string): boolean {
  const today = getTodayString();
  return scheduledISO > today;
}

/**
 * Obtiene la fecha sugerida para una nueva revisita o estudio (por defecto hoy o fecha base)
 */
export function getNextAllowedDate(fromDate: Date = new Date()): string {
  return formatDateToISO(fromDate);
}

/**
 * Genera una lista de las próximas N fechas para selector rápido
 */
export function getUpcomingAllowedDates(count: number = 7, startDate: Date = new Date()): Array<{
  iso: string;
  formatted: string;
  dayName: string;
  isToday: boolean;
}> {
  const results: Array<{
    iso: string;
    formatted: string;
    dayName: string;
    isToday: boolean;
  }> = [];
  const current = new Date(startDate);
  const todayISO = getTodayString();

  while (results.length < count) {
    const iso = formatDateToISO(current);
    results.push({
      iso,
      formatted: formatFullDateES(current),
      dayName: DAY_NAMES_ES[current.getDay()],
      isToday: iso === todayISO,
    });
    current.setDate(current.getDate() + 1);
  }

  return results;
}

/**
 * Obtiene la siguiente fecha para un día específico (0 = Domingo ... 6 = Sábado)
 */
export function getNextSpecificAllowedDay(targetDay: AllowedDayOfWeek): string {
  const current = new Date();
  for (let i = 0; i < 7; i++) {
    if (current.getDay() === targetDay) {
      return formatDateToISO(current);
    }
    current.setDate(current.getDate() + 1);
  }
  return formatDateToISO(current);
}
