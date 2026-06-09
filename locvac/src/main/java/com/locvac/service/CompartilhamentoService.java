package com.locvac.service;

import com.locvac.dto.compartilhamento.AcessoResponseDTO;
import com.locvac.dto.compartilhamento.ConvitePreviewDTO;
import com.locvac.dto.compartilhamento.ConviteResponseDTO;
import com.locvac.dto.compartilhamento.CriarConviteRequestDTO;

import java.util.List;

public interface CompartilhamentoService {

    ConviteResponseDTO criarConvite(CriarConviteRequestDTO dto);

    ConvitePreviewDTO previewConvite(String tokenOuCodigo);

    void aceitarConvite(String tokenOuCodigo);

    void cancelarConvite(String tokenOuCodigo);

    List<AcessoResponseDTO> listarAcessos(Long idPessoa);

    void revogarAcesso(Long idUsuarioPessoa);

    void removerMeuAcesso(Long idPessoa);
}
