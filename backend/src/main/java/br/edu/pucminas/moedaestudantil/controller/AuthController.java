package br.edu.pucminas.moedaestudantil.controller;

import br.edu.pucminas.moedaestudantil.dto.LoginRequestDTO;
import br.edu.pucminas.moedaestudantil.dto.LoginResponseDTO;
import br.edu.pucminas.moedaestudantil.service.AutenticacaoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String PREFIXO_BEARER = "Bearer ";

    private final AutenticacaoService autenticacaoService;

    public AuthController(AutenticacaoService autenticacaoService) {
        this.autenticacaoService = autenticacaoService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(autenticacaoService.login(dto));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization != null && authorization.startsWith(PREFIXO_BEARER)) {
            autenticacaoService.logout(authorization.substring(PREFIXO_BEARER.length()).trim());
        }
        return ResponseEntity.noContent().build();
    }
}
