import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Users, 
  Calendar, 
  BookOpenCheck, 
  Search, 
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Person, FilterType, ActiveTab } from './types';
import { 
  loadPersonsFromStorage, 
  savePersonsToStorage, 
  calculateStatistics,
  getPersonStatus 
} from './utils/storage';
import { checkAndNotifyTodayVisits } from './utils/notifications';
import { 
  getTodayString, 
  formatFullDateES,
  isAllowedDateString 
} from './utils/dateUtils';

// Subcomponents
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { StatsSummary } from './components/StatsSummary';
import { RevisitaCard } from './components/RevisitaCard';
import { NewRevisitaModal } from './components/NewRevisitaModal';
import { EditRevisitaModal } from './components/EditRevisitaModal';
import { ScheduleNextModal } from './components/ScheduleNextModal';
import { EditResultModal } from './components/EditResultModal';
import { HistoryModal } from './components/HistoryModal';
import { CalendarView } from './components/CalendarView';
import { PersonsView } from './components/PersonsView';
import { BackupRestoreView } from './components/BackupRestoreView';
import { BackupModal } from './components/BackupModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { InstallAppModal } from './components/InstallAppModal';

// Bible Course components
import { BibleCoursesView } from './components/BibleCoursesView';
import { PassToCourseModal } from './components/PassToCourseModal';
import { UpdateCourseProgressModal } from './components/UpdateCourseProgressModal';
import { BibleCourseDetailModal } from './components/BibleCourseDetailModal';
import { FullJourneyHistoryModal } from './components/FullJourneyHistoryModal';

export default function App() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('INICIO');
  const [activeFilter, setActiveFilter] = useState<FilterType>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newModalInitialDate, setNewModalInitialDate] = useState<string | undefined>(undefined);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const [selectedPersonForEdit, setSelectedPersonForEdit] = useState<Person | null>(null);
  const [selectedPersonForHistory, setSelectedPersonForHistory] = useState<Person | null>(null);
  const [selectedPersonForSchedule, setSelectedPersonForSchedule] = useState<{
    person: Person;
    mode: 'NEW_VISIT' | 'NEW_ATTEMPT';
  } | null>(null);
  const [selectedPersonForEditResult, setSelectedPersonForEditResult] = useState<Person | null>(null);

  // Bible Courses Modals
  const [selectedPersonForPassToCourse, setSelectedPersonForPassToCourse] = useState<Person | null>(null);
  const [selectedPersonForCourseDetail, setSelectedPersonForCourseDetail] = useState<Person | null>(null);
  const [selectedPersonForUpdateCourseProgress, setSelectedPersonForUpdateCourseProgress] = useState<Person | null>(null);
  const [selectedPersonForFullJourney, setSelectedPersonForFullJourney] = useState<Person | null>(null);

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Initial Load from Persistent Storage
  useEffect(() => {
    const loaded = loadPersonsFromStorage();
    setPersons(loaded);
    
    // Check and trigger today's visits reminder if applicable
    setTimeout(() => {
      checkAndNotifyTodayVisits(loaded);
    }, 1000);
  }, []);

  // Save to persistent storage whenever persons state changes
  const updatePersonsStateAndStorage = (newPersons: Person[]) => {
    setPersons(newPersons);
    savePersonsToStorage(newPersons);
  };

  // Reload callback when restored from backup
  const handleDataReloaded = () => {
    const fresh = loadPersonsFromStorage();
    setPersons(fresh);
  };

  // Handlers for Add / Edit / Delete Persons
  const handleSaveNewPerson = (newPerson: Person) => {
    const updated = [newPerson, ...persons];
    updatePersonsStateAndStorage(updated);
    setIsNewModalOpen(false);
    showToast('¡Revisita registrada con éxito!');
  };

  const handleUpdatePerson = (updatedPerson: Person) => {
    const updated = persons.map((p) => (p.id === updatedPerson.id ? updatedPerson : p));
    updatePersonsStateAndStorage(updated);
    
    // Update active modal person references if open
    if (selectedPersonForCourseDetail?.id === updatedPerson.id) {
      setSelectedPersonForCourseDetail(updatedPerson);
    }
    if (selectedPersonForFullJourney?.id === updatedPerson.id) {
      setSelectedPersonForFullJourney(updatedPerson);
    }
    
    showToast('Registro actualizado');
  };

  const handleDeletePerson = (id: string) => {
    const updated = persons.filter((p) => p.id !== id);
    updatePersonsStateAndStorage(updated);
    setSelectedPersonForEdit(null);
    setSelectedPersonForCourseDetail(null);
    showToast('Registro eliminado');
  };

  // Delete a history record
  const handleDeleteHistoryItem = (personId: string, historyId: string) => {
    const person = persons.find((p) => p.id === personId);
    if (!person) return;

    const updatedHistory = person.history.filter((h) => h.id !== historyId);
    const updatedPerson: Person = {
      ...person,
      history: updatedHistory,
      updatedAt: new Date().toISOString(),
    };

    handleUpdatePerson(updatedPerson);
    setSelectedPersonForHistory(updatedPerson);
    showToast('Registro de historial eliminado');
  };

  // Delete a course history record
  const handleDeleteCourseHistoryItem = (personId: string, courseHistoryId: string) => {
    const person = persons.find((p) => p.id === personId);
    if (!person || !person.bibleCourse) return;

    const updatedHistory = person.bibleCourse.history.filter((h) => h.id !== courseHistoryId);
    const updatedPerson: Person = {
      ...person,
      bibleCourse: {
        ...person.bibleCourse,
        history: updatedHistory,
      },
      updatedAt: new Date().toISOString(),
    };

    handleUpdatePerson(updatedPerson);
    showToast('Registro de estudio bíblico eliminado');
  };

  // Handle Pass To Course Confirmation
  const handleConfirmPassToCourse = (updatedPerson: Person) => {
    handleUpdatePerson(updatedPerson);
    setSelectedPersonForPassToCourse(null);
    showToast(`¡${updatedPerson.name} ha sido pasado a Curso Bíblico!`);
  };

  // Handle Return From Course to Revisitas
  const handleReturnToRevisitas = (updatedPerson: Person) => {
    handleUpdatePerson(updatedPerson);
    setSelectedPersonForCourseDetail(null);
    showToast(`${updatedPerson.name} volvió a la lista de revisitas.`);
  };

  // Open New Modal with optional default date
  const handleOpenNewWithDate = (date?: string) => {
    setNewModalInitialDate(date);
    setIsNewModalOpen(true);
  };

  // Stats Calculation using storage helper
  const stats = useMemo(() => {
    return calculateStatistics(persons) || {
      total: 0,
      today: 0,
      upcoming: 0,
      overdue: 0,
      found: 0,
      notFound: 0,
      totalCourses: 0,
      activeCourses: 0,
      pausedCourses: 0,
      completedCourses: 0,
      noContinuaCourses: 0,
      upcomingStudies: 0,
    };
  }, [persons]);

  // Filtered persons for INICIO tab (only non-course or all based on view)
  const nonCoursePersons = useMemo(() => {
    return persons.filter(p => !p.isBibleCourse);
  }, [persons]);

  const { todayList, overdueList, upcomingList, otherList } = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    // First filter by search text
    const searchFiltered = nonCoursePersons.filter((p) => {
      if (!query) return true;
      const matchName = p.name.toLowerCase().includes(query);
      const matchAddress = p.address?.toLowerCase().includes(query);
      const matchTopic = p.currentVisit?.topicSpoken?.toLowerCase().includes(query) || 
                         p.currentVisit?.topicPending?.toLowerCase().includes(query);
      const matchNotes = p.notes?.toLowerCase().includes(query);
      return matchName || matchAddress || matchTopic || matchNotes;
    });

    const today: Person[] = [];
    const overdue: Person[] = [];
    const upcoming: Person[] = [];
    const other: Person[] = [];

    searchFiltered.forEach((p) => {
      const status = getPersonStatus(p);

      if (activeFilter === 'HOY') {
        if (status === 'HOY') today.push(p);
        return;
      }
      if (activeFilter === 'PROXIMAS') {
        if (status === 'PROXIMA') upcoming.push(p);
        return;
      }
      if (activeFilter === 'ATRASADAS') {
        if (status === 'ATRASADA') overdue.push(p);
        return;
      }
      if (activeFilter === 'VISITADAS') {
        if (status === 'ENCONTRADA' || status === 'NO_ENCONTRADA') other.push(p);
        return;
      }

      // Default TODAS: Sort into status buckets
      if (status === 'HOY') {
        today.push(p);
      } else if (status === 'ATRASADA') {
        overdue.push(p);
      } else if (status === 'PROXIMA') {
        upcoming.push(p);
      } else {
        other.push(p);
      }
    });

    return {
      todayList: today,
      overdueList: overdue,
      upcomingList: upcoming,
      otherList: other,
    };
  }, [nonCoursePersons, searchQuery, activeFilter]);

  const totalFilteredCount = todayList.length + overdueList.length + upcomingList.length + otherList.length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans text-slate-900 pb-16">
      {/* Top App Bar Header */}
      <Header 
        onOpenNewRevisita={() => handleOpenNewWithDate(undefined)} 
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
      />

      {/* Main Container - Mobile Centered Column */}
      <main className="w-full max-w-xl mx-auto px-4 py-4 flex-1 space-y-4">
        {/* Banner de instalación PWA (cuando se abre en navegador) */}
        <PwaInstallBanner onInstalled={() => showToast('¡Aplicación instalada exitosamente!')} />

        {/* TAB 1: INICIO (PANTALLA PRINCIPAL) */}
        {activeTab === 'INICIO' && (
          <div className="space-y-5 pb-20" id="pantalla-principal-inicio">
            {/* Quick Hero Banner / Action Button */}
            <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-800 to-teal-700 p-4 rounded-3xl text-white shadow-sm">
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                  Herramienta de seguimiento
                </div>
                <h2 className="text-lg font-black tracking-tight uppercase mt-0.5">
                  MIS REVISITAS
                </h2>
                <p className="text-xs text-teal-100 mt-0.5 font-medium">
                  {nonCoursePersons.length} {nonCoursePersons.length === 1 ? 'persona en revisitas' : 'personas en revisitas'}
                </p>
              </div>

              <button
                type="button"
                id="btn-inicio-nueva-revisita"
                onClick={() => handleOpenNewWithDate(undefined)}
                className="py-3 px-4 bg-white text-emerald-900 hover:bg-emerald-50 active:bg-emerald-100 font-extrabold text-xs tracking-wide rounded-2xl shadow-md shrink-0 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3] text-emerald-700" />
                <span>＋ NUEVA REVISITA</span>
              </button>
            </div>

            {/* Dashboard Stats Summary (HOY, PRÓXIMAS, ATRASADAS, VISITADAS) */}
            <StatsSummary
              stats={stats}
              statistics={stats}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
            />

            {/* CURSOS BÍBLICOS SUMMARY CARD ON INICIO */}
            <div
              id="inicio-banner-cursos-biblicos"
              onClick={() => setActiveTab('CURSOS')}
              className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 rounded-3xl border border-emerald-500/30 shadow-md flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-400/50 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
                  <BookOpenCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm tracking-tight uppercase text-white">
                      Cursos Bíblicos
                    </span>
                    <span className="bg-emerald-500/30 text-emerald-300 text-[11px] font-black px-2 py-0.5 rounded-full border border-emerald-400/20">
                      {stats?.activeCourses ?? 0} {(stats?.activeCourses ?? 0) === 1 ? 'activo' : 'activos'}
                    </span>
                  </div>
                  <p className="text-xs text-teal-200 mt-0.5">
                    Seguimiento de lecciones del folleto y libro «Disfrute de la vida»
                  </p>
                </div>
              </div>
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-buscar-revisitas"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, dirección, tema..."
                className="w-full pl-10 pr-10 py-3 bg-white rounded-2xl border border-slate-200 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('TODAS')}
                className={`px-3 py-1.5 rounded-xl font-extrabold transition-all shrink-0 cursor-pointer ${
                  activeFilter === 'TODAS'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Todas ({nonCoursePersons.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('HOY')}
                className={`px-3 py-1.5 rounded-xl font-extrabold transition-all shrink-0 cursor-pointer ${
                  activeFilter === 'HOY'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Hoy ({stats?.today ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('ATRASADAS')}
                className={`px-3 py-1.5 rounded-xl font-extrabold transition-all shrink-0 cursor-pointer ${
                  activeFilter === 'ATRASADAS'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Atrasadas ({stats?.overdue ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('PROXIMAS')}
                className={`px-3 py-1.5 rounded-xl font-extrabold transition-all shrink-0 cursor-pointer ${
                  activeFilter === 'PROXIMAS'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Próximas ({stats?.upcoming ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('VISITADAS')}
                className={`px-3 py-1.5 rounded-xl font-extrabold transition-all shrink-0 cursor-pointer ${
                  activeFilter === 'VISITADAS'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Registradas ({(stats?.found ?? 0) + (stats?.notFound ?? 0)})
              </button>
            </div>

            {/* List Content */}
            {totalFilteredCount === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-800">
                  {searchQuery ? 'No se encontraron resultados' : 'No hay revisitas en esta sección'}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {searchQuery 
                    ? 'Prueba con otro término de búsqueda o limpia el filtro.' 
                    : 'Agrega tu primera revisita tocando el botón de abajo.'}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenNewWithDate(undefined)}
                  className="py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>NUEVA REVISITA</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* SECTION 1: REVISITAS PARA HOY */}
                {todayList.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-700 uppercase tracking-wider px-1">
                      <Clock className="w-4 h-4" />
                      <span>Para Hoy ({todayList.length})</span>
                    </div>
                    <div className="space-y-3">
                      {todayList.map((person) => (
                        <RevisitaCard
                          key={person.id}
                          person={person}
                          onUpdatePerson={handleUpdatePerson}
                          onEdit={setSelectedPersonForEdit}
                          onHistory={setSelectedPersonForHistory}
                          onScheduleNext={(p, mode) => setSelectedPersonForSchedule({ person: p, mode })}
                          onEditResult={setSelectedPersonForEditResult}
                          onPassToCourse={setSelectedPersonForPassToCourse}
                          onCourseDetail={setSelectedPersonForCourseDetail}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 2: REVISITAS ATRASADAS */}
                {overdueList.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black text-rose-700 uppercase tracking-wider px-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>Atrasadas ({overdueList.length})</span>
                    </div>
                    <div className="space-y-3">
                      {overdueList.map((person) => (
                        <RevisitaCard
                          key={person.id}
                          person={person}
                          onUpdatePerson={handleUpdatePerson}
                          onEdit={setSelectedPersonForEdit}
                          onHistory={setSelectedPersonForHistory}
                          onScheduleNext={(p, mode) => setSelectedPersonForSchedule({ person: p, mode })}
                          onEditResult={setSelectedPersonForEditResult}
                          onPassToCourse={setSelectedPersonForPassToCourse}
                          onCourseDetail={setSelectedPersonForCourseDetail}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 3: PRÓXIMAS REVISITAS */}
                {upcomingList.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black text-teal-800 uppercase tracking-wider px-1">
                      <Calendar className="w-4 h-4" />
                      <span>Próximas programadas ({upcomingList.length})</span>
                    </div>
                    <div className="space-y-3">
                      {upcomingList.map((person) => (
                        <RevisitaCard
                          key={person.id}
                          person={person}
                          onUpdatePerson={handleUpdatePerson}
                          onEdit={setSelectedPersonForEdit}
                          onHistory={setSelectedPersonForHistory}
                          onScheduleNext={(p, mode) => setSelectedPersonForSchedule({ person: p, mode })}
                          onEditResult={setSelectedPersonForEditResult}
                          onPassToCourse={setSelectedPersonForPassToCourse}
                          onCourseDetail={setSelectedPersonForCourseDetail}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 4: OTRAS / COMPLETADAS */}
                {otherList.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-wider px-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {activeFilter === 'VISITADAS' ? `Registradas (${otherList.length})` : `Otras Registradas (${otherList.length})`}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {otherList.map((person) => (
                        <RevisitaCard
                          key={person.id}
                          person={person}
                          onUpdatePerson={handleUpdatePerson}
                          onEdit={setSelectedPersonForEdit}
                          onHistory={setSelectedPersonForHistory}
                          onScheduleNext={(p, mode) => setSelectedPersonForSchedule({ person: p, mode })}
                          onEditResult={setSelectedPersonForEditResult}
                          onPassToCourse={setSelectedPersonForPassToCourse}
                          onCourseDetail={setSelectedPersonForCourseDetail}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: 📅 CALENDARIO */}
        {activeTab === 'CALENDARIO' && (
          <CalendarView
            persons={persons}
            onUpdatePerson={handleUpdatePerson}
            onSelectPersonForEdit={setSelectedPersonForEdit}
            onOpenEdit={setSelectedPersonForEdit}
            onSelectPersonForHistory={setSelectedPersonForHistory}
            onOpenHistory={setSelectedPersonForHistory}
            onSelectPersonForSchedule={(p, mode) => setSelectedPersonForSchedule({ person: p, mode })}
            onOpenScheduleNext={(p, mode) => setSelectedPersonForSchedule({ person: p, mode })}
            onSelectPersonForEditResult={setSelectedPersonForEditResult}
            onOpenEditResult={setSelectedPersonForEditResult}
            onOpenNewWithDate={handleOpenNewWithDate}
            onOpenNewRevisita={handleOpenNewWithDate}
            onOpenPassToCourse={setSelectedPersonForPassToCourse}
            onOpenCourseDetail={setSelectedPersonForCourseDetail}
            onOpenUpdateCourseProgress={setSelectedPersonForUpdateCourseProgress}
          />
        )}

        {/* TAB 3: 👥 PERSONAS (DIRECTORIO COMPLETO) */}
        {activeTab === 'PERSONAS' && (
          <PersonsView
            persons={persons}
            onUpdatePerson={handleUpdatePerson}
            onOpenNew={() => handleOpenNewWithDate(undefined)}
            onOpenNewRevisita={() => handleOpenNewWithDate(undefined)}
            onOpenHistory={setSelectedPersonForHistory}
            onOpenEdit={setSelectedPersonForEdit}
            onOpenScheduleNext={(p, mode) => setSelectedPersonForSchedule({ person: p, mode })}
            onOpenEditResult={setSelectedPersonForEditResult}
            onOpenPassToCourse={setSelectedPersonForPassToCourse}
            onOpenCourseDetail={setSelectedPersonForCourseDetail}
          />
        )}

        {/* TAB 4: 📖 CURSOS BÍBLICOS */}
        {activeTab === 'CURSOS' && (
          <BibleCoursesView
            persons={persons}
            onOpenCourseDetail={setSelectedPersonForCourseDetail}
            onOpenUpdateProgress={setSelectedPersonForUpdateCourseProgress}
            onOpenNewRevisita={() => handleOpenNewWithDate(undefined)}
          />
        )}

        {/* TAB 5: MÁS (COPIA DE SEGURIDAD, RESTAURACIÓN, CONFIGURACIÓN) */}
        {activeTab === 'MAS' && (
          <BackupRestoreView
            persons={persons}
            onDataReloaded={handleDataReloaded}
          />
        )}
      </main>

      {/* MODAL: INSTALAR APLICACIÓN PWA */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstalled={() => showToast('¡Aplicación instalada exitosamente!')}
      />

      {/* MODAL: PASAR A CURSO BÍBLICO */}
      <PassToCourseModal
        isOpen={selectedPersonForPassToCourse !== null}
        onClose={() => setSelectedPersonForPassToCourse(null)}
        person={selectedPersonForPassToCourse}
        onConfirmPass={handleConfirmPassToCourse}
      />

      {/* MODAL: DETALLE DEL CURSO BÍBLICO */}
      <BibleCourseDetailModal
        isOpen={selectedPersonForCourseDetail !== null}
        onClose={() => setSelectedPersonForCourseDetail(null)}
        person={selectedPersonForCourseDetail}
        onUpdatePerson={handleUpdatePerson}
        onOpenUpdateProgress={(person) => setSelectedPersonForUpdateCourseProgress(person)}
        onOpenFullJourney={(person) => setSelectedPersonForFullJourney(person)}
        onReturnToRevisitas={handleReturnToRevisitas}
      />

      {/* MODAL: ACTUALIZAR PROGRESO DEL CURSO */}
      <UpdateCourseProgressModal
        isOpen={selectedPersonForUpdateCourseProgress !== null}
        onClose={() => setSelectedPersonForUpdateCourseProgress(null)}
        person={selectedPersonForUpdateCourseProgress}
        onSaveProgress={handleUpdatePerson}
      />

      {/* MODAL: HISTORIAL COMPLETO DE TRAYECTORIA */}
      <FullJourneyHistoryModal
        isOpen={selectedPersonForFullJourney !== null}
        onClose={() => setSelectedPersonForFullJourney(null)}
        person={selectedPersonForFullJourney}
        onDeleteCourseHistoryItem={handleDeleteCourseHistoryItem}
        onDeleteRevisitaHistoryItem={handleDeleteHistoryItem}
      />

      {/* MODAL: COPIA DE SEGURIDAD / RESTAURAR */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        persons={persons}
        onDataReloaded={handleDataReloaded}
      />

      {/* MODAL: NUEVA REVISITA */}
      <NewRevisitaModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleSaveNewPerson}
        initialDate={newModalInitialDate}
      />

      {/* MODAL: EDITAR PERSONA */}
      <EditRevisitaModal
        isOpen={selectedPersonForEdit !== null}
        onClose={() => setSelectedPersonForEdit(null)}
        person={selectedPersonForEdit}
        onSave={handleUpdatePerson}
        onDelete={handleDeletePerson}
      />

      {/* MODAL: PROGRAMAR NUEVA REVISITA / NUEVO INTENTO */}
      <ScheduleNextModal
        isOpen={selectedPersonForSchedule !== null}
        onClose={() => setSelectedPersonForSchedule(null)}
        person={selectedPersonForSchedule?.person || null}
        mode={selectedPersonForSchedule?.mode || 'NEW_VISIT'}
        onSchedule={handleUpdatePerson}
      />

      {/* MODAL: EDITAR RESULTADO */}
      <EditResultModal
        isOpen={selectedPersonForEditResult !== null}
        onClose={() => setSelectedPersonForEditResult(null)}
        person={selectedPersonForEditResult}
        onSaveResult={handleUpdatePerson}
      />

      {/* MODAL: HISTORIAL DE REVISITAS */}
      <HistoryModal
        isOpen={selectedPersonForHistory !== null}
        onClose={() => setSelectedPersonForHistory(null)}
        person={selectedPersonForHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
      />

      {/* Toast Notification message */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom Android-Style Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        todayCount={stats?.today ?? 0}
        activeCoursesCount={stats?.activeCourses ?? 0}
      />
    </div>
  );
}
