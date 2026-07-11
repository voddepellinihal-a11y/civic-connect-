package com.jalalert.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jalalert.dto.ComplaintRequestDTO;
import com.jalalert.dto.StatusUpdateDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ComplaintRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateComplaint() throws Exception {
        ComplaintRequestDTO request = ComplaintRequestDTO.builder()
                .title("Broken Streetlight")
                .description("Street light not working on Main St")
                .category("Electricity")
                .latitude(40.7128)
                .longitude(-74.0060)
                .build();

        mockMvc.perform(post("/api/complaints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Broken Streetlight"))
                .andExpect(jsonPath("$.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.category").value("Electricity"))
                .andExpect(jsonPath("$.id").isNotEmpty());
    }

    @Test
    void shouldRejectBlankTitle() throws Exception {
        ComplaintRequestDTO request = ComplaintRequestDTO.builder()
                .title("")
                .description("Some description")
                .build();

        mockMvc.perform(post("/api/complaints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldGetAllComplaints() throws Exception {
        createTestComplaint("Pothole", "Big pothole on road", "Road");

        mockMvc.perform(get("/api/complaints"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("Pothole"));
    }

    @Test
    void shouldGetComplaintById() throws Exception {
        Long id = createAndExtractId("Noise", "Loud music at night", "Safety");

        mockMvc.perform(get("/api/complaints/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Noise"))
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    void shouldReturnErrorForNonExistentComplaint() throws Exception {
        mockMvc.perform(get("/api/complaints/9999"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("Complaint not found with id: 9999"));
    }

    @Test
    void shouldUpdateComplaintStatus() throws Exception {
        Long id = createAndExtractId("Garbage", "Garbage not collected", "Sanitation");

        StatusUpdateDTO statusUpdate = StatusUpdateDTO.builder()
                .status("IN_PROGRESS")
                .notes("Assigned to team")
                .build();

        mockMvc.perform(put("/api/complaints/" + id + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    void shouldRejectInvalidStatus() throws Exception {
        Long id = createAndExtractId("Test", "Test desc", "Other");

        StatusUpdateDTO statusUpdate = StatusUpdateDTO.builder()
                .status("INVALID")
                .build();

        mockMvc.perform(put("/api/complaints/" + id + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldDetectEmergencyKeyword() throws Exception {
        ComplaintRequestDTO request = ComplaintRequestDTO.builder()
                .title("Gas Leak!")
                .description("There is a gas leak near the school")
                .category("Safety")
                .build();

        mockMvc.perform(post("/api/complaints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.priority").value("URGENT"));
    }

    @Test
    void shouldGetAnalytics() throws Exception {
        createTestComplaint("Road", "Pothole on highway", "Transport");
        createTestComplaint("Fire", "Fire in building", "Safety");

        mockMvc.perform(get("/api/analytics/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalComplaints").isNumber())
                .andExpect(jsonPath("$.countByCategory").exists())
                .andExpect(jsonPath("$.countByStatus").exists());
    }

    private Long createAndExtractId(String title, String description, String category) throws Exception {
        MvcResult result = createTestComplaint(title, description, category);
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("id").asLong();
    }

    private MvcResult createTestComplaint(String title, String description, String category) throws Exception {
        ComplaintRequestDTO request = ComplaintRequestDTO.builder()
                .title(title)
                .description(description)
                .category(category)
                .build();

        return mockMvc.perform(post("/api/complaints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
    }
}
