import React, { useState } from 'react';
import { X, User, MapPin, MessageSquare, BookOpen, Calendar, AlertCircle, Phone, FileText } from 'lucide-react';
import { Person } from '../types';
import { DatePickerAllowedDays } from './DatePickerAllowedDays';
import { formatFullDateES, getDayName, getNextAllowedDate, isAllowedDateString } from '../utils/dateUtils';
import { generateUniqueId } from '../utils/storage';

interface NewRevisitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Person) => void;
  initialDate?: string;
}

export const NewRevisitaModal: React.FC<NewRevisitaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
}) => {
  const defaultDate = initialDate && isAllowedDateString(initialDate) ? initialDate : getNextAllowedDate();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [topicSpoken, setTopicSpoken] = useState('');
  const [topicPending, setTopicPending] = useState('');
  const [scheduledDate, setScheduledDate] = useState(defaultDate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedTopicSpoken = topicSpoken.trim();
    const trimmedTopicPending = topicPending.trim();

    if (!trimmedName) {
      setErrorMessage('Por favor ingresa el nombre de la persona.');
      return;
    }

    if (!trimmedAddress) {
      setErrorMessage('Por favor ingresa la dirección de la persona.');
      return;
    }

    if (!trimmedTopicSpoken) {
      setErrorMessage('Por favor ingresa el tema del que hablaron.');
      return;
    }

    if (!trimmedTopicPending) {
      setErrorMessage('Por favor ingresa el tema que quedó pendiente para la próxima visita.');
      return;
    }

    if (!scheduledDate || !isAllowedDateString(scheduledDate)) {
      setErrorMessage('Debes seleccionar un día permitido para la revisita (Martes, Jueves, Sábado o Domingo).');
      return;
    }

    const nowIso = new Date().toISOString();
    const dayName = getDayName(scheduledDate);

    const newPerson: Person = {
      id: generateUniqueId(),
      name: trimmedName,
      address: trimmedAddress,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
      currentVisit: {
        scheduledDate: scheduledDate,
        scheduledDateFormatted: formatFullDateES(scheduledDate),
        scheduledDayName: dayName,
        topicSpoken: trimmedTopicSpoken,
        topicPending: trimmedTopicPending,
        result: 'SIN_REGISTRAR',
      },
      history: [],
    };

    onSave(newPerson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        id="modal-nueva-revisita"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div>
            <div className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">
              Registro de persona
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>＋ NUEVA REVISITA</span>
            </h2>
          </div>
          <button
            type="button"
            id="btn-close-new-modal"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition-colors active:scale-95"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-1.5">
            <label htmlFor="input-person-name" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>NOMBRE DE LA PERSONA <span className="text-rose-500">*</span></span>
            </label>
            <input
              id="input-person-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-1.5">
            <label htmlFor="input-person-address" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>DIRECCIÓN <span className="text-rose-500">*</span></span>
            </label>
            <input
              id="input-person-address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej. Calle Principal #25, Edificio A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          {/* Teléfono opcional */}
          <div className="space-y-1.5">
            <label htmlFor="input-person-phone" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>TELÉFONO O WHATSAPP (Opcional)</span>
            </label>
            <input
              id="input-person-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. +1 809-555-0123"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Tema que hablamos */}
          <div className="space-y-1.5">
            <label htmlFor="input-topic-spoken" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>TEMA QUE HABLAMOS <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              id="input-topic-spoken"
              rows={2}
              required
              value={topicSpoken}
              onChange={(e) => setTopicSpoken(e.target.value)}
              placeholder="Ej. El Reino de Dios y sus bendiciones para la humanidad"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 resize-none"
            />
          </div>

          {/* Tema pendiente */}
          <div className="space-y-1.5">
            <label htmlFor="input-topic-pending" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>TEMA PENDIENTE <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              id="input-topic-pending"
              rows={2}
              required
              value={topicPending}
              onChange={(e) => setTopicPending(e.target.value)}
              placeholder="Ej. ¿Qué condiciones habrá en la Tierra cuando gobierne el Reino de Dios?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 resize-none"
            />
          </div>

          {/* Selector de fecha (Strict allowed days: Martes, Jueves, Sábado, Domingo) */}
          <div className="pt-2">
            <DatePickerAllowedDays
              value={scheduledDate}
              onChange={setScheduledDate}
              label="DÍA DE LA PRÓXIMA REVISITA"
              id="picker-new-revisita"
            />
          </div>

          {/* Notas adicionales opcionales */}
          <div className="space-y-1.5 pt-1">
            <label htmlFor="input-person-notes" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>REFERENCIA DEL HOGAR / NOTAS (Opcional)</span>
            </label>
            <input
              id="input-person-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Casa de rejas verdes, perro pequeño, tocar fuerte"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 pb-2">
            <button
              type="submit"
              id="btn-save-revisita"
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm tracking-wide rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>GUARDAR REVISITA</span>
            </button>
            <button
              type="button"
              id="btn-cancel-new-revisita"
              onClick={onClose}
              className="w-full mt-2 py-2.5 px-4 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-lg text-center"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
