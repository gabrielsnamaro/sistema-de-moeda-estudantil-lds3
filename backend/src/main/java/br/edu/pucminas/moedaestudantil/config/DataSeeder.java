package br.edu.pucminas.moedaestudantil.config;

import br.edu.pucminas.moedaestudantil.model.InstituicaoEnsino;
import br.edu.pucminas.moedaestudantil.model.Professor;
import br.edu.pucminas.moedaestudantil.repository.InstituicaoEnsinoRepository;
import br.edu.pucminas.moedaestudantil.repository.ProfessorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final InstituicaoEnsinoRepository instituicaoEnsinoRepository;
    private final ProfessorRepository professorRepository;

    public DataSeeder(
            InstituicaoEnsinoRepository instituicaoEnsinoRepository,
            ProfessorRepository professorRepository) {
        this.instituicaoEnsinoRepository = instituicaoEnsinoRepository;
        this.professorRepository = professorRepository;
    }

    @Override
    public void run(String... args) {
        if (instituicaoEnsinoRepository.count() == 0) {
            InstituicaoEnsino pucMinas = new InstituicaoEnsino(
                    "Pontifícia Universidade Católica de Minas Gerais (PUC Minas)",
                    "17.178.195/0001-67",
                    "Av. Dom José Gaspar, 500 - Coração Eucarístico, Belo Horizonte - MG");
            InstituicaoEnsino ufmg = new InstituicaoEnsino(
                    "Universidade Federal de Minas Gerais (UFMG)",
                    "17.217.985/0001-04",
                    "Av. Pres. Antônio Carlos, 6627 - Pampulha, Belo Horizonte - MG");
            InstituicaoEnsino cefetMg = new InstituicaoEnsino(
                    "Centro Federal de Educação Tecnológica de Minas Gerais (CEFET-MG)",
                    "17.220.203/0001-96",
                    "Av. Amazonas, 5253 - Nova Suíça, Belo Horizonte - MG");

            instituicaoEnsinoRepository.saveAll(List.of(pucMinas, ufmg, cefetMg));
        }

        if (professorRepository.count() == 0) {
            InstituicaoEnsino pucMinas = instituicaoEnsinoRepository
                    .findByCnpj("17.178.195/0001-67")
                    .orElseGet(() -> instituicaoEnsinoRepository.findAll().get(0));

            Professor profMilena = new Professor(
                    "Profa. Milena Menezes Adão",
                    "milena.adao@pucminas.br",
                    "milena.adao",
                    "prof123",
                    "111.222.333-44",
                    "Engenharia de Software",
                    pucMinas);
            profMilena.setSaldoMoedas(1000);

            Professor profCarlos = new Professor(
                    "Prof. Carlos Eduardo Almeida",
                    "carlos.almeida@pucminas.br",
                    "carlos.almeida",
                    "prof123",
                    "555.666.777-88",
                    "Ciência da Computação",
                    pucMinas);
            profCarlos.setSaldoMoedas(1000);

            professorRepository.saveAll(List.of(profMilena, profCarlos));
        }
    }
}
