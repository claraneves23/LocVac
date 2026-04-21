package com.locvac.dto.carrosselConteudo;

import java.util.List;

public record CarrosselConteudoRequestDTO(
        Long idCarrosselItem,
        String tituloSecao,
        String conteudo,
        List<String> itens,
        Integer ordemExibicao
) {}
