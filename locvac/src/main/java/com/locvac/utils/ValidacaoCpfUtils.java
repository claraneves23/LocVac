package com.locvac.utils;

import com.locvac.repository.PessoaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class ValidacaoCpfUtils {

    private final PessoaRepository pessoaRepository;

    public ValidacaoCpfUtils(PessoaRepository pessoaRepository) {
        this.pessoaRepository = pessoaRepository;
    }

    public void validarCpfDuplicado(String cpf) {
        if (cpf == null || cpf.isBlank()) return;

        if (pessoaRepository.existsByCpf(cpf)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado.");
        }
    }
}
