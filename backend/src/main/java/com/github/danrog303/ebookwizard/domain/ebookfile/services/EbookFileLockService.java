package com.github.danrog303.ebookwizard.domain.ebookfile.services;

import com.github.danrog303.ebookwizard.domain.ebook.models.EbookFileLock;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFile;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
public class EbookFileLockService {
    private final EbookFileRepository ebookFileRepository;

    public void lockEbookFileForEditing(String ebookFileId) {
        log.debug("Locking ebook file for editing: {}", ebookFileId);

        EbookFile ebookFile = ebookFileRepository.findById(ebookFileId).orElseThrow();
        if (ebookFile.getEditLock().getIsLocked()) {
            throw new IllegalStateException("Ebook file is already locked for editing");
        }

        long datePlus30Minutes = System.currentTimeMillis()+(30*60*1000);
        ebookFile.setEditLock(new EbookFileLock(true, new Date(datePlus30Minutes)));
        ebookFileRepository.save(ebookFile);
    }

    public void unlockEbookFileForEditing(String ebookFileId) {
        log.debug("Unlocking ebook file for editing: {}", ebookFileId);
        EbookFile ebookFile = ebookFileRepository.findById(ebookFileId).orElseThrow();
        ebookFile.setEditLock(new EbookFileLock(false, null));
        ebookFileRepository.save(ebookFile);
    }
}
