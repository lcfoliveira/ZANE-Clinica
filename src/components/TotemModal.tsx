import React, { useState, useMemo } from 'react';
import zaniLogo from '../assets/images/zani_studio_logo_1790571397465.jpg';
import { Appointment, Patient, Physiotherapist } from '../types';
import { PlanBadge } from './PlanBadge';
import { 
  CheckCircle, 
  Search, 
  MapPin, 
  Clock, 
  User, 
  X, 
  Sparkles, 
  Smartphone, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface TotemModalProps {
  isOpen: boolean;
  onClose: () => void;
  today: string;
  appointments: Appointment[];
  patients: Patient[];
  physiotherapists: Physiotherapist[];
  onCheckin: (params: {
    appointmentId?: string;
    patientId: string;
    physiotherapistId: string;
    room: string;
    source: 'totem' | 'recepcao' | 'manual';
    notes?: string;
  }) => void;
}

export const TotemModal: React.FC<TotemModalProps> = ({
  isOpen,
  onClose,
  today,
  appointments,
  patients,
  physiotherapists,
  onCheckin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [checkinSuccess, setCheckinSuccess] = useState<{
    patientName: string;
    fisioName: string;
    room: string;
    time: string;
  } | null>(null);

  // Today's scheduled appointments that haven't checked in yet or were recently checked in
  const todayApts = useMemo(() => {
    return appointments
      .filter(a => a.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, today]);

  // Search filter
  const matchedPatients = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase().trim();
    return patients.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.cpf.includes(term) ||
      p.phone.includes(term)
    );
  }, [patients, searchTerm]);

  // Today's waiting appointments list
  const pendingAppointments = useMemo(() => {
    return todayApts.filter(a => a.status === 'agendado');
  }, [todayApts]);

  if (!isOpen) return null;

  const handleConfirmCheckin = (apt: Appointment) => {
    const patient = patients.find(p => p.id === apt.patientId);
    const fisio = physiotherapists.find(f => f.id === apt.physiotherapistId);

    onCheckin({
      appointmentId: apt.id,
      patientId: apt.patientId,
      physiotherapistId: apt.physiotherapistId,
      room: apt.room,
      source: 'totem',
      notes: 'Check-in confirmado pelo paciente no Totem de Entrada'
    });

    setCheckinSuccess({
      patientName: patient?.name || 'Paciente',
      fisioName: fisio?.name || 'Seu Fisioterapeuta',
      room: apt.room,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });

    setSearchTerm('');
  };

  const handlePatientSelfCheckin = (patient: Patient) => {
    // Check if patient has appointment today
    const existingApt = todayApts.find(a => a.patientId === patient.id && a.status === 'agendado');
    if (existingApt) {
      handleConfirmCheckin(existingApt);
      return;
    }

    // If no scheduled appointment, check in with designated physiotherapist
    const fisio = physiotherapists.find(f => f.id === patient.designatedFisioId) || physiotherapists[0];
    const room = fisio?.room || 'Sala de Pilates / Atendimento';

    onCheckin({
      patientId: patient.id,
      physiotherapistId: fisio.id,
      room,
      source: 'totem',
      notes: 'Check-in avulso/encaixe realizado no Totem'
    });

    setCheckinSuccess({
      patientName: patient.name,
      fisioName: fisio.name,
      room,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });

    setSearchTerm('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative overflow-hidden">
        {/* Top Close Button for Receptionist to Exit Kiosk */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          title="Sair do Modo Totem"
        >
          <X className="w-5 h-5" />
        </button>

        {checkinSuccess ? (
          /* Check-in Success Celebratory Screen */
          <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-200 flex flex-col items-center">
            <img
              src={zaniLogo}
              alt="Zane Pilates Studio"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-contain shadow-xs border border-amber-100/80 bg-white"
            />

            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner -mt-2">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
                Presença Confirmada
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-display">
                Olá, {checkinSuccess.patientName.split(' ')[0]}!
              </h2>
              <p className="text-sm text-slate-600 mt-1.5 max-w-md mx-auto">
                Seu check-in foi registrado com sucesso às <span className="font-mono font-bold text-slate-900 tabular-nums">{checkinSuccess.time}</span>.
              </p>
            </div>

            {/* Room & Therapist Card */}
            <div className="bg-teal-50 border border-teal-200/90 rounded-2xl p-5 max-w-md mx-auto text-left shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-teal-800">
                <User className="w-4 h-4 shrink-0" />
                <span className="text-xs text-teal-700 font-semibold uppercase tracking-wider">Fisioterapeuta:</span>
                <span className="text-sm font-bold text-teal-950">{checkinSuccess.fisioName}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700 pt-1 border-t border-teal-200/60">
                <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Local:</span>
                <span className="text-sm font-bold text-slate-900">{checkinSuccess.room}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Por favor, aguarde na recepção que o profissional irá chamá-lo em instantes.
            </p>

            <button
              onClick={() => setCheckinSuccess(null)}
              className="px-8 py-3 bg-teal-800 hover:bg-teal-900 text-white text-sm font-bold rounded-xl transition-colors shadow-md"
            >
              Novo Check-in
            </button>
          </div>
        ) : (
          /* Normal Totem Arrival Screen */
          <div className="space-y-6">
            <div className="text-center flex flex-col items-center">
              <img
                src={zaniLogo}
                alt="Zane Pilates Studio"
                className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full object-contain shadow-md mb-4 border-2 border-amber-100 bg-white p-1 hover:scale-102 transition-transform"
              />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Totem de Autoatendimento</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                Bem-vindo ao Zane Pilates Studio!
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Digite seu nome, telefone ou CPF para confirmar sua chegada.
              </p>
            </div>

            {/* Big Search Input for Patient */}
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Digite seu nome completo, CPF ou celular..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm sm:text-base text-slate-900 font-medium placeholder:text-slate-400 focus:outline-hidden focus:border-teal-700 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* If patient typed a search: Show Matched Results */}
            {searchTerm.trim().length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Pacientes Localizados ({matchedPatients.length})
                </span>

                {matchedPatients.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    Nenhum paciente cadastrado com esse nome ou documento.
                    Por favor, avise a recepcionista para auxílio.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {matchedPatients.map(patient => {
                      const fisio = physiotherapists.find(f => f.id === patient.designatedFisioId);
                      const aptToday = todayApts.find(a => a.patientId === patient.id);

                      return (
                        <div
                          key={patient.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-400 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            {patient.avatar ? (
                              <img
                                src={patient.avatar}
                                alt={patient.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-200 shrink-0">
                                {patient.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900 block">
                                  {patient.name}
                                </span>
                                <PlanBadge plan={patient.plan} partnerId={patient.partnerId} showDetails={false} size="sm" />
                              </div>
                              <span className="text-xs text-slate-500 block mt-0.5">
                                Fisioterapeuta Determinado: <span className="font-semibold text-teal-800">{fisio?.name}</span>
                              </span>
                              {aptToday && (
                                <span className="text-[11px] text-amber-700 font-mono font-medium block mt-0.5">
                                  Consulta agendada hoje às {aptToday.startTime} ({aptToday.modality})
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handlePatientSelfCheckin(patient)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-lg transition-colors shadow-xs shrink-0"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Confirmar Chegada</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quick 1-Tap List: Scheduled for Today Pending Check-in */}
            {!searchTerm.trim() && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Consultas Previstas para Hoje ({pendingAppointments.length})
                  </span>
                  <span className="text-xs text-slate-400">
                    Toque no seu nome para confirmar
                  </span>
                </div>

                {pendingAppointments.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    Não há consultas pendentes de check-in para hoje no momento.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {pendingAppointments.map(apt => {
                      const patient = patients.find(p => p.id === apt.patientId);
                      const fisio = physiotherapists.find(f => f.id === apt.physiotherapistId);

                      return (
                        <div
                          key={apt.id}
                          onClick={() => handleConfirmCheckin(apt)}
                          className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-700 hover:bg-teal-50/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-14 text-center py-1 bg-slate-100 rounded-lg border border-slate-200 group-hover:bg-white">
                              <span className="text-xs font-bold text-slate-900 font-mono tabular-nums block">
                                {apt.startTime}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
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
                                  <span className="text-sm font-bold text-slate-900 block group-hover:text-teal-900">
                                    {patient?.name || 'Paciente'}
                                  </span>
                                  {patient?.plan && (
                                    <PlanBadge plan={patient.plan} partnerId={patient.partnerId} showDetails={false} size="sm" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                  <span className="font-semibold text-teal-800">
                                    {fisio?.name}
                                  </span>
                                  <span>·</span>
                                  <span>{apt.room}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-bold text-teal-800 group-hover:translate-x-1 transition-transform">
                            <span>Check-in</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
