package com.github.danrog303.ebookwizard.external.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.List;

public class MaxStringLengthListValidator implements ConstraintValidator<MaxStringLengthList, List<String>> {
    private int maxLength;

    @Override
    public void initialize(MaxStringLengthList constraintAnnotation) {
        this.maxLength = constraintAnnotation.value();
    }

    @Override
    public boolean isValid(List<String> list, ConstraintValidatorContext context) {
        if (list == null) {
            return true;
        }

        // Check each string in the list
        for (String str : list) {
            if (str != null && str.length() > maxLength) {
                return false;
            }
        }
        return true;
    }
}
