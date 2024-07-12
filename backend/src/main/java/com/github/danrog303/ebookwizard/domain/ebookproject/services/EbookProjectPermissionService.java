package com.github.danrog303.ebookwizard.domain.ebookproject.services;

import com.github.danrog303.ebookwizard.domain.ebook.EbookAccessType;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectRepository;
import com.github.danrog303.ebookwizard.external.auth.AuthorizationProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AuthorizationServiceException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EbookProjectPermissionService {
    private final EbookProjectRepository ebookProjectRepository;
    private final AuthorizationProvider authorizationProvider;

    public EbookProject getEbookProject(String ebookProjectId, EbookAccessType accessType) {
        EbookProject ep = ebookProjectRepository.findById(ebookProjectId).orElseThrow();

        if (accessType.equals(EbookAccessType.READ_ONLY) && ep.getIsPublic()) {
            return ep;
        }

        if (accessType.equals(EbookAccessType.READ_WRITE) && ep.getLock().getIsLocked()) {
            throw new IllegalStateException("Ebook is currently locked for editing (background task is running)");
        }

        if (!authorizationProvider.getAuthenticatedUserId().equals(ep.getOwnerUserId())) {
            throw new AuthorizationServiceException("Not authorized");
        }

        return ep;
    }
}
