package com.ecommerce.app.controllers;

import com.ecommerce.app.dtos.UserLoginRequest;
import com.ecommerce.app.dtos.UserLoginResponse;
import com.ecommerce.app.dtos.UserRegisterRequest;
import com.ecommerce.app.dtos.UserResponse;
import com.ecommerce.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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

    @GetMapping("/by-email")
    public UserResponse getUserByEmail(@RequestParam String email) {
        return userService.getUserByEmail(email);
    }
}