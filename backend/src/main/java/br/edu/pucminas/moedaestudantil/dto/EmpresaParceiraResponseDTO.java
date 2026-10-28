package br.edu.pucminas.moedaestudantil.dto;

import br.edu.pucminas.moedaestudantil.model.EmpresaParceira;

public record EmpresaParceiraResponseDTO(
        Long id,
        String nome,
        String email,
        String login,
        String cnpj,
        String descricao
) {
    public static EmpresaParceiraResponseDTO fromEntity(EmpresaParceira entity) {
        return new EmpresaParceiraResponseDTO(
                entity.getId(),
                entity.getNome(),
                entity.getEmail(),
                entity.getLogin(),
                entity.getCnpj(),
                entity.getDescricao()
        );
    }
}
