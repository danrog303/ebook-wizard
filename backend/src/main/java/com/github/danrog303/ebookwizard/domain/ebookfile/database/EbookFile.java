package com.github.danrog303.ebookwizard.domain.ebookfile.database;

import com.github.danrog303.ebookwizard.domain.ebook.EbookDownloadableResource;
import com.github.danrog303.ebookwizard.domain.ebook.EbookFileLock;
import com.github.danrog303.ebookwizard.domain.ebook.EbookFormat;
import com.github.danrog303.ebookwizard.domain.ebookproject.database.EbookProject;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;

/**
 * Represents an ebook file in the database.
 * One instance of {@link EbookFormat} class can hold different versions of the same book
 * (for example, epub and pdf version).
 * Ebook file is static, user cannot change the content of the ebook file.
 * For dynamic content, use {@link EbookProject}.
 */
@Data
@AllArgsConstructor @NoArgsConstructor
@Document(collection = "ebookFiles")
public class EbookFile {
    /**
     * Unique identifier of the ebook file.
     * When creating a new ebook file, this field is automatically generated.
     */
    @Id
    private String id;

    /**
     * Unique identifier of the user who owns the ebook file.
     * Will be used to determine the user's permissions to the ebook file.
     * It is not possible to change the owner of an ebook file (API will set this field automatically).
     */
    private String ownerUserId;

    /**
     * A required field that represents the name of the book.
     */
    @NotNull
    private String name;

    /**
     * The author of the book.
     */
    private String author;

    /**
     * A description of the book.
     */
    private String description;

    /**
     * The name of the container where the ebook file is stored.
     */
    private String containerName;

    /**
     * The key of the cover image file in the S3 storage.
     * This field is generated automatically, API user cannot change it.
     */
    private String coverImageKey;

    /**
     * A list of tags that describe the book (e.g. "romance" or "my favorites").
     */
    @NotNull
    private List<String> tags = new ArrayList<>();

    /**
     * The date when the ebook file was created.
     * This field is generated automatically, API user cannot change it.
     */
    private Date creationDate;

    /**
     * Whether the ebook file is marked as favorite by the user.
     */
    private boolean favorite;

    /**
     * Can the book be accessible by other users.
     * By default, the book is private.
     * If the book is public, other users have readonly access to download it.
     */
    @NotNull
    private boolean isPublic;

    /**
     * The format (for example: PDF or MOBI) that will be used as a source for conversion to other formats.
     * During the ebook creation, the API will automatically set this field to the initial format.
     * This field can be overridden by the API user.
     */
    private EbookFormat conversionSourceFormat;

    /**
     * The lock that prevents the ebook file from being edited when background task is updating its contents.
     */
    private EbookFileLock editLock;

    /**
     * A list of S3 objects belonging to this book.
     */
    private List<EbookDownloadableResource> downloadableFiles = new ArrayList<>();

    public void setContainerName(String newName) {
        this.containerName = newName;
        if (!Objects.isNull(this.containerName) && this.containerName.isBlank()) {
            this.containerName = null;
        }
    }

    public void setAuthor(String newAuthor) {
        this.author = newAuthor;
        if (!Objects.isNull(this.author) && this.author.isBlank()) {
            this.author = null;
        }
    }

    public void setDescription(String newDescription) {
        this.description = newDescription;
        if (!Objects.isNull(this.description) && this.description.isBlank()) {
            this.description = null;
        }
    }

    public void setTags(List<String> newTags) {
        this.tags = newTags;
        if (Objects.isNull(this.tags)) {
            this.tags = new ArrayList<>();
        }
    }
}
