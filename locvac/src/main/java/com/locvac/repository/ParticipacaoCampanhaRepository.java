package com.locvac.repository;


import com.locvac.model.associacao.ParticipacaoCampanha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParticipacaoCampanhaRepository extends JpaRepository<ParticipacaoCampanha, Long> {

}