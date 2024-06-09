package com.github.danrog303.ebookwizard.domain.ebookfile;

import com.github.danrog303.ebookwizard.domain.ebook.EbookDownloadableResource;
import com.github.danrog303.ebookwizard.domain.ebook.EbookFileLock;
import com.github.danrog303.ebookwizard.domain.ebook.EbookFormat;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor @NoArgsConstructor
@Document(collection = "ebookFiles")
public class EbookFile {
    @Id
    @NotNull
    private String id;

    @NotNull
    private String ownerUserId;

    @NotNull
    private String name;

    private String author;

    private String description;

    @NotNull
    private String coverImageKey;

    @NotNull
    private List<String> tags = new ArrayList<>();

    @NotNull
    private Date creationDate;

    @NotNull
    private boolean isPublic;

    @NotNull
    private EbookFormat conversionSourceFormat;

    @NotNull
    private EbookFileLock editLock;

    @NotNull
    private List<EbookDownloadableResource> downloadableFiles= new ArrayList<>();
}
