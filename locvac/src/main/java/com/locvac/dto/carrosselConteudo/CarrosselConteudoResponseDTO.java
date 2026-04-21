package com.locvac.dto.carrosselConteudo;

import java.util.List;

public record CarrosselConteudoResponseDTO(
        Long id,
        Long idCarrosselItem,
        String tituloSecao,
        String conteudo,
        List<String> itens,
        Integer ordemExibicao
) {}
