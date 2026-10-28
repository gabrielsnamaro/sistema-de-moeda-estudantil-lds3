package br.edu.pucminas.moedaestudantil.controller;

import br.edu.pucminas.moedaestudantil.dto.EmpresaParceiraRequestDTO;
import br.edu.pucminas.moedaestudantil.dto.EmpresaParceiraResponseDTO;
import br.edu.pucminas.moedaestudantil.service.EmpresaParceiraService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaParceiraController {

    private final EmpresaParceiraService empresaParceiraService;

    public EmpresaParceiraController(EmpresaParceiraService empresaParceiraService) {
        this.empresaParceiraService = empresaParceiraService;
    }

    @GetMapping
    public ResponseEntity<List<EmpresaParceiraResponseDTO>> listarTodas() {
        return ResponseEntity.ok(empresaParceiraService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaParceiraResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(empresaParceiraService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<EmpresaParceiraResponseDTO> criar(@Valid @RequestBody EmpresaParceiraRequestDTO dto) {
        EmpresaParceiraResponseDTO criada = empresaParceiraService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaParceiraResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody EmpresaParceiraRequestDTO dto) {
        return ResponseEntity.ok(empresaParceiraService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        empresaParceiraService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
