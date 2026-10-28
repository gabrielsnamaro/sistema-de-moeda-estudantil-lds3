package br.edu.pucminas.moedaestudantil.dto;

import br.edu.pucminas.moedaestudantil.model.Aluno;
import br.edu.pucminas.moedaestudantil.model.InstituicaoEnsino;

public record AlunoResponseDTO(
        Long id,
        String nome,
        String email,
        String login,
        String cpf,
        String rg,
        String endereco,
        String curso,
        Integer saldoMoedas,
        Long instituicaoEnsinoId,
        String instituicaoEnsinoNome
) {
    public static AlunoResponseDTO fromEntity(Aluno entity) {
        InstituicaoEnsino instituicao = entity.getInstituicaoEnsino();
        return new AlunoResponseDTO(
                entity.getId(),
                entity.getNome(),
                entity.getEmail(),
                entity.getLogin(),
                entity.getCpf(),
                entity.getRg(),
                entity.getEndereco(),
                entity.getCurso(),
                entity.getSaldoMoedas(),
                instituicao != null ? instituicao.getId() : null,
                instituicao != null ? instituicao.getNome() : null
        );
    }
}
