package com.locvac.service;

import com.locvac.dto.carrosselItem.CarrosselItemRequestDTO;
import com.locvac.dto.carrosselItem.CarrosselItemResponseDTO;

import java.util.List;

public interface CarrosselItemService {

    CarrosselItemResponseDTO create(CarrosselItemRequestDTO dto);

    CarrosselItemResponseDTO update(Long id, CarrosselItemRequestDTO dto);

    void delete(Long id);

    CarrosselItemResponseDTO findById(Long id);

    List<CarrosselItemResponseDTO> findAll();

    List<CarrosselItemResponseDTO> findAtivos();
}
