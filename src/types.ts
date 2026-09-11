/**
 * Mis Revisitas - Definiciones de Tipos de Datos
 */

export type AllowedDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado

export type VisitResult = 'ENCONTRADA' | 'NO_ENCONTRADA' | 'NO_PUDE_IR' | 'SIN_REGISTRAR';

export type RevisitaStatus = 
  | 'HOY'            // Scheduled for today & pending
  | 'PROXIMA'        // Scheduled for a future date & pending
  | 'ATRASADA'       // Scheduled date has passed & pending
  | 'ENCONTRADA'     // Visit completed and found person
  | 'NO_ENCONTRADA'  // Attempt completed but person was not home
  | 'NO_PUDE_IR';    // Could not go on the scheduled date

export type CourseStatus = 'ACTIVO' | 'PAUSADO' | 'TERMINADO' | 'NO_CONTINUA';

export interface VisitHistoryRecord {
  id: string;
  attemptNumber: number;               // Intento 1, Intento 2, etc.
  scheduledDate: string;               // YYYY-MM-DD
  scheduledDateFormatted: string;      // ej: "Jueves 20 de agosto de 2026"
  actualVisitDate: string;             // YYYY-MM-DD
  actualVisitDateFormatted: string;    // ej: "20 de agosto de 2026"
  result: VisitResult;                 // 'ENCONTRADA' | 'NO_ENCONTRADA' | 'SIN_REGISTRAR'
  topicSpoken: string;                 // Tema del que hablamos
  topicPending: string;                // Tema que quedó pendiente
  notes?: string;                      // Notas adicionales del intento
  timestamp: string;                   // ISO string
}

export interface CurrentVisitInfo {
  scheduledDate: string;               // YYYY-MM-DD (Cualquier día de lunes a domingo)
  scheduledDateFormatted: string;      // ej: "Jueves 20 de agosto de 2026"
  scheduledDayName: string;            // Día de la semana en español
  topicSpoken: string;                 // Tema del que hablamos
  topicPending: string;                // Tema que quedó pendiente
  result: VisitResult;                 // 'SIN_REGISTRAR' | 'ENCONTRADA' | 'NO_ENCONTRADA'
  actualVisitDate?: string;            // YYYY-MM-DD
  actualVisitDateFormatted?: string;   // ej: "20 de agosto de 2026"
  resultRegisteredAt?: string;         // ISO timestamp
  resultNotes?: string;
  recurringDayName?: string;           // Día programado habitual (ej: "Lunes", "Martes", etc.)
}

export interface CourseHistoryRecord {
  id: string;
  lesson: number;                      // Número de lección (ej: 2, 5, etc.)
  point: number;                       // Número de punto (ej: 4, 1, etc.)
  date: string;                        // YYYY-MM-DD
  dateFormatted: string;               // ej: "20 de agosto de 2026"
  notes?: string;                      // Notas u observaciones de la lección
  timestamp: string;                   // ISO string
}

export interface BibleCourseInfo {
  courseStartedAt: string;             // YYYY-MM-DD
  courseStartedAtFormatted: string;    // ej: "20 de agosto de 2026"
  status: CourseStatus;                // 'ACTIVO' | 'PAUSADO' | 'TERMINADO' | 'NO_CONTINUA'
  currentLesson: number;               // Lección actual (ej: 5)
  currentPoint: number;                // Punto actual (ej: 1)
  totalLessons: number;                // Total de lecciones estimadas (por defecto 60)
  nextStudyDate?: string;              // YYYY-MM-DD (Cualquier día de lunes a domingo)
  nextStudyDateFormatted?: string;     // ej: "Sábado 22 de agosto de 2026"
  nextStudyDayName?: string;           // Nombre del día en español
  recurringDayName?: string;           // Día recurrente semanal habitual (ej: "Lunes", "Martes", etc.)
  studyTime?: string;                  // ej: "10:00 AM" o "16:30"
  notes?: string;                      // Notas generales del estudiante
  history: CourseHistoryRecord[];      // Historial de lecciones estudiadas
}

export interface Person {
  id: string;
  name: string;                        // Nombre de la persona
  address: string;                     // Dirección
  phone?: string;                      // Teléfono opcional
  notes?: string;                      // Notas del hogar / referencias
  createdAt: string;                   // ISO
  updatedAt: string;                   // ISO
  currentVisit: CurrentVisitInfo;      // Información actual de la revisita
  history: VisitHistoryRecord[];       // Historial de todas las visitas e intentos
  isBibleCourse?: boolean;             // True si actualmente está en la sección de Cursos Bíblicos
  bibleCourse?: BibleCourseInfo;       // Información y progreso del curso bíblico
}

export type FilterType = 
  | 'TODAS'
  | 'HOY'
  | 'PROXIMAS'
  | 'ATRASADAS'
  | 'VISITADAS'
  | 'NO_ENCONTRADAS';

export type ActiveTab = 'INICIO' | 'CALENDARIO' | 'PERSONAS' | 'CURSOS' | 'MAS';

export interface BackupData {
  version: number;
  appName: string;
  createdAt: string;
  appData: {
    persons: Person[];
    lastBackupDate?: string;
    settings?: {
      notificationsEnabled?: boolean;
      notificationTime?: string;
    };
  };
  metadata: {
    totalPersons: number;
    totalVisits: number;
    totalHistoryRecords: number;
    totalCourses?: number;
    totalCourseLessons?: number;
  };
}

export interface Statistics {
  total: number;
  today: number;
  todayRevisitas: number;
  todayStudies: number;
  upcoming: number;
  overdue: number;
  found: number;
  notFound: number;
  couldNotGo: number;
  // Cursos Bíblicos stats
  totalCourses: number;
  activeCourses: number;
  pausedCourses: number;
  completedCourses: number;
  noContinuaCourses: number;
  upcomingStudies: number;
}
