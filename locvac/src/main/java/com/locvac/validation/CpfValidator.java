package com.locvac.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CpfValidator implements ConstraintValidator<ValidCpf, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) return true;

        String digits = value.replaceAll("\\D", "");

        if (digits.length() != 11) return false;
        if (digits.chars().distinct().count() == 1) return false;

        return checkDigit(digits, 9) && checkDigit(digits, 10);
    }

    private boolean checkDigit(String digits, int position) {
        int sum = 0;
        for (int i = 0; i < position; i++) {
            sum += Character.getNumericValue(digits.charAt(i)) * (position + 1 - i);
        }
        int remainder = (sum * 10) % 11;
        if (remainder == 10) remainder = 0;
        return remainder == Character.getNumericValue(digits.charAt(position));
    }
}
