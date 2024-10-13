package com.github.danrog303.ebookwizard.external.validator;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;

@Slf4j
@Service
public class ValidatorService {
    private ValidatorFactory factory;
    private Validator validator;

    @PostConstruct
    void initialize() {
        this.factory = Validation.buildDefaultValidatorFactory();
        this.validator = this.factory.getValidator();
    }

    @PreDestroy
    void destroy() {
        this.factory.close();
    }

    public <T> boolean isValid(T object) {
        Set<ConstraintViolation<T>> violations = validator.validate(object);
        if (violations.isEmpty()) {
            return true;
        } else {
            log.warn("Validation failed for object of type {}: {}", object.getClass().getSimpleName(), violations);
            return false;
        }
    }
}
