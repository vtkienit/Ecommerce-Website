package com.ecommerce.app;

import com.ecommerce.app.entities.User;
import com.ecommerce.app.repositories.PasswordResetStore;
import com.ecommerce.app.repositories.UserRepository;
import com.ecommerce.app.services.GoogleIdentityService;
import com.ecommerce.app.services.PasswordResetEmailService;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PasswordResetFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @MockitoBean
    private GoogleIdentityService googleIdentityService;

    @MockitoBean
    private PasswordResetStore resetStore;

    @MockitoBean
    private PasswordResetEmailService emailService;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        when(emailService.isConfigured()).thenReturn(true);
        when(resetStore.allowRequest(anyString())).thenReturn(true);
    }

    @Test
    void resetFlowChangesThePasswordAfterEmailCodeVerification() throws Exception {
        registerUser();
        User user = userRepository.findByEmailIgnoreCase("reset@example.com").orElseThrow();

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"reset@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expiresInSeconds").value(300))
                .andExpect(jsonPath("$.maxAttempts").value(5));

        ArgumentCaptor<String> codeCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> codeHashCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendCode(eq("reset@example.com"), codeCaptor.capture());
        verify(resetStore).saveCode(eq(user.getId()), codeHashCaptor.capture());

        String code = codeCaptor.getValue();
        when(resetStore.getCodeHash(user.getId())).thenReturn(codeHashCaptor.getValue());
        when(resetStore.incrementAttempts(user.getId())).thenReturn(1L);

        String verifyResponse = mockMvc.perform(post("/api/auth/verify-reset-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "reset@example.com",
                                  "code": "%s"
                                }
                                """.formatted(code)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resetToken").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String resetToken = JsonPath.read(verifyResponse, "$.resetToken");
        verify(resetStore).saveResetToken(anyString(), eq(user.getId()));
        when(resetStore.consumeResetToken(anyString())).thenReturn(user.getId());

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "resetToken": "%s",
                                  "newPassword": "new-password-123",
                                  "confirmPassword": "new-password-123"
                                }
                                """.formatted(resetToken)))
                .andExpect(status().isNoContent());

        login("old-password-123")
                .andExpect(status().isUnauthorized());

        login("new-password-123")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("reset@example.com"));
    }

    @Test
    void forgotPasswordRejectsAnUnknownEmail() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"missing@example.com\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Email does not exist"));

        verify(emailService, never()).sendCode(anyString(), anyString());
        verify(resetStore, never()).allowRequest(anyString());
        verify(resetStore, never()).saveCode(anyLong(), anyString());
    }

    @Test
    void wrongResetCodeReturnsTheRemainingAttempts() throws Exception {
        registerUser();
        User user = userRepository.findByEmailIgnoreCase("reset@example.com").orElseThrow();
        when(resetStore.getCodeHash(user.getId())).thenReturn("another-code-hash");
        when(resetStore.incrementAttempts(user.getId())).thenReturn(1L);

        mockMvc.perform(post("/api/auth/verify-reset-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "reset@example.com",
                                  "code": "123456"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired reset code"))
                .andExpect(jsonPath("$.remainingAttempts").value(4));

        verify(resetStore, never()).deleteCode(user.getId());
    }

    @Test
    void resetPasswordRejectsAMismatchedConfirmationBeforeUsingTheToken() throws Exception {
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "resetToken": "temporary-reset-token",
                                  "newPassword": "new-password-123",
                                  "confirmPassword": "different-password"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password confirmation does not match"));

        verify(resetStore, never()).consumeResetToken(anyString());
    }

    private void registerUser() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Reset User",
                                  "email": "reset@example.com",
                                  "password": "old-password-123"
                                }
                                """))
                .andExpect(status().isCreated());
    }

    private org.springframework.test.web.servlet.ResultActions login(String password) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email": "reset@example.com",
                          "password": "%s"
                        }
                        """.formatted(password)));
    }
}
