package br.edu.pucminas.moedaestudantil.service;

import br.edu.pucminas.moedaestudantil.dto.InstituicaoEnsinoResponseDTO;
import br.edu.pucminas.moedaestudantil.model.InstituicaoEnsino;
import br.edu.pucminas.moedaestudantil.repository.InstituicaoEnsinoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InstituicaoEnsinoService {

    private final InstituicaoEnsinoRepository instituicaoEnsinoRepository;

    public InstituicaoEnsinoService(InstituicaoEnsinoRepository instituicaoEnsinoRepository) {
        this.instituicaoEnsinoRepository = instituicaoEnsinoRepository;
    }

    @Transactional(readOnly = true)
    public List<InstituicaoEnsinoResponseDTO> listarTodas() {
        return instituicaoEnsinoRepository.findAll()
                .stream()
                .map(InstituicaoEnsinoResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public InstituicaoEnsino buscarEntidadePorId(Long id) {
        return instituicaoEnsinoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Instituição de ensino não encontrada com ID: " + id));
    }
}
