const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
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
    throw new Error(data?.erro || 'Erro ao comunicar com o servidor.');
  }

  return data;
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
