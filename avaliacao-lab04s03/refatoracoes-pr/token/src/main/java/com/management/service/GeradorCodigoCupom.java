package com.management.service;

import com.management.repository.ResgateVantagemRepository;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Locale;

/**
 * Componente dedicado à geração, formatação e normalização de códigos de cupom
 * (GRASP: Pure Fabrication + High Cohesion + Protected Variations).
 */
@Component
public class GeradorCodigoCupom {

    private static final String ALFABETO_CUPOM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ResgateVantagemRepository resgateRepository;

    public GeradorCodigoCupom(ResgateVantagemRepository resgateRepository) {
        this.resgateRepository = resgateRepository;
    }

    public String gerarUnico() {
        String codigo;
        do {
            codigo = gerarCandidato();
        } while (resgateRepository.existsByCodigoCupom(codigo));
        return codigo;
    }

    public String normalizar(String codigo) {
        return codigo == null ? "" : codigo.trim().toUpperCase(Locale.ROOT);
    }

    private String gerarCandidato() {
        StringBuilder sb = new StringBuilder("TKN-");
        for (int i = 0; i < 8; i++) {
            if (i == 4) {
                sb.append('-');
            }
            sb.append(ALFABETO_CUPOM.charAt(RANDOM.nextInt(ALFABETO_CUPOM.length())));
        }
        return sb.toString();
    }
}
