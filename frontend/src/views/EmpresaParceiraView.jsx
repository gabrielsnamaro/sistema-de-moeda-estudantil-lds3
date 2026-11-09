import { useEffect, useState } from 'react';
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

function formDaEmpresa(empresa) {
  return {
    nome: empresa?.nome || '',
    cnpj: empresa?.cnpj || '',
    email: empresa?.email || '',
    login: empresa?.login || '',
    senha: '',
    descricao: empresa?.descricao || '',
  };
}

export function EmpresaParceiraForm({ empresaInicial = null, onSalvo }) {
  const edicao = empresaInicial !== null;
  const [form, setForm] = useState(() => formDaEmpresa(empresaInicial));
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // Mantém o formulário sincronizado quando a empresa carregada muda.
  useEffect(() => {
    setForm(formDaEmpresa(empresaInicial));
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
        // Sem corpo na resposta, usa o que foi enviado (nunca a senha).
        if (!empresaSalva) {
          const { senha, ...semSenha } = payload;
          empresaSalva = { ...empresaInicial, ...semSenha };
        }
        setMensagemSucesso('Dados da empresa atualizados com sucesso!');
      } else {
        empresaSalva = await criarEmpresa(payload);
        setForm(ESTADO_INICIAL_FORM);
        setMensagemSucesso('Empresa parceira cadastrada com sucesso!');
      }
      onSalvo?.(empresaSalva);
    } catch (error) {
      setMensagemErro(error.message || 'Erro ao salvar os dados da empresa parceira.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="card">
      <h2 className="card-title">
        <span>{edicao ? 'Dados da empresa' : 'Cadastro de empresa parceira'}</span>
      </h2>

      {mensagemSucesso && (
        <div className="alert alert-success" role="status">
          {mensagemSucesso}
        </div>
      )}

      {mensagemErro && (
        <div className="alert alert-error" role="alert">
          {mensagemErro}
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

        <div className="form-group">
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

        <div className="form-group">
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

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : edicao ? 'Salvar Alterações' : 'Cadastrar Empresa'}
          </button>
        </div>
      </form>
    </section>
  );
}

function MinhasVantagens() {
  const [vantagens, setVantagens] = useState([]);
  const [form, setForm] = useState(ESTADO_INICIAL_VANTAGEM);
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  async function carregarVantagens() {
    setCarregando(true);
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

  function limparFormulario() {
    setForm(ESTADO_INICIAL_VANTAGEM);
    setEditandoId(null);
  }

  function iniciarEdicao(vantagem) {
    setMensagemSucesso('');
    setMensagemErro('');
    setEditandoId(vantagem.id);
    setForm({
      titulo: vantagem.titulo || '',
      descricao: vantagem.descricao || '',
      fotoProduto: vantagem.fotoProduto || '',
      custoMoedas: vantagem.custoMoedas != null ? String(vantagem.custoMoedas) : '',
    });
  }

  function cancelarEdicao() {
    setMensagemSucesso('');
    setMensagemErro('');
    limparFormulario();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagemSucesso('');
    setMensagemErro('');
    setSalvando(true);

    const payload = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      fotoProduto: form.fotoProduto.trim(),
      custoMoedas: Number(form.custoMoedas),
    };

    try {
      if (editandoId !== null) {
        await atualizarVantagem(editandoId, payload);
        setMensagemSucesso('Vantagem atualizada com sucesso!');
      } else {
        await criarVantagem(payload);
        setMensagemSucesso('Vantagem cadastrada com sucesso!');
      }
      limparFormulario();
      await carregarVantagens();
    } catch (error) {
      setMensagemErro(error.message || 'Erro ao salvar a vantagem.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(vantagem) {
    if (!window.confirm(`Excluir a vantagem "${vantagem.titulo}"? Ela deixará de aparecer para os alunos.`)) {
      return;
    }
    setMensagemSucesso('');
    setMensagemErro('');
    try {
      await excluirVantagem(vantagem.id);
      if (editandoId === vantagem.id) {
        limparFormulario();
      }
      setMensagemSucesso(`Vantagem "${vantagem.titulo}" excluída com sucesso!`);
      await carregarVantagens();
    } catch (error) {
      setMensagemErro(error.message || 'Erro ao excluir a vantagem.');
    }
  }

  return (
    <div>
      {mensagemSucesso && (
        <div className="alert alert-success" role="status">
          {mensagemSucesso}
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
            <span>{editandoId !== null ? `Editar vantagem (#${editandoId})` : 'Nova vantagem'}</span>
          </h2>

          <form onSubmit={handleSubmit} className="form-grid">
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
                placeholder="https://exemplo.com/foto.jpg"
                value={form.fotoProduto}
                onChange={handleChange}
              />
              {form.fotoProduto.trim() && (
                <img
                  className="vantagem-foto"
                  src={form.fotoProduto.trim()}
                  alt="Pré-visualização da foto do produto"
                />
              )}
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

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? 'Salvando...' : editandoId !== null ? 'Salvar' : 'Cadastrar'}
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
          <h2 className="card-title">
            <span>Vantagens cadastradas ({vantagens.length})</span>
          </h2>

          {carregando ? (
            <p className="empty-state">Carregando vantagens...</p>
          ) : vantagens.length === 0 ? (
            <p className="empty-state">
              Nenhuma vantagem cadastrada até o momento. Utilize o formulário ao lado para adicionar a primeira.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Título</th>
                    <th>Descrição</th>
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
                      </td>
                      <td>{vantagem.descricao || '—'}</td>
                      <td>
                        <span className="badge badge-coins">{vantagem.custoMoedas}</span>
                      </td>
                      <td>
                        <div className="form-actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => iniciarEdicao(vantagem)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleExcluir(vantagem)}
                          >
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
    </div>
  );
}

function MeuPerfil({ sessao, onSair }) {
  const [empresa, setEmpresa] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');

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
    if (
      !window.confirm(
        'Excluir sua conta de empresa parceira? Esta ação não pode ser desfeita.'
      )
    ) {
      return;
    }
    setMensagemErro('');
    try {
      await excluirEmpresa(sessao.id);
      onSair();
    } catch (error) {
      setMensagemErro(error.message || 'Erro ao excluir a conta.');
    }
  }

  return (
    <div>
      {mensagemErro && (
        <div className="alert alert-error" role="alert">
          {mensagemErro}
        </div>
      )}

      {carregando ? (
        <p className="empty-state">Carregando dados da empresa...</p>
      ) : (
        empresa && (
          <>
            <EmpresaParceiraForm empresaInicial={empresa} onSalvo={setEmpresa} />
            <div className="form-actions">
              <button type="button" className="btn btn-danger" onClick={handleExcluirConta}>
                Excluir minha conta
              </button>
            </div>
          </>
        )
      )}
    </div>
  );
}

export default function EmpresaParceiraView({ sessao, onSair }) {
  const [aba, setAba] = useState('vantagens');

  return (
    <div>
      <div className="sub-tabs">
        <button
          type="button"
          className={`sub-tab ${aba === 'vantagens' ? 'active' : ''}`}
          onClick={() => setAba('vantagens')}
        >
          Minhas vantagens
        </button>
        <button
          type="button"
          className={`sub-tab ${aba === 'perfil' ? 'active' : ''}`}
          onClick={() => setAba('perfil')}
        >
          Meu perfil
        </button>
      </div>

      {aba === 'vantagens' ? <MinhasVantagens /> : <MeuPerfil sessao={sessao} onSair={onSair} />}
    </div>
  );
}
