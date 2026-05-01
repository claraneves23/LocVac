package com.locvac.repository;

import com.locvac.model.associacao.CalendarioVacinal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarioVacinalRepository extends JpaRepository<CalendarioVacinal, Long> {
}
