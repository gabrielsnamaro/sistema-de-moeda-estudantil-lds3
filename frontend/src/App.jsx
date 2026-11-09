import { useState, useEffect } from 'react';
import AuthView from './views/AuthView';
import AlunoView from './views/AlunoView';
import ProfessorView from './views/ProfessorView';
import EmpresaParceiraView from './views/EmpresaParceiraView';
import { obterSessao, limparSessao, logout } from './services/api';

const ROTULO_PERFIL = {
  ALUNO: 'Aluno',
  PROFESSOR: 'Professor',
  EMPRESA_PARCEIRA: 'Empresa parceira',
};

export default function App() {
  const [sessao, setSessao] = useState(obterSessao);

  useEffect(() => {
    const aoExpirar = () => setSessao(null);
    window.addEventListener('sessao-expirada', aoExpirar);
    return () => window.removeEventListener('sessao-expirada', aoExpirar);
  }, []);

  async function sair() {
    try {
      await logout();
    } catch {
      // sessão já inválida no servidor: segue com a limpeza local
    }
    limparSessao();
    setSessao(null);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <h1>Sistema de Moeda Estudantil — PUC Minas</h1>
          <span>Sprint 03 — protótipo final</span>
        </div>

        {sessao && (
          <div className="topbar-user">
            <span>
              {sessao.nome} · {ROTULO_PERFIL[sessao.tipoPerfil] || sessao.tipoPerfil}
            </span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={sair}>
              Sair
            </button>
          </div>
        )}
      </header>

      <main className="container">
        {!sessao && <AuthView onLogin={setSessao} />}
        {sessao?.tipoPerfil === 'ALUNO' && <AlunoView sessao={sessao} onSair={sair} />}
        {sessao?.tipoPerfil === 'PROFESSOR' && <ProfessorView sessao={sessao} />}
        {sessao?.tipoPerfil === 'EMPRESA_PARCEIRA' && (
          <EmpresaParceiraView sessao={sessao} onSair={sair} />
        )}
      </main>
    </div>
  );
}
