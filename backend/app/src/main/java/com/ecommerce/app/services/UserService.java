package com.ecommerce.app.services;

import com.ecommerce.app.dtos.UserLoginRequest;
import com.ecommerce.app.dtos.UserLoginResponse;
import com.ecommerce.app.dtos.UserRegisterRequest;
import com.ecommerce.app.dtos.UserResponse;
import com.ecommerce.app.entities.User;
import com.ecommerce.app.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.ecommerce.app.exceptions.BaseException;
import org.springframework.http.HttpStatus;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse createUser(UserRegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BaseException("Email already exists", HttpStatus.CONFLICT);
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // hash password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    public UserLoginResponse login(UserLoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BaseException( "Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BaseException(
                    "Invalid email or password",
                    HttpStatus.UNAUTHORIZED
            );
        }

        String token = jwtService.generateToken(user);

        UserResponse userResponse = toResponse(user);

        return new UserLoginResponse(token, userResponse);
    }

    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUserByEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException("User not found", HttpStatus.NOT_FOUND));

        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getRole()
        );
    }
}