package com.github.danrog303.ebookwizard.domain.ebook.services;

import com.github.danrog303.ebookwizard.domain.ebook.models.EbookWizardStatistics;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFileRepository;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectRepository;
import com.github.danrog303.ebookwizard.external.auth.UserCountProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EbookWizardStatisticsService {
    private final EbookFileRepository fileRepository;
    private final EbookProjectRepository projectRepository;
    private final UserCountProvider userCountProvider;

    public EbookWizardStatistics getStatistics() {
        var stats = new EbookWizardStatistics();

        stats.setTotalEbookFiles(fileRepository.count());
        stats.setTotalEbookProjects(projectRepository.count());
        stats.setTotalUsers(userCountProvider.getUserCount());

        return stats;
    }
}
