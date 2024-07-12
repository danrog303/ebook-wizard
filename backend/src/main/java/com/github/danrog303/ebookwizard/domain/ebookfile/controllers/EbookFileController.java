package com.github.danrog303.ebookwizard.domain.ebookfile.controllers;

import com.github.danrog303.ebookwizard.domain.ebookfile.services.EbookFileManipulationService;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFile;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTask;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTaskPayload;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/ebook-file")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class EbookFileController {
    private final EbookFileManipulationService ebookFileManipulationService;

    @PostMapping("/convert/{ebookFileId}/to-file/{targetFormat}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public QueueTask<QueueTaskPayload> convertEbookToEbookFile(@PathVariable String ebookFileId,
                                                               @PathVariable String targetFormat) {
        return this.ebookFileManipulationService.enqueueAddNewFileTypeToEbookFile(ebookFileId, targetFormat);
    }

    @PostMapping("/convert/{ebookFileId}/to-project")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public QueueTask<QueueTaskPayload> convertEbookFileToEbookProject(@PathVariable String ebookFileId) {
        return this.ebookFileManipulationService.enqueueConvertEbookFileToEbookProject(ebookFileId);
    }

    @PostMapping("/send-to-device/{ebookFileId}/{targetFormat}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public QueueTask<QueueTaskPayload> sendEbookFileToDevice(@RequestBody String targetEmail,
                                                             @PathVariable String ebookFileId,
                                                             @PathVariable String targetFormat) {
        return this.ebookFileManipulationService.enqueueSendEbookFileToEmail(targetEmail, ebookFileId, targetFormat);
    }

    @GetMapping("/{ebookFileId}")
    public EbookFile getEbookFile(@PathVariable String ebookFileId) {
        return this.ebookFileManipulationService.getEbookFile(ebookFileId);
    }

    @GetMapping
    public List<EbookFile> listEbookFilesOfAuthenticatedUser() {
        return this.ebookFileManipulationService.listEbookFilesOfAuthenticatedUser();
    }

    @GetMapping("/{ebookFileId}/{ebookFileFormat}")
    public String getUrlToDownloadFile(@PathVariable String ebookFileId,
                                          @PathVariable String ebookFileFormat) {
        return this.ebookFileManipulationService.getDownloadUrlForEbookFile(ebookFileId, ebookFileFormat);
    }

    @DeleteMapping("/{ebookFileId}/{ebookFileFormat}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEbookFileFormat(@PathVariable String ebookFileId,
                                      @PathVariable String ebookFileFormat) {
        this.ebookFileManipulationService.deleteEbookFileFormat(ebookFileId, ebookFileFormat);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EbookFile importEbookFromFile(@RequestPart MultipartFile file) {
        return this.ebookFileManipulationService.importEbookFile(file);
    }

    @PutMapping("/{ebookFileId}/cover-image")
    public EbookFile updateEbookFileCoverImage(@RequestPart MultipartFile file, @PathVariable String ebookFileId) {
        return this.ebookFileManipulationService.updateEbookFileCoverImage(ebookFileId, file);
    }

    @DeleteMapping("/{ebookFileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEbookFile(@PathVariable String ebookFileId) {
        this.ebookFileManipulationService.deleteEbookFile(ebookFileId);
    }

    @PutMapping("/{ebookFileId}")
    @ResponseStatus(HttpStatus.OK)
    public EbookFile updateEbookFile(@PathVariable String ebookFileId,
                                     @RequestBody @Valid EbookFile ebook) {
        return this.ebookFileManipulationService.updateEbookFile(ebookFileId, ebook);
    }
}
