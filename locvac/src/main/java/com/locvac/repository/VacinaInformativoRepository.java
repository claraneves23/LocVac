package com.locvac.repository;

import com.locvac.model.associacao.VacinaInformativo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VacinaInformativoRepository extends JpaRepository<VacinaInformativo, Long> {

    List<VacinaInformativo> findByVacinaIdAndAtivaTrue(Long idVacina);

    Optional<VacinaInformativo> findByVacinaIdAndVersao(Long idVacina, Integer versao);

    List<VacinaInformativo> findByAtivaTrue();
}