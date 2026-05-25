package com.locvac.service.impl;

import java.time.LocalDateTime;

public class ContaBloqueadaException extends RuntimeException {

    private final LocalDateTime bloqueadoAte;

    public ContaBloqueadaException(LocalDateTime bloqueadoAte) {
        super("Conta bloqueada. Tente novamente mais tarde.");
        this.bloqueadoAte = bloqueadoAte;
    }

    public LocalDateTime getBloqueadoAte() {
        return bloqueadoAte;
    }
}
