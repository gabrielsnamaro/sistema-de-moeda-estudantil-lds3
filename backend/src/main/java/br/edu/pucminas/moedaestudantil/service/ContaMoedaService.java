package br.edu.pucminas.moedaestudantil.service;

import br.edu.pucminas.moedaestudantil.dto.EnvioMoedasRequestDTO;
import br.edu.pucminas.moedaestudantil.dto.ExtratoResponseDTO;
import br.edu.pucminas.moedaestudantil.dto.TransacaoResponseDTO;
import br.edu.pucminas.moedaestudantil.dto.UsuarioAutenticado;
import br.edu.pucminas.moedaestudantil.exception.AcessoNegadoException;
import br.edu.pucminas.moedaestudantil.model.Aluno;
import br.edu.pucminas.moedaestudantil.model.Professor;
import br.edu.pucminas.moedaestudantil.model.Transacao;
import br.edu.pucminas.moedaestudantil.model.enums.TipoPerfil;
import br.edu.pucminas.moedaestudantil.model.enums.TipoTransacao;
import br.edu.pucminas.moedaestudantil.repository.AlunoRepository;
import br.edu.pucminas.moedaestudantil.repository.ProfessorRepository;
import br.edu.pucminas.moedaestudantil.repository.TransacaoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContaMoedaService {

    private static final Logger logger = LoggerFactory.getLogger(ContaMoedaService.class);

    private static final int VALOR_CREDITO_SEMESTRAL = 1000;

    private final ProfessorRepository professorRepository;
    private final AlunoRepository alunoRepository;
    private final TransacaoRepository transacaoRepository;

    public ContaMoedaService(
            ProfessorRepository professorRepository,
            AlunoRepository alunoRepository,
            TransacaoRepository transacaoRepository) {
        this.professorRepository = professorRepository;
        this.alunoRepository = alunoRepository;
        this.transacaoRepository = transacaoRepository;
    }

    @Transactional
    public TransacaoResponseDTO enviarMoedas(UsuarioAutenticado usuario, EnvioMoedasRequestDTO dto) {
        usuario.exigirPerfil(TipoPerfil.PROFESSOR);

        Professor professor = professorRepository.findById(usuario.id())
                .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado com ID: " + usuario.id()));
        Aluno aluno = alunoRepository.findById(dto.alunoId())
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado com ID: " + dto.alunoId()));

        Transacao transacao = professor.enviarMoedas(aluno, dto.valor(), dto.motivo());

        professorRepository.save(professor);
        alunoRepository.save(aluno);
        Transacao salva = transacaoRepository.save(transacao);
        return TransacaoResponseDTO.fromEntity(salva);
    }

    @Transactional(readOnly = true)
    public ExtratoResponseDTO consultarExtrato(UsuarioAutenticado usuario) {
        if (usuario.tipoPerfil() == TipoPerfil.ALUNO) {
            Aluno aluno = alunoRepository.findById(usuario.id())
                    .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado com ID: " + usuario.id()));
            return montarExtrato(aluno.getSaldoMoedas(), transacaoRepository.findByAlunoIdOrderByDataHoraDesc(aluno.getId()));
        }

        if (usuario.tipoPerfil() == TipoPerfil.PROFESSOR) {
            Professor professor = professorRepository.findById(usuario.id())
                    .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado com ID: " + usuario.id()));
            return montarExtrato(professor.getSaldoMoedas(), transacaoRepository.findByProfessorIdOrderByDataHoraDesc(professor.getId()));
        }

        throw new AcessoNegadoException("O extrato está disponível apenas para alunos e professores.");
    }

    // Roda à meia-noite de 1º de janeiro e 1º de julho (início de cada semestre).
    @Scheduled(cron = "0 0 0 1 1,7 *")
    @Transactional
    public void creditarSemestre() {
        List<Professor> professores = professorRepository.findAll();
        for (Professor professor : professores) {
            professor.receberCreditoSemestral();
            professorRepository.save(professor);
            transacaoRepository.save(new Transacao(
                    VALOR_CREDITO_SEMESTRAL,
                    "Crédito semestral de 1.000 moedas",
                    TipoTransacao.CREDITO_SEMESTRAL,
                    professor,
                    null,
                    null));
        }
        logger.info("Crédito semestral aplicado a {} professores.", professores.size());
    }

    private ExtratoResponseDTO montarExtrato(Integer saldoMoedas, List<Transacao> transacoes) {
        List<TransacaoResponseDTO> itens = transacoes.stream()
                .map(TransacaoResponseDTO::fromEntity)
                .toList();
        return new ExtratoResponseDTO(saldoMoedas, itens);
    }
}
