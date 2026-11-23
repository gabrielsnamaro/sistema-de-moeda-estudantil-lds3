import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Coins,
  Mail,
  Send,
  Users,
} from 'lucide-react';
import { listarAlunosDaInstituicao, enviarMoedas } from '../services/api';
import { notificarRecebimentoMoedas } from '../services/emailjs';
import Extrato from '../components/Extrato';
import BotAvatar from '../components/BotAvatar';
import { ListSkeleton } from '../components/Skeletons';
import { useMascot } from '../contexts/MascotContext';
import { useToast } from '../contexts/ToastContext';

const ESTADO_INICIAL_FORM = {
  alunoId: '',
  valor: '',
  motivo: '',
};

const ATALHOS_VALOR = [10, 25, 50, 100, 250];

export default function ProfessorView({ sessao }) {
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(ESTADO_INICIAL_FORM);
  const [enviando, setEnviando] = useState(false);
  const [contador, setContador] = useState(0);
  const [saldoAtual, setSaldoAtual] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemEmail, setMensagemEmail] = useState(null);
  const [mensagemErro, setMensagemErro] = useState('');

  const { setContext, react } = useMascot();
  const { notify } = useToast();

  useEffect(() => {
    setContext('professor');
  }, [setContext]);

  useEffect(() => {
    async function carregarAlunos() {
      setCarregando(true);
      try {
        const lista = await listarAlunosDaInstituicao();
        setAlunos(Array.isArray(lista) ? lista : []);
      } catch (error) {
        setMensagemErro(error.message || 'Não foi possível carregar os alunos.');
      } finally {
        setCarregando(false);
      }
    }
    carregarAlunos();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const valorNumerico = Number(form.valor) || 0;
  const saldoPrevisto = saldoAtual !== null ? saldoAtual - valorNumerico : null;
  const saldoInsuficiente = saldoPrevisto !== null && saldoPrevisto < 0;

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagemSucesso('');
    setMensagemEmail(null);
    setMensagemErro('');
    setEnviando(true);
    react('Enviando reconhecimento e atualizando saldos...', {
      nextState: 'working',
      nextMood: 'neutral',
      durationMs: 0,
    });

    try {
      const transacao = await enviarMoedas({
        alunoId: Number(form.alunoId),
        valor: Number(form.valor),
        motivo: form.motivo.trim(),
      });
      const msg = `${transacao.valorMoedas} moedas enviadas para ${transacao.alunoNome}!`;
      setMensagemSucesso(msg);
      notify(msg, 'success');
      react(`Boa! ${transacao.alunoNome} acabou de receber ${transacao.valorMoedas} moedas!`, {
        nextState: 'done',
        nextMood: 'happy',
        durationMs: 5200,
      });

      const email = await notificarRecebimentoMoedas(transacao);
      setMensagemEmail(email);

      setForm(ESTADO_INICIAL_FORM);
      setContador((anterior) => anterior + 1);
    } catch (error) {
      const msg = error.message || 'Erro ao enviar as moedas.';
      setMensagemErro(msg);
      react(msg, { nextState: 'blocked', nextMood: 'neutral', durationMs: 5000 });
      notify(msg, 'error');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      {mensagemSucesso && (
        <div className="alert alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {mensagemEmail && (
        <div
          className={`alert ${mensagemEmail.enviado ? 'alert-success' : 'alert-warning'}`}
          role="status"
        >
          <Mail size={18} />
          <span>{mensagemEmail.mensagem}</span>
        </div>
      )}

      {mensagemErro && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{mensagemErro}</span>
        </div>
      )}

      <div className="dashboard-split">
        <section className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">
                <Award size={20} style={{ color: 'var(--coin)' }} />
                Reconhecer aluno
              </h2>
              <p className="card-subtitle">
                Crédito cumulativo de 1.000 moedas por semestre · {sessao?.nome}
              </p>
            </div>
          </div>

          {carregando ? (
            <ListSkeleton rows={3} />
          ) : alunos.length === 0 ? (
            <div className="empty-panel">
              <BotAvatar size={76} state="waiting" mood="neutral" material="fluffy" followPointer />
              <h3>Nenhum aluno disponível</h3>
              <p>
                Ainda não há alunos cadastrados na sua instituição de ensino para receber moedas.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form-grid form-grid-single">
              <div className="form-group">
                <label htmlFor="envio-aluno">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Users size={14} /> Aluno destinatário * ({alunos.length} disponíveis)
                  </span>
                </label>
                <select
                  id="envio-aluno"
                  name="alunoId"
                  required
                  value={form.alunoId}
                  onChange={handleChange}
                >
                  <option value="">Selecione um aluno</option>
                  {alunos.map((aluno) => (
                    <option key={aluno.id} value={aluno.id}>
                      {`${aluno.nome} — ${aluno.curso} (${aluno.instituicaoEnsinoNome})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="envio-valor">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Coins size={14} /> Quantidade de moedas *
                  </span>
                </label>
                <input
                  id="envio-valor"
                  name="valor"
                  type="number"
                  min={1}
                  step={1}
                  required
                  placeholder="Ex.: 50"
                  value={form.valor}
                  onChange={handleChange}
                />
                <div className="quick-pills" aria-label="Valores sugeridos">
                  {ATALHOS_VALOR.map((qtd) => (
                    <button
                      key={qtd}
                      type="button"
                      className={`pill-btn ${Number(form.valor) === qtd ? 'active' : ''}`}
                      onClick={() => setForm((prev) => ({ ...prev, valor: String(qtd) }))}
                    >
                      +{qtd}
                    </button>
                  ))}
                </div>
                {saldoPrevisto !== null && valorNumerico > 0 && (
                  <span
                    className="form-hint"
                    style={{
                      color: saldoInsuficiente ? 'var(--danger)' : 'var(--text-muted)',
                      fontWeight: saldoInsuficiente ? 600 : 400,
                    }}
                  >
                    {saldoInsuficiente
                      ? `Saldo insuficiente (faltam ${Math.abs(saldoPrevisto)} moedas).`
                      : `Saldo após envio: ${saldoPrevisto.toLocaleString('pt-BR')} moedas`}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="envio-motivo">Motivo do reconhecimento *</label>
                <textarea
                  id="envio-motivo"
                  name="motivo"
                  rows={3}
                  required
                  placeholder="Ex.: Participação excelente na discussão de arquitetura MVC em aula."
                  value={form.motivo}
                  onChange={handleChange}
                />
              </div>

              <motion.button
                type="submit"
                className="btn btn-coin"
                style={{ width: '100%', padding: '0.72rem' }}
                disabled={enviando || saldoInsuficiente}
                whileTap={{ scale: 0.98 }}
              >
                <Send size={15} />
                {enviando ? 'Enviando moedas...' : 'Enviar moedas'}
              </motion.button>
            </form>
          )}
        </section>

        <Extrato
          perfil="PROFESSOR"
          recarregar={contador}
          onSaldoAtualizado={setSaldoAtual}
        />
      </div>
    </motion.div>
  );
}
