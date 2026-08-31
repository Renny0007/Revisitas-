/**
 * Gestión de Notificaciones locales y recordatorios para MIS REVISITAS
 */

import { Person } from '../types';
import { getPersonStatus } from './storage';

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
 * Notifica al usuario de las revisitas programadas para hoy
 */
export function checkAndNotifyTodayVisits(persons: Person[]): number {
  const todayVisits = persons.filter(p => getPersonStatus(p) === 'HOY');
  
  if (todayVisits.length === 0) return 0;
  if (getNotificationPermission() !== 'granted') return todayVisits.length;

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

  return todayVisits.length;
}
