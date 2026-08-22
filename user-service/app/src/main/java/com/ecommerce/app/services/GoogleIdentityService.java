package com.ecommerce.app.services;

import com.ecommerce.app.dtos.GoogleUserInfo;
import com.ecommerce.app.exceptions.BaseException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Service
public class GoogleIdentityService {

    private final GoogleIdTokenVerifier verifier;

    public GoogleIdentityService(@Value("${google.oauth.client-id:}") String clientId) {
        this.verifier = clientId == null || clientId.isBlank()
                ? null
                : new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(),
                        GsonFactory.getDefaultInstance()
                )
                .setAudience(List.of(clientId.trim()))
                .build();
    }

    public GoogleUserInfo verify(String credential) {
        if (verifier == null) {
            throw new BaseException("Google sign-in is not configured", HttpStatus.SERVICE_UNAVAILABLE);
        }

        try {
            GoogleIdToken idToken = verifier.verify(credential);

            if (idToken == null) {
                throw invalidCredential();
            }

            GoogleIdToken.Payload payload = idToken.getPayload();

            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new BaseException("Google email is not verified", HttpStatus.UNAUTHORIZED);
            }

            String subject = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            if (subject == null || subject.isBlank() || email == null || email.isBlank()) {
                throw invalidCredential();
            }

            return new GoogleUserInfo(subject, email, name);
        } catch (GeneralSecurityException | IOException | IllegalArgumentException exception) {
            throw invalidCredential();
        }
    }

    private BaseException invalidCredential() {
        return new BaseException("Invalid or expired Google credential", HttpStatus.UNAUTHORIZED);
    }
}
