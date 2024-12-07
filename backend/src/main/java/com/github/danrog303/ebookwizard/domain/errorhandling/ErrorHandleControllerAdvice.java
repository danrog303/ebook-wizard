package com.github.danrog303.ebookwizard.domain.errorhandling;

import com.github.danrog303.ebookwizard.domain.errorhandling.exceptions.FileStorageQuotaExceededException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.Date;
import java.util.NoSuchElementException;

@Slf4j
@ControllerAdvice
public class ErrorHandleControllerAdvice {
    private static final String ERR_TPL = "Controller advice caught a %s exception";
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error(ERR_TPL.formatted(e.getClass().getSimpleName()), e);
        var status = HttpStatus.INTERNAL_SERVER_ERROR;
        var key = "INTERNAL_SERVER_ERROR";
        var msg = e.getMessage();
        if (msg == null || msg.isBlank()) {
            msg = "An internal server error occurred";
        }

        var response = new ErrorResponse(status.value(), key, msg, new Date());
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(ClassCastException.class)
    public ResponseEntity<ErrorResponse> handleClassCastException(ClassCastException e) {
        log.error(ERR_TPL.formatted(e.getClass().getSimpleName()), e);

        if (e.getMessage() != null && e.getMessage().contains("AnonymousAuthenticationToken")) {
            var status = HttpStatus.UNAUTHORIZED;
            var key = "UNAUTHORIZED";
            var response = new ErrorResponse(status.value(), key, e.getMessage(), new Date());
            return ResponseEntity.status(status).body(response);
        } else {
            var status = HttpStatus.INTERNAL_SERVER_ERROR;
            var key = "CLASS_CAST_EXCEPTION";
            var response = new ErrorResponse(status.value(), key, e.getMessage(), new Date());
            return ResponseEntity.status(status).body(response);
        }
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ErrorResponse> handleMultipartException(MultipartException e) {
        log.error(ERR_TPL.formatted(e.getClass().getSimpleName()), e);
        var status = HttpStatus.BAD_REQUEST;
        var key = "MULTIPART_RESOLUTION_FAILED";
        var response = new ErrorResponse(status.value(), key, e.getMessage(), new Date());
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestPartException(MissingServletRequestPartException e) {
        log.error(ERR_TPL.formatted(e.getClass().getSimpleName()), e);
        var status = HttpStatus.BAD_REQUEST;
        var key = "MULTIPART_MISSING_FIELD";
        var response = new ErrorResponse(status.value(), key, e.getMessage(), new Date());
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleHttpMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException e) {
        log.error(ERR_TPL.formatted(e.getClass().getSimpleName()), e);
        var status = HttpStatus.BAD_REQUEST;
        var key = "MEDIA_TYPE_NOT_SUPPORTED";
        var response = new ErrorResponse(status.value(), key, e.getMessage(), new Date());
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        log.error(ERR_TPL.formatted(e.getClass().getSimpleName()), e);
        var status = HttpStatus.BAD_REQUEST;
        var key = "MESSAGE_NOT_READABLE";
        var response = new ErrorResponse(status.value(), key, e.getMessage(), new Date());
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        log.error(ERR_TPL.formatted(e.getClass().getSimpleName()), e);
        var status = HttpStatus.BAD_REQUEST;
        var key = "ARGUMENT_NOT_VALID";
        var response = new ErrorResponse(status.value(), key, e.getMessage(), new Date());
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException e) {
        log.error(ERR_TPL.formatted(e.getClass().getSimpleName()), e);
        var status = HttpStatus.UNAUTHORIZED;
        var key = "UNAUTHORIZED_ACCESS";
        var response = new ErrorResponse(status.value(), key, e.getMessage(), new Date());
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Object> handleNotFoundException(NoHandlerFoundException e) {
        log.error(ERR_TPL.formatted(e.getClass().getSimpleName()), e);
        var status = HttpStatus.NOT_FOUND;
        var key = "RESOURCE_NOT_FOUND";
        var response = new ErrorResponse(status.value(), key, e.getMessage(), new Date());
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestParameterException(MissingServletRequestParameterException e) {
        log.error(ERR_TPL.formatted(e.getClass().getSimpleName()), e);
        var status = HttpStatus.BAD_REQUEST;
        var key = "MISSING_REQUEST_PARAMETER";
        var response = new ErrorResponse(status.value(), key, e.getMessage(), new Date());
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorResponse> handleNoSuchElementException(NoSuchElementException e) {
        log.error(ERR_TPL.formatted(e.getClass().getSimpleName()), e);
        var status = HttpStatus.NOT_FOUND;
        var key = "NOT_FOUND";
        var response = new ErrorResponse(status.value(), key, e.getMessage(), new Date());
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e) {
        log.error(ERR_TPL.formatted(e.getClass().getSimpleName()), e);
        var status = HttpStatus.BAD_REQUEST;
        var key = "FILE_STORAGE_QUOTA_EXCEEDED";
        var response = new ErrorResponse(status.value(), key, e.getMessage(), new Date());
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(FileStorageQuotaExceededException.class)
    public ResponseEntity<ErrorResponse> handleFileStorageQuotaExceededException(MaxUploadSizeExceededException e) {
        log.error(ERR_TPL.formatted(e.getClass().getSimpleName()), e);
        var key = "FILE_STORAGE_QUOTA_EXCEEDED";
        var status = HttpStatus.BAD_REQUEST;
        var response = new ErrorResponse(status.value(), key, e.getMessage(), new Date());
        return ResponseEntity.status(status).body(response);
    }
}
