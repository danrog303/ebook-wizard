package com.github.danrog303.ebookwizard.domain.ebookproject.models;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor @AllArgsConstructor
public class EbookProjectIllustration {
    /**
     * The identifier of the illustration.
     * Should be unique in the scope of the EbookProject.
     */
    @NotNull
    private String stub;

    @NotNull
    private String fileKey;
}
