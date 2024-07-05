package com.github.danrog303.ebookwizard.external.email;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.nio.file.Path;

/**
 * Represents an email attachment, which can be sent with an email by using {@link EmailSenderService}.
 * Contains the attachment's name and file path.
 */
@Data
@AllArgsConstructor
public class EmailAttachment {
    private String attachmentName;
    private Path attachmentFilePath;
}