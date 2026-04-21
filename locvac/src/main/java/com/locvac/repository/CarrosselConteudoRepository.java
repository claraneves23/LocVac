package com.locvac.repository;

import com.locvac.model.associacao.CarrosselConteudo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarrosselConteudoRepository extends JpaRepository<CarrosselConteudo, Long> {

    List<CarrosselConteudo> findByCarrosselItemIdOrderByOrdemExibicaoAsc(Long idCarrosselItem);
}
