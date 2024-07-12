package com.github.danrog303.ebookwizard.domain.ebook;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor @NoArgsConstructor
public class EbookDownloadableResource {
    @NotNull
    private String stub;

    @NotNull
    private EbookFormat format;

    @NotNull
    private Date creationDate;

    @NotNull
    private String fileKey;
}
