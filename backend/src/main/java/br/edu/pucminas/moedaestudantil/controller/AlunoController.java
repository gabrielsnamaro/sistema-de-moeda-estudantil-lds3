package br.edu.pucminas.moedaestudantil.controller;

import br.edu.pucminas.moedaestudantil.config.AuthInterceptor;
import br.edu.pucminas.moedaestudantil.dto.AlunoRequestDTO;
import br.edu.pucminas.moedaestudantil.dto.AlunoResponseDTO;
import br.edu.pucminas.moedaestudantil.dto.UsuarioAutenticado;
import br.edu.pucminas.moedaestudantil.service.AutenticacaoService;
import br.edu.pucminas.moedaestudantil.service.AlunoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

    private final AlunoService alunoService;
    private final AutenticacaoService autenticacaoService;

    public AlunoController(AlunoService alunoService, AutenticacaoService autenticacaoService) {
        this.alunoService = alunoService;
        this.autenticacaoService = autenticacaoService;
    }

    @GetMapping
    public ResponseEntity<List<AlunoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(alunoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlunoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(alunoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<AlunoResponseDTO> criar(@Valid @RequestBody AlunoRequestDTO dto) {
        AlunoResponseDTO criado = alunoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlunoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) UsuarioAutenticado usuario,
            @Valid @RequestBody AlunoRequestDTO dto) {
        usuario.exigirMesmoUsuario(id);
        return ResponseEntity.ok(alunoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) UsuarioAutenticado usuario) {
        usuario.exigirMesmoUsuario(id);
        alunoService.excluir(id);
        autenticacaoService.encerrarSessoesDoUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
