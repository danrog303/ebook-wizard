package com.github.danrog303.ebookwizard.domain.ebookproject.controllers;

import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectChapter;
import com.github.danrog303.ebookwizard.domain.ebookproject.services.EbookProjectChapterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class EbookProjectChapterControllerTest {

    @InjectMocks
    EbookProjectChapterController ebookProjectChapterController;

    @Mock
    EbookProjectChapterService ebookProjectChapterService;

    private MockMvc mockMvc;

    @BeforeEach
    public void init() {
        mockMvc = MockMvcBuilders.standaloneSetup(ebookProjectChapterController).build();
    }

    @Test
    public void test_createChapter() throws Exception {
        mockMvc.perform(post("/ebook-project/{ebookProjectId}/chapter", "123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"123\",\"title\":\"Test Chapter\",\"content\":\"Test Content\"}"))
                .andExpect(status().isCreated());

        verify(ebookProjectChapterService, times(1)).createChapter(anyString(), any(EbookProjectChapter.class));
    }

    @Test
    public void test_deleteChapter() throws Exception {
        mockMvc.perform(delete("/ebook-project/{ebookProjectId}/chapter/{chapterId}", "123", "456"))
                .andExpect(status().isNoContent());

        verify(ebookProjectChapterService, times(1)).deleteChapter(anyString(), anyString());
    }

    @Test
    public void test_updateChapter() throws Exception {
        mockMvc.perform(put("/ebook-project/{ebookProjectId}/chapter/{chapterId}", "123", "456")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"123\",\"title\":\"Test Chapter\",\"content\":\"Test Content\"}"))
                .andExpect(status().isOk());

        verify(ebookProjectChapterService, times(1)).updateChapter(anyString(), anyString(), any(EbookProjectChapter.class));
    }

    @Test
    public void test_reorderChapters() throws Exception {
        mockMvc.perform(put("/ebook-project/{ebookProjectId}/chapter/reorder/{oldIndex}/{newIndex}", "123", 1, 2))
                .andExpect(status().isOk());

        verify(ebookProjectChapterService, times(1)).reorderChapters(anyString(), anyInt(), anyInt());
    }
}