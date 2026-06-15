package com.interviewflow.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewflow.auth.dto.AuthResponse;
import com.interviewflow.auth.dto.RegisterRequest;
import com.interviewflow.application.dto.*;
import com.interviewflow.common.AbstractIntegrationTest;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Opportunity Workflow Integration Tests")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class OpportunityWorkflowIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    static String accessToken;
    static String otherUserToken;
    static UUID opportunityId;

    @BeforeAll
    static void registerUsers(@Autowired MockMvc mvc, @Autowired ObjectMapper mapper) throws Exception {
        // Primary user
        MvcResult result = mvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(
                                new RegisterRequest("Workflow User", "workflow@test.com", "TestPass1!"))))
                .andReturn();
        AuthResponse auth = mapper.readValue(
                mapper.readTree(result.getResponse().getContentAsString())
                        .get("data").toString(), AuthResponse.class);
        accessToken = auth.accessToken();

        // Second user
        MvcResult other = mvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(
                                new RegisterRequest("Other User", "other@test.com", "TestPass1!"))))
                .andReturn();
        AuthResponse otherAuth = mapper.readValue(
                mapper.readTree(other.getResponse().getContentAsString())
                        .get("data").toString(), AuthResponse.class);
        otherUserToken = otherAuth.accessToken();
    }

    @Test
    @Order(1)
    @DisplayName("1. Create opportunity → DRAFT status")
    void createOpportunity_returnsDraftStatus() throws Exception {
        var request = new CreateOpportunityRequest(
                "Acme Corp", "Senior Engineer", "US Remote", "Job Board", "$120k", "HIGH", "Great role", null);

        MvcResult result = mockMvc.perform(post("/api/v1/opportunities")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.currentStatus").value("DRAFT"))
                .andExpect(jsonPath("$.data.companyName").value("Acme Corp"))
                .andExpect(jsonPath("$.data.allowedTransitions").isArray())
                .andReturn();

        String id = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("data").get("id").asText();
        opportunityId = UUID.fromString(id);
    }

    @Test
    @Order(2)
    @DisplayName("2. Apply → APPLIED status + applicationDate set")
    void apply_transitionsToApplied() throws Exception {
        mockMvc.perform(post("/api/v1/opportunities/" + opportunityId + "/apply")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentStatus").value("APPLIED"))
                .andExpect(jsonPath("$.data.applicationDate").isNotEmpty());
    }

    @Test
    @Order(3)
    @DisplayName("3. Invalid transition: APPLIED → ASSESSMENT_COMPLETED → 409 Conflict")
    void invalidTransition_returns409() throws Exception {
        mockMvc.perform(post("/api/v1/opportunities/" + opportunityId + "/complete-assessment")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("INVALID_STATE_TRANSITION"));
    }

    @Test
    @Order(4)
    @DisplayName("4. Receive assessment → ASSESSMENT_RECEIVED")
    void receiveAssessment_transitionsToAssessmentReceived() throws Exception {
        var request = new ReceiveAssessmentRequest(Instant.now().plus(2, ChronoUnit.DAYS));
        mockMvc.perform(post("/api/v1/opportunities/" + opportunityId + "/receive-assessment")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentStatus").value("ASSESSMENT_RECEIVED"));
    }

    @Test
    @Order(5)
    @DisplayName("5. Complete assessment → ASSESSMENT_COMPLETED")
    void completeAssessment_transitionsToAssessmentCompleted() throws Exception {
        mockMvc.perform(post("/api/v1/opportunities/" + opportunityId + "/complete-assessment")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentStatus").value("ASSESSMENT_COMPLETED"));
    }

    @Test
    @Order(6)
    @DisplayName("6. Schedule interview → INTERVIEW_SCHEDULED")
    void scheduleInterview_transitionsToInterviewScheduled() throws Exception {
        var request = new ScheduleInterviewRequest(
                Instant.now().plus(1, ChronoUnit.DAYS), "Jane Doe", "Zoom", 45, "Tech screening prep");

        mockMvc.perform(post("/api/v1/opportunities/" + opportunityId + "/schedule-interview")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentStatus").value("INTERVIEW_SCHEDULED"));
    }

    @Test
    @Order(7)
    @DisplayName("7. Complete interview → INTERVIEW_COMPLETED")
    void completeInterview_transitionsToInterviewCompleted() throws Exception {
        mockMvc.perform(post("/api/v1/opportunities/" + opportunityId + "/complete-interview")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentStatus").value("INTERVIEW_COMPLETED"));
    }

    @Test
    @Order(8)
    @DisplayName("8. Receive offer → OFFER_RECEIVED")
    void receiveOffer_transitionsToOfferReceived() throws Exception {
        var request = new ReceiveOfferRequest("$130k", Instant.now().plus(5, ChronoUnit.DAYS));
        mockMvc.perform(post("/api/v1/opportunities/" + opportunityId + "/receive-offer")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentStatus").value("OFFER_RECEIVED"))
                .andExpect(jsonPath("$.data.salary").value("$130k"));
    }

    @Test
    @Order(9)
    @DisplayName("9. Accept offer → ACCEPTED (terminal success)")
    void acceptOffer_transitionsToAccepted() throws Exception {
        mockMvc.perform(post("/api/v1/opportunities/" + opportunityId + "/accept")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentStatus").value("ACCEPTED"))
                .andExpect(jsonPath("$.data.allowedTransitions").isEmpty());
    }

    @Test
    @Order(10)
    @DisplayName("10. Terminal state: further transitions blocked → 409")
    void terminalState_noFurtherTransitions() throws Exception {
        mockMvc.perform(post("/api/v1/opportunities/" + opportunityId + "/reject")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isConflict());
    }

    @Test
    @Order(11)
    @DisplayName("11. Ownership violation: other user cannot access this opportunity → 404")
    void ownershipViolation_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/opportunities/" + opportunityId)
                        .header("Authorization", "Bearer " + otherUserToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(12)
    @DisplayName("12. Unauthenticated request → 401")
    void unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/opportunities"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(13)
    @DisplayName("13. Audit trail written — at least 8 entries for this opportunity")
    void auditTrail_hasEntries() throws Exception {
        mockMvc.perform(get("/api/v1/audit/opportunities/" + opportunityId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(greaterThanOrEqualTo(8)));
    }

    @Test
    @Order(14)
    @DisplayName("14. Timeline journey feed contains creation and transition events")
    void timelineFeed_hasEvents() throws Exception {
        mockMvc.perform(get("/api/v1/opportunities/" + opportunityId + "/timeline")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.data[?(@.eventType == 'OPPORTUNITY_CREATED')]").exists())
                .andExpect(jsonPath("$.data[?(@.eventType == 'APPLIED')]").exists());
    }
}
