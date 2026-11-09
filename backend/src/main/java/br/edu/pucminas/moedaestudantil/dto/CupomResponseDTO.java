package br.edu.pucminas.moedaestudantil.dto;

import br.edu.pucminas.moedaestudantil.model.Aluno;
import br.edu.pucminas.moedaestudantil.model.CupomResgate;
import br.edu.pucminas.moedaestudantil.model.EmpresaParceira;
import br.edu.pucminas.moedaestudantil.model.Vantagem;

import java.time.LocalDateTime;

public record CupomResponseDTO(
        Long id,
        String codigoGerado,
        LocalDateTime dataGeracao,
        Boolean utilizado,
        Long vantagemId,
        String vantagemTitulo,
        Integer custoMoedas,
        Long alunoId,
        String alunoNome,
        String alunoEmail,
        Long empresaId,
        String empresaNome,
        String empresaEmail,
        Integer saldoRestanteAluno
) {
    public static CupomResponseDTO fromEntity(CupomResgate cupom) {
        Vantagem vantagem = cupom.getVantagem();
        Aluno aluno = cupom.getAluno();
        EmpresaParceira empresa = vantagem.getEmpresaParceira();
        return new CupomResponseDTO(
                cupom.getId(),
                cupom.getCodigoGerado(),
                cupom.getDataGeracao(),
                cupom.getUtilizado(),
                vantagem.getId(),
                vantagem.getTitulo(),
                vantagem.getCustoMoedas(),
                aluno.getId(),
                aluno.getNome(),
                aluno.getEmail(),
                empresa.getId(),
                empresa.getNome(),
                empresa.getEmail(),
                aluno.getSaldoMoedas()
        );
    }
}
