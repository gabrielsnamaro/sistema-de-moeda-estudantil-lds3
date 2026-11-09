const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const CHAVE_SESSAO = 'moedaEstudantil.sessao';

export function obterSessao() {
  try {
    const bruto = sessionStorage.getItem(CHAVE_SESSAO);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

export function salvarSessao(sessao) {
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

export function limparSessao() {
  sessionStorage.removeItem(CHAVE_SESSAO);
}

async function request(path, options = {}) {
  const sessao = obterSessao();
  const token = sessao?.token;

  // headers montados depois de ...options para que as opções não os sobrescrevam
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      limparSessao();
      window.dispatchEvent(new Event('sessao-expirada'));
    }
    throw new Error(data?.erro || 'Erro ao comunicar com o servidor.');
  }

  return data;
}

export function login(loginUsuario, senha) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login: loginUsuario, senha }),
  });
}

export function logout() {
  return request('/auth/logout', { method: 'POST' });
}

export function listarInstituicoes() {
  return request('/instituicoes');
}

export function listarAlunos() {
  return request('/alunos');
}

export function buscarAlunoPorId(id) {
  return request(`/alunos/${id}`);
}

export function criarAluno(dados) {
  return request('/alunos', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export function atualizarAluno(id, dados) {
  return request(`/alunos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export function excluirAluno(id) {
  return request(`/alunos/${id}`, {
    method: 'DELETE',
  });
}

export function listarEmpresas() {
  return request('/empresas');
}

export function buscarEmpresaPorId(id) {
  return request(`/empresas/${id}`);
}

export function criarEmpresa(dados) {
  return request('/empresas', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export function atualizarEmpresa(id, dados) {
  return request(`/empresas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export function excluirEmpresa(id) {
  return request(`/empresas/${id}`, {
    method: 'DELETE',
  });
}

export function consultarExtrato() {
  return request('/moedas/extrato');
}

export function enviarMoedas({ alunoId, valor, motivo }) {
  return request('/moedas/envios', {
    method: 'POST',
    body: JSON.stringify({ alunoId, valor, motivo }),
  });
}

export function listarVantagens() {
  return request('/vantagens');
}

export function listarMinhasVantagens() {
  return request('/vantagens/minhas');
}

export function criarVantagem(dados) {
  return request('/vantagens', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export function atualizarVantagem(id, dados) {
  return request(`/vantagens/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export function excluirVantagem(id) {
  return request(`/vantagens/${id}`, {
    method: 'DELETE',
  });
}

export function resgatarVantagem(id) {
  return request(`/vantagens/${id}/resgates`, {
    method: 'POST',
  });
}

export function listarMeusCupons() {
  return request('/vantagens/cupons');
}
