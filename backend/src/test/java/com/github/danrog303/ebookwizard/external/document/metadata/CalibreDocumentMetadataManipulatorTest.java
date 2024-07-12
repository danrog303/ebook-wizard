package com.github.danrog303.ebookwizard.external.document.metadata;

import com.github.danrog303.ebookwizard.domain.ebook.EbookFormat;
import com.github.danrog303.ebookwizard.external.document.thumbnail.CalibreDocumentThumbnailManipulatorTest;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import lombok.SneakyThrows;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

public class CalibreDocumentMetadataManipulatorTest {
    private final DocumentMetadataManipulator manipulator = new CalibreDocumentMetadataManipulator();

    @SneakyThrows(IOException.class)
    @ParameterizedTest
    @EnumSource(EbookFormat.class)
    public void testIfDocumentMetadataAreCorrectlyWritten(EbookFormat format) {
        var loader = CalibreDocumentThumbnailManipulatorTest.class.getClassLoader();

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            String resourceName = "samples/sample-%s.%s".formatted(format.getExtensionName(), format.getExtensionName());
            Path documentPath = Path.of(tempDir.getDirectory().toAbsolutePath().toString(), "doc." + format.getExtensionName());
            InputStream resourceStream = loader.getResourceAsStream(resourceName);

            assert resourceStream != null;
            Files.copy(resourceStream, documentPath);

            var metaToSave = new DocumentMetadata("Book Title 1",
                    "Author 2",
                    "Description 3",
                    List.of("action", "adventure")
            );

            manipulator.setDocumentMetadata(documentPath, metaToSave);

            if (format.isHasMetadata()) {
                var metaFromFile = manipulator.getDocumentMetadata(documentPath);
                assertThat(metaFromFile).isEqualTo(metaToSave);
            }
        }

    }
}
