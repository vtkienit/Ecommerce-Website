package com.ecommerce.catalog.services;

import com.ecommerce.catalog.exceptions.CatalogException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class SupabaseStorageServiceTests {

    private static final String SUPABASE_URL = "https://project.supabase.co";
    private static final String SECRET_KEY = "sb_secret_test";

    @Test
    void uploadCreatesPublicBucketAndReturnsPublicUrl() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        SupabaseStorageService storageService = new SupabaseStorageService(
                builder,
                SUPABASE_URL,
                SECRET_KEY,
                "product-images",
                5 * 1024 * 1024
        );

        server.expect(once(), requestTo(SUPABASE_URL + "/storage/v1/bucket/product-images"))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header("apikey", SECRET_KEY))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));
        server.expect(once(), requestTo(SUPABASE_URL + "/storage/v1/bucket"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        server.expect(once(), request -> assertTrue(
                        request.getURI().toString().startsWith(
                                SUPABASE_URL + "/storage/v1/object/product-images/products/42/"
                        )
                ))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("apikey", SECRET_KEY))
                .andExpect(header("Authorization", "Bearer " + SECRET_KEY))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));

        String imageUrl = storageService.uploadProductImage(
                42L,
                new MockMultipartFile(
                        "primaryImage",
                        "main.jpg",
                        MediaType.IMAGE_JPEG_VALUE,
                        "image".getBytes(StandardCharsets.UTF_8)
                )
        );

        assertTrue(imageUrl.startsWith(
                SUPABASE_URL + "/storage/v1/object/public/product-images/products/42/"
        ));
        assertTrue(imageUrl.endsWith(".jpg"));
        server.verify();
    }

    @Test
    void uploadRejectsUnsupportedFilesBeforeCallingStorage() {
        SupabaseStorageService storageService = new SupabaseStorageService(
                RestClient.builder(),
                SUPABASE_URL,
                SECRET_KEY,
                "product-images",
                5 * 1024 * 1024
        );

        CatalogException exception = assertThrows(
                CatalogException.class,
                () -> storageService.uploadProductImage(
                        42L,
                        new MockMultipartFile(
                                "primaryImage",
                                "document.pdf",
                                MediaType.APPLICATION_PDF_VALUE,
                                "file".getBytes(StandardCharsets.UTF_8)
                        )
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Only JPG, PNG and WEBP images are supported", exception.getMessage());
    }
}
