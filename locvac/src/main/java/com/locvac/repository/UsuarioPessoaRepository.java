package com.locvac.repository;

import com.locvac.model.associacao.UsuarioPessoa;
import com.locvac.model.enums.TipoVinculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface UsuarioPessoaRepository extends JpaRepository<UsuarioPessoa, String> {
	List<UsuarioPessoa> findByUsuarioId(UUID usuarioId);

	List<UsuarioPessoa> findByUsuarioIdAndTipoVinculo(UUID usuarioId, TipoVinculo tipoVinculo);

	boolean existsByUsuarioIdAndTipoVinculo(UUID usuarioId, TipoVinculo tipoVinculo);

	// Novo método para buscar por idPessoa
	List<UsuarioPessoa> findByPessoaId(Long idPessoa);
}
