package com.github.danrog303.ebookwizard.domain.ebook.services;

import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFile;
import com.github.danrog303.ebookwizard.domain.ebookfile.services.EbookFileManipulationService;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.services.EbookProjectManipulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EbookAccountCleanupService {
    private final EbookProjectManipulationService projectManipulationService;
    private final EbookFileManipulationService fileManipulationService;

    public void cleanupAccount() {
        List<EbookProject> projects = projectManipulationService.listEbookProjectsOfAuthenticatedUser();
        List<EbookFile> files = fileManipulationService.listEbookFilesOfAuthenticatedUser();

        for (var project : projects) {
            projectManipulationService.deleteEbookProject(project.getId());
        }

        for (var file : files) {
            fileManipulationService.deleteEbookFile(file.getId());
        }
    }
}
