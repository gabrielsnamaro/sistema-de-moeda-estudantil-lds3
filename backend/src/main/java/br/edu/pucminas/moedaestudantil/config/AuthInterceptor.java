package br.edu.pucminas.moedaestudantil.config;

import br.edu.pucminas.moedaestudantil.dto.UsuarioAutenticado;
import br.edu.pucminas.moedaestudantil.service.AutenticacaoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String ATRIBUTO_USUARIO = "usuarioAutenticado";

    private static final String PREFIXO_BEARER = "Bearer ";

    private final AutenticacaoService autenticacaoService;
    private final ObjectMapper objectMapper;

    public AuthInterceptor(AutenticacaoService autenticacaoService, ObjectMapper objectMapper) {
        this.autenticacaoService = autenticacaoService;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        // Preflight CORS não leva o header Authorization.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        if (ehCadastroPublico(request)) {
            return true;
        }

        String authorization = request.getHeader("Authorization");
        String token = null;
        if (authorization != null && authorization.startsWith(PREFIXO_BEARER)) {
            token = authorization.substring(PREFIXO_BEARER.length()).trim();
        }

        Optional<UsuarioAutenticado> usuario = autenticacaoService.buscarSessao(token);
        if (usuario.isPresent()) {
            request.setAttribute(ATRIBUTO_USUARIO, usuario.get());
            return true;
        }

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                "erro", "Sessão inválida ou expirada. Faça login novamente.",
                "timestamp", LocalDateTime.now().toString()
        )));
        return false;
    }

    private boolean ehCadastroPublico(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return "POST".equalsIgnoreCase(request.getMethod())
                && ("/api/alunos".equals(uri) || "/api/empresas".equals(uri));
    }
}
