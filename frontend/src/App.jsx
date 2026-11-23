import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { Coins, LogOut, Moon, Sun } from 'lucide-react';
import AuthView from './views/AuthView';
import AlunoView from './views/AlunoView';
import ProfessorView from './views/ProfessorView';
import EmpresaParceiraView from './views/EmpresaParceiraView';
import MascotDock from './components/MascotDock';
import { MascotProvider } from './contexts/MascotContext';
import { ToastProvider } from './contexts/ToastContext';
import { obterSessao, limparSessao, logout } from './services/api';

const ROTULO_PERFIL = {
  ALUNO: 'Aluno',
  PROFESSOR: 'Professor',
  EMPRESA_PARCEIRA: 'Parceiro',
};

function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return 'U';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function AppContent() {
  const [sessao, setSessao] = useState(obterSessao);
  const [authModo, setAuthModo] = useState('login');
  const [tema, setTema] = useState(() => {
    try {
      return document.documentElement.getAttribute('data-theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const aoExpirar = () => setSessao(null);
    window.addEventListener('sessao-expirada', aoExpirar);
    return () => window.removeEventListener('sessao-expirada', aoExpirar);
  }, []);

  function alternarTema() {
    setTema((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('moedaEstudantil.theme', next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }

  async function sair() {
    try {
      await logout();
    } catch {
      // sessão já inválida no servidor: segue com a limpeza local
    }
    limparSessao();
    setSessao(null);
  }

  const mostrarMascotDock = Boolean(sessao) || authModo !== 'login';

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-brand">
            <div className="brand-mark" aria-hidden="true">
              <Coins size={20} />
            </div>
            <div className="brand-text">
              <h1>Moeda Estudantil</h1>
              <span>PUC Minas · Reconhecimento Acadêmico</span>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onClick={alternarTema}
              title={tema === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              aria-label={tema === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {tema === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {sessao && (
              <>
                <div className="user-pill">
                  <span className="user-avatar-dot" aria-hidden="true">
                    {iniciais(sessao.nome)}
                  </span>
                  <div className="user-pill-info">
                    <span className="user-pill-name">{sessao.nome}</span>
                    <span className="role-chip">
                      {ROTULO_PERFIL[sessao.tipoPerfil] || sessao.tipoPerfil}
                    </span>
                  </div>
                </div>

                <button type="button" className="btn btn-secondary btn-sm" onClick={sair}>
                  <LogOut size={14} />
                  Sair
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container">
        {!sessao && <AuthView onLogin={setSessao} onModoChange={setAuthModo} />}
        {sessao?.tipoPerfil === 'ALUNO' && <AlunoView sessao={sessao} onSair={sair} />}
        {sessao?.tipoPerfil === 'PROFESSOR' && <ProfessorView sessao={sessao} />}
        {sessao?.tipoPerfil === 'EMPRESA_PARCEIRA' && (
          <EmpresaParceiraView sessao={sessao} onSair={sair} />
        )}
      </main>

      {mostrarMascotDock && <MascotDock />}
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <MascotProvider>
          <AppContent />
        </MascotProvider>
      </ToastProvider>
    </MotionConfig>
  );
}
