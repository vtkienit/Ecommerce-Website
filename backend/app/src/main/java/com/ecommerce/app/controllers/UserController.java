package com.ecommerce.app.controllers;

import com.ecommerce.app.dtos.CreateUserRequest;
import com.ecommerce.app.dtos.UserResponse;
import com.ecommerce.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }
}