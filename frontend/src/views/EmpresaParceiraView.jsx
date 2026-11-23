import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Coins,
  Edit3,
  Gift,
  ImageOff,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import {
  buscarEmpresaPorId,
  criarEmpresa,
  atualizarEmpresa,
  excluirEmpresa,
  listarMinhasVantagens,
  criarVantagem,
  atualizarVantagem,
  excluirVantagem,
} from '../services/api';
import BotAvatar from '../components/BotAvatar';
import { ConfirmModal } from '../components/ConfirmModal';
import { ListSkeleton } from '../components/Skeletons';
import { useMascot } from '../contexts/MascotContext';
import { useToast } from '../contexts/ToastContext';

const ESTADO_INICIAL_FORM = {
  nome: '',
  cnpj: '',
  email: '',
  login: '',
  senha: '',
  descricao: '',
};

const ESTADO_INICIAL_VANTAGEM = {
  titulo: '',
  descricao: '',
  fotoProduto: '',
  custoMoedas: '',
};

function PreviewImagem({ src, alt }) {
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    setFalhou(false);
  }, [src]);

  if (!src || falhou) {
    return (
      <div className="vantagem-media-fallback">
        <ImageOff size={24} />
        <span>{src ? 'Não foi possível carregar a imagem' : 'Informe uma URL de imagem'}</span>
      </div>
    );
  }

  return <img src={src} alt={alt} onError={() => setFalhou(true)} />;
}

export function EmpresaParceiraForm({ empresaInicial = null, onSalvo }) {
  const edicao = Boolean(empresaInicial);
  const [form, setForm] = useState(ESTADO_INICIAL_FORM);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  const { react } = useMascot();
  const { notify } = useToast();

  useEffect(() => {
    if (empresaInicial) {
      setForm({
        nome: empresaInicial.nome || '',
        cnpj: empresaInicial.cnpj || '',
        email: empresaInicial.email || '',
        login: empresaInicial.login || '',
        senha: '',
        descricao: empresaInicial.descricao || '',
      });
    } else {
      setForm(ESTADO_INICIAL_FORM);
    }
  }, [empresaInicial]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagemSucesso('');
    setMensagemErro('');
    setSalvando(true);
    react('Salvando dados da empresa parceira...', {
      nextState: 'working',
      nextMood: 'neutral',
      durationMs: 0,
    });

    const payload = {
      nome: form.nome.trim(),
      cnpj: form.cnpj.trim(),
      email: form.email.trim(),
      login: form.login.trim(),
      senha: form.senha,
      descricao: form.descricao.trim(),
    };

    try {
      let empresaSalva;
      if (edicao) {
        empresaSalva = await atualizarEmpresa(empresaInicial.id, payload);
        if (!empresaSalva) {
          const { senha, ...semSenha } = payload;
          empresaSalva = { ...empresaInicial, ...semSenha };
        }
        setMensagemSucesso('Dados da empresa atualizados com sucesso!');
        react('Perfil da empresa atualizado!', { nextState: 'done', nextMood: 'happy' });
        notify('Dados da empresa atualizados!', 'success');
      } else {
        empresaSalva = await criarEmpresa(payload);
        setForm(ESTADO_INICIAL_FORM);
        setMensagemSucesso('Empresa parceira cadastrada com sucesso!');
        react('Empresa parceira cadastrada!', { nextState: 'done', nextMood: 'happy' });
      }
      onSalvo?.(empresaSalva);
    } catch (error) {
      const msg = error.message || 'Erro ao salvar os dados da empresa parceira.';
      setMensagemErro(msg);
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
            <Building2 size={20} style={{ color: 'var(--accent)' }} />
            {edicao ? 'Dados da empresa' : 'Cadastro de empresa parceira'}
          </h2>
          <p className="card-subtitle">
            {edicao
              ? 'Atualize as informações corporativas e o e-mail de conferência de cupons.'
              : 'Cadastre sua empresa para publicar benefícios no catálogo estudantil.'}
          </p>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="alert alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {mensagemErro && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{mensagemErro}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label htmlFor="empresa-nome">Razão Social / Nome Fantasia *</label>
          <input
            id="empresa-nome"
            name="nome"
            type="text"
            required
            placeholder="Ex.: Livraria Acadêmica Ltda"
            value={form.nome}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="empresa-cnpj">CNPJ *</label>
          <input
            id="empresa-cnpj"
            name="cnpj"
            type="text"
            required
            placeholder="Ex.: 12.345.678/0001-90"
            value={form.cnpj}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="empresa-email">E-mail Institucional *</label>
          <input
            id="empresa-email"
            name="email"
            type="email"
            required
            placeholder="Ex.: contato@parceira.com.br"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="empresa-login">Login de Acesso *</label>
          <input
            id="empresa-login"
            name="login"
            type="text"
            required
            placeholder="Ex.: livraria.academica"
            value={form.login}
            onChange={handleChange}
          />
        </div>

        <div className="form-group form-span-2">
          <label htmlFor="empresa-senha">
            Senha {edicao ? '(opcional na edição)' : '*'}
          </label>
          <input
            id="empresa-senha"
            name="senha"
            type="password"
            required={!edicao}
            placeholder={
              edicao ? 'Deixe em branco para manter a senha atual' : 'Informe a senha de acesso'
            }
            value={form.senha}
            onChange={handleChange}
          />
        </div>

        <div className="form-group form-span-2">
          <label htmlFor="empresa-descricao">Descrição / Ramo de Atuação</label>
          <textarea
            id="empresa-descricao"
            name="descricao"
            rows={3}
            placeholder="Ex.: Descontos em livros técnicos, materiais de papelaria e cursos."
            value={form.descricao}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions form-span-2">
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : edicao ? 'Salvar alterações' : 'Cadastrar empresa'}
          </button>
        </div>
      </form>
    </section>
  );
}

function MinhasVantagens({ nomeEmpresa }) {
  const [vantagens, setVantagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(ESTADO_INICIAL_VANTAGEM);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindoAlvo, setExcluindoAlvo] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const { react } = useMascot();
  const { notify } = useToast();

  async function carregarVantagens() {
    setCarregando(true);
    setMensagemErro('');
    try {
      const lista = await listarMinhasVantagens();
      setVantagens(Array.isArray(lista) ? lista : []);
    } catch (error) {
      setMensagemErro(error.message || 'Não foi possível carregar as vantagens.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarVantagens();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function iniciarEdicao(vantagem) {
    setEditandoId(vantagem.id);
    setForm({
      titulo: vantagem.titulo || '',
      descricao: vantagem.descricao || '',
      fotoProduto: vantagem.fotoProduto || '',
      custoMoedas: vantagem.custoMoedas !== undefined ? String(vantagem.custoMoedas) : '',
    });
    setMensagemErro('');
    react(`Editando "${vantagem.titulo}".`, { nextState: 'thinking', nextMood: 'neutral', durationMs: 3000 });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(ESTADO_INICIAL_VANTAGEM);
    setMensagemErro('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagemErro('');
    setSalvando(true);
    react(editandoId !== null ? 'Atualizando vantagem...' : 'Publicando nova vantagem...', {
      nextState: 'working',
      nextMood: 'neutral',
      durationMs: 0,
    });

    const payload = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      fotoProduto: form.fotoProduto.trim(),
      custoMoedas: Number(form.custoMoedas),
    };

    try {
      if (editandoId !== null) {
        await atualizarVantagem(editandoId, payload);
        notify('Vantagem atualizada com sucesso!', 'success');
        react('Vantagem atualizada no catálogo!', { nextState: 'done', nextMood: 'happy' });
      } else {
        await criarVantagem(payload);
        notify('Vantagem cadastrada no catálogo!', 'success');
        react('Nova vantagem publicada para os estudantes!', { nextState: 'done', nextMood: 'happy' });
      }
      setEditandoId(null);
      setForm(ESTADO_INICIAL_VANTAGEM);
      await carregarVantagens();
    } catch (error) {
      const msg = error.message || 'Erro ao salvar a vantagem.';
      setMensagemErro(msg);
      react(msg, { nextState: 'blocked', nextMood: 'neutral', durationMs: 5000 });
      notify(msg, 'error');
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    if (!excluindoAlvo) return;
    setExcluindo(true);
    setMensagemErro('');
    try {
      await excluirVantagem(excluindoAlvo.id);
      if (editandoId === excluindoAlvo.id) {
        cancelarEdicao();
      }
      notify(`Vantagem "${excluindoAlvo.titulo}" removida do catálogo.`, 'success');
      react('Vantagem desativada.', { nextState: 'idle', nextMood: 'neutral' });
      setExcluindoAlvo(null);
      await carregarVantagens();
    } catch (error) {
      const msg = error.message || 'Erro ao excluir a vantagem.';
      setMensagemErro(msg);
      notify(msg, 'error');
      setExcluindoAlvo(null);
    } finally {
      setExcluindo(false);
    }
  }

  const temPreview = form.titulo.trim() || form.descricao.trim() || form.fotoProduto.trim() || form.custoMoedas;

  return (
    <div>
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
                {editandoId !== null ? <Edit3 size={19} style={{ color: 'var(--accent)' }} /> : <Plus size={20} style={{ color: 'var(--accent)' }} />}
                {editandoId !== null ? 'Editar vantagem' : 'Nova vantagem'}
              </h2>
              <p className="card-subtitle">
                Publique produtos ou descontos que alunos podem resgatar com moedas
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-grid form-grid-single">
            <div className="form-group">
              <label htmlFor="vantagem-titulo">Título *</label>
              <input
                id="vantagem-titulo"
                name="titulo"
                type="text"
                required
                placeholder="Ex.: 20% de desconto em livros técnicos"
                value={form.titulo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="vantagem-descricao">Descrição *</label>
              <textarea
                id="vantagem-descricao"
                name="descricao"
                rows={3}
                required
                placeholder="Descreva a vantagem oferecida ao aluno."
                value={form.descricao}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="vantagem-foto">URL da foto do produto *</label>
              <input
                id="vantagem-foto"
                name="fotoProduto"
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={form.fotoProduto}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="vantagem-custo">Custo em moedas *</label>
              <input
                id="vantagem-custo"
                name="custoMoedas"
                type="number"
                min="1"
                step="1"
                required
                placeholder="Ex.: 50"
                value={form.custoMoedas}
                onChange={handleChange}
              />
            </div>

            {temPreview && (
              <div className="preview-box">
                <div className="preview-label">Pré-visualização no catálogo</div>
                <article className="vantagem-card" style={{ pointerEvents: 'none' }}>
                  <div className="vantagem-media" style={{ height: 140 }}>
                    <PreviewImagem src={form.fotoProduto.trim()} alt={form.titulo || 'Prévia'} />
                    {form.custoMoedas && (
                      <span className="vantagem-price-tag">
                        <Coins size={12} />
                        {form.custoMoedas} moedas
                      </span>
                    )}
                  </div>
                  <div className="vantagem-body" style={{ padding: '0.85rem' }}>
                    <span className="vantagem-partner">{nomeEmpresa || 'Sua empresa'}</span>
                    <h3 className="vantagem-title">{form.titulo.trim() || 'Título da vantagem'}</h3>
                    <p className="vantagem-desc">
                      {form.descricao.trim() || 'Descrição aparecerá aqui...'}
                    </p>
                  </div>
                </article>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? 'Salvando...' : editandoId !== null ? 'Salvar alterações' : 'Publicar vantagem'}
              </button>

              {editandoId !== null && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelarEdicao}
                  disabled={salvando}
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">
                <Gift size={20} style={{ color: 'var(--coin)' }} />
                Vantagens cadastradas ({vantagens.length})
              </h2>
              <p className="card-subtitle">Gerencie os itens ativos visíveis aos estudantes</p>
            </div>
          </div>

          {carregando ? (
            <ListSkeleton rows={4} />
          ) : vantagens.length === 0 ? (
            <div className="empty-panel">
              <BotAvatar size={76} state="waiting" mood="neutral" material="fluffy" followPointer />
              <h3>Nenhuma vantagem cadastrada ainda</h3>
              <p>Use o formulário ao lado para publicar o primeiro benefício da sua empresa.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Vantagem</th>
                    <th>Custo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vantagens.map((vantagem) => (
                    <tr key={vantagem.id}>
                      <td>
                        {vantagem.fotoProduto ? (
                          <img
                            className="vantagem-thumb"
                            src={vantagem.fotoProduto}
                            alt={`Foto de ${vantagem.titulo}`}
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <strong>{vantagem.titulo}</strong>
                        <div className="form-hint" style={{ marginTop: 2 }}>
                          {vantagem.descricao || '—'}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-coins">
                          <Coins size={12} />
                          {vantagem.custoMoedas}
                        </span>
                      </td>
                      <td>
                        <div className="form-actions" style={{ marginTop: 0 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => iniciarEdicao(vantagem)}
                          >
                            <Edit3 size={13} />
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => setExcluindoAlvo(vantagem)}
                          >
                            <Trash2 size={13} />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        open={Boolean(excluindoAlvo)}
        title="Remover vantagem do catálogo?"
        description={
          excluindoAlvo
            ? `A vantagem "${excluindoAlvo.titulo}" será desativada e não aparecerá mais para novos resgates.`
            : ''
        }
        confirmLabel="Remover vantagem"
        variant="danger"
        loading={excluindo}
        onConfirm={confirmarExclusao}
        onClose={() => setExcluindoAlvo(null)}
      />
    </div>
  );
}

function MeuPerfil({ sessao, onSair }) {
  const [empresa, setEmpresa] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setMensagemErro('');
    buscarEmpresaPorId(sessao.id)
      .then((dados) => {
        if (ativo) setEmpresa(dados);
      })
      .catch((error) => {
        if (ativo) setMensagemErro(error.message || 'Não foi possível carregar os dados da empresa.');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [sessao.id]);

  async function handleExcluirConta() {
    setExcluindo(true);
    setMensagemErro('');
    try {
      await excluirEmpresa(sessao.id);
      notify('Conta da empresa excluída com sucesso.', 'success');
      onSair();
    } catch (error) {
      setMensagemErro(error.message || 'Erro ao excluir a conta.');
      setConfirmarExclusao(false);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div>
      {mensagemErro && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{mensagemErro}</span>
        </div>
      )}

      {carregando ? (
        <section className="card">
          <ListSkeleton rows={4} />
        </section>
      ) : (
        empresa && (
          <>
            <EmpresaParceiraForm empresaInicial={empresa} onSalvo={setEmpresa} />

            <div className="danger-zone">
              <div>
                <h3>Zona de perigo</h3>
                <p>Excluir sua conta de empresa parceira é permanente e não pode ser desfeito.</p>
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
        title="Excluir conta de empresa parceira?"
        description="Esta ação é permanente e não pode ser desfeita."
        confirmLabel="Excluir conta"
        variant="danger"
        loading={excluindo}
        onConfirm={handleExcluirConta}
        onClose={() => setConfirmarExclusao(false)}
      />
    </div>
  );
}

const ABAS = [
  { id: 'vantagens', rotulo: 'Minhas vantagens', icon: Gift },
  { id: 'perfil', rotulo: 'Meu perfil', icon: User },
];

export default function EmpresaParceiraView({ sessao, onSair }) {
  const [aba, setAba] = useState('vantagens');
  const { setContext } = useMascot();

  useEffect(() => {
    setContext(`empresa:${aba}`);
  }, [aba, setContext]);

  return (
    <div>
      <nav className="tabs-bar" aria-label="Navegação da empresa parceira">
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
                  layoutId="empresa-tab-pill"
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
          {aba === 'vantagens' ? (
            <MinhasVantagens nomeEmpresa={sessao?.nome} />
          ) : (
            <MeuPerfil sessao={sessao} onSair={onSair} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
