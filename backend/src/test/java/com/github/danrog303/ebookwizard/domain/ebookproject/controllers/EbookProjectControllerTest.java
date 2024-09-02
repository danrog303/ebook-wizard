package com.github.danrog303.ebookwizard.domain.ebookproject.controllers;

import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectIllustration;
import com.github.danrog303.ebookwizard.domain.ebookproject.services.EbookProjectManipulationService;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTask;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTaskPayload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class EbookProjectControllerTest {

    private MockMvc mockMvc;

    @Mock
    private EbookProjectManipulationService ebookProjectManipulationService;

    @InjectMocks
    private EbookProjectController ebookProjectController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(ebookProjectController).build();
    }

    @Test
    void test_createEmptyEbookProject() throws Exception {
        EbookProject ebookProject = new EbookProject();
        ebookProject.setId("123");
        when(ebookProjectManipulationService.createEmptyEbookProject(any(EbookProject.class)))
                .thenReturn(ebookProject);

        mockMvc.perform(post("/ebook-project")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"123\"}"))
                .andExpect(status().isCreated())
                .andExpect(content().json("{\"id\":\"123\"}"));
    }

    @Test
    void test_uploadIllustrationImage() throws Exception {
        EbookProjectIllustration illustration = new EbookProjectIllustration();
        when(ebookProjectManipulationService.uploadIllustrationImage(anyString(), any()))
                .thenReturn(illustration);

        MockMultipartFile file = new MockMultipartFile("file", "test-image.jpg", "image/jpeg", "test image content".getBytes());

        mockMvc.perform(multipart("/ebook-project/1/illustration")
                        .file(file))
                .andExpect(status().isCreated());
    }

    @Test
    void test_getIllustrationImageDisplayUrl() throws Exception {
        when(ebookProjectManipulationService.getIllustrationImageUrl(anyString(), anyString()))
                .thenReturn("http://example.com/image.jpg");

        mockMvc.perform(get("/ebook-project/1/illustration/abc123"))
                .andExpect(status().isOk())
                .andExpect(content().string("http://example.com/image.jpg"));
    }

    @Test
    void test_updateCoverImage() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "cover-image.jpg", "image/jpeg", "cover image content".getBytes());

        EbookProject ebookProject = new EbookProject();
        ebookProject.setId("123");
        when(ebookProjectManipulationService.updateCoverImage(anyString(), any()))
                .thenReturn(ebookProject);

        EbookProject response = ebookProjectController.updateCoverImage("123", file);
        assertThat(response.getId()).isEqualTo("123");
    }

    @Test
    void test_deleteCoverImage() throws Exception {
        EbookProject ebookProject = new EbookProject();
        when(ebookProjectManipulationService.deleteCoverImage(anyString()))
                .thenReturn(ebookProject);

        mockMvc.perform(delete("/ebook-project/1/cover-image"))
                .andExpect(status().isNoContent());
    }

    @Test
    void test_getCoverImageUrl() throws Exception {
        when(ebookProjectManipulationService.getCoverImageUrl(anyString()))
                .thenReturn("http://example.com/cover.jpg");

        mockMvc.perform(get("/ebook-project/1/cover-image"))
                .andExpect(status().isOk())
                .andExpect(content().string("http://example.com/cover.jpg"));
    }

    @Test
    void test_deleteIllustrationImage() throws Exception {
        mockMvc.perform(delete("/ebook-project/1/illustration/abc123"))
                .andExpect(status().isNoContent());
    }

    @Test
    void test_updateEbookProject() throws Exception {
        EbookProject ebookProject = new EbookProject();
        when(ebookProjectManipulationService.updateEbookProject(anyString(), any(EbookProject.class)))
                .thenReturn(ebookProject);

        mockMvc.perform(put("/ebook-project/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"1\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void test_deleteEbookProject() throws Exception {
        mockMvc.perform(delete("/ebook-project/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void test_listEbookProjectsOfAuthenticatedUser() throws Exception {
        EbookProject ebookProject = new EbookProject();
        ebookProject.setId("123");
        List<EbookProject> ebookProjects = Collections.singletonList(ebookProject);
        when(ebookProjectManipulationService.listEbookProjectsOfAuthenticatedUser())
                .thenReturn(ebookProjects);

        mockMvc.perform(get("/ebook-project"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is("123")));
    }

    @Test
    void test_getEbookProject() throws Exception {
        EbookProject ebookProject = new EbookProject();
        ebookProject.setId("123");
        when(ebookProjectManipulationService.getEbookProject(anyString()))
                .thenReturn(ebookProject);

        mockMvc.perform(get("/ebook-project/{id}", "123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("123")));
    }

    @Test
    void test_getEbookDownloadUrl() throws Exception {
        when(ebookProjectManipulationService.getDownloadableUrl(anyString(), anyString()))
                .thenReturn("https://example.com/epub");

        mockMvc.perform(get("/ebook-project/{id}/{format}", "123", "epub"))
                .andExpect(status().isOk())
                .andExpect(content().string("https://example.com/epub"));
    }

    @Test
    void test_addEbookFormat() throws Exception {
        when(ebookProjectManipulationService.convertToDownloadableUrl(anyString(), anyString()))
                .thenReturn("https://example.com/ebook.epub");

        mockMvc.perform(post("/ebook-project/1/epub")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(content().string("https://example.com/ebook.epub"));
    }

    @Test
    void test_deleteEbookFormat() throws Exception {
        mockMvc.perform(delete("/ebook-project/1/epub"))
                .andExpect(status().isNoContent());
    }

    @Test
    void test_convertEbookProjectToEbookFile() throws Exception {
        QueueTask<QueueTaskPayload> queueTask = new QueueTask<>();
        when(ebookProjectManipulationService.enqueueConvertEbookProjectToEbookFile(anyString(), anyString()))
                .thenReturn(queueTask);

        mockMvc.perform(post("/ebook-project/convert/123/to-file/epub"))
                .andExpect(status().isAccepted());
    }
}
