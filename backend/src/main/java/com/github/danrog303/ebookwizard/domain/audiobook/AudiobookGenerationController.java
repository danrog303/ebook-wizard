package com.github.danrog303.ebookwizard.domain.audiobook;

import com.github.danrog303.ebookwizard.external.tts.TextToSpeechService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/audiobook")
public class AudiobookGenerationController {
    private final TextToSpeechService ttsService;

    @PreAuthorize("isAuthenticated()")
    @SneakyThrows(IOException.class)
    @GetMapping("/synthesize")
    public ResponseEntity<byte[]> synthesizeSpeech(@RequestParam String voiceName, @RequestParam String text) {
        try (InputStream audioStream = ttsService.synthesizeSpeech(voiceName, text)) {
            byte[] audioBytes = audioStream.readAllBytes();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"speech.ogg\"")
                    .contentType(MediaType.parseMediaType("audio/ogg"))
                    .body(audioBytes);
        }
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/languages")
    public List<String> getSupportedLanguages() {
        return ttsService.getSupportedLanguageCodes();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/languages/{languageCode}/voices")
    public List<String> getVoicesForLanguage(@PathVariable String languageCode) {
        return ttsService.getVoiceNamesForLanguageCode(languageCode);
    }
}
