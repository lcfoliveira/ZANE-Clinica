import React, { useState } from 'react';
import { Patient, Physiotherapist, Appointment, CheckinRecord, PatientPlan } from '../types';
import { PhotoInputPicker } from './PhotoInputPicker';
import { PlanBadge } from './PlanBadge';
import { 
  X, 
  Calendar, 
  UserCheck, 
  Phone, 
  Mail, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  FileText,
  Camera,
  Edit3,
  CreditCard,
  Check
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: Patient | null;
  onClose: () => void;
  physiotherapists: Physiotherapist[];
  appointments: Appointment[];
  checkins: CheckinRecord[];
  onScheduleNext: (patientId: string, fisioId?: string) => void;
  onUpdatePatient: (updated: Patient) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  physiotherapists,
  appointments,
  checkins,
  onScheduleNext,
  onUpdatePatient
}) => {
  const [newNote, setNewNote] = useState('');
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editPlan, setEditPlan] = useState<PatientPlan>(patient?.plan || 'Pilates 2x/semana');
  const [editPartnerId, setEditPartnerId] = useState(patient?.partnerId || '');

  if (!patient) return null;

  const designatedFisio = physiotherapists.find(f => f.id === patient.designatedFisioId);
  const patientApts = appointments
    .filter(a => a.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const completedSessions = patientApts.filter(a => a.status === 'concluido').length;
  const noShows = patientApts.filter(a => a.status === 'falta').length;
  const patientCheckins = checkins.filter(c => c.patientId === patient.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const timestamp = new Date().toLocaleDateString('pt-BR');
    const noteEntry = `[${timestamp}] ${newNote.trim()}`;
    const updatedNotes = patient.clinicalNotes 
      ? `${patient.clinicalNotes}\n\n${noteEntry}` 
      : noteEntry;

    onUpdatePatient({
      ...patient,
      clinicalNotes: updatedNotes
    });

    setNewNote('');
  };

  const handleSavePhoto = (newAvatarUrl: string) => {
    onUpdatePatient({
      ...patient,
      avatar: newAvatarUrl || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            {/* Patient Photo Avatar */}
            <div className="relative group shrink-0">
              {patient.avatar ? (
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  onError={() => {}}
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 font-bold text-lg flex items-center justify-center border border-teal-200 shadow-xs">
                  {patient.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                className="absolute -bottom-1 -right-1 p-1 bg-teal-800 hover:bg-teal-900 text-white rounded-full shadow-xs transition-transform hover:scale-110"
                title="Alterar foto (upload ou câmera)"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 font-display">
                  {patient.name}
                </h2>
                <PlanBadge plan={patient.plan} partnerId={patient.partnerId} showDetails={true} size="md" />
                <button
                  type="button"
                  onClick={() => {
                    setEditPlan(patient.plan);
                    setEditPartnerId(patient.partnerId || '');
                    setIsEditingPlan(!isEditingPlan);
                  }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 hover:underline ml-1"
                  title="Alterar plano ou categoria (Gympass, TotalPass, etc.)"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Alterar categoria</span>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-slate-500">
                  Cadastrado em {new Date(patient.registeredAt).toLocaleDateString('pt-BR')} · CPF {patient.cpf || 'Não informado'}
                </p>
                <button
                  onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                  className="text-[11px] font-semibold text-teal-800 hover:underline inline-flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>{patient.avatar ? 'Trocar foto' : 'Adicionar foto'}</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inline Plan / Category Editor if expanded */}
        {isEditingPlan && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <CreditCard className="w-4 h-4 text-teal-700" />
                <span>Atualizar Categoria / Plano do Paciente</span>
              </span>
              <button
                type="button"
                onClick={() => setIsEditingPlan(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Categoria / Plano
                </label>
                <select
                  value={editPlan}
                  onChange={e => setEditPlan(e.target.value as PatientPlan)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  <optgroup label="Convênios & Benefícios Corporativos">
                    <option value="Gympass">Gympass (Wellhub)</option>
                    <option value="TotalPass">TotalPass</option>
                  </optgroup>
                  <optgroup label="Planos do Studio">
                    <option value="Pilates 2x/semana">Pilates 2x/semana</option>
                    <option value="Pilates 3x/semana">Pilates 3x/semana</option>
                    <option value="Sessão Avulsa">Sessão Avulsa</option>
                    <option value="Reabilitação Intensiva">Reabilitação Intensiva</option>
                    <option value="Atendimento Domiciliar">Atendimento Domiciliar</option>
                  </optgroup>
                </select>
              </div>

              {(editPlan === 'Gympass' || editPlan === 'TotalPass') ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {editPlan === 'Gympass' ? 'Matrícula / ID Gympass' : 'Token / Matrícula TotalPass'}
                  </label>
                  <input
                    type="text"
                    value={editPartnerId}
                    onChange={e => setEditPartnerId(e.target.value)}
                    placeholder={editPlan === 'Gympass' ? 'GYM-00000' : 'TP-00000'}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs"
                  />
                </div>
              ) : (
                <div className="flex items-end pb-1 text-slate-500 text-[11px]">
                  Plano com mensalidade/sessão direta do studio.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onUpdatePatient({
                    ...patient,
                    plan: editPlan,
                    partnerId: (editPlan === 'Gympass' || editPlan === 'TotalPass') ? (editPartnerId.trim() || undefined) : undefined
                  });
                  setIsEditingPlan(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold rounded-lg shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Categoria</span>
              </button>
            </div>
          </div>
        )}

        {/* Inline Photo Editor if expanded */}
        {isEditingPhoto && (
          <div className="p-3 bg-teal-50/40 rounded-xl border border-teal-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-950">
                Gerenciar Foto do Paciente
              </span>
              <button
                onClick={() => setIsEditingPhoto(false)}
                className="text-xs text-teal-800 hover:text-teal-950 font-semibold"
              >
                Concluir
              </button>
            </div>
            <PhotoInputPicker
              value={patient.avatar || ''}
              onChange={handleSavePhoto}
              label="Foto do Paciente"
              helperText="Tire uma foto pela câmera ou carregue uma imagem do seu dispositivo."
              placeholderName={patient.name}
            />
          </div>
        )}

        {/* Top 2 Columns: Contact & Designated Physiotherapist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Contact Details */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
              Dados de Contato
            </span>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{patient.phone}</span>
            </div>
            {patient.email && (
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{patient.email}</span>
              </div>
            )}
            {patient.birthDate && (
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Nascimento: {new Date(`${patient.birthDate}T00:00:00`).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            {patient.partnerId && (
              <div className="flex items-center gap-2 text-slate-700 pt-1 border-t border-slate-200/60 font-mono text-[11px]">
                <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Matrícula / Token: <strong className="text-slate-900">{patient.partnerId}</strong></span>
              </div>
            )}
          </div>

          {/* Designated Physiotherapist */}
          <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200/80">
            <span className="font-bold text-teal-800 block text-[11px] uppercase tracking-wider mb-2">
              Fisioterapeuta Determinado
            </span>
            {designatedFisio ? (
              <div className="flex items-center gap-3">
                {designatedFisio.avatar && (
                  <img
                    src={designatedFisio.avatar}
                    alt={designatedFisio.name}
                    className="w-10 h-10 rounded-full object-cover border border-teal-200 shrink-0"
                  />
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {designatedFisio.name}
                  </h4>
                  <span className="text-[11px] text-teal-800 block">
                    {designatedFisio.specialty}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block tabular-nums">
                    {designatedFisio.room}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-slate-500">Nenhum fisioterapeuta fixado</span>
            )}
          </div>
        </div>

        {/* Chief Complaint / Diagnostic */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
          <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
            Diagnóstico / Queixa Clínica Principal
          </span>
          <p className="text-slate-800 leading-relaxed font-medium">
            {patient.chiefComplaint || 'Sem queixa registrada.'}
          </p>
        </div>

        {/* Clinical Evolution Notes & Add Entry */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-slate-800 block text-xs">
            Prontuário & Evolução Terapêutica
          </span>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto font-mono text-[11px]">
            {patient.clinicalNotes || 'Nenhuma evolução registrada ainda.'}
          </div>

          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Adicionar nova anotação de evolução clínica..."
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-teal-800 text-white font-semibold rounded-lg text-xs hover:bg-teal-900"
            >
              Adicionar Nota
            </button>
          </form>
        </div>

        {/* History of Appointments & Check-ins */}
        <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">
              Histórico de Sessões ({patientApts.length})
            </span>
            <div className="flex items-center gap-3 text-slate-500 font-mono tabular-nums text-[11px]">
              <span>Concluídas: <strong className="text-emerald-700">{completedSessions}</strong></span>
              <span>Faltas: <strong className="text-rose-700">{noShows}</strong></span>
              <span>Check-ins Totais: <strong className="text-teal-700">{patientCheckins.length}</strong></span>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {patientApts.length === 0 ? (
              <p className="p-4 text-center text-slate-400">Nenhuma consulta no histórico.</p>
            ) : (
              patientApts.map(apt => {
                const fisio = physiotherapists.find(f => f.id === apt.physiotherapistId);
                return (
                  <div key={apt.id} className="p-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {new Date(`${apt.date}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · {apt.startTime}
                      </span>
                      <span className="text-slate-600">
                        {apt.modality}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">
                        Com {fisio?.name.split(' ')[0]} {fisio?.name.split(' ')[1]}
                      </span>
                      <span className="capitalize font-semibold text-[11px] text-teal-800">
                        {apt.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              onClose();
              onScheduleNext(patient.id, patient.designatedFisioId);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Agendar Nova Consulta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
