package br.edu.pucminas.moedaestudantil.dto;

import br.edu.pucminas.moedaestudantil.model.EmpresaParceira;
import br.edu.pucminas.moedaestudantil.model.Vantagem;

public record VantagemResponseDTO(
        Long id,
        String titulo,
        String descricao,
        String fotoProduto,
        Integer custoMoedas,
        Boolean ativa,
        Long empresaId,
        String empresaNome
) {
    public static VantagemResponseDTO fromEntity(Vantagem entity) {
        EmpresaParceira empresa = entity.getEmpresaParceira();
        return new VantagemResponseDTO(
                entity.getId(),
                entity.getTitulo(),
                entity.getDescricao(),
                entity.getFotoProduto(),
                entity.getCustoMoedas(),
                entity.getAtiva(),
                empresa != null ? empresa.getId() : null,
                empresa != null ? empresa.getNome() : null
        );
    }
}
