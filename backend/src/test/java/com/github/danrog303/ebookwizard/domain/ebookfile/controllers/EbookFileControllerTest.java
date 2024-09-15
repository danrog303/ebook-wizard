package com.github.danrog303.ebookwizard.domain.ebookfile.controllers;

import com.github.danrog303.ebookwizard.domain.ebook.models.ContentDispositionType;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFile;
import com.github.danrog303.ebookwizard.domain.ebookfile.services.EbookFileManipulationService;
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

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class EbookFileControllerTest {
    @Mock
    EbookFileManipulationService ebookFileManipulationService;

    @InjectMocks
    EbookFileController ebookFileController;

    private MockMvc mockMvc;

    @BeforeEach
    public void init() {
        mockMvc = MockMvcBuilders.standaloneSetup(ebookFileController).build();
    }

    @Test
    public void test_convertEbookToEbookFile() throws Exception {
        QueueTask<QueueTaskPayload> queueTask = new QueueTask<>();
        when(ebookFileManipulationService.enqueueAddNewFileTypeToEbookFile("123", "pdf")).thenReturn(queueTask);

        mockMvc.perform(post("/ebook-file/convert/{ebookFileId}/to-file/pdf", "123")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isAccepted());

        verify(ebookFileManipulationService, times(1))
                .enqueueAddNewFileTypeToEbookFile(anyString(), anyString());
    }

    @Test
    public void test_convertEbookFileToEbookProject() throws Exception {
        QueueTask<QueueTaskPayload> queueTask = new QueueTask<>();
        when(ebookFileManipulationService.enqueueConvertEbookFileToEbookProject("123"))
                .thenReturn(queueTask);

        mockMvc.perform(post("/ebook-file/convert/{ebookFileId}/to-project", "123"))
                .andExpect(status().isAccepted());

        verify(ebookFileManipulationService, times(1)).enqueueConvertEbookFileToEbookProject(anyString());
    }

    @Test
    public void test_sendEbookFileToDevice() throws Exception {
        QueueTask<QueueTaskPayload> queueTask = new QueueTask<>();
        when(ebookFileManipulationService.enqueueSendEbookFileToEmail("test@test.com", "123", "pdf")).thenReturn(queueTask);

        mockMvc.perform(post("/ebook-file/send-to-device/{ebookFileId}/{targetFormat}", "123", "pdf")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("test@test.com"))
                .andExpect(status().isAccepted());

        verify(ebookFileManipulationService, times(1)).enqueueSendEbookFileToEmail(anyString(), anyString(), anyString());
    }

    @Test
    public void test_getEbookFile() throws Exception {
        EbookFile ebookFile = new EbookFile();
        ebookFile.setId("123");
        when(ebookFileManipulationService.getEbookFile("123")).thenReturn(ebookFile);

        mockMvc.perform(get("/ebook-file/{ebookFileId}", "123"))
                .andExpect(status().isOk());

        verify(ebookFileManipulationService, times(1)).getEbookFile(anyString());
    }

    @Test
    public void test_listEbookFilesOfAuthenticatedUser() throws Exception {
        List<EbookFile> ebookFiles = new ArrayList<>();
        EbookFile ebookFile = new EbookFile();
        ebookFile.setId("123");
        ebookFiles.add(ebookFile);
        when(ebookFileManipulationService.listEbookFilesOfAuthenticatedUser()).thenReturn(ebookFiles);

        mockMvc.perform(get("/ebook-file"))
                .andExpect(status().isOk());

        verify(ebookFileManipulationService, times(1)).listEbookFilesOfAuthenticatedUser();
    }

    @Test
    public void test_getUrlToDownloadFile() throws Exception {
        when(ebookFileManipulationService.getDownloadUrlForEbookFile("123", "pdf", ContentDispositionType.ATTACHMENT)).thenReturn("url");

        mockMvc.perform(get("/ebook-file/{ebookFileId}/{ebookFileFormat}", "123", "pdf")
                        .param("fileType", "pdf")
                        .param("contentDispositionType", ContentDispositionType.ATTACHMENT.name()))
                .andExpect(status().isOk());

        verify(ebookFileManipulationService, times(1)).getDownloadUrlForEbookFile(anyString(), anyString(), any(ContentDispositionType.class));
    }

    @Test
    public void test_deleteEbookFileFormat() throws Exception {
        mockMvc.perform(delete("/ebook-file/{ebookFileId}/{fileType}", "123", "pdf"))
                .andExpect(status().isNoContent());

        verify(ebookFileManipulationService, times(1)).deleteEbookFileFormat(anyString(), anyString());
    }

    @Test
    public void test_importEbookFromFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", MediaType.APPLICATION_PDF_VALUE, "PDF content".getBytes());
        EbookFile ebookFile = new EbookFile();
        ebookFile.setId("123");
        when(ebookFileManipulationService.importEbookFile(any())).thenReturn(ebookFile);

        mockMvc.perform(multipart("/ebook-file").file(file))
                .andExpect(status().isCreated());

        verify(ebookFileManipulationService, times(1)).importEbookFile(any());
    }

    @Test
    public void test_getCoverImageUrl() throws Exception {
        when(ebookFileManipulationService.getCoverImageUrl("123"))
                .thenReturn("https://example.com/image.jpg");

        mockMvc.perform(get("/ebook-file/{ebookFileId}/cover-image", "123"))
                .andExpect(status().isOk());

        verify(ebookFileManipulationService, times(1)).getCoverImageUrl(anyString());
    }

    @Test
    public void test_updateEbookFileCoverImage() throws Exception {
        EbookFile request = new EbookFile();
        when(ebookFileManipulationService.updateEbookFileCoverImage(anyString(), any())).thenReturn(request);

        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "JPG content".getBytes());
        EbookFile response = ebookFileController.updateEbookFileCoverImage(file, "123");

        assertThat(request).isEqualTo(response);
    }

    @Test
    public void test_deleteEbookFileCoverImage() throws Exception {
        mockMvc.perform(delete("/ebook-file/{ebookFileId}/cover-image", "123"))
                .andExpect(status().isNoContent());

        verify(ebookFileManipulationService, times(1)).deleteEbookFileCoverImage(anyString());
    }

    @Test
    public void test_deleteEbookFile() throws Exception {
        mockMvc.perform(delete("/ebook-file/{ebookFileId}", "123"))
                .andExpect(status().isNoContent());

        verify(ebookFileManipulationService, times(1)).deleteEbookFile(anyString());
    }

    @Test
    public void test_updateEbookFile() throws Exception {
        EbookFile ebookFile = new EbookFile();
        ebookFile.setId("123");
        when(ebookFileManipulationService.updateEbookFile(anyString(), any())).thenReturn(ebookFile);

        mockMvc.perform(put("/ebook-file/{ebookFileId}", "123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"123\",\"name\":\"Test Ebook\",\"description\":\"Test Description\"}"))
                .andExpect(status().isOk());

        verify(ebookFileManipulationService, times(1)).updateEbookFile(anyString(), any());
    }
}