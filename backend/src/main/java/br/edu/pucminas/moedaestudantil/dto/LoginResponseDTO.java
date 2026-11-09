package br.edu.pucminas.moedaestudantil.dto;

import br.edu.pucminas.moedaestudantil.model.enums.TipoPerfil;

public record LoginResponseDTO(
        String token,
        Long id,
        String nome,
        String email,
        TipoPerfil tipoPerfil
) {
}
