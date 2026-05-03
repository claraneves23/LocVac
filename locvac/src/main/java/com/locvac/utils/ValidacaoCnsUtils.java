package com.locvac.utils;

import com.locvac.repository.PessoaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class ValidacaoCnsUtils {

    private final PessoaRepository pessoaRepository;

    public ValidacaoCnsUtils(PessoaRepository pessoaRepository) {
        this.pessoaRepository = pessoaRepository;
    }

    public void validarCnsDuplicado(String cns) {
        if (cns == null || cns.isBlank()) return;

        if (pessoaRepository.existsByCns(cns)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CNS já cadastrado.");
        }
    }
}
