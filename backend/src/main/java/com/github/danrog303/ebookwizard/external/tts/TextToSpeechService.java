package com.github.danrog303.ebookwizard.external.tts;

import java.io.InputStream;
import java.util.List;

public interface TextToSpeechService {
    InputStream synthesizeSpeech(String voiceName, String text);
    List<String> getSupportedLanguageCodes();
    List<String> getVoiceNamesForLanguageCode(String languageCode);
}
