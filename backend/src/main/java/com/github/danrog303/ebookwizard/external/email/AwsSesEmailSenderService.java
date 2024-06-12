package com.github.danrog303.ebookwizard.external.email;

import jakarta.activation.FileDataSource;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AwsSesEmailSenderService implements EmailSenderService {
    private final JavaMailSender mailSender;

    @Value("${ebook-wizard.mail.sender-address}")
    private String fromAddress;

    @Override
    public void send(String to, String subject, String messageHtml) {
        this.mailSender.send(mimeMessage -> {
            var helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.addTo(to);
            helper.setFrom(fromAddress);
            helper.setSubject(subject);
            helper.setText(messageHtml, true);
        });
    }

    @Override
    public void send(String to, String subject, String messageHtml, List<EmailAttachment> attachments) {
        this.mailSender.send(mimeMessage -> {
            var helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.addTo(to);
            helper.setFrom(fromAddress);

            for(var attachment : attachments) {
                var attachmentResource = new FileDataSource(new File(attachment.getAttachmentFilePath().toString()));
                helper.addAttachment(attachment.getAttachmentName(), attachmentResource);
            }

            helper.setSubject(subject);
            helper.setText(messageHtml, true);
        });

    }
}
