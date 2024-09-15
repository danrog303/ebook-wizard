package com.github.danrog303.ebookwizard.domain.ebook.controllers;

import com.github.danrog303.ebookwizard.domain.ebook.services.EbookDiskUsageCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ebook/disk")
@RequiredArgsConstructor
public class EbookDiskUsageController {
    private final EbookDiskUsageCalculator ebookDiskUsageService;

    @GetMapping("/limit")
    @PreAuthorize("isAuthenticated()")
    public long getLimit() {
        // For now, just return 500 MB
        // In the future, this could be a dynamic value based on the user's subscription
        return 500 * 1024 * 1024;
    }

    @GetMapping("/usage")
    @PreAuthorize("isAuthenticated()")
    public long getUsageBytes() {
        return ebookDiskUsageService.calculateDiskUsage();
    }
}
