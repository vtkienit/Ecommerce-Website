package com.ecommerce.app.services;

import com.ecommerce.app.dtos.CreateUserRequest;
import com.ecommerce.app.dtos.UserResponse;
import com.ecommerce.app.entities.User;
import com.ecommerce.app.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.ecommerce.app.exceptions.BaseException;
import org.springframework.http.HttpStatus;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BaseException("Email already exists", HttpStatus.CONFLICT);
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // hash password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }
}