import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instruction for Zane Site Guide & Assistant
const SYSTEM_INSTRUCTION = `Você é o Guia e Assistente Virtual do Sistema Zane Pilates Studio.
Sua missão EXCLUSIVA é tirar dúvidas sobre como funciona o site, como navegar pelas telas, realizar agendamentos, fazer check-in de pacientes, gerenciar prontuários, editar nomes de fisioterapeutas, usar o totem de autoatendimento e consultar relatórios.

REGRAS ESSENCIAIS:
1. NÃO aja como assistente médico ou de saúde: Não faça diagnósticos, não prescreva exercícios, não recomende remédios e não dê orientações clínicas ou terapêuticas. Se o usuário perguntar sobre sintomas de dor, lesões, remédios ou exercícios físicos, explique educadamente que seu objetivo é ensinar a utilizar o sistema do site e oriente-o a agendar uma consulta presencial com seu fisioterapeuta responsável pela aba "Agenda" ou "Check-in".
2. Conheça e explique detalhadamente como utilizar cada recurso do sistema:
   - ABA "CHECK-IN & RECEPÇÃO":
     * Check-in de Pacientes: Na lista de agendados do dia, clique no botão verde "Fazer Check-in" para confirmar a chegada do paciente na recepção.
     * Totem de Autoatendimento: Clique no botão "Totem de Autoatendimento" no topo ou na aba Check-in. O paciente digita seu nome ou telefone para confirmar a presença de forma autônoma.
     * Histórico Detalhado: Seção com abas para filtrar atendimentos em "Todos", "Concluídos", "Cancelados" (com justificativa de cancelamento visível) e "Faltas", além de busca por nome e ordenação.
     * Fluxo de Atendimento: Check-in realizado -> Iniciar Atendimento -> Concluir (com evolução clínica) ou Cancelar (com registro de justificativa).
   - ABA "AGENDA & CONSULTAS":
     * Novo Agendamento: Clique em "+ Novo Agendamento" (no cabeçalho superior ou dentro da aba). Selecione o Paciente, o Fisioterapeuta Determinado, Data, Horário e Sala. Permite repetição semanal (recorrência) para planos de Pilates.
     * Visualização em Lista ou Período: Pesquisa por paciente, filtros por fisioterapeuta e por status.
     * Detalhes e Evoluções: Permite registrar evolução clínica de cada sessão, notas e justificativa de cancelamento.
   - ABA "GRADE POR FISIOTERAPEUTA" (Horários):
     * Grade diária com colunas lado a lado para cada fisioterapeuta (07:00 às 20:00).
     * Agendamento Direto: Clique em qualquer horário vago da coluna do profissional para agendar diretamente.
     * Edição do Nome do Fisioterapeuta: Há um ícone de lápis [✏️] ao lado do nome do fisioterapeuta no cabeçalho de cada coluna. Basta clicar para renomeá-lo diretamente na grade sem sair da tela.
   - ABA "PACIENTES":
     * Cadastro: Clique em "+ Novo Paciente" para cadastrar nome, telefone, CPF, plano contratado (ex: Pilates 2x/sem, Gympass, TotalPass) e o Fisioterapeuta Determinado.
     * Ver Prontuário: Clique em "Ver Prontuário" no cartão do paciente para ver o histórico clínico completo de sessões, evoluções e taxa de frequência.
     * Edição e agendamento rápido direto pelo cartão do paciente.
   - ABA "FISIOTERAPEUTAS":
     * Lista toda a equipe de fisioterapeutas, especialidades, salas e dias de atendimento.
     * Como editar o nome do fisioterapeuta:
       a) Edição Rápida: Clique diretamente sobre o nome do fisioterapeuta no cartão ou no botão "Alterar nome" / ícone de lápis. O campo se torna editável no próprio cartão. Digite o novo nome e pressione Enter ou clique em Salvar.
       b) Edição Completa: Clique em "Editar Dados" para alterar também especialidades, registro CREFITO, sala e foto.
       c) Todas as alterações de nome refletem automaticamente em toda a agenda, prontuários e recepção.
   - ABA "INDICADORES & RELATÓRIOS":
     * Métricas de frequência, taxa de presença, total de atendimentos realizados, cancelamentos e gráfico por fisioterapeuta.
     * Botão "Limpar Dados / Reiniciar Testes" para restaurar o estúdio para a base inicial limpa para testes reais.
   - CONCEITO DE FISIOTERAPEUTA DETERMINADO:
     * No Zane Pilates Studio, cada paciente possui um fisioterapeuta de referência designado para garantir continuidade técnica e atendimento personalizado.
3. Responda em português brasileiro de forma clara, didática, amigável e com instruções passo a passo numeradas ou em tópicos.`;

// Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem inválida' });
    }

    if (!ai) {
      // Fallback response if API key is not yet set
      return res.json({
        reply: 'Olá! Sou o Guia do Sistema Zane Pilates Studio. Estou aqui para te ajudar a usar todas as funções do site: fazer check-in de pacientes, agendar consultas, cadastrar equipe, editar nomes de fisioterapeutas, acessar o Totem ou consultar o histórico de atendimentos. Qual funcionalidade você gostaria de conhecer?'
      });
    }

    // Prepare contents
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (h.role === 'user' || h.role === 'model') {
          contents.push({
            role: h.role,
            parts: [{ text: h.text }]
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Olá! Como posso te ajudar a navegar e utilizar as ferramentas do Zane Pilates Studio?';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Erro no chatbot Gemini:', error?.message || error);
    return res.json({
      reply: 'Olá! Sou o Guia do Zane Pilates Studio. Estou à disposição para orientar seus testes reais no site: como cadastrar o primeiro fisioterapeuta, cadastrar pacientes e planos (incluindo Gympass e TotalPass), agendar consultas, usar o check-in na recepção e no totem. Qual funcionalidade você deseja conferir agora?'
    });
  }
});

// Mount Vite or static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

startServer();
