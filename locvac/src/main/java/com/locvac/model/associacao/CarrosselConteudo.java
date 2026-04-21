package com.locvac.model.associacao;

import com.locvac.model.core.CarrosselItem;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carrossel_conteudo")
public class CarrosselConteudo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_conteudo")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_item", nullable = false)
    private CarrosselItem carrosselItem;

    @Column(name = "titulo_secao", nullable = false)
    private String tituloSecao;

    @Column(name = "conteudo", columnDefinition = "TEXT")
    private String conteudo;

    @ElementCollection
    @CollectionTable(
            name = "carrossel_conteudo_item",
            joinColumns = @JoinColumn(name = "id_conteudo")
    )
    @OrderColumn(name = "ordem")
    @Column(name = "item", columnDefinition = "TEXT")
    private List<String> itens = new ArrayList<>();

    @Column(name = "ordem_exibicao", nullable = false)
    private Integer ordemExibicao;

    public Long getId() {
        return id;
    }

    public CarrosselItem getCarrosselItem() {
        return carrosselItem;
    }

    public void setCarrosselItem(CarrosselItem carrosselItem) {
        this.carrosselItem = carrosselItem;
    }

    public String getTituloSecao() {
        return tituloSecao;
    }

    public void setTituloSecao(String tituloSecao) {
        this.tituloSecao = tituloSecao;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public List<String> getItens() {
        return itens;
    }

    public void setItens(List<String> itens) {
        this.itens = itens;
    }

    public Integer getOrdemExibicao() {
        return ordemExibicao;
    }

    public void setOrdemExibicao(Integer ordemExibicao) {
        this.ordemExibicao = ordemExibicao;
    }
}
