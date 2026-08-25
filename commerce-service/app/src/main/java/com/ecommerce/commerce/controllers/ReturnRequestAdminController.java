package com.ecommerce.commerce.controllers;

import com.ecommerce.commerce.dtos.ReturnRequestResponse;
import com.ecommerce.commerce.dtos.UpdateReturnStatusRequest;
import com.ecommerce.commerce.entities.ReturnRequestStatus;
import com.ecommerce.commerce.services.ReturnRequestService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/returns")
public class ReturnRequestAdminController {

    private final ReturnRequestService returnRequestService;

    public ReturnRequestAdminController(ReturnRequestService returnRequestService) {
        this.returnRequestService = returnRequestService;
    }

    @GetMapping
    public List<ReturnRequestResponse> getRequests(
            @RequestParam(required = false) ReturnRequestStatus status
    ) {
        return returnRequestService.getAdminRequests(status);
    }

    @PatchMapping("/{requestId}/status")
    public ReturnRequestResponse updateStatus(
            @PathVariable Long requestId,
            @Valid @RequestBody UpdateReturnStatusRequest request
    ) {
        return returnRequestService.updateStatus(requestId, request);
    }
}
