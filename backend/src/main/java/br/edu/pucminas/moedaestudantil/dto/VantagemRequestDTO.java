package br.edu.pucminas.moedaestudantil.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record VantagemRequestDTO(
        @NotBlank(message = "O título é obrigatório.")
        String titulo,

        @NotBlank(message = "A descrição é obrigatória.")
        String descricao,

        @NotBlank(message = "A foto do produto (URL) é obrigatória.")
        @Size(max = 500, message = "A URL da foto deve ter no máximo 500 caracteres.")
        String fotoProduto,

        @NotNull(message = "O custo em moedas é obrigatório.")
        @Positive(message = "O custo deve ser maior que zero.")
        Integer custoMoedas
) {
}
