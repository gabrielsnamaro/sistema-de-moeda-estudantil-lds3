package br.edu.pucminas.moedaestudantil.model;

import br.edu.pucminas.moedaestudantil.model.enums.TipoPerfil;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "empresas_parceiras")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class EmpresaParceira extends Usuario {

    @Column(nullable = false, unique = true, length = 18)
    private String cnpj;

    @Column(length = 500)
    private String descricao;

    public EmpresaParceira() {
        setTipoPerfil(TipoPerfil.EMPRESA_PARCEIRA);
    }

    public EmpresaParceira(
            String nome,
            String email,
            String login,
            String senha,
            String cnpj,
            String descricao) {
        super(nome, email, login, senha, TipoPerfil.EMPRESA_PARCEIRA);
        this.cnpj = cnpj;
        this.descricao = descricao;
    }

    public Vantagem cadastrarVantagem(String titulo, String descricao, String fotoProduto, Integer custoMoedas) {
        Vantagem vantagem = new Vantagem(titulo, descricao, fotoProduto, custoMoedas, this);
        if (!vantagem.validarCusto()) {
            throw new IllegalArgumentException("O custo da vantagem deve ser maior que zero.");
        }
        return vantagem;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}
