package com.github.danrog303.ebookwizard.domain.ebook.controllers;

import com.github.danrog303.ebookwizard.domain.ebook.services.EbookDiskUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ebook/disk")
@RequiredArgsConstructor
public class EbookDiskUsageController {
    private final EbookDiskUsageService ebookDiskUsageService;

    @GetMapping("/limit")
    @PreAuthorize("isAuthenticated()")
    public long getLimit() {
        return ebookDiskUsageService.getDiskLimitOfAuthenticatedUser();
    }

    @GetMapping("/usage")
    @PreAuthorize("isAuthenticated()")
    public long getUsageBytes() {
        return ebookDiskUsageService.calculateDiskUsage();
    }
}
