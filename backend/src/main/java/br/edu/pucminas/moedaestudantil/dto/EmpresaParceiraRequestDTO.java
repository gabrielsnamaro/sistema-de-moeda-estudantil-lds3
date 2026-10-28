package br.edu.pucminas.moedaestudantil.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmpresaParceiraRequestDTO(
        @NotBlank(message = "O nome da empresa é obrigatório.")
        String nome,

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "O formato do e-mail é inválido.")
        String email,

        @NotBlank(message = "O login é obrigatório.")
        String login,

        String senha,

        @NotBlank(message = "O CNPJ é obrigatório.")
        String cnpj,

        String descricao
) {
}
