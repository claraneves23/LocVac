package com.locvac.repository;

import com.locvac.model.associacao.DoseAplicada;
import com.locvac.model.enums.TipoSecaoVacinacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoseAplicadaRepository extends JpaRepository<DoseAplicada, Long> {
    List<DoseAplicada> findByPessoaId(Long idPessoa);
    List<DoseAplicada> findByPessoaIdAndVacinaTipoSecaoVacinacao(Long idPessoa, TipoSecaoVacinacao tipo);
}
