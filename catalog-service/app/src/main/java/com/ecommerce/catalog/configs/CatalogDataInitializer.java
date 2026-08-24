package com.ecommerce.catalog.configs;

import com.ecommerce.catalog.entities.*;
import com.ecommerce.catalog.repositories.FlashSaleRepository;
import com.ecommerce.catalog.repositories.ProductCategoryRepository;
import com.ecommerce.catalog.repositories.ProductRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@ConditionalOnProperty(
        name = "catalog.seed.enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class CatalogDataInitializer implements ApplicationRunner {

    private final ProductCategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final FlashSaleRepository flashSaleRepository;

    public CatalogDataInitializer(
            ProductCategoryRepository categoryRepository,
            ProductRepository productRepository,
            FlashSaleRepository flashSaleRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.flashSaleRepository = flashSaleRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        if (productRepository.count() > 0) {
            return;
        }

        ProductCategory mattress = createCategory("Mattress", "mattress");
        ProductCategory beddingSets = createCategory("Bedding Sets", "bedding-sets");
        ProductCategory blankets = createCategory("Blankets", "blankets");
        ProductCategory bedSheets = createCategory("Bed Sheets", "bed-sheets");
        ProductCategory pillows = createCategory("Pillows", "pillows");
        categoryRepository.saveAll(List.of(
                mattress,
                beddingSets,
                blankets,
                bedSheets,
                pillows
        ));

        List<Product> products = new ArrayList<>();
        products.add(createMattress(
                mattress,
                "Cloud Orthopedic Mattress",
                "cloud-orthopedic-mattress",
                "CLOUD",
                "Premium memory foam mattress designed to support the spine and improve sleep quality.",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200",
                new BigDecimal("5290000")
        ));
        products.add(createMattress(
                mattress,
                "Serene Natural Latex Mattress",
                "serene-natural-latex-mattress",
                "SERENE",
                "Responsive natural latex with breathable comfort and long-lasting support.",
                "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=1200",
                new BigDecimal("6890000")
        ));
        products.add(createMattress(
                mattress,
                "Bamboo Comfort Mattress",
                "bamboo-comfort-mattress",
                "BAMBOO",
                "A balanced foam mattress with a soft bamboo-fiber cover for cooler sleep.",
                "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1200",
                new BigDecimal("4590000")
        ));
        products.add(createMattress(
                mattress,
                "Harmony Pocket Spring Mattress",
                "harmony-pocket-spring-mattress",
                "HARMONY",
                "Independent pocket springs reduce motion transfer while keeping the body supported.",
                "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200",
                new BigDecimal("7490000")
        ));
        products.add(createMattress(
                mattress,
                "Calm Hybrid Mattress",
                "calm-hybrid-mattress",
                "CALM",
                "A hybrid construction combining pressure-relieving foam and stable pocket springs.",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200",
                new BigDecimal("8290000")
        ));
        products.add(createMattress(
                mattress,
                "AirFlow Cooling Mattress",
                "airflow-cooling-mattress",
                "AIRFLOW",
                "Open-cell foam and ventilated layers help disperse heat throughout the night.",
                "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=1200",
                new BigDecimal("5990000")
        ));

        Product linenSet = createProduct(
                beddingSets,
                "Linen Duvet Set",
                "linen-duvet-set",
                "QuyDung Living",
                "A breathable linen duvet set with a relaxed, naturally textured finish.",
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1200"
        );
        addVariant(linenSet, "LINEN-160-BEIGE", "160 x 200", null, "beige", "1890000");
        addVariant(linenSet, "LINEN-180-WHITE", "180 x 200", null, "white", "2190000");
        products.add(linenSet);

        Product pillowcase = createProduct(
                pillows,
                "Bamboo Silk Pillowcase",
                "bamboo-silk-pillowcase",
                "QuyDung Living",
                "A smooth bamboo-silk pillowcase designed to feel gentle and stay cool.",
                "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=1200"
        );
        addVariant(pillowcase, "PILLOW-40-WHITE", "40 x 60", null, "white", "450000");
        addVariant(pillowcase, "PILLOW-50-GRAY", "50 x 70", null, "gray", "520000");
        products.add(pillowcase);

        Product weightedBlanket = createProduct(
                blankets,
                "Premium Weighted Blanket",
                "premium-weighted-blanket",
                "QuyDung Living",
                "An evenly weighted blanket that creates a calm and comforting sleep environment.",
                "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=1200"
        );
        addVariant(weightedBlanket, "BLANKET-150-GRAY", "150 x 200", null, "gray", "2490000");
        addVariant(weightedBlanket, "BLANKET-180-NAVY", "180 x 210", null, "navy", "2890000");
        products.add(weightedBlanket);

        Product cottonSheet = createProduct(
                bedSheets,
                "Organic Cotton Bed Sheet",
                "organic-cotton-bed-sheet",
                "QuyDung Living",
                "Soft organic cotton sheets with a clean finish and all-season comfort.",
                "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=1200"
        );
        addVariant(cottonSheet, "SHEET-160-CREAM", "160 x 200", null, "cream", "1290000");
        addVariant(cottonSheet, "SHEET-180-WHITE", "180 x 200", null, "white", "1490000");
        products.add(cottonSheet);

        productRepository.saveAll(products);
        createFlashSale(products);
    }

    private ProductCategory createCategory(String name, String slug) {
        ProductCategory category = new ProductCategory();
        category.setName(name);
        category.setSlug(slug);
        return category;
    }

    private Product createMattress(
            ProductCategory category,
            String name,
            String slug,
            String skuPrefix,
            String description,
            String imageUrl,
            BigDecimal basePrice
    ) {
        Product product = createProduct(
                category,
                name,
                slug,
                "QuyDung Sleep",
                description,
                imageUrl
        );
        addVariant(product, skuPrefix + "-160-8-WHITE", "160 x 200", "8", "white", basePrice.toPlainString());
        addVariant(product, skuPrefix + "-180-10-GRAY", "180 x 200", "10", "gray", basePrice.add(new BigDecimal("900000")).toPlainString());
        addVariant(product, skuPrefix + "-200-12-BEIGE", "200 x 220", "12", "beige", basePrice.add(new BigDecimal("1600000")).toPlainString());
        return product;
    }

    private Product createProduct(
            ProductCategory category,
            String name,
            String slug,
            String brand,
            String description,
            String imageUrl
    ) {
        Product product = new Product();
        product.setProductCategory(category);
        product.setName(name);
        product.setSlug(slug);
        product.setBrand(brand);
        product.setDescription(description);

        ProductImage primaryImage = new ProductImage();
        primaryImage.setProduct(product);
        primaryImage.setImageUrl(imageUrl);
        primaryImage.setPrimaryImage(true);
        product.getImages().add(primaryImage);

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

    private void createFlashSale(List<Product> products) {
        FlashSale flashSale = new FlashSale();
        flashSale.setName("Sleep Better Flash Sale");
        flashSale.setDescription("Limited-time offers selected for better sleep.");
        flashSale.setStartDate(LocalDateTime.now().minusDays(1));
        flashSale.setEndDate(LocalDateTime.now().plusDays(7));

        products.stream()
                .limit(6)
                .flatMap(product -> product.getVariants().stream())
                .forEach(variant -> {
                    FlashSaleItem item = new FlashSaleItem();
                    item.setFlashSale(flashSale);
                    item.setProductVariant(variant);
                    item.setDiscountType(DiscountType.PERCENTAGE);
                    item.setDiscountValue(new BigDecimal("30"));
                    flashSale.getItems().add(item);
                });

        flashSaleRepository.save(flashSale);
    }
}
