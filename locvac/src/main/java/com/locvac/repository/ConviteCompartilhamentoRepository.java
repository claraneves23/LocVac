package com.locvac.repository;

import com.locvac.model.core.ConviteCompartilhamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConviteCompartilhamentoRepository extends JpaRepository<ConviteCompartilhamento, UUID> {
    Optional<ConviteCompartilhamento> findByToken(String token);

    Optional<ConviteCompartilhamento> findByCodigoIgnoreCase(String codigo);

    // Retornado como entidades (e não bulk delete) para que a @ElementCollection
    // convite_pessoa seja removida em cascata ao deletar os convites.
    List<ConviteCompartilhamento> findByUsuarioOrigemIdOrUsuarioDestinoId(UUID usuarioOrigemId, UUID usuarioDestinoId);
}
