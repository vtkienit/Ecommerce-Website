package com.ecommerce.commerce.controllers;

import com.ecommerce.commerce.dtos.VoucherCodeRequest;
import com.ecommerce.commerce.dtos.VoucherPreviewResponse;
import com.ecommerce.commerce.services.VoucherService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @PostMapping("/preview")
    public VoucherPreviewResponse preview(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody VoucherCodeRequest request
    ) {
        return voucherService.preview(userId, request.getCode());
    }
}
