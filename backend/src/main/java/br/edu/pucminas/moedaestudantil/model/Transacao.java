package br.edu.pucminas.moedaestudantil.model;

import br.edu.pucminas.moedaestudantil.model.enums.TipoTransacao;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "transacoes")
public class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora = LocalDateTime.now();

    @Column(name = "valor_moedas", nullable = false)
    private Integer valorMoedas;

    @Column(length = 500)
    private String motivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoTransacao tipo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "professor_id")
    private Professor professor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vantagem_id")
    private Vantagem vantagem;

    public Transacao() {
    }

    public Transacao(Integer valorMoedas, String motivo, TipoTransacao tipo, Professor professor, Aluno aluno, Vantagem vantagem) {
        this.dataHora = LocalDateTime.now();
        this.valorMoedas = valorMoedas;
        this.motivo = motivo;
        this.tipo = tipo;
        this.professor = professor;
        this.aluno = aluno;
        this.vantagem = vantagem;
    }

    public Transacao(Long id, LocalDateTime dataHora, Integer valorMoedas, String motivo, TipoTransacao tipo, Professor professor, Aluno aluno, Vantagem vantagem) {
        this.id = id;
        this.dataHora = dataHora != null ? dataHora : LocalDateTime.now();
        this.valorMoedas = valorMoedas;
        this.motivo = motivo;
        this.tipo = tipo;
        this.professor = professor;
        this.aluno = aluno;
        this.vantagem = vantagem;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public Integer getValorMoedas() {
        return valorMoedas;
    }

    public void setValorMoedas(Integer valorMoedas) {
        this.valorMoedas = valorMoedas;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public TipoTransacao getTipo() {
        return tipo;
    }

    public void setTipo(TipoTransacao tipo) {
        this.tipo = tipo;
    }

    public Professor getProfessor() {
        return professor;
    }

    public void setProfessor(Professor professor) {
        this.professor = professor;
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
}
