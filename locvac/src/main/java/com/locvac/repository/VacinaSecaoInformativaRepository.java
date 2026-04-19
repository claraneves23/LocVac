package com.locvac.repository;

import com.locvac.model.associacao.VacinaSecaoInformativa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VacinaSecaoInformativaRepository extends JpaRepository<VacinaSecaoInformativa, Long> {

    List<VacinaSecaoInformativa> findByInformativoIdOrderByOrdemExibicao(Long idInformativo);
}