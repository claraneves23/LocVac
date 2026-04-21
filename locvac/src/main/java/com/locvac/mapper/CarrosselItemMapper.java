package com.locvac.mapper;

import com.locvac.dto.carrosselItem.CarrosselItemRequestDTO;
import com.locvac.dto.carrosselItem.CarrosselItemResponseDTO;
import com.locvac.model.core.CarrosselItem;
import org.springframework.stereotype.Component;

@Component
public class CarrosselItemMapper {

    public CarrosselItem toEntity(CarrosselItemRequestDTO dto) {
        CarrosselItem entity = new CarrosselItem();
        entity.setTitulo(dto.titulo());
        entity.setDescricao(dto.descricao());
        entity.setImagemUrl(dto.imagemUrl());
        entity.setOrdemExibicao(dto.ordemExibicao());
        entity.setAtivo(dto.ativo());
        return entity;
    }

    public CarrosselItemResponseDTO toResponse(CarrosselItem entity) {
        return new CarrosselItemResponseDTO(
                entity.getId(),
                entity.getTitulo(),
                entity.getDescricao(),
                entity.getImagemUrl(),
                entity.getOrdemExibicao(),
                entity.isAtivo()
        );
    }
}
