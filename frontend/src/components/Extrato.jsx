import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { consultarExtrato } from '../services/api';
import { ListSkeleton } from './Skeletons';
import AnimatedNumber from './AnimatedNumber';
import BotAvatar from './BotAvatar';

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

export default function Extrato({ perfil, recarregar = 0, onSaldoAtualizado }) {
  const [saldo, setSaldo] = useState(0);
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState('todos');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const extrato = await consultarExtrato();
      const novoSaldo = extrato?.saldoMoedas ?? 0;
      setSaldo(novoSaldo);
      onSaldoAtualizado?.(novoSaldo);
      setTransacoes(Array.isArray(extrato?.transacoes) ? extrato.transacoes : []);
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar o extrato.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recarregar]);

  const resumo = useMemo(() => {
    let entradas = 0;
    let saidas = 0;
    for (const tx of transacoes) {
      if (ehEntrada(tx.tipo, perfil)) {
        entradas += tx.valorMoedas || 0;
      } else {
        saidas += tx.valorMoedas || 0;
      }
    }
    return { entradas, saidas };
  }, [transacoes, perfil]);

  const filtradas = useMemo(() => {
    if (filtro === 'todos') return transacoes;
    return transacoes.filter((tx) => {
      const entrada = ehEntrada(tx.tipo, perfil);
      return filtro === 'entradas' ? entrada : !entrada;
    });
  }, [transacoes, filtro, perfil]);

  return (
    <section className="card">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">
            <Coins size={20} style={{ color: 'var(--coin)' }} />
            Extrato da conta
          </h2>
          <p className="card-subtitle">
            Histórico completo de créditos, reconhecimentos e resgates
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={carregar}
          disabled={carregando}
        >
          <RefreshCw size={14} className={carregando ? 'spin' : ''} />
          {carregando ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      <div className="kpi-strip" style={{ marginBottom: '1.15rem' }}>
        <div className="kpi-card kpi-card-highlight">
          <div>
            <div className="kpi-label">Saldo disponível</div>
            <div className="kpi-value">
              <AnimatedNumber value={saldo} />
            </div>
            <div className="kpi-meta">moedas estudantis</div>
          </div>
          <div className="kpi-icon kpi-icon-coin">
            <Coins size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Total recebido</div>
            <div className="kpi-value" style={{ color: 'var(--success)' }}>
              +<AnimatedNumber value={resumo.entradas} />
            </div>
            <div className="kpi-meta">créditos e prêmios</div>
          </div>
          <div className="kpi-icon kpi-icon-success">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">{perfil === 'ALUNO' ? 'Total resgatado' : 'Total enviado'}</div>
            <div className="kpi-value">
              <AnimatedNumber value={resumo.saidas} />
            </div>
            <div className="kpi-meta">
              {perfil === 'ALUNO' ? 'em vantagens' : 'para alunos'}
            </div>
          </div>
          <div className="kpi-icon kpi-icon-accent">
            <TrendingDown size={20} />
          </div>
        </div>
      </div>

      <div className="quick-pills" style={{ marginBottom: '1rem' }} role="group" aria-label="Filtrar transações">
        {[
          { id: 'todos', label: `Todas (${transacoes.length})` },
          { id: 'entradas', label: 'Entradas' },
          { id: 'saidas', label: perfil === 'ALUNO' ? 'Resgates' : 'Envios' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            className={`pill-btn ${filtro === item.id ? 'active' : ''}`}
            onClick={() => setFiltro(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {erro && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{erro}</span>
        </div>
      )}

      {carregando ? (
        <ListSkeleton rows={4} />
      ) : filtradas.length === 0 ? (
        <div className="empty-panel">
          <BotAvatar size={74} state="waiting" mood="neutral" material="fluffy" followPointer />
          <h3>Nenhuma transação encontrada</h3>
          <p>
            {transacoes.length === 0
              ? 'Assim que houver créditos, reconhecimentos ou resgates, eles aparecerão aqui.'
              : 'Nenhuma transação corresponde ao filtro selecionado.'}
          </p>
        </div>
      ) : (
        <div className="tx-list">
          {filtradas.map((transacao, idx) => {
            const entrada = ehEntrada(transacao.tipo, perfil);
            return (
              <motion.div
                key={transacao.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: Math.min(idx * 0.03, 0.24) }}
                className="tx-row"
              >
                <div className="tx-left">
                  <div className={`tx-icon ${entrada ? 'tx-icon-in' : 'tx-icon-out'}`}>
                    {entrada ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="tx-info">
                    <div className="tx-title">{rotuloTipo(transacao.tipo, perfil)}</div>
                    <div className="tx-detail">{detalhe(transacao, perfil)}</div>
                    <div className="tx-date">
                      {new Date(transacao.dataHora).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className={`tx-amount ${entrada ? 'tx-amount-in' : 'tx-amount-out'}`}>
                  {entrada ? '+' : '−'}
                  {transacao.valorMoedas}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
