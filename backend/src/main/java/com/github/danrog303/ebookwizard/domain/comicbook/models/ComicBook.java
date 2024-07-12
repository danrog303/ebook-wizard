package com.github.danrog303.ebookwizard.domain.comicbook.models;

import com.github.danrog303.ebookwizard.domain.ebook.EbookDownloadableResource;
import com.github.danrog303.ebookwizard.domain.ebook.EbookFileLock;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor @NoArgsConstructor
@Document(collection = "comicBooks")
public class ComicBook {
    @Id
    @NotNull
    private String id;

    @NotNull
    private String ownerUserId;

    @NotNull
    private String name;

    private String writerName;

    private String description;

    @NotNull
    private String coverImageKey;

    private String genre;

    @NotNull
    private String creationDate;

    @NotNull
    private Boolean isPublic;

    @NotNull
    private Boolean isManga;

    @NotNull
    private EbookFileLock editLock;

    @NotNull
    private List<EbookDownloadableResource> downloadableFiles = new ArrayList<>();

    @NotNull
    private List<ComicBookChapter> chapters = new ArrayList<>();
}
