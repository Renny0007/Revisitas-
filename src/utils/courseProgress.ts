import { BibleCourseInfo, CourseHistoryRecord } from '../types';

export const MAX_PARAGRAPHS_PER_LESSON = 8;
export const PARAGRAPHS_LIST = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * Formats a list of paragraphs (e.g. [1, 2, 3] -> "párrafos 1–3", [4] -> "párrafo 4")
 */
export function formatParagraphsText(paragraphs: number[]): string {
  if (!paragraphs || paragraphs.length === 0) {
    return 'sin párrafos seleccionados';
  }

  const sorted = Array.from(new Set(paragraphs)).sort((a, b) => a - b);
  if (sorted.length === 1) {
    return `párrafo ${sorted[0]}`;
  }

  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  // Check if continuous
  const isContinuous = sorted.length === max - min + 1;
  if (isContinuous) {
    return `párrafos ${min}–${max}`;
  }

  return `párrafos ${sorted.join(', ')}`;
}

export interface NextStudyCalculation {
  nextLesson: number;
  nextParagraph: number;
  isLessonFinished: boolean;
  continueText: string;
  nextStudySummary: string;
}

/**
 * Calculates where to continue given a lesson and the last analyzed paragraph (1..8)
 */
export function calculateNextStudy(lesson: number, endParagraph: number): NextStudyCalculation {
  const safeLesson = Math.max(1, Number(lesson) || 1);
  const safeEnd = Math.max(1, Math.min(MAX_PARAGRAPHS_PER_LESSON, Number(endParagraph) || 1));

  if (safeEnd >= MAX_PARAGRAPHS_PER_LESSON) {
    const nextLesson = safeLesson + 1;
    const nextParagraph = 1;
    return {
      nextLesson,
      nextParagraph,
      isLessonFinished: true,
      continueText: `Lección ${nextLesson} — párrafo 1`,
      nextStudySummary: `Lección ${nextLesson}, párrafo 1`,
    };
  }

  const nextLesson = safeLesson;
  const nextParagraph = safeEnd + 1;
  return {
    nextLesson,
    nextParagraph,
    isLessonFinished: false,
    continueText: `párrafo ${nextParagraph}`,
    nextStudySummary: `Lección ${nextLesson}, párrafo ${nextParagraph}`,
  };
}

export interface CourseProgressDetails {
  hasStudiedBefore: boolean;
  currentLesson: number;
  displayLesson: number;
  lastStudiedLesson?: number;
  lastStudiedText?: string;
  lastStudiedEndParagraph?: number;
  nextLesson: number;
  nextParagraph: number;
  isLessonFinished: boolean;
  continueText: string;
  nextStudySummary: string;
}

/**
 * Extracts complete progress details for a course, inspecting history and current status
 */
export function getCourseProgressDetails(course?: BibleCourseInfo | null): CourseProgressDetails {
  if (!course) {
    return {
      hasStudiedBefore: false,
      currentLesson: 1,
      displayLesson: 1,
      nextLesson: 1,
      nextParagraph: 1,
      isLessonFinished: false,
      continueText: 'párrafo 1',
      nextStudySummary: 'Lección 1, párrafo 1',
    };
  }

  const history = course.history || [];
  // Find the most recent successful study session
  let lastGivenRecord: CourseHistoryRecord | undefined;
  for (let i = history.length - 1; i >= 0; i--) {
    const rec = history[i];
    if (rec.result === 'ESTUDIO_DADO' || !rec.result) {
      lastGivenRecord = rec;
      break;
    }
  }

  if (lastGivenRecord) {
    const studiedLesson = lastGivenRecord.lesson || course.currentLesson || 1;
    let endParagraph = 1;
    let paragraphsText = '';

    if (lastGivenRecord.paragraphsText) {
      paragraphsText = lastGivenRecord.paragraphsText;
      endParagraph = lastGivenRecord.paragraphEnd || lastGivenRecord.point || 1;
    } else if (lastGivenRecord.paragraphStart && lastGivenRecord.paragraphEnd) {
      endParagraph = lastGivenRecord.paragraphEnd;
      paragraphsText = lastGivenRecord.paragraphStart === lastGivenRecord.paragraphEnd
        ? `párrafo ${lastGivenRecord.paragraphStart}`
        : `párrafos ${lastGivenRecord.paragraphStart}–${lastGivenRecord.paragraphEnd}`;
    } else if (lastGivenRecord.point) {
      endParagraph = Math.min(MAX_PARAGRAPHS_PER_LESSON, lastGivenRecord.point);
      paragraphsText = `párrafo ${endParagraph}`;
    } else {
      endParagraph = 1;
      paragraphsText = 'párrafo 1';
    }

    const calc = calculateNextStudy(studiedLesson, endParagraph);

    return {
      hasStudiedBefore: true,
      currentLesson: calc.nextLesson,
      displayLesson: calc.isLessonFinished ? calc.nextLesson : studiedLesson,
      lastStudiedLesson: studiedLesson,
      lastStudiedText: paragraphsText,
      lastStudiedEndParagraph: endParagraph,
      nextLesson: calc.nextLesson,
      nextParagraph: calc.nextParagraph,
      isLessonFinished: calc.isLessonFinished,
      continueText: calc.continueText,
      nextStudySummary: calc.nextStudySummary,
    };
  }

  // Fallback if course has lastStudiedParagraphsText stored directly
  if (course.lastStudiedParagraphsText && course.lastStudiedLesson) {
    const endP = course.lastStudiedEndParagraph || course.currentPoint || 1;
    const calc = calculateNextStudy(course.lastStudiedLesson, endP);
    return {
      hasStudiedBefore: true,
      currentLesson: calc.nextLesson,
      displayLesson: calc.isLessonFinished ? calc.nextLesson : course.lastStudiedLesson,
      lastStudiedLesson: course.lastStudiedLesson,
      lastStudiedText: course.lastStudiedParagraphsText,
      lastStudiedEndParagraph: endP,
      nextLesson: calc.nextLesson,
      nextParagraph: calc.nextParagraph,
      isLessonFinished: calc.isLessonFinished,
      continueText: calc.continueText,
      nextStudySummary: calc.nextStudySummary,
    };
  }

  // Brand new student / no sessions yet
  const initialLesson = course.currentLesson || 1;
  const initialParagraph = Math.min(MAX_PARAGRAPHS_PER_LESSON, course.currentPoint || 1);

  return {
    hasStudiedBefore: false,
    currentLesson: initialLesson,
    displayLesson: initialLesson,
    lastStudiedLesson: undefined,
    lastStudiedText: undefined,
    lastStudiedEndParagraph: undefined,
    nextLesson: initialLesson,
    nextParagraph: initialParagraph,
    isLessonFinished: false,
    continueText: `párrafo ${initialParagraph}`,
    nextStudySummary: `Lección ${initialLesson}, párrafo ${initialParagraph}`,
  };
}
