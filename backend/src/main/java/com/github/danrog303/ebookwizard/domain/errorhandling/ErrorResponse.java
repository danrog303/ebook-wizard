package com.github.danrog303.ebookwizard.domain.errorhandling;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor @NoArgsConstructor
/**
 * Represents an HTTP response that will be sent to the client in case of an unhandled exception.
 */
public class ErrorResponse {
    /**
     * The HTTP status code (e.g. 404 or 200).
     */
    private Integer code;

    /**
     * Key name of the error, for example "NOT_FOUND".
     */
    private String key;

    /**
     * A human-readable message that describes the error.
     */
    private String message;

    /**
     * A timestamp of when the error occurred.
     */
    private Date timestamp;
}
