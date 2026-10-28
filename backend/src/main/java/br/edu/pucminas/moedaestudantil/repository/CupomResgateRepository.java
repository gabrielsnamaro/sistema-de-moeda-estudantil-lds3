package br.edu.pucminas.moedaestudantil.repository;

import br.edu.pucminas.moedaestudantil.model.CupomResgate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CupomResgateRepository extends JpaRepository<CupomResgate, Long> {

    Optional<CupomResgate> findByCodigoGerado(String codigoGerado);

    List<CupomResgate> findByAlunoIdOrderByDataGeracaoDesc(Long alunoId);
}
