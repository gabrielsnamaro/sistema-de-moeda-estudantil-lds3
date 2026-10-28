package br.edu.pucminas.moedaestudantil.controller;

import br.edu.pucminas.moedaestudantil.dto.InstituicaoEnsinoResponseDTO;
import br.edu.pucminas.moedaestudantil.service.InstituicaoEnsinoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/instituicoes")
public class InstituicaoEnsinoController {

    private final InstituicaoEnsinoService instituicaoEnsinoService;

    public InstituicaoEnsinoController(InstituicaoEnsinoService instituicaoEnsinoService) {
        this.instituicaoEnsinoService = instituicaoEnsinoService;
    }

    @GetMapping
    public ResponseEntity<List<InstituicaoEnsinoResponseDTO>> listarTodas() {
        return ResponseEntity.ok(instituicaoEnsinoService.listarTodas());
    }
}
