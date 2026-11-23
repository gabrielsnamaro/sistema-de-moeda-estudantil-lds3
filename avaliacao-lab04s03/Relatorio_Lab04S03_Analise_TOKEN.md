# Relatório de Análise Técnica e Refatorações GRASP — Lab04S03

**Disciplina:** Laboratório de Desenvolvimento de Software — PUC Minas (2º Semestre / 2026)  
**Docente:** Profa. Milena Menezes Adão  
**Projeto Analisado:** **TOKEN** (*Talent & Outstanding Knowledge Educational Network*) — Sistema de Moeda Estudantil  
**Equipe Avaliadora:** Fabrício Rocha Lopes · Gabriel Silva Neiva Amaro · Otávio Chaves Silva · Samuel Rocha Ferraz Gonçalves Rebula

---

## 1. Visão Geral da Análise

Este documento apresenta uma análise técnica construtiva do projeto **TOKEN — Sistema de Moeda Estudantil**, contemplando arquitetura e tecnologias adotadas, organização do repositório, experiência de configuração do ambiente a partir do `README.md`, aderência dos diagramas UML/ER à notação e ao código implementado, bem como **três propostas concretas de refatoração fundamentadas nos padrões GRASP**, acompanhadas de código *antes/depois* e justificativa técnica.

De modo geral, o projeto demonstra excelente maturidade de engenharia: implementa integralmente os requisitos funcionais da Release 1 e da Release 2, adota boas práticas de segurança (hash **BCrypt** para senhas e controle de perfil por anotação `@PerfilPermitido`), concorrência otimista (`@Version`), envio assíncrono de e-mails após o commit da transação (`@TransactionalEventListener(AFTER_COMMIT)` + `@Async`), ambiente conteinerizado com Docker Compose e suíte automatizada de testes tanto no back-end (JUnit 5 + MockMvc) quanto no front-end (Vitest + Testing Library).

As seções a seguir registram os pontos fortes observados e apresentam **oportunidades de aprimoramento, sincronização e evolução arquitetural**.

---

## 2. Arquitetura e Tecnologias Utilizadas

### 2.1 Escolhas Técnicas e Pontos Positivos

| Camada | Tecnologias Identificadas | Destaques Positivos |
| :--- | :--- | :--- |
| **View (Front-end)** | React 19, React Router 7, Vite 6, Tailwind CSS 4, `lucide-react` | Separação modular por perfil (`pages/aluno`, `professor`, `empresa`, `publico`), hooks customizados (`useApi`, `useFormulario`) e testes de interface com Vitest + Testing Library. |
| **Controller (API REST)** | Java 21, Spring Boot 3.5.4, Spring Web MVC, Bean Validation (`@CPF`, `@CNPJ`) | Endpoints REST bem definidos, tratamento centralizado de erros (`ApiExceptionHandler`) e interceptor de sessão/perfil (`AutenticacaoInterceptor`, `@Publico`, `@PerfilPermitido`). |
| **Model & Service** | Entidades JPA ricas (`Usuario`, `UsuarioPessoa`, `Aluno`, `Professor`, `Empresa`, `Vantagem`, `Transacao`, `ResgateVantagem`, `Semestre`) + Services | Regras centrais de domínio encapsuladas nas entidades (`Professor.enviarMoedas`, `Aluno.resgatarVantagem`, `ResgateVantagem.registrarUtilizacao`) e controle de concorrência otimista via `@Version`. |
| **Persistência** | Spring Data JPA + Hibernate ORM, H2 em arquivo (local) e PostgreSQL 16 (nuvem) | Herança `InheritanceType.JOINED` coerente com o domínio e mapeamento explícito de `Vantagem.foto` como `VARBINARY`/`BYTEA` para portabilidade entre H2 e PostgreSQL. |
| **Comunicação & Infra** | Spring Mail (SMTP assíncrono), Mailpit (local), Mailtrap/Brevo (nuvem), Docker multi-stage, Vercel + Render | Uso criativo de *rewrite* `/api/:path*` em `frontend/vercel.json` para manter cookie `JSESSIONID` na mesma origem sem CORS; eventos de domínio pós-commit garantem que falhas de SMTP não desfaçam transações. |

### 2.2 Oportunidades de Evolução Arquitetural

1. **Paridade entre banco local e banco de produção:** o ambiente local utiliza **H2 em arquivo** enquanto a nuvem utiliza **PostgreSQL 16**. Como oportunidade de evolução, incluir um serviço opcional de PostgreSQL no `docker-compose.yml` permitiria validar consultas, constraints e tipos de dados exatamente no mesmo SGBD de produção antes do deploy.
2. **Armazenamento de mídia das vantagens:** as imagens das vantagens são persistidas diretamente na tabela `VANTAGEM` (`byte[]` / `BYTEA`). Para o escopo acadêmico a solução é prática e autocontida; em cenários de maior volume, delegar o armazenamento a um serviço de objetos (ex.: S3/R2/Cloudinary) reduziria o tamanho do banco e o tráfego de backup.
3. **Sessão HTTP em memória:** o modelo de sessão padrão do Tomcat atende muito bem uma instância única, mas em reinícios/hibernação do plano gratuito do Render (ou escalonamento horizontal futuro) as sessões ativas são encerradas. A adoção futura de armazenamento externo de sessão (ex.: Spring Session JDBC/Redis) ou tokens stateless ampliaria a resiliência.
4. **Alinhamento do limite de upload de foto:** `application.properties` configura `spring.servlet.multipart.max-file-size=5MB`, enquanto `VantagemService` define `TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024` (2 MB). Harmonizar os dois valores ou externalizar o limite para propriedade de configuração (`@Value`) garante consistência de comportamento.

---

## 3. Organização do Repositório GitHub

### 3.1 Pontos Positivos
- Estrutura clara e navegável, separando `token/` (back-end), `frontend/` (SPA), `Diagramas/` (incluindo `Diagramas/Release2/` com fontes `.puml` e `.png` gerados), `Apresentacao/`, `README.md`, `STACK.md`, `Dockerfile`, `docker-compose.yml` e `render.yaml`.
- Versionamento conjunto dos arquivos-fonte PlantUML (`.puml`) e das imagens (`.png`), além de um serviço `diagramas` no `docker-compose.yml` para regeneração reprodutível.
- Documentação técnica complementar bem detalhada em `STACK.md` listando versões fixadas e responsabilidades de cada dependência.

### 3.2 Oportunidades de Aprimoramento na Organização
1. **Arquivos gerados ainda rastreados pelo Git:** embora `.gitignore` declare corretamente `token/target/`, `token/data/` e `*.mv.db`, a pasta `token/target/` (incluindo binários `.class`, `surefire-reports` e `static/`) e o arquivo binário `token/data/tokendb.mv.db` permanecem presentes no repositório (situação comum quando os arquivos são adicionados antes da criação da regra no `.gitignore`). Executar `git rm -r --cached token/target token/data` manteria o histórico mais enxuto e evitaria conflitos de merge em arquivos binários.
2. **Documentos de enunciado versionados:** os PDFs `LABORATORIO_3_LAB_DESENVOLVIMENTO_DE_SOFTWARE.pdf` (em `Diagramas/`) e `LABORATORIO_4_LAB_DESENVOLVIMENTO_DE_SOFTWARE (2).pdf` (na raiz) poderiam ser removidos do controle de versão ou agrupados em uma pasta `docs/` dedicada.
3. **Simetria de nomenclatura das pastas principais:** o front-end está em `frontend/` e o back-end em `token/`. Adotar `backend/` e `frontend/` (ou documentar a convenção no topo do README) tornaria a leitura imediata ainda mais intuitiva.
4. **Links de deploy pendentes no README:** na seção *Aplicação online* do `README.md`, os endereços de produção ainda exibem o marcador `_preencher após o deploy_ — https://<projeto>.vercel.app`. Atualizá-los com as URLs finais conclui a documentação de entrega.

---

## 4. Configuração do Ambiente Seguindo o README

### 4.1 Pontos Positivos
- O `README.md` oferece um fluxo de execução extremamente acessível: basta ter o Docker Desktop e executar `docker compose up --build` para levantar aplicação, banco H2 persistente em volume e servidor Mailpit (`http://localhost:8025`), sem exigir instalação local de Java, Maven ou Node.
- Traz tabela completa de usuários pré-cadastrados (professores, alunos e empresas), roteiro objetivo de demonstração, comandos para rodar as suítes de teste em contêiner (`testes` e `testes-front`), alternativa sem Docker e guia passo a passo de implantação em nuvem (Render + Vercel + Mailtrap).

### 4.2 Pontos de Atenção Observados na Configuração
1. **Tempo de build do contêiner no Render:** o `Dockerfile` da raiz executa 3 etapas (Node/Vite → Maven/JDK → JRE), empacotando o front-end dentro do JAR mesmo quando o deploy em nuvem serve o front-end separadamente na Vercel. Como o próprio README observa, isso eleva o primeiro deploy no Render para cerca de 10 minutos. Criar um estágio/target específico para API no `Dockerfile` reduziria o tempo de build na nuvem.
2. **URL de destino fixa no `frontend/vercel.json`:** o rewrite de `/api/:path*` aponta diretamente para `https://token-moeda-estudantil.onrender.com/api/:path*`. Caso outro colaborador ou avaliador faça deploy em sua própria conta do Render com outro nome de serviço, será necessário ajustar manualmente esse arquivo antes do deploy na Vercel (cenário já sinalizado no passo 2.1 do README).
3. **Perfil local sem Docker e SMTP:** a execução manual (`mvn spring-boot:run` + `npm run dev`) depende da instalação local de Java 21, Maven e Node 22; o README já alerta de forma transparente que, sem servidor SMTP local, os erros de e-mail ficam apenas no log sem interromper as operações.

---

## 5. Análise dos Diagramas Desenvolvidos (UML e ER)

Os diagramas da **Release 2** (PlantUML: Visão Geral de Interação, `SD01`–`SD09` e Diagrama de Implantação) apresentam ótima clareza visual, organização por camadas MVC e excelente nível de detalhamento. Já nos diagramas da **Release 1** (draw.io), observam-se algumas inconsistências de notação e oportunidades de atualização para refletir a versão madura do sistema:

### 5.1 Diagrama de Casos de Uso (`Diagrama_Casos_de_Uso.drawio.pdf`)
- **Atualização de escopo da Release 2:** funcionalidades adicionadas posteriormente — como *Conferir e utilizar cupom* (Empresa), *Gerenciar o próprio cadastro* (Aluno e Empresa) e *Editar/excluir vantagem* (Empresa) — já estão implementadas e documentadas em `SD08`/`SD09`, podendo ser incorporadas ao Diagrama de Casos de Uso.
- **Modelagem de notificações:** o caso `Receber notificações` não possui ator associado diretamente e aparece ligado por `<<include>>` a partir de `Distribuir moedas aos alunos` e `Resgatar vantagens`. Como o disparo de e-mail é uma reação automática do sistema, vinculá-lo a um ator secundário (*Serviço de E-mail*) ou tratá-lo como etapa interna deixaria a semântica UML mais precisa.
- **Notação de associação e nomenclatura:** a ligação `Usuario → Realizar login` utiliza ponta de seta direcional (em UML, associações ator–caso de uso usam linha simples) e o ator `EmpresasParceiras` está no plural e sem espaço (preferencialmente `Empresa Parceira`, no singular).

### 5.2 Diagrama de Classes (`DiagramaDeClassesTOKEN.png`)
- **Associação entre `Empresa` e `Instituição`:** há uma seta ligando `Empresa` a `Instituição`, embora no domínio do problema empresas parceiras sejam independentes das instituições de ensino.
- **Atributo duplicado em `Aluno`:** a classe `Aluno` declara `- email: String`, atributo já herdado de `Usuario` (`# email: String`).
- **Nomenclatura de periodicidade em `Professor`:** o atributo `- VALORMENSAL: int = 1000` indica periodicidade mensal, enquanto o requisito e o próprio método `+ receberMoedasSemestrais(): void` operam semestralmente (sugestão: `VALOR_SEMESTRAL`).
- **Visibilidade e alocação de responsabilidades em `Aluno`:** os métodos `- resgatarVantagem(): void` e `- enviarEmail(): void` estão marcados como privados (`-`), e o envio de e-mail aparece na entidade `Aluno`, embora na arquitetura implementada essa responsabilidade pertença corretamente ao `NotificacaoEmailService`.
- **Tipagem e atributos faltantes em `Instituição`:** a lista de alunos é tipada como `LinkedList<Alunos>` (plural, quando a classe se chama `Aluno`) e a classe não apresenta o atributo `nome: String`.
- **Multiplicidades incompletas:** na associação de `ResgateVantagem` para `Aluno` o rótulo aparece cortado (`0...`), e a classe `Transacao` não exibe multiplicidades nas extremidades que a ligam a `Aluno` e `Professor`.

### 5.3 Modelo Entidade-Relacionamento (`DiagramaER_TOKEN.png`)
- **Tabela `Instituição`:** contém `FK IdEmpresa: int` (sem correspondência no domínio nem no esquema JPA) e não apresenta a coluna `Nome`.
- **Tabela associativa `InstituicaoAlunoProfessor`:** modela uma relação ternária contendo `Curso`, `ProfessorId`, `AlunoId` e `InstituicaoId` que não existe no banco implementado e redunda com a coluna `InstituicaoId` presente simultaneamente em `UsuarioPessoa`, `Aluno` e `Professor`.
- **Marcação indevida de chave estrangeira:** em `UsuarioPessoa`, a coluna `Historico: String` aparece marcada como `FK`, apesar de ser um campo textual.
- **Padronização de tipos SQL:** há mistura entre tipos de linguagem (`String`, `DateTime`, `byte[]`) e tipos SQL (`Varchar(14)`).

### 5.4 Diagrama de Componentes (`DiagramaDeComponentesTOKEN.png`)
- **Camada de controle omitida:** os componentes da View apontam diretamente para os Services (`AutenticacaoService`, `TransacaoMoedaService`, `VantagemResgateService`), sem representar a camada de Controllers REST e o `AutenticacaoInterceptor`.
- **Granularidade e comunicação assíncrona:** `VantagemService` e `EmpresaService` não figuram de forma explícita, e a ligação com `NotificacaoEmailService` é representada como chamada direta (com leve sobreposição dos rótulos *"Notifica Recebimento"* e *"Envia Cupom"* sobre as bordas), sem indicar o padrão de eventos assíncronos implementado.

### 5.5 Diagramas da Release 2 (`VisaoGeralInteracao`, `SD01`–`SD09` e `DiagramaImplantacao`)
- **Qualidade geral elevada:** todos os fluxos de negócio estão cobertos com participantes reais das camadas MVC e alternativas de erro bem descritas.
- **Pequenos refinamentos sugeridos:**
  - No `DiagramaImplantacao.puml`, os nós `GitHub` e `Servidor SMTP externo` utilizam o estereótipo `<<device>>`; estereótipos como `<<externalSystem>>` ou `<<artifact>>` refletiriam melhor serviços SaaS gerenciados.
  - Em `SD05` e `SD07`, as chamadas iniciais de leitura (`GET /api/alunos`, `GET /api/professores/me`, `GET /api/vantagens`) são direcionadas ao controller principal do fluxo acompanhadas de nota explicativa; incluir as lifelines correspondentes tornaria o rastreamento de mensagens ainda mais exato.

---

## 6. Alinhamento entre Projeto (Modelos) e Implementação (Código)

Os diagramas da **Release 2** estão altamente sincronizados com o código atual. As principais divergências concentram-se entre os **diagramas da Release 1** (que não passaram por uma versão v2 após a evolução do código) e a implementação JPA/Spring Boot:

| Aspecto | Modelagem (Release 1) | Implementação Atual (`token/`) | Recomendação de Alinhamento |
| :--- | :--- | :--- | :--- |
| **Crédito semestral do professor** | `Professor.VALORMENSAL = 1000`; sem controle de último semestre. | `VALORMENSAL_PADRAO` / `valorMensal` mantidos no código, acrescidos de `ultimoSemestreCreditado` e classe auxiliar `Semestre`. | Renomear conceitualmente para `valorSemestral` e adicionar `ultimoSemestreCreditado` e `Semestre` aos diagramas de Classes e ER. |
| **Histórico / Extrato** | `UsuarioPessoa.historico: String` (marcado como `FK` no ER). | Coluna `HISTORICO` existe na entidade, mas permanece sempre vazia (`""`); o extrato é montado dinamicamente por `TransacaoMoedaService` via `TransacaoRepository` e `ResgateVantagemRepository`. | Remover o atributo obsoleto `historico` (e os métodos `consultarExtrato`/`consultaHistorico` não utilizados pela API) ou refletir nos diagramas que o extrato é derivado das transações e resgates. |
| **Ciclo de vida do cupom** | `ResgateVantagem` sem estado de utilização; `Empresa.conferirCupom` retorna `boolean`. | `ResgateVantagem` adiciona `utilizado`, `dataUtilizacao` e `registrarUtilizacao()`, suportando conferência e baixa única do cupom (`SD08`). | Incluir `utilizado`, `dataUtilizacao` e `registrarUtilizacao()` nos diagramas de Classes e ER. |
| **Concorrência e mídia** | Ausência de controle de versão e de `Content-Type` da foto (`Foto: Image`). | `@Version versao` em `Usuario` e `Vantagem`; foto armazenada como `byte[]` + `fotoTipo`. | Documentar `versao` e `fotoTipo` (e o tipo `byte[]`) no Diagrama de Classes e no ER. |
| **Instituição e relações** | `Instituicao` sem `nome`, com `FK IdEmpresa` e tabela `InstituicaoAlunoProfessor`. | `Instituicao` possui `id`, `nome` e `cnpj`, relacionando-se diretamente com `Aluno` e `Professor` via `UsuarioPessoa.instituicao`. | Atualizar Classes e ER removendo `IdEmpresa` e `InstituicaoAlunoProfessor` e adicionando `nome` e `cnpj`. |
| **Envio de e-mails** | Método `enviarEmail()` em `Aluno` (Classes) e chamada direta a `NotificacaoEmailService` (Componentes). | Eventos de domínio (`MoedasEnviadasEvent`, `VantagemResgatadaEvent`) publicados via `ApplicationEventPublisher` e consumidos assincronamente por `NotificacaoEmailService`. | Remover `enviarEmail()` de `Aluno` no Diagrama de Classes e representar o barramento de eventos no Diagrama de Componentes. |

---

## 7. Três Propostas de Refatoração Segundo os Padrões GRASP

As três refatorações abaixo foram aplicadas sobre o código-fonte do projeto e validadas com a suíte automatizada existente (**Maven / JUnit 5 + MockMvc — 13/13 testes aprovados sem falhas: `AppTest` (4), `ModeloTest` (7) e `SpaFallbackTest` (2), preservando integralmente os contratos da API**).

---

### Refatoração 1 — Extração de Estratégias Polimórficas de Extrato (`TransacaoMoedaService`)

- **Padrões GRASP aplicados:** **Polymorphism**, **Protected Variations** e **Low Coupling**
- **Arquivos envolvidos:** `service/TransacaoMoedaService.java` (refatorado) e novo pacote `service/extrato/` (`GeradorExtratoStrategy.java`, `ExtratoProfessorStrategy.java`, `ExtratoAlunoStrategy.java`).
- **Contexto e justificativa:** No método `TransacaoMoedaService.gerarExtrato(UsuarioLogado)`, a lógica de montagem do extrato varia de acordo com `usuario.tipo()` por meio de uma cadeia `if (PROFESSOR) ... else if (ALUNO) ... else throw`. Isso acopla `TransacaoMoedaService` simultaneamente a `ProfessorService`, `AlunoService`, `TransacaoRepository`, `ResgateVantagemRepository` e ao enum `ETipoUsuario`. Ao aplicar **Polymorphism** e **Protected Variations**, cada perfil passa a encapsular sua própria estratégia de geração de extrato; `TransacaoMoedaService` deixa de depender de `ResgateVantagemRepository` e de estruturas condicionais por tipo, ficando aberto à extensão (por exemplo, para futuros extratos administrativos ou registros de crédito semestral) sem necessidade de modificação.

#### Código ANTES (`TransacaoMoedaService.java`)

```java
@Service
public class TransacaoMoedaService {

    private final TransacaoRepository transacaoRepository;
    private final ResgateVantagemRepository resgateRepository;
    private final ProfessorService professorService;
    private final AlunoService alunoService;
    private final ApplicationEventPublisher eventos;
    // ...

    @Transactional(readOnly = true)
    public ExtratoDTO gerarExtrato(UsuarioLogado usuario) {
        List<ItemExtratoDTO> itens = new ArrayList<>();
        int saldo;

        if (usuario.tipo() == ETipoUsuario.PROFESSOR) {
            Professor professor = professorService.buscarPorId(usuario.id());
            saldo = professor.getSaldo();
            transacaoRepository.findByProfessorIdOrderByDataHoraDesc(professor.getId()).forEach(t ->
                    itens.add(new ItemExtratoDTO("ENVIO", -t.getValor(), t.getDescricaoMotivo(),
                            t.getAluno().getNome(), t.getDataHora(), null)));
        } else if (usuario.tipo() == ETipoUsuario.ALUNO) {
            Aluno aluno = alunoService.buscarPorId(usuario.id());
            saldo = aluno.getSaldo();
            transacaoRepository.findByAlunoIdOrderByDataHoraDesc(aluno.getId()).forEach(t ->
                    itens.add(new ItemExtratoDTO("RECEBIMENTO", t.getValor(), t.getDescricaoMotivo(),
                            t.getProfessor().getNome(), t.getDataHora(), null)));
            resgateRepository.findByAlunoIdOrderByDataHoraDesc(aluno.getId()).forEach(r ->
                    itens.add(new ItemExtratoDTO("RESGATE", -r.getValor(), r.getDescricaoMotivo(),
                            r.getVantagem().getEmpresa().getNome(), r.getDataHora(), r.getCodigoCupom())));
        } else {
            throw new AcessoNegadoException("Extrato disponível apenas para alunos e professores.");
        }

        itens.sort(Comparator.comparing(ItemExtratoDTO::dataHora).reversed());
        return new ExtratoDTO(saldo, itens);
    }
}
```

#### Código DEPOIS (`GeradorExtratoStrategy.java`, `ExtratoProfessorStrategy.java`, `ExtratoAlunoStrategy.java` e `TransacaoMoedaService.java`)

```java
// service/extrato/GeradorExtratoStrategy.java
public interface GeradorExtratoStrategy {
    ETipoUsuario perfilSuportado();
    ExtratoDTO gerar(Long usuarioId);
}

// service/extrato/ExtratoProfessorStrategy.java
@Component
public class ExtratoProfessorStrategy implements GeradorExtratoStrategy {
    private final ProfessorService professorService;
    private final TransacaoRepository transacaoRepository;

    public ExtratoProfessorStrategy(ProfessorService professorService,
                                    TransacaoRepository transacaoRepository) {
        this.professorService = professorService;
        this.transacaoRepository = transacaoRepository;
    }

    @Override
    public ETipoUsuario perfilSuportado() {
        return ETipoUsuario.PROFESSOR;
    }

    @Override
    public ExtratoDTO gerar(Long usuarioId) {
        Professor professor = professorService.buscarPorId(usuarioId);
        List<ItemExtratoDTO> itens = transacaoRepository
                .findByProfessorIdOrderByDataHoraDesc(professor.getId()).stream()
                .map(t -> new ItemExtratoDTO("ENVIO", -t.getValor(), t.getDescricaoMotivo(),
                        t.getAluno().getNome(), t.getDataHora(), null))
                .sorted(Comparator.comparing(ItemExtratoDTO::dataHora).reversed())
                .toList();
        return new ExtratoDTO(professor.getSaldo(), itens);
    }
}

// service/extrato/ExtratoAlunoStrategy.java
@Component
public class ExtratoAlunoStrategy implements GeradorExtratoStrategy {
    private final AlunoService alunoService;
    private final TransacaoRepository transacaoRepository;
    private final ResgateVantagemRepository resgateRepository;

    public ExtratoAlunoStrategy(AlunoService alunoService,
                                TransacaoRepository transacaoRepository,
                                ResgateVantagemRepository resgateRepository) {
        this.alunoService = alunoService;
        this.transacaoRepository = transacaoRepository;
        this.resgateRepository = resgateRepository;
    }

    @Override
    public ETipoUsuario perfilSuportado() {
        return ETipoUsuario.ALUNO;
    }

    @Override
    public ExtratoDTO gerar(Long usuarioId) {
        Aluno aluno = alunoService.buscarPorId(usuarioId);
        List<ItemExtratoDTO> itens = new ArrayList<>();
        transacaoRepository.findByAlunoIdOrderByDataHoraDesc(aluno.getId()).forEach(t ->
                itens.add(new ItemExtratoDTO("RECEBIMENTO", t.getValor(), t.getDescricaoMotivo(),
                        t.getProfessor().getNome(), t.getDataHora(), null)));
        resgateRepository.findByAlunoIdOrderByDataHoraDesc(aluno.getId()).forEach(r ->
                itens.add(new ItemExtratoDTO("RESGATE", -r.getValor(), r.getDescricaoMotivo(),
                        r.getVantagem().getEmpresa().getNome(), r.getDataHora(), r.getCodigoCupom())));
        itens.sort(Comparator.comparing(ItemExtratoDTO::dataHora).reversed());
        return new ExtratoDTO(aluno.getSaldo(), itens);
    }
}

// service/TransacaoMoedaService.java (trecho refatorado)
@Service
public class TransacaoMoedaService {
    private final TransacaoRepository transacaoRepository;
    private final ProfessorService professorService;
    private final AlunoService alunoService;
    private final ApplicationEventPublisher eventos;
    private final Map<ETipoUsuario, GeradorExtratoStrategy> estrategiasExtrato;

    public TransacaoMoedaService(TransacaoRepository transacaoRepository,
                                 ProfessorService professorService,
                                 AlunoService alunoService,
                                 ApplicationEventPublisher eventos,
                                 List<GeradorExtratoStrategy> estrategias) {
        this.transacaoRepository = transacaoRepository;
        this.professorService = professorService;
        this.alunoService = alunoService;
        this.eventos = eventos;
        this.estrategiasExtrato = estrategias.stream()
                .collect(Collectors.toMap(GeradorExtratoStrategy::perfilSuportado, Function.identity()));
    }

    @Transactional(readOnly = true)
    public ExtratoDTO gerarExtrato(UsuarioLogado usuario) {
        GeradorExtratoStrategy estrategia = estrategiasExtrato.get(usuario.tipo());
        if (estrategia == null) {
            throw new AcessoNegadoException("Extrato disponível apenas para alunos e professores.");
        }
        return estrategia.gerar(usuario.id());
    }
}
```

---

### Refatoração 2 — Extração do Gerador/Normalizador de Cupom e Consulta Direta por Empresa (`VantagemResgateService`)

- **Padrões GRASP aplicados:** **Pure Fabrication**, **High Cohesion** e **Low Coupling**
- **Arquivos envolvidos:** `service/GeradorCodigoCupom.java` (novo), `repository/ResgateVantagemRepository.java` (nova consulta derivada) e `service/VantagemResgateService.java` (refatorado).
- **Contexto e justificativa:** `VantagemResgateService` acumulava duas naturezas distintas de responsabilidade: (i) a orquestração transacional do fluxo de resgate e conferência de vantagens, e (ii) os detalhes técnicos de geração aleatória de códigos (`ALFABETO_CUPOM`, `SecureRandom`, formatação `TKN-XXXX-XXXX` e normalização de strings). Além disso, o método `conferirCupom` buscava a entidade `Empresa` via `EmpresaService`, percorria em memória todas as vantagens e resgates da empresa (`empresa.conferirCupom(normalizado)`) e, em seguida, realizava nova consulta ao repositório (`findByCodigoCupom`). Ao extrair `GeradorCodigoCupom` (**Pure Fabrication**) e usar `findByCodigoCupomAndVantagemEmpresaId`, aumenta-se a coesão, elimina-se a dependência de `EmpresaService` em `VantagemResgateService` (**Low Coupling**), facilita-se a substituição do formato do cupom em testes/evoluções e evita-se carregamento desnecessário de coleções JPA em memória.

#### Código ANTES (`VantagemResgateService.java`)

```java
@Service
public class VantagemResgateService {

    private static final String ALFABETO_CUPOM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ResgateVantagemRepository resgateRepository;
    private final AlunoService alunoService;
    private final VantagemService vantagemService;
    private final EmpresaService empresaService;
    private final ApplicationEventPublisher eventos;
    // ...

    @Transactional
    public ResgateVantagem resgatar(Long alunoId, Long vantagemId) {
        Aluno aluno = alunoService.buscarPorId(alunoId);
        Vantagem vantagem = vantagemService.buscarPorId(vantagemId);

        ResgateVantagem resgate = aluno.resgatarVantagem(vantagem, gerarCodigoCupomUnico());
        resgateRepository.save(resgate);
        // ... publicação de VantagemResgatadaEvent
        return resgate;
    }

    @Transactional(readOnly = true)
    public ResgateVantagem conferirCupom(Long empresaId, String codigo) {
        String normalizado = normalizar(codigo);
        Empresa empresa = empresaService.buscarPorId(empresaId);
        if (!empresa.conferirCupom(normalizado)) {
            throw new RecursoNaoEncontradoException(
                    "Cupom " + normalizado + " não encontrado entre os resgates da sua empresa.");
        }
        return resgateRepository.findByCodigoCupom(normalizado)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cupom não encontrado: " + normalizado));
    }

    private String gerarCodigoCupomUnico() {
        String codigo;
        do {
            StringBuilder sb = new StringBuilder("TKN-");
            for (int i = 0; i < 8; i++) {
                if (i == 4) sb.append('-');
                sb.append(ALFABETO_CUPOM.charAt(RANDOM.nextInt(ALFABETO_CUPOM.length())));
            }
            codigo = sb.toString();
        } while (resgateRepository.existsByCodigoCupom(codigo));
        return codigo;
    }

    private static String normalizar(String codigo) {
        return codigo == null ? "" : codigo.trim().toUpperCase(Locale.ROOT);
    }
}
```

#### Código DEPOIS (`GeradorCodigoCupom.java`, `ResgateVantagemRepository.java` e `VantagemResgateService.java`)

```java
// service/GeradorCodigoCupom.java
@Component
public class GeradorCodigoCupom {

    private static final String ALFABETO_CUPOM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
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
            if (i == 4) sb.append('-');
            sb.append(ALFABETO_CUPOM.charAt(RANDOM.nextInt(ALFABETO_CUPOM.length())));
        }
        return sb.toString();
    }
}

// repository/ResgateVantagemRepository.java (método adicionado)
Optional<ResgateVantagem> findByCodigoCupomAndVantagemEmpresaId(String codigoCupom, Long empresaId);

// service/VantagemResgateService.java (trecho refatorado)
@Service
public class VantagemResgateService {

    private final ResgateVantagemRepository resgateRepository;
    private final AlunoService alunoService;
    private final VantagemService vantagemService;
    private final GeradorCodigoCupom geradorCodigoCupom;
    private final ApplicationEventPublisher eventos;
    // ...

    @Transactional
    public ResgateVantagem resgatar(Long alunoId, Long vantagemId) {
        Aluno aluno = alunoService.buscarPorId(alunoId);
        Vantagem vantagem = vantagemService.buscarPorId(vantagemId);

        ResgateVantagem resgate = aluno.resgatarVantagem(vantagem, geradorCodigoCupom.gerarUnico());
        resgateRepository.save(resgate);
        // ... publicação de VantagemResgatadaEvent
        return resgate;
    }

    @Transactional(readOnly = true)
    public ResgateVantagem conferirCupom(Long empresaId, String codigo) {
        String normalizado = geradorCodigoCupom.normalizar(codigo);
        return resgateRepository.findByCodigoCupomAndVantagemEmpresaId(normalizado, empresaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Cupom " + normalizado + " não encontrado entre os resgates da sua empresa."));
    }
}
```

---

### Refatoração 3 — Centralização de Validação de Credenciais e Atualização Coesa nas Entidades (`AlunoService`, `EmpresaService`, `Usuario`, `Aluno`, `Empresa`)

- **Padrões GRASP aplicados:** **Information Expert**, **Pure Fabrication** e **Low Coupling**
- **Arquivos envolvidos:** `service/ValidadorCredenciaisUsuario.java` (novo), `model/Usuario.java`, `model/Aluno.java`, `model/Empresa.java`, `service/AlunoService.java` e `service/EmpresaService.java`.
- **Contexto e justificativa:** Observou-se duplicação integral das validações de senha obrigatória e unicidade de `login` e `email` nos métodos `criar` e `atualizar` de `AlunoService` e `EmpresaService`, acoplando ambos diretamente a `UsuarioRepository`. Além disso, a atualização dos atributos de `Aluno` e `Empresa` era feita de forma procedimental nos serviços por meio de longas sequências de *setters*, incluindo a verificação condicional de alteração de senha. A criação de `ValidadorCredenciaisUsuario` (**Pure Fabrication** + **Low Coupling**) elimina a duplicação e retira `UsuarioRepository` de ambos os serviços; simultaneamente, os métodos `Usuario.atualizarDadosAcesso`, `Aluno.atualizarCadastro` e `Empresa.atualizarCadastro` atribuem à própria entidade a responsabilidade de manter a integridade do seu estado (**Information Expert**).

#### Código ANTES (`AlunoService.java` — padrão equivalente repetido em `EmpresaService.java`)

```java
@Transactional
public Aluno atualizar(Long id, AlunoRequestDTO dto) {
    Aluno existente = buscarPorId(id);
    String login = dto.getLogin().trim();
    String email = dto.getEmail().trim().toLowerCase();
    String cpf = Documentos.formatarCpf(dto.getCpf());

    if (!existente.getLogin().equals(login) && usuarioRepository.existsByLogin(login)) {
        throw new RegraNegocioException("Já existe outro usuário com o login: " + login);
    }
    if (!existente.getEmail().equalsIgnoreCase(email) && usuarioRepository.existsByEmail(email)) {
        throw new RegraNegocioException("Já existe outro usuário com o e-mail: " + email);
    }
    if (!existente.getCpf().equals(cpf) && usuarioRepository.existsPessoaByCpf(cpf)) {
        throw new RegraNegocioException("Já existe outra pessoa com o CPF: " + cpf);
    }

    existente.setNome(dto.getNome().trim());
    existente.setEmail(email);
    existente.setLogin(login);
    if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
        existente.alterarSenha(dto.getSenha());
    }
    existente.setCpf(cpf);
    existente.setRg(dto.getRg().trim());
    existente.setEndereco(dto.getEndereco().trim());
    existente.setInstituicao(instituicaoService.buscarPorId(dto.getInstituicaoId()));
    existente.setCurso(dto.getCurso());
    existente.setMatricula(dto.getMatricula());

    return alunoRepository.save(existente);
}
```

#### Código DEPOIS (`ValidadorCredenciaisUsuario.java`, `Usuario.java`, `Aluno.java`, `Empresa.java`, `AlunoService.java` e `EmpresaService.java`)

```java
// service/ValidadorCredenciaisUsuario.java
@Component
public class ValidadorCredenciaisUsuario {
    private final UsuarioRepository usuarioRepository;

    public ValidadorCredenciaisUsuario(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void validarSenhaObrigatoria(String senha) {
        if (senha == null || senha.isBlank()) {
            throw new RegraNegocioException("A senha é obrigatória no cadastro.");
        }
    }

    public void validarUnicidadeCadastro(String login, String email) {
        if (usuarioRepository.existsByLogin(login)) {
            throw new RegraNegocioException("Já existe um usuário cadastrado com o login: " + login);
        }
        if (usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException("Já existe um usuário cadastrado com o e-mail: " + email);
        }
    }

    public void validarUnicidadeAtualizacao(Usuario existente, String login, String email) {
        if (!existente.getLogin().equals(login) && usuarioRepository.existsByLogin(login)) {
            throw new RegraNegocioException("Já existe outro usuário com o login: " + login);
        }
        if (!existente.getEmail().equalsIgnoreCase(email) && usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException("Já existe outro usuário com o e-mail: " + email);
        }
    }

    public void validarCpfCadastro(String cpf) {
        if (usuarioRepository.existsPessoaByCpf(cpf)) {
            throw new RegraNegocioException("Já existe uma pessoa cadastrada com o CPF: " + cpf);
        }
    }

    public void validarCpfAtualizacao(String cpfAtual, String novoCpf) {
        if (!cpfAtual.equals(novoCpf) && usuarioRepository.existsPessoaByCpf(novoCpf)) {
            throw new RegraNegocioException("Já existe outra pessoa com o CPF: " + novoCpf);
        }
    }
}

// model/Usuario.java (Information Expert)
public void atualizarDadosAcesso(String nome, String login, String email, String novaSenha) {
    this.nome = nome;
    this.login = login;
    this.email = email;
    if (novaSenha != null && !novaSenha.isBlank()) {
        alterarSenha(novaSenha);
    }
}

// model/Aluno.java (Information Expert)
public void atualizarCadastro(String nome, String login, String email, String novaSenha,
                              String cpf, String rg, String endereco,
                              Instituicao instituicao, ECurso curso, Integer matricula) {
    atualizarDadosAcesso(nome, login, email, novaSenha);
    this.cpf = cpf;
    this.rg = rg;
    this.endereco = endereco;
    this.instituicao = instituicao;
    this.curso = curso;
    this.matricula = matricula;
}

// model/Empresa.java (Information Expert)
public void atualizarCadastro(String nome, String login, String email, String novaSenha,
                              String cnpj, String descricao) {
    atualizarDadosAcesso(nome, login, email, novaSenha);
    this.cnpj = cnpj;
    this.descricao = descricao;
}

// service/AlunoService.java (trecho refatorado — EmpresaService segue a mesma simplificação)
@Transactional
public Aluno atualizar(Long id, AlunoRequestDTO dto) {
    Aluno existente = buscarPorId(id);
    String login = dto.getLogin().trim();
    String email = dto.getEmail().trim().toLowerCase();
    String cpf = Documentos.formatarCpf(dto.getCpf());

    validadorCredenciais.validarUnicidadeAtualizacao(existente, login, email);
    validadorCredenciais.validarCpfAtualizacao(existente.getCpf(), cpf);

    Instituicao instituicao = instituicaoService.buscarPorId(dto.getInstituicaoId());
    existente.atualizarCadastro(
            dto.getNome().trim(), login, email, dto.getSenha(),
            cpf, dto.getRg().trim(), dto.getEndereco().trim(),
            instituicao, dto.getCurso(), dto.getMatricula());

    return alunoRepository.save(existente);
}
```

---

## 8. Conclusão

O projeto **TOKEN** apresenta uma base técnica sólida, bem testada e aderente aos requisitos do Sistema de Moeda Estudantil. As sugestões reunidas neste relatório — sincronização dos diagramas da Release 1 com as evoluções implementadas na Release 2, higienização de arquivos gerados no repositório e aplicação das três refatorações **GRASP** (*Polymorphism / Protected Variations*, *Pure Fabrication / High Cohesion* e *Information Expert / Low Coupling*) — buscam contribuir de forma construtiva para a clareza arquitetural, a manutenção contínua e a rastreabilidade entre modelagem e código.
