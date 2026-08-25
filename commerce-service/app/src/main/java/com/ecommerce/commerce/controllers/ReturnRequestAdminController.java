package com.ecommerce.commerce.controllers;

import com.ecommerce.commerce.dtos.ReturnRequestResponse;
import com.ecommerce.commerce.dtos.PageResponse;
import com.ecommerce.commerce.dtos.UpdateReturnStatusRequest;
import com.ecommerce.commerce.entities.ReturnRequestStatus;
import com.ecommerce.commerce.services.ReturnRequestService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/returns")
@Validated
public class ReturnRequestAdminController {

    private final ReturnRequestService returnRequestService;

    public ReturnRequestAdminController(ReturnRequestService returnRequestService) {
        this.returnRequestService = returnRequestService;
    }

    @GetMapping
    public PageResponse<ReturnRequestResponse> getRequests(
            @RequestParam(required = false) ReturnRequestStatus status,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "6") @Min(1) @Max(50) int size
    ) {
        return returnRequestService.getAdminRequests(status, search, page, size);
    }

    @PatchMapping("/{requestId}/status")
    public ReturnRequestResponse updateStatus(
            @PathVariable Long requestId,
            @Valid @RequestBody UpdateReturnStatusRequest request
    ) {
        return returnRequestService.updateStatus(requestId, request);
    }
}
