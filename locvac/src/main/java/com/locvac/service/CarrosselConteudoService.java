package com.locvac.service;

import com.locvac.dto.carrosselConteudo.CarrosselConteudoRequestDTO;
import com.locvac.dto.carrosselConteudo.CarrosselConteudoResponseDTO;

import java.util.List;

public interface CarrosselConteudoService {

    CarrosselConteudoResponseDTO create(CarrosselConteudoRequestDTO dto);

    CarrosselConteudoResponseDTO update(Long id, CarrosselConteudoRequestDTO dto);

    void delete(Long id);

    CarrosselConteudoResponseDTO findById(Long id);

    List<CarrosselConteudoResponseDTO> findByCarrosselItem(Long idCarrosselItem);
}
