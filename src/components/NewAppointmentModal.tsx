import React, { useState, useEffect } from 'react';
import { Appointment, Patient, Physiotherapist } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  X, 
  AlertTriangle, 
  Plus, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { getRelativeDate } from '../data/initialData';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  physiotherapists: Physiotherapist[];
  appointments: Appointment[];
  preselectedFisioId?: string;
  preselectedDate?: string;
  preselectedTime?: string;
  preselectedPatientId?: string;
  onSaveAppointment: (appointment: Omit<Appointment, 'id' | 'status'>, repeatWeeks?: number) => void;
  onQuickAddPatient?: (name: string, phone: string, fisioId: string) => Patient;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  patients,
  physiotherapists,
  appointments,
  preselectedFisioId,
  preselectedDate,
  preselectedTime,
  preselectedPatientId,
  onSaveAppointment,
  onQuickAddPatient
}) => {
  const [patientId, setPatientId] = useState(preselectedPatientId || patients[0]?.id || '');
  const [physiotherapistId, setPhysiotherapistId] = useState(preselectedFisioId || physiotherapists[0]?.id || '');
  const [date, setDate] = useState(preselectedDate || getRelativeDate(0));
  const [startTime, setStartTime] = useState(preselectedTime || '09:00');
  const [modality, setModality] = useState('Pilates Clínico - Reformer');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [repeatWeeks, setRepeatWeeks] = useState(1);

  // Quick inline new patient form toggle
  const [isQuickPatientOpen, setIsQuickPatientOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');

  // Update room when physiotherapist changes
  useEffect(() => {
    const fisio = physiotherapists.find(f => f.id === physiotherapistId);
    if (fisio?.room) {
      setRoom(fisio.room);
    }
  }, [physiotherapistId, physiotherapists]);

  // Sync preselected values on open
  useEffect(() => {
    if (preselectedFisioId) setPhysiotherapistId(preselectedFisioId);
    if (preselectedDate) setDate(preselectedDate);
    if (preselectedTime) setStartTime(preselectedTime);
    if (preselectedPatientId) setPatientId(preselectedPatientId);
  }, [preselectedFisioId, preselectedDate, preselectedTime, preselectedPatientId, isOpen]);

  // When patient is selected, auto-select their designated physiotherapist if not already customized
  const handlePatientChange = (pId: string) => {
    setPatientId(pId);
    const pat = patients.find(p => p.id === pId);
    if (pat?.designatedFisioId) {
      setPhysiotherapistId(pat.designatedFisioId);
    }
  };

  // Compute end time (+50 min)
  const calculateEndTime = (start: string) => {
    const [h, m] = start.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(h, m + 50, 0, 0);
    const endH = String(dateObj.getHours()).padStart(2, '0');
    const endM = String(dateObj.getMinutes()).padStart(2, '0');
    return `${endH}:${endM}`;
  };

  // Conflict detection: does this physiotherapist already have an appointment on this date and time?
  const hasConflict = appointments.some(a => 
    a.date === date && 
    a.physiotherapistId === physiotherapistId && 
    a.startTime === startTime &&
    a.status !== 'cancelado'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !physiotherapistId) return;

    const endTime = calculateEndTime(startTime);

    onSaveAppointment({
      patientId,
      physiotherapistId,
      date,
      startTime,
      endTime,
      modality,
      room: room || 'Sala de Atendimento',
      notes: notes.trim() || undefined
    }, repeatWeeks > 1 ? repeatWeeks : undefined);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Agendar Nova Consulta
            </h3>
            <p className="text-xs text-slate-500">
              Consulta com o fisioterapeuta determinado e reserva de sala.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {physiotherapists.length === 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Cadastre pelo menos um fisioterapeuta na aba <strong>Fisioterapeutas</strong> antes de agendar consultas.</span>
            </div>
          )}

          {/* Patient Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Paciente / Aluno *
              </label>
              {onQuickAddPatient && (
                <button
                  type="button"
                  onClick={() => setIsQuickPatientOpen(!isQuickPatientOpen)}
                  className="text-teal-800 hover:underline font-semibold text-[11px]"
                >
                  {isQuickPatientOpen ? 'Selecionar da lista' : '+ Cadastrar novo'}
                </button>
              )}
            </div>

            {isQuickPatientOpen && onQuickAddPatient ? (
              <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl space-y-2 mb-2">
                <span className="font-bold text-teal-900 block text-[11px]">
                  Cadastro Rápido de Paciente:
                </span>
                <input
                  type="text"
                  placeholder="Nome completo do paciente"
                  value={newPatientName}
                  onChange={e => setNewPatientName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Telefone / WhatsApp"
                  value={newPatientPhone}
                  onChange={e => setNewPatientPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newPatientName.trim()) {
                      const created = onQuickAddPatient(newPatientName.trim(), newPatientPhone.trim(), physiotherapistId);
                      setPatientId(created.id);
                      setIsQuickPatientOpen(false);
                      setNewPatientName('');
                      setNewPatientPhone('');
                    }
                  }}
                  className="px-3 py-1 bg-teal-800 text-white font-semibold rounded-md text-[11px]"
                >
                  Salvar e Vincular
                </button>
              </div>
            ) : (
              <select
                value={patientId}
                onChange={e => handlePatientChange(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="">
                  {patients.length === 0 ? 'Nenhum paciente cadastrado ainda' : 'Selecione o paciente...'}
                </option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.plan === 'Gympass' ? '🏷️ Gympass' : p.plan === 'TotalPass' ? '⚡ TotalPass' : p.plan}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Designated Physiotherapist */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Fisioterapeuta Determinado *
            </label>
            <select
              value={physiotherapistId}
              onChange={e => setPhysiotherapistId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-teal-50/50 border border-teal-200 rounded-lg text-teal-950 font-bold"
            >
              {physiotherapists.length === 0 ? (
                <option value="">Nenhum fisioterapeuta cadastrado ainda</option>
              ) : (
                physiotherapists.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.specialty} ({f.room})
                  </option>
                ))
              )}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              O agendamento será vinculado diretamente à escala deste fisioterapeuta.
            </p>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Data da Consulta *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Horário de Início *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Conflict Warning */}
          {hasConflict && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-xs">Atenção: Horário já ocupado!</span>
                <span className="text-[11px] text-amber-800">
                  O fisioterapeuta já possui uma consulta agendada para {date} às {startTime}. Verifique se deseja encaixar ou escolher outro horário.
                </span>
              </div>
            </div>
          )}

          {/* Modality & Room */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Modalidade / Procedimento
              </label>
              <select
                value={modality}
                onChange={e => setModality(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="Pilates Clínico - Reformer">Pilates Clínico - Reformer</option>
                <option value="Pilates Aparelhos - Cadillac/Chair">Pilates Aparelhos - Cadillac/Chair</option>
                <option value="Reabilitação Articular / Ortopédica">Reabilitação Articular / Ortopédica</option>
                <option value="Fisioterapia Traumato-Ortopédica">Fisioterapia Traumato-Ortopédica</option>
                <option value="RPG - Reeducação Postural Global">RPG - Reeducação Postural Global</option>
                <option value="Cinesioterapia Geriátrica">Cinesioterapia Geriátrica</option>
                <option value="Liberação Miofascial & Eletro">Liberação Miofascial & Eletro</option>
                <option value="Reavaliação Funcional">Reavaliação Funcional</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sala
              </label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="Ex: Sala 1 - Reformer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          {/* Recurrence Options */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Recorrência / Repetição de Sessões
            </label>
            <select
              value={repeatWeeks}
              onChange={e => setRepeatWeeks(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value={1}>Apenas esta consulta (Sem repetição)</option>
              <option value={4}>Repetir semanalmente por 4 semanas (1 mês)</option>
              <option value={8}>Repetir semanalmente por 8 semanas (2 meses)</option>
              <option value={12}>Repetir semanalmente por 12 semanas (Trimestre)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Observações Clínicas para esta Sessão
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Foco na amplitude de movimento, queixa de dor na última sessão, etc."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs"
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
