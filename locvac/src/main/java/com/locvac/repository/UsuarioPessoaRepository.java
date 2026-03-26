package com.locvac.repository;

import com.locvac.model.associacao.UsuarioPessoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface UsuarioPessoaRepository extends JpaRepository<UsuarioPessoa, String> {
	List<UsuarioPessoa> findByUsuarioId(UUID usuarioId);
}
