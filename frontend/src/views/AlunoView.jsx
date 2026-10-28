import { useEffect, useState } from 'react';
import {
  listarInstituicoes,
  listarAlunos,
  criarAluno,
  atualizarAluno,
  excluirAluno,
} from '../services/api';

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

export default function AlunoView() {
  const [instituicoes, setInstituicoes] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editandoId, setEditandoId] = useState(null);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  async function carregarDadosIniciais() {
    setErro('');
    try {
      const [listaInstituicoes, listaAlunos] = await Promise.all([
        listarInstituicoes(),
        listarAlunos(),
      ]);
      setInstituicoes(Array.isArray(listaInstituicoes) ? listaInstituicoes : []);
      setAlunos(Array.isArray(listaAlunos) ? listaAlunos : []);
    } catch (err) {
      setErro(err.message || 'Não foi possível carregar os dados de alunos e instituições.');
    }
  }

  async function recarregarAlunos() {
    const listaAlunos = await listarAlunos();
    setAlunos(Array.isArray(listaAlunos) ? listaAlunos : []);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function iniciarEdicao(aluno) {
    setSucesso('');
    setErro('');
    setEditandoId(aluno.id);
    setForm({
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
    });
  }

  function limparFormulario() {
    setEditandoId(null);
    setForm(INITIAL_FORM);
    setErro('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSucesso('');
    setErro('');
    setSalvando(true);

    const payload = {
      ...form,
      instituicaoEnsinoId: Number(form.instituicaoEnsinoId),
    };

    try {
      if (editandoId !== null) {
        await atualizarAluno(editandoId, payload);
        setSucesso('Aluno atualizado com sucesso.');
      } else {
        await criarAluno(payload);
        setSucesso('Aluno cadastrado com sucesso.');
      }
      setEditandoId(null);
      setForm(INITIAL_FORM);
      await recarregarAlunos();
    } catch (err) {
      setErro(err.message || 'Erro ao salvar os dados do aluno.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(aluno) {
    setSucesso('');
    setErro('');
    try {
      await excluirAluno(aluno.id);
      if (editandoId === aluno.id) {
        setEditandoId(null);
        setForm(INITIAL_FORM);
      }
      setSucesso('Aluno excluído com sucesso.');
      await recarregarAlunos();
    } catch (err) {
      setErro(err.message || 'Erro ao excluir o aluno.');
    }
  }

  return (
    <div className="grid-layout">
      <section className="card">
        <h2 className="card-title">
          {editandoId !== null ? `Editar Aluno #${editandoId}` : 'Cadastrar Novo Aluno'}
        </h2>

        {sucesso && <div className="alert alert-success">{sucesso}</div>}
        {erro && <div className="alert alert-error">{erro}</div>}

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
              <label htmlFor="aluno-senha">
                Senha {editandoId !== null ? '(opcional)' : '*'}
              </label>
              <input
                id="aluno-senha"
                name="senha"
                type="password"
                value={form.senha}
                onChange={handleChange}
                placeholder={
                  editandoId !== null
                    ? 'Deixe em branco para manter a senha atual'
                    : 'Informe a senha de acesso'
                }
                required={editandoId === null}
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

            <div className="form-group">
              <label htmlFor="aluno-endereco">Endereço *</label>
              <input
                id="aluno-endereco"
                name="endereco"
                type="text"
                value={form.endereco}
                onChange={handleChange}
                placeholder="Ex.: Rua Dom José Gaspar, 500 - Coração Eucarístico"
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
              <label htmlFor="aluno-instituicao">Instituição de Ensino *</label>
              <select
                id="aluno-instituicao"
                name="instituicaoEnsinoId"
                value={form.instituicaoEnsinoId}
                onChange={handleChange}
                required
              >
                <option value="">Selecione uma instituição pré-cadastrada</option>
                {instituicoes.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={salvando}>
              {editandoId !== null ? 'Salvar Alterações' : 'Cadastrar Aluno'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={limparFormulario}
              disabled={salvando}
            >
              {editandoId !== null ? 'Cancelar Edição' : 'Limpar'}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2 className="card-title">Alunos Cadastrados ({alunos.length})</h2>

        {alunos.length === 0 ? (
          <div className="empty-state">Nenhum aluno cadastrado até o momento.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>RG</th>
                  <th>E-mail</th>
                  <th>Login</th>
                  <th>Instituição de Ensino</th>
                  <th>Curso</th>
                  <th>Saldo de Moedas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno) => (
                  <tr key={aluno.id}>
                    <td>{aluno.nome}</td>
                    <td>{aluno.cpf}</td>
                    <td>{aluno.rg}</td>
                    <td>{aluno.email}</td>
                    <td>{aluno.login}</td>
                    <td>{aluno.instituicaoEnsinoNome || '-'}</td>
                    <td>{aluno.curso}</td>
                    <td>
                      <span className="badge badge-coins">
                        {aluno.saldoMoedas ?? 0} moedas
                      </span>
                    </td>
                    <td>
                      <div className="form-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => iniciarEdicao(aluno)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleExcluir(aluno)}
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
  );
}
