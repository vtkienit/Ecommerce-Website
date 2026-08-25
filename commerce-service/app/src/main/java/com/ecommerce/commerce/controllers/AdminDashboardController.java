package com.ecommerce.commerce.controllers;

import com.ecommerce.commerce.dtos.AdminDashboardResponse;
import com.ecommerce.commerce.services.AdminDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping
    public AdminDashboardResponse getDashboard() {
        return adminDashboardService.getDashboard();
    }
}
