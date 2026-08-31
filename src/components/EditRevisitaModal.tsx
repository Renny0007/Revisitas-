import React, { useState, useEffect } from 'react';
import { X, User, MapPin, MessageSquare, BookOpen, AlertCircle, Phone, FileText, Trash2 } from 'lucide-react';
import { Person } from '../types';
import { DatePickerAllowedDays } from './DatePickerAllowedDays';
import { formatFullDateES, getDayName, isAllowedDateString } from '../utils/dateUtils';

interface EditRevisitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onSave: (updatedPerson: Person) => void;
  onDelete?: (personId: string) => void;
}

export const EditRevisitaModal: React.FC<EditRevisitaModalProps> = ({
  isOpen,
  onClose,
  person,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [topicSpoken, setTopicSpoken] = useState('');
  const [topicPending, setTopicPending] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (person) {
      setName(person.name || '');
      setAddress(person.address || '');
      setPhone(person.phone || '');
      setNotes(person.notes || '');
      setTopicSpoken(person.currentVisit?.topicSpoken || '');
      setTopicPending(person.currentVisit?.topicPending || '');
      setScheduledDate(person.currentVisit?.scheduledDate || '');
      setErrorMessage(null);
      setShowConfirmDelete(false);
    }
  }, [person, isOpen]);

  if (!isOpen || !person) return null;

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
      setErrorMessage('Por favor ingresa el tema hablado.');
      return;
    }

    if (!trimmedTopicPending) {
      setErrorMessage('Por favor ingresa el tema pendiente.');
      return;
    }

    if (!scheduledDate || !isAllowedDateString(scheduledDate)) {
      setErrorMessage('Debes seleccionar un día permitido (Martes, Jueves, Sábado o Domingo).');
      return;
    }

    const updatedPerson: Person = {
      ...person,
      name: trimmedName,
      address: trimmedAddress,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
      currentVisit: {
        ...person.currentVisit,
        scheduledDate: scheduledDate,
        scheduledDateFormatted: formatFullDateES(scheduledDate),
        scheduledDayName: getDayName(scheduledDate),
        topicSpoken: trimmedTopicSpoken,
        topicPending: trimmedTopicPending,
      },
    };

    onSave(updatedPerson);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && person) {
      onDelete(person.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        id="modal-editar-revisita"
      >
        {/* Header */}
        <div className="bg-slate-800 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div>
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Modificar datos
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>✏️ EDITAR REVISITA</span>
            </h2>
          </div>
          <button
            type="button"
            id="btn-close-edit-modal"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition-colors active:scale-95"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-1.5">
            <label htmlFor="edit-person-name" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>NOMBRE DE LA PERSONA <span className="text-rose-500">*</span></span>
            </label>
            <input
              id="edit-person-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-hidden focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-1.5">
            <label htmlFor="edit-person-address" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-600" />
              <span>DIRECCIÓN <span className="text-rose-500">*</span></span>
            </label>
            <input
              id="edit-person-address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-hidden focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10"
            />
          </div>

          {/* Teléfono opcional */}
          <div className="space-y-1.5">
            <label htmlFor="edit-person-phone" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>TELÉFONO O WHATSAPP (Opcional)</span>
            </label>
            <input
              id="edit-person-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-hidden focus:border-slate-800"
            />
          </div>

          {/* Tema que hablamos */}
          <div className="space-y-1.5">
            <label htmlFor="edit-topic-spoken" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
              <span>TEMA QUE HABLAMOS <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              id="edit-topic-spoken"
              rows={2}
              required
              value={topicSpoken}
              onChange={(e) => setTopicSpoken(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-hidden focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 resize-none"
            />
          </div>

          {/* Tema pendiente */}
          <div className="space-y-1.5">
            <label htmlFor="edit-topic-pending" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-600" />
              <span>TEMA PENDIENTE <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              id="edit-topic-pending"
              rows={2}
              required
              value={topicPending}
              onChange={(e) => setTopicPending(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-hidden focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 resize-none"
            />
          </div>

          {/* Selector de fecha */}
          <div className="pt-2">
            <DatePickerAllowedDays
              value={scheduledDate}
              onChange={setScheduledDate}
              label="FECHA PROGRAMADA DE LA REVISITA"
              id="picker-edit-revisita"
            />
          </div>

          {/* Referencias */}
          <div className="space-y-1.5 pt-1">
            <label htmlFor="edit-person-notes" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>REFERENCIA DEL HOGAR / NOTAS (Opcional)</span>
            </label>
            <input
              id="edit-person-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-hidden focus:border-slate-800"
            />
          </div>

          {/* Delete Danger Section */}
          {onDelete && (
            <div className="pt-3 border-t border-slate-100">
              {!showConfirmDelete ? (
                <button
                  type="button"
                  id="btn-show-delete-confirm"
                  onClick={() => setShowConfirmDelete(true)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar esta persona y su historial</span>
                </button>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-rose-900">¿Estás seguro de eliminar a {person.name}?</div>
                  <p className="text-rose-700">Se borrarán permanentemente sus datos y el historial de visitas.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      id="btn-confirm-delete-person"
                      onClick={handleDelete}
                      className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 active:scale-95"
                    >
                      Sí, eliminar definitivamente
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 pb-2">
            <button
              type="submit"
              id="btn-save-edit-revisita"
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black active:bg-slate-800 text-white font-bold text-sm tracking-wide rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>GUARDAR CAMBIOS</span>
            </button>
            <button
              type="button"
              id="btn-cancel-edit-revisita"
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
