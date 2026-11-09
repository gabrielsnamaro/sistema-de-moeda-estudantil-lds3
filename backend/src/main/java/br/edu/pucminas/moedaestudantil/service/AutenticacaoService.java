package br.edu.pucminas.moedaestudantil.service;

import br.edu.pucminas.moedaestudantil.dto.LoginRequestDTO;
import br.edu.pucminas.moedaestudantil.dto.LoginResponseDTO;
import br.edu.pucminas.moedaestudantil.dto.UsuarioAutenticado;
import br.edu.pucminas.moedaestudantil.exception.NaoAutenticadoException;
import br.edu.pucminas.moedaestudantil.model.Usuario;
import br.edu.pucminas.moedaestudantil.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AutenticacaoService {

    private final UsuarioRepository usuarioRepository;

    // Sessões em memória: reiniciar a aplicação encerra todas elas.
    private final Map<String, UsuarioAutenticado> sessoes = new ConcurrentHashMap<>();

    public AutenticacaoService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByLogin(dto.login())
                .filter(u -> u.autenticar(dto.login(), dto.senha()))
                .orElseThrow(() -> new NaoAutenticadoException("Login ou senha inválidos."));

        String token = UUID.randomUUID().toString();
        sessoes.put(token, new UsuarioAutenticado(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoPerfil()
        ));

        return new LoginResponseDTO(
                token,
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoPerfil()
        );
    }

    public Optional<UsuarioAutenticado> buscarSessao(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return Optional.ofNullable(sessoes.get(token));
    }

    public void logout(String token) {
        if (token != null) {
            sessoes.remove(token);
        }
    }

    public void encerrarSessoesDoUsuario(Long usuarioId) {
        sessoes.values().removeIf(sessao -> sessao.id().equals(usuarioId));
    }
}
