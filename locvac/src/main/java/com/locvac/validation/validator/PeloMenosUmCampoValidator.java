package com.locvac.validation.validator;

import com.locvac.validation.annotation.PeloMenosUmCampo;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.lang.reflect.Field;

public class PeloMenosUmCampoValidator implements ConstraintValidator<PeloMenosUmCampo, Object> {

    @Override
    public boolean isValid(Object dto, ConstraintValidatorContext context) {
        if (dto == null) return false;

        for (Field field : dto.getClass().getDeclaredFields()) {
            field.setAccessible(true);
            try {
                if (field.get(dto) != null) {
                    return true;
                }
            } catch (IllegalAccessException e) {
                throw new RuntimeException(e);
            }
        }
        return false;
    }
}
