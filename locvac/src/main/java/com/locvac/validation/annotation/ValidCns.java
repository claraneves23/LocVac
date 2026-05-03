package com.locvac.validation.annotation;

import com.locvac.validation.CnsValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = CnsValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCns {
    String message() default "CNS inválido";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
