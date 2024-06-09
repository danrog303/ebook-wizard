package com.github.danrog303.ebookwizard.domain.comicbook;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class ComicBookPage {
    @NotNull
    private String fileKey;
}
