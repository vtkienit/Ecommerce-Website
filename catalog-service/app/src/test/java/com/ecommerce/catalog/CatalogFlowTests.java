package com.ecommerce.catalog;

import com.ecommerce.catalog.entities.*;
import com.ecommerce.catalog.repositories.FlashSaleRepository;
import com.ecommerce.catalog.repositories.ProductCategoryRepository;
import com.ecommerce.catalog.repositories.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CatalogFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCategoryRepository categoryRepository;

    @Autowired
    private FlashSaleRepository flashSaleRepository;

    private Product cloudMattress;

    @BeforeEach
    void prepareCatalog() {
        flashSaleRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        ProductCategory mattress = createCategory("Mattress", "mattress");
        ProductCategory pillows = createCategory("Pillows", "pillows");
        categoryRepository.save(mattress);
        categoryRepository.save(pillows);

        cloudMattress = createProduct(
                mattress,
                "Cloud Mattress",
                "cloud-mattress",
                "Cloud sleep support",
                "cloud.jpg"
        );
        addVariant(cloudMattress, "CLOUD-WHITE", "160 x 200", "8", "white", "1000000");
        addVariant(cloudMattress, "CLOUD-GRAY", "180 x 200", "10", "gray", "1200000");
        productRepository.save(cloudMattress);

        Product latexMattress = createProduct(
                mattress,
                "Natural Latex Mattress",
                "natural-latex-mattress",
                "Natural latex comfort",
                "latex.jpg"
        );
        addVariant(latexMattress, "LATEX-BEIGE", "180 x 200", "10", "beige", "2000000");
        productRepository.save(latexMattress);

        Product pillow = createProduct(
                pillows,
                "Bamboo Pillow",
                "bamboo-pillow",
                "Cooling bamboo pillow",
                "pillow.jpg"
        );
        addVariant(pillow, "PILLOW-WHITE", "40 x 60", null, "white", "400000");
        productRepository.save(pillow);

        createFlashSale(cloudMattress);
    }

    @Test
    void categoriesIncludeTheirProductCounts() throws Exception {
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("mattress"))
                .andExpect(jsonPath("$[0].productCount").value(2))
                .andExpect(jsonPath("$[1].slug").value("pillows"))
                .andExpect(jsonPath("$[1].productCount").value(1));
    }

    @Test
    void productsSupportCategorySearchFiltersAndSalePricing() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("category", "mattress")
                        .param("search", "cloud")
                        .param("variantSize", "160 x 200")
                        .param("color", "white")
                        .param("minPrice", "900000")
                        .param("maxPrice", "1100000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].slug").value("cloud-mattress"))
                .andExpect(jsonPath("$.content[0].price").value(750000.00))
                .andExpect(jsonPath("$.content[0].originalPrice").value(1000000.00))
                .andExpect(jsonPath("$.content[0].discountPercentage").value(25));
    }

    @Test
    void productsCanBeSortedByTheirLowestVariantPrice() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("category", "mattress")
                        .param("sort", "price,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].slug").value("natural-latex-mattress"))
                .andExpect(jsonPath("$.content[1].slug").value("cloud-mattress"));
    }

    @Test
    void productDetailContainsVariantsImagesAndRelatedProducts() throws Exception {
        mockMvc.perform(get("/api/products/cloud-mattress"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Cloud Mattress"))
                .andExpect(jsonPath("$.images[0].imageUrl").value("cloud.jpg"))
                .andExpect(jsonPath("$.variants.length()").value(2))
                .andExpect(jsonPath("$.variants[0].price").value(750000.00))
                .andExpect(jsonPath("$.relatedProducts[0].slug").value("natural-latex-mattress"));

        mockMvc.perform(get("/api/products/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Product not found"));
    }

    @Test
    void currentFlashSaleReturnsDiscountedProducts() throws Exception {
        mockMvc.perform(get("/api/flash-sales/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Flash Sale"))
                .andExpect(jsonPath("$.products[0].slug").value("cloud-mattress"))
                .andExpect(jsonPath("$.products[0].discountPercentage").value(25));
    }

    @Test
    void variantEndpointReturnsCommerceSnapshot() throws Exception {
        Long variantId = cloudMattress.getVariants().getFirst().getId();

        mockMvc.perform(get("/api/variants/{id}", variantId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productSlug").value("cloud-mattress"))
                .andExpect(jsonPath("$.productName").value("Cloud Mattress"))
                .andExpect(jsonPath("$.sku").value("CLOUD-WHITE"))
                .andExpect(jsonPath("$.price").value(750000.00));

        mockMvc.perform(get("/api/variants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[0].id").isNumber());
    }

    private ProductCategory createCategory(String name, String slug) {
        ProductCategory category = new ProductCategory();
        category.setName(name);
        category.setSlug(slug);
        return category;
    }

    private Product createProduct(
            ProductCategory category,
            String name,
            String slug,
            String description,
            String imageUrl
    ) {
        Product product = new Product();
        product.setProductCategory(category);
        product.setName(name);
        product.setSlug(slug);
        product.setBrand("QuyDung");
        product.setDescription(description);

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(imageUrl);
        image.setPrimaryImage(true);
        product.getImages().add(image);

        return product;
    }

    private void addVariant(
            Product product,
            String sku,
            String size,
            String thickness,
            String color,
            String price
    ) {
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSku(sku);
        variant.setSize(size);
        variant.setThickness(thickness);
        variant.setColor(color);
        variant.setPrice(new BigDecimal(price));
        product.getVariants().add(variant);
    }

    private void createFlashSale(Product product) {
        FlashSale flashSale = new FlashSale();
        flashSale.setName("Test Flash Sale");
        flashSale.setStartDate(LocalDateTime.now().minusHours(1));
        flashSale.setEndDate(LocalDateTime.now().plusHours(1));

        FlashSaleItem item = new FlashSaleItem();
        item.setFlashSale(flashSale);
        item.setProductVariant(product.getVariants().getFirst());
        item.setDiscountType(DiscountType.PERCENTAGE);
        item.setDiscountValue(new BigDecimal("25"));
        flashSale.getItems().add(item);

        flashSaleRepository.save(flashSale);
    }
}
