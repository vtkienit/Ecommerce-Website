package com.ecommerce.catalog.entities;

import com.ecommerce.catalog.utils.SearchTextNormalizer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(
        name = "products",
        indexes = {
                @Index(name = "products_category_idx", columnList = "product_category_id"),
                @Index(name = "products_search_name_idx", columnList = "search_name"),
                @Index(name = "products_search_brand_idx", columnList = "search_brand")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_category_id", nullable = false)
    private ProductCategory productCategory;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    private String brand;

    @Column(name = "search_name")
    private String searchName;

    @Column(name = "search_brand")
    private String searchBrand;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 50)
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 50)
    private List<ProductImage> images = new ArrayList<>();

    @PrePersist
    @PreUpdate
    private void updateSearchFields() {
        refreshSearchFields();
    }

    public boolean refreshSearchFields() {
        String normalizedName = SearchTextNormalizer.normalize(name);
        String normalizedBrand = SearchTextNormalizer.normalize(brand);
        boolean changed = !Objects.equals(searchName, normalizedName)
                || !Objects.equals(searchBrand, normalizedBrand);
        searchName = normalizedName;
        searchBrand = normalizedBrand;
        return changed;
    }
}
