import React from 'react';
import zaniLogo from '../assets/images/zani_studio_logo_1790571397465.jpg';
import { TabKey } from '../types';
import { 
  CheckCircle2, 
  Calendar, 
  CalendarDays, 
  Users, 
  UserCheck, 
  BarChart3, 
  MonitorSmartphone, 
  Plus,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenNewAppointment: () => void;
  onOpenTotem: () => void;
  todayCheckinCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewAppointment,
  onOpenTotem,
  todayCheckinCount
}) => {
  const navItems: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'checkin', label: 'Check-in Recepção', icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'agenda', label: 'Consultas & Atendimentos', icon: <Calendar className="w-4 h-4" /> },
    { key: 'horarios', label: 'Grade por Fisioterapeuta', icon: <CalendarDays className="w-4 h-4" /> },
    { key: 'pacientes', label: 'Pacientes', icon: <Users className="w-4 h-4" /> },
    { key: 'fisioterapeutas', label: 'Fisioterapeutas', icon: <UserCheck className="w-4 h-4" /> },
    { key: 'indicadores', label: 'Indicadores', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const handleOpenGuide = () => {
    window.dispatchEvent(new CustomEvent('open-zane-guide'));
    window.dispatchEvent(new CustomEvent('open-zani-guide'));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/98 backdrop-blur-md border-b border-slate-200/90 transition-all shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22">
          {/* Zone 1: Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectTab('checkin')}
                className="relative group cursor-pointer focus:outline-hidden"
                title="Zane Pilates Studio — Início (Clique para ir para a Recepção)"
              >
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center relative border-2 border-white group-hover:scale-105 active:scale-95 shrink-0">
                  <div className="relative flex items-center justify-center">
                    <img
                      src={zaniLogo}
                      alt="Zane Pilates Studio"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-teal-300/40"
                    />
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenGuide();
                      }}
                      title="Clique para abrir o Guia Visual do Zane Pilates Studio"
                      className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 cursor-pointer z-10 hover:scale-110 transition-transform"
                    >
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-amber-400 text-[10px] text-slate-900 font-black items-center justify-center shadow-xs border border-white">
                        ?
                      </span>
                    </span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectTab('checkin')}
                className="hidden sm:block text-left cursor-pointer focus:outline-hidden group"
                title="Zane Pilates Studio — Início"
              >
                <span className="block font-extrabold text-slate-900 text-base font-display leading-tight group-hover:text-teal-900 transition-colors">
                  Zane Pilates Studio
                </span>
                <span className="text-[11px] text-teal-800 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Check-in & Agendamento
                </span>
              </button>
            </div>
          </div>

          {/* Zone 2: Clean 4–6 text navigation links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-teal-900 bg-teal-50 border border-teal-200/70 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.key === 'checkin' && todayCheckinCount > 0 && (
                    <span className="ml-1 text-[10px] font-mono tabular-nums bg-teal-700 text-white px-1.5 py-0.2 rounded-full">
                      {todayCheckinCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1–3 primary actions */}
          <div className="flex items-center gap-2">
            {/* Guia Visual do Studio */}
            <button
              onClick={handleOpenGuide}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100/90 rounded-lg transition-colors whitespace-nowrap border border-amber-200/90 shadow-2xs cursor-pointer"
              title="Abrir o Guia Visual & Manual de Testes do Zane Pilates Studio"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Guia Visual</span>
            </button>

            <button
              onClick={onOpenTotem}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/90 rounded-lg transition-colors whitespace-nowrap border border-slate-200 shadow-xs cursor-pointer"
              title="Abrir terminal de auto-atendimento para os pacientes na recepção"
            >
              <MonitorSmartphone className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">Modo Totem</span>
            </button>

            <button
              onClick={onOpenNewAppointment}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors whitespace-nowrap shadow-sm hover:shadow cursor-pointer"
              title="Cadastrar uma nova consulta"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Agendamento</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab scrollbar */}
        <div className="lg:hidden flex items-center gap-2 py-2 overflow-x-auto no-scrollbar border-t border-slate-100">
          {navItems.map(item => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-teal-900 bg-teal-50 border border-teal-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.key === 'checkin' && todayCheckinCount > 0 && (
                  <span className="text-[10px] font-mono tabular-nums bg-teal-700 text-white px-1.5 rounded-full">
                    {todayCheckinCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
