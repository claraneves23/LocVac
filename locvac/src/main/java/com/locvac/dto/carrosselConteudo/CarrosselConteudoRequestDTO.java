package com.locvac.dto.carrosselConteudo;

import jakarta.validation.constraints.Size;
import java.util.List;

public record CarrosselConteudoRequestDTO(
        Long idCarrosselItem,
        @Size(max = 150) String tituloSecao,
        String conteudo,
        List<String> itens,
        Integer ordemExibicao
) {}
