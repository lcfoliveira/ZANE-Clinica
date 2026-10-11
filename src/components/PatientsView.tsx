import React, { useState, useMemo } from 'react';
import { Patient, Physiotherapist, PatientPlan } from '../types';
import { PhotoInputPicker } from './PhotoInputPicker';
import { PlanBadge } from './PlanBadge';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  Activity, 
  UserCheck, 
  FileText, 
  Edit3, 
  Trash2,
  Filter,
  CheckCircle,
  X,
  CreditCard,
  Building2
} from 'lucide-react';

interface PatientsViewProps {
  patients: Patient[];
  physiotherapists: Physiotherapist[];
  onAddPatient: (patient: Omit<Patient, 'id' | 'registeredAt'>) => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onSelectPatient: (patientId: string) => void;
  onScheduleForPatient: (patientId: string, fisioId?: string) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  physiotherapists,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
  onSelectPatient,
  onScheduleForPatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [selectedFisioFilter, setSelectedFisioFilter] = useState<string>('all');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [avatar, setAvatar] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [plan, setPlan] = useState<PatientPlan>('Pilates 2x/semana');
  const [partnerId, setPartnerId] = useState('');
  const [designatedFisioId, setDesignatedFisioId] = useState(physiotherapists[0]?.id || '');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Count by category
  const gympassCount = useMemo(() => patients.filter(p => p.plan === 'Gympass').length, [patients]);
  const totalpassCount = useMemo(() => patients.filter(p => p.plan === 'TotalPass').length, [patients]);
  const studioPlansCount = useMemo(() => patients.filter(p => p.plan !== 'Gympass' && p.plan !== 'TotalPass').length, [patients]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = !searchQuery.trim() || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cpf.includes(searchQuery) ||
        p.phone.includes(searchQuery) ||
        (p.partnerId && p.partnerId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesPlan = true;
      if (selectedPlanFilter === 'all') {
        matchesPlan = true;
      } else if (selectedPlanFilter === 'studio_plans') {
        matchesPlan = p.plan !== 'Gympass' && p.plan !== 'TotalPass';
      } else {
        matchesPlan = p.plan === selectedPlanFilter;
      }

      const matchesFisio = selectedFisioFilter === 'all' || p.designatedFisioId === selectedFisioFilter;

      return matchesSearch && matchesPlan && matchesFisio;
    });
  }, [patients, searchQuery, selectedPlanFilter, selectedFisioFilter]);

  const handleOpenRegister = () => {
    setEditingPatient(null);
    setName('');
    setPhone('');
    setCpf('');
    setAvatar('');
    setEmail('');
    setBirthDate('');
    setPlan('Pilates 2x/semana');
    setPartnerId('');
    setDesignatedFisioId(physiotherapists[0]?.id || '');
    setChiefComplaint('');
    setClinicalNotes('');
    setIsRegisterOpen(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setName(p.name);
    setPhone(p.phone);
    setCpf(p.cpf);
    setAvatar(p.avatar || '');
    setEmail(p.email || '');
    setBirthDate(p.birthDate || '');
    setPlan(p.plan);
    setPartnerId(p.partnerId || '');
    setDesignatedFisioId(p.designatedFisioId);
    setChiefComplaint(p.chiefComplaint);
    setClinicalNotes(p.clinicalNotes || '');
    setIsRegisterOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPatient) {
      onUpdatePatient({
        ...editingPatient,
        name: name.trim(),
        phone: phone.trim(),
        cpf: cpf.trim(),
        avatar: avatar.trim() || undefined,
        email: email.trim() || undefined,
        birthDate: birthDate || undefined,
        plan,
        partnerId: partnerId.trim() || undefined,
        designatedFisioId,
        chiefComplaint: chiefComplaint.trim(),
        clinicalNotes: clinicalNotes.trim() || undefined
      });
    } else {
      onAddPatient({
        name: name.trim(),
        phone: phone.trim(),
        cpf: cpf.trim(),
        avatar: avatar.trim() || undefined,
        email: email.trim() || undefined,
        birthDate: birthDate || undefined,
        plan,
        partnerId: partnerId.trim() || undefined,
        designatedFisioId,
        chiefComplaint: chiefComplaint.trim(),
        clinicalNotes: clinicalNotes.trim() || undefined,
        active: true
      });
    }

    setIsRegisterOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Gestão Clínica</span>
            <span aria-hidden="true">·</span>
            <span>Cadastro & Prontuários</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Pacientes & Alunos de Pilates
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Gerencie o histórico, plano ativo e fisioterapeuta responsável por cada paciente.
          </p>
        </div>

        <button
          onClick={handleOpenRegister}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Paciente</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar paciente por nome, CPF, telefone, matrícula Gympass/TotalPass..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPlanFilter}
              onChange={e => setSelectedPlanFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="all">Todas as Categorias ({patients.length})</option>
              <optgroup label="Convênios & Benefícios Corporativos">
                <option value="Gympass">Gympass (Wellhub) ({gympassCount})</option>
                <option value="TotalPass">TotalPass ({totalpassCount})</option>
              </optgroup>
              <optgroup label="Planos Próprios do Studio">
                <option value="studio_plans">Todos Planos do Studio ({studioPlansCount})</option>
                <option value="Pilates 2x/semana">Pilates 2x/semana</option>
                <option value="Pilates 3x/semana">Pilates 3x/semana</option>
                <option value="Sessão Avulsa">Sessão Avulsa</option>
                <option value="Reabilitação Intensiva">Reabilitação Intensiva</option>
                <option value="Atendimento Domiciliar">Atendimento Domiciliar</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-2 pt-1 pb-1 overflow-x-auto text-xs border-t border-slate-100">
          <span className="font-semibold text-slate-500 mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Categoria:
          </span>
          <button
            onClick={() => setSelectedPlanFilter('all')}
            className={`px-2.5 py-1 font-semibold rounded-lg transition-colors whitespace-nowrap text-xs ${
              selectedPlanFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 bg-slate-100 hover:text-slate-900'
            }`}
          >
            Todas ({patients.length})
          </button>
          <button
            onClick={() => setSelectedPlanFilter('Gympass')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-bold rounded-lg transition-all whitespace-nowrap text-xs border ${
              selectedPlanFilter === 'Gympass'
                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                : 'text-rose-700 bg-rose-50/80 border-rose-200/80 hover:bg-rose-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>Gympass</span>
            <span className="text-[10px] opacity-80 font-mono">({gympassCount})</span>
          </button>
          <button
            onClick={() => setSelectedPlanFilter('TotalPass')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-bold rounded-lg transition-all whitespace-nowrap text-xs border ${
              selectedPlanFilter === 'TotalPass'
                ? 'bg-sky-700 text-white border-sky-700 shadow-2xs'
                : 'text-sky-800 bg-sky-50/80 border-sky-300/80 hover:bg-sky-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            <span>TotalPass</span>
            <span className="text-[10px] opacity-80 font-mono">({totalpassCount})</span>
          </button>
          <button
            onClick={() => setSelectedPlanFilter('studio_plans')}
            className={`px-2.5 py-1 font-semibold rounded-lg transition-colors whitespace-nowrap text-xs ${
              selectedPlanFilter === 'studio_plans'
                ? 'bg-teal-800 text-white'
                : 'text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200/60'
            }`}
          >
            Planos do Studio ({studioPlansCount})
          </button>
        </div>

        {/* Filter by Physiotherapist */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto text-xs">
          <span className="font-semibold text-slate-500 mr-1 shrink-0 flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> Fisioterapeuta Determinado:
          </span>
          <button
            onClick={() => setSelectedFisioFilter('all')}
            className={`px-2.5 py-1 font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedFisioFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 bg-slate-100 hover:text-slate-900'
            }`}
          >
            Todos ({patients.length})
          </button>
          {physiotherapists.map(f => {
            const count = patients.filter(p => p.designatedFisioId === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFisioFilter(f.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedFisioFilter === f.id
                    ? 'bg-teal-800 text-white'
                    : 'text-slate-600 bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{f.name.split(' ')[0]} {f.name.split(' ')[1]}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.length === 0 ? (
          <div className="col-span-full py-16 bg-white border border-dashed border-slate-200 rounded-xl text-center px-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Nenhum Paciente Cadastrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              O banco de dados está pronto para os testes reais. Cadastre os primeiros alunos de Pilates ou pacientes clínicos da sua clínica.
            </p>
            <button
              onClick={handleOpenRegister}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Paciente</span>
            </button>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="col-span-full py-16 bg-white border border-dashed border-slate-200 rounded-xl text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Nenhum paciente localizado.</p>
            <p className="text-xs text-slate-400 mt-1">Verifique os filtros de busca ou cadastre um novo paciente.</p>
          </div>
        ) : (
          filteredPatients.map(patient => {
            const fisio = physiotherapists.find(f => f.id === patient.designatedFisioId);

            return (
              <div
                key={patient.id}
                className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Patient Name & Plan */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {patient.avatar ? (
                        <img
                          src={patient.avatar}
                          alt={patient.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                          onError={() => {}}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-200 shadow-2xs shrink-0">
                          {patient.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <h3 
                          onClick={() => onSelectPatient(patient.id)}
                          className="text-sm font-bold text-slate-900 hover:text-teal-800 cursor-pointer"
                        >
                          {patient.name}
                        </h3>
                        <div className="mt-1">
                          <PlanBadge plan={patient.plan} partnerId={patient.partnerId} showDetails={true} size="sm" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(patient)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                        title="Editar cadastro"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remover paciente ${patient.name}?`)) {
                            onDeletePatient(patient.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        title="Excluir paciente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="text-xs text-slate-600 space-y-1 mt-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{patient.phone}</span>
                    </div>
                    {patient.cpf && (
                      <div className="flex items-center gap-2 font-mono tabular-nums text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-600">CPF:</span>
                        <span>{patient.cpf}</span>
                      </div>
                    )}
                  </div>

                  {/* Designated Physiotherapist Badge */}
                  <div className="mt-3 p-2 rounded-lg bg-teal-50/50 border border-teal-100 flex items-center gap-2">
                    {fisio?.avatar && (
                      <img
                        src={fisio.avatar}
                        alt={fisio.name}
                        className="w-6 h-6 rounded-full object-cover border border-teal-200 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <span className="text-[10px] text-teal-700 font-semibold block uppercase tracking-wider">
                        Fisioterapeuta Responsável
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate block">
                        {fisio?.name || 'Não atribuído'}
                      </span>
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  {patient.chiefComplaint && (
                    <div className="mt-3 text-xs">
                      <span className="text-[11px] font-semibold text-slate-500 block">Diagnóstico / Queixa:</span>
                      <p className="text-slate-700 line-clamp-2 mt-0.5 leading-relaxed">
                        {patient.chiefComplaint}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectPatient(patient.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Prontuário</span>
                  </button>

                  <button
                    onClick={() => onScheduleForPatient(patient.id, patient.designatedFisioId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Sessão</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Patient Registration / Edit Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingPatient ? 'Editar Paciente' : 'Novo Paciente / Aluno'}
                </h3>
                <p className="text-xs text-slate-500">
                  Preencha os dados e selecione o fisioterapeuta determinado responsável.
                </p>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Mariana Silveira Costa"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Plano / Categoria do Paciente *
                  </label>
                  <select
                    value={plan}
                    onChange={e => setPlan(e.target.value as PatientPlan)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                  >
                    <optgroup label="Benefícios Corporativos & Parcerias">
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

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fisioterapeuta Determinado *
                  </label>
                  <select
                    value={designatedFisioId}
                    onChange={e => setDesignatedFisioId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-teal-900"
                  >
                    {physiotherapists.length === 0 ? (
                      <option value="">Nenhum fisioterapeuta cadastrado ainda</option>
                    ) : (
                      physiotherapists.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.specialty})
                        </option>
                      ))
                    )}
                  </select>
                  {physiotherapists.length === 0 && (
                    <p className="text-[10px] text-amber-600 font-medium mt-1">
                      ⚠️ Cadastre primeiro os profissionais na aba Fisioterapeutas para vinculá-los aos pacientes.
                    </p>
                  )}
                </div>
              </div>

              {/* Gympass / TotalPass Token & Integration Details */}
              {(plan === 'Gympass' || plan === 'TotalPass') && (
                <div className={`p-3.5 rounded-xl border space-y-2 ${
                  plan === 'Gympass' 
                    ? 'bg-rose-50/60 border-rose-200/90' 
                    : 'bg-sky-50/60 border-sky-200/90'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${
                      plan === 'Gympass' ? 'text-rose-900' : 'text-sky-900'
                    }`}>
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{plan === 'Gympass' ? 'Identificação Gympass / Wellhub' : 'Identificação TotalPass'}</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      plan === 'Gympass' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {plan}
                    </span>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 text-[11px] mb-1">
                      {plan === 'Gympass' ? 'ID / Matrícula Gympass do Aluno' : 'Token / Matrícula TotalPass'}
                    </label>
                    <input
                      type="text"
                      value={partnerId}
                      onChange={e => setPartnerId(e.target.value)}
                      placeholder={plan === 'Gympass' ? 'Ex: GYM-84920' : 'Ex: TP-91238'}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-slate-800 font-mono text-xs focus:outline-hidden focus:ring-2 ${
                        plan === 'Gympass'
                          ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-600'
                          : 'border-sky-300 focus:ring-sky-500/20 focus:border-sky-600'
                      }`}
                    />
                  </div>

                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    {plan === 'Gympass'
                      ? '💡 O aluno deve efetuar o check-in no app Gympass / Wellhub ao chegar na clínica para faturamento da sessão.'
                      : '💡 Solicite a validação de token diário ou leitura de QR code pelo aplicativo TotalPass na recepção.'}
                  </p>
                </div>
              )}

              {/* Photo Input (Upload, Camera, or Web URL) */}
              <PhotoInputPicker
                value={avatar}
                onChange={setAvatar}
                label="Foto de Identificação do Paciente / Aluno"
                helperText="Upe um arquivo do seu dispositivo, tire uma foto pela câmera ou cole uma URL."
                placeholderName={name || 'Paciente'}
              />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Queixa Principal / Diagnóstico Clínico
                </label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={e => setChiefComplaint(e.target.value)}
                  placeholder="Ex: Hérnia de disco lombar L4-L5, pós-operatório de joelho..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observações Clínicas / Cuidados Especiais
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={e => setClinicalNotes(e.target.value)}
                  placeholder="Contraindicações, restrições articulares, objetivos terapêuticos..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs"
                >
                  {editingPatient ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
