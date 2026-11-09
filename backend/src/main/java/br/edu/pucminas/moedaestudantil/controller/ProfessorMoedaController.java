package br.edu.pucminas.moedaestudantil.controller;

import br.edu.pucminas.moedaestudantil.config.AuthInterceptor;
import br.edu.pucminas.moedaestudantil.dto.EnvioMoedasRequestDTO;
import br.edu.pucminas.moedaestudantil.dto.ExtratoResponseDTO;
import br.edu.pucminas.moedaestudantil.dto.TransacaoResponseDTO;
import br.edu.pucminas.moedaestudantil.dto.UsuarioAutenticado;
import br.edu.pucminas.moedaestudantil.service.ContaMoedaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/moedas")
public class ProfessorMoedaController {

    private final ContaMoedaService contaMoedaService;

    public ProfessorMoedaController(ContaMoedaService contaMoedaService) {
        this.contaMoedaService = contaMoedaService;
    }

    @GetMapping("/extrato")
    public ResponseEntity<ExtratoResponseDTO> consultarExtrato(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) UsuarioAutenticado usuario) {
        return ResponseEntity.ok(contaMoedaService.consultarExtrato(usuario));
    }

    @PostMapping("/envios")
    public ResponseEntity<TransacaoResponseDTO> enviarMoedas(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) UsuarioAutenticado usuario,
            @Valid @RequestBody EnvioMoedasRequestDTO dto) {
        TransacaoResponseDTO criada = contaMoedaService.enviarMoedas(usuario, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }
}
