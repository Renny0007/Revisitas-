/**
 * Motor de persistencia local y gestión de copias de seguridad para MIS REVISITAS
 */

import { BackupData, Person, RevisitaStatus, Statistics, VisitHistoryRecord } from '../types';
import { formatFullDateES, formatShortDateES, getDayName, getNextAllowedDate, getTodayString, isDateOverdue, isDateToday } from './dateUtils';

const STORAGE_KEY = 'mis_revisitas_personas_v1';
const LAST_BACKUP_KEY = 'mis_revisitas_last_backup';
const SAFETY_SNAPSHOT_KEY = 'mis_revisitas_safety_snapshot';
const SETTINGS_KEY = 'mis_revisitas_settings';

/**
 * Genera un ID único seguro
 */
export function generateUniqueId(): string {
  return 'rev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

/**
 * Determina el estado actual de una persona
 */
export function getPersonStatus(person: Person): RevisitaStatus {
  const { currentVisit } = person;
  if (!currentVisit) return 'PROXIMA';

  if (currentVisit.result === 'ENCONTRADA') {
    return 'ENCONTRADA';
  }
  if (currentVisit.result === 'NO_ENCONTRADA') {
    return 'NO_ENCONTRADA';
  }
  if (currentVisit.result === 'NO_PUDE_IR') {
    return 'NO_PUDE_IR';
  }

  // Result is SIN_REGISTRAR / PENDIENTE
  if (isDateToday(currentVisit.scheduledDate)) {
    return 'HOY';
  }
  if (isDateOverdue(currentVisit.scheduledDate)) {
    return 'ATRASADA';
  }
  return 'PROXIMA';
}

/**
 * Datos de ejemplo iniciales bien estructurados para primera carga
 */
export function getInitialSampleData(): Person[] {
  const today = getTodayString();
  const nextAllowed = getNextAllowedDate();

  return [
    {
      id: 'sample_1',
      name: 'Juan Pérez',
      address: 'Calle Principal #25, Col. Centro',
      phone: '+1 809-555-0123',
      notes: 'Casa verde con rejas blancas. Tocar timbre fuerte.',
      createdAt: '2026-08-10T10:00:00.000Z',
      updatedAt: '2026-08-16T10:00:00.000Z',
      currentVisit: {
        scheduledDate: today,
        scheduledDateFormatted: formatFullDateES(today),
        scheduledDayName: getDayName(today),
        topicSpoken: 'El Reino de Dios y sus bendiciones para la humanidad',
        topicPending: '¿Qué condiciones habrá en la Tierra cuando gobierne el Reino de Dios?',
        result: 'SIN_REGISTRAR',
      },
      history: [
        {
          id: 'hist_1_1',
          attemptNumber: 1,
          scheduledDate: '2026-08-11',
          scheduledDateFormatted: formatFullDateES('2026-08-11'),
          actualVisitDate: '2026-08-11',
          actualVisitDateFormatted: formatShortDateES('2026-08-11'),
          result: 'NO_ENCONTRADA',
          topicSpoken: 'Primer contacto - Dejó folleto',
          topicPending: 'Hablar sobre el propósito de la vida',
          notes: 'No estaba en casa, salió al trabajo temprano.',
          timestamp: '2026-08-11T16:00:00.000Z',
        },
        {
          id: 'hist_1_2',
          attemptNumber: 2,
          scheduledDate: '2026-08-13',
          scheduledDateFormatted: formatFullDateES('2026-08-13'),
          actualVisitDate: '2026-08-13',
          actualVisitDateFormatted: formatShortDateES('2026-08-13'),
          result: 'ENCONTRADA',
          topicSpoken: 'El propósito de la vida según las Escrituras',
          topicPending: 'El Reino de Dios',
          notes: 'Muy receptivo y amable.',
          timestamp: '2026-08-13T17:30:00.000Z',
        }
      ],
    },
    {
      id: 'sample_2',
      name: 'María Rodríguez',
      address: 'Av. Las Palmas #142, Apto 3B',
      phone: '+1 809-555-0456',
      notes: 'Tercer piso, subir por la escalera derecha.',
      createdAt: '2026-08-01T11:00:00.000Z',
      updatedAt: '2026-08-16T11:00:00.000Z',
      isBibleCourse: true,
      currentVisit: {
        scheduledDate: '2026-08-12',
        scheduledDateFormatted: formatFullDateES('2026-08-12'),
        scheduledDayName: getDayName('2026-08-12'),
        topicSpoken: 'Por qué permite Dios el sufrimiento',
        topicPending: 'Comenzar curso bíblico formal',
        result: 'ENCONTRADA',
      },
      history: [
        {
          id: 'hist_2_1',
          attemptNumber: 1,
          scheduledDate: '2026-08-08',
          scheduledDateFormatted: formatFullDateES('2026-08-08'),
          actualVisitDate: '2026-08-08',
          actualVisitDateFormatted: formatShortDateES('2026-08-08'),
          result: 'ENCONTRADA',
          topicSpoken: 'Introducción y lectura del Salmo 37:10, 11',
          topicPending: 'El sufrimiento humano',
          timestamp: '2026-08-08T15:00:00.000Z',
        },
        {
          id: 'hist_2_2',
          attemptNumber: 2,
          scheduledDate: '2026-08-12',
          scheduledDateFormatted: formatFullDateES('2026-08-12'),
          actualVisitDate: '2026-08-12',
          actualVisitDateFormatted: formatShortDateES('2026-08-12'),
          result: 'ENCONTRADA',
          topicSpoken: 'Por qué permite Dios el sufrimiento',
          topicPending: 'Aceptó iniciar el curso con el libro "Disfrute de la vida"',
          timestamp: '2026-08-12T16:30:00.000Z',
        }
      ],
      bibleCourse: {
        courseStartedAt: '2026-08-12',
        courseStartedAtFormatted: '12 de agosto de 2026',
        status: 'ACTIVO',
        currentLesson: 2,
        currentPoint: 4,
        totalLessons: 60,
        nextStudyDate: nextAllowed,
        nextStudyDateFormatted: formatFullDateES(nextAllowed),
        nextStudyDayName: getDayName(nextAllowed),
        notes: 'Tiene mucho interés en aprender sobre las profecías bíblicas.',
        history: [
          {
            id: 'crs_hist_2_1',
            lesson: 1,
            point: 3,
            date: '2026-08-12',
            dateFormatted: '12 de agosto de 2026',
            notes: 'Iniciamos lección 1. Le gustó mucho el punto 3 sobre la esperanza.',
            timestamp: '2026-08-12T17:00:00.000Z',
          },
          {
            id: 'crs_hist_2_2',
            lesson: 2,
            point: 4,
            date: '2026-08-15',
            dateFormatted: '15 de agosto de 2026',
            notes: 'Avanzamos a la lección 2 punto 4. Preparó bien su lección.',
            timestamp: '2026-08-15T17:30:00.000Z',
          }
        ]
      }
    },
    {
      id: 'sample_3',
      name: 'Carlos Ramírez',
      address: 'Calle Los Robles #89',
      notes: 'Frente al parque municipal.',
      createdAt: '2026-08-01T09:00:00.000Z',
      updatedAt: '2026-08-16T09:00:00.000Z',
      currentVisit: {
        scheduledDate: '2026-08-09', // Atrasada para demonstrar alerta
        scheduledDateFormatted: formatFullDateES('2026-08-09'),
        scheduledDayName: getDayName('2026-08-09'),
        topicSpoken: 'Consejos prácticos para las familias en la actualidad',
        topicPending: 'Cómo mejorar la comunicación en el hogar',
        result: 'SIN_REGISTRAR',
      },
      history: [],
    }
  ];
}

/**
 * Carga todas las personas guardadas en el almacenamiento persistente local
 */
export function loadPersonsFromStorage(): Person[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Si no existe, inicializar con los datos de ejemplo
      const initial = getInitialSampleData();
      savePersonsToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('Error al cargar personas de localStorage:', error);
    return [];
  }
}

/**
 * Guarda el listado completo de personas en localStorage
 */
export function savePersonsToStorage(persons: Person[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persons));
    return true;
  } catch (error) {
    console.error('Error al guardar personas en localStorage:', error);
    return false;
  }
}

/**
 * Obtiene la fecha y hora del último respaldo
 */
export function getLastBackupTimestamp(): string | null {
  return localStorage.getItem(LAST_BACKUP_KEY);
}

/**
 * Guarda la fecha y hora del respaldo más reciente
 */
export function recordLastBackupTimestamp(): void {
  const now = new Date();
  const formatted = `${formatShortDateES(now)} a las ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  localStorage.setItem(LAST_BACKUP_KEY, formatted);
}

/**
 * Calcula estadísticas completas
 */
export function calculateStatistics(persons: Person[]): Statistics {
  const fallbackStats: Statistics = {
    total: 0,
    today: 0,
    todayRevisitas: 0,
    todayStudies: 0,
    upcoming: 0,
    overdue: 0,
    found: 0,
    notFound: 0,
    couldNotGo: 0,
    totalCourses: 0,
    activeCourses: 0,
    pausedCourses: 0,
    completedCourses: 0,
    noContinuaCourses: 0,
    upcomingStudies: 0,
  };

  if (!persons || !Array.isArray(persons)) {
    return fallbackStats;
  }

  const todayStr = getTodayString();
  let todayRevisitasCount = 0;
  let todayStudiesCount = 0;
  let upcomingCount = 0;
  let overdueCount = 0;
  let foundCount = 0;
  let notFoundCount = 0;
  let couldNotGoCount = 0;

  // Cursos Bíblicos
  let totalCourses = 0;
  let activeCourses = 0;
  let pausedCourses = 0;
  let completedCourses = 0;
  let noContinuaCourses = 0;
  let upcomingStudies = 0;

  for (const person of persons) {
    if (!person) continue;
    // Si la persona es curso bíblico
    if (person.isBibleCourse && person.bibleCourse) {
      totalCourses++;
      const cStatus = person.bibleCourse.status;
      if (cStatus === 'ACTIVO') {
        activeCourses++;
        if (person.bibleCourse.nextStudyDate) {
          if (person.bibleCourse.nextStudyDate === todayStr) {
            todayStudiesCount++;
          } else if (person.bibleCourse.nextStudyDate > todayStr) {
            upcomingStudies++;
          }
        }
      } else if (cStatus === 'PAUSADO') {
        pausedCourses++;
      } else if (cStatus === 'TERMINADO') {
        completedCourses++;
      } else if (cStatus === 'NO_CONTINUA') {
        noContinuaCourses++;
      }
    } else {
      // Si está en Revisitas
      const status = getPersonStatus(person);
      switch (status) {
        case 'HOY':
          todayRevisitasCount++;
          break;
        case 'PROXIMA':
          upcomingCount++;
          break;
        case 'ATRASADA':
          overdueCount++;
          break;
        case 'ENCONTRADA':
          foundCount++;
          break;
        case 'NO_ENCONTRADA':
          notFoundCount++;
          break;
        case 'NO_PUDE_IR':
          couldNotGoCount++;
          break;
      }
    }
  }

  const combinedToday = todayRevisitasCount + todayStudiesCount;

  return {
    total: persons.length,
    today: combinedToday,
    todayRevisitas: todayRevisitasCount,
    todayStudies: todayStudiesCount,
    upcoming: upcomingCount,
    overdue: overdueCount,
    found: foundCount,
    notFound: notFoundCount,
    couldNotGo: couldNotGoCount,
    totalCourses,
    activeCourses,
    pausedCourses,
    completedCourses,
    noContinuaCourses,
    upcomingStudies,
  };
}

/**
 * Crea una copia de seguridad descargable completa en formato JSON
 */
export function createBackupPayload(persons: Person[]): BackupData {
  let totalHistoryRecords = 0;
  let totalCourses = 0;
  let totalCourseLessons = 0;

  for (const p of persons) {
    totalHistoryRecords += (p.history?.length || 0);
    if (p.isBibleCourse || p.bibleCourse) {
      totalCourses++;
      totalCourseLessons += (p.bibleCourse?.history?.length || 0);
    }
  }

  const now = new Date();
  return {
    version: 2,
    appName: 'MIS_REVISITAS_APP',
    createdAt: now.toISOString(),
    appData: {
      persons,
      lastBackupDate: now.toISOString(),
    },
    metadata: {
      totalPersons: persons.length,
      totalVisits: persons.filter(p => p.currentVisit).length,
      totalHistoryRecords,
      totalCourses,
      totalCourseLessons,
    },
  };
}

/**
 * Descarga el archivo de backup JSON en el dispositivo del usuario
 */
export function downloadBackupFile(persons: Person[]): string {
  const payload = createBackupPayload(persons);
  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const todayStr = getTodayString();
  const filename = `MIS_REVISITAS_BACKUP_${todayStr}.json`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  recordLastBackupTimestamp();
  return filename;
}

/**
 * Realiza un snapshot de seguridad temporal de los datos actuales antes de restaurar
 */
export function createSafetySnapshot(): void {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      localStorage.setItem(SAFETY_SNAPSHOT_KEY, current);
    }
  } catch (e) {
    console.warn('No se pudo crear el snapshot de seguridad temporal:', e);
  }
}

/**
 * Restaura el snapshot de seguridad si la restauración falla
 */
export function restoreSafetySnapshot(): boolean {
  try {
    const snapshot = localStorage.getItem(SAFETY_SNAPSHOT_KEY);
    if (snapshot) {
      localStorage.setItem(STORAGE_KEY, snapshot);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Fallo al recuperar snapshot de seguridad:', e);
    return false;
  }
}

/**
 * Valida e inspecciona un archivo/texto de backup antes de restaurar
 */
export function parseAndValidateBackup(jsonString: string): {
  valid: boolean;
  error?: string;
  data?: BackupData;
  summary?: {
    createdAtFormatted: string;
    totalPersons: number;
    totalVisits: number;
    totalHistoryRecords: number;
    totalCourses: number;
    totalCourseLessons: number;
  };
} {
  try {
    const parsed = JSON.parse(jsonString);

    // Validar estructura básica
    let personsList: Person[] = [];

    if (parsed.appData && Array.isArray(parsed.appData.persons)) {
      personsList = parsed.appData.persons;
    } else if (Array.isArray(parsed)) {
      personsList = parsed;
    } else if (Array.isArray(parsed.persons)) {
      personsList = parsed.persons;
    } else {
      return {
        valid: false,
        error: 'El archivo no contiene un formato de respaldo válido para Mis Revisitas.',
      };
    }

    // Validar que los objetos persona tengan la estructura mínima
    for (const p of personsList) {
      if (!p.id || !p.name) {
        return {
          valid: false,
          error: 'Uno o más registros dentro del respaldo no tienen la estructura requerida (falta ID o Nombre).',
        };
      }
    }

    let totalHistory = 0;
    let totalCourses = 0;
    let totalCourseLessons = 0;

    for (const p of personsList) {
      totalHistory += (p.history?.length || 0);
      if (p.isBibleCourse || p.bibleCourse) {
        totalCourses++;
        totalCourseLessons += (p.bibleCourse?.history?.length || 0);
      }
    }

    const createdAt = parsed.createdAt ? new Date(parsed.createdAt) : new Date();
    const createdAtFormatted = `${formatFullDateES(createdAt)} a las ${createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const backupData: BackupData = {
      version: parsed.version || 2,
      appName: 'MIS_REVISITAS_APP',
      createdAt: parsed.createdAt || new Date().toISOString(),
      appData: {
        persons: personsList,
      },
      metadata: {
        totalPersons: personsList.length,
        totalVisits: personsList.filter(p => p.currentVisit).length,
        totalHistoryRecords: totalHistory,
        totalCourses,
        totalCourseLessons,
      }
    };

    return {
      valid: true,
      data: backupData,
      summary: {
        createdAtFormatted,
        totalPersons: personsList.length,
        totalVisits: personsList.filter(p => p.currentVisit).length,
        totalHistoryRecords: totalHistory,
        totalCourses,
        totalCourseLessons,
      }
    };
  } catch (e: any) {
    return {
      valid: false,
      error: `Error al leer el archivo JSON: ${e.message || 'Formato no reconocido'}`,
    };
  }
}

/**
 * Ejecuta la restauración final aplicando identificadores únicos y evitando duplicados
 */
export function executeRestore(backupData: BackupData): { success: boolean; count: number; error?: string } {
  try {
    // 1. Crear snapshot de rescate por seguridad
    createSafetySnapshot();

    const incomingPersons = backupData.appData.persons;
    
    // 2. Asegurar integridad de identificadores e historiales
    const normalizedPersons: Person[] = incomingPersons.map(p => ({
      ...p,
      id: p.id || generateUniqueId(),
      name: p.name || 'Sin nombre',
      address: p.address || '',
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: Array.isArray(p.history) ? p.history : [],
      isBibleCourse: Boolean(p.isBibleCourse),
      bibleCourse: p.bibleCourse ? {
        ...p.bibleCourse,
        status: p.bibleCourse.status || 'ACTIVO',
        currentLesson: Number(p.bibleCourse.currentLesson) || 1,
        currentPoint: Number(p.bibleCourse.currentPoint) || 1,
        totalLessons: Number(p.bibleCourse.totalLessons) || 60,
        history: Array.isArray(p.bibleCourse.history) ? p.bibleCourse.history : [],
      } : undefined,
      currentVisit: p.currentVisit || {
        scheduledDate: getNextAllowedDate(),
        scheduledDateFormatted: formatFullDateES(getNextAllowedDate()),
        scheduledDayName: getDayName(getNextAllowedDate()),
        topicSpoken: '',
        topicPending: '',
        result: 'SIN_REGISTRAR',
      }
    }));

    // 3. Guardar en almacenamiento
    const saved = savePersonsToStorage(normalizedPersons);
    if (!saved) {
      restoreSafetySnapshot();
      return { success: false, count: 0, error: 'No se pudo escribir en el almacenamiento del dispositivo.' };
    }

    recordLastBackupTimestamp();
    return { success: true, count: normalizedPersons.length };
  } catch (error: any) {
    restoreSafetySnapshot();
    return { success: false, count: 0, error: error.message || 'Fallo desconocido al restaurar.' };
  }
}
