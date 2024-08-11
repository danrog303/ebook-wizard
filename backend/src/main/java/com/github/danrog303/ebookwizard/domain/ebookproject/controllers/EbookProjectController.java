package com.github.danrog303.ebookwizard.domain.ebookproject.controllers;

import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectChapter;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectIllustration;
import com.github.danrog303.ebookwizard.domain.ebookproject.services.EbookProjectManipulationService;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTask;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTaskPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/ebook-project")
@RequiredArgsConstructor
public class EbookProjectController {
    private final EbookProjectManipulationService ebookProjectManipulationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EbookProject createEmptyEbookProject(@RequestBody EbookProject ebookProject) {
        return this.ebookProjectManipulationService.createEmptyEbookProject(ebookProject);
    }

    @PostMapping("/{ebookProjectId}/illustration")
    @ResponseStatus(HttpStatus.CREATED)
    public EbookProjectIllustration uploadIllustrationImage(@PathVariable String ebookProjectId,
                                                            @RequestPart MultipartFile file) {
        return this.ebookProjectManipulationService.uploadIllustrationImage(ebookProjectId, file);
    }

    @GetMapping("/{ebookProjectId}/illustration/{illustrationHash}")
    public String getIllustrationImageDisplayUrl(@PathVariable String ebookProjectId,
                                                 @PathVariable String illustrationHash) {
        return this.ebookProjectManipulationService.getIllustrationImageUrl(ebookProjectId, illustrationHash);
    }

    @PutMapping("/{ebookProjectId}/cover-image")
    public EbookProject updateCoverImage(@PathVariable String ebookProjectId,
                                         @RequestPart MultipartFile file) {
        return this.ebookProjectManipulationService.updateCoverImage(ebookProjectId, file);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{ebookProjectId}/cover-image")
    public EbookProject deleteCoverImage(@PathVariable String ebookProjectId) {
        return this.ebookProjectManipulationService.deleteCoverImage(ebookProjectId);
    }

    @GetMapping("/{ebookProjectId}/cover-image")
    public String getCoverImageUrl(@PathVariable String ebookProjectId) {
        return this.ebookProjectManipulationService.getCoverImageUrl(ebookProjectId);
    }

    @DeleteMapping("/{ebookProjectId}/illustration/{illustrationHash}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIllustrationImage(@PathVariable String ebookProjectId,
                                        @PathVariable String illustrationHash) {
        this.ebookProjectManipulationService.deleteIllustrationImage(ebookProjectId, illustrationHash);
    }

    @PutMapping("/{ebookProjectId}")
    public EbookProject updateEbookProject(@PathVariable String ebookProjectId,
                                           @RequestBody EbookProject ebookProject) {
        return this.ebookProjectManipulationService.updateEbookProject(ebookProjectId, ebookProject);
    }

    @DeleteMapping("/{ebookProjectId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEbookProject(@PathVariable String ebookProjectId) {
        this.ebookProjectManipulationService.deleteEbookProject(ebookProjectId);
    }

    @GetMapping
    public List<EbookProject> listEbookProjectsOfAuthenticatedUser() {
        return this.ebookProjectManipulationService.listEbookProjectsOfAuthenticatedUser();
    }

    @GetMapping("/{ebookProjectId}")
    public EbookProject getEbookProject(@PathVariable String ebookProjectId) {
        return this.ebookProjectManipulationService.getEbookProject(ebookProjectId);
    }

    @GetMapping("/{ebookProjectId}/{ebookDownloadableFileStub}")
    public String getEbookDownloadUrl(@PathVariable String ebookProjectId, @PathVariable String ebookDownloadableFileStub) {
        return this.ebookProjectManipulationService.getDownloadableUrl(ebookProjectId, ebookDownloadableFileStub);
    }

    @PostMapping("/{ebookProjectId}/{ebookFileFormat}")
    @ResponseStatus(HttpStatus.CREATED)
    public String addEbookFormat(@PathVariable String ebookProjectId, @PathVariable String ebookFileFormat) {
        return this.ebookProjectManipulationService.convertToDownloadableUrl(ebookProjectId, ebookFileFormat);
    }

    @DeleteMapping("/{ebookProjectId}/{ebookDownloadableFileStub}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEbookFormat(@PathVariable String ebookProjectId,
                                  @PathVariable String ebookDownloadableFileStub) {
        this.ebookProjectManipulationService.deleteEbookFormat(ebookProjectId, ebookDownloadableFileStub);
    }

    @PostMapping("/convert/{ebookProjectId}/to-file/{ebookFileFormat}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public QueueTask<QueueTaskPayload> convertEbookProjectToEbookFile(@PathVariable String ebookProjectId,
                                                                      @PathVariable String ebookFileFormat) {
        return this.ebookProjectManipulationService.enqueueConvertEbookProjectToEbookFile(ebookProjectId, ebookFileFormat);
    }

}
