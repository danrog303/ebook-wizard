package com.github.danrog303.ebookwizard.external.email;

import java.util.List;

/**
 * Interface for email sending services.
 * Can be implemented by different email sending services, such as AWS SES.
 * Contains methods for sending emails with or without attachments.
 * @see AwsSesEmailSenderService
 */
public interface EmailSenderService {
    /**
     * Send a simple email without attachments.
     */
    void send(String to, String subject, String messageHtml);

    /**
     * Send an email with attachments.
     */
    void send(String to, String subject, String messageHtml, List<EmailAttachment> attachments);
}