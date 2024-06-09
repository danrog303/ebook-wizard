package com.github.danrog303.ebookwizard.domain.ebook;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor @NoArgsConstructor
public class EbookExpirableDownloadableResource extends EbookDownloadableResource {
    @NotNull
    private Date expirationDate;
}
