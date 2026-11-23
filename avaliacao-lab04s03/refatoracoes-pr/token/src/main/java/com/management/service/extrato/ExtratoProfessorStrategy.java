package com.management.service.extrato;

import com.management.dto.ExtratoDTO;
import com.management.dto.ItemExtratoDTO;
import com.management.model.ETipoUsuario;
import com.management.model.Professor;
import com.management.repository.TransacaoRepository;
import com.management.service.ProfessorService;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class ExtratoProfessorStrategy implements GeradorExtratoStrategy {

    private final ProfessorService professorService;
    private final TransacaoRepository transacaoRepository;

    public ExtratoProfessorStrategy(ProfessorService professorService,
                                    TransacaoRepository transacaoRepository) {
        this.professorService = professorService;
        this.transacaoRepository = transacaoRepository;
    }

    @Override
    public ETipoUsuario perfilSuportado() {
        return ETipoUsuario.PROFESSOR;
    }

    @Override
    public ExtratoDTO gerar(Long usuarioId) {
        Professor professor = professorService.buscarPorId(usuarioId);
        List<ItemExtratoDTO> itens = transacaoRepository
                .findByProfessorIdOrderByDataHoraDesc(professor.getId())
                .stream()
                .map(t -> new ItemExtratoDTO(
                        "ENVIO",
                        -t.getValor(),
                        t.getDescricaoMotivo(),
                        t.getAluno().getNome(),
                        t.getDataHora(),
                        null))
                .sorted(Comparator.comparing(ItemExtratoDTO::dataHora).reversed())
                .toList();
        return new ExtratoDTO(professor.getSaldo(), itens);
    }
}
