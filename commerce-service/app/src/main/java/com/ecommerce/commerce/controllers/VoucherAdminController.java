package com.ecommerce.commerce.controllers;

import com.ecommerce.commerce.dtos.VoucherRequest;
import com.ecommerce.commerce.dtos.VoucherResponse;
import com.ecommerce.commerce.dtos.PageResponse;
import com.ecommerce.commerce.services.VoucherService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/admin/vouchers")
@Validated
public class VoucherAdminController {

    private final VoucherService voucherService;

    public VoucherAdminController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping
    public PageResponse<VoucherResponse> getVouchers(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "6") @Min(1) @Max(50) int size,
            @RequestParam(defaultValue = "") String search
    ) {
        return voucherService.getVouchers(page, size, search);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VoucherResponse createVoucher(@Valid @RequestBody VoucherRequest request) {
        return voucherService.createVoucher(request);
    }

    @PatchMapping("/{id}")
    public VoucherResponse updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherRequest request
    ) {
        return voucherService.updateVoucher(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
    }
}
