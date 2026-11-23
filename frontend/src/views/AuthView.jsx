import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Building2,
  CheckCircle2,
  Coins,
  Gift,
  GraduationCap,
  LogIn,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { login, salvarSessao } from '../services/api';
import { AlunoForm } from './AlunoView';
import { EmpresaParceiraForm } from './EmpresaParceiraView';
import BotAvatar from '../components/BotAvatar';
import { useMascot } from '../contexts/MascotContext';
import { useToast } from '../contexts/ToastContext';

const HERO_MENSAGENS = {
  idle: 'Olá! Eu sou o Capelo. Entre com sua conta para enviar moedas, acompanhar seu extrato ou resgatar vantagens.',
  typing: 'Ótimo! Estou pronto para validar seu acesso assim que você clicar em Entrar.',
  working: 'Conectando ao servidor da PUC Minas... só um instante!',
  error: 'Ops! Confira seu login e senha — ou teste rapidamente com uma das contas de demonstração abaixo.',
  success: 'Cadastro concluído com sucesso! Agora é só entrar com suas credenciais.',
};

export default function AuthView({ onLogin, onModoChange }) {
  const [modo, setModo] = useState('login');
  const [campos, setCampos] = useState({ login: '', senha: '' });
  const [entrando, setEntrando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [heroState, setHeroState] = useState('idle');
  const [heroMood, setHeroMood] = useState('happy');
  const [heroTexto, setHeroTexto] = useState(HERO_MENSAGENS.idle);

  const { setContext, material, react } = useMascot();
  const { notify } = useToast();

  useEffect(() => {
    setContext(modo);
    onModoChange?.(modo);
  }, [modo, setContext, onModoChange]);

  function handleChange(event) {
    const { name, value } = event.target;
    setCampos((prev) => ({ ...prev, [name]: value }));
    if (heroState !== 'thinking') {
      setHeroState('thinking');
      setHeroMood('neutral');
      setHeroTexto(HERO_MENSAGENS.typing);
    }
  }

  function preencherDemo(usuario, senha) {
    setErro('');
    setCampos({ login: usuario, senha });
    setHeroState('idle');
    setHeroMood('happy');
    setHeroTexto(`Credenciais de ${usuario} preenchidas! Clique em Entrar para acessar.`);
  }

  async function handleLogin(event) {
    event.preventDefault();
    setMensagem('');
    setErro('');
    setEntrando(true);
    setHeroState('working');
    setHeroMood('neutral');
    setHeroTexto(HERO_MENSAGENS.working);

    try {
      const resp = await login(campos.login.trim(), campos.senha);
      salvarSessao(resp);
      react(`Bem-vindo(a), ${resp.nome}!`, { nextState: 'done', nextMood: 'happy', durationMs: 3600 });
      notify(`Bem-vindo(a), ${resp.nome}!`, 'success');
      onLogin(resp);
    } catch (error) {
      const msg = error.message || 'Não foi possível entrar.';
      setErro(msg);
      setEntrando(false);
      setHeroState('blocked');
      setHeroMood('neutral');
      setHeroTexto(HERO_MENSAGENS.error);
    }
  }

  function aoCadastrar() {
    setModo('login');
    setErro('');
    setMensagem('Cadastro realizado! Faça login com o login e a senha cadastrados.');
    setHeroState('done');
    setHeroMood('happy');
    setHeroTexto(HERO_MENSAGENS.success);
    notify('Cadastro realizado com sucesso!', 'success');
  }

  function abrirCadastro(novoModo) {
    setMensagem('');
    setErro('');
    setModo(novoModo);
  }

  return (
    <AnimatePresence mode="wait">
      {modo !== 'login' ? (
        <motion.div
          key={modo}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="auth-register-wide"
        >
          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setModo('login')}
            >
              <ArrowLeft size={15} />
              Voltar ao login
            </button>
          </div>
          {modo === 'cadastro-aluno' ? (
            <AlunoForm alunoInicial={null} onSalvo={aoCadastrar} />
          ) : (
            <EmpresaParceiraForm empresaInicial={null} onSalvo={aoCadastrar} />
          )}
        </motion.div>
      ) : (
        <motion.div
          key="login-stage"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
          className="auth-stage"
        >
          <section className="auth-hero-panel">
            <div>
              <span className="auth-hero-eyebrow">
                <Sparkles size={13} />
                PUC Minas · Mérito Acadêmico
              </span>
              <h2 className="auth-hero-title">
                Reconheça conquistas, acumule moedas e resgate vantagens reais.
              </h2>
              <p className="auth-hero-desc">
                Plataforma integrada que conecta professores, alunos e empresas parceiras em um
                ecossistema de reconhecimento estudantil.
              </p>
            </div>

            <div className="auth-mascot-card">
              <BotAvatar
                size={104}
                state={heroState}
                mood={heroMood}
                material={material}
                followPointer
                color="#f59e0b"
                eyeColor="#18181b"
              />
              <div className="auth-mascot-speech">
                <span className="auth-mascot-name">Capelo · Mascote Oficial</span>
                <p className="auth-mascot-text">{heroTexto}</p>
              </div>
            </div>

            <div className="auth-features">
              <div className="auth-feature-item">
                <Award size={17} style={{ color: 'var(--coin)' }} />
                <strong>Professores</strong>
                <span>1.000 moedas/semestre para reconhecer alunos</span>
              </div>
              <div className="auth-feature-item">
                <Coins size={17} style={{ color: 'var(--accent)' }} />
                <strong>Estudantes</strong>
                <span>Extrato transparente e troca por benefícios</span>
              </div>
              <div className="auth-feature-item">
                <Gift size={17} style={{ color: 'var(--success)' }} />
                <strong>Parceiros</strong>
                <span>Catálogo com cupom validado por e-mail</span>
              </div>
            </div>
          </section>

          <section className="card auth-card">
            <div className="card-header" style={{ marginBottom: '1.1rem' }}>
              <div className="card-title-group">
                <h2 className="card-title">
                  <LogIn size={20} style={{ color: 'var(--accent)' }} />
                  Acessar conta
                </h2>
                <p className="card-subtitle">Entre como aluno, professor ou empresa parceira</p>
              </div>
            </div>

            {mensagem && (
              <div className="alert alert-success" role="status">
                <CheckCircle2 size={18} />
                <span>{mensagem}</span>
              </div>
            )}
            {erro && (
              <div className="alert alert-error" role="alert">
                <AlertCircle size={18} />
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="form-grid form-grid-single">
              <div className="form-group">
                <label htmlFor="auth-login">Login</label>
                <input
                  id="auth-login"
                  name="login"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Ex.: milena.adao"
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
                  placeholder="Digite sua senha"
                  value={campos.senha}
                  onChange={handleChange}
                />
              </div>

              <motion.button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.74rem' }}
                disabled={entrando}
                whileTap={{ scale: 0.98 }}
              >
                <LogIn size={16} />
                {entrando ? 'Entrando...' : 'Entrar na plataforma'}
              </motion.button>
            </form>

            <div className="demo-box">
              <div className="demo-box-title">
                <GraduationCap size={14} />
                Acesso rápido (professores pré-cadastrados)
              </div>
              <div className="demo-chips">
                <button
                  type="button"
                  className="pill-btn"
                  onClick={() => preencherDemo('milena.adao', 'prof123')}
                >
                  Profa. Milena (milena.adao)
                </button>
                <button
                  type="button"
                  className="pill-btn"
                  onClick={() => preencherDemo('carlos.almeida', 'prof123')}
                >
                  Prof. Carlos (carlos.almeida)
                </button>
              </div>
            </div>

            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '1.15rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <p className="card-subtitle" style={{ marginBottom: '0.7rem' }}>
                Ainda não possui conta?
              </p>
              <div className="form-actions" style={{ marginTop: 0 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => abrirCadastro('cadastro-aluno')}
                >
                  <UserPlus size={15} />
                  Sou aluno
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => abrirCadastro('cadastro-empresa')}
                >
                  <Building2 size={15} />
                  Sou empresa
                </button>
              </div>
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
