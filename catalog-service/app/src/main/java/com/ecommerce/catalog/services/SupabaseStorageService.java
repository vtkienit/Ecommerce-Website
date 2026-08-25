package com.ecommerce.catalog.services;

import com.ecommerce.catalog.exceptions.CatalogException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp"
    );

    private final RestClient restClient;
    private final String supabaseUrl;
    private final String secretKey;
    private final String bucket;
    private final long maxFileSize;
    private volatile boolean bucketReady;

    @Autowired
    public SupabaseStorageService(
            @Value("${supabase.storage.url:}") String supabaseUrl,
            @Value("${supabase.storage.secret-key:}") String secretKey,
            @Value("${supabase.storage.bucket:product-images}") String bucket,
            @Value("${supabase.storage.max-file-size-bytes:5242880}") long maxFileSize
    ) {
        this(RestClient.builder(), supabaseUrl, secretKey, bucket, maxFileSize);
    }

    SupabaseStorageService(
            RestClient.Builder restClientBuilder,
            String supabaseUrl,
            String secretKey,
            String bucket,
            long maxFileSize
    ) {
        this.supabaseUrl = stripTrailingSlash(supabaseUrl.trim());
        this.secretKey = secretKey.trim();
        this.bucket = bucket.trim();
        this.maxFileSize = maxFileSize;
        this.restClient = restClientBuilder
                .baseUrl(this.supabaseUrl + "/storage/v1")
                .build();
    }

    public String uploadProductImage(Long productId, MultipartFile file) {
        requireConfiguration();
        validate(file);
        ensurePublicBucket();

        String path = "products/" + productId + "/" + UUID.randomUUID() + extension(file.getContentType());
        try {
            restClient
                    .post()
                    .uri(objectUri(path))
                    .header("apikey", secretKey)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + secretKey)
                    .header("x-upsert", "false")
                    .header(HttpHeaders.CACHE_CONTROL, "3600")
                    .contentType(MediaType.parseMediaType(file.getContentType()))
                    .body(file.getBytes())
                    .retrieve()
                    .toBodilessEntity();
        } catch (IOException exception) {
            throw new CatalogException("Could not read the selected image", HttpStatus.BAD_REQUEST);
        } catch (RestClientResponseException exception) {
            throw storageError("Could not upload the image", exception);
        }

        return publicUrl(path);
    }

    public void deleteByUrl(String imageUrl) {
        String path = managedPath(imageUrl);
        if (path == null) {
            return;
        }

        try {
            restClient
                    .delete()
                    .uri(objectUri(path))
                    .header("apikey", secretKey)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + secretKey)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().value() != HttpStatus.NOT_FOUND.value()) {
                throw storageError("Could not delete the stored image", exception);
            }
        }
    }

    public void deleteUploadedFiles(List<String> imageUrls) {
        for (String imageUrl : imageUrls) {
            try {
                deleteByUrl(imageUrl);
            } catch (CatalogException ignored) {
                // Preserve the original upload or database error.
            }
        }
    }

    private synchronized void ensurePublicBucket() {
        if (bucketReady) {
            return;
        }

        try {
            restClient
                    .get()
                    .uri("/bucket/{bucket}", bucket)
                    .header("apikey", secretKey)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + secretKey)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().value() != HttpStatus.NOT_FOUND.value()) {
                throw storageError("Could not access the image bucket", exception);
            }
            createPublicBucket();
        }

        bucketReady = true;
    }

    private void createPublicBucket() {
        try {
            restClient
                    .post()
                    .uri("/bucket")
                    .header("apikey", secretKey)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + secretKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "id", bucket,
                            "name", bucket,
                            "public", true,
                            "file_size_limit", maxFileSize,
                            "allowed_mime_types", ALLOWED_TYPES
                    ))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException exception) {
            throw storageError("Could not create the image bucket", exception);
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CatalogException("Please select an image", HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > maxFileSize) {
            throw new CatalogException("Each image must not exceed 5 MB", HttpStatus.BAD_REQUEST);
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new CatalogException("Only JPG, PNG and WEBP images are supported", HttpStatus.BAD_REQUEST);
        }
    }

    private void requireConfiguration() {
        if (supabaseUrl.isBlank() || secretKey.isBlank()) {
            throw new CatalogException(
                    "Supabase Storage is not configured",
                    HttpStatus.SERVICE_UNAVAILABLE
            );
        }
    }

    private String managedPath(String imageUrl) {
        if (imageUrl == null || supabaseUrl.isBlank() || secretKey.isBlank()) {
            return null;
        }

        String prefix = publicUrl("");
        return imageUrl.startsWith(prefix) ? imageUrl.substring(prefix.length()) : null;
    }

    private URI objectUri(String path) {
        return URI.create(supabaseUrl + "/storage/v1/object/" + bucket + "/" + path);
    }

    private String publicUrl(String path) {
        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + path;
    }

    private String extension(String contentType) {
        return switch (contentType) {
            case MediaType.IMAGE_JPEG_VALUE -> ".jpg";
            case MediaType.IMAGE_PNG_VALUE -> ".png";
            case "image/webp" -> ".webp";
            default -> "";
        };
    }

    private CatalogException storageError(String message, RestClientResponseException exception) {
        HttpStatus status = exception.getStatusCode().is4xxClientError()
                ? HttpStatus.BAD_GATEWAY
                : HttpStatus.SERVICE_UNAVAILABLE;
        return new CatalogException(message, status);
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
