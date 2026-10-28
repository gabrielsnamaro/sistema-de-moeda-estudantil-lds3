package br.edu.pucminas.moedaestudantil.repository;

import br.edu.pucminas.moedaestudantil.model.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    List<Transacao> findByProfessorIdOrderByDataHoraDesc(Long professorId);

    List<Transacao> findByAlunoIdOrderByDataHoraDesc(Long alunoId);
}
