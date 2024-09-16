package com.github.danrog303.ebookwizard.domain.ebook.controllers;

import com.github.danrog303.ebookwizard.domain.ebook.models.EbookWizardStatistics;
import com.github.danrog303.ebookwizard.domain.ebook.services.EbookWizardStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
public class EbookWizardStatisticsController {
    private final EbookWizardStatisticsService statisticsService;

    @GetMapping
    public EbookWizardStatistics getStatistics() {
        return statisticsService.getStatistics();
    }
}
