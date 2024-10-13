package com.github.danrog303.ebookwizard.external.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = MaxStringLengthListValidator.class)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface MaxStringLengthList {
    String message() default "One or more strings in the list exceed the maximum length";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    int value(); // Maximum length
}
