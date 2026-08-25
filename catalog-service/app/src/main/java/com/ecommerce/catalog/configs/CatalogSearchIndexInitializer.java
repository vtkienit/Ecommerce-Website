package com.ecommerce.catalog.configs;

import com.ecommerce.catalog.entities.Product;
import com.ecommerce.catalog.entities.ProductCategory;
import com.ecommerce.catalog.repositories.ProductCategoryRepository;
import com.ecommerce.catalog.repositories.ProductRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class CatalogSearchIndexInitializer implements ApplicationRunner {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;

    public CatalogSearchIndexInitializer(
            ProductRepository productRepository,
            ProductCategoryRepository categoryRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        categoryRepository.findAll().stream()
                .filter(ProductCategory::refreshSearchFields)
                .forEach(categoryRepository::save);
        productRepository.findAll().stream()
                .filter(Product::refreshSearchFields)
                .forEach(productRepository::save);
    }
}
