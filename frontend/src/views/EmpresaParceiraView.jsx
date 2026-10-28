import { useState, useEffect } from 'react';
import {
  listarEmpresas,
  criarEmpresa,
  atualizarEmpresa,
  excluirEmpresa,
} from '../services/api';

const ESTADO_INICIAL_FORM = {
  nome: '',
  cnpj: '',
  email: '',
  login: '',
  senha: '',
  descricao: '',
};

export default function EmpresaParceiraView() {
  const [empresas, setEmpresas] = useState([]);
  const [form, setForm] = useState(ESTADO_INICIAL_FORM);
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  async function carregarEmpresas() {
    setCarregando(true);
    try {
      const lista = await listarEmpresas();
      setEmpresas(Array.isArray(lista) ? lista : []);
    } catch (error) {
      setMensagemErro(error.message || 'Não foi possível carregar as empresas parceiras.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEmpresas();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function limparFormulario() {
    setForm(ESTADO_INICIAL_FORM);
    setEditandoId(null);
  }

  function iniciarEdicao(empresa) {
    setMensagemSucesso('');
    setMensagemErro('');
    setEditandoId(empresa.id);
    setForm({
      nome: empresa.nome || '',
      cnpj: empresa.cnpj || '',
      email: empresa.email || '',
      login: empresa.login || '',
      senha: '',
      descricao: empresa.descricao || '',
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
      nome: form.nome.trim(),
      cnpj: form.cnpj.trim(),
      email: form.email.trim(),
      login: form.login.trim(),
      senha: form.senha,
      descricao: form.descricao.trim(),
    };

    try {
      if (editandoId !== null) {
        await atualizarEmpresa(editandoId, payload);
        setMensagemSucesso('Empresa parceira atualizada com sucesso!');
      } else {
        await criarEmpresa(payload);
        setMensagemSucesso('Empresa parceira cadastrada com sucesso!');
      }
      limparFormulario();
      await carregarEmpresas();
    } catch (error) {
      setMensagemErro(error.message || 'Erro ao salvar os dados da empresa parceira.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(empresa) {
    setMensagemSucesso('');
    setMensagemErro('');
    try {
      await excluirEmpresa(empresa.id);
      if (editandoId === empresa.id) {
        limparFormulario();
      }
      setMensagemSucesso(`Empresa parceira "${empresa.nome}" excluída com sucesso!`);
      await carregarEmpresas();
    } catch (error) {
      setMensagemErro(error.message || 'Erro ao excluir a empresa parceira.');
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
            <span>
              {editandoId !== null
                ? `Editar Empresa Parceira (#${editandoId})`
                : 'Nova Empresa Parceira'}
            </span>
          </h2>

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
                Senha {editandoId === null ? '*' : '(opcional na edição)'}
              </label>
              <input
                id="empresa-senha"
                name="senha"
                type="password"
                required={editandoId === null}
                placeholder={
                  editandoId !== null
                    ? 'Deixe em branco para manter a senha atual'
                    : 'Informe a senha de acesso'
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
                {salvando
                  ? 'Salvando...'
                  : editandoId !== null
                  ? 'Salvar Alterações'
                  : 'Cadastrar Empresa'}
              </button>

              {editandoId !== null && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelarEdicao}
                  disabled={salvando}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card">
          <div className="card-title">
            <span>Empresas Parceiras Cadastradas ({empresas.length})</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={carregarEmpresas}
              disabled={carregando}
            >
              {carregando ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          {carregando ? (
            <p className="empty-state">Carregando empresas parceiras...</p>
          ) : empresas.length === 0 ? (
            <p className="empty-state">
              Nenhuma empresa parceira cadastrada até o momento. Utilize o formulário ao lado para adicionar a primeira.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome / Razão Social</th>
                    <th>CNPJ</th>
                    <th>E-mail</th>
                    <th>Login</th>
                    <th>Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td>
                        <strong>{empresa.nome}</strong>
                      </td>
                      <td>{empresa.cnpj}</td>
                      <td>{empresa.email}</td>
                      <td>{empresa.login}</td>
                      <td>{empresa.descricao || '—'}</td>
                      <td>
                        <div className="form-actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => iniciarEdicao(empresa)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleExcluir(empresa)}
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
