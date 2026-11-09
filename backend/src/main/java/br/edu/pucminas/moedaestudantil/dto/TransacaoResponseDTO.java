package br.edu.pucminas.moedaestudantil.dto;

import br.edu.pucminas.moedaestudantil.model.Aluno;
import br.edu.pucminas.moedaestudantil.model.Professor;
import br.edu.pucminas.moedaestudantil.model.Transacao;
import br.edu.pucminas.moedaestudantil.model.Vantagem;
import br.edu.pucminas.moedaestudantil.model.enums.TipoTransacao;

import java.time.LocalDateTime;

public record TransacaoResponseDTO(
        Long id,
        LocalDateTime dataHora,
        TipoTransacao tipo,
        Integer valorMoedas,
        String motivo,
        Long professorId,
        String professorNome,
        Long alunoId,
        String alunoNome,
        String alunoEmail,
        Long vantagemId,
        String vantagemTitulo
) {
    public static TransacaoResponseDTO fromEntity(Transacao entity) {
        Professor professor = entity.getProfessor();
        Aluno aluno = entity.getAluno();
        Vantagem vantagem = entity.getVantagem();
        return new TransacaoResponseDTO(
                entity.getId(),
                entity.getDataHora(),
                entity.getTipo(),
                entity.getValorMoedas(),
                entity.getMotivo(),
                professor != null ? professor.getId() : null,
                professor != null ? professor.getNome() : null,
                aluno != null ? aluno.getId() : null,
                aluno != null ? aluno.getNome() : null,
                aluno != null ? aluno.getEmail() : null,
                vantagem != null ? vantagem.getId() : null,
                vantagem != null ? vantagem.getTitulo() : null
        );
    }
}
