package br.edu.pucminas.moedaestudantil.controller;

import br.edu.pucminas.moedaestudantil.config.AuthInterceptor;
import br.edu.pucminas.moedaestudantil.dto.CupomResponseDTO;
import br.edu.pucminas.moedaestudantil.dto.UsuarioAutenticado;
import br.edu.pucminas.moedaestudantil.dto.VantagemRequestDTO;
import br.edu.pucminas.moedaestudantil.dto.VantagemResponseDTO;
import br.edu.pucminas.moedaestudantil.service.VantagemResgateService;
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
@RequestMapping("/api/vantagens")
public class EmpresaVantagemController {

    private final VantagemResgateService vantagemResgateService;

    public EmpresaVantagemController(VantagemResgateService vantagemResgateService) {
        this.vantagemResgateService = vantagemResgateService;
    }

    @GetMapping
    public ResponseEntity<List<VantagemResponseDTO>> listarAtivas(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) UsuarioAutenticado usuario) {
        return ResponseEntity.ok(vantagemResgateService.listarAtivas());
    }

    @GetMapping("/minhas")
    public ResponseEntity<List<VantagemResponseDTO>> listarDaEmpresa(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) UsuarioAutenticado usuario) {
        return ResponseEntity.ok(vantagemResgateService.listarDaEmpresa(usuario));
    }

    @GetMapping("/cupons")
    public ResponseEntity<List<CupomResponseDTO>> listarCuponsDoAluno(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) UsuarioAutenticado usuario) {
        return ResponseEntity.ok(vantagemResgateService.listarCuponsDoAluno(usuario));
    }

    @PostMapping
    public ResponseEntity<VantagemResponseDTO> criar(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) UsuarioAutenticado usuario,
            @Valid @RequestBody VantagemRequestDTO dto) {
        VantagemResponseDTO criada = vantagemResgateService.criar(usuario, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VantagemResponseDTO> atualizar(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) UsuarioAutenticado usuario,
            @PathVariable Long id,
            @Valid @RequestBody VantagemRequestDTO dto) {
        return ResponseEntity.ok(vantagemResgateService.atualizar(usuario, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) UsuarioAutenticado usuario,
            @PathVariable Long id) {
        vantagemResgateService.excluir(usuario, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/resgates")
    public ResponseEntity<CupomResponseDTO> resgatar(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) UsuarioAutenticado usuario,
            @PathVariable Long id) {
        CupomResponseDTO cupom = vantagemResgateService.resgatar(usuario, id);
        return ResponseEntity.status(HttpStatus.CREATED).body(cupom);
    }
}
