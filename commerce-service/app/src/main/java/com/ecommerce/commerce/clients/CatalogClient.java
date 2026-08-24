package com.ecommerce.commerce.clients;

import com.ecommerce.commerce.dtos.CatalogVariantSnapshot;
import com.ecommerce.commerce.exceptions.CommerceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Arrays;
import java.util.List;

@Component
public class CatalogClient implements CatalogGateway {

    private final RestClient restClient;

    public CatalogClient(@Value("${catalog.service.base-url}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    @Override
    public CatalogVariantSnapshot getVariant(Long variantId) {
        try {
            CatalogVariantSnapshot variant = restClient
                    .get()
                    .uri("/api/variants/{id}", variantId)
                    .retrieve()
                    .body(CatalogVariantSnapshot.class);

            if (variant == null) {
                throw new CommerceException("Catalog returned an empty response", HttpStatus.BAD_GATEWAY);
            }

            return variant;
        } catch (HttpClientErrorException.NotFound exception) {
            throw new CommerceException("Product variant not found", HttpStatus.NOT_FOUND);
        } catch (RestClientException exception) {
            throw new CommerceException("Catalog Service is unavailable", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @Override
    public List<CatalogVariantSnapshot> getVariants() {
        try {
            CatalogVariantSnapshot[] variants = restClient
                    .get()
                    .uri("/api/variants")
                    .retrieve()
                    .body(CatalogVariantSnapshot[].class);
            return variants == null ? List.of() : Arrays.asList(variants);
        } catch (RestClientException exception) {
            throw new CommerceException("Catalog Service is unavailable", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
