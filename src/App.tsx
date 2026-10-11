import React, { useState, useEffect } from 'react';
import { 
  TabKey, 
  Physiotherapist, 
  Patient, 
  Appointment, 
  CheckinRecord, 
  AppointmentStatus 
} from './types';
import { StorageService } from './services/storage';
import { getRelativeDate } from './data/initialData';
import { Header } from './components/Header';
import { CheckinView } from './components/CheckinView';
import { SchedulingView } from './components/SchedulingView';
import { ScheduleGridView } from './components/ScheduleGridView';
import { PatientsView } from './components/PatientsView';
import { PhysiotherapistsView } from './components/PhysiotherapistsView';
import { AnalyticsView } from './components/AnalyticsView';
import { TotemModal } from './components/TotemModal';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { PatientDetailModal } from './components/PatientDetailModal';
import { ChatBot } from './components/ChatBot';
import zaniLogo from './assets/images/zani_studio_logo_1790571397465.jpg';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('checkin');
  const [today, setToday] = useState<string>(getRelativeDate(0));

  // Core Data State
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);

  // Modals state
  const [isTotemOpen, setIsTotemOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [appointmentModalParams, setAppointmentModalParams] = useState<{
    fisioId?: string;
    date?: string;
    time?: string;
    patientId?: string;
  }>({});
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load from Storage
  const loadData = () => {
    setPhysiotherapists(StorageService.getPhysiotherapists());
    setPatients(StorageService.getPatients());
    setAppointments(StorageService.getAppointments());
    setCheckins(StorageService.getCheckins());
    setToday(getRelativeDate(0));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Check-in handler
  const handleCheckin = (params: {
    appointmentId?: string;
    patientId: string;
    physiotherapistId: string;
    room: string;
    source: 'totem' | 'recepcao' | 'manual';
    notes?: string;
  }) => {
    StorageService.performCheckin(params);
    loadData();
    const patientName = patients.find(p => p.id === params.patientId)?.name || 'Paciente';
    showToast(`Check-in registrado com sucesso para ${patientName}!`, 'success');
  };

  // Update appointment status with detailed fields
  const handleUpdateAppointmentStatus = (
    id: string, 
    status: AppointmentStatus, 
    cancellationReason?: string,
    clinicalEvolution?: string,
    notes?: string
  ) => {
    const apt = appointments.find(a => a.id === id);
    if (!apt) return;

    const updated: Appointment = {
      ...apt,
      status,
      checkinTime: (status === 'checkin_realizado' && !apt.checkinTime) 
        ? new Date().toISOString() 
        : apt.checkinTime,
      cancellationReason: cancellationReason !== undefined ? cancellationReason : apt.cancellationReason,
      canceledAt: status === 'cancelado' ? (apt.canceledAt || new Date().toISOString()) : apt.canceledAt,
      clinicalEvolution: clinicalEvolution !== undefined ? clinicalEvolution : apt.clinicalEvolution,
      notes: notes !== undefined ? notes : apt.notes
    };

    StorageService.updateAppointment(updated);
    loadData();

    const labelMap: Record<AppointmentStatus, string> = {
      agendado: 'Agendado',
      checkin_realizado: 'Chegada / Na Recepção',
      em_atendimento: 'Em Atendimento',
      concluido: 'Concluído (Realizado)',
      cancelado: 'Cancelado (com justificativa)',
      falta: 'Falta registrada'
    };

    showToast(`Status atualizado: ${labelMap[status]}`, 'info');
  };

  // Full appointment update handler
  const handleUpdateAppointment = (updated: Appointment) => {
    StorageService.updateAppointment(updated);
    loadData();
    showToast('Ficha de atendimento atualizada com sucesso!', 'success');
  };

  // Save new appointment (single or repeating)
  const handleSaveAppointment = (
    aptData: Omit<Appointment, 'id' | 'status'>,
    repeatWeeks?: number
  ) => {
    if (!repeatWeeks || repeatWeeks <= 1) {
      StorageService.addAppointment(aptData);
    } else {
      // Create recurring weekly appointments
      const [year, month, day] = aptData.date.split('-').map(Number);
      const baseDate = new Date(year, month - 1, day);

      for (let i = 0; i < repeatWeeks; i++) {
        const nextDate = new Date(baseDate);
        nextDate.setDate(baseDate.getDate() + (i * 7));
        const y = nextDate.getFullYear();
        const m = String(nextDate.getMonth() + 1).padStart(2, '0');
        const d = String(nextDate.getDate()).padStart(2, '0');

        StorageService.addAppointment({
          ...aptData,
          date: `${y}-${m}-${d}`
        });
      }
    }

    loadData();
    const fisioName = physiotherapists.find(f => f.id === aptData.physiotherapistId)?.name || 'Fisioterapeuta';
    showToast(`Consulta agendada com sucesso com ${fisioName}!`, 'success');
  };

  // Delete appointment
  const handleDeleteAppointment = (id: string) => {
    StorageService.deleteAppointment(id);
    loadData();
    showToast('Agendamento excluído.', 'info');
  };

  // Patient handlers
  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'registeredAt'>) => {
    const created = StorageService.addPatient(patientData);
    loadData();
    showToast(`Paciente ${created.name} cadastrado com sucesso!`, 'success');
  };

  const handleUpdatePatient = (patient: Patient) => {
    StorageService.updatePatient(patient);
    loadData();
    if (selectedPatientForDetail?.id === patient.id) {
      setSelectedPatientForDetail(patient);
    }
    showToast(`Cadastro de ${patient.name} atualizado.`, 'info');
  };

  const handleDeletePatient = (id: string) => {
    StorageService.deletePatient(id);
    loadData();
    showToast('Paciente removido.', 'info');
  };

  const handleQuickAddPatient = (name: string, phone: string, fisioId: string): Patient => {
    const created = StorageService.addPatient({
      name,
      phone,
      cpf: '',
      plan: 'Pilates 2x/semana',
      designatedFisioId: fisioId,
      chiefComplaint: 'Avaliação inicial',
      active: true
    });
    loadData();
    return created;
  };

  // Physiotherapist handlers
  const handleAddPhysiotherapist = (fisioData: Omit<Physiotherapist, 'id'>) => {
    const created = StorageService.addPhysiotherapist(fisioData);
    loadData();
    showToast(`Fisioterapeuta ${created.name} cadastrado com sucesso!`, 'success');
  };

  const handleUpdatePhysiotherapist = (fisio: Physiotherapist) => {
    StorageService.updatePhysiotherapist(fisio);
    loadData();
    showToast(`Dados de ${fisio.name} atualizados.`, 'info');
  };

  const handleDeletePhysiotherapist = (id: string) => {
    StorageService.deletePhysiotherapist(id);
    loadData();
    showToast('Fisioterapeuta removido.', 'info');
  };

  // Reset to clean dataset for real tests
  const handleResetDemo = () => {
    StorageService.resetToDemo();
    loadData();
    showToast('Base de dados limpa com sucesso para novos testes reais.', 'info');
  };

  // Modal open helper
  const openNewAppointmentModal = (fisioId?: string, date?: string, time?: string, patientId?: string) => {
    setAppointmentModalParams({ fisioId, date, time, patientId });
    setIsNewAppointmentOpen(true);
  };

  const todayCheckinCount = checkins.filter(c => c.timestamp.startsWith(today)).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewAppointment={() => openNewAppointmentModal()}
        onOpenTotem={() => setIsTotemOpen(true)}
        todayCheckinCount={todayCheckinCount}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'checkin' && (
          <CheckinView
            today={today}
            appointments={appointments}
            patients={patients}
            physiotherapists={physiotherapists}
            checkins={checkins}
            onCheckin={handleCheckin}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onOpenNewAppointment={() => openNewAppointmentModal()}
            onOpenTotem={() => setIsTotemOpen(true)}
          />
        )}

        {activeTab === 'agenda' && (
          <SchedulingView
            appointments={appointments}
            patients={patients}
            physiotherapists={physiotherapists}
            onOpenNewAppointment={(fId, d, t, pId) => openNewAppointmentModal(fId, d, t, pId)}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onUpdateAppointment={handleUpdateAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            onSelectPatient={pId => {
              const p = patients.find(x => x.id === pId);
              if (p) setSelectedPatientForDetail(p);
            }}
          />
        )}

        {activeTab === 'horarios' && (
          <ScheduleGridView
            today={today}
            appointments={appointments}
            patients={patients}
            physiotherapists={physiotherapists}
            onOpenNewAppointment={(fId, d, t) => openNewAppointmentModal(fId, d, t)}
            onSelectPatient={pId => {
              const p = patients.find(x => x.id === pId);
              if (p) setSelectedPatientForDetail(p);
            }}
            onUpdatePhysiotherapist={handleUpdatePhysiotherapist}
          />
        )}

        {activeTab === 'pacientes' && (
          <PatientsView
            patients={patients}
            physiotherapists={physiotherapists}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            onDeletePatient={handleDeletePatient}
            onSelectPatient={pId => {
              const p = patients.find(x => x.id === pId);
              if (p) setSelectedPatientForDetail(p);
            }}
            onScheduleForPatient={(pId, fId) => openNewAppointmentModal(fId, undefined, undefined, pId)}
          />
        )}

        {activeTab === 'fisioterapeutas' && (
          <PhysiotherapistsView
            physiotherapists={physiotherapists}
            patients={patients}
            appointments={appointments}
            onAddPhysiotherapist={handleAddPhysiotherapist}
            onUpdatePhysiotherapist={handleUpdatePhysiotherapist}
            onDeletePhysiotherapist={handleDeletePhysiotherapist}
            onOpenScheduleGrid={() => setActiveTab('horarios')}
            onScheduleWithFisio={fId => openNewAppointmentModal(fId)}
          />
        )}

        {activeTab === 'indicadores' && (
          <AnalyticsView
            today={today}
            appointments={appointments}
            patients={patients}
            physiotherapists={physiotherapists}
            checkins={checkins}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white shadow-sm flex items-center justify-center relative border-2 border-white shrink-0">
              <div className="relative flex items-center justify-center">
                <img
                  src={zaniLogo}
                  alt="Zane Pilates Studio"
                  className="h-8 w-8 rounded-full object-cover border border-teal-300/40"
                />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 bg-amber-400 text-[8px] text-slate-900 font-black items-center justify-center rounded-full border border-white">
                  ?
                </span>
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm font-display block">Zane Pilates Studio</span>
              <span className="text-slate-500 text-xs">Sistema Integrado de Check-in & Agendamento com Fisioterapeuta Determinado</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Atendimento Clínico Personalizado</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-600 bg-slate-100 px-2 py-1 rounded-md">Sistema Ativo</span>
          </div>
        </div>
      </footer>

      {/* Totem / Kiosk Auto-Checkin Modal */}
      <TotemModal
        isOpen={isTotemOpen}
        onClose={() => setIsTotemOpen(false)}
        today={today}
        appointments={appointments}
        patients={patients}
        physiotherapists={physiotherapists}
        onCheckin={handleCheckin}
      />

      {/* New Appointment Modal */}
      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        patients={patients}
        physiotherapists={physiotherapists}
        appointments={appointments}
        preselectedFisioId={appointmentModalParams.fisioId}
        preselectedDate={appointmentModalParams.date}
        preselectedTime={appointmentModalParams.time}
        preselectedPatientId={appointmentModalParams.patientId}
        onSaveAppointment={handleSaveAppointment}
        onQuickAddPatient={handleQuickAddPatient}
      />

      {/* Patient Detail & Clinical Notes Modal */}
      <PatientDetailModal
        patient={selectedPatientForDetail}
        onClose={() => setSelectedPatientForDetail(null)}
        physiotherapists={physiotherapists}
        appointments={appointments}
        checkins={checkins}
        onScheduleNext={(pId, fId) => openNewAppointmentModal(fId, undefined, undefined, pId)}
        onUpdatePatient={handleUpdatePatient}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Integrated Health & Wellness ChatBot */}
      <ChatBot />
    </div>
  );
}
