package br.edu.pucminas.moedaestudantil.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "vantagens")
public class Vantagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String descricao;

    @Column(name = "foto_produto", nullable = false, length = 500)
    private String fotoProduto;

    @Column(name = "custo_moedas", nullable = false)
    private Integer custoMoedas;

    @Column(nullable = false)
    private Boolean ativa = true;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private EmpresaParceira empresaParceira;

    public Vantagem() {
    }

    public Vantagem(String titulo, String descricao, String fotoProduto, Integer custoMoedas, EmpresaParceira empresaParceira) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.fotoProduto = fotoProduto;
        this.custoMoedas = custoMoedas;
        this.ativa = true;
        this.empresaParceira = empresaParceira;
    }

    public Vantagem(Long id, String titulo, String descricao, String fotoProduto, Integer custoMoedas, Boolean ativa, EmpresaParceira empresaParceira) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.fotoProduto = fotoProduto;
        this.custoMoedas = custoMoedas;
        this.ativa = ativa != null ? ativa : true;
        this.empresaParceira = empresaParceira;
    }

    public boolean validarCusto() {
        return this.custoMoedas != null && this.custoMoedas > 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getFotoProduto() {
        return fotoProduto;
    }

    public void setFotoProduto(String fotoProduto) {
        this.fotoProduto = fotoProduto;
    }

    public Integer getCustoMoedas() {
        return custoMoedas;
    }

    public void setCustoMoedas(Integer custoMoedas) {
        this.custoMoedas = custoMoedas;
    }

    public Boolean getAtiva() {
        return ativa;
    }

    public void setAtiva(Boolean ativa) {
        this.ativa = ativa;
    }

    public EmpresaParceira getEmpresaParceira() {
        return empresaParceira;
    }

    public void setEmpresaParceira(EmpresaParceira empresaParceira) {
        this.empresaParceira = empresaParceira;
    }
}
