package com.locvac.validation.annotation;

import com.locvac.validation.validator.PeloMenosUmCampoValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PeloMenosUmCampoValidator.class)
public @interface PeloMenosUmCampo {
    String message() default "Pelo menos um campo deve ser informado";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
