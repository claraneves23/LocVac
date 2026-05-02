package com.locvac.repository;

import com.locvac.model.associacao.AgendaVacinal;
import com.locvac.model.enums.StatusAplicacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AgendaVacinalRepository extends JpaRepository<AgendaVacinal, Long> {

    List<AgendaVacinal> findByStatusNotIn(List<StatusAplicacao> status);

    List<AgendaVacinal> findByPessoaId(Long pessoaId);

    List<AgendaVacinal> findByCampanhaId(Long campanhaId);
}
