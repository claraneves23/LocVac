package com.locvac.controller;

import com.locvac.service.impl.ContaBloqueadaException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ContaBloqueadaException.class)
    public ResponseEntity<Map<String, Object>> handleContaBloqueada(ContaBloqueadaException ex) {
        LocalDateTime bloqueadoAte = ex.getBloqueadoAte();
        long secondsLeft = Math.max(0, Duration.between(LocalDateTime.now(), bloqueadoAte).getSeconds());

        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpStatus.LOCKED.value());
        body.put("message", ex.getMessage());
        body.put("bloqueadoAte", bloqueadoAte.atOffset(ZoneOffset.UTC).toString());
        body.put("segundosRestantes", secondsLeft);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.RETRY_AFTER, String.valueOf(secondsLeft));

        return ResponseEntity.status(HttpStatus.LOCKED).headers(headers).body(body);
    }
}
