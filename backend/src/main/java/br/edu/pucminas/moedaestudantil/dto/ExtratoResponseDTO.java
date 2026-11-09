package br.edu.pucminas.moedaestudantil.dto;

import java.util.List;

public record ExtratoResponseDTO(
        Integer saldoMoedas,
        List<TransacaoResponseDTO> transacoes
) {
}
