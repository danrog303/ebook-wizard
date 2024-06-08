package com.github.danrog303.ebookwizard.external.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

/**
 * Facade class for obtaining currently authenticated user information.
 */
@Service
@RequiredArgsConstructor
public class AuthorizationProvider {
    private final UserInfoProvider userInfoProvider;

    /**
     * Obtains generic {@link Authentication} object from the Spring Security context.
     */
    public Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /**
     * Reads Spring Security context and checks if the user is currently authenticated.
     */
    public boolean isUserAuthenticated() {
        try {
            boolean isAuthenticated = getAuthentication().isAuthenticated();
            boolean isNotAnonymous = !(getAuthentication() instanceof AnonymousAuthenticationToken);
            return isAuthenticated && isNotAnonymous;
        } catch (NullPointerException ex) {
            return false;
        }
    }

    /**
     * Obtains JWT authentication token instance of currently authenticated user.
     */
    public JwtAuthenticationToken getAuthenticationToken() {
        return (JwtAuthenticationToken) getAuthentication();
    }

    /**
     * Obtains ID of currently authenticated user.
     */
    public String getAuthenticatedUserId() {
        return getAuthenticationToken().getToken().getSubject();
    }

    /**
     * Obtains JWT authentication token value of currently authenticated user.
     */
    public String getAuthenticationTokenValue() {
        return getAuthenticationToken().getToken().getTokenValue();
    }

    /**
     * Connects to the authentication server and fetches additional information about currently authenticated user.
     */
    public UserInfo getUserInfo( ) {
        String userId = getAuthenticatedUserId();
        return userInfoProvider.getUserInfo(userId);
    }
}
