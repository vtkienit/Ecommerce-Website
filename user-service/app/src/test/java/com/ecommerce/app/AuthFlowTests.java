package com.ecommerce.app;

import com.ecommerce.app.repositories.UserRepository;
import com.ecommerce.app.repositories.RefreshTokenStore;
import com.ecommerce.app.services.GoogleIdentityService;
import com.ecommerce.app.dtos.GoogleUserInfo;
import com.ecommerce.app.dtos.RefreshTokenData;
import com.ecommerce.app.services.RefreshTokenCookieService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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

    @MockitoBean
    private RefreshTokenStore refreshTokenStore;

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
                                  "password": "password123",
                                  "rememberMe": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.newUser").value(true))
                .andExpect(jsonPath("$.user.email").value("user@example.com"))
                .andExpect(header().string(
                        HttpHeaders.SET_COOKIE,
                        containsString("HttpOnly; SameSite=Lax")
                ))
                .andExpect(header().string(
                        HttpHeaders.SET_COOKIE,
                        containsString("Max-Age=2592000")
                ));

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
    void refreshTokenIsRotatedAndCanBeRevoked() throws Exception {
        String registerCookie = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Refresh User",
                                  "email": "refresh@example.com",
                                  "password": "password123",
                                  "rememberMe": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader(HttpHeaders.SET_COOKIE);

        String refreshToken = cookieValue(registerCookie);
        Long userId = userRepository.findByEmailIgnoreCase("refresh@example.com").orElseThrow().getId();
        when(refreshTokenStore.consume(anyString()))
                .thenReturn(new RefreshTokenData(userId, true), (RefreshTokenData) null);

        String refreshCookie = mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(RefreshTokenCookieService.COOKIE_NAME, refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andReturn()
                .getResponse()
                .getHeader(HttpHeaders.SET_COOKIE);

        String rotatedToken = cookieValue(refreshCookie);
        org.assertj.core.api.Assertions.assertThat(rotatedToken).isNotEqualTo(refreshToken);

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(RefreshTokenCookieService.COOKIE_NAME, refreshToken)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid or expired refresh token"));

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(new Cookie(RefreshTokenCookieService.COOKIE_NAME, rotatedToken)))
                .andExpect(status().isNoContent())
                .andExpect(header().string(
                        HttpHeaders.SET_COOKIE,
                        containsString("Max-Age=0")
                ));

        verify(refreshTokenStore).delete(anyString());
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
    void loginWithoutRememberMeCreatesASessionCookie() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Session User",
                                  "email": "session@example.com",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "session@example.com",
                                  "password": "password123",
                                  "rememberMe": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("HttpOnly")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, not(containsString("Max-Age="))));
    }

    @Test
    void refreshWithoutCookieIsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid or expired refresh token"));
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
                        .content("""
                                {
                                  "addressLine": "123 Nguyen Trai",
                                  "provinceCode": 1,
                                  "provinceName": "Thanh pho Ha Noi",
                                  "wardCode": 4,
                                  "wardName": "Phuong Ba Dinh"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.address").value("123 Nguyen Trai, Phuong Ba Dinh, Thanh pho Ha Noi"))
                .andExpect(jsonPath("$.addressLine").value("123 Nguyen Trai"))
                .andExpect(jsonPath("$.provinceCode").value(1))
                .andExpect(jsonPath("$.wardCode").value(4));
    }

    private String cookieValue(String setCookieHeader) {
        org.assertj.core.api.Assertions.assertThat(setCookieHeader).isNotBlank();
        return setCookieHeader.substring(
                setCookieHeader.indexOf('=') + 1,
                setCookieHeader.indexOf(';')
        );
    }
}
