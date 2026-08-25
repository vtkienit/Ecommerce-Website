package com.ecommerce.catalog.configs;

import com.ecommerce.catalog.entities.DiscountType;
import com.ecommerce.catalog.entities.FlashSale;
import com.ecommerce.catalog.entities.FlashSaleItem;
import com.ecommerce.catalog.entities.Product;
import com.ecommerce.catalog.entities.ProductCategory;
import com.ecommerce.catalog.entities.ProductImage;
import com.ecommerce.catalog.entities.ProductVariant;
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
import java.util.Objects;

@Component
@ConditionalOnProperty(
        name = "catalog.seed.enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class CatalogDataInitializer implements ApplicationRunner {

    private static final BigDecimal MIN_PRICE = new BigDecimal("50000");
    private static final BigDecimal MAX_PRICE = new BigDecimal("500000");
    private static final BigDecimal MATTRESS_PRICE_STEP = new BigDecimal("30000");
    private static final BigDecimal STANDARD_PRICE_STEP = new BigDecimal("20000");

    private static final String BED_IMAGE =
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200";
    private static final String BEDROOM_IMAGE =
            "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=1200";
    private static final String MODERN_BED_IMAGE =
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1200";
    private static final String WHITE_BED_IMAGE =
            "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200";
    private static final String BEDDING_IMAGE =
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1200";
    private static final String PILLOW_IMAGE =
            "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=1200";
    private static final String BLANKET_IMAGE =
            "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=1200";
    private static final String SHEET_IMAGE =
            "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=1200";

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
        ProductCategory mattress = getOrCreateCategory("Mattress", "mattress");
        ProductCategory beddingSets = getOrCreateCategory("Bedding Sets", "bedding-sets");
        ProductCategory blankets = getOrCreateCategory("Blankets", "blankets");
        ProductCategory bedSheets = getOrCreateCategory("Bed Sheets", "bed-sheets");
        ProductCategory pillows = getOrCreateCategory("Pillows", "pillows");
        categoryRepository.saveAll(List.of(mattress, beddingSets, blankets, bedSheets, pillows));

        List<Product> products = new ArrayList<>();
        seedMattresses(products, mattress);
        seedBeddingSets(products, beddingSets);
        seedBlankets(products, blankets);
        seedBedSheets(products, bedSheets);
        seedPillows(products, pillows);

        productRepository.saveAll(products);
        normalizeAllPrices();

        if (flashSaleRepository.count() == 0) {
            createFlashSale(products);
        }
    }

    private void seedMattresses(List<Product> products, ProductCategory category) {
        products.add(seedMattress(category, "Cloud Orthopedic Mattress", "cloud-orthopedic-mattress", "CLOUD",
                "Premium memory foam mattress designed to support the spine and improve sleep quality.",
                BED_IMAGE, "299000"));
        products.add(seedMattress(category, "Serene Natural Latex Mattress", "serene-natural-latex-mattress", "SERENE",
                "Responsive natural latex with breathable comfort and long-lasting support.",
                BEDROOM_IMAGE, "329000"));
        products.add(seedMattress(category, "Bamboo Comfort Mattress", "bamboo-comfort-mattress", "BAMBOO",
                "A balanced foam mattress with a soft bamboo-fiber cover for cooler sleep.",
                MODERN_BED_IMAGE, "249000"));
        products.add(seedMattress(category, "Harmony Pocket Spring Mattress", "harmony-pocket-spring-mattress", "HARMONY",
                "Independent pocket springs reduce motion transfer while keeping the body supported.",
                WHITE_BED_IMAGE, "369000"));
        products.add(seedMattress(category, "Calm Hybrid Mattress", "calm-hybrid-mattress", "CALM",
                "A hybrid construction combining pressure-relieving foam and stable pocket springs.",
                BED_IMAGE, "419000"));
        products.add(seedMattress(category, "AirFlow Cooling Mattress", "airflow-cooling-mattress", "AIRFLOW",
                "Open-cell foam and ventilated layers help disperse heat throughout the night.",
                BEDROOM_IMAGE, "339000"));
    }

    private void seedBeddingSets(List<Product> products, ProductCategory category) {
        products.add(seedBeddingSet(category, "Linen Duvet Set", "linen-duvet-set", "LINEN",
                "A breathable linen duvet set with a relaxed, naturally textured finish.", BEDDING_IMAGE, "219000"));
        products.add(seedBeddingSet(category, "Washed Cotton Bedding Set", "washed-cotton-bedding-set", "WASHED",
                "Soft washed cotton bedding for a comfortable everyday sleep setup.", BEDROOM_IMAGE, "189000"));
        products.add(seedBeddingSet(category, "Satin Comfort Bedding Set", "satin-comfort-bedding-set", "SATIN",
                "Smooth satin-touch bedding with an elegant finish and gentle feel.", WHITE_BED_IMAGE, "249000"));
        products.add(seedBeddingSet(category, "Minimal Stripe Bedding Set", "minimal-stripe-bedding-set", "STRIPE",
                "A clean striped bedding set designed for modern bedrooms.", MODERN_BED_IMAGE, "169000"));
        products.add(seedBeddingSet(category, "Tencel Cooling Bedding Set", "tencel-cooling-bedding-set", "TENCELSET",
                "Breathable Tencel fibers help keep the bed cool and comfortable.", BED_IMAGE, "299000"));
        products.add(seedBeddingSet(category, "Hotel Collection Bedding Set", "hotel-collection-bedding-set", "HOTELSET",
                "Crisp hotel-inspired bedding with a refined and durable finish.", SHEET_IMAGE, "279000"));
    }

    private void seedBlankets(List<Product> products, ProductCategory category) {
        products.add(seedBlanket(category, "Premium Weighted Blanket", "premium-weighted-blanket", "WEIGHTED",
                "An evenly weighted blanket that creates a calm and comforting sleep environment.", BLANKET_IMAGE, "259000"));
        products.add(seedBlanket(category, "Soft Fleece Blanket", "soft-fleece-blanket", "FLEECE",
                "Lightweight fleece with a warm, soft feel for everyday relaxation.", BEDROOM_IMAGE, "129000"));
        products.add(seedBlanket(category, "Knitted Cotton Blanket", "knitted-cotton-blanket", "KNITTED",
                "Breathable knitted cotton with a textured look and comfortable weight.", BEDDING_IMAGE, "179000"));
        products.add(seedBlanket(category, "Cooling Summer Blanket", "cooling-summer-blanket", "SUMMER",
                "A light and breathable blanket made for warm nights.", WHITE_BED_IMAGE, "149000"));
        products.add(seedBlanket(category, "Sherpa Warm Blanket", "sherpa-warm-blanket", "SHERPA",
                "Plush Sherpa layers provide cozy warmth during colder weather.", MODERN_BED_IMAGE, "219000"));
        products.add(seedBlanket(category, "Bamboo Throw Blanket", "bamboo-throw-blanket", "BAMBOOT",
                "A soft bamboo-blend throw with breathable year-round comfort.", BLANKET_IMAGE, "199000"));
    }

    private void seedBedSheets(List<Product> products, ProductCategory category) {
        products.add(seedBedSheet(category, "Organic Cotton Bed Sheet", "organic-cotton-bed-sheet", "COTTON",
                "Soft organic cotton sheets with a clean finish and all-season comfort.", SHEET_IMAGE, "159000"));
        products.add(seedBedSheet(category, "Cooling Tencel Bed Sheet", "cooling-tencel-bed-sheet", "TENCELSHEET",
                "Silky Tencel sheets that wick moisture and stay cool through the night.", BED_IMAGE, "229000"));
        products.add(seedBedSheet(category, "Washed Linen Bed Sheet", "washed-linen-bed-sheet", "LINENSHEET",
                "Relaxed washed linen with natural texture and breathable comfort.", BEDDING_IMAGE, "249000"));
        products.add(seedBedSheet(category, "Bamboo Fitted Sheet", "bamboo-fitted-sheet", "BAMBOOSHEET",
                "A fitted bamboo sheet with a smooth feel and secure elastic edge.", MODERN_BED_IMAGE, "189000"));
        products.add(seedBedSheet(category, "Hotel Cotton Bed Sheet", "hotel-cotton-bed-sheet", "HOTELSHEET",
                "Crisp hotel-style cotton sheets made for a polished bedroom.", WHITE_BED_IMAGE, "199000"));
        products.add(seedBedSheet(category, "Easy Care Microfiber Sheet", "easy-care-microfiber-sheet", "MICROSHEET",
                "Soft, durable microfiber that is easy to wash and quick to dry.", BEDROOM_IMAGE, "99000"));
    }

    private void seedPillows(List<Product> products, ProductCategory category) {
        products.add(seedPillow(category, "Bamboo Silk Pillowcase", "bamboo-silk-pillowcase", "PILLOWCASE",
                "A smooth bamboo-silk pillowcase designed to feel gentle and stay cool.", PILLOW_IMAGE, "89000"));
        products.add(seedPillow(category, "Memory Foam Pillow", "memory-foam-pillow", "MEMORY",
                "Pressure-relieving memory foam supports a comfortable sleeping posture.", BED_IMAGE, "199000"));
        products.add(seedPillow(category, "Latex Support Pillow", "latex-support-pillow", "LATEXPILLOW",
                "Responsive latex support with ventilation for cooler sleep.", MODERN_BED_IMAGE, "229000"));
        products.add(seedPillow(category, "Microfiber Hotel Pillow", "microfiber-hotel-pillow", "HOTELPILLOW",
                "A plush microfiber pillow inspired by premium hotel comfort.", WHITE_BED_IMAGE, "129000"));
        products.add(seedPillow(category, "Cooling Gel Pillow", "cooling-gel-pillow", "GELPILLOW",
                "Cooling gel and supportive foam help reduce heat around the head and neck.", BEDROOM_IMAGE, "249000"));
        products.add(seedPillow(category, "Ergonomic Neck Pillow", "ergonomic-neck-pillow", "NECKPILLOW",
                "A contoured pillow designed to support the natural curve of the neck.", PILLOW_IMAGE, "219000"));
    }

    private Product seedMattress(
            ProductCategory category,
            String name,
            String slug,
            String skuPrefix,
            String description,
            String imageUrl,
            String basePrice
    ) {
        Product product = seedProduct(category, name, slug, "QuyDung Sleep", description, imageUrl);
        BigDecimal price = new BigDecimal(basePrice);
        upsertVariant(product, skuPrefix + "-160-8-WHITE", "160 x 200", "8", "white", price);
        upsertVariant(product, skuPrefix + "-180-10-GRAY", "180 x 200", "10", "gray", price.add(MATTRESS_PRICE_STEP));
        upsertVariant(product, skuPrefix + "-200-12-BEIGE", "200 x 220", "12", "beige", price.add(MATTRESS_PRICE_STEP.multiply(BigDecimal.TWO)));
        return product;
    }

    private Product seedBeddingSet(
            ProductCategory category,
            String name,
            String slug,
            String skuPrefix,
            String description,
            String imageUrl,
            String basePrice
    ) {
        return seedStandardProduct(category, name, slug, skuPrefix, description, imageUrl, basePrice,
                "160 x 200", "180 x 200", "beige", "white");
    }

    private Product seedBlanket(
            ProductCategory category,
            String name,
            String slug,
            String skuPrefix,
            String description,
            String imageUrl,
            String basePrice
    ) {
        return seedStandardProduct(category, name, slug, skuPrefix, description, imageUrl, basePrice,
                "150 x 200", "180 x 210", "gray", "navy");
    }

    private Product seedBedSheet(
            ProductCategory category,
            String name,
            String slug,
            String skuPrefix,
            String description,
            String imageUrl,
            String basePrice
    ) {
        return seedStandardProduct(category, name, slug, skuPrefix, description, imageUrl, basePrice,
                "160 x 200", "180 x 200", "cream", "white");
    }

    private Product seedPillow(
            ProductCategory category,
            String name,
            String slug,
            String skuPrefix,
            String description,
            String imageUrl,
            String basePrice
    ) {
        return seedStandardProduct(category, name, slug, skuPrefix, description, imageUrl, basePrice,
                "40 x 60", "50 x 70", "white", "gray");
    }

    private Product seedStandardProduct(
            ProductCategory category,
            String name,
            String slug,
            String skuPrefix,
            String description,
            String imageUrl,
            String basePrice,
            String firstSize,
            String secondSize,
            String firstColor,
            String secondColor
    ) {
        Product product = seedProduct(category, name, slug, "QuyDung Living", description, imageUrl);
        BigDecimal price = new BigDecimal(basePrice);
        upsertVariant(product, skuPrefix + "-01", firstSize, null, firstColor, price);
        upsertVariant(product, skuPrefix + "-02", secondSize, null, secondColor, price.add(STANDARD_PRICE_STEP));
        return product;
    }

    private ProductCategory getOrCreateCategory(String name, String slug) {
        ProductCategory category = categoryRepository.findBySlugIgnoreCase(slug)
                .orElseGet(ProductCategory::new);
        category.setName(name);
        category.setSlug(slug);
        return category;
    }

    private Product seedProduct(
            ProductCategory category,
            String name,
            String slug,
            String brand,
            String description,
            String imageUrl
    ) {
        Product product = productRepository.findBySlugIgnoreCase(slug).orElseGet(Product::new);
        product.setProductCategory(category);
        product.setName(name);
        product.setSlug(slug);
        product.setBrand(brand);
        product.setDescription(description);

        if (product.getImages().isEmpty()) {
            ProductImage primaryImage = new ProductImage();
            primaryImage.setProduct(product);
            primaryImage.setImageUrl(imageUrl);
            primaryImage.setPrimaryImage(true);
            product.getImages().add(primaryImage);
        }

        return product;
    }

    private void upsertVariant(
            Product product,
            String sku,
            String size,
            String thickness,
            String color,
            BigDecimal price
    ) {
        ProductVariant variant = product.getVariants().stream()
                .filter(item -> item.getSku().equalsIgnoreCase(sku)
                        || Objects.equals(item.getSize(), size) && Objects.equals(item.getColor(), color))
                .findFirst()
                .orElseGet(() -> {
                    ProductVariant newVariant = new ProductVariant();
                    newVariant.setProduct(product);
                    newVariant.setSku(sku);
                    product.getVariants().add(newVariant);
                    return newVariant;
                });
        variant.setSku(sku);
        variant.setSize(size);
        variant.setThickness(thickness);
        variant.setColor(color);
        variant.setPrice(price);
    }

    private void normalizeAllPrices() {
        productRepository.findAll().stream()
                .flatMap(product -> product.getVariants().stream())
                .forEach(variant -> variant.setPrice(normalizePrice(variant.getPrice())));
    }

    private BigDecimal normalizePrice(BigDecimal price) {
        if (price.compareTo(MIN_PRICE) < 0) {
            return MIN_PRICE;
        }
        if (price.compareTo(MAX_PRICE) > 0) {
            return MAX_PRICE;
        }
        return price;
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
