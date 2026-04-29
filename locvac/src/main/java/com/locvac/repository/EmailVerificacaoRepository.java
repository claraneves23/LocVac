package com.locvac.repository;

import com.locvac.model.core.EmailVerificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificacaoRepository extends JpaRepository<EmailVerificacao, Long> {

    Optional<EmailVerificacao> findByEmail(String email);

    void deleteByEmail(String email);
}
