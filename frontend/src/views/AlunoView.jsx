import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  Gift,
  ImageOff,
  ReceiptText,
  Search,
  Sparkles,
  Ticket,
  Trash2,
  User,
} from 'lucide-react';
import {
  listarInstituicoes,
  buscarAlunoPorId,
  criarAluno,
  atualizarAluno,
  excluirAluno,
  consultarExtrato,
  listarVantagens,
  resgatarVantagem,
  listarMeusCupons,
} from '../services/api';
import { enviarCupomAluno, enviarConferenciaParceiro } from '../services/emailjs';
import Extrato from '../components/Extrato';
import AnimatedNumber from '../components/AnimatedNumber';
import BotAvatar from '../components/BotAvatar';
import { CatalogSkeleton, ListSkeleton } from '../components/Skeletons';
import { ConfirmModal, CupomModal } from '../components/ConfirmModal';
import { useMascot } from '../contexts/MascotContext';
import { useToast } from '../contexts/ToastContext';

const INITIAL_FORM = {
  nome: '',
  email: '',
  login: '',
  senha: '',
  cpf: '',
  rg: '',
  endereco: '',
  curso: '',
  instituicaoEnsinoId: '',
};

function formDoAluno(aluno) {
  if (!aluno) return INITIAL_FORM;
  return {
    nome: aluno.nome || '',
    email: aluno.email || '',
    login: aluno.login || '',
    senha: '',
    cpf: aluno.cpf || '',
    rg: aluno.rg || '',
    endereco: aluno.endereco || '',
    curso: aluno.curso || '',
    instituicaoEnsinoId:
      aluno.instituicaoEnsinoId !== null && aluno.instituicaoEnsinoId !== undefined
        ? String(aluno.instituicaoEnsinoId)
        : '',
  };
}

function formatarData(valor) {
  if (!valor) return '—';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleString('pt-BR');
}

function ImagemVantagem({ src, alt }) {
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    setFalhou(false);
  }, [src]);

  if (!src || falhou) {
    return (
      <div className="vantagem-media-fallback">
        <ImageOff size={26} />
        <span>Imagem indisponível</span>
      </div>
    );
  }

  return <img src={src} alt={alt} onError={() => setFalhou(true)} />;
}

export function AlunoForm({ alunoInicial = null, onSalvo }) {
  const edicao = alunoInicial !== null;
  const [instituicoes, setInstituicoes] = useState([]);
  const [form, setForm] = useState(() => formDoAluno(alunoInicial));
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const { react } = useMascot();
  const { notify } = useToast();

  useEffect(() => {
    let ativo = true;
    listarInstituicoes()
      .then((lista) => {
        if (ativo) setInstituicoes(Array.isArray(lista) ? lista : []);
      })
      .catch((err) => {
        if (ativo) setErro(err.message || 'Não foi possível carregar as instituições.');
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    setForm(formDoAluno(alunoInicial));
  }, [alunoInicial]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function limparFormulario() {
    setForm(formDoAluno(alunoInicial));
    setErro('');
    setSucesso('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSucesso('');
    setErro('');
    setSalvando(true);
    react('Salvando seus dados de estudante...', { nextState: 'working', nextMood: 'neutral', durationMs: 0 });

    const payload = {
      ...form,
      instituicaoEnsinoId: Number(form.instituicaoEnsinoId),
    };

    try {
      let salvo;
      if (edicao) {
        salvo = await atualizarAluno(alunoInicial.id, payload);
        setSucesso('Seus dados foram atualizados com sucesso.');
        setForm((prev) => ({ ...prev, senha: '' }));
        react('Perfil atualizado!', { nextState: 'done', nextMood: 'happy' });
        notify('Dados do aluno atualizados!', 'success');
      } else {
        salvo = await criarAluno(payload);
        setSucesso('Aluno cadastrado com sucesso.');
        setForm(INITIAL_FORM);
        react('Conta de aluno criada! Bem-vindo(a)!', { nextState: 'done', nextMood: 'happy' });
      }
      onSalvo?.(salvo);
    } catch (err) {
      const msg = err.message || 'Erro ao salvar os dados do aluno.';
      setErro(msg);
      react(msg, { nextState: 'blocked', nextMood: 'neutral', durationMs: 5000 });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">
            <User size={20} style={{ color: 'var(--accent)' }} />
            {edicao ? 'Meus dados' : 'Cadastro de aluno'}
          </h2>
          <p className="card-subtitle">
            {edicao
              ? 'Mantenha seus dados acadêmicos e de contato atualizados.'
              : 'Crie sua conta para receber moedas dos professores e resgatar vantagens.'}
          </p>
        </div>
      </div>

      {sucesso && (
        <div className="alert alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>{sucesso}</span>
        </div>
      )}
      {erro && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{erro}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="aluno-nome">Nome completo *</label>
            <input
              id="aluno-nome"
              name="nome"
              type="text"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex.: Ana Clara Souza"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="aluno-email">E-mail *</label>
            <input
              id="aluno-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Ex.: ana.souza@sga.pucminas.br"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="aluno-login">Login *</label>
            <input
              id="aluno-login"
              name="login"
              type="text"
              value={form.login}
              onChange={handleChange}
              placeholder="Ex.: anaclara"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="aluno-senha">Senha {edicao ? '(opcional)' : '*'}</label>
            <input
              id="aluno-senha"
              name="senha"
              type="password"
              value={form.senha}
              onChange={handleChange}
              placeholder={
                edicao ? 'Deixe em branco para manter a senha atual' : 'Informe a senha de acesso'
              }
              required={!edicao}
            />
          </div>

          <div className="form-group">
            <label htmlFor="aluno-cpf">CPF *</label>
            <input
              id="aluno-cpf"
              name="cpf"
              type="text"
              value={form.cpf}
              onChange={handleChange}
              placeholder="Ex.: 123.456.789-00"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="aluno-rg">RG *</label>
            <input
              id="aluno-rg"
              name="rg"
              type="text"
              value={form.rg}
              onChange={handleChange}
              placeholder="Ex.: MG-12.345.678"
              required
            />
          </div>

          <div className="form-group form-span-2">
            <label htmlFor="aluno-endereco">Endereço *</label>
            <input
              id="aluno-endereco"
              name="endereco"
              type="text"
              value={form.endereco}
              onChange={handleChange}
              placeholder="Ex.: Rua das Flores, 120 - Lourdes, Belo Horizonte - MG"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="aluno-curso">Curso *</label>
            <input
              id="aluno-curso"
              name="curso"
              type="text"
              value={form.curso}
              onChange={handleChange}
              placeholder="Ex.: Engenharia de Software"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="aluno-instituicao">Instituição de ensino *</label>
            <select
              id="aluno-instituicao"
              name="instituicaoEnsinoId"
              value={form.instituicaoEnsinoId}
              onChange={handleChange}
              required
            >
              <option value="">Selecione uma instituição</option>
              {instituicoes.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '1.2rem' }}>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : edicao ? 'Salvar alterações' : 'Criar conta de aluno'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={limparFormulario}
            disabled={salvando}
          >
            {edicao ? 'Desfazer alterações' : 'Limpar'}
          </button>
        </div>
      </form>
    </section>
  );
}

function VantagensAluno({ onResgateConcluido }) {
  const [saldo, setSaldo] = useState(0);
  const [vantagens, setVantagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [confirmando, setConfirmando] = useState(null);
  const [resgatandoId, setResgatandoId] = useState(null);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null);
  const [busca, setBusca] = useState('');
  const [somenteAcessiveis, setSomenteAcessiveis] = useState(false);

  const { react } = useMascot();
  const { notify } = useToast();

  useEffect(() => {
    let ativo = true;
    Promise.all([consultarExtrato(), listarVantagens()])
      .then(([extrato, lista]) => {
        if (!ativo) return;
        setSaldo(extrato?.saldoMoedas ?? 0);
        setVantagens(Array.isArray(lista) ? lista : []);
      })
      .catch((err) => {
        if (ativo) setErro(err.message || 'Não foi possível carregar as vantagens.');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const acessiveisCount = useMemo(
    () => vantagens.filter((v) => saldo >= v.custoMoedas).length,
    [vantagens, saldo],
  );

  const vantagensFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return vantagens.filter((v) => {
      if (somenteAcessiveis && saldo < v.custoMoedas) return false;
      if (!termo) return true;
      return (
        v.titulo?.toLowerCase().includes(termo) ||
        v.descricao?.toLowerCase().includes(termo) ||
        v.empresaNome?.toLowerCase().includes(termo)
      );
    });
  }, [vantagens, busca, somenteAcessiveis, saldo]);

  async function confirmarResgate() {
    if (!confirmando) return;
    const vantagem = confirmando;
    setErro('');
    setResultado(null);
    setResgatandoId(vantagem.id);
    react(`Resgatando "${vantagem.titulo}"...`, {
      nextState: 'working',
      nextMood: 'neutral',
      durationMs: 0,
    });

    try {
      const cupom = await resgatarVantagem(vantagem.id);
      const [emailAluno, emailParceiro] = await Promise.all([
        enviarCupomAluno(cupom),
        enviarConferenciaParceiro(cupom),
      ]);
      setConfirmando(null);
      setResultado({ cupom, emails: [emailAluno, emailParceiro] });
      react(`Parabéns! Cupom ${cupom.codigoGerado} gerado com sucesso!`, {
        nextState: 'done',
        nextMood: 'happy',
        durationMs: 6000,
      });
      notify(`Cupom ${cupom.codigoGerado} resgatado!`, 'success');
      onResgateConcluido?.();

      try {
        const extrato = await consultarExtrato();
        setSaldo(extrato?.saldoMoedas ?? 0);
      } catch {
        if (cupom?.saldoRestanteAluno !== undefined) setSaldo(cupom.saldoRestanteAluno);
      }
    } catch (err) {
      const msg = err.message || 'Não foi possível resgatar a vantagem.';
      setErro(msg);
      setConfirmando(null);
      react(msg, { nextState: 'blocked', nextMood: 'neutral', durationMs: 5000 });
      notify(msg, 'error');
    } finally {
      setResgatandoId(null);
    }
  }

  return (
    <div>
      <div className="kpi-strip">
        <div className="kpi-card kpi-card-highlight">
          <div>
            <div className="kpi-label">Seu saldo</div>
            <div className="kpi-value">
              <AnimatedNumber value={saldo} />
            </div>
            <div className="kpi-meta">moedas disponíveis</div>
          </div>
          <div className="kpi-icon kpi-icon-coin">
            <Coins size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Catálogo ativo</div>
            <div className="kpi-value">
              <AnimatedNumber value={vantagens.length} />
            </div>
            <div className="kpi-meta">vantagens cadastradas</div>
          </div>
          <div className="kpi-icon kpi-icon-accent">
            <Gift size={20} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Ao seu alcance</div>
            <div className="kpi-value" style={{ color: 'var(--success)' }}>
              <AnimatedNumber value={acessiveisCount} />
            </div>
            <div className="kpi-meta">disponíveis com seu saldo</div>
          </div>
          <div className="kpi-icon kpi-icon-success">
            <Sparkles size={20} />
          </div>
        </div>
      </div>

      <section className="card">
        <div className="catalog-toolbar">
          <div className="card-title-group">
            <h2 className="card-title">
              <Gift size={20} style={{ color: 'var(--accent)' }} />
              Catálogo de vantagens
            </h2>
            <p className="card-subtitle">Troque suas moedas por benefícios das empresas parceiras</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div className="search-input-wrap">
              <Search size={15} />
              <input
                type="search"
                placeholder="Buscar vantagem ou parceiro..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Buscar vantagens"
              />
            </div>

            <button
              type="button"
              className={`pill-btn ${somenteAcessiveis ? 'active' : ''}`}
              onClick={() => setSomenteAcessiveis((prev) => !prev)}
            >
              Posso resgatar ({acessiveisCount})
            </button>
          </div>
        </div>

        {erro && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{erro}</span>
          </div>
        )}

        {carregando ? (
          <CatalogSkeleton count={6} />
        ) : vantagensFiltradas.length === 0 ? (
          <div className="empty-panel">
            <BotAvatar size={78} state="waiting" mood="neutral" material="fluffy" followPointer />
            <h3>Nenhuma vantagem encontrada</h3>
            <p>
              {vantagens.length === 0
                ? 'Ainda não há vantagens cadastradas pelas empresas parceiras.'
                : 'Tente limpar a busca ou desativar o filtro de saldo para ver todo o catálogo.'}
            </p>
            {(busca || somenteAcessiveis) && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setBusca('');
                  setSomenteAcessiveis(false);
                }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="vantagens-grid">
            {vantagensFiltradas.map((vantagem, idx) => {
              const insuficiente = saldo < vantagem.custoMoedas;
              const faltam = Math.max(0, vantagem.custoMoedas - saldo);
              return (
                <motion.article
                  key={vantagem.id}
                  className="vantagem-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.04, 0.28) }}
                  whileHover={{ y: -3 }}
                >
                  <div className="vantagem-media">
                    <ImagemVantagem src={vantagem.fotoProduto} alt={vantagem.titulo} />
                    <span className="vantagem-price-tag">
                      <Coins size={13} />
                      {vantagem.custoMoedas} moedas
                    </span>
                  </div>

                  <div className="vantagem-body">
                    <span className="vantagem-partner">{vantagem.empresaNome}</span>
                    <h3 className="vantagem-title">{vantagem.titulo}</h3>
                    <p className="vantagem-desc">{vantagem.descricao}</p>

                    <div className="vantagem-footer">
                      {insuficiente ? (
                        <span className="form-hint">Faltam {faltam} moedas</span>
                      ) : (
                        <span className="badge badge-success">Disponível</span>
                      )}

                      <motion.button
                        type="button"
                        className={`btn btn-sm ${insuficiente ? 'btn-secondary' : 'btn-coin'}`}
                        onClick={() => setConfirmando(vantagem)}
                        disabled={insuficiente || resgatandoId !== null}
                        whileTap={{ scale: 0.96 }}
                      >
                        {insuficiente
                          ? 'Saldo insuficiente'
                          : resgatandoId === vantagem.id
                            ? 'Resgatando...'
                            : 'Resgatar'}
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmModal
        open={Boolean(confirmando)}
        title="Confirmar resgate"
        description={
          confirmando
            ? `Deseja resgatar "${confirmando.titulo}" (${confirmando.empresaNome}) por ${confirmando.custoMoedas} moedas? Seu saldo restante será de ${Math.max(
                0,
                saldo - confirmando.custoMoedas,
              )} moedas.`
            : ''
        }
        confirmLabel="Confirmar resgate"
        loading={resgatandoId !== null}
        onConfirm={confirmarResgate}
        onClose={() => setConfirmando(null)}
      />

      <CupomModal resultado={resultado} onClose={() => setResultado(null)} />
    </div>
  );
}

function MeusCupons() {
  const [cupons, setCupons] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [copiadoId, setCopiadoId] = useState(null);
  const { notify } = useToast();

  useEffect(() => {
    let ativo = true;
    listarMeusCupons()
      .then((lista) => {
        if (ativo) setCupons(Array.isArray(lista) ? lista : []);
      })
      .catch((err) => {
        if (ativo) setErro(err.message || 'Não foi possível carregar os cupons.');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function copiar(cupom) {
    try {
      await navigator.clipboard.writeText(cupom.codigoGerado);
      setCopiadoId(cupom.id);
      notify(`Código ${cupom.codigoGerado} copiado!`, 'success', 2500);
      window.setTimeout(() => setCopiadoId(null), 2000);
    } catch {
      notify('Não foi possível copiar o código.', 'error');
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">
            <Ticket size={20} style={{ color: 'var(--accent)' }} />
            Meus cupons ({cupons.length})
          </h2>
          <p className="card-subtitle">
            Apresente o código de conferência presencialmente na empresa parceira
          </p>
        </div>
      </div>

      {erro && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{erro}</span>
        </div>
      )}

      {carregando ? (
        <ListSkeleton rows={3} />
      ) : cupons.length === 0 ? (
        <div className="empty-panel">
          <BotAvatar size={78} state="waiting" mood="neutral" material="fluffy" followPointer />
          <h3>Você ainda não resgatou nenhum cupom</h3>
          <p>Explore a aba Vantagens para trocar suas moedas acumuladas por benefícios.</p>
        </div>
      ) : (
        <div className="cupons-grid">
          {cupons.map((cupom, idx) => (
            <motion.article
              key={cupom.id}
              className="cupom-ticket"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(idx * 0.04, 0.24) }}
            >
              <div className="cupom-ticket-top">
                <div>
                  <span className="vantagem-partner">{cupom.empresaNome}</span>
                  <h3 className="vantagem-title" style={{ marginTop: 2 }}>
                    {cupom.vantagemTitulo}
                  </h3>
                </div>
                <span className="badge badge-coins">
                  <Coins size={12} />
                  {cupom.custoMoedas}
                </span>
              </div>

              <div className="cupom-ticket-code-row">
                <span className="cupom-codigo">{cupom.codigoGerado}</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => copiar(cupom)}
                >
                  {copiadoId === cupom.id ? <Check size={14} /> : <Copy size={14} />}
                  {copiadoId === cupom.id ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              <div className="tx-date">Resgatado em {formatarData(cupom.dataGeracao)}</div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}

function PerfilAluno({ sessao, onSair }) {
  const [aluno, setAluno] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    let ativo = true;
    buscarAlunoPorId(sessao.id)
      .then((dados) => {
        if (ativo) setAluno(dados);
      })
      .catch((err) => {
        if (ativo) setErro(err.message || 'Não foi possível carregar seus dados.');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [sessao.id]);

  async function handleExcluir() {
    setExcluindo(true);
    setErro('');
    try {
      await excluirAluno(sessao.id);
      notify('Conta excluída com sucesso.', 'success');
      onSair();
    } catch (err) {
      setErro(err.message || 'Não foi possível excluir a conta.');
      setConfirmarExclusao(false);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div>
      {erro && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{erro}</span>
        </div>
      )}

      {carregando ? (
        <section className="card">
          <ListSkeleton rows={4} />
        </section>
      ) : (
        aluno && (
          <>
            <AlunoForm
              alunoInicial={aluno}
              onSalvo={(salvo) => {
                if (salvo) setAluno(salvo);
              }}
            />

            <div className="danger-zone">
              <div>
                <h3>Zona de perigo</h3>
                <p>Excluir sua conta remove seu acesso permanentemente. Esta ação não pode ser desfeita.</p>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setConfirmarExclusao(true)}
              >
                <Trash2 size={15} />
                Excluir minha conta
              </button>
            </div>
          </>
        )
      )}

      <ConfirmModal
        open={confirmarExclusao}
        title="Excluir conta de aluno?"
        description="Esta ação remove sua conta permanentemente e não pode ser desfeita."
        confirmLabel="Excluir conta"
        variant="danger"
        loading={excluindo}
        onConfirm={handleExcluir}
        onClose={() => setConfirmarExclusao(false)}
      />
    </div>
  );
}

const ABAS = [
  { id: 'vantagens', rotulo: 'Vantagens', icon: Gift },
  { id: 'cupons', rotulo: 'Meus cupons', icon: Ticket },
  { id: 'extrato', rotulo: 'Extrato', icon: ReceiptText },
  { id: 'perfil', rotulo: 'Meu perfil', icon: User },
];

export default function AlunoView({ sessao, onSair }) {
  const [aba, setAba] = useState('vantagens');
  const [extratoKey, setExtratoKey] = useState(0);
  const { setContext } = useMascot();

  useEffect(() => {
    setContext(`aluno:${aba}`);
  }, [aba, setContext]);

  return (
    <div>
      <nav className="tabs-bar" aria-label="Navegação do aluno">
        {ABAS.map((item) => {
          const Icon = item.icon;
          const ativo = aba === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`tab-btn ${ativo ? 'active' : ''}`}
              onClick={() => setAba(item.id)}
            >
              {ativo && (
                <motion.span
                  layoutId="aluno-tab-pill"
                  className="tab-btn-indicator"
                  transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                />
              )}
              <Icon size={15} />
              <span>{item.rotulo}</span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={aba}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {aba === 'vantagens' && (
            <VantagensAluno onResgateConcluido={() => setExtratoKey((k) => k + 1)} />
          )}
          {aba === 'cupons' && <MeusCupons />}
          {aba === 'extrato' && <Extrato perfil="ALUNO" recarregar={extratoKey} />}
          {aba === 'perfil' && <PerfilAluno sessao={sessao} onSair={onSair} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
