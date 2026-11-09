import { useState, useEffect } from 'react';
import { consultarExtrato } from '../services/api';

const ROTULO_TIPO = {
  CREDITO_SEMESTRAL: 'Crédito semestral',
  RESGATE_VANTAGEM: 'Resgate de vantagem',
};

function rotuloTipo(tipo, perfil) {
  if (tipo === 'ENVIO_MOEDAS') {
    return perfil === 'ALUNO' ? 'Moedas recebidas' : 'Moedas enviadas';
  }
  return ROTULO_TIPO[tipo] || tipo;
}

// Entrada de moedas: crédito semestral e envio visto pelo aluno.
function ehEntrada(tipo, perfil) {
  return tipo === 'CREDITO_SEMESTRAL' || (tipo === 'ENVIO_MOEDAS' && perfil === 'ALUNO');
}

function detalhe(transacao, perfil) {
  if (transacao.tipo === 'ENVIO_MOEDAS') {
    return perfil === 'ALUNO'
      ? `De ${transacao.professorNome}: ${transacao.motivo}`
      : `Para ${transacao.alunoNome}: ${transacao.motivo}`;
  }
  if (transacao.tipo === 'RESGATE_VANTAGEM') {
    return transacao.vantagemTitulo;
  }
  return transacao.motivo;
}

export default function Extrato({ perfil, recarregar = 0 }) {
  const [saldo, setSaldo] = useState(0);
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const extrato = await consultarExtrato();
      setSaldo(extrato?.saldoMoedas ?? 0);
      setTransacoes(Array.isArray(extrato?.transacoes) ? extrato.transacoes : []);
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar o extrato.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [recarregar]);

  return (
    <section className="card">
      <div className="card-title">
        <span>
          Extrato <span className="badge badge-coins">Saldo: {saldo} moedas</span>
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={carregar}
          disabled={carregando}
        >
          {carregando ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {erro && (
        <div className="alert alert-error" role="alert">
          {erro}
        </div>
      )}

      {transacoes.length === 0 ? (
        <p className="empty-state">
          {carregando ? 'Carregando extrato...' : 'Nenhuma transação registrada até o momento.'}
        </p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data/hora</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.map((transacao) => (
                <tr key={transacao.id}>
                  <td>{new Date(transacao.dataHora).toLocaleString('pt-BR')}</td>
                  <td>{rotuloTipo(transacao.tipo, perfil)}</td>
                  <td>
                    {ehEntrada(transacao.tipo, perfil) ? '+' : '−'}
                    {transacao.valorMoedas}
                  </td>
                  <td>{detalhe(transacao, perfil)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
