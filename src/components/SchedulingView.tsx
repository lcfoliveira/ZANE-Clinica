import React, { useState, useMemo } from 'react';
import { Appointment, Patient, Physiotherapist, AppointmentStatus } from '../types';
import { PlanBadge } from './PlanBadge';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Plus, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Filter, 
  Check, 
  Download, 
  Printer, 
  X, 
  AlertTriangle, 
  RotateCcw,
  Sparkles,
  Info,
  CalendarDays,
  LayoutGrid,
  List,
  Edit3,
  User,
  Activity,
  Phone,
  ChevronRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

interface SchedulingViewProps {
  appointments: Appointment[];
  patients: Patient[];
  physiotherapists: Physiotherapist[];
  onOpenNewAppointment: (preselectedFisioId?: string, preselectedDate?: string, preselectedTime?: string, preselectedPatientId?: string) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus, cancellationReason?: string, clinicalEvolution?: string, notes?: string) => void;
  onUpdateAppointment?: (updated: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onSelectPatient: (patientId: string) => void;
}

export const SchedulingView: React.FC<SchedulingViewProps> = ({
  appointments,
  patients,
  physiotherapists,
  onOpenNewAppointment,
  onUpdateStatus,
  onUpdateAppointment,
  onDeleteAppointment,
  onSelectPatient
}) => {
  // Filters State
  const [selectedFisioId, setSelectedFisioId] = useState<string>('all');
  const [selectedTabFilter, setSelectedTabFilter] = useState<'all' | 'concluido' | 'cancelado' | 'falta' | 'agendado'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>(''); // Exact date
  const [periodPreset, setPeriodPreset] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Modal for Viewing Full Detail of an Appointment
  const [selectedAppointmentDetail, setSelectedAppointmentDetail] = useState<Appointment | null>(null);

  // Modal for Canceling an Appointment with a Reason
  const [cancelingAppointmentId, setCancelingAppointmentId] = useState<string | null>(null);
  const [cancellationReasonInput, setCancellationReasonInput] = useState('');

  // Modal for Editing / Adding Clinical Evolution
  const [editingEvolutionAppointment, setEditingEvolutionAppointment] = useState<Appointment | null>(null);
  const [clinicalEvolutionInput, setClinicalEvolutionInput] = useState('');
  const [durationMinutesInput, setDurationMinutesInput] = useState(50);
  const [sessionNotesInput, setSessionNotesInput] = useState('');

  // Helper date generators for period filters
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const sevenDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const thirtyDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Count stats
  const totalCount = appointments.length;
  const completedCount = appointments.filter(a => a.status === 'concluido').length;
  const canceledCount = appointments.filter(a => a.status === 'cancelado').length;
  const noShowCount = appointments.filter(a => a.status === 'falta').length;
  const scheduledCount = appointments.filter(a => a.status === 'agendado' || a.status === 'checkin_realizado' || a.status === 'em_atendimento').length;

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(apt => {
        // Physiotherapist filter
        const matchesFisio = selectedFisioId === 'all' || apt.physiotherapistId === selectedFisioId;
        
        // Tab / Status filter
        let matchesStatus = true;
        if (selectedTabFilter === 'concluido') {
          matchesStatus = apt.status === 'concluido';
        } else if (selectedTabFilter === 'cancelado') {
          matchesStatus = apt.status === 'cancelado';
        } else if (selectedTabFilter === 'falta') {
          matchesStatus = apt.status === 'falta';
        } else if (selectedTabFilter === 'agendado') {
          matchesStatus = apt.status === 'agendado' || apt.status === 'checkin_realizado' || apt.status === 'em_atendimento';
        }

        // Period / Date filter
        let matchesDate = true;
        if (dateFilter) {
          matchesDate = apt.date === dateFilter;
        } else if (periodPreset === 'today') {
          matchesDate = apt.date === todayStr;
        } else if (periodPreset === 'yesterday') {
          matchesDate = apt.date === yesterdayStr;
        } else if (periodPreset === 'week') {
          matchesDate = apt.date >= sevenDaysAgoStr && apt.date <= todayStr;
        } else if (periodPreset === 'month') {
          matchesDate = apt.date >= thirtyDaysAgoStr && apt.date <= todayStr;
        }

        // Search query filter (Patient, Fisio, Modality, Clinical Evolution, Cancellation Reason)
        const patient = patients.find(p => p.id === apt.patientId);
        const fisio = physiotherapists.find(f => f.id === apt.physiotherapistId);
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query || 
          (patient && patient.name.toLowerCase().includes(query)) ||
          (patient && patient.cpf.includes(query)) ||
          (patient && patient.phone.includes(query)) ||
          (patient && patient.chiefComplaint.toLowerCase().includes(query)) ||
          (fisio && fisio.name.toLowerCase().includes(query)) ||
          (fisio && fisio.specialty.toLowerCase().includes(query)) ||
          apt.modality.toLowerCase().includes(query) ||
          apt.room.toLowerCase().includes(query) ||
          (apt.cancellationReason && apt.cancellationReason.toLowerCase().includes(query)) ||
          (apt.clinicalEvolution && apt.clinicalEvolution.toLowerCase().includes(query)) ||
          (apt.notes && apt.notes.toLowerCase().includes(query));

        return matchesFisio && matchesStatus && matchesDate && matchesSearch;
      })
      .sort((a, b) => {
        // Sort descending by date, then by time
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.startTime.localeCompare(a.startTime);
      });
  }, [
    appointments, 
    selectedFisioId, 
    selectedTabFilter, 
    dateFilter, 
    periodPreset, 
    searchQuery, 
    patients, 
    physiotherapists,
    todayStr,
    yesterdayStr,
    sevenDaysAgoStr,
    thirtyDaysAgoStr
  ]);

  // Handle Cancel Submission
  const handleConfirmCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelingAppointmentId) return;
    const reason = cancellationReasonInput.trim() || 'Cancelamento solicitado pelo paciente.';
    onUpdateStatus(cancelingAppointmentId, 'cancelado', reason);
    setCancelingAppointmentId(null);
    setCancellationReasonInput('');
  };

  // Open Edit Evolution Modal
  const handleOpenEvolutionModal = (apt: Appointment) => {
    setEditingEvolutionAppointment(apt);
    setClinicalEvolutionInput(apt.clinicalEvolution || '');
    setDurationMinutesInput(apt.attendedDurationMinutes || 50);
    setSessionNotesInput(apt.notes || '');
  };

  // Save Clinical Evolution
  const handleSaveClinicalEvolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvolutionAppointment) return;

    const updated: Appointment = {
      ...editingEvolutionAppointment,
      clinicalEvolution: clinicalEvolutionInput.trim(),
      attendedDurationMinutes: Number(durationMinutesInput) || 50,
      notes: sessionNotesInput.trim(),
      status: 'concluido' // Mark as completed when saving clinical evolution
    };

    if (onUpdateAppointment) {
      onUpdateAppointment(updated);
    } else {
      onUpdateStatus(
        updated.id, 
        'concluido', 
        undefined, 
        updated.clinicalEvolution, 
        updated.notes
      );
    }

    if (selectedAppointmentDetail?.id === updated.id) {
      setSelectedAppointmentDetail(updated);
    }

    setEditingEvolutionAppointment(null);
  };

  // Helper for status badge styling
  const renderStatusTag = (status: AppointmentStatus) => {
    switch (status) {
      case 'agendado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-amber-600" /> Agendado
          </span>
        );
      case 'checkin_realizado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-teal-600" /> Na Recepção
          </span>
        );
      case 'em_atendimento':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
            <Activity className="w-3 h-3 text-sky-600 animate-pulse" /> Em Atendimento
          </span>
        );
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Já Feito / Concluído
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-md">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Cancelado
          </span>
        );
      case 'falta':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md">
            <AlertCircle className="w-3 h-3 text-slate-500" /> Falta (No-Show)
          </span>
        );
      default:
        return null;
    }
  };

  // Export CSV of the filtered history
  const handleExportHistoryCSV = () => {
    const headers = [
      'Data',
      'Horario Previsto',
      'Paciente',
      'CPF',
      'Telefone',
      'Plano',
      'Queixa Clinica',
      'Fisioterapeuta Determinado',
      'Especialidade',
      'CREFITO',
      'Modalidade',
      'Sala',
      'Status',
      'Checkin Registrado',
      'Duracao (min)',
      'Evolucao Clinica Detalhada',
      'Motivo do Cancelamento',
      'Cancelado Em'
    ];

    const rows = filteredAppointments.map(a => {
      const pat = patients.find(p => p.id === a.patientId);
      const fis = physiotherapists.find(f => f.id === a.physiotherapistId);
      return [
        a.date,
        `${a.startTime}-${a.endTime}`,
        `"${pat?.name || 'N/A'}"`,
        `"${pat?.cpf || '-'}"`,
        `"${pat?.phone || '-'}"`,
        `"${pat?.plan || '-'}"`,
        `"${(pat?.chiefComplaint || '-').replace(/"/g, '""')}"`,
        `"${fis?.name || 'N/A'}"`,
        `"${fis?.specialty || '-'}"`,
        `"${fis?.crefito || '-'}"`,
        `"${a.modality}"`,
        `"${a.room}"`,
        a.status,
        a.checkinTime ? new Date(a.checkinTime).toLocaleTimeString('pt-BR') : '-',
        a.attendedDurationMinutes || (a.status === 'concluido' ? '50' : '-'),
        `"${(a.clinicalEvolution || a.notes || '-').replace(/"/g, '""')}"`,
        `"${(a.cancellationReason || '-').replace(/"/g, '""')}"`,
        a.canceledAt ? `"${new Date(a.canceledAt).toLocaleString('pt-BR')}"` : '-'
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historico_detalhado_atendimentos_zani_${selectedTabFilter}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 uppercase tracking-wider mb-1">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Consultas & Atendimentos</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500 font-normal normal-case">Prontuário & Histórico Clínico Geral</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Histórico Completo de Atendimentos
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Acompanhe detalhadamente todas as sessões <strong>já feitas</strong> (com evolução clínica e duração) e os atendimentos <strong>cancelados</strong> (com justificativas detalhadas e motivos declarados).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportHistoryCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shadow-2xs"
            title="Baixar planilha CSV com histórico completo, evoluções e motivos de cancelamento"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Exportar Planilha (CSV)</span>
            <span className="sm:hidden">Exportar</span>
          </button>

          <button
            onClick={() => onOpenNewAppointment(selectedFisioId !== 'all' ? selectedFisioId : undefined)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Consulta</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip — Clickable Quick Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total */}
        <div 
          onClick={() => setSelectedTabFilter('all')}
          className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
            selectedTabFilter === 'all' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <span className={`text-[11px] font-semibold block ${selectedTabFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
            Total Registrado
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-bold font-mono tabular-nums ${selectedTabFilter === 'all' ? 'text-white' : 'text-slate-900'}`}>
              {totalCount}
            </span>
            <span className={`text-[10px] ${selectedTabFilter === 'all' ? 'text-slate-400' : 'text-slate-400'}`}>atendimentos</span>
          </div>
        </div>

        {/* Feitos / Concluidos */}
        <div 
          onClick={() => setSelectedTabFilter('concluido')}
          className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
            selectedTabFilter === 'concluido' 
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold block ${selectedTabFilter === 'concluido' ? 'text-emerald-100' : 'text-emerald-800'}`}>
              Já Feitos / Concluídos
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${selectedTabFilter === 'concluido' ? 'text-emerald-200' : 'text-emerald-600'}`} />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-bold font-mono tabular-nums ${selectedTabFilter === 'concluido' ? 'text-white' : 'text-emerald-700'}`}>
              {completedCount}
            </span>
            <span className={`text-[10px] font-medium ${selectedTabFilter === 'concluido' ? 'text-emerald-200' : 'text-emerald-600'}`}>
              {totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}% das sessões` : '0%'}
            </span>
          </div>
        </div>

        {/* Cancelados */}
        <div 
          onClick={() => setSelectedTabFilter('cancelado')}
          className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
            selectedTabFilter === 'cancelado' 
              ? 'bg-rose-800 text-white border-rose-900 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-rose-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold block ${selectedTabFilter === 'cancelado' ? 'text-rose-100' : 'text-rose-800'}`}>
              Cancelados
            </span>
            <XCircle className={`w-3.5 h-3.5 ${selectedTabFilter === 'cancelado' ? 'text-rose-200' : 'text-rose-600'}`} />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-bold font-mono tabular-nums ${selectedTabFilter === 'cancelado' ? 'text-white' : 'text-rose-700'}`}>
              {canceledCount}
            </span>
            <span className={`text-[10px] font-medium ${selectedTabFilter === 'cancelado' ? 'text-rose-200' : 'text-rose-600'}`}>
              com justificativa
            </span>
          </div>
        </div>

        {/* Faltas */}
        <div 
          onClick={() => setSelectedTabFilter('falta')}
          className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
            selectedTabFilter === 'falta' 
              ? 'bg-slate-700 text-white border-slate-800 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold block ${selectedTabFilter === 'falta' ? 'text-slate-300' : 'text-slate-600'}`}>
              Faltas (No-Show)
            </span>
            <AlertCircle className={`w-3.5 h-3.5 ${selectedTabFilter === 'falta' ? 'text-slate-300' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-bold font-mono tabular-nums ${selectedTabFilter === 'falta' ? 'text-white' : 'text-slate-700'}`}>
              {noShowCount}
            </span>
            <span className={`text-[10px] ${selectedTabFilter === 'falta' ? 'text-slate-300' : 'text-slate-400'}`}>sem aviso prévio</span>
          </div>
        </div>

        {/* Agendados */}
        <div 
          onClick={() => setSelectedTabFilter('agendado')}
          className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
            selectedTabFilter === 'agendado' 
              ? 'bg-teal-800 text-white border-teal-900 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold block ${selectedTabFilter === 'agendado' ? 'text-teal-100' : 'text-teal-800'}`}>
              Agendados / Futuros
            </span>
            <Clock className={`w-3.5 h-3.5 ${selectedTabFilter === 'agendado' ? 'text-teal-200' : 'text-teal-600'}`} />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-bold font-mono tabular-nums ${selectedTabFilter === 'agendado' ? 'text-white' : 'text-teal-800'}`}>
              {scheduledCount}
            </span>
            <span className={`text-[10px] font-medium ${selectedTabFilter === 'agendado' ? 'text-teal-200' : 'text-teal-600'}`}>em escala</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3.5">
        {/* Row 1: Search & Period Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="relative lg:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por paciente, CPF, fisioterapeuta, evolução clínica ou motivo do cancelamento..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Period Shortcuts */}
          <div className="lg:col-span-4 flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'today', label: 'Hoje' },
              { key: 'yesterday', label: 'Ontem' },
              { key: 'week', label: 'Últimos 7d' },
              { key: 'month', label: 'Últimos 30d' }
            ].map(p => (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  setPeriodPreset(p.key as any);
                  setDateFilter('');
                }}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  periodPreset === p.key && !dateFilter
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <div className="lg:col-span-2 flex items-center gap-1.5">
            <input
              type="date"
              value={dateFilter}
              onChange={e => {
                setDateFilter(e.target.value);
                setPeriodPreset('all');
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="p-1.5 text-slate-500 hover:text-slate-700 bg-slate-100 rounded-md"
                title="Limpar data exata"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Status View Tabs, Physiotherapist Filter & View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedTabFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedTabFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 bg-slate-100 hover:text-slate-900'
              }`}
            >
              Todos ({totalCount})
            </button>
            <button
              onClick={() => setSelectedTabFilter('concluido')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedTabFilter === 'concluido'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Já Feitos / Concluídos ({completedCount})</span>
            </button>
            <button
              onClick={() => setSelectedTabFilter('cancelado')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedTabFilter === 'cancelado'
                  ? 'bg-rose-800 text-white shadow-2xs'
                  : 'text-rose-800 bg-rose-50 hover:bg-rose-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancelados ({canceledCount})</span>
            </button>
            <button
              onClick={() => setSelectedTabFilter('falta')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedTabFilter === 'falta'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Faltas ({noShowCount})</span>
            </button>
            <button
              onClick={() => setSelectedTabFilter('agendado')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedTabFilter === 'agendado'
                  ? 'bg-teal-800 text-white shadow-2xs'
                  : 'text-teal-800 bg-teal-50 hover:bg-teal-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Agendados ({scheduledCount})</span>
            </button>
          </div>

          {/* Right controls: Physiotherapist Selector & View Mode Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Physiotherapist Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Fisioterapeuta:
              </span>
              <select
                value={selectedFisioId}
                onChange={e => setSelectedFisioId(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium max-w-[200px]"
              >
                <option value="all">Todos os Profissionais</option>
                {physiotherapists.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.specialty})
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-2xs text-teal-800' : 'text-slate-500 hover:text-slate-700'}`}
                title="Visualização em Tabela Detalhada"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white shadow-2xs text-teal-800' : 'text-slate-500 hover:text-slate-700'}`}
                title="Visualização em Linha do Tempo / Cards Clínicos"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Subheader Title */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              {selectedTabFilter === 'concluido' ? 'Histórico de Atendimentos Já Feitos' :
               selectedTabFilter === 'cancelado' ? 'Histórico de Atendimentos Cancelados' :
               selectedTabFilter === 'falta' ? 'Histórico de Faltas Registradas' :
               selectedTabFilter === 'agendado' ? 'Consultas Agendadas na Escala' :
               'Histórico Completo de Consultas e Atendimentos'}
            </span>
            <span className="text-[11px] font-mono tabular-nums text-teal-800 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-full font-semibold">
              {filteredAppointments.length} registro(s)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            {periodPreset !== 'all' && !dateFilter && (
              <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                Filtro: {periodPreset === 'today' ? 'Hoje' : periodPreset === 'yesterday' ? 'Ontem' : periodPreset === 'week' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
              </span>
            )}
            {dateFilter && (
              <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md font-mono tabular-nums">
                Data: {new Date(`${dateFilter}T00:00:00`).toLocaleDateString('pt-BR')}
              </span>
            )}
            <span className="hidden md:inline text-slate-400">· Ordem decrescente por data</span>
          </div>
        </div>

        {/* Empty State */}
        {appointments.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Nenhuma Consulta Agendada</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              O banco de dados está limpo para os primeiros testes reais. Cadastre um paciente e agende a primeira sessão no estúdio.
            </p>
            <button
              onClick={() => onOpenNewAppointment()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Primeira Consulta</span>
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-16 text-center px-4">
            <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Nenhum atendimento localizado para estes filtros.</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Experimente selecionar outra aba de status, limpar os termos de busca ou mudar o período selecionado.
            </p>
            <button
              onClick={() => {
                setSelectedTabFilter('all');
                setSelectedFisioId('all');
                setSearchQuery('');
                setDateFilter('');
                setPeriodPreset('all');
              }}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Redefinir Filtros</span>
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Data & Horário</th>
                  <th className="py-3 px-4">Paciente & Contato</th>
                  <th className="py-3 px-4">Fisioterapeuta Determinado</th>
                  <th className="py-3 px-4">Modalidade / Sala</th>
                  <th className="py-3 px-4 min-w-[280px]">Status & Registro Clínico / Cancelamento</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map(apt => {
                  const patient = patients.find(p => p.id === apt.patientId);
                  const fisio = physiotherapists.find(f => f.id === apt.physiotherapistId);

                  const isConcluido = apt.status === 'concluido';
                  const isCancelado = apt.status === 'cancelado';
                  const isFalta = apt.status === 'falta';

                  return (
                    <tr 
                      key={apt.id} 
                      className={`hover:bg-slate-50/90 transition-colors ${
                        isCancelado ? 'bg-rose-50/20' : isConcluido ? 'bg-emerald-50/15' : isFalta ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      {/* Date & Time */}
                      <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap align-top">
                        <div className="font-bold text-slate-900 text-xs">
                          {new Date(`${apt.date}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{apt.startTime} - {apt.endTime}</span>
                        </div>
                        {apt.checkinTime && (
                          <div className="text-[10px] text-teal-700 font-semibold mt-1 flex items-center gap-1 bg-teal-50 px-1.5 py-0.5 rounded-sm w-fit border border-teal-100">
                            <Check className="w-2.5 h-2.5" />
                            <span>Chegada: {new Date(apt.checkinTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                        {isConcluido && apt.attendedDurationMinutes && (
                          <div className="text-[10px] text-emerald-700 mt-0.5">
                            Duração: {apt.attendedDurationMinutes} min
                          </div>
                        )}
                      </td>

                      {/* Patient */}
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-start gap-2">
                          {patient?.avatar ? (
                            <img
                              src={patient.avatar}
                              alt={patient.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-800 font-bold text-[10px] flex items-center justify-center border border-teal-200 shrink-0 mt-0.5">
                              {patient?.name ? patient.name.charAt(0) : 'P'}
                            </div>
                          )}
                          <div>
                            <button
                              onClick={() => patient && onSelectPatient(patient.id)}
                              className="font-bold text-slate-900 hover:text-teal-800 hover:underline text-left block text-xs"
                              title="Clique para abrir prontuário geral deste paciente"
                            >
                              {patient?.name || 'Paciente'}
                            </button>
                            <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                              {patient?.phone || '-'}
                            </div>
                            {patient?.plan && (
                              <div className="mt-1">
                                <PlanBadge plan={patient.plan} partnerId={patient.partnerId} showDetails={false} size="sm" />
                              </div>
                            )}
                            {patient?.chiefComplaint && (
                              <div className="text-[10px] text-slate-500 line-clamp-1 mt-1" title={patient.chiefComplaint}>
                                <span className="font-semibold text-slate-600">Queixa:</span> {patient.chiefComplaint}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Designated Physiotherapist */}
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {fisio?.avatar ? (
                            <img
                              src={fisio.avatar}
                              alt={fisio.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {fisio?.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-slate-900 block text-xs">
                              {fisio?.name || 'Fisioterapeuta'}
                            </span>
                            <span className="text-[10px] text-teal-800 font-medium block">
                              {fisio?.specialty}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono tabular-nums block">
                              {fisio?.crefito}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Modality & Room */}
                      <td className="py-3 px-4 align-top">
                        <span className="font-semibold text-slate-800 block text-xs">
                          {apt.modality}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{apt.room}</span>
                        </span>
                      </td>

                      {/* Status & Detailed Clinical Record / Cancellation */}
                      <td className="py-3 px-4 align-top">
                        <div className="mb-1.5 flex items-center gap-1.5">
                          {renderStatusTag(apt.status)}
                        </div>

                        {/* For Completed: Display Clinical Evolution */}
                        {isConcluido && (
                          <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-950 space-y-1">
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Evolução Clínica da Sessão
                              </span>
                              {apt.attendedDurationMinutes && (
                                <span className="font-mono lowercase text-emerald-700 font-semibold">{apt.attendedDurationMinutes} min</span>
                              )}
                            </div>
                            <p className="line-clamp-3 text-[11px] leading-relaxed text-slate-800 font-normal">
                              {apt.clinicalEvolution || apt.notes || 'Sessão concluída com sucesso conforme plano de tratamento postural.'}
                            </p>
                          </div>
                        )}

                        {/* For Canceled: Display Cancellation Reason */}
                        {isCancelado && (
                          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-950 space-y-1">
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-rose-800 tracking-wider">
                              <span className="flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-rose-600" /> Motivo do Cancelamento
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-rose-950 font-medium">
                              {apt.cancellationReason || 'Cancelamento solicitado previamente pelo paciente.'}
                            </p>
                            {apt.canceledAt && (
                              <div className="text-[10px] text-rose-700 font-mono tabular-nums pt-0.5">
                                Protocolado em: {new Date(apt.canceledAt).toLocaleDateString('pt-BR')} às {new Date(apt.canceledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* For No-Show */}
                        {isFalta && (
                          <div className="p-2 bg-slate-100 border border-slate-200 rounded-md text-[11px] text-slate-700">
                            <span className="font-semibold text-slate-800">No-show: </span>
                            {apt.cancellationReason || 'Paciente não compareceu no horário estabelecido e não enviou aviso prévio.'}
                          </div>
                        )}

                        {/* For Scheduled / In Attendance */}
                        {!isConcluido && !isCancelado && !isFalta && (
                          <div className="text-[11px] text-slate-600 space-y-0.5">
                            {apt.notes ? (
                              <div className="italic text-slate-500">Obs: {apt.notes}</div>
                            ) : (
                              <div className="text-slate-400">Sessão agendada na escala do profissional.</div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Quick Actions & Detail Button */}
                      <td className="py-3 px-4 text-right whitespace-nowrap align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAppointmentDetail(apt)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors"
                            title="Ver ficha completa do atendimento"
                          >
                            Ver Ficha
                          </button>

                          {/* Action for Concluido: Edit Evolution */}
                          {isConcluido && (
                            <button
                              onClick={() => handleOpenEvolutionModal(apt)}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                              title="Editar evolução clínica ou adicionar observações"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}

                          {/* Action for Cancelado: Reschedule */}
                          {isCancelado && (
                            <button
                              onClick={() => onOpenNewAppointment(apt.physiotherapistId, undefined, undefined, apt.patientId)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors flex items-center gap-1"
                              title="Reagendar esta sessão cancelada"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reagendar</span>
                            </button>
                          )}

                          {/* Action for Agendado: Checkin / Cancel */}
                          {apt.status === 'agendado' && (
                            <>
                              <button
                                onClick={() => onUpdateStatus(apt.id, 'checkin_realizado')}
                                className="px-2 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors"
                                title="Confirmar chegada na recepção"
                              >
                                Check-in
                              </button>

                              <button
                                onClick={() => setCancelingAppointmentId(apt.id)}
                                className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
                                title="Registrar cancelamento com motivo"
                              >
                                Cancelar
                              </button>
                            </>
                          )}

                          {/* Action for Checkin realizado: Start */}
                          {apt.status === 'checkin_realizado' && (
                            <button
                              onClick={() => onUpdateStatus(apt.id, 'em_atendimento')}
                              className="px-2 py-1 text-[11px] font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors"
                            >
                              Iniciar
                            </button>
                          )}

                          {/* Action for Em atendimento: Complete and open evolution */}
                          {apt.status === 'em_atendimento' && (
                            <button
                              onClick={() => handleOpenEvolutionModal(apt)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <Check className="w-3 h-3" />
                              <span>Concluir</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards / Timeline View */
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAppointments.map(apt => {
              const patient = patients.find(p => p.id === apt.patientId);
              const fisio = physiotherapists.find(f => f.id === apt.physiotherapistId);

              const isConcluido = apt.status === 'concluido';
              const isCancelado = apt.status === 'cancelado';
              const isFalta = apt.status === 'falta';

              return (
                <div 
                  key={apt.id}
                  className={`rounded-xl border p-4.5 space-y-3 transition-all ${
                    isCancelado 
                      ? 'bg-rose-50/20 border-rose-200' 
                      : isConcluido 
                        ? 'bg-emerald-50/20 border-emerald-200' 
                        : isFalta 
                          ? 'bg-slate-50 border-slate-300' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Top: Date & Status */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="font-bold text-slate-900 text-sm font-mono tabular-nums flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(`${apt.date}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono tabular-nums">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{apt.startTime} às {apt.endTime}</span>
                        {apt.checkinTime && (
                          <span className="text-teal-700 ml-1">· Chegada: {new Date(apt.checkinTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </div>
                    {renderStatusTag(apt.status)}
                  </div>

                  {/* Patient & Fisio Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Patient Column */}
                    <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Paciente
                      </span>
                      <button
                        onClick={() => patient && onSelectPatient(patient.id)}
                        className="font-bold text-slate-900 hover:text-teal-800 hover:underline block text-xs truncate mt-0.5 text-left w-full"
                      >
                        {patient?.name || 'Paciente'}
                      </button>
                      <div className="mt-1">
                        <PlanBadge plan={patient?.plan || 'Pilates 2x/semana'} partnerId={patient?.partnerId} showDetails={false} size="sm" />
                      </div>
                      {patient?.phone && (
                        <span className="text-[10px] text-slate-500 font-mono tabular-nums block mt-0.5">
                          {patient.phone}
                        </span>
                      )}
                    </div>

                    {/* Fisio Column */}
                    <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Fisioterapeuta
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {fisio?.avatar && (
                          <img src={fisio.avatar} alt={fisio.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                        )}
                        <span className="font-semibold text-slate-900 text-xs truncate">
                          {fisio?.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-teal-800 truncate block mt-0.5">
                        {fisio?.specialty}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono tabular-nums block">
                        {fisio?.crefito}
                      </span>
                    </div>
                  </div>

                  {/* Modality & Room */}
                  <div className="text-xs flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg">
                    <span className="font-semibold text-slate-800">{apt.modality}</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {apt.room}
                    </span>
                  </div>

                  {/* Specific Status Block */}
                  {isConcluido && (
                    <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-[10px] uppercase text-emerald-800 tracking-wider">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Relatório Clínico da Sessão
                        </span>
                        {apt.attendedDurationMinutes && <span>{apt.attendedDurationMinutes} min</span>}
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-normal">
                        {apt.clinicalEvolution || apt.notes || 'Sessão realizada com sucesso.'}
                      </p>
                    </div>
                  )}

                  {isCancelado && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                      <span className="font-bold text-[10px] uppercase text-rose-800 tracking-wider flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-600" /> Justificativa do Cancelamento
                      </span>
                      <p className="text-xs font-semibold text-rose-950 leading-relaxed">
                        {apt.cancellationReason || 'Cancelamento solicitado previamente.'}
                      </p>
                      {apt.canceledAt && (
                        <span className="text-[10px] text-rose-700 font-mono tabular-nums block">
                          Registrado em: {new Date(apt.canceledAt).toLocaleDateString('pt-BR')} às {new Date(apt.canceledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  )}

                  {isFalta && (
                    <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700">
                      <strong>Ausência (Falta):</strong> {apt.cancellationReason || 'Paciente não compareceu ao estúdio sem justificativa.'}
                    </div>
                  )}

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => setSelectedAppointmentDetail(apt)}
                      className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1"
                    >
                      <span>Ver Ficha Completa</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {isCancelado && (
                        <button
                          onClick={() => onOpenNewAppointment(apt.physiotherapistId, undefined, undefined, apt.patientId)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reagendar</span>
                        </button>
                      )}

                      {isConcluido && (
                        <button
                          onClick={() => handleOpenEvolutionModal(apt)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar Evolução</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Full Detailed Session Sheet (Ficha Completa de Atendimento) */}
      {selectedAppointmentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Ficha de Atendimento Clínico & Histórico
                  </h3>
                  {renderStatusTag(selectedAppointmentDetail.status)}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                  ID: #{selectedAppointmentDetail.id} · Data: {selectedAppointmentDetail.date} ({selectedAppointmentDetail.startTime} às {selectedAppointmentDetail.endTime})
                </p>
              </div>

              <button
                onClick={() => setSelectedAppointmentDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient & Physiotherapist Cards */}
            {(() => {
              const p = patients.find(pat => pat.id === selectedAppointmentDetail.patientId);
              const f = physiotherapists.find(fis => fis.id === selectedAppointmentDetail.physiotherapistId);

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Patient Card */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px] mb-1">
                      Paciente / Aluno
                    </span>
                    <button
                      onClick={() => {
                        if (p) {
                          setSelectedAppointmentDetail(null);
                          onSelectPatient(p.id);
                        }
                      }}
                      className="font-bold text-slate-900 hover:text-teal-800 hover:underline text-sm block text-left"
                    >
                      {p?.name || 'Paciente'}
                    </button>
                    <span className="text-teal-800 font-semibold block mt-0.5">
                      {p?.plan || 'Pilates'}
                    </span>
                    <div className="text-slate-500 mt-2 space-y-0.5 text-[11px]">
                      <div>Telefone: {p?.phone || '-'}</div>
                      {p?.cpf && <div className="font-mono tabular-nums">CPF: {p.cpf}</div>}
                      {p?.chiefComplaint && (
                        <div className="text-slate-700 mt-1">
                          <strong>Queixa clínica:</strong> {p.chiefComplaint}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Physiotherapist Card */}
                  <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200">
                    <span className="font-bold text-teal-800 block uppercase tracking-wider text-[10px] mb-1">
                      Fisioterapeuta Determinado
                    </span>
                    <div className="flex items-center gap-2.5">
                      {f?.avatar && (
                        <img
                          src={f.avatar}
                          alt={f.name}
                          className="w-10 h-10 rounded-full object-cover border border-teal-200 shrink-0"
                        />
                      )}
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          {f?.name || 'Fisioterapeuta'}
                        </span>
                        <span className="text-teal-800 font-medium block text-[11px]">
                          {f?.specialty}
                        </span>
                        <span className="text-slate-500 font-mono tabular-nums text-[10px] block">
                          {f?.crefito}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-teal-200/60 text-[11px] text-slate-600">
                      <div><strong>Local:</strong> {selectedAppointmentDetail.room}</div>
                      <div><strong>Modalidade:</strong> {selectedAppointmentDetail.modality}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Context Block based on Status */}
            {selectedAppointmentDetail.status === 'concluido' && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Relatório de Evolução da Sessão Realizada</span>
                  </div>
                  <button
                    onClick={() => handleOpenEvolutionModal(selectedAppointmentDetail)}
                    className="text-[11px] text-emerald-800 font-semibold underline hover:text-emerald-900"
                  >
                    Editar Anotações
                  </button>
                </div>
                <p className="text-slate-800 text-xs leading-relaxed bg-white p-3 rounded-lg border border-emerald-100">
                  {selectedAppointmentDetail.clinicalEvolution || selectedAppointmentDetail.notes || 'Sessão concluída integralmente de acordo com as metas posturais e terapêuticas.'}
                </p>
                <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-1 font-mono tabular-nums">
                  <span>Duração: {selectedAppointmentDetail.attendedDurationMinutes || 50} minutos</span>
                  {selectedAppointmentDetail.checkinTime && (
                    <span>Presença confirmada às {new Date(selectedAppointmentDetail.checkinTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>
              </div>
            )}

            {selectedAppointmentDetail.status === 'cancelado' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs uppercase tracking-wider">
                  <XCircle className="w-4 h-4 text-rose-700" />
                  <span>Justificativa de Cancelamento</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-rose-100 text-slate-800 text-xs">
                  <span className="font-semibold text-rose-900 block mb-0.5">Motivo declarado:</span>
                  <p className="leading-relaxed">
                    {selectedAppointmentDetail.cancellationReason || 'Cancelamento comunicado previamente pelo paciente.'}
                  </p>
                </div>
                {selectedAppointmentDetail.canceledAt && (
                  <span className="text-[11px] text-rose-700 block font-mono tabular-nums">
                    Cancelamento homologado em {new Date(selectedAppointmentDetail.canceledAt).toLocaleDateString('pt-BR')} às {new Date(selectedAppointmentDetail.canceledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            )}

            {selectedAppointmentDetail.status === 'falta' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-slate-600" />
                  <span>Ausência Sem Aviso Prévio</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  O paciente não compareceu à sessão no horário determinado e não respondeu aos contatos da recepção. Horário computado na frequência mensal do plano.
                </p>
              </div>
            )}

            {selectedAppointmentDetail.notes && selectedAppointmentDetail.status !== 'concluido' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">
                  Observações Gerais
                </span>
                <p className="text-slate-700">{selectedAppointmentDetail.notes}</p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ficha</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedAppointmentDetail.status === 'cancelado' && (
                  <button
                    onClick={() => {
                      const fisId = selectedAppointmentDetail.physiotherapistId;
                      const patId = selectedAppointmentDetail.patientId;
                      setSelectedAppointmentDetail(null);
                      onOpenNewAppointment(fisId, undefined, undefined, patId);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reagendar Sessão</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedAppointmentDetail(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit / Add Clinical Evolution */}
      {editingEvolutionAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Registro de Evolução Clínica
                  </h3>
                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    Data: {editingEvolutionAppointment.date} · {editingEvolutionAppointment.modality}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingEvolutionAppointment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClinicalEvolution} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Evolução Clínica & Conduta da Sessão *
                </label>
                <textarea
                  required
                  rows={4}
                  value={clinicalEvolutionInput}
                  onChange={e => setClinicalEvolutionInput(e.target.value)}
                  placeholder="Descreva detalhadamente a evolução do paciente, exercícios nos aparelhos (Reformer, Cadillac, Chair), escala analógica de dor (EVA), resposta motora e orientações posturais..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Duração da Sessão (minutos)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={120}
                    value={durationMinutesInput}
                    onChange={e => setDurationMinutesInput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Observações Administrativas
                  </label>
                  <input
                    type="text"
                    value={sessionNotesInput}
                    onChange={e => setSessionNotesInput(e.target.value)}
                    placeholder="Ex: Sessão avulsa paga na recepção"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Quick Preset evolution snippets */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Sugestões Rápidas de Conduta:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Redução significativa da queixa álgica (EVA -3)',
                    'Exercícios no Reformer com foco em Powerhouse',
                    'Liberação miofascial e crioterapia local',
                    'Ganho de amplitude de movimento sem dor'
                  ].map(snippet => (
                    <button
                      key={snippet}
                      type="button"
                      onClick={() => setClinicalEvolutionInput(prev => prev ? `${prev}. ${snippet}` : snippet)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors"
                    >
                      + {snippet}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEvolutionAppointment(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Salvar Evolução & Concluir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Input Cancellation Reason */}
      {cancelingAppointmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Registrar Cancelamento com Justificativa
                  </h3>
                  <p className="text-xs text-slate-500">
                    Informe o motivo detalhado para arquivamento no histórico clínico.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCancelingAppointmentId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancellation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motivo do Cancelamento *
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancellationReasonInput}
                  onChange={e => setCancellationReasonInput(e.target.value)}
                  placeholder="Ex: Paciente comunicou indisposição de saúde, imprevisto no trânsito, viagem de trabalho, consulta médica de urgência..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                ></textarea>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Motivos Mais Frequentes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Imprevisto corporativo inadiável',
                    'Sintomas gripais / quadro febril',
                    'Viagem a trabalho informada',
                    'Forte temporal / trânsito bloqueado',
                    'Consulta médica de urgência sobreposta'
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCancellationReasonInput(preset)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancelingAppointmentId(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
