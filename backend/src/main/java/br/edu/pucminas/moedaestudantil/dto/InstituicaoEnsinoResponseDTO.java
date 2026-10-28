package br.edu.pucminas.moedaestudantil.dto;

import br.edu.pucminas.moedaestudantil.model.InstituicaoEnsino;

public record InstituicaoEnsinoResponseDTO(
        Long id,
        String nome,
        String cnpj,
        String endereco
) {
    public static InstituicaoEnsinoResponseDTO fromEntity(InstituicaoEnsino entity) {
        return new InstituicaoEnsinoResponseDTO(
                entity.getId(),
                entity.getNome(),
                entity.getCnpj(),
                entity.getEndereco()
        );
    }
}
