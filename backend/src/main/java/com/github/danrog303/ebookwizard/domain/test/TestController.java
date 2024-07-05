package com.github.danrog303.ebookwizard.domain.test;

import com.github.danrog303.ebookwizard.domain.ebookfile.database.EbookFileRepository;
import com.github.danrog303.ebookwizard.domain.ebookproject.database.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.database.EbookProjectChapter;
import com.github.danrog303.ebookwizard.domain.ebookproject.database.EbookProjectRepository;
import com.github.danrog303.ebookwizard.domain.taskqueue.database.QueueTask;
import com.github.danrog303.ebookwizard.domain.taskqueue.database.QueueTaskPayload;
import com.github.danrog303.ebookwizard.domain.taskqueue.QueueTaskService;
import com.github.danrog303.ebookwizard.domain.taskqueue.email.EmailQueueService;
import com.github.danrog303.ebookwizard.domain.taskqueue.email.EmailQueueTaskPayload;
import com.github.danrog303.ebookwizard.external.auth.AuthorizationProvider;
import com.github.danrog303.ebookwizard.external.email.EmailAttachment;
import com.github.danrog303.ebookwizard.external.email.EmailSenderService;
import com.github.danrog303.ebookwizard.external.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    private final EmailSenderService emailSender;
    private final QueueTaskService queueTaskService;
    private final EmailQueueService emailQueueService;
    private final FileStorageService fileStorageService;

    @GetMapping("/ping")
    public Map<String, String> ping() {return Map.of("message", "pong");
    }

    @GetMapping("/s3")
    public String s3Test() {
        return fileStorageService.getDownloadUrl("13210.jpg");
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
                new EmailAttachment("ebook1.pdf", path),
                new EmailAttachment("ebook2.pdf", path)
        );
        emailSender.send("shirock98@gmail.com", email, message, attachments);
        return Map.of("message", "sent email");
    }

    @GetMapping("/enqueue")
    @SneakyThrows
    public List<QueueTask<QueueTaskPayload>> enqueue() {
        var payload1 = new EmailQueueTaskPayload("daniel.rogowski@onet.pl", "to jest test 1", "testujemy wysyłanie emaili 1", List.of());
        var payload2 = new EmailQueueTaskPayload("daniel.rogowski@onet.pl", "to jest test 2", "testujemy wysyłanie emaili 2", List.of());
        var payload3 = new EmailQueueTaskPayload("daniel.rogowski@onet.pl", "to jest test 3", "testujemy wysyłanie emaili 3", List.of());

        var task1 = emailQueueService.enqueueEmail(payload1);
        var task2 = emailQueueService.enqueueEmail(payload2);
        var task3 = emailQueueService.enqueueEmail(payload3);

        return List.of(task1, task2, task3);
    }
}
