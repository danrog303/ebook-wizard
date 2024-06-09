package com.github.danrog303.ebookwizard.domain.comicbook;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor @NoArgsConstructor
public class ComicBookChapter {
    @NotNull
    private String name;

    @NotNull
    List<ComicBookPage> pages = new ArrayList<>();
}
