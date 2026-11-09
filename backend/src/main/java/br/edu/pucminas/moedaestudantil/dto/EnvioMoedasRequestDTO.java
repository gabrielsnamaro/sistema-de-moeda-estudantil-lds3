package br.edu.pucminas.moedaestudantil.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record EnvioMoedasRequestDTO(
        @NotNull(message = "Selecione o aluno.")
        Long alunoId,

        @NotNull(message = "Informe o valor.")
        @Positive(message = "O valor deve ser maior que zero.")
        Integer valor,

        @NotBlank(message = "O motivo é obrigatório.")
        String motivo
) {
}
