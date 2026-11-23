package com.management.service.extrato;

import com.management.dto.ExtratoDTO;
import com.management.model.ETipoUsuario;

/**
 * Estratégia polimórfica de geração de extrato por perfil de usuário (GRASP: Polymorphism / Protected Variations).
 */
public interface GeradorExtratoStrategy {

    ETipoUsuario perfilSuportado();

    ExtratoDTO gerar(Long usuarioId);
}
