package com.ecommerce.app.controllers;

import com.ecommerce.app.dtos.UserAddressUpdateRequest;
import com.ecommerce.app.dtos.UserProfileUpdateRequest;
import com.ecommerce.app.dtos.UserResponse;
import com.ecommerce.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(Authentication authentication) {
        return userService.getCurrentUser(authentication.getName());
    }

    @PatchMapping("/me")
    public UserResponse updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody UserProfileUpdateRequest request
    ) {
        return userService.updateCurrentUser(authentication.getName(), request);
    }

    @PatchMapping("/me/address")
    public UserResponse updateCurrentAddress(
            Authentication authentication,
            @Valid @RequestBody UserAddressUpdateRequest request
    ) {
        return userService.updateCurrentAddress(authentication.getName(), request);
    }
}
