import { useState } from 'react';
import AlunoView from './views/AlunoView';
import EmpresaParceiraView from './views/EmpresaParceiraView';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('alunos');

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <h1>Sistema de Moeda Estudantil — PUC Minas (Sprint 02)</h1>
          <span>
            Persistência ORM (Spring Data JPA + PostgreSQL) e CRUDs de Alunos e Empresas Parceiras
          </span>
        </div>

        <nav className="nav-tabs" aria-label="Módulos do sistema">
          <button
            type="button"
            className={`nav-tab ${abaAtiva === 'alunos' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('alunos')}
          >
            Gestão de Alunos (CRUD)
          </button>
          <button
            type="button"
            className={`nav-tab ${abaAtiva === 'empresas' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('empresas')}
          >
            Gestão de Empresas Parceiras (CRUD)
          </button>
        </nav>
      </header>

      <main className="container">
        {abaAtiva === 'alunos' ? <AlunoView /> : <EmpresaParceiraView />}
      </main>
    </div>
  );
}
