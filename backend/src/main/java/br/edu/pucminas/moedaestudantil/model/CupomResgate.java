package br.edu.pucminas.moedaestudantil.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "cupons_resgate")
public class CupomResgate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_gerado", nullable = false, unique = true, length = 60)
    private String codigoGerado;

    @Column(name = "data_geracao", nullable = false)
    private LocalDateTime dataGeracao = LocalDateTime.now();

    @Column(nullable = false)
    private Boolean utilizado = false;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "vantagem_id", nullable = false)
    private Vantagem vantagem;

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "transacao_id", nullable = false, unique = true)
    private Transacao transacao;

    public CupomResgate() {
    }

    public CupomResgate(String codigoGerado, Aluno aluno, Vantagem vantagem, Transacao transacao) {
        this.codigoGerado = codigoGerado;
        this.dataGeracao = LocalDateTime.now();
        this.utilizado = false;
        this.aluno = aluno;
        this.vantagem = vantagem;
        this.transacao = transacao;
    }

    public CupomResgate(Long id, String codigoGerado, LocalDateTime dataGeracao, Boolean utilizado, Aluno aluno, Vantagem vantagem, Transacao transacao) {
        this.id = id;
        this.codigoGerado = codigoGerado;
        this.dataGeracao = dataGeracao != null ? dataGeracao : LocalDateTime.now();
        this.utilizado = utilizado != null ? utilizado : false;
        this.aluno = aluno;
        this.vantagem = vantagem;
        this.transacao = transacao;
    }

    public static String gerarCodigoUnico() {
        return "MOEDA-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigoGerado() {
        return codigoGerado;
    }

    public void setCodigoGerado(String codigoGerado) {
        this.codigoGerado = codigoGerado;
    }

    public LocalDateTime getDataGeracao() {
        return dataGeracao;
    }

    public void setDataGeracao(LocalDateTime dataGeracao) {
        this.dataGeracao = dataGeracao;
    }

    public Boolean getUtilizado() {
        return utilizado;
    }

    public void setUtilizado(Boolean utilizado) {
        this.utilizado = utilizado;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public Vantagem getVantagem() {
        return vantagem;
    }

    public void setVantagem(Vantagem vantagem) {
        this.vantagem = vantagem;
    }

    public Transacao getTransacao() {
        return transacao;
    }

    public void setTransacao(Transacao transacao) {
        this.transacao = transacao;
    }
}
