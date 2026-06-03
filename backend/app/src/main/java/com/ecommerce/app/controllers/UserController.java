package com.ecommerce.app.controllers;

import com.ecommerce.app.dtos.UserLoginRequest;
import com.ecommerce.app.dtos.UserLoginResponse;
import com.ecommerce.app.dtos.UserRegisterRequest;
import com.ecommerce.app.dtos.UserResponse;
import com.ecommerce.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public UserResponse createUser(@Valid @RequestBody UserRegisterRequest request) {
        return userService.createUser(request);
    }

    @PostMapping("/login")
    public UserLoginResponse login(@Valid @RequestBody UserLoginRequest request) {
        return userService.login(request);
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return userService.getAllUsers(authorizationHeader);
    }

    @GetMapping("/user/{email}")
    public UserResponse getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email);
    }
}