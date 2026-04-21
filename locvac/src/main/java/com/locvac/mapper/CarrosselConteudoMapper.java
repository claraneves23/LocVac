package com.locvac.mapper;

import com.locvac.dto.carrosselConteudo.CarrosselConteudoRequestDTO;
import com.locvac.dto.carrosselConteudo.CarrosselConteudoResponseDTO;
import com.locvac.model.associacao.CarrosselConteudo;
import org.springframework.stereotype.Component;

@Component
public class CarrosselConteudoMapper {

    public CarrosselConteudo toEntity(CarrosselConteudoRequestDTO dto) {
        CarrosselConteudo entity = new CarrosselConteudo();
        entity.setTituloSecao(dto.tituloSecao());
        entity.setConteudo(dto.conteudo());
        entity.setItens(dto.itens() != null ? dto.itens() : new java.util.ArrayList<>());
        entity.setOrdemExibicao(dto.ordemExibicao());
        return entity;
    }

    public CarrosselConteudoResponseDTO toResponse(CarrosselConteudo entity) {
        return new CarrosselConteudoResponseDTO(
                entity.getId(),
                entity.getCarrosselItem().getId(),
                entity.getTituloSecao(),
                entity.getConteudo(),
                entity.getItens(),
                entity.getOrdemExibicao()
        );
    }
}
