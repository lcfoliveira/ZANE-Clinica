import React, { useState, useRef, useEffect } from 'react';
import zaniLogo from '../assets/images/zani_studio_logo_1790571397465.jpg';
import { 
  Send, 
  X, 
  RotateCcw, 
  Calendar, 
  CheckCircle2, 
  UserCheck, 
  Users,
  MonitorSmartphone, 
  Sparkles,
  Info,
  BookOpen,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Check,
  Building2,
  Clock,
  Edit3
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const QUICK_QUESTIONS = [
  { label: '🚀 Como iniciar os testes?', query: 'Como começar os primeiros testes reais no Zane Pilates Studio?' },
  { label: '📋 Como fazer check-in?', query: 'Como fazer o check-in de um paciente na recepção ou no totem?' },
  { label: '📅 Como agendar consulta?', query: 'Como faço para agendar uma nova consulta ou sessão com recorrência?' },
  { label: '🏷️ Planos Gympass & TotalPass', query: 'Como cadastrar alunos com Gympass e TotalPass no sistema?' },
  { label: '✏️ Como editar fisioterapeuta?', query: 'Como faço para editar o nome dos profissionais fisioterapeutas?' },
  { label: '🖥️ Como funciona o Totem?', query: 'Como funciona o totem de autoatendimento para os pacientes?' },
  { label: '👥 Fisioterapeuta Determinado', query: 'O que significa o conceito de Fisioterapeuta Determinado no sistema?' },
];

// Offline comprehensive knowledge base for Zane Pilates Studio
function getSiteHelpAnswer(query: string): string {
  const q = query.toLowerCase();

  // Health / Medical disclaimer check
  if (
    q.includes('dor') || 
    q.includes('coluna') || 
    q.includes('exercício') || 
    q.includes('exercicio') || 
    q.includes('postura') || 
    q.includes('remédio') || 
    q.includes('remedio') || 
    q.includes('medicamento') || 
    q.includes('lesão') || 
    q.includes('lesao') || 
    q.includes('sintoma')
  ) {
    return '⚠️ **Aviso de Uso:**\n\nEu sou o Guia de navegação do **Zane Pilates Studio**. Meu objetivo é orientar o uso das ferramentas do site (agendamentos, check-in, edição de profissionais, cadastros e relatórios).\n\nNão realizo prescrição clínica de exercícios nem diagnósticos médicos. Para avaliação de queixas físicas, agende uma sessão presencial com o seu fisioterapeuta determinado pela aba **"Consultas & Atendimentos"** ou na recepção do estúdio!';
  }

  // Getting started with real tests
  if (q.includes('iniciar') || q.includes('primeiro') || q.includes('começar') || q.includes('comeco') || q.includes('teste')) {
    return '🚀 **Passo a Passo para os Primeiros Testes Reais no Zane Pilates Studio:**\n\n1. **Cadastre seu 1º Fisioterapeuta:**\n   - Vá na aba **Fisioterapeutas** e clique em **"+ Novo Fisioterapeuta"**.\n   - Informe nome, especialidade (ex: Pilates Aparelhos, Reabilitação Postural), CREFITO e sala de atendimento.\n\n2. **Cadastre seu 1º Paciente:**\n   - Vá na aba **Pacientes** e clique em **"+ Novo Paciente"**.\n   - Preencha nome, telefone, CPF, vincule o Fisioterapeuta Determinado e escolha o plano (ex: Pilates 2x/semana, Gympass ou TotalPass).\n\n3. **Crie seu 1º Agendamento:**\n   - Clique no botão azul **"+ Novo Agendamento"** no topo da tela.\n   - Escolha o paciente, a data de hoje e o horário desejado.\n\n4. **Teste o Check-in na Recepção:**\n   - Na aba **Check-in Recepção**, clique em **"Fazer Check-in"** no paciente agendado.\n\n5. **Teste o Totem de Autoatendimento:**\n   - Clique em **"Modo Totem"** para simular a chegada autônoma do paciente digitando seu nome ou telefone!';
  }

  // Edit physiotherapist
  if (
    q.includes('editar') && (q.includes('fisioterapeuta') || q.includes('nome') || q.includes('profissional')) ||
    q.includes('renomear') || 
    q.includes('mudar nome')
  ) {
    return '✏️ **Como Editar o Nome dos Fisioterapeutas no Zane Pilates Studio:**\n\nO sistema oferece 2 formas fáceis para renomear qualquer profissional:\n\n1. **Edição Rápida Direta no Cartão (Aba "Fisioterapeutas"):**\n   - Vá até a aba **Fisioterapeutas** no menu superior.\n   - Clique diretamente sobre o **nome do profissional** ou no botão **"Alterar nome"** (ícone de lápis `[✏️]`).\n   - O campo se torna editável ali mesmo: digite o novo nome e pressione **Enter** ou clique no botão verde para salvar.\n   - Para alterar dados completos (especialidades, salas, CREFITO, foto), clique em **"Editar Dados"**.\n\n2. **Direto pela Grade de Horários (Aba "Grade por Fisioterapeuta"):**\n   - Na visualização da grade diária, cada coluna possui o nome do fisioterapeuta no topo.\n   - Ao lado do nome, há um ícone de lápis `[✏️]`. Clique nele para renomear o profissional sem sair da grade.\n\n*Todas as alterações de nome são atualizadas instantaneamente em toda a agenda, recepção, totem e prontuários!*';
  }

  // Corporate benefits: Gympass & TotalPass
  if (q.includes('gympass') || q.includes('totalpass') || q.includes('convenio') || q.includes('convênio') || q.includes('beneficio') || q.includes('benefício')) {
    return '🏷️ **Planos Corporativos (Gympass e TotalPass) no Zane Pilates Studio:**\n\nO sistema possui suporte nativo para convênios corporativos:\n\n1. **No Cadastro do Paciente:**\n   - Ao cadastrar ou editar um aluno na aba **Pacientes**, selecione no campo de plano **"Gympass (Wellhub)"** ou **"TotalPass"**.\n   - Um campo especial para **"Número de Matrícula / ID do Benefício"** será exibido para você anotar o código do passe do aluno.\n\n2. **Destaque Visual com Badges:**\n   - Pacientes com Gympass recebem um badge exclusivo em vermelho rubi com o logotipo do benefício.\n   - Pacientes com TotalPass recebem um badge destacado em azul ciano.\n\n3. **Na Recepção e no Check-in:**\n   - Na lista de chegadas e no comprovante, o operador é lembrado de validar o check-in no aplicativo do parceiro (Wellhub/TotalPass).\n\n4. **Nos Indicadores:**\n   - O estúdio acompanha a proporção exata entre alunos de planos próprios do estúdio e alunos de convênios parceiros!';
  }

  // Check-in
  if (q.includes('check-in') || q.includes('checkin') || q.includes('chegada') || q.includes('recepção') || q.includes('recepcao')) {
    return '📋 **Como Fazer o Check-in de Pacientes:**\n\n1. **Pela Recepção (Aba "Check-in Recepção"):**\n   - Acesse a aba **Check-in Recepção**.\n   - Na lista **"Fila de Consultas de Hoje"**, localize o paciente que acabou de chegar.\n   - Clique no botão verde **"Fazer Check-in"**.\n   - O status mudará para **"Na Recepção / Aguardando"** e o tempo de espera começará a ser monitorado em tempo real.\n   - Em seguida, a recepção pode clicar em **"Iniciar"** (quando o aluno entra na sala) e **"Concluir"** ao término da sessão.\n\n2. **Pelo Totem de Autoatendimento:**\n   - Clique no botão **"Modo Totem"** (no topo ou no painel de check-in).\n   - O próprio paciente digita seu nome ou telefone para confirmar a presença de forma independente.';
  }

  // Scheduling
  if (q.includes('agendar') || q.includes('agendamento') || q.includes('consulta') || q.includes('marcar')) {
    return '📅 **Como Agendar uma Nova Consulta no Zane Pilates Studio:**\n\n1. Clique no botão azul **"+ Novo Agendamento"** (disponível no topo do sistema ou nas abas Check-in e Agenda).\n2. Selecione o **Paciente** (ou faça um cadastro rápido clicando em "+ Novo Paciente").\n3. Selecione o **Fisioterapeuta Determinado** do paciente.\n4. Escolha a **Data**, o **Horário** e a **Sala** de atendimento.\n5. **Recorrência (Planos Contínuos):** Se for um plano de Pilates regular, ative a opção **"Repetir semanalmente"** e escolha quantas semanas deseja agendar automaticamente (ex: 4 semanas, 8 semanas ou 12 semanas).\n6. Clique em **"Confirmar Agendamento"**.\n\n💡 *Dica:* Na aba **"Grade por Fisioterapeuta"**, você também pode agendar clicando diretamente sobre qualquer horário vago da coluna do profissional!';
  }

  // Canceled / History
  if (q.includes('cancelad') || q.includes('cancelamento') || q.includes('historico') || q.includes('histórico') || q.includes('falta')) {
    return '🏷️ **Como Consultar o Histórico de Atendimentos Detalhado (Realizados, Cancelados e Faltas):**\n\n1. **Na Aba "Check-in Recepção":**\n   - Role até a seção **"Histórico Detalhado de Atendimentos"**.\n   - Você pode alternar entre as abas: **Todos**, **Concluídos (Realizados)**, **Cancelados (com justificativa)** e **Faltas**.\n   - É possível pesquisar pelo nome do paciente ou filtrar por período.\n\n2. **Na Aba "Consultas & Atendimentos (Agenda)":**\n   - Visualize todos os agendamentos com filtros por status, fisioterapeuta, paciente e data.\n   - Clique para ver o motivo registrado do cancelamento ou as evoluções clínicas salvas.\n\n3. **No Prontuário Individual do Paciente:**\n   - Acesse a aba **Pacientes** e clique em **"Ver Prontuário"** para ver todo o histórico daquele paciente específico.';
  }

  // Totem
  if (q.includes('totem') || q.includes('kiosk') || q.includes('autoatendimento')) {
    return '🖥️ **Como Funciona o Totem de Autoatendimento:**\n\n- O Totem foi projetado para rodar em um tablet ou tela na entrada do Zane Pilates Studio.\n- Para ativá-lo, clique no botão **"Modo Totem"** no cabeçalho ou na aba Check-in.\n- O paciente digita seu nome ou os primeiros números de seu celular/CPF.\n- O sistema localiza a consulta agendada para hoje com o **Fisioterapeuta Determinado**, confirma a sala e registra o check-in na hora, avisando o fisioterapeuta na recepção.';
  }

  // Fisioterapeuta Determinado concept
  if (q.includes('determinado') || q.includes('conceito') || q.includes('referência') || q.includes('referencia')) {
    return '👥 **O que é o Fisioterapeuta Determinado?**\n\nNo Zane Pilates Studio, cada paciente possui um **fisioterapeuta de referência fixo** vinculado ao seu cadastro.\n\nIsso garante:\n• **Continuidade do Tratamento:** O mesmo profissional acompanha a evolução clínica do aluno a cada sessão.\n• **Segurança Técnica:** O profissional conhece as restrições articulares, histórico de patologias e objetivos individuais.\n• **Praticidade no Agendamento:** Ao agendar ou fazer check-in no totem, o sistema já pré-seleciona o fisioterapeuta determinado do paciente.';
  }

  // Patients tab
  if (q.includes('paciente') || q.includes('prontuário') || q.includes('prontuario') || q.includes('cadastro')) {
    return '👤 **Como Gerenciar Pacientes e Prontuários:**\n\n1. Acesse a aba **Pacientes** no menu superior.\n2. Para cadastrar um novo aluno, clique em **"+ Novo Paciente"** e preencha nome, telefone, CPF, plano contratado (ex: Pilates 2x/sem, Gympass, TotalPass) e o fisioterapeuta determinado.\n3. No cartão de cada paciente, você pode:\n   - Clicar em **"Ver Prontuário"** para ver histórico de sessões, frequência e evoluções clínicas.\n   - Clicar em **"Agendar"** para marcar nova sessão diretamente.\n   - Clicar no ícone de lápis para editar telefone, plano ou queixa principal.';
  }

  // Reports / Analytics
  if (q.includes('indicador') || q.includes('relatório') || q.includes('relatorio') || q.includes('métrica') || q.includes('grafico')) {
    return '📊 **Como Acessar os Indicadores e Relatórios:**\n\n1. Acesse a aba **Indicadores** no menu superior.\n2. Você verá métricas em tempo real:\n   - Total de pacientes ativos no estúdio\n   - Taxa de presença e comparecimento nos check-ins\n   - Total de atendimentos concluídos, cancelados e faltas\n   - Gráfico de atendimentos por fisioterapeuta\n   - Distribuição de alunos entre convênios corporativos e planos próprios do estúdio\n3. Há também o botão **"Exportar CSV"** para download da planilha de atendimentos.';
  }

  // Default helpful overview
  return '🧭 **Guia de Uso do Zane Pilates Studio:**\n\nO site está organizado nas seguintes abas principais:\n\n1. **Check-in Recepção:** Acompanhe os alunos do dia, registre chegadas, abra o Totem e consulte o histórico de atendimentos realizados e cancelados.\n2. **Consultas & Atendimentos:** Agenda completa com opções de filtros por data, fisioterapeuta e status.\n3. **Grade por Fisioterapeuta:** Visão lado a lado em colunas com horários das 07h às 20h e edição rápida do nome do profissional pelo ícone [✏️].\n4. **Pacientes:** Cadastro de alunos, planos de Pilates, convênios Gympass/TotalPass e prontuários clínicos com evolução.\n5. **Fisioterapeutas:** Gestão da equipe, especialidades e edição fácil do nome dos profissionais.\n6. **Indicadores:** Métricas de presença, comparecimento e distribuição de sessões.\n\nQual dessas funções você deseja que eu explique em detalhes?';
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'guia_visual' | 'chat_suporte'>('guia_visual');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Olá! Sou o Guia Virtual do Zane Pilates Studio.\n\nEstou aqui para orientar todos os seus testes reais: como cadastrar o primeiro fisioterapeuta, cadastrar pacientes e planos (incluindo Gympass e TotalPass), agendar consultas, usar o check-in na recepção ou no totem de entrada.\n\nComo posso te orientar agora?'
    }
  ]);

  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenGuide = () => {
      setIsOpen(true);
      setActiveTab('guia_visual');
    };
    window.addEventListener('open-zane-guide', handleOpenGuide);
    window.addEventListener('open-zani-guide', handleOpenGuide);
    return () => {
      window.removeEventListener('open-zane-guide', handleOpenGuide);
      window.removeEventListener('open-zani-guide', handleOpenGuide);
    };
  }, []);

  useEffect(() => {
    if (bodyRef.current && activeTab === 'chat_suporte') {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading, activeTab]);

  const handleSendQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || loading) return;

    setActiveTab('chat_suporte');
    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages
        })
      });

      if (!res.ok) throw new Error('Falha na resposta da API');
      const data = await res.json();
      const botReply = data.reply || getSiteHelpAnswer(text);
      setMessages(prev => [...prev, { role: 'model', text: botReply }]);
    } catch {
      // Fallback seamlessly to local intelligent site help answer
      const fallbackReply = getSiteHelpAnswer(text);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: fallbackReply
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'model',
        text: 'Conversa reiniciada. Sou o Guia do Zane Pilates Studio. Pergunte qualquer dúvida sobre como usar as ferramentas e telas do estúdio!'
      }
    ]);
  };

  // Helper to render formatted text with bold and linebreaks
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={lIdx} className="block leading-relaxed">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
          {lines.length > 1 && lIdx < lines.length - 1 && line === '' && <span className="block h-1.5" />}
        </span>
      );
    });
  };

  const VISUAL_GUIDE_STEPS = [
    {
      step: '1',
      title: 'Cadastrar Equipe de Fisioterapeutas',
      category: 'Aba Fisioterapeutas',
      icon: <UserCheck className="w-4 h-4 text-teal-700" />,
      desc: 'Comece cadastrando os profissionais do estúdio. Informe nome, especialidades (Pilates Aparelhos, Reabilitação Postural), CREFITO, foto e sala de atendimento.',
      tip: 'Edição Rápida: você pode renomear qualquer profissional a qualquer momento clicando no ícone de lápis [✏️] diretamente na grade ou no cartão!'
    },
    {
      step: '2',
      title: 'Cadastrar Alunos, Planos & Convênios',
      category: 'Aba Pacientes',
      icon: <Users className="w-4 h-4 text-teal-700" />,
      desc: 'Cadastre seus alunos vinculando o Fisioterapeuta Determinado de referência. Selecione o plano: planos próprios (ex: Pilates 2x/sem) ou convênios corporativos parceiros (Gympass e TotalPass) com o número de matrícula.',
      tip: 'Alunos Gympass e TotalPass recebem etiquetas coloridas exclusivas na recepção e no totem!'
    },
    {
      step: '3',
      title: 'Agendamento de Consultas & Recorrência',
      category: 'Aba Agenda ou Grade',
      icon: <Calendar className="w-4 h-4 text-teal-700" />,
      desc: 'Clique em "+ Novo Agendamento" ou clique direto em qualquer horário vago na grade por fisioterapeuta. Ative a opção "Repetir semanalmente" para criar automaticamente 4, 8 ou 12 semanas de sessões.',
      tip: 'A grade diária exibe lado a lado todos os fisioterapeutas com horários das 07:00 às 20:00.'
    },
    {
      step: '4',
      title: 'Check-in na Recepção & Fluxo de Espera',
      category: 'Aba Check-in Recepção',
      icon: <CheckCircle2 className="w-4 h-4 text-teal-700" />,
      desc: 'Quando o aluno chega, a recepcionista clica em "Fazer Check-in". O status passa para "Na Recepção / Aguardando". O fisioterapeuta clica em "Iniciar" ao chamar para a sala e em "Concluir" ao finalizar.',
      tip: 'O sistema emite ticket/comprovante com nome do aluno, fisioterapeuta e sala!'
    },
    {
      step: '5',
      title: 'Totem de Entrada para Autoatendimento',
      category: 'Modo Totem',
      icon: <MonitorSmartphone className="w-4 h-4 text-teal-700" />,
      desc: 'Deixe o tablet na recepção no Modo Totem. O aluno digita seu nome, celular ou CPF, confirma a presença de forma independente e vê na hora a sala e o fisioterapeuta.',
      tip: 'O check-in do totem reflete instantaneamente no painel da recepção em tempo real.'
    },
    {
      step: '6',
      title: 'Evolução Clínica & Cancelamentos',
      category: 'Prontuário & Agenda',
      icon: <ShieldCheck className="w-4 h-4 text-teal-700" />,
      desc: 'Ao concluir uma consulta, registre a evolução clínica do aluno. Em caso de imprevisto, registre o cancelamento com justificativa clara (atestado, viagem, etc.) para auditoria.',
      tip: 'Consulte o histórico detalhado filtrando por Concluídos, Cancelados e Faltas na aba Check-in.'
    }
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed right-5 bottom-5 z-50 flex items-center gap-3">
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              setActiveTab('guia_visual');
            }}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white text-slate-800 text-xs font-semibold rounded-full shadow-lg border border-teal-200/80 cursor-pointer hover:bg-teal-50/50 hover:border-teal-400 transition-all group animate-bounce"
            style={{ animationDuration: '3.5s' }}
            title="Dúvidas sobre o funcionamento do site?"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="text-teal-950">Guia Visual: <strong>Como Usar o Sistema</strong></span>
            <span className="text-base leading-none">📖</span>
          </button>
        )}

        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center relative border-2 border-white focus:outline-hidden hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Abrir Guia do Zane Pilates Studio"
          title="Guia do Zane Pilates Studio — Manual e Suporte"
        >
          <div className="relative flex items-center justify-center">
            <img 
              src={zaniLogo} 
              alt="Guia Zane Pilates Studio" 
              className="w-10 h-10 rounded-full object-cover border border-teal-300/40"
            />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 text-[9px] text-slate-900 font-extrabold items-center justify-center">?</span>
            </span>
          </div>
        </button>
      </div>

      {/* Slide-up Guide & Chat Panel */}
      {isOpen && (
        <div className="zani-chatpanel">
          {/* Header */}
          <div className="zani-chat-head flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 via-teal-900 to-teal-800 text-white">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img 
                  src={zaniLogo} 
                  alt="Zane Pilates Studio" 
                  className="w-8 h-8 rounded-full object-cover border border-white/60 bg-white"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full"></span>
              </div>
              <div>
                <span className="block font-bold text-sm leading-tight flex items-center gap-1.5 font-display">
                  Zane Pilates Studio
                  <span className="text-[10px] font-normal px-1.5 py-0.2 bg-teal-500/30 text-teal-200 rounded-full border border-teal-400/30">
                    Guia do Sistema
                  </span>
                </span>
                <span className="text-[11px] text-teal-100/90 font-normal block">
                  Manual de Testes Reais & Assistente Operacional
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {activeTab === 'chat_suporte' && (
                <button
                  onClick={handleResetChat}
                  className="p-1.5 text-teal-200 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                  title="Reiniciar conversa"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-teal-200 hover:text-white hover:bg-white/10 rounded-md transition-colors text-base leading-none cursor-pointer"
                title="Fechar guia"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Guide Mode Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 p-1 border-b border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('guia_visual')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'guia_visual'
                  ? 'bg-white text-teal-900 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-700" />
              <span>Guia Visual Passo a Passo</span>
            </button>
            <button
              onClick={() => setActiveTab('chat_suporte')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'chat_suporte'
                  ? 'bg-white text-teal-900 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
              <span>Tire Dúvidas (Chat)</span>
            </button>
          </div>

          {/* TAB 1: GUIA VISUAL PASSO A PASSO */}
          {activeTab === 'guia_visual' && (
            <div className="zani-chat-body space-y-3.5 p-3.5 bg-slate-50/70 overflow-y-auto">
              {/* Welcome Banner for Real Tests */}
              <div className="p-3 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/80 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
                  <h4 className="text-xs font-bold text-teal-950 font-display">
                    Primeiros Testes Reais no Zane Pilates Studio
                  </h4>
                </div>
                <p className="text-[11px] text-teal-900 leading-relaxed">
                  Todos os dados de demonstração foram retirados para que você possa iniciar do zero com pacientes e profissionais reais da sua clínica.
                </p>
              </div>

              {/* Step by Step Cards */}
              <div className="space-y-2.5">
                {VISUAL_GUIDE_STEPS.map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs hover:border-teal-300 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {item.step}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                          <span className="text-[10px] font-medium text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200/60">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed mb-1.5">
                          {item.desc}
                        </p>
                        <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-1.5">
                          <Info className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" />
                          <span>{item.tip}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button to switch to chat */}
              <div className="pt-2 text-center">
                <button
                  onClick={() => setActiveTab('chat_suporte')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Fazer uma pergunta sobre o sistema</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CHAT INTERATIVO / PERGUNTAS & RESPOSTAS */}
          {activeTab === 'chat_suporte' && (
            <>
              {/* Quick Questions suggestion row */}
              <div className="bg-teal-50/70 border-b border-teal-100/80 px-3 py-2">
                <div className="text-[10px] font-semibold text-teal-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>Dúvidas Frequentes (clique para resposta imediata):</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(q.query)}
                      className="text-[11px] font-medium whitespace-nowrap bg-white text-slate-700 hover:text-teal-800 hover:bg-teal-100/70 border border-slate-200 hover:border-teal-300 rounded-full px-2.5 py-1 transition-all shadow-2xs cursor-pointer shrink-0"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages Body */}
              <div className="zani-chat-body" ref={bodyRef}>
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`zani-msg ${m.role === 'user' ? 'user' : 'bot'} text-xs`}
                  >
                    {renderMessageContent(m.text)}
                  </div>
                ))}
                {loading && (
                  <div className="zani-msg bot flex items-center gap-2 text-xs italic text-slate-600">
                    <span className="inline-block w-2 h-2 rounded-full bg-teal-600 animate-ping"></span>
                    <span>Buscando instrução no sistema Zane Pilates Studio...</span>
                  </div>
                )}
              </div>

              {/* Disclaimer footer */}
              <div className="text-[10px] text-slate-500 px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5">
                <Info className="w-3 h-3 text-teal-600 shrink-0" />
                <span>Guia do site Zane Pilates Studio. Não substitui consulta clínica.</span>
              </div>

              {/* Input Foot */}
              <div className="zani-chat-foot">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendQuery(input);
                  }}
                  placeholder="Pergunte como usar qualquer tela do estúdio..."
                  disabled={loading}
                  className="text-xs"
                />
                <button
                  onClick={() => handleSendQuery(input)}
                  disabled={loading || !input.trim()}
                  className="bg-teal-700 hover:bg-teal-800 text-white disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                  title="Enviar pergunta"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
