package com.management.service;

import com.management.exception.RegraNegocioException;
import com.management.model.Usuario;
import com.management.repository.UsuarioRepository;
import org.springframework.stereotype.Component;

/**
 * Centraliza a validação de unicidade de credenciais e documentos de usuários
 * (GRASP: Pure Fabrication + Low Coupling).
 */
@Component
public class ValidadorCredenciaisUsuario {

    private final UsuarioRepository usuarioRepository;

    public ValidadorCredenciaisUsuario(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void validarSenhaObrigatoria(String senha) {
        if (senha == null || senha.isBlank()) {
            throw new RegraNegocioException("A senha é obrigatória no cadastro.");
        }
    }

    public void validarUnicidadeCadastro(String login, String email) {
        if (usuarioRepository.existsByLogin(login)) {
            throw new RegraNegocioException("Já existe um usuário cadastrado com o login: " + login);
        }
        if (usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException("Já existe um usuário cadastrado com o e-mail: " + email);
        }
    }

    public void validarUnicidadeAtualizacao(Usuario existente, String login, String email) {
        if (!existente.getLogin().equals(login) && usuarioRepository.existsByLogin(login)) {
            throw new RegraNegocioException("Já existe outro usuário com o login: " + login);
        }
        if (!existente.getEmail().equalsIgnoreCase(email) && usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException("Já existe outro usuário com o e-mail: " + email);
        }
    }

    public void validarCpfCadastro(String cpf) {
        if (usuarioRepository.existsPessoaByCpf(cpf)) {
            throw new RegraNegocioException("Já existe uma pessoa cadastrada com o CPF: " + cpf);
        }
    }

    public void validarCpfAtualizacao(String cpfAtual, String novoCpf) {
        if (!cpfAtual.equals(novoCpf) && usuarioRepository.existsPessoaByCpf(novoCpf)) {
            throw new RegraNegocioException("Já existe outra pessoa com o CPF: " + novoCpf);
        }
    }
}
