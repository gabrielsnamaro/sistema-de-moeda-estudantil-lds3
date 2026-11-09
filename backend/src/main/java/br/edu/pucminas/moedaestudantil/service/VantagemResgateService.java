package br.edu.pucminas.moedaestudantil.service;

import br.edu.pucminas.moedaestudantil.dto.CupomResponseDTO;
import br.edu.pucminas.moedaestudantil.dto.UsuarioAutenticado;
import br.edu.pucminas.moedaestudantil.dto.VantagemRequestDTO;
import br.edu.pucminas.moedaestudantil.dto.VantagemResponseDTO;
import br.edu.pucminas.moedaestudantil.exception.AcessoNegadoException;
import br.edu.pucminas.moedaestudantil.model.Aluno;
import br.edu.pucminas.moedaestudantil.model.CupomResgate;
import br.edu.pucminas.moedaestudantil.model.EmpresaParceira;
import br.edu.pucminas.moedaestudantil.model.Vantagem;
import br.edu.pucminas.moedaestudantil.model.enums.TipoPerfil;
import br.edu.pucminas.moedaestudantil.repository.AlunoRepository;
import br.edu.pucminas.moedaestudantil.repository.CupomResgateRepository;
import br.edu.pucminas.moedaestudantil.repository.EmpresaParceiraRepository;
import br.edu.pucminas.moedaestudantil.repository.TransacaoRepository;
import br.edu.pucminas.moedaestudantil.repository.VantagemRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VantagemResgateService {

    private final VantagemRepository vantagemRepository;
    private final EmpresaParceiraRepository empresaParceiraRepository;
    private final AlunoRepository alunoRepository;
    private final TransacaoRepository transacaoRepository;
    private final CupomResgateRepository cupomResgateRepository;

    public VantagemResgateService(
            VantagemRepository vantagemRepository,
            EmpresaParceiraRepository empresaParceiraRepository,
            AlunoRepository alunoRepository,
            TransacaoRepository transacaoRepository,
            CupomResgateRepository cupomResgateRepository) {
        this.vantagemRepository = vantagemRepository;
        this.empresaParceiraRepository = empresaParceiraRepository;
        this.alunoRepository = alunoRepository;
        this.transacaoRepository = transacaoRepository;
        this.cupomResgateRepository = cupomResgateRepository;
    }

    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> listarAtivas() {
        return vantagemRepository.findByAtivaTrue()
                .stream()
                .map(VantagemResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VantagemResponseDTO> listarDaEmpresa(UsuarioAutenticado usuario) {
        usuario.exigirPerfil(TipoPerfil.EMPRESA_PARCEIRA);
        return vantagemRepository.findByEmpresaParceiraId(usuario.id())
                .stream()
                .filter(vantagem -> Boolean.TRUE.equals(vantagem.getAtiva()))
                .map(VantagemResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public VantagemResponseDTO criar(UsuarioAutenticado usuario, VantagemRequestDTO dto) {
        usuario.exigirPerfil(TipoPerfil.EMPRESA_PARCEIRA);
        EmpresaParceira empresa = empresaParceiraRepository.findById(usuario.id())
                .orElseThrow(() -> new EntityNotFoundException("Empresa parceira não encontrada com ID: " + usuario.id()));

        Vantagem vantagem = empresa.cadastrarVantagem(
                dto.titulo().trim(),
                dto.descricao().trim(),
                dto.fotoProduto().trim(),
                dto.custoMoedas());

        return VantagemResponseDTO.fromEntity(vantagemRepository.save(vantagem));
    }

    @Transactional
    public VantagemResponseDTO atualizar(UsuarioAutenticado usuario, Long id, VantagemRequestDTO dto) {
        usuario.exigirPerfil(TipoPerfil.EMPRESA_PARCEIRA);
        Vantagem vantagem = buscarVantagemDaEmpresa(usuario, id);

        vantagem.setTitulo(dto.titulo().trim());
        vantagem.setDescricao(dto.descricao().trim());
        vantagem.setFotoProduto(dto.fotoProduto().trim());
        vantagem.setCustoMoedas(dto.custoMoedas());
        if (!vantagem.validarCusto()) {
            throw new IllegalArgumentException("O custo da vantagem deve ser maior que zero.");
        }

        return VantagemResponseDTO.fromEntity(vantagemRepository.save(vantagem));
    }

    // Exclusão lógica: cupons e transações já emitidos referenciam a vantagem.
    @Transactional
    public void excluir(UsuarioAutenticado usuario, Long id) {
        usuario.exigirPerfil(TipoPerfil.EMPRESA_PARCEIRA);
        Vantagem vantagem = buscarVantagemDaEmpresa(usuario, id);
        vantagem.setAtiva(false);
        vantagemRepository.save(vantagem);
    }

    @Transactional
    public CupomResponseDTO resgatar(UsuarioAutenticado usuario, Long vantagemId) {
        usuario.exigirPerfil(TipoPerfil.ALUNO);
        Aluno aluno = alunoRepository.findById(usuario.id())
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado com ID: " + usuario.id()));
        Vantagem vantagem = buscarVantagem(vantagemId);

        CupomResgate cupom = aluno.resgatarVantagem(vantagem);

        // A transação é salva antes do cupom, que a referencia.
        transacaoRepository.save(cupom.getTransacao());
        alunoRepository.save(aluno);
        CupomResgate salvo = cupomResgateRepository.save(cupom);

        return CupomResponseDTO.fromEntity(salvo);
    }

    @Transactional(readOnly = true)
    public List<CupomResponseDTO> listarCuponsDoAluno(UsuarioAutenticado usuario) {
        usuario.exigirPerfil(TipoPerfil.ALUNO);
        return cupomResgateRepository.findByAlunoIdOrderByDataGeracaoDesc(usuario.id())
                .stream()
                .map(CupomResponseDTO::fromEntity)
                .toList();
    }

    private Vantagem buscarVantagem(Long id) {
        return vantagemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vantagem não encontrada com ID: " + id));
    }

    private Vantagem buscarVantagemDaEmpresa(UsuarioAutenticado usuario, Long id) {
        Vantagem vantagem = buscarVantagem(id);
        EmpresaParceira dona = vantagem.getEmpresaParceira();
        if (dona == null || !usuario.id().equals(dona.getId())) {
            throw new AcessoNegadoException("Esta vantagem pertence a outra empresa parceira.");
        }
        return vantagem;
    }
}
