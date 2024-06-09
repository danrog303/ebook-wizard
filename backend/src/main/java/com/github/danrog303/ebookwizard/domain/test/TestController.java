package com.github.danrog303.ebookwizard.domain.test;

import com.github.danrog303.ebookwizard.domain.ebookfile.EbookFile;
import com.github.danrog303.ebookwizard.domain.ebookfile.EbookFileRepository;
import com.github.danrog303.ebookwizard.domain.ebookproject.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.EbookProjectChapter;
import com.github.danrog303.ebookwizard.domain.ebookproject.EbookProjectRepository;
import com.github.danrog303.ebookwizard.external.auth.AuthorizationProvider;
import com.github.danrog303.ebookwizard.external.email.EmailAttachment;
import com.github.danrog303.ebookwizard.external.email.EmailSender;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {
    private final AuthorizationProvider authorizationProvider;
    private final EbookFileRepository ebookFileRepository;
    private final EbookProjectRepository ebookProjectRepository;
    private final EmailSender emailSender;

    @GetMapping("/ping")
    public Map<String, String> ping() {return Map.of("message", "pong");
    }

    @GetMapping("/me")
    public Map<String, String> me() {
        if (authorizationProvider.isUserAuthenticated()) {
            return Map.of(
                "authStatus", "authenticated",
                "userId", authorizationProvider.getAuthenticatedUserId(),
                "token", authorizationProvider.getAuthenticationTokenValue(),
                "userInfo", authorizationProvider.getUserInfo().toString()
            );
        } else {
            return Map.of("authStatus", "not authenticated");
        }
    }

    @GetMapping("/dummy")
    public Map<String, String> dummy() {
        var ebook = new EbookProject();
        ebook.setAuthor("Daniel Rogowski");
        ebook.setCoverImageKey("coverio");
        ebook.setChapters(List.of(
            new EbookProjectChapter("Chapter 1", "Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
            new EbookProjectChapter("Chapter 2", "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.")
        ));

        ebookProjectRepository.save(ebook);
        return Map.of("message", "created dummy ebooks");
    }

    @GetMapping("/mail")
    @SneakyThrows
    public Map<String, String> mail() {
        var email = "ebook-wizard: your ebook is ready";
        var message = "Your ebook is ready for download. Please check the email attachments.";
        Path path = Path.of("C:\\Users\\Daniel Rogowski\\Downloads\\todo.pdf");
        var attachments = List.of(
                new EmailAttachment("ebook1.pdf", Files.newInputStream(path)),
                new EmailAttachment("ebook2.pdf", Files.newInputStream(path))
        );
        emailSender.send("shirock98@gmail.com", email, message, attachments);
        return Map.of("message", "sent email");
    }
}
