package com.locvac.model.associacao;

import jakarta.persistence.*;

@Entity
@Table(name = "categoria_vacina")
public class CategoriaVacina {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_categoria")
        private String id;

        @Column(name = "descricao", nullable = false)
        private String descricao;

        public String getDescricao() {
                return descricao;
        }

        public void setDescricao(String descricao) {
                this.descricao = descricao;
        }
}
