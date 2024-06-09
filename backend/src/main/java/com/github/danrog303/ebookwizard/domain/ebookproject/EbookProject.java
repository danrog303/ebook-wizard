package com.github.danrog303.ebookwizard.domain.ebookproject;

import com.github.danrog303.ebookwizard.domain.ebook.EbookFileLock;
import com.github.danrog303.ebookwizard.domain.ebook.EbookExpirableDownloadableResource;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "ebookProjects")
public class EbookProject {
    @Id
    @NotNull
    private String id;

    @NotNull
    private String ownerUserId;

    @NotNull
    private String name;

    private String author;

    private String description;

    private String coverImageKey;

    @NotNull
    private List<String> tags = new ArrayList<>();

    @NotNull
    private Date creationDate;

    @NotNull
    private Boolean isPublic;

    @NotNull
    private Boolean autoGenerateTableOfContents;

    @NotNull
    private EbookFileLock lock;

    @NotNull
    private List<EbookProjectIllustration> illustrations = new ArrayList<>();

    @NotNull
    private List<EbookExpirableDownloadableResource> downloadableFiles = new ArrayList<>();

    @NotNull
    private List<EbookProjectChapter> chapters = new ArrayList<>();
}
