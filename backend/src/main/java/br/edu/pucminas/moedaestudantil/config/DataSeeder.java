package br.edu.pucminas.moedaestudantil.config;

import br.edu.pucminas.moedaestudantil.model.Aluno;
import br.edu.pucminas.moedaestudantil.model.EmpresaParceira;
import br.edu.pucminas.moedaestudantil.model.InstituicaoEnsino;
import br.edu.pucminas.moedaestudantil.model.Professor;
import br.edu.pucminas.moedaestudantil.model.Transacao;
import br.edu.pucminas.moedaestudantil.model.enums.TipoTransacao;
import br.edu.pucminas.moedaestudantil.repository.AlunoRepository;
import br.edu.pucminas.moedaestudantil.repository.EmpresaParceiraRepository;
import br.edu.pucminas.moedaestudantil.repository.InstituicaoEnsinoRepository;
import br.edu.pucminas.moedaestudantil.repository.ProfessorRepository;
import br.edu.pucminas.moedaestudantil.repository.TransacaoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final InstituicaoEnsinoRepository instituicaoEnsinoRepository;
    private final ProfessorRepository professorRepository;
    private final AlunoRepository alunoRepository;
    private final EmpresaParceiraRepository empresaParceiraRepository;
    private final TransacaoRepository transacaoRepository;

    public DataSeeder(
            InstituicaoEnsinoRepository instituicaoEnsinoRepository,
            ProfessorRepository professorRepository,
            AlunoRepository alunoRepository,
            EmpresaParceiraRepository empresaParceiraRepository,
            TransacaoRepository transacaoRepository) {
        this.instituicaoEnsinoRepository = instituicaoEnsinoRepository;
        this.professorRepository = professorRepository;
        this.alunoRepository = alunoRepository;
        this.empresaParceiraRepository = empresaParceiraRepository;
        this.transacaoRepository = transacaoRepository;
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
            InstituicaoEnsino pucMinas = buscarPucMinas();

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

            List<Professor> salvos = professorRepository.saveAll(List.of(profMilena, profCarlos));

            for (Professor professor : salvos) {
                transacaoRepository.save(new Transacao(
                        1000,
                        "Crédito semestral inicial (1.000 moedas)",
                        TipoTransacao.CREDITO_SEMESTRAL,
                        professor,
                        null,
                        null));
            }
        }

        if (alunoRepository.count() == 0) {
            InstituicaoEnsino pucMinas = buscarPucMinas();

            Aluno alunoAna = new Aluno(
                    "Ana Clara Ferreira",
                    "ana.ferreira@sga.pucminas.br",
                    "ana.ferreira",
                    "aluno123",
                    "222.333.444-55",
                    "MG-18.456.789",
                    "Rua Coração Eucarístico de Jesus, 210 - Coração Eucarístico, Belo Horizonte - MG",
                    "Engenharia de Software",
                    pucMinas);

            alunoRepository.save(alunoAna);
        }

        if (empresaParceiraRepository.count() == 0) {
            EmpresaParceira cafeteria = new EmpresaParceira(
                    "Cafeteria Campus Coração",
                    "contato@cafeteriacampus.com.br",
                    "cafeteria.campus",
                    "empresa123",
                    "24.680.135/0001-42",
                    "Cafeteria e lanchonete parceira próxima ao campus Coração Eucarístico da PUC Minas em Belo Horizonte.");

            empresaParceiraRepository.save(cafeteria);
        }
    }

    private InstituicaoEnsino buscarPucMinas() {
        return instituicaoEnsinoRepository
                .findByCnpj("17.178.195/0001-67")
                .orElseGet(() -> instituicaoEnsinoRepository.findAll().get(0));
    }
}
