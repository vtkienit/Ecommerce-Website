package com.ecommerce.app;

import com.ecommerce.app.repositories.UserRepository;
import com.ecommerce.app.services.GoogleIdentityService;
import com.ecommerce.app.dtos.GoogleUserInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @MockitoBean
    private GoogleIdentityService googleIdentityService;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    @Test
    void registerThenLoginReturnsTheSameUserAndAJwt() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Quy Dung",
                                  "email": "USER@example.com",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.newUser").value(true))
                .andExpect(jsonPath("$.user.email").value("user@example.com"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "user@example.com",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.newUser").value(false))
                .andExpect(jsonPath("$.user.name").value("Quy Dung"));
    }

    @Test
    void googleEndpointCreatesOnceThenLogsInTheExistingUser() throws Exception {
        when(googleIdentityService.verify(anyString()))
                .thenReturn(new GoogleUserInfo("google-subject-123", "google@example.com", "Google User"));

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"credential\":\"valid-google-id-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.newUser").value(true))
                .andExpect(jsonPath("$.user.email").value("google@example.com"));

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"credential\":\"valid-google-id-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.newUser").value(false))
                .andExpect(jsonPath("$.user.email").value("google@example.com"));

        org.assertj.core.api.Assertions.assertThat(userRepository.count()).isEqualTo(1);
    }

    @Test
    void googleEndpointLinksAnExistingPasswordAccountByVerifiedEmail() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Existing User",
                                  "email": "existing@example.com",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isCreated());

        when(googleIdentityService.verify(anyString()))
                .thenReturn(new GoogleUserInfo(
                        "google-subject-existing",
                        "existing@example.com",
                        "Existing User"
                ));

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"credential\":\"valid-google-id-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.newUser").value(false))
                .andExpect(jsonPath("$.user.email").value("existing@example.com"));

        org.assertj.core.api.Assertions.assertThat(userRepository.count()).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(
                userRepository.findByEmailIgnoreCase("existing@example.com")
                        .orElseThrow()
                        .getGoogleSubject()
        ).isEqualTo("google-subject-existing");
    }

    @Test
    void malformedJsonReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{invalid-json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid request body"));
    }

    @Test
    void currentUserComesFromTheAuthenticatedToken() throws Exception {
        String registerResponse = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Current User",
                                  "email": "current@example.com",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String token = com.jayway.jsonpath.JsonPath.read(registerResponse, "$.token");

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Current User"))
                .andExpect(jsonPath("$.email").value("current@example.com"));
    }

    @Test
    void authenticatedUserCanUpdateProfileAndAddress() throws Exception {
        String registerResponse = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Original Name",
                                  "email": "profile@example.com",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String token = com.jayway.jsonpath.JsonPath.read(registerResponse, "$.token");
        String authorization = "Bearer " + token;

        mockMvc.perform(patch("/api/users/me")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Updated Name",
                                  "phone": "+84 912 345 678",
                                  "gender": "MALE",
                                  "dateOfBirth": "2000-01-15"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.phone").value("+84 912 345 678"))
                .andExpect(jsonPath("$.gender").value("MALE"))
                .andExpect(jsonPath("$.dateOfBirth").value("2000-01-15"));

        mockMvc.perform(patch("/api/users/me/address")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"address\":\"123 Nguyen Trai, Ha Noi\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.address").value("123 Nguyen Trai, Ha Noi"));
    }
}
