package com.management.service;

import com.management.dto.EmpresaRequestDTO;
import com.management.exception.RecursoNaoEncontradoException;
import com.management.exception.RegraNegocioException;
import com.management.model.Empresa;
import com.management.repository.EmpresaRepository;
import com.management.repository.ResgateVantagemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final ValidadorCredenciaisUsuario validadorCredenciais;
    private final ResgateVantagemRepository resgateRepository;

    public EmpresaService(EmpresaRepository empresaRepository,
                          ValidadorCredenciaisUsuario validadorCredenciais,
                          ResgateVantagemRepository resgateRepository) {
        this.empresaRepository = empresaRepository;
        this.validadorCredenciais = validadorCredenciais;
        this.resgateRepository = resgateRepository;
    }

    public List<Empresa> listarTodas() {
        return empresaRepository.findAll();
    }

    public Empresa buscarPorId(Long id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Empresa parceira não encontrada com ID: " + id));
    }

    @Transactional
    public Empresa criar(EmpresaRequestDTO dto) {
        validadorCredenciais.validarSenhaObrigatoria(dto.getSenha());
        String login = dto.getLogin().trim();
        String email = dto.getEmail().trim().toLowerCase();
        String cnpj = Documentos.formatarCnpj(dto.getCnpj());

        validadorCredenciais.validarUnicidadeCadastro(login, email);
        if (empresaRepository.existsByCnpj(cnpj)) {
            throw new RegraNegocioException("Já existe uma empresa cadastrada com o CNPJ: " + cnpj);
        }

        Empresa empresa = new Empresa(dto.getNome().trim(), dto.getSenha(), login, email,
                dto.getDescricao().trim(), cnpj);
        return empresaRepository.save(empresa);
    }

    @Transactional
    public Empresa atualizar(Long id, EmpresaRequestDTO dto) {
        Empresa existente = buscarPorId(id);
        String login = dto.getLogin().trim();
        String email = dto.getEmail().trim().toLowerCase();
        String cnpj = Documentos.formatarCnpj(dto.getCnpj());

        validadorCredenciais.validarUnicidadeAtualizacao(existente, login, email);
        if (!existente.getCnpj().equals(cnpj) && empresaRepository.existsByCnpj(cnpj)) {
            throw new RegraNegocioException("Já existe outra empresa com o CNPJ: " + cnpj);
        }

        existente.atualizarCadastro(
                dto.getNome().trim(), login, email, dto.getSenha(),
                cnpj, dto.getDescricao().trim());

        return empresaRepository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        Empresa existente = buscarPorId(id);
        if (resgateRepository.existsByVantagemEmpresaId(id)) {
            throw new RegraNegocioException("Não é possível excluir a empresa: há cupons de vantagens já resgatados "
                    + "por alunos. Zere o estoque das vantagens para retirá-las do catálogo.");
        }
        empresaRepository.delete(existente);
    }
}
