package com.github.danrog303.ebookwizard.external.auth;

/**
 * Retrieves additional information about the user from the authentication server.
 */
public interface UserInfoProvider {
    /**
     * Retrieves a {@link UserInfo} object based on the given user id.
     */
    UserInfo getUserInfo(String userId);
}
