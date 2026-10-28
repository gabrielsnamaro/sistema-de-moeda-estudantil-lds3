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
@Table(name = "professores")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Professor extends Usuario {

    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    @Column(nullable = false, length = 120)
    private String departamento;

    @Column(name = "saldo_moedas", nullable = false)
    private Integer saldoMoedas = 1000;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "instituicao_id", nullable = false)
    private InstituicaoEnsino instituicaoEnsino;

    public Professor() {
        setTipoPerfil(TipoPerfil.PROFESSOR);
        this.saldoMoedas = 1000;
    }

    public Professor(
            String nome,
            String email,
            String login,
            String senha,
            String cpf,
            String departamento,
            InstituicaoEnsino instituicaoEnsino) {
        super(nome, email, login, senha, TipoPerfil.PROFESSOR);
        this.cpf = cpf;
        this.departamento = departamento;
        this.saldoMoedas = 1000;
        this.instituicaoEnsino = instituicaoEnsino;
    }

    public void receberCreditoSemestral() {
        this.saldoMoedas = (this.saldoMoedas == null ? 0 : this.saldoMoedas) + 1000;
    }

    public boolean possuiSaldoSuficiente(Integer valor) {
        return valor != null && valor > 0 && this.saldoMoedas != null && this.saldoMoedas >= valor;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
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
