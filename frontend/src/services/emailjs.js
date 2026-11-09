const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export function emailJsConfigurado() {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

// Nunca lança: o chamador só exibe a mensagem devolvida na tela.
async function enviarEmail({ toEmail, toName, subject, message }) {
  if (!emailJsConfigurado()) {
    return {
      enviado: false,
      mensagem:
        'E-mail não enviado: EmailJS não configurado (defina VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID e VITE_EMAILJS_PUBLIC_KEY).',
    };
  }

  try {
    const response = await fetch(EMAILJS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: {
          to_email: toEmail,
          to_name: toName,
          subject,
          message,
        },
      }),
    });

    if (!response.ok) {
      const detalhe = (await response.text().catch(() => '')) || `HTTP ${response.status}`;
      return {
        enviado: false,
        mensagem: `Falha ao enviar e-mail para ${toEmail}: ${detalhe}`,
      };
    }

    return { enviado: true, mensagem: `E-mail enviado para ${toEmail}.` };
  } catch (error) {
    return {
      enviado: false,
      mensagem: `Falha ao enviar e-mail para ${toEmail}: ${error?.message || 'erro de rede'}`,
    };
  }
}

export function notificarRecebimentoMoedas(transacao) {
  return enviarEmail({
    toEmail: transacao.alunoEmail,
    toName: transacao.alunoNome,
    subject: `Você recebeu ${transacao.valorMoedas} moedas`,
    message:
      `O professor ${transacao.professorNome} enviou ${transacao.valorMoedas} moedas para você. ` +
      `Motivo: ${transacao.motivo}`,
  });
}

export function enviarCupomAluno(cupom) {
  return enviarEmail({
    toEmail: cupom.alunoEmail,
    toName: cupom.alunoNome,
    subject: `Cupom de resgate: ${cupom.vantagemTitulo}`,
    message:
      `Você resgatou a vantagem "${cupom.vantagemTitulo}" da empresa ${cupom.empresaNome} ` +
      `por ${cupom.custoMoedas} moedas. Código do cupom: ${cupom.codigoGerado}. ` +
      'Apresente este código na troca presencial para retirar sua vantagem.',
  });
}

export function enviarConferenciaParceiro(cupom) {
  return enviarEmail({
    toEmail: cupom.empresaEmail,
    toName: cupom.empresaNome,
    subject: `Resgate para conferência — código ${cupom.codigoGerado}`,
    message:
      `O aluno ${cupom.alunoNome} resgatou a vantagem "${cupom.vantagemTitulo}" ` +
      `por ${cupom.custoMoedas} moedas. Código para conferência: ${cupom.codigoGerado}.`,
  });
}
