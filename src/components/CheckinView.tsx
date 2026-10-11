import React, { useState, useMemo } from 'react';
import { Appointment, CheckinRecord, Patient, Physiotherapist } from '../types';
import { PlanBadge } from './PlanBadge';
import { 
  CheckCircle, 
  Clock, 
  Search, 
  UserCheck, 
  MapPin, 
  User, 
  Play, 
  Check, 
  ArrowRight,
  Filter,
  Monitor,
  Printer,
  Sparkles
} from 'lucide-react';

interface CheckinViewProps {
  today: string;
  appointments: Appointment[];
  patients: Patient[];
  physiotherapists: Physiotherapist[];
  checkins: CheckinRecord[];
  onCheckin: (params: {
    appointmentId?: string;
    patientId: string;
    physiotherapistId: string;
    room: string;
    source: 'totem' | 'recepcao' | 'manual';
    notes?: string;
  }) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  onOpenNewAppointment: () => void;
  onOpenTotem: () => void;
}

export const CheckinView: React.FC<CheckinViewProps> = ({
  today,
  appointments,
  patients,
  physiotherapists,
  checkins,
  onCheckin,
  onUpdateAppointmentStatus,
  onOpenNewAppointment,
  onOpenTotem
}) => {
  const [selectedFisioFilter, setSelectedFisioFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickPatientId, setQuickPatientId] = useState('');
  const [quickFisioId, setQuickFisioId] = useState('');
  const [quickRoom, setQuickRoom] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<{
    patientName: string;
    fisioName: string;
    room: string;
    time: string;
    ticketId: string;
  } | null>(null);

  // Today's appointments
  const todayAppointments = useMemo(() => {
    return appointments
      .filter(a => a.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, today]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return todayAppointments.filter(apt => {
      const matchesFisio = selectedFisioFilter === 'all' || apt.physiotherapistId === selectedFisioFilter;
      const patient = patients.find(p => p.id === apt.patientId);
      const matchesSearch = !searchQuery.trim() || 
        (patient && (
          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.cpf.includes(searchQuery) ||
          patient.phone.includes(searchQuery)
        ));
      return matchesFisio && matchesSearch;
    });
  }, [todayAppointments, selectedFisioFilter, searchQuery, patients]);

  // Checkins of today
  const todayCheckins = useMemo(() => {
    return checkins
      .filter(c => c.timestamp.startsWith(today))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [checkins, today]);

  // Handle Quick Express Check-in
  const handleQuickCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPatientId || !quickFisioId) return;

    const fisio = physiotherapists.find(f => f.id === quickFisioId);
    const patient = patients.find(p => p.id === quickPatientId);
    const room = quickRoom || fisio?.room || 'Sala de Atendimento';

    onCheckin({
      patientId: quickPatientId,
      physiotherapistId: quickFisioId,
      room,
      source: 'recepcao',
      notes: 'Check-in expresso realizado na recepção'
    });

    if (patient && fisio) {
      setSelectedReceipt({
        patientName: patient.name,
        fisioName: fisio.name,
        room,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        ticketId: `ZANI-${Math.floor(1000 + Math.random() * 9000)}`
      });
    }

    setQuickPatientId('');
    setQuickFisioId('');
    setQuickRoom('');
  };

  // Check-in on scheduled appointment
  const handleAppointmentCheckin = (apt: Appointment) => {
    const fisio = physiotherapists.find(f => f.id === apt.physiotherapistId);
    const patient = patients.find(p => p.id === apt.patientId);

    onCheckin({
      appointmentId: apt.id,
      patientId: apt.patientId,
      physiotherapistId: apt.physiotherapistId,
      room: apt.room,
      source: 'recepcao'
    });

    if (patient && fisio) {
      setSelectedReceipt({
        patientName: patient.name,
        fisioName: fisio.name,
        room: apt.room,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        ticketId: `ZANI-${apt.id.slice(-4).toUpperCase()}`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Context */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Recepção Clínica</span>
            <span aria-hidden="true">·</span>
            <span>Gestão de Entrada</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-700">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Check-in de Pacientes
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Confirmação instantânea de presença com direcionamento para o fisioterapeuta determinado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTotem}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span>Abrir Totem de Entrada</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Agendados Hoje</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {todayAppointments.length}
            </span>
            <span className="text-xs text-slate-400">sessões</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Presentes / Check-in</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-teal-700 font-mono tabular-nums">
              {todayAppointments.filter(a => a.status === 'checkin_realizado' || a.status === 'em_atendimento' || a.status === 'concluido').length}
            </span>
            <span className="text-xs text-emerald-600 font-medium">confirmados</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Em Atendimento</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-sky-700 font-mono tabular-nums">
              {todayAppointments.filter(a => a.status === 'em_atendimento').length}
            </span>
            <span className="text-xs text-sky-600">em sala</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Aguardando Chegada</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
              {todayAppointments.filter(a => a.status === 'agendado').length}
            </span>
            <span className="text-xs text-amber-600">previstos</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Scheduled Consultations Queue + Quick Check-in Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Agenda de Consultas de Hoje com Check-in */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Fila de Consultas de Hoje
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pacientes agendados organizados por horário e profissional determinado
                </p>
              </div>

              {/* Physiotherapist Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedFisioFilter('all')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    selectedFisioFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                  }`}
                >
                  Todos
                </button>
                {physiotherapists.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFisioFilter(f.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      selectedFisioFilter === f.id
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                    }`}
                  >
                    <span>{f.name.split(' ')[0]} {f.name.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search filter input */}
            <div className="mt-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nome do paciente, CPF ou telefone..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
              />
            </div>

            {/* Appointment List */}
            <div className="mt-4 space-y-2.5">
              {filteredAppointments.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl">
                  <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">Nenhuma consulta encontrada para este filtro hoje.</p>
                  <p className="text-xs text-slate-400 mt-1">Você pode registrar um novo agendamento ou fazer um check-in expresso.</p>
                  <button
                    onClick={onOpenNewAppointment}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    + Agendar Nova Consulta
                  </button>
                </div>
              ) : (
                filteredAppointments.map(apt => {
                  const patient = patients.find(p => p.id === apt.patientId);
                  const fisio = physiotherapists.find(f => f.id === apt.physiotherapistId);

                  const isCheckedIn = apt.status === 'checkin_realizado';
                  const isInProgress = apt.status === 'em_atendimento';
                  const isCompleted = apt.status === 'concluido';
                  const isScheduled = apt.status === 'agendado';

                  return (
                    <div
                      key={apt.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCheckedIn 
                          ? 'bg-teal-50/40 border-teal-200 shadow-xs'
                          : isInProgress
                          ? 'bg-sky-50/40 border-sky-200 shadow-xs'
                          : isCompleted
                          ? 'bg-slate-50/60 border-slate-200 opacity-80'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Time & Patient Info */}
                        <div className="flex items-start gap-3">
                          <div className="text-center shrink-0 w-16 py-1 bg-slate-100 rounded-lg border border-slate-200">
                            <span className="text-xs font-bold text-slate-900 font-mono tabular-nums block">
                              {apt.startTime}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono tabular-nums block">
                              {apt.endTime}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {patient?.avatar ? (
                              <img
                                src={patient.avatar}
                                alt={patient.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-200 shrink-0">
                                {patient?.name ? patient.name.charAt(0) : 'P'}
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900">
                                  {patient?.name || 'Paciente'}
                                </span>
                                {patient?.plan && (
                                  <PlanBadge plan={patient.plan} partnerId={patient.partnerId} showDetails={true} size="sm" />
                                )}
                              </div>

                              {patient?.plan === 'Gympass' && apt.status === 'agendado' && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                                    ⚠️ Solicitar check-in no aplicativo Gympass / Wellhub
                                  </span>
                                </div>
                              )}
                              {patient?.plan === 'TotalPass' && apt.status === 'agendado' && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center gap-1 text-[10px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-300 font-semibold">
                                    ⚠️ Validar token diário / QR code no aplicativo TotalPass
                                  </span>
                                </div>
                              )}

                            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 font-medium text-teal-800">
                                <User className="w-3 h-3" />
                                {fisio?.name || 'Fisioterapeuta'}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <MapPin className="w-3 h-3" />
                                {apt.room}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-500 italic">
                                {apt.modality}
                              </span>
                            </div>

                            {patient?.chiefComplaint && (
                              <p className="text-[11px] text-slate-500 mt-1">
                                <span className="font-semibold text-slate-600">Queixa:</span> {patient.chiefComplaint}
                              </p>
                            )}

                            {apt.checkinTime && (
                              <div className="flex items-center gap-1 text-[11px] text-teal-700 mt-1 font-mono tabular-nums">
                                <Clock className="w-3 h-3" />
                                <span>Chegada registrada às {new Date(apt.checkinTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status & Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {isScheduled && (
                            <button
                              onClick={() => handleAppointmentCheckin(apt)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Fazer Check-in</span>
                            </button>
                          )}

                          {isCheckedIn && (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-100 text-teal-900 border border-teal-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
                                Na Recepção
                              </span>
                              <button
                                onClick={() => onUpdateAppointmentStatus(apt.id, 'em_atendimento')}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                                title="Chamar paciente para a sala"
                              >
                                <Play className="w-3 h-3" />
                                <span>Iniciar</span>
                              </button>
                            </div>
                          )}

                          {isInProgress && (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-100 text-sky-900 border border-sky-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                                Em Atendimento
                              </span>
                              <button
                                onClick={() => onUpdateAppointmentStatus(apt.id, 'concluido')}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                                title="Finalizar sessão"
                              >
                                <Check className="w-3 h-3" />
                                <span>Concluir</span>
                              </button>
                            </div>
                          )}

                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                              <Check className="w-3 h-3 text-slate-500" />
                              Concluído
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Check-in Expresso + Últimos Check-ins */}
        <div className="space-y-4">
          {/* Card: Check-in Expresso */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Check-in Expresso</h3>
                <p className="text-[11px] text-slate-500">Para encaixes ou pacientes sem horário prévio hoje</p>
              </div>
            </div>

            <form onSubmit={handleQuickCheckin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paciente
                </label>
                <select
                  value={quickPatientId}
                  onChange={e => {
                    setQuickPatientId(e.target.value);
                    const pat = patients.find(p => p.id === e.target.value);
                    if (pat?.designatedFisioId) {
                      setQuickFisioId(pat.designatedFisioId);
                    }
                  }}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                >
                  <option value="">
                    {patients.length === 0 ? 'Nenhum paciente cadastrado' : 'Selecione o paciente cadastrado...'}
                  </option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.cpf ? `(${p.cpf})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fisioterapeuta Determinado
                </label>
                <select
                  value={quickFisioId}
                  onChange={e => {
                    setQuickFisioId(e.target.value);
                    const fis = physiotherapists.find(f => f.id === e.target.value);
                    if (fis?.room) setQuickRoom(fis.room);
                  }}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                >
                  <option value="">
                    {physiotherapists.length === 0 ? 'Nenhum fisioterapeuta cadastrado' : 'Selecione o fisioterapeuta...'}
                  </option>
                  {physiotherapists.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sala de Atendimento
                </label>
                <input
                  type="text"
                  value={quickRoom}
                  onChange={e => setQuickRoom(e.target.value)}
                  placeholder="Ex: Sala 1 - Reformer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Registrar Entrada Agora</span>
              </button>
            </form>
          </div>

          {/* Card: Histórico de Check-ins de Hoje */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Chegadas de Hoje ({todayCheckins.length})
              </h3>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                Últimos registros
              </span>
            </div>

            {todayCheckins.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Nenhum check-in registrado hoje ainda.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {todayCheckins.map(chk => {
                  const pat = patients.find(p => p.id === chk.patientId);
                  const fis = physiotherapists.find(f => f.id === chk.physiotherapistId);
                  const timeFormatted = new Date(chk.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={chk.id}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {pat?.name || 'Paciente'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          Com {fis?.name.split(' ')[0]} {fis?.name.split(' ')[1]} · {chk.room}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-700 block tabular-nums">
                          {timeFormatted}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          via {chk.source === 'totem' ? 'Totem' : 'Recepção'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Check-in Receipt / Voucher Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Comprovante de Entrada #{selectedReceipt.ticketId}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Check-in Confirmado!
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                O fisioterapeuta já foi notificado da chegada.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Paciente:</span>
                <span className="font-semibold text-slate-900">{selectedReceipt.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fisioterapeuta:</span>
                <span className="font-semibold text-teal-800">{selectedReceipt.fisioName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Local / Sala:</span>
                <span className="font-semibold text-slate-900">{selectedReceipt.room}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500">Horário Chegada:</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">{selectedReceipt.time}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors"
              >
                OK / Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
