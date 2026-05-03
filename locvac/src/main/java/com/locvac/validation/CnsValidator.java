package com.locvac.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CnsValidator implements ConstraintValidator<ValidCns, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) return true;

        String digits = value.replaceAll("\\D", "");

        if (digits.length() != 15) return false;

        char primeiro = digits.charAt(0);
        if ("12".indexOf(primeiro) >= 0) return validarPorPis(digits);
        if ("789".indexOf(primeiro) >= 0) return validarPorModulo(digits);

        return false;
    }

    // Cartões iniciados em 7, 8 ou 9: soma ponderada deve ser divisível por 11
    private boolean validarPorModulo(String digits) {
        int soma = 0;
        for (int i = 0; i < 15; i++) {
            soma += Character.getNumericValue(digits.charAt(i)) * (15 - i);
        }
        return soma % 11 == 0;
    }

    // Cartões iniciados em 1 ou 2: regenera o CNS a partir do PIS e compara
    private boolean validarPorPis(String digits) {
        String pis = digits.substring(0, 11);
        int soma = 0;
        for (int i = 0; i < 11; i++) {
            soma += Character.getNumericValue(pis.charAt(i)) * (15 - i);
        }
        int dsc = soma % 11;
        String esperado;
        if (dsc == 0) {
            esperado = pis + "0001";
        } else if (dsc == 1) {
            int dsc2 = (soma + 2) % 11;
            esperado = pis + "001" + (11 - dsc2);
        } else {
            esperado = pis + "000" + (11 - dsc);
        }
        return digits.equals(esperado);
    }
}
