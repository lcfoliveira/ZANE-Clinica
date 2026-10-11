import React, { useMemo } from 'react';
import { Appointment, CheckinRecord, Patient, Physiotherapist } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  UserCheck, 
  Users, 
  Calendar, 
  Clock, 
  Download, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getRelativeDate } from '../data/initialData';

interface AnalyticsViewProps {
  today: string;
  appointments: Appointment[];
  patients: Patient[];
  physiotherapists: Physiotherapist[];
  checkins: CheckinRecord[];
  onResetDemo: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  today,
  appointments,
  patients,
  physiotherapists,
  checkins,
  onResetDemo
}) => {
  // Stats calculations
  const totalPatients = patients.length;
  
  // Today's stats
  const todayApts = appointments.filter(a => a.date === today);
  const todayCheckins = checkins.filter(c => c.timestamp.startsWith(today));
  const completedToday = todayApts.filter(a => a.status === 'concluido').length;
  const noShowsToday = todayApts.filter(a => a.status === 'falta').length;

  // Last 7 days attendance trend
  const last7DaysData = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const dateStr = getRelativeDate(-i);
      const dayDate = new Date(`${dateStr}T00:00:00`);
      const dayLabel = dayDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
      
      const dayTotalApts = appointments.filter(a => a.date === dateStr).length;
      const dayCheckins = checkins.filter(c => c.timestamp.startsWith(dateStr)).length;
      
      list.push({
        date: dateStr,
        label: dayLabel,
        totalAppointments: dayTotalApts,
        checkins: dayCheckins
      });
    }
    return list;
  }, [appointments, checkins]);

  const maxCheckinIn7Days = Math.max(...last7DaysData.map(d => Math.max(d.checkins, d.totalAppointments, 1)));

  // Performance per Physiotherapist
  const fisioMetrics = useMemo(() => {
    return physiotherapists.map(f => {
      const assignedPatients = patients.filter(p => p.designatedFisioId === f.id).length;
      const fApts = appointments.filter(a => a.physiotherapistId === f.id);
      const fCheckins = checkins.filter(c => c.physiotherapistId === f.id);
      const completed = fApts.filter(a => a.status === 'concluido').length;
      const noShow = fApts.filter(a => a.status === 'falta').length;
      const attendanceRate = fApts.length > 0 
        ? Math.round(((fCheckins.length || completed) / fApts.length) * 100) 
        : 100;

      return {
        fisio: f,
        assignedPatients,
        totalAppointments: fApts.length,
        completedSessions: completed,
        noShowSessions: noShow,
        attendanceRate: Math.min(attendanceRate, 100)
      };
    });
  }, [physiotherapists, patients, appointments, checkins]);

  // Distribution by Category & Plan
  const planDistribution = useMemo(() => {
    const list = [
      { name: 'Gympass (Wellhub)', key: 'Gympass', count: patients.filter(p => p.plan === 'Gympass').length, color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', isCorporate: true },
      { name: 'TotalPass', key: 'TotalPass', count: patients.filter(p => p.plan === 'TotalPass').length, color: 'bg-sky-600', text: 'text-sky-800', bg: 'bg-sky-50', isCorporate: true },
      { name: 'Pilates 2x/semana', key: 'Pilates 2x/semana', count: patients.filter(p => p.plan === 'Pilates 2x/semana').length, color: 'bg-teal-600', text: 'text-teal-800', bg: 'bg-teal-50' },
      { name: 'Pilates 3x/semana', key: 'Pilates 3x/semana', count: patients.filter(p => p.plan === 'Pilates 3x/semana').length, color: 'bg-teal-800', text: 'text-teal-900', bg: 'bg-teal-50' },
      { name: 'Reabilitação Intensiva', key: 'Reabilitação Intensiva', count: patients.filter(p => p.plan === 'Reabilitação Intensiva').length, color: 'bg-indigo-600', text: 'text-indigo-800', bg: 'bg-indigo-50' },
      { name: 'Sessão Avulsa', key: 'Sessão Avulsa', count: patients.filter(p => p.plan === 'Sessão Avulsa').length, color: 'bg-amber-600', text: 'text-amber-800', bg: 'bg-amber-50' },
      { name: 'Atendimento Domiciliar', key: 'Atendimento Domiciliar', count: patients.filter(p => p.plan === 'Atendimento Domiciliar').length, color: 'bg-purple-600', text: 'text-purple-800', bg: 'bg-purple-50' }
    ];
    return list.filter(item => item.count > 0);
  }, [patients]);

  const corporatePatientsCount = useMemo(() => {
    return patients.filter(p => p.plan === 'Gympass' || p.plan === 'TotalPass').length;
  }, [patients]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Data', 'Horario', 'Paciente', 'Categoria/Plano', 'Fisioterapeuta', 'Modalidade', 'Sala', 'Status', 'Checkin'];
    const rows = appointments.map(a => {
      const pat = patients.find(p => p.id === a.patientId);
      const patName = pat?.name || 'N/A';
      const patPlan = pat?.plan || 'Pilates';
      const fis = physiotherapists.find(f => f.id === a.physiotherapistId)?.name || 'N/A';
      return [
        a.date,
        `${a.startTime}-${a.endTime}`,
        `"${patName}"`,
        `"${patPlan}"`,
        `"${fis}"`,
        `"${a.modality}"`,
        `"${a.room}"`,
        a.status,
        a.checkinTime ? new Date(a.checkinTime).toLocaleTimeString('pt-BR') : '-'
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_zane_studio_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Gestão Clínica</span>
            <span aria-hidden="true">·</span>
            <span>Métricas Operacionais</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Indicadores & Presença Clínica
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Acompanhe o volume de check-ins diários, assiduidade de pacientes e taxa de ocupação por fisioterapeuta determinado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Deseja realmente limpar todos os dados cadastrados e reiniciar do zero?')) {
                onResetDemo();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            title="Limpar todos os dados e reiniciar do zero"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zerar Todos os Dados</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Alunos & Pacientes Ativos</span>
            <Users className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalPatients}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cadastrados no estúdio</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Check-ins de Hoje</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {todayCheckins.length}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">Presenças confirmadas hoje</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Consultas Programadas</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {todayApts.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Sessões na grade de hoje</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Assiduidade Geral</span>
            <TrendingUp className="w-4 h-4 text-teal-800" />
          </div>
          <div className="text-2xl font-bold text-teal-800 font-mono tabular-nums">
            {todayApts.length > 0 ? Math.round((todayCheckins.length / todayApts.length) * 100) : 100}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Comparecimento no horário</p>
        </div>
      </div>

      {/* Grid: 7-Day Chart + Physiotherapist Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Histórico de Comparecimento (Últimos 7 Dias)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Número diário de presenças e sessões concluídas
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                {checkins.length} check-ins totais
              </span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
              {last7DaysData.map(d => {
                const heightPercent = Math.max(Math.round((d.checkins / maxCheckinIn7Days) * 100), 8);
                const isToday = d.date === today;

                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-mono font-bold text-slate-700 tabular-nums">
                      {d.checkins}
                    </span>

                    <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end justify-center p-1">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all ${
                          isToday ? 'bg-teal-700 shadow-xs' : 'bg-teal-600/70 group-hover:bg-teal-600'
                        }`}
                      ></div>
                    </div>

                    <span className={`text-[10px] capitalize whitespace-nowrap font-medium ${isToday ? 'font-bold text-teal-900' : 'text-slate-500'}`}>
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-700"></span>
              Presenças confirmadas no check-in
            </span>
            <span className="font-mono tabular-nums">
              Média: {(checkins.length / 7).toFixed(1)}/dia
            </span>
          </div>
        </div>

        {/* Breakdown by Physiotherapist */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Atendimento por Fisioterapeuta Determinado
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Carga horária e taxa de presença individual
              </p>
            </div>
            <UserCheck className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4">
            {fisioMetrics.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Nenhum fisioterapeuta cadastrado ainda.
              </div>
            ) : (
              fisioMetrics.map(item => {
                return (
                  <div key={item.fisio.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.fisio.avatar}
                          alt={item.fisio.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{item.fisio.name}</h4>
                          <span className="text-[10px] text-slate-500">{item.fisio.specialty}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-teal-800 font-mono tabular-nums">
                          {item.attendanceRate}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">comparecimento</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                      <div
                        style={{ width: `${item.attendanceRate}%` }}
                        className="h-full bg-teal-700 rounded-full"
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono tabular-nums">
                      <span>{item.assignedPatients} pacientes fixos</span>
                      <span>{item.totalAppointments} sessões agendadas</span>
                      <span>{item.completedSessions} concluídas</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Breakdown by Patient Category & Corporate Plans */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-700"></span>
              <span>Distribuição de Pacientes por Categoria & Convênio</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Volume de alunos distribuídos entre convênios corporativos (Gympass e TotalPass) e planos diretos do estúdio.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200/80">
              Convênios Parceiros: {corporatePatientsCount} ({totalPatients > 0 ? Math.round((corporatePatientsCount / totalPatients) * 100) : 0}%)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 font-semibold border border-teal-200/80">
              Planos do Studio: {totalPatients - corporatePatientsCount} ({totalPatients > 0 ? Math.round(((totalPatients - corporatePatientsCount) / totalPatients) * 100) : 0}%)
            </span>
          </div>
        </div>

        {planDistribution.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Nenhum paciente cadastrado ainda para cálculo de distribuição por categoria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {planDistribution.map(cat => {
              const percentage = totalPatients > 0 ? Math.round((cat.count / totalPatients) * 100) : 0;
              return (
                <div 
                  key={cat.key} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    cat.isCorporate ? `${cat.bg} border-slate-200/90 shadow-2xs` : 'bg-slate-50/60 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></span>
                      <span className={`text-xs font-bold ${cat.isCorporate ? cat.text : 'text-slate-900'}`}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-800 tabular-nums">
                      {cat.count} {cat.count === 1 ? 'aluno' : 'alunos'}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden mb-2">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`h-full rounded-full transition-all ${cat.color}`}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{cat.isCorporate ? 'Benefício Corporativo' : 'Plano Studio'}</span>
                    <span className="font-semibold text-slate-700">{percentage}% da base</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
