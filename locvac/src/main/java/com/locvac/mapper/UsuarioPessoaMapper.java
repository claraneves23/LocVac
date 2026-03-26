package com.locvac.mapper;

import com.locvac.dto.usuarioPessoa.UsuarioPessoaRequestDTO;
import com.locvac.dto.usuarioPessoa.UsuarioPessoaResponseDTO;
import com.locvac.model.associacao.UsuarioPessoa;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Usuario;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class UsuarioPessoaMapper {
    public UsuarioPessoa toEntity(UsuarioPessoaRequestDTO dto) {
        UsuarioPessoa usuarioPessoa = new UsuarioPessoa();
        Usuario usuario = new Usuario();
        // O id de Usuario é UUID, mas o DTO agora traz Long. Precisa buscar do banco ou adaptar o construtor/mapper.
        // Aqui, apenas setamos o id se necessário, mas normalmente o correto é buscar o Usuario pelo id.
        // usuario.setId(dto.idUsuario()); // Precisa de setter em Usuario, ou buscar do banco.
        usuarioPessoa.setUsuario(usuario);
        Pessoa pessoa = new Pessoa(dto.idPessoa());
        usuarioPessoa.setPessoa(pessoa);
        usuarioPessoa.setTipoVinculo(dto.tipoVinculo());
        usuarioPessoa.setPodeVisualizar(dto.podeVisualizar());
        usuarioPessoa.setPodeEditar(dto.podeEditar());
        usuarioPessoa.setDataVinculo(dto.dataVinculo());
        return usuarioPessoa;
    }

    public UsuarioPessoaResponseDTO toResponse(UsuarioPessoa usuarioPessoa) {
        return new UsuarioPessoaResponseDTO(
            usuarioPessoa.getId(),
            usuarioPessoa.getUsuario().getId(),
            usuarioPessoa.getPessoa().getId(),
            usuarioPessoa.getTipoVinculo(),
            usuarioPessoa.isPodeVisualizar(),
            usuarioPessoa.isPodeEditar(),
            usuarioPessoa.getDataVinculo()
        );
    }
}
