package com.locvac.model.associacao;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categoria_vacina")
public class CategoriaVacina {
        @Id
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
