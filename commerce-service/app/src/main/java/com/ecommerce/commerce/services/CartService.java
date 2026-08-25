package com.ecommerce.commerce.services;

import com.ecommerce.commerce.clients.CatalogGateway;
import com.ecommerce.commerce.dtos.CatalogVariantSnapshot;
import com.ecommerce.commerce.dtos.CartItemResponse;
import com.ecommerce.commerce.dtos.CartResponse;
import com.ecommerce.commerce.entities.Cart;
import com.ecommerce.commerce.entities.CartItem;
import com.ecommerce.commerce.exceptions.CommerceException;
import com.ecommerce.commerce.repositories.CartRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class CartService {

    private static final int MAX_ITEM_QUANTITY = 99;

    private final CartRepository cartRepository;
    private final CatalogGateway catalogGateway;
    private final InventoryService inventoryService;

    public CartService(
            CartRepository cartRepository,
            CatalogGateway catalogGateway,
            InventoryService inventoryService
    ) {
        this.cartRepository = cartRepository;
        this.catalogGateway = catalogGateway;
        this.inventoryService = inventoryService;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        return cartRepository
                .findByUserId(userId)
                .map(this::toResponse)
                .orElseGet(this::emptyCart);
    }

    public CartResponse addItem(Long userId, Long variantId, Integer quantity) {
        validateQuantity(quantity);
        CatalogVariantSnapshot variant = catalogGateway.getVariant(variantId);

        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> createCart(userId));
        CartItem item = cart
                .getItems()
                .stream()
                .filter(current -> current.getVariantId().equals(variantId))
                .findFirst()
                .orElseGet(() -> addNewItem(cart, variantId));

        int newQuantity = item.getQuantity() + quantity;
        validateQuantity(newQuantity);
        validateAvailableStock(variant, newQuantity);
        item.setQuantity(newQuantity);

        return toResponse(cartRepository.save(cart));
    }

    public CartResponse updateItem(Long userId, Long itemId, Integer quantity) {
        validateQuantity(quantity);
        Cart cart = getRequiredCart(userId);
        CartItem item = getRequiredItem(cart, itemId);
        CatalogVariantSnapshot variant = catalogGateway.getVariant(item.getVariantId());
        validateAvailableStock(variant, quantity);
        item.setQuantity(quantity);
        return toResponse(cartRepository.save(cart));
    }

    public CartResponse removeItem(Long userId, Long itemId) {
        Cart cart = getRequiredCart(userId);
        CartItem item = getRequiredItem(cart, itemId);
        cart.getItems().remove(item);
        return toResponse(cartRepository.save(cart));
    }

    public void clearCart(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }

    private Cart createCart(Long userId) {
        Cart cart = new Cart();
        cart.setUserId(userId);
        return cart;
    }

    private CartItem addNewItem(Cart cart, Long variantId) {
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setVariantId(variantId);
        item.setQuantity(0);
        cart.getItems().add(item);
        return item;
    }

    private Cart getRequiredCart(Long userId) {
        return cartRepository
                .findByUserId(userId)
                .orElseThrow(() -> new CommerceException("Cart not found", HttpStatus.NOT_FOUND));
    }

    private CartItem getRequiredItem(Cart cart, Long itemId) {
        return cart
                .getItems()
                .stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new CommerceException("Cart item not found", HttpStatus.NOT_FOUND));
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalQuantity = 0;

        for (CartItem item : cart.getItems()) {
            CatalogVariantSnapshot variant = catalogGateway.getVariant(item.getVariantId());
            BigDecimal lineTotal = variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(lineTotal);
            totalQuantity += item.getQuantity();
            items.add(new CartItemResponse(
                    item.getId(),
                    item.getVariantId(),
                    variant.getProductSlug(),
                    variant.getProductName(),
                    variant.getImageUrl(),
                    variant.getSku(),
                    variant.getSize(),
                    variant.getThickness(),
                    variant.getColor(),
                    item.getQuantity(),
                    variant.getOriginalPrice(),
                    variant.getPrice(),
                    lineTotal
            ));
        }

        return new CartResponse(cart.getId(), items, totalQuantity, subtotal);
    }

    private CartResponse emptyCart() {
        return new CartResponse(null, List.of(), 0, BigDecimal.ZERO);
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
            throw new CommerceException("Quantity must be between 1 and 99", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateAvailableStock(CatalogVariantSnapshot variant, int requestedQuantity) {
        int availableQuantity = inventoryService.getAvailableQuantity(variant.getId());
        if (requestedQuantity > availableQuantity) {
            throw new CommerceException(
                    variant.getProductName() + " only has " + availableQuantity + " item(s) left",
                    HttpStatus.CONFLICT
            );
        }
    }
}
