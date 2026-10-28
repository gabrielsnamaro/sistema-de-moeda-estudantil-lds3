package br.edu.pucminas.moedaestudantil.service;

import br.edu.pucminas.moedaestudantil.dto.EmpresaParceiraRequestDTO;
import br.edu.pucminas.moedaestudantil.dto.EmpresaParceiraResponseDTO;
import br.edu.pucminas.moedaestudantil.model.EmpresaParceira;
import br.edu.pucminas.moedaestudantil.model.enums.TipoPerfil;
import br.edu.pucminas.moedaestudantil.repository.EmpresaParceiraRepository;
import br.edu.pucminas.moedaestudantil.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmpresaParceiraService {

    private final EmpresaParceiraRepository empresaParceiraRepository;
    private final UsuarioRepository usuarioRepository;

    public EmpresaParceiraService(
            EmpresaParceiraRepository empresaParceiraRepository,
            UsuarioRepository usuarioRepository) {
        this.empresaParceiraRepository = empresaParceiraRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<EmpresaParceiraResponseDTO> listarTodas() {
        return empresaParceiraRepository.findAll()
                .stream()
                .map(EmpresaParceiraResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmpresaParceiraResponseDTO buscarPorId(Long id) {
        EmpresaParceira empresa = empresaParceiraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa parceira não encontrada com ID: " + id));
        return EmpresaParceiraResponseDTO.fromEntity(empresa);
    }

    @Transactional
    public EmpresaParceiraResponseDTO criar(EmpresaParceiraRequestDTO dto) {
        if (dto.senha() == null || dto.senha().isBlank()) {
            throw new IllegalArgumentException("A senha é obrigatória para o cadastro da empresa parceira.");
        }

        if (empresaParceiraRepository.existsByCnpj(dto.cnpj())) {
            throw new IllegalArgumentException("Já existe uma empresa parceira cadastrada com o CNPJ informado.");
        }
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com o e-mail informado.");
        }
        if (usuarioRepository.existsByLogin(dto.login())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com o login informado.");
        }

        EmpresaParceira empresa = new EmpresaParceira(
                dto.nome(),
                dto.email(),
                dto.login(),
                dto.senha(),
                dto.cnpj(),
                dto.descricao()
        );
        empresa.setTipoPerfil(TipoPerfil.EMPRESA_PARCEIRA);

        EmpresaParceira salva = empresaParceiraRepository.save(empresa);
        return EmpresaParceiraResponseDTO.fromEntity(salva);
    }

    @Transactional
    public EmpresaParceiraResponseDTO atualizar(Long id, EmpresaParceiraRequestDTO dto) {
        EmpresaParceira empresa = empresaParceiraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa parceira não encontrada com ID: " + id));

        if (empresaParceiraRepository.existsByCnpjAndIdNot(dto.cnpj(), id)) {
            throw new IllegalArgumentException("Já existe outra empresa parceira cadastrada com o CNPJ informado.");
        }
        if (usuarioRepository.existsByEmailAndIdNot(dto.email(), id)) {
            throw new IllegalArgumentException("Já existe outro usuário cadastrado com o e-mail informado.");
        }
        if (usuarioRepository.existsByLoginAndIdNot(dto.login(), id)) {
            throw new IllegalArgumentException("Já existe outro usuário cadastrado com o login informado.");
        }

        empresa.setNome(dto.nome());
        empresa.setEmail(dto.email());
        empresa.setLogin(dto.login());
        empresa.setCnpj(dto.cnpj());
        empresa.setDescricao(dto.descricao());

        if (dto.senha() != null && !dto.senha().isBlank()) {
            empresa.setSenha(dto.senha());
        }

        EmpresaParceira salva = empresaParceiraRepository.save(empresa);
        return EmpresaParceiraResponseDTO.fromEntity(salva);
    }

    @Transactional
    public void excluir(Long id) {
        if (!empresaParceiraRepository.existsById(id)) {
            throw new EntityNotFoundException("Empresa parceira não encontrada com ID: " + id);
        }
        empresaParceiraRepository.deleteById(id);
    }
}
