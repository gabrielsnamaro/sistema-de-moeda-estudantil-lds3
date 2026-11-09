import { useEffect, useState } from 'react';
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

// Formulário usado no cadastro público (alunoInicial null) e em "Meu perfil" (edição).
export function AlunoForm({ alunoInicial = null, onSalvo }) {
  const edicao = alunoInicial !== null;
  const [instituicoes, setInstituicoes] = useState([]);
  const [form, setForm] = useState(() => formDoAluno(alunoInicial));
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

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

  // Mantém o formulário em sincronia quando o aluno é recarregado/atualizado pelo pai.
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
      } else {
        salvo = await criarAluno(payload);
        setSucesso('Aluno cadastrado com sucesso.');
        setForm(INITIAL_FORM);
      }
      onSalvo?.(salvo);
    } catch (err) {
      setErro(err.message || 'Erro ao salvar os dados do aluno.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="card">
      <h2 className="card-title">{edicao ? 'Meus dados' : 'Cadastro de aluno'}</h2>

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
            {edicao ? 'Salvar Alterações' : 'Cadastrar Aluno'}
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

function formatarData(valor) {
  if (!valor) return '-';
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? String(valor) : data.toLocaleString('pt-BR');
}

function VantagensAluno() {
  const [saldo, setSaldo] = useState(0);
  const [vantagens, setVantagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [resgatandoId, setResgatandoId] = useState(null);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null);

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

  async function handleResgatar(vantagem) {
    const confirmado = window.confirm(
      `Resgatar "${vantagem.titulo}" por ${vantagem.custoMoedas} moedas?`,
    );
    if (!confirmado) return;

    setErro('');
    setResultado(null);
    setResgatandoId(vantagem.id);
    try {
      const cupom = await resgatarVantagem(vantagem.id);
      const emailAluno = await enviarCupomAluno(cupom);
      const emailParceiro = await enviarConferenciaParceiro(cupom);
      setResultado({ cupom, emails: [emailAluno, emailParceiro] });
      try {
        const extrato = await consultarExtrato();
        setSaldo(extrato?.saldoMoedas ?? 0);
      } catch {
        if (cupom?.saldoRestanteAluno !== undefined) setSaldo(cupom.saldoRestanteAluno);
      }
    } catch (err) {
      setErro(err.message || 'Não foi possível resgatar a vantagem.');
    } finally {
      setResgatandoId(null);
    }
  }

  return (
    <section className="card">
      <h2 className="card-title">Vantagens disponíveis</h2>

      <p>
        <strong>Seu saldo: {saldo} moedas</strong>
      </p>

      {erro && <div className="alert alert-error">{erro}</div>}

      {resultado && (
        <>
          <div className="alert alert-success">
            Resgate concluído! Código do cupom:{' '}
            <span className="cupom-codigo">{resultado.cupom.codigoGerado}</span>
          </div>
          {resultado.emails.map((email, indice) => (
            <div
              key={indice}
              className={`alert ${email.enviado ? 'alert-success' : 'alert-warning'}`}
            >
              {email.mensagem}
            </div>
          ))}
        </>
      )}

      {carregando ? (
        <div className="empty-state">Carregando vantagens...</div>
      ) : vantagens.length === 0 ? (
        <div className="empty-state">Nenhuma vantagem disponível no momento.</div>
      ) : (
        <div className="vantagens-grid">
          {vantagens.map((vantagem) => {
            const insuficiente = saldo < vantagem.custoMoedas;
            return (
              <article key={vantagem.id} className="vantagem-card">
                <img className="vantagem-foto" src={vantagem.fotoProduto} alt={vantagem.titulo} />
                <h3>{vantagem.titulo}</h3>
                <p>{vantagem.empresaNome}</p>
                <p>{vantagem.descricao}</p>
                <p>
                  <span className="badge badge-coins">{vantagem.custoMoedas} moedas</span>
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleResgatar(vantagem)}
                  disabled={insuficiente || resgatandoId !== null}
                >
                  {insuficiente
                    ? 'Saldo insuficiente'
                    : resgatandoId === vantagem.id
                      ? 'Resgatando...'
                      : 'Resgatar'}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MeusCupons() {
  const [cupons, setCupons] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

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

  return (
    <section className="card">
      <h2 className="card-title">Meus cupons ({cupons.length})</h2>

      {erro && <div className="alert alert-error">{erro}</div>}

      {carregando ? (
        <div className="empty-state">Carregando cupons...</div>
      ) : cupons.length === 0 ? (
        <div className="empty-state">Você ainda não resgatou nenhum cupom.</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Vantagem</th>
                <th>Empresa</th>
                <th>Custo</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {cupons.map((cupom) => (
                <tr key={cupom.id}>
                  <td>
                    <code>{cupom.codigoGerado}</code>
                  </td>
                  <td>{cupom.vantagemTitulo}</td>
                  <td>{cupom.empresaNome}</td>
                  <td>
                    <span className="badge badge-coins">{cupom.custoMoedas} moedas</span>
                  </td>
                  <td>{formatarData(cupom.dataGeracao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PerfilAluno({ sessao, onSair }) {
  const [aluno, setAluno] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    buscarAlunoPorId(sessao.id)
      .then((dados) => {
        if (ativo) setAluno(dados);
      })
      .catch((err) => {
        if (ativo) setErro(err.message || 'Não foi possível carregar seus dados.');
      });
    return () => {
      ativo = false;
    };
  }, [sessao.id]);

  async function handleExcluir() {
    if (!window.confirm('Excluir sua conta? Esta ação não pode ser desfeita.')) return;
    setErro('');
    try {
      await excluirAluno(sessao.id);
      onSair();
    } catch (err) {
      setErro(err.message || 'Não foi possível excluir a conta.');
    }
  }

  return (
    <>
      {erro && <div className="alert alert-error">{erro}</div>}
      {aluno && (
        <AlunoForm
          alunoInicial={aluno}
          onSalvo={(salvo) => {
            if (salvo) setAluno(salvo);
          }}
        />
      )}
      <div className="form-actions">
        <button type="button" className="btn btn-danger" onClick={handleExcluir}>
          Excluir minha conta
        </button>
      </div>
    </>
  );
}

const ABAS = [
  { id: 'vantagens', rotulo: 'Vantagens' },
  { id: 'cupons', rotulo: 'Meus cupons' },
  { id: 'extrato', rotulo: 'Extrato' },
  { id: 'perfil', rotulo: 'Meu perfil' },
];

export default function AlunoView({ sessao, onSair }) {
  const [aba, setAba] = useState('vantagens');

  return (
    <div>
      <div className="sub-tabs">
        {ABAS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sub-tab ${aba === item.id ? 'active' : ''}`}
            onClick={() => setAba(item.id)}
          >
            {item.rotulo}
          </button>
        ))}
      </div>

      {aba === 'vantagens' && <VantagensAluno />}
      {aba === 'cupons' && <MeusCupons />}
      {aba === 'extrato' && <Extrato perfil="ALUNO" />}
      {aba === 'perfil' && <PerfilAluno sessao={sessao} onSair={onSair} />}
    </div>
  );
}
