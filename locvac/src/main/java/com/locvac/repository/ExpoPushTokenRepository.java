package com.locvac.repository;

import com.locvac.model.associacao.ExpoPushToken;
import com.locvac.model.core.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpoPushTokenRepository extends JpaRepository<ExpoPushToken, Long> {

    Optional<ExpoPushToken> findByToken(String token);

    List<ExpoPushToken> findByUsuario(Usuario usuario);

    void deleteByToken(String token);
}
