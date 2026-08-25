package com.ecommerce.commerce.services;

import com.ecommerce.commerce.dtos.CartResponse;
import com.ecommerce.commerce.dtos.VoucherPreviewResponse;
import com.ecommerce.commerce.dtos.PageResponse;
import com.ecommerce.commerce.dtos.VoucherRequest;
import com.ecommerce.commerce.dtos.VoucherResponse;
import com.ecommerce.commerce.entities.DiscountType;
import com.ecommerce.commerce.entities.Order;
import com.ecommerce.commerce.entities.Voucher;
import com.ecommerce.commerce.exceptions.CommerceException;
import com.ecommerce.commerce.repositories.OrderRepository;
import com.ecommerce.commerce.repositories.VoucherRepository;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
@Transactional
public class VoucherService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final VoucherRepository voucherRepository;
    private final OrderRepository orderRepository;
    private final CartService cartService;

    public VoucherService(
            VoucherRepository voucherRepository,
            OrderRepository orderRepository,
            CartService cartService
    ) {
        this.voucherRepository = voucherRepository;
        this.orderRepository = orderRepository;
        this.cartService = cartService;
    }

    @Transactional(readOnly = true)
    public PageResponse<VoucherResponse> getVouchers(int page, int size, String search) {
        LocalDateTime now = LocalDateTime.now();
        Specification<Voucher> specification = (root, query, builder) -> {
            if (search == null || search.isBlank()) return builder.conjunction();
            String keyword = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            return builder.or(
                    builder.like(builder.lower(root.get("code")), keyword),
                    builder.like(builder.lower(root.get("description")), keyword)
            );
        };
        Page<Voucher> vouchers = voucherRepository.findAll(
                specification,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startDate"))
        );
        return new PageResponse<>(
                vouchers.getContent().stream().map(voucher -> toResponse(voucher, now)).toList(),
                vouchers.getNumber(),
                vouchers.getSize(),
                vouchers.getTotalElements(),
                vouchers.getTotalPages(),
                vouchers.isFirst(),
                vouchers.isLast()
        );
    }

    public VoucherResponse createVoucher(VoucherRequest request) {
        String code = normalizeCode(request.getCode());
        if (voucherRepository.existsByCodeIgnoreCase(code)) {
            throw new CommerceException("Voucher code already exists", HttpStatus.CONFLICT);
        }

        Voucher voucher = new Voucher();
        voucher.setCode(code);
        voucher.setUsedCount(0);
        updateVoucher(voucher, request);
        return toResponse(voucherRepository.save(voucher), LocalDateTime.now());
    }

    public VoucherResponse updateVoucher(Long id, VoucherRequest request) {
        Voucher voucher = voucherRepository
                .findByIdForUpdate(id)
                .orElseThrow(() -> new CommerceException("Voucher not found", HttpStatus.NOT_FOUND));
        String code = normalizeCode(request.getCode());
        if (voucherRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new CommerceException("Voucher code already exists", HttpStatus.CONFLICT);
        }
        if (request.getQuantity() < voucher.getUsedCount()) {
            throw new CommerceException("Voucher quantity cannot be lower than its usage count", HttpStatus.CONFLICT);
        }

        voucher.setCode(code);
        updateVoucher(voucher, request);
        return toResponse(voucherRepository.save(voucher), LocalDateTime.now());
    }

    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository
                .findByIdForUpdate(id)
                .orElseThrow(() -> new CommerceException("Voucher not found", HttpStatus.NOT_FOUND));
        if (orderRepository.existsByVoucherId(id)) {
            throw new CommerceException("A voucher used by an order cannot be deleted", HttpStatus.CONFLICT);
        }
        voucherRepository.delete(voucher);
    }

    @Transactional(readOnly = true)
    public VoucherPreviewResponse preview(Long userId, String code) {
        CartResponse cart = cartService.getCart(userId);
        if (cart.getItems().isEmpty()) {
            throw new CommerceException("Cart is empty", HttpStatus.BAD_REQUEST);
        }

        Voucher voucher = voucherRepository
                .findByCodeIgnoreCase(normalizeCode(code))
                .orElseThrow(() -> new CommerceException("Voucher not found", HttpStatus.NOT_FOUND));
        BigDecimal discount = calculateDiscount(voucher, cart.getSubtotal(), LocalDateTime.now());
        return new VoucherPreviewResponse(
                voucher.getCode(),
                voucher.getDescription(),
                cart.getSubtotal(),
                discount,
                cart.getSubtotal().subtract(discount)
        );
    }

    public void apply(Order order, String code) {
        if (code == null || code.isBlank()) return;

        Voucher voucher = voucherRepository
                .findByCodeForUpdate(normalizeCode(code))
                .orElseThrow(() -> new CommerceException("Voucher not found", HttpStatus.NOT_FOUND));
        BigDecimal discount = calculateDiscount(voucher, order.getSubtotal(), LocalDateTime.now());

        voucher.setUsedCount(voucher.getUsedCount() + 1);
        order.setVoucher(voucher);
        order.setVoucherDiscountAmount(discount);
        order.setTotalAmount(order.getSubtotal().subtract(discount));
    }

    public void release(Order order) {
        if (order.getVoucher() == null) return;
        Voucher voucher = voucherRepository
                .findByIdForUpdate(order.getVoucher().getId())
                .orElseThrow(() -> new CommerceException("Voucher not found", HttpStatus.CONFLICT));
        if (voucher.getUsedCount() > 0) {
            voucher.setUsedCount(voucher.getUsedCount() - 1);
        }
    }

    private void updateVoucher(Voucher voucher, VoucherRequest request) {
        validateRequest(request);
        voucher.setDescription(normalizeDescription(request.getDescription()));
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinOrderAmount(request.getMinOrderAmount());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setQuantity(request.getQuantity());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
    }

    private void validateRequest(VoucherRequest request) {
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new CommerceException("Voucher end date must be after its start date", HttpStatus.BAD_REQUEST);
        }
        if (request.getDiscountType() == DiscountType.PERCENTAGE
                && request.getDiscountValue().compareTo(ONE_HUNDRED) > 0) {
            throw new CommerceException("Percentage discount cannot exceed 100", HttpStatus.BAD_REQUEST);
        }
        if (hasFraction(request.getMinOrderAmount())
                || hasFraction(request.getMaxDiscountAmount())
                || request.getDiscountType() == DiscountType.FIXED_AMOUNT
                && hasFraction(request.getDiscountValue())) {
            throw new CommerceException("Voucher amounts must be whole VND values", HttpStatus.BAD_REQUEST);
        }
    }

    private BigDecimal calculateDiscount(
            Voucher voucher,
            BigDecimal subtotal,
            LocalDateTime now
    ) {
        validateAvailability(voucher, subtotal, now);

        BigDecimal discount = voucher.getDiscountType() == DiscountType.PERCENTAGE
                ? subtotal.multiply(voucher.getDiscountValue()).divide(ONE_HUNDRED, 0, RoundingMode.DOWN)
                : voucher.getDiscountValue();
        if (voucher.getMaxDiscountAmount() != null) {
            discount = discount.min(voucher.getMaxDiscountAmount());
        }
        return discount.min(subtotal);
    }

    private void validateAvailability(Voucher voucher, BigDecimal subtotal, LocalDateTime now) {
        if (now.isBefore(voucher.getStartDate())) {
            throw new CommerceException("Voucher is not active yet", HttpStatus.CONFLICT);
        }
        if (now.isAfter(voucher.getEndDate())) {
            throw new CommerceException("Voucher has expired", HttpStatus.CONFLICT);
        }
        if (voucher.getUsedCount() >= voucher.getQuantity()) {
            throw new CommerceException("Voucher usage limit has been reached", HttpStatus.CONFLICT);
        }
        if (subtotal.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new CommerceException("Order does not meet the voucher minimum amount", HttpStatus.CONFLICT);
        }
    }

    private VoucherResponse toResponse(Voucher voucher, LocalDateTime now) {
        int remaining = Math.max(0, voucher.getQuantity() - voucher.getUsedCount());
        boolean active = !now.isBefore(voucher.getStartDate())
                && !now.isAfter(voucher.getEndDate())
                && remaining > 0;
        return new VoucherResponse(
                voucher.getId(),
                voucher.getCode(),
                voucher.getDescription(),
                voucher.getDiscountType(),
                voucher.getDiscountValue(),
                voucher.getMinOrderAmount(),
                voucher.getMaxDiscountAmount(),
                voucher.getQuantity(),
                voucher.getUsedCount(),
                remaining,
                voucher.getStartDate(),
                voucher.getEndDate(),
                active
        );
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeDescription(String description) {
        if (description == null || description.isBlank()) return null;
        return description.trim();
    }

    private boolean hasFraction(BigDecimal value) {
        return value != null && value.stripTrailingZeros().scale() > 0;
    }
}
