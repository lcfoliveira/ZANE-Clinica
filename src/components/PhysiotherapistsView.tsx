import React, { useState } from 'react';
import { Physiotherapist, SpecialtyType, Patient, Appointment } from '../types';
import { PhotoInputPicker } from './PhotoInputPicker';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Calendar, 
  Edit3, 
  Trash2, 
  X,
  Award,
  Check,
  Search,
  Sparkles,
  Camera,
  Info,
  UserCheck
} from 'lucide-react';

interface PhysiotherapistsViewProps {
  physiotherapists: Physiotherapist[];
  patients: Patient[];
  appointments: Appointment[];
  onAddPhysiotherapist: (fisio: Omit<Physiotherapist, 'id'>) => void;
  onUpdatePhysiotherapist: (fisio: Physiotherapist) => void;
  onDeletePhysiotherapist: (id: string) => void;
  onOpenScheduleGrid: () => void;
  onScheduleWithFisio: (fisioId: string) => void;
}

export const PhysiotherapistsView: React.FC<PhysiotherapistsViewProps> = ({
  physiotherapists,
  patients,
  appointments,
  onAddPhysiotherapist,
  onUpdatePhysiotherapist,
  onDeletePhysiotherapist,
  onOpenScheduleGrid,
  onScheduleWithFisio
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFisio, setEditingFisio] = useState<Physiotherapist | null>(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Inline quick rename state
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineName, setInlineName] = useState('');

  // Form states for full modal
  const [name, setName] = useState('');
  const [crefito, setCrefito] = useState('');
  const [specialty, setSpecialty] = useState<SpecialtyType>('Pilates Clínico & Postura');
  const [room, setRoom] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [workDays, setWorkDays] = useState<string[]>(['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Delete confirmation modal state
  const [fisioToDelete, setFisioToDelete] = useState<Physiotherapist | null>(null);

  const daysOptions = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Start inline rename
  const handleStartInlineEdit = (f: Physiotherapist, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInlineEditId(f.id);
    setInlineName(f.name);
  };

  // Save inline rename
  const handleSaveInlineEdit = (f: Physiotherapist, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!inlineName.trim()) return;
    onUpdatePhysiotherapist({
      ...f,
      name: inlineName.trim()
    });
    setInlineEditId(null);
  };

  // Cancel inline rename
  const handleCancelInlineEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInlineEditId(null);
  };

  const handleOpenAdd = () => {
    setEditingFisio(null);
    setName('');
    setCrefito('');
    setSpecialty('Pilates Clínico & Postura');
    setRoom('Sala 1 - Estúdio Reformer');
    setPhone('(11) 98000-0000');
    setEmail('');
    setWorkDays(['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);
    setStartTime('08:00');
    setEndTime('18:00');
    setBio('');
    setAvatarUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: Physiotherapist) => {
    setEditingFisio(f);
    setName(f.name);
    setCrefito(f.crefito);
    setSpecialty(f.specialty);
    setRoom(f.room);
    setPhone(f.phone);
    setEmail(f.email);
    setWorkDays(f.workDays);
    setStartTime(f.workHours.start);
    setEndTime(f.workHours.end);
    setBio(f.bio);
    setAvatarUrl(f.avatar || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingFisio) {
      onUpdatePhysiotherapist({
        ...editingFisio,
        name: name.trim(),
        crefito: crefito.trim(),
        specialty,
        avatar: avatarUrl.trim() || editingFisio.avatar,
        room: room.trim(),
        phone: phone.trim(),
        email: email.trim(),
        workDays,
        workHours: { start: startTime, end: endTime },
        bio: bio.trim()
      });
    } else {
      onAddPhysiotherapist({
        name: name.trim(),
        crefito: crefito.trim(),
        specialty,
        avatar: avatarUrl.trim() || '',
        room: room.trim(),
        color: '#0d9488',
        phone: phone.trim(),
        email: email.trim(),
        workDays,
        workHours: { start: startTime, end: endTime },
        bio: bio.trim()
      });
    }

    setIsModalOpen(false);
  };

  const toggleDay = (day: string) => {
    if (workDays.includes(day)) {
      setWorkDays(workDays.filter(d => d !== day));
    } else {
      setWorkDays([...workDays, day]);
    }
  };

  // Helper to append prefix
  const applyPrefix = (prefix: string) => {
    // If name already starts with Dr., Dra., Ft., Prof., replace or prepend
    const prefixes = ['Dr. ', 'Dra. ', 'Ft. ', 'Prof. '];
    let base = name;
    for (const p of prefixes) {
      if (base.startsWith(p)) {
        base = base.replace(p, '');
        break;
      }
    }
    setName(`${prefix}${base}`.trim());
  };

  // Filtered physiotherapists
  const filteredPhysiotherapists = physiotherapists.filter(f => {
    const q = searchTerm.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.specialty.toLowerCase().includes(q) ||
      f.crefito.toLowerCase().includes(q) ||
      f.room.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Corpo Clínico</span>
            <span aria-hidden="true">·</span>
            <span>Fisioterapeutas & Especialistas</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Fisioterapeutas & Especialistas
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Gerencie o corpo clínico, edite o nome dos profissionais, especialidades, salas de atendimento e horários.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Fisioterapeuta</span>
          </button>
        </div>
      </div>

      {/* Helpful banner explaining how to edit therapist names */}
      {physiotherapists.length > 0 && (
        <div className="bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-white border border-teal-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-100/90 text-teal-800 flex items-center justify-center shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-teal-950">
                Edição Rápida de Nome de Profissionais
              </p>
              <p className="text-teal-800/90 mt-0.5">
                Você pode alterar o nome de qualquer fisioterapeuta clicando no botão <strong className="font-semibold text-teal-950">"Editar Nome"</strong> direto no cartão ou em <strong className="font-semibold text-teal-950">"Editar Cadastro"</strong> para dados completos. A alteração atualiza automaticamente consultas, prontuários e totens.
              </p>
            </div>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, registro ou sala..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 shadow-2xs"
            />
          </div>
        </div>
      )}

      {/* Physiotherapists Empty State or Grid */}
      {physiotherapists.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-500 max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <UserCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Nenhum Fisioterapeuta Cadastrado</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Inicie os testes reais cadastrando o primeiro fisioterapeuta ou especialista da sua clínica para definir especialidade, horários e sala de atendimento.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeiro Fisioterapeuta</span>
          </button>
        </div>
      ) : filteredPhysiotherapists.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          <p className="text-sm font-semibold text-slate-700">Nenhum fisioterapeuta encontrado</p>
          <p className="text-xs mt-1">Nenhum resultado corresponde à busca "{searchTerm}".</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-3 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:underline"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhysiotherapists.map(fisio => {
          const activePatientsCount = patients.filter(p => p.designatedFisioId === fisio.id).length;
          const totalAppointments = appointments.filter(a => a.physiotherapistId === fisio.id).length;
          const isInlineEditing = inlineEditId === fisio.id;

          return (
            <div
              key={fisio.id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo & Main Details */}
                <div className="flex items-start gap-4">
                  {fisio.avatar ? (
                    <img
                      src={fisio.avatar}
                      alt={fisio.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xl border border-teal-200 shrink-0">
                      {fisio.name.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {/* Inline Name Editing or Normal Display */}
                    {isInlineEditing ? (
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                          Editar Nome do Profissional
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            autoFocus
                            value={inlineName}
                            onChange={e => setInlineName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveInlineEdit(fisio);
                              if (e.key === 'Escape') handleCancelInlineEdit();
                            }}
                            className="w-full px-2.5 py-1 text-sm font-semibold border-2 border-teal-600 rounded-md bg-teal-50/50 text-slate-900 focus:outline-hidden shadow-2xs"
                            placeholder="Nome do fisioterapeuta"
                          />
                          <button
                            onClick={e => handleSaveInlineEdit(fisio, e)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-2xs transition-colors"
                            title="Salvar novo nome (Enter)"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelInlineEdit}
                            className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition-colors"
                            title="Cancelar edição (Esc)"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Pressione Enter para salvar
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h3 
                            onClick={e => handleStartInlineEdit(fisio, e)}
                            className="text-base font-bold text-slate-900 leading-tight hover:text-teal-800 cursor-pointer group flex items-center gap-1.5"
                            title="Clique para editar o nome do profissional"
                          >
                            <span>{fisio.name}</span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                          </h3>

                          {/* Quick Edit Name / Edit Profile button */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEdit(fisio)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors shadow-2xs"
                              title="Editar cadastro completo e nome"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                          </div>
                        </div>

                        {/* Quick Rename button trigger */}
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            onClick={e => handleStartInlineEdit(fisio, e)}
                            className="text-[11px] font-medium text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>Alterar nome</span>
                          </button>
                          <span className="text-slate-300 text-xs">·</span>
                          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                            {fisio.crefito}
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-teal-900 block mt-1">
                          {fisio.specialty}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {fisio.bio && (
                  <p className="text-xs text-slate-600 mt-3.5 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                    {fisio.bio}
                  </p>
                )}

                {/* Room & Working Hours */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">{fisio.room}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono tabular-nums text-[11px]">
                      {fisio.workDays.join(', ')} · {fisio.workHours.start} às {fisio.workHours.end}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{fisio.phone}</span>
                  </div>
                </div>

                {/* Patient & Session Counters */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-center">
                  <div>
                    <span className="text-xs text-slate-500 block">Pacientes Vinculados</span>
                    <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                      {activePatientsCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Total Sessões</span>
                    <span className="text-base font-bold text-teal-800 font-mono tabular-nums">
                      {totalAppointments}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(fisio)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-teal-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200"
                    title="Editar nome, sala, horários e biografia"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-teal-700" />
                    <span>Editar Cadastro</span>
                  </button>

                  <button
                    onClick={onOpenScheduleGrid}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1.5"
                  >
                    Ver Grade
                  </button>
                </div>

                <button
                  onClick={() => onScheduleWithFisio(fisio.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar</span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Add / Edit Physiotherapist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingFisio ? 'Editar Fisioterapeuta' : 'Cadastrar Novo Fisioterapeuta'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingFisio 
                      ? 'Atualize o nome e as configurações clínicas deste profissional.' 
                      : 'Adicione um novo fisioterapeuta ao corpo clínico da clínica.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Name Section with High Prominence and Title Prefixes */}
              <div className="p-3.5 bg-teal-50/60 border border-teal-200/90 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-teal-950 text-sm">
                    Nome Completo do Profissional *
                  </label>
                  <span className="text-[10px] font-medium text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full">
                    Campo Principal
                  </span>
                </div>

                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Dra. Mariana Costa ou Dr. Lucas Silveira"
                  className="w-full px-3.5 py-2.5 bg-white border border-teal-300 rounded-lg text-slate-900 font-semibold text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700 shadow-2xs"
                />

                {/* Quick Title Prefix Pills */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500">Prefixos rápidos:</span>
                  <button
                    type="button"
                    onClick={() => applyPrefix('Dra. ')}
                    className="px-2 py-0.5 bg-white hover:bg-teal-100 border border-teal-200 rounded text-[11px] font-semibold text-teal-800 transition-colors"
                  >
                    + Dra.
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPrefix('Dr. ')}
                    className="px-2 py-0.5 bg-white hover:bg-teal-100 border border-teal-200 rounded text-[11px] font-semibold text-teal-800 transition-colors"
                  >
                    + Dr.
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPrefix('Ft. ')}
                    className="px-2 py-0.5 bg-white hover:bg-teal-100 border border-teal-200 rounded text-[11px] font-semibold text-teal-800 transition-colors"
                  >
                    + Ft.
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPrefix('Prof. ')}
                    className="px-2 py-0.5 bg-white hover:bg-teal-100 border border-teal-200 rounded text-[11px] font-semibold text-teal-800 transition-colors"
                  >
                    + Prof.
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-teal-800">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Este nome será atualizado em todos os agendamentos, fichas de consulta, totens e prontuários.</span>
                </div>
              </div>

              {/* CREFITO and Specialty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Registro CREFITO *
                  </label>
                  <input
                    type="text"
                    required
                    value={crefito}
                    onChange={e => setCrefito(e.target.value)}
                    placeholder="CREFITO-3/000000-F"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Especialidade Principal
                  </label>
                  <select
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value as SpecialtyType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="Pilates Clínico & Postura">Pilates Clínico & Postura</option>
                    <option value="Reabilitação Traumato-Ortopédica">Reabilitação Traumato-Ortopédica</option>
                    <option value="Fisioterapia Esportiva">Fisioterapia Esportiva</option>
                    <option value="RPG & Cadeias Musculares">RPG & Cadeias Musculares</option>
                    <option value="Fisioterapia Neurofuncional">Fisioterapia Neurofuncional</option>
                    <option value="Gerontologia & Mobilidade">Gerontologia & Mobilidade</option>
                    <option value="Saúde da Mulher & Pélvica">Saúde da Mulher & Pélvica</option>
                  </select>
                </div>
              </div>

              {/* Room & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sala Designada
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    placeholder="Ex: Sala 1 - Reformer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  E-mail Profissional
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="fisioterapeuta@clinicazani.com.br"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              {/* Photo Input (Upload Local, Camera, or Web URL) */}
              <PhotoInputPicker
                value={avatarUrl}
                onChange={setAvatarUrl}
                label="Foto de Perfil do Fisioterapeuta"
                helperText="Escolha um arquivo do dispositivo, capture direto pela câmera ou insira um link web."
                placeholderName={name || 'Fisioterapeuta'}
              />

              {/* Working Days */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dias de Atendimento na Clínica
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {daysOptions.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                        workDays.includes(day)
                          ? 'bg-teal-800 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start and End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Início do Atendimento
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Término do Atendimento
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono tabular-nums"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Biografia / Perfil Profissional
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Formação acadêmica, certificações em Pilates, experiência clínica..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                ></textarea>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {editingFisio ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFisioToDelete(editingFisio);
                      setIsModalOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingFisio ? 'Salvar Alterações do Nome/Perfil' : 'Cadastrar Fisioterapeuta'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {fisioToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Excluir Fisioterapeuta</h3>
                <p className="text-xs text-slate-500">Confirmação de remoção do profissional</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tem certeza que deseja remover <strong className="text-slate-900">{fisioToDelete.name}</strong> do corpo clínico? Os pacientes e consultas vinculados continuarão no sistema com o histórico preservado.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setFisioToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeletePhysiotherapist(fisioToDelete.id);
                  setFisioToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
