package br.edu.pucminas.moedaestudantil.service;

import br.edu.pucminas.moedaestudantil.dto.AlunoRequestDTO;
import br.edu.pucminas.moedaestudantil.dto.AlunoResponseDTO;
import br.edu.pucminas.moedaestudantil.model.Aluno;
import br.edu.pucminas.moedaestudantil.model.InstituicaoEnsino;
import br.edu.pucminas.moedaestudantil.model.enums.TipoPerfil;
import br.edu.pucminas.moedaestudantil.repository.AlunoRepository;
import br.edu.pucminas.moedaestudantil.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InstituicaoEnsinoService instituicaoEnsinoService;

    public AlunoService(
            AlunoRepository alunoRepository,
            UsuarioRepository usuarioRepository,
            InstituicaoEnsinoService instituicaoEnsinoService) {
        this.alunoRepository = alunoRepository;
        this.usuarioRepository = usuarioRepository;
        this.instituicaoEnsinoService = instituicaoEnsinoService;
    }

    @Transactional(readOnly = true)
    public List<AlunoResponseDTO> listarTodos() {
        return alunoRepository.findAll()
                .stream()
                .map(AlunoResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public AlunoResponseDTO buscarPorId(Long id) {
        Aluno aluno = buscarEntidadePorId(id);
        return AlunoResponseDTO.fromEntity(aluno);
    }

    @Transactional
    public AlunoResponseDTO criar(AlunoRequestDTO dto) {
        if (dto.senha() == null || dto.senha().isBlank()) {
            throw new IllegalArgumentException("A senha é obrigatória para o cadastro do aluno.");
        }

        if (alunoRepository.existsByCpf(dto.cpf())) {
            throw new IllegalArgumentException("Já existe um aluno cadastrado com o CPF informado.");
        }
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com o e-mail informado.");
        }
        if (usuarioRepository.existsByLogin(dto.login())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com o login informado.");
        }

        InstituicaoEnsino instituicao = instituicaoEnsinoService.buscarEntidadePorId(dto.instituicaoEnsinoId());

        Aluno aluno = new Aluno();
        aluno.setNome(dto.nome());
        aluno.setEmail(dto.email());
        aluno.setLogin(dto.login());
        aluno.setSenha(dto.senha());
        aluno.setCpf(dto.cpf());
        aluno.setRg(dto.rg());
        aluno.setEndereco(dto.endereco());
        aluno.setCurso(dto.curso());
        aluno.setSaldoMoedas(0);
        aluno.setTipoPerfil(TipoPerfil.ALUNO);
        aluno.setInstituicaoEnsino(instituicao);

        Aluno salvo = alunoRepository.save(aluno);
        return AlunoResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public AlunoResponseDTO atualizar(Long id, AlunoRequestDTO dto) {
        Aluno aluno = buscarEntidadePorId(id);

        if (alunoRepository.existsByCpfAndIdNot(dto.cpf(), id)) {
            throw new IllegalArgumentException("Já existe outro aluno cadastrado com o CPF informado.");
        }
        if (usuarioRepository.existsByEmailAndIdNot(dto.email(), id)) {
            throw new IllegalArgumentException("Já existe outro usuário cadastrado com o e-mail informado.");
        }
        if (usuarioRepository.existsByLoginAndIdNot(dto.login(), id)) {
            throw new IllegalArgumentException("Já existe outro usuário cadastrado com o login informado.");
        }

        InstituicaoEnsino instituicao = instituicaoEnsinoService.buscarEntidadePorId(dto.instituicaoEnsinoId());

        aluno.setNome(dto.nome());
        aluno.setEmail(dto.email());
        aluno.setLogin(dto.login());
        if (dto.senha() != null && !dto.senha().isBlank()) {
            aluno.setSenha(dto.senha());
        }
        aluno.setCpf(dto.cpf());
        aluno.setRg(dto.rg());
        aluno.setEndereco(dto.endereco());
        aluno.setCurso(dto.curso());
        aluno.setInstituicaoEnsino(instituicao);

        Aluno salvo = alunoRepository.save(aluno);
        return AlunoResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public void excluir(Long id) {
        if (!alunoRepository.existsById(id)) {
            throw new EntityNotFoundException("Aluno não encontrado com ID: " + id);
        }
        alunoRepository.deleteById(id);
    }

    private Aluno buscarEntidadePorId(Long id) {
        return alunoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado com ID: " + id));
    }
}
