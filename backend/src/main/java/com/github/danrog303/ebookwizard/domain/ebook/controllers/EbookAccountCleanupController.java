package com.github.danrog303.ebookwizard.domain.ebook.controllers;

import com.github.danrog303.ebookwizard.domain.ebook.services.EbookAccountCleanupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
public class EbookAccountCleanupController {
    private final EbookAccountCleanupService accountCleanupService;

    @DeleteMapping("/cleanup")
    public void cleanupAccount() {
        this.accountCleanupService.cleanupAccount();
    }
}
