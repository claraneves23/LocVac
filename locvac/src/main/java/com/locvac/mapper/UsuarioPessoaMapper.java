package com.locvac.mapper;

import com.locvac.dto.usuarioPessoa.UsuarioPessoaRequestDTO;
import com.locvac.dto.usuarioPessoa.UsuarioPessoaResponseDTO;
import com.locvac.model.associacao.UsuarioPessoa;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Usuario;
import com.locvac.model.enums.TipoVinculo;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.UUID;


@Component
public class UsuarioPessoaMapper {

    @PersistenceContext
    private EntityManager entityManager;

    public UsuarioPessoa toEntity(UsuarioPessoaRequestDTO dto) {
        UsuarioPessoa usuarioPessoa = new UsuarioPessoa();
        // Busca o Usuario do banco para garantir que é uma entidade gerenciada
        Usuario usuario = entityManager.find(Usuario.class, dto.idUsuario());
        usuarioPessoa.setUsuario(usuario);
        Pessoa pessoa = new Pessoa(dto.idPessoa());
        usuarioPessoa.setPessoa(pessoa);
        usuarioPessoa.setTipoVinculo(dto.tipoVinculo());
        usuarioPessoa.setPodeVisualizar(dto.podeVisualizar());
        usuarioPessoa.setPodeEditar(dto.podeEditar());
        usuarioPessoa.setDataVinculo(dto.dataVinculo());
        usuarioPessoa.setDscParentesco(dto.dscParentesco());
        return usuarioPessoa;
    }

    public UsuarioPessoaResponseDTO toResponse(UsuarioPessoa usuarioPessoa) {
        return new UsuarioPessoaResponseDTO(
            usuarioPessoa.getId(),
            usuarioPessoa.getUsuario() != null ? usuarioPessoa.getUsuario().getId() : null,
            usuarioPessoa.getPessoa() != null ? usuarioPessoa.getPessoa().getId() : null,
            usuarioPessoa.getTipoVinculo(),
            usuarioPessoa.getDscParentesco(),
            usuarioPessoa.isPodeVisualizar(),
            usuarioPessoa.isPodeEditar(),
            usuarioPessoa.getDataVinculo()
        );
    }
}
