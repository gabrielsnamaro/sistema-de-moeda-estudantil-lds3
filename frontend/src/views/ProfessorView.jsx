import { useState, useEffect } from 'react';
import { listarAlunos, enviarMoedas } from '../services/api';
import { notificarRecebimentoMoedas } from '../services/emailjs';
import Extrato from '../components/Extrato';

const ESTADO_INICIAL_FORM = {
  alunoId: '',
  valor: '',
  motivo: '',
};

export default function ProfessorView({ sessao }) {
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [form, setForm] = useState(ESTADO_INICIAL_FORM);
  const [enviando, setEnviando] = useState(false);
  const [contador, setContador] = useState(0);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemEmail, setMensagemEmail] = useState(null);
  const [mensagemErro, setMensagemErro] = useState('');

  useEffect(() => {
    async function carregarAlunos() {
      setCarregando(true);
      try {
        const lista = await listarAlunos();
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

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagemSucesso('');
    setMensagemEmail(null);
    setMensagemErro('');
    setEnviando(true);

    try {
      const transacao = await enviarMoedas({
        alunoId: Number(form.alunoId),
        valor: Number(form.valor),
        motivo: form.motivo.trim(),
      });
      setMensagemSucesso(`${transacao.valorMoedas} moedas enviadas para ${transacao.alunoNome}.`);

      const email = await notificarRecebimentoMoedas(transacao);
      setMensagemEmail(email);

      setForm(ESTADO_INICIAL_FORM);
      setContador((anterior) => anterior + 1);
    } catch (error) {
      setMensagemErro(error.message || 'Erro ao enviar as moedas.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      {mensagemSucesso && (
        <div className="alert alert-success" role="status">
          {mensagemSucesso}
        </div>
      )}

      {mensagemEmail && (
        <div
          className={`alert ${mensagemEmail.enviado ? 'alert-success' : 'alert-warning'}`}
          role="status"
        >
          {mensagemEmail.mensagem}
        </div>
      )}

      {mensagemErro && (
        <div className="alert alert-error" role="alert">
          {mensagemErro}
        </div>
      )}

      <div className="grid-layout">
        <section className="card">
          <h2 className="card-title">
            <span>Enviar moedas</span>
          </h2>

          <p>A cada semestre você recebe 1.000 moedas (acumuláveis).</p>

          {carregando ? (
            <p className="empty-state">Carregando alunos...</p>
          ) : alunos.length === 0 ? (
            <p className="empty-state">Nenhum aluno cadastrado.</p>
          ) : (
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label htmlFor="envio-aluno">Aluno *</label>
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
                <label htmlFor="envio-valor">Quantidade de moedas *</label>
                <input
                  id="envio-valor"
                  name="valor"
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={form.valor}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="envio-motivo">Motivo do reconhecimento *</label>
                <textarea
                  id="envio-motivo"
                  name="motivo"
                  rows={3}
                  required
                  placeholder="Ex.: participação excelente na aula de hoje"
                  value={form.motivo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Enviar moedas'}
                </button>
              </div>
            </form>
          )}
        </section>

        <Extrato perfil="PROFESSOR" recarregar={contador} />
      </div>
    </div>
  );
}
