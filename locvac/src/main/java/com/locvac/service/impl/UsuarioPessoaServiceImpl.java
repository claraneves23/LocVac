package com.locvac.service.impl;

import com.locvac.dto.usuarioPessoa.UsuarioPessoaRequestDTO;
import com.locvac.dto.usuarioPessoa.UsuarioPessoaResponseDTO;
import com.locvac.mapper.UsuarioPessoaMapper;
import com.locvac.model.associacao.UsuarioPessoa;
import com.locvac.repository.UsuarioPessoaRepository;
import com.locvac.service.UsuarioPessoaService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioPessoaServiceImpl implements UsuarioPessoaService {
    private final UsuarioPessoaRepository usuarioPessoaRepository;
    private final UsuarioPessoaMapper usuarioPessoaMapper;

    public UsuarioPessoaServiceImpl(UsuarioPessoaRepository usuarioPessoaRepository, UsuarioPessoaMapper usuarioPessoaMapper) {
        this.usuarioPessoaRepository = usuarioPessoaRepository;
        this.usuarioPessoaMapper = usuarioPessoaMapper;
    }

    @Override
    public UsuarioPessoaResponseDTO cadastrar(UsuarioPessoaRequestDTO dto) {
        UsuarioPessoa usuarioPessoa = usuarioPessoaMapper.toEntity(dto);
        usuarioPessoa = usuarioPessoaRepository.save(usuarioPessoa);
        return usuarioPessoaMapper.toResponse(usuarioPessoa);
    }

    @Override
    public List<UsuarioPessoaResponseDTO> listarTodos() {
        return usuarioPessoaRepository.findAll().stream().map(usuarioPessoaMapper::toResponse).toList();
    }

    @Override
    public UsuarioPessoaResponseDTO buscarPorId(String id) {
        return usuarioPessoaRepository.findById(id).map(usuarioPessoaMapper::toResponse).orElseThrow();
    }

    @Override
    public void remover(String id) {
        usuarioPessoaRepository.deleteById(id);
    }

    // Implementação do novo método
    @Override
    public List<UsuarioPessoaResponseDTO> buscarPorPessoa(Long idPessoa) {
        return usuarioPessoaRepository.findByPessoaId(idPessoa)
                .stream()
                .map(usuarioPessoaMapper::toResponse)
                .toList();
    }
}
