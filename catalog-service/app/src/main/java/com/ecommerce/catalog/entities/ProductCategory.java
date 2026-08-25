package com.ecommerce.catalog.entities;

import com.ecommerce.catalog.utils.SearchTextNormalizer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(
        name = "product_categories",
        indexes = @Index(name = "product_categories_search_name_idx", columnList = "search_name")
)
@Getter
@Setter
@NoArgsConstructor
public class ProductCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "search_name")
    private String searchName;

    @OneToMany(mappedBy = "productCategory")
    private List<Product> products = new ArrayList<>();

    @PrePersist
    @PreUpdate
    private void updateSearchFields() {
        refreshSearchFields();
    }

    public boolean refreshSearchFields() {
        String normalizedName = SearchTextNormalizer.normalize(name);
        boolean changed = !Objects.equals(searchName, normalizedName);
        searchName = normalizedName;
        return changed;
    }
}
