package com.ecommerce.catalog;

import com.ecommerce.catalog.entities.*;
import com.ecommerce.catalog.repositories.FlashSaleRepository;
import com.ecommerce.catalog.repositories.ProductCategoryRepository;
import com.ecommerce.catalog.repositories.ProductRepository;
import com.ecommerce.catalog.services.SupabaseStorageService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.mock.web.MockMultipartFile;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import javax.crypto.SecretKey;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
class CatalogFlowTests {

    private static final String SECRET = "catalog-test-secret-with-at-least-32-bytes";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCategoryRepository categoryRepository;

    @Autowired
    private FlashSaleRepository flashSaleRepository;

    @MockitoBean
    private SupabaseStorageService storageService;

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
    void productsCanBeSearchedByBrandAndCategory() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("search", "quydung")
                        .param("sort", "relevance,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(3));

        mockMvc.perform(get("/api/products")
                        .param("search", "pillows")
                        .param("sort", "relevance,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].slug").value("bamboo-pillow"));
    }

    @Test
    void productSuggestionsAreRankedAndLimited() throws Exception {
        mockMvc.perform(get("/api/products/search/suggestions")
                        .param("q", "cloud")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("cloud-mattress"))
                .andExpect(jsonPath("$[0].categoryName").value("Mattress"));

        mockMvc.perform(get("/api/products/search/suggestions")
                        .param("q", "quydung")
                        .param("limit", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(get("/api/products/search/suggestions")
                        .param("q", "q")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void productSearchIgnoresVietnameseDiacritics() throws Exception {
        Product vietnameseProduct = createProduct(
                cloudMattress.getProductCategory(),
                "Nệm Mây Êm Ái",
                "nem-may-em-ai",
                "Sản phẩm hỗ trợ tìm kiếm tiếng Việt",
                "nem.jpg"
        );
        vietnameseProduct.setBrand("Giấc Ngủ Việt");
        addVariant(vietnameseProduct, "NEM-VIET", "160 x 200", "8", "white", "350000");
        productRepository.save(vietnameseProduct);

        mockMvc.perform(get("/api/products/search/suggestions")
                        .param("q", "nem may")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("nem-may-em-ai"));

        mockMvc.perform(get("/api/products")
                        .param("search", "giac ngu viet")
                        .param("sort", "relevance,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].slug").value("nem-may-em-ai"));
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
    void productsCanBeLoadedPageByPage() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("page", "0")
                        .param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.last").value(false));

        mockMvc.perform(get("/api/products")
                        .param("page", "1")
                        .param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.last").value(true));
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
                .andExpect(jsonPath("$.remainingSeconds").isNumber())
                .andExpect(jsonPath("$.products[0].slug").value("cloud-mattress"))
                .andExpect(jsonPath("$.products[0].discountPercentage").value(25));
    }

    @Test
    void adminCanManageFlashSales() throws Exception {
        String authorization = "Bearer " + token("Admin");
        LocalDateTime startDate = LocalDateTime.now().plusDays(1).withNano(0);
        LocalDateTime endDate = startDate.plusDays(2);

        String responseBody = mockMvc.perform(post("/api/admin/catalog/flash-sales")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Weekend Flash Sale",
                                  "description":"Selected products",
                                  "startDate":"%s",
                                  "endDate":"%s",
                                  "discountPercentage":20,
                                  "productIds":[%d]
                                }
                                """.formatted(startDate, endDate, cloudMattress.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Weekend Flash Sale"))
                .andExpect(jsonPath("$.discountPercentage").value(20))
                .andExpect(jsonPath("$.productCount").value(1))
                .andExpect(jsonPath("$.variantCount").value(2))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long flashSaleId = objectMapper.readTree(responseBody).path("id").asLong();

        mockMvc.perform(get("/api/admin/catalog/flash-sales?page=0&size=6")
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));

        mockMvc.perform(post("/api/admin/catalog/flash-sales")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Overlapping Flash Sale",
                                  "startDate":"%s",
                                  "endDate":"%s",
                                  "discountPercentage":10,
                                  "productIds":[%d]
                                }
                                """.formatted(startDate.plusHours(1), endDate.plusHours(1), cloudMattress.getId())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Flash sale period overlaps another campaign"));

        mockMvc.perform(patch("/api/admin/catalog/flash-sales/{id}", flashSaleId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Updated Flash Sale",
                                  "description":"Updated products",
                                  "startDate":"%s",
                                  "endDate":"%s",
                                  "discountPercentage":30,
                                  "productIds":[%d]
                                }
                                """.formatted(startDate, endDate, cloudMattress.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Flash Sale"))
                .andExpect(jsonPath("$.discountPercentage").value(30));

        mockMvc.perform(delete("/api/admin/catalog/flash-sales/{id}", flashSaleId)
                        .header("Authorization", authorization))
                .andExpect(status().isNoContent());
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

    @Test
    void catalogAdministrationRequiresAdminRole() throws Exception {
        mockMvc.perform(get("/api/admin/catalog/products"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/catalog/flash-sales"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/catalog/products")
                        .header("Authorization", "Bearer " + token("Customer")))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/catalog/products?page=0&size=1&search=cloud")
                        .header("Authorization", "Bearer " + token("Admin")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(1))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    void adminCanManageCategoriesProductsVariantsAndImages() throws Exception {
        String authorization = "Bearer " + token("Admin");
        String categoryBody = mockMvc.perform(post("/api/admin/catalog/categories")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Accessories","slug":""}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("accessories"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long categoryId = objectMapper.readTree(categoryBody).path("id").asLong();

        String productBody = mockMvc.perform(post("/api/admin/catalog/products")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "categoryId":%d,
                                  "name":"Cotton Blanket",
                                  "slug":"",
                                  "brand":"QuyDung",
                                  "description":"Soft cotton blanket"
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("cotton-blanket"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long productId = objectMapper.readTree(productBody).path("id").asLong();

        String variantBody = mockMvc.perform(post("/api/admin/catalog/products/{id}/variants", productId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "sku":" blanket-blue ",
                                  "size":"200 x 220",
                                  "color":"Blue",
                                  "price":450000
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.variants[0].sku").value("BLANKET-BLUE"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long variantId = firstId(variantBody, "variants");

        String imageBody = mockMvc.perform(post("/api/admin/catalog/products/{id}/images", productId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"imageUrl":"blanket.jpg","primary":false}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.images[0].primary").value(true))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long imageId = firstId(imageBody, "images");

        mockMvc.perform(patch("/api/admin/catalog/products/{id}", productId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "categoryId":%d,
                                  "name":"Premium Cotton Blanket",
                                  "slug":"premium-cotton-blanket",
                                  "brand":"QuyDung",
                                  "description":"Updated"
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Premium Cotton Blanket"));

        mockMvc.perform(patch("/api/admin/catalog/variants/{id}", variantId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"sku":"BLANKET-BLUE","size":"220 x 240","color":"Blue","price":470000}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.variants[0].price").value(470000));

        mockMvc.perform(patch("/api/admin/catalog/images/{id}", imageId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"imageUrl":"blanket-updated.jpg","primary":true}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.images[0].imageUrl").value("blanket-updated.jpg"));

        mockMvc.perform(delete("/api/admin/catalog/images/{id}", imageId)
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.images.length()").value(0));
        mockMvc.perform(delete("/api/admin/catalog/variants/{id}", variantId)
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.variants.length()").value(0));
        mockMvc.perform(delete("/api/admin/catalog/products/{id}", productId)
                        .header("Authorization", authorization))
                .andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/admin/catalog/categories/{id}", categoryId)
                        .header("Authorization", authorization))
                .andExpect(status().isNoContent());
    }

    @Test
    void adminCanUploadMainAndMultipleSecondaryImages() throws Exception {
        String authorization = "Bearer " + token("Admin");
        MockMultipartFile mainImage = new MockMultipartFile(
                "primaryImage",
                "main.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "main".getBytes(StandardCharsets.UTF_8)
        );
        MockMultipartFile secondaryOne = new MockMultipartFile(
                "secondaryImages",
                "side.png",
                MediaType.IMAGE_PNG_VALUE,
                "side".getBytes(StandardCharsets.UTF_8)
        );
        MockMultipartFile secondaryTwo = new MockMultipartFile(
                "secondaryImages",
                "detail.webp",
                "image/webp",
                "detail".getBytes(StandardCharsets.UTF_8)
        );

        when(storageService.uploadProductImage(anyLong(), any()))
                .thenReturn("https://storage.test/main.jpg")
                .thenReturn("https://storage.test/side.png")
                .thenReturn("https://storage.test/detail.webp");

        mockMvc.perform(multipart(
                        "/api/admin/catalog/products/{id}/images/upload",
                        cloudMattress.getId()
                )
                        .file(mainImage)
                        .file(secondaryOne)
                        .file(secondaryTwo)
                        .header("Authorization", authorization))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.images.length()").value(4))
                .andExpect(jsonPath("$.images[0].imageUrl").value("https://storage.test/main.jpg"))
                .andExpect(jsonPath("$.images[0].primary").value(true));

        verify(storageService, times(3)).uploadProductImage(anyLong(), any());
    }

    @Test
    void imageUploadRequiresAtLeastOneFile() throws Exception {
        mockMvc.perform(multipart(
                        "/api/admin/catalog/products/{id}/images/upload",
                        cloudMattress.getId()
                )
                        .header("Authorization", "Bearer " + token("Admin")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Please select at least one image"));
    }

    @Test
    void adminCatalogRejectsDuplicatesInvalidJsonAndUnsafeDeletes() throws Exception {
        String authorization = "Bearer " + token("Admin");
        long mattressId = cloudMattress.getProductCategory().getId();

        mockMvc.perform(post("/api/admin/catalog/categories")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Another Mattress","slug":"mattress"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Category slug already exists"));

        mockMvc.perform(post("/api/admin/catalog/products")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{invalid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid JSON request"));

        mockMvc.perform(delete("/api/admin/catalog/categories/{id}", mattressId)
                        .header("Authorization", authorization))
                .andExpect(status().isConflict());
    }

    private long firstId(String responseBody, String collection) throws Exception {
        JsonNode body = objectMapper.readTree(responseBody);
        return body.path(collection).get(0).path("id").asLong();
    }

    private String token(String role) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject("admin@example.com")
                .claim("id", 1L)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key)
                .compact();
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
