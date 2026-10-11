import React, { useState, useMemo } from 'react';
import { Appointment, Patient, Physiotherapist } from '../types';
import { PlanBadge } from './PlanBadge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Edit3,
  X,
  Check
} from 'lucide-react';
import { getRelativeDate } from '../data/initialData';

interface ScheduleGridViewProps {
  today: string;
  appointments: Appointment[];
  patients: Patient[];
  physiotherapists: Physiotherapist[];
  onOpenNewAppointment: (preselectedFisioId?: string, preselectedDate?: string, preselectedTime?: string) => void;
  onSelectPatient: (patientId: string) => void;
  onUpdatePhysiotherapist?: (fisio: Physiotherapist) => void;
}

export const ScheduleGridView: React.FC<ScheduleGridViewProps> = ({
  today,
  appointments,
  patients,
  physiotherapists,
  onOpenNewAppointment,
  onSelectPatient,
  onUpdatePhysiotherapist
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [quickEditFisio, setQuickEditFisio] = useState<Physiotherapist | null>(null);
  const [quickName, setQuickName] = useState('');

  // Time slots from 07:00 to 19:00
  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // Navigate dates
  const handleDateShift = (days: number) => {
    const current = new Date(`${selectedDate}T00:00:00`);
    current.setDate(current.getDate() + days);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  // Appointments on selected date
  const dayAppointments = useMemo(() => {
    return appointments.filter(a => a.date === selectedDate);
  }, [appointments, selectedDate]);

  const dateObject = new Date(`${selectedDate}T00:00:00`);
  const formattedDayTitle = dateObject.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Visualização em Grade</span>
            <span aria-hidden="true">·</span>
            <span>Disponibilidade por Fisioterapeuta</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Grade de Horários & Consultas
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Visualize os atendimentos de cada fisioterapeuta determinado lado a lado e clique em qualquer horário vago para agendar.
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => handleDateShift(-1)}
            className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700"
            title="Dia anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 text-xs font-bold text-slate-900 capitalize font-mono tabular-nums text-center">
            {formattedDayTitle}
          </div>

          <button
            onClick={() => handleDateShift(1)}
            className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700"
            title="Próximo dia"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedDate !== today && (
            <button
              onClick={() => setSelectedDate(today)}
              className="ml-2 px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-white hover:bg-teal-50 border border-teal-200 rounded-lg shadow-2xs"
            >
              Hoje
            </button>
          )}
        </div>
      </div>

      {/* Grid Container */}
      {physiotherapists.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-500 max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Grade de Horários Vazia</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Cadastre os profissionais na aba <strong>Fisioterapeutas</strong> para que as colunas e a disponibilidade da grade sejam geradas automaticamente.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Table of columns per Physiotherapist */}
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${Math.max(760, 100 + physiotherapists.length * 200)}px` }}>
              {/* Column Headers: Time + each Physiotherapist */}
              <div 
                className="grid border-b border-slate-200 bg-slate-50/80 text-xs"
                style={{ gridTemplateColumns: `80px repeat(${physiotherapists.length}, minmax(180px, 1fr))` }}
              >
                <div className="p-3.5 border-r border-slate-200 font-bold text-slate-600 flex items-center justify-center">
                  Horário
                </div>

                {physiotherapists.map(fisio => {
                  const totalInDay = dayAppointments.filter(a => a.physiotherapistId === fisio.id).length;
                  return (
                    <div key={fisio.id} className="p-3.5 border-r last:border-r-0 border-slate-200">
                      <div className="flex items-center gap-2.5">
                        {fisio.avatar ? (
                          <img
                            src={fisio.avatar}
                            alt={fisio.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-200 shrink-0">
                            {fisio.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-900 truncate block">
                              {fisio.name}
                            </span>
                            {onUpdatePhysiotherapist && (
                              <button
                                onClick={() => {
                                  setQuickEditFisio(fisio);
                                  setQuickName(fisio.name);
                                }}
                                className="p-1 text-slate-400 hover:text-teal-800 hover:bg-teal-50 rounded transition-colors"
                                title={`Editar nome de ${fisio.name}`}
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {fisio.specialty}
                          </span>
                          <span className="text-[10px] text-teal-800 font-semibold block mt-0.5">
                            {totalInDay} {totalInDay === 1 ? 'consulta' : 'consultas'} hoje
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time Rows */}
              <div className="divide-y divide-slate-100">
                {timeSlots.map(time => {
                  return (
                    <div 
                      key={time} 
                      className="grid min-h-[72px]"
                      style={{ gridTemplateColumns: `80px repeat(${physiotherapists.length}, minmax(180px, 1fr))` }}
                    >
                    {/* Time Column */}
                    <div className="p-3 border-r border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center font-mono tabular-nums text-xs text-slate-600 font-bold">
                      <span>{time}</span>
                      <span className="text-[10px] font-normal text-slate-400">50 min</span>
                    </div>

                    {/* Columns for each therapist */}
                    {physiotherapists.map(fisio => {
                      // Check if there is an appointment at this time
                      const apt = dayAppointments.find(
                        a => a.physiotherapistId === fisio.id && a.startTime.startsWith(time.split(':')[0])
                      );

                      if (apt) {
                        const patient = patients.find(p => p.id === apt.patientId);
                        const isCheckedIn = apt.status === 'checkin_realizado';
                        const isInProgress = apt.status === 'em_atendimento';
                        const isCompleted = apt.status === 'concluido';

                        return (
                          <div
                            key={fisio.id}
                            className={`p-2 border-r last:border-r-0 border-slate-200 flex flex-col justify-between transition-all ${
                              isCheckedIn
                                ? 'bg-teal-50/80 border-teal-200'
                                : isInProgress
                                ? 'bg-sky-50/80 border-sky-200'
                                : isCompleted
                                ? 'bg-slate-50 border-slate-200 opacity-80'
                                : 'bg-emerald-50/30 hover:bg-emerald-50/60'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <button
                                  onClick={() => patient && onSelectPatient(patient.id)}
                                  className="text-xs font-bold text-slate-900 hover:text-teal-800 hover:underline text-left truncate block"
                                >
                                  {patient?.name || 'Paciente'}
                                </button>
                                <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                                  {apt.startTime}
                                </span>
                              </div>

                              {patient?.plan && (
                                <div className="mt-0.5">
                                  <PlanBadge plan={patient.plan} partnerId={patient.partnerId} showDetails={false} size="sm" />
                                </div>
                              )}

                              <p className="text-[11px] text-slate-600 truncate mt-0.5">
                                {apt.modality}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {apt.room}
                              </p>
                            </div>

                            <div className="mt-1 flex items-center justify-between text-[10px]">
                              {isCheckedIn && (
                                <span className="font-semibold text-teal-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                                  Na Recepção
                                </span>
                              )}
                              {isInProgress && (
                                <span className="font-semibold text-sky-800 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-sky-600 animate-spin" />
                                  Em Atendimento
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-slate-500 font-medium">
                                  Finalizado
                                </span>
                              )}
                              {apt.status === 'agendado' && (
                                <span className="text-amber-800 font-medium">
                                  Agendado
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // Empty Slot - Click to schedule
                      return (
                        <div
                          key={fisio.id}
                          className="p-2 border-r last:border-r-0 border-slate-200 group hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                          onClick={() => onOpenNewAppointment(fisio.id, selectedDate, time)}
                          title={`Clique para agendar com ${fisio.name} às ${time}`}
                        >
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-white px-2 py-1 rounded-md border border-teal-200 shadow-2xs transition-opacity">
                            <Plus className="w-3 h-3" />
                            <span>Vago às {time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )}
      {/* Quick Edit Physiotherapist Modal */}
      {quickEditFisio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-700" />
                <h3 className="text-base font-bold text-slate-900">Editar Nome do Fisioterapeuta</h3>
              </div>
              <button
                onClick={() => setQuickEditFisio(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome Completo do Profissional
                </label>
                <input
                  type="text"
                  autoFocus
                  value={quickName}
                  onChange={e => setQuickName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && quickName.trim() && onUpdatePhysiotherapist) {
                      onUpdatePhysiotherapist({
                        ...quickEditFisio,
                        name: quickName.trim()
                      });
                      setQuickEditFisio(null);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  placeholder="Nome do fisioterapeuta"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Especialidade:</span>
                  <span className="font-medium text-slate-800">{quickEditFisio.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sala:</span>
                  <span className="font-medium text-slate-800">{quickEditFisio.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CREFITO:</span>
                  <span className="font-mono text-slate-800">{quickEditFisio.crefito}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setQuickEditFisio(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (quickName.trim() && onUpdatePhysiotherapist) {
                    onUpdatePhysiotherapist({
                      ...quickEditFisio,
                      name: quickName.trim()
                    });
                    setQuickEditFisio(null);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Nome</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
