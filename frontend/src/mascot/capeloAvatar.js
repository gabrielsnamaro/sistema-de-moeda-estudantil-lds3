import { validateAvatar } from 'open-bot-avatar';

// Mascote exclusivo do Sistema de Moeda Estudantil: "Capelo"
// Desenhado seguindo o contrato v1 e a skill generate-avatar do Open Bot Avatar
// (viewBox 0 0 100 100, coordenadas em 8..92, silhueta principal unificada + borla assimétrica)
const CAPELO_RAW = {
  version: 1,
  id: 'capelo',
  name: 'Capelo',
  body: {
    path:
      'M50 10' +
      'C54 10 78 17 90 23' +
      'C92.5 24.5 92.5 30 89 32' +
      'L75 37' +
      'C76 44 76 58 75 71' +
      'C74 81 65 87 50 87' +
      'C35 87 26 81 25 71' +
      'C24 58 24 44 25 37' +
      'L11 32' +
      'C7.5 30 7.5 24.5 10 23' +
      'C22 17 46 10 50 10Z' +
      'M85 28' +
      'C88.5 28 90.5 31 90.5 36' +
      'L90.5 52' +
      'C92.5 55 92.5 63 89.5 67' +
      'C87.5 69.5 84.5 69.5 82.5 67' +
      'C79.5 63 79.5 55 82 52' +
      'L82 36' +
      'C82 31 83 28 85 28Z',
  },
  eyes: { x: 50, y: 59, spacing: 15.5, scale: 1.05 },
};

const resultado = validateAvatar(CAPELO_RAW);

export const CAPELO_DEFINITION = resultado.ok ? resultado.value : CAPELO_RAW;

export const CAPELO_CORES = {
  ouro: '#f59e0b',
  indigo: '#4f46e5',
  esmeralda: '#10b981',
  coral: '#f97316',
};

export const DICAS_POR_CONTEXTO = {
  login: [
    'Olá! Eu sou o Capelo, mascote da Moeda Estudantil. Faça login para começar!',
    'Dica: use os botões rápidos de professor para testar o sistema em um clique.',
    'É aluno ou empresa parceira? Você pode criar sua conta agora mesmo!',
  ],
  'cadastro-aluno': [
    'Selecione sua instituição de ensino para já poder receber moedas dos professores!',
    'Seu saldo começa em 0 moedas e cresce a cada reconhecimento em aula.',
  ],
  'cadastro-empresa': [
    'Empresas parceiras oferecem benefícios reais em troca das moedas dos alunos.',
    'Depois do cadastro, você poderá publicar vantagens com foto e custo em moedas.',
  ],
  'aluno:vantagens': [
    'Explore o catálogo e use o filtro "Posso resgatar" para ver o que cabe no seu saldo!',
    'Cada resgate gera um código exclusivo enviado por e-mail para você e para o parceiro.',
    'Clique em mim quando quiser uma dica rápida!',
  ],
  'aluno:cupons': [
    'Clique no botão de copiar para levar o código do cupom facilmente na hora da troca.',
    'Todos os seus resgates ficam salvos aqui com data e código de conferência.',
  ],
  'aluno:extrato': [
    'Aqui você acompanha cada moeda recebida dos professores e cada vantagem resgatada.',
    'Use os filtros de Entradas e Saídas para conferir suas movimentações rapidinho.',
  ],
  'aluno:perfil': [
    'Mantenha seu e-mail atualizado para receber as notificações de moedas e cupons!',
    'Na edição, deixe a senha em branco se quiser continuar com a atual.',
  ],
  professor: [
    'A cada semestre você recebe 1.000 moedas cumulativas para premiar o mérito dos alunos!',
    'Use os atalhos de valor (+10, +25, +50, +100) para agilizar o envio.',
    'O motivo do reconhecimento é enviado direto no e-mail do aluno premiado!',
  ],
  'empresa:vantagens': [
    'Veja a pré-visualização ao vivo do cartão antes de publicar a vantagem no catálogo!',
    'Fotos nítidas e descrições objetivas aumentam os resgates pelos estudantes.',
  ],
  'empresa:perfil': [
    'Mantenha o e-mail institucional em dia para receber os códigos de conferência de resgates.',
    'Você pode atualizar a descrição da sua empresa a qualquer momento.',
  ],
};
