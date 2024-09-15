package com.github.danrog303.ebookwizard.domain.ebook.models;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor @NoArgsConstructor
public class EbookFileLock {
    @NotNull
    private Boolean isLocked;

    private Date lockExpirationDate;

    public boolean isLockExpired() {
        return lockExpirationDate != null && lockExpirationDate.before(new Date());
    }

    public boolean getIsLocked() {
        return isLocked && !isLockExpired();
    }
}
