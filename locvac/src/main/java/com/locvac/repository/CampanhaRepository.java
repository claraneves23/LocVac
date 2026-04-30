package com.locvac.repository;

import com.locvac.model.core.Campanha;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;


public interface CampanhaRepository extends JpaRepository<Campanha, Long> {
    boolean existsByDoencaAlvoAndDataInicioLessThanEqualAndDataFimGreaterThanEqual(
            String doencaAlvo,
            LocalDate dataFim,
            LocalDate dataInicio
    );

    List<Campanha> findByAtivaTrueAndDataFimGreaterThanEqual(LocalDate hoje);
}
