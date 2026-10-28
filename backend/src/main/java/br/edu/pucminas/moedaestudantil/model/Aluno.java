package br.edu.pucminas.moedaestudantil.model;

import br.edu.pucminas.moedaestudantil.model.enums.TipoPerfil;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "alunos")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Aluno extends Usuario {

    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    @Column(nullable = false, length = 20)
    private String rg;

    @Column(nullable = false, length = 255)
    private String endereco;

    @Column(nullable = false, length = 120)
    private String curso;

    @Column(name = "saldo_moedas", nullable = false)
    private Integer saldoMoedas = 0;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "instituicao_id", nullable = false)
    private InstituicaoEnsino instituicaoEnsino;

    public Aluno() {
        setTipoPerfil(TipoPerfil.ALUNO);
        this.saldoMoedas = 0;
    }

    public Aluno(
            String nome,
            String email,
            String login,
            String senha,
            String cpf,
            String rg,
            String endereco,
            String curso,
            InstituicaoEnsino instituicaoEnsino) {
        super(nome, email, login, senha, TipoPerfil.ALUNO);
        this.cpf = cpf;
        this.rg = rg;
        this.endereco = endereco;
        this.curso = curso;
        this.saldoMoedas = 0;
        this.instituicaoEnsino = instituicaoEnsino;
    }

    public void adicionarMoedas(Integer valor) {
        if (valor != null && valor > 0) {
            this.saldoMoedas = (this.saldoMoedas == null ? 0 : this.saldoMoedas) + valor;
        }
    }

    public void descontarMoedas(Integer valor) {
        if (valor == null || valor <= 0 || this.saldoMoedas == null || this.saldoMoedas < valor) {
            throw new IllegalArgumentException("Saldo insuficiente para descontar moedas.");
        }
        this.saldoMoedas -= valor;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getRg() {
        return rg;
    }

    public void setRg(String rg) {
        this.rg = rg;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getCurso() {
        return curso;
    }

    public void setCurso(String curso) {
        this.curso = curso;
    }

    public Integer getSaldoMoedas() {
        return saldoMoedas;
    }

    public void setSaldoMoedas(Integer saldoMoedas) {
        this.saldoMoedas = saldoMoedas;
    }

    public InstituicaoEnsino getInstituicaoEnsino() {
        return instituicaoEnsino;
    }

    public void setInstituicaoEnsino(InstituicaoEnsino instituicaoEnsino) {
        this.instituicaoEnsino = instituicaoEnsino;
    }
}
