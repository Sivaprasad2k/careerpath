package com.interviewflow.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewflow.auth.dto.AuthResponse;
import com.interviewflow.auth.dto.RegisterRequest;
import com.interviewflow.application.dto.CreateOpportunityRequest;
import com.interviewflow.common.AbstractIntegrationTest;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Notification Integration Tests")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class NotificationIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    static String accessToken;
    static UUID opportunityId;

    @BeforeAll
    static void setup(@Autowired MockMvc mvc, @Autowired ObjectMapper mapper) throws Exception {
        MvcResult reg = mvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(
                                new RegisterRequest("Notif User", "notif@test.com", "TestPass1!"))))
                .andReturn();
        AuthResponse auth = mapper.readValue(
                mapper.readTree(reg.getResponse().getContentAsString())
                        .get("data").toString(), AuthResponse.class);
        accessToken = auth.accessToken();

        MvcResult app = mvc.perform(post("/api/v1/opportunities")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(
                                new CreateOpportunityRequest("NotifCo", "Dev", null, null, null, null, null, null))))
                .andReturn();
        opportunityId = UUID.fromString(mapper.readTree(
                app.getResponse().getContentAsString()).get("data").get("id").asText());
    }

    @Test
    @Order(1)
    @DisplayName("1. Creating an opportunity fires OPPORTUNITY_CREATED notification")
    void createOpportunity_generatesNotification() throws Exception {
        mockMvc.perform(get("/api/v1/notifications")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(greaterThanOrEqualTo(1)));
    }

    @Test
    @Order(2)
    @DisplayName("2. Unread count is positive after opportunity creation")
    void unreadCount_isPositive() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.count").value(greaterThanOrEqualTo(1)));
    }

    @Test
    @Order(3)
    @DisplayName("3. Applying generates an additional OPPORTUNITY_APPLIED notification")
    void apply_generatesAppliedNotification() throws Exception {
        mockMvc.perform(post("/api/v1/opportunities/" + opportunityId + "/apply")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        // Should now have at least 2 notifications (created + applied)
        mockMvc.perform(get("/api/v1/notifications")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(greaterThanOrEqualTo(2)));
    }

    @Test
    @Order(4)
    @DisplayName("4. Mark single notification as read → is_read becomes true")
    void markRead_setsReadTrue() throws Exception {
        MvcResult list = mockMvc.perform(get("/api/v1/notifications")
                        .header("Authorization", "Bearer " + accessToken))
                .andReturn();

        String notifId = objectMapper.readTree(
                        list.getResponse().getContentAsString())
                .get("data").get("content").get(0).get("id").asText();

        mockMvc.perform(patch("/api/v1/notifications/" + notifId + "/read")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.read").value(true));
    }

    @Test
    @Order(5)
    @DisplayName("5. Mark all read → unread count drops to 0")
    void markAllRead_clearsUnreadCount() throws Exception {
        mockMvc.perform(patch("/api/v1/notifications/read-all")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.count").value(0));
    }

    @Test
    @Order(6)
    @DisplayName("6. User cannot read another user's notifications — count is always 0 for new user")
    void notifications_areUserScoped() throws Exception {
        MvcResult newReg = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("Other", "other-notif@test.com", "TestPass1!"))))
                .andReturn();
        String otherToken = objectMapper.readTree(
                        newReg.getResponse().getContentAsString())
                .get("data").get("accessToken").asText();

        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.count").value(0));
    }
}
