package com.locvac.repository;

import com.locvac.model.core.CarrosselItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarrosselItemRepository extends JpaRepository<CarrosselItem, Long> {

    List<CarrosselItem> findByAtivoTrueOrderByOrdemExibicaoAsc();
}
