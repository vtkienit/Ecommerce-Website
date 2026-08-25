package com.ecommerce.commerce.controllers;

import com.ecommerce.commerce.dtos.VoucherRequest;
import com.ecommerce.commerce.dtos.VoucherResponse;
import com.ecommerce.commerce.services.VoucherService;
import jakarta.validation.Valid;
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

import java.util.List;

@RestController
@RequestMapping("/api/admin/vouchers")
public class VoucherAdminController {

    private final VoucherService voucherService;

    public VoucherAdminController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping
    public List<VoucherResponse> getVouchers() {
        return voucherService.getVouchers();
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
