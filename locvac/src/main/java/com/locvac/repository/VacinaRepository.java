package com.locvac.repository;

import com.locvac.model.core.Vacina;
import com.locvac.model.enums.TipoSecaoVacinacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VacinaRepository extends JpaRepository<Vacina, Long> {
    List<Vacina> findByTipoSecaoVacinacaoAndAtivaTrue(TipoSecaoVacinacao tipo);
    boolean existsByCodigoPNI(String codigoPNI);
}
