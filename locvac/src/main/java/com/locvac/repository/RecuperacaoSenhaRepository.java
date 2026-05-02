package com.locvac.repository;

import com.locvac.model.core.RecuperacaoSenha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecuperacaoSenhaRepository extends JpaRepository<RecuperacaoSenha, Long> {

    Optional<RecuperacaoSenha> findByEmail(String email);

    void deleteByEmail(String email);
}
