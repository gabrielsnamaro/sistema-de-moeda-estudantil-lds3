package br.edu.pucminas.moedaestudantil.dto;

import br.edu.pucminas.moedaestudantil.exception.AcessoNegadoException;
import br.edu.pucminas.moedaestudantil.model.enums.TipoPerfil;

public record UsuarioAutenticado(
        Long id,
        String nome,
        String email,
        TipoPerfil tipoPerfil
) {

    public void exigirPerfil(TipoPerfil perfilEsperado) {
        if (tipoPerfil != perfilEsperado) {
            throw new AcessoNegadoException("Operação permitida apenas para o perfil " + perfilEsperado + ".");
        }
    }

    public void exigirMesmoUsuario(Long idRecurso) {
        if (!id.equals(idRecurso)) {
            throw new AcessoNegadoException("Você só pode alterar ou excluir os seus próprios dados.");
        }
    }
}
