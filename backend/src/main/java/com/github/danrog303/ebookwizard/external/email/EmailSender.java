package com.github.danrog303.ebookwizard.external.email;

import java.util.List;

/**
 * Interface for email sending services.
 */
public interface EmailSender {
    void send(String to, String subject, String messageHtml);
    void send(String to, String subject, String messageHtml, List<EmailAttachment> attachments);
}