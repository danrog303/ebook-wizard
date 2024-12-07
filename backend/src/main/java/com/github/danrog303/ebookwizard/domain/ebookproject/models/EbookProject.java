package com.github.danrog303.ebookwizard.domain.ebookproject.models;

import com.github.danrog303.ebookwizard.domain.ebook.models.EbookDownloadableResource;
import com.github.danrog303.ebookwizard.domain.ebook.models.EbookEditLock;
import com.github.danrog303.ebookwizard.external.validator.MaxStringLengthList;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;
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
    private String id;

    @NotNull
    private String ownerUserId;

    @NotNull
    @Length(min=2, max=128)
    private String name;

    @Length(min=2, max=128)
    private String author;

    @Length(max=2048)
    private String description;

    @Length(max=128)
    private String containerName;

    private String coverImageKey;

    @NotNull
    @Size(max=64)
    @MaxStringLengthList(64)
    private List<String> tags = new ArrayList<>();

    @NotNull
    private Date creationDate;

    @NotNull
    private Boolean isPublic;

    @NotNull
    private EbookEditLock lock;

    @NotNull
    private List<EbookProjectIllustration> illustrations = new ArrayList<>();

    @NotNull
    private List<EbookDownloadableResource> downloadableFiles = new ArrayList<>();

    @NotNull
    private List<EbookProjectChapter> chapters = new ArrayList<>();

    private long totalSizeBytes;
}
