package com.locvac.repository;

import com.locvac.model.associacao.VacinaEfeitoColateral;
import com.locvac.model.enums.Severidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VacinaEfeitoColateralRepository extends JpaRepository<VacinaEfeitoColateral, Long> {

    List<VacinaEfeitoColateral> findByVacinaId(Long idVacina);

    List<VacinaEfeitoColateral> findBySeveridade(Severidade severidade);
}