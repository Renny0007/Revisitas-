/**
 * Gestión de Notificaciones locales y recordatorios para MIS REVISITAS
 */

import { Person } from '../types';
import { getPersonStatus, isBibleCourseDueToday } from './storage';
import { getTodayString } from './dateUtils';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error solicitando permisos de notificación:', error);
    return 'denied';
  }
}

export function sendLocalNotification(title: string, options?: NotificationOptions): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const notification = new Notification(title, {
      icon: '/icon.png',
      badge: '/icon.png',
      tag: 'mis-revisitas-' + Date.now(),
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (error) {
    console.error('Error enviando notificación:', error);
    return false;
  }
}

/**
 * Notifica al usuario de las revisitas y cursos bíblicos programados para hoy
 */
export function checkAndNotifyTodayVisits(persons: Person[]): number {
  const todayStr = getTodayString();
  const todayVisits = persons.filter(p => !p.isBibleCourse && getPersonStatus(p) === 'HOY');
  const todayStudies = persons.filter(p => isBibleCourseDueToday(p));
  
  const totalCount = todayVisits.length + todayStudies.length;
  if (totalCount === 0) return 0;
  if (getNotificationPermission() !== 'granted') return totalCount;

  if (todayVisits.length > 0 && todayStudies.length > 0) {
    sendLocalNotification(`🔔 Tienes ${todayVisits.length} revisitas y ${todayStudies.length} ${todayStudies.length === 1 ? 'estudio bíblico' : 'estudios bíblicos'} hoy`, {
      body: `Revisitas: ${todayVisits.map(p => p.name).join(', ')} • Estudios: ${todayStudies.map(p => p.name).join(', ')}`,
    });
  } else if (todayStudies.length > 0) {
    if (todayStudies.length === 1) {
      const p = todayStudies[0];
      sendLocalNotification('📖 Tienes un curso bíblico hoy', {
        body: `${p.name} — Lección ${p.bibleCourse?.currentLesson || 1} • 📍 ${p.address || 'Sin dirección'}`,
      });
    } else {
      const names = todayStudies.slice(0, 3).map(p => p.name).join(', ');
      sendLocalNotification(`📖 Tienes ${todayStudies.length} cursos bíblicos hoy`, {
        body: `${names}${todayStudies.length > 3 ? ' y más...' : ''}`,
      });
    }
  } else {
    if (todayVisits.length === 1) {
      const p = todayVisits[0];
      sendLocalNotification('🔔 Tienes una revisita hoy', {
        body: `${p.name} — 📍 ${p.address || 'Sin dirección'}`,
      });
    } else {
      const names = todayVisits.slice(0, 3).map(p => p.name).join(', ');
      sendLocalNotification(`🔔 Tienes ${todayVisits.length} revisitas hoy`, {
        body: `${names}${todayVisits.length > 3 ? ' y más...' : ''}`,
      });
    }
  }

  return totalCount;
}
