package com.github.danrog303.ebookwizard.domain.ebookproject;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor @AllArgsConstructor
public class EbookProjectIllustration {
    @NotNull
    private String fileKey;
}
