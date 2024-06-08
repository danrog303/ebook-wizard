package com.github.danrog303.ebookwizard.domain.test;

import com.github.danrog303.ebookwizard.external.auth.AuthorizationProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {
    private final AuthorizationProvider authorizationProvider;

    @GetMapping("/ping")
    public Map<String, String> ping() {return Map.of("message", "pong");
    }

    @GetMapping("/me")
    public Map<String, String> me() {
        if (authorizationProvider.isUserAuthenticated()) {
            return Map.of(
                "authStatus", "authenticated",
                "userId", authorizationProvider.getAuthenticatedUserId(),
                "token", authorizationProvider.getAuthenticationTokenValue(),
                "userInfo", authorizationProvider.getUserInfo().toString()
            );
        } else {
            return Map.of("authStatus", "not authenticated");
        }
    }
}
