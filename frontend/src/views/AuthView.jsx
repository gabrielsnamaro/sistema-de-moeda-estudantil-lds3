import { useState } from 'react';
import { login, salvarSessao } from '../services/api';
import { AlunoForm } from './AlunoView';
import { EmpresaParceiraForm } from './EmpresaParceiraView';

export default function AuthView({ onLogin }) {
  const [modo, setModo] = useState('login');
  const [campos, setCampos] = useState({ login: '', senha: '' });
  const [entrando, setEntrando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setCampos((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setMensagem('');
    setErro('');
    setEntrando(true);
    try {
      const resp = await login(campos.login.trim(), campos.senha);
      salvarSessao(resp);
      onLogin(resp);
    } catch (error) {
      setErro(error.message || 'Não foi possível entrar.');
      setEntrando(false);
    }
  }

  function aoCadastrar() {
    setModo('login');
    setErro('');
    setMensagem('Cadastro realizado! Faça login com o login e a senha cadastrados.');
  }

  function abrirCadastro(novoModo) {
    setMensagem('');
    setErro('');
    setModo(novoModo);
  }

  if (modo !== 'login') {
    return (
      <div className="auth-wrapper auth-wrapper-wide">
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setModo('login')}>
            Voltar ao login
          </button>
        </div>
        {modo === 'cadastro-aluno' ? (
          <AlunoForm alunoInicial={null} onSalvo={aoCadastrar} />
        ) : (
          <EmpresaParceiraForm empresaInicial={null} onSalvo={aoCadastrar} />
        )}
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      {mensagem && (
        <div className="alert alert-success" role="status">
          {mensagem}
        </div>
      )}
      {erro && (
        <div className="alert alert-error" role="alert">
          {erro}
        </div>
      )}

      <section className="card">
        <h2 className="card-title">
          <span>Entrar</span>
        </h2>

        <form onSubmit={handleLogin} className="form-grid">
          <div className="form-group">
            <label htmlFor="auth-login">Login</label>
            <input
              id="auth-login"
              name="login"
              type="text"
              required
              autoComplete="username"
              value={campos.login}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-senha">Senha</label>
            <input
              id="auth-senha"
              name="senha"
              type="password"
              required
              autoComplete="current-password"
              value={campos.senha}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={entrando}>
              {entrando ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <p className="empty-state">
          Professores pré-cadastrados: milena.adao ou carlos.almeida (senha prof123)
        </p>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => abrirCadastro('cadastro-aluno')}
          >
            Cadastrar-se como aluno
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => abrirCadastro('cadastro-empresa')}
          >
            Cadastrar-se como empresa parceira
          </button>
        </div>
      </section>
    </div>
  );
}
