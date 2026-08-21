package com.ecommerce.app.services;

import com.ecommerce.app.dtos.AuthResponse;
import com.ecommerce.app.dtos.GoogleAuthRequest;
import com.ecommerce.app.dtos.UserLoginRequest;
import com.ecommerce.app.dtos.UserRegisterRequest;
import com.ecommerce.app.dtos.UserResponse;
import com.ecommerce.app.entities.User;
import com.ecommerce.app.exceptions.BaseException;
import com.ecommerce.app.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleIdentityService googleIdentityService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            GoogleIdentityService googleIdentityService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleIdentityService = googleIdentityService;
    }

    @Transactional
    public AuthResponse register(UserRegisterRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BaseException("Email already exists", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(normalizeOptional(request.getPhone()));
        user.setAddress(normalizeOptional(request.getAddress()));

        User savedUser = userRepository.save(user);
        return createAuthResponse(savedUser, true);
    }

    public AuthResponse login(UserLoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.getEmail()))
                .orElseThrow(this::invalidCredentials);

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw invalidCredentials();
        }

        return createAuthResponse(user, false);
    }

    @Transactional
    public AuthResponse authenticateWithGoogle(GoogleAuthRequest request) {
        GoogleUserInfo googleUser = googleIdentityService.verify(request.getCredential());
        String email = normalizeEmail(googleUser.email());

        Optional<User> userBySubject = userRepository.findByGoogleSubject(googleUser.subject());
        if (userBySubject.isPresent()) {
            return createAuthResponse(userBySubject.get(), false);
        }

        Optional<User> userByEmail = userRepository.findByEmailIgnoreCase(email);
        if (userByEmail.isPresent()) {
            User existingUser = userByEmail.get();

            if (existingUser.getGoogleSubject() != null
                    && !existingUser.getGoogleSubject().equals(googleUser.subject())) {
                throw new BaseException("This email is linked to another Google account", HttpStatus.CONFLICT);
            }

            existingUser.setGoogleSubject(googleUser.subject());
            return createAuthResponse(userRepository.save(existingUser), false);
        }

        User newUser = new User();
        newUser.setName(resolveGoogleName(googleUser.name(), email));
        newUser.setEmail(email);
        newUser.setGoogleSubject(googleUser.subject());

        return createAuthResponse(userRepository.save(newUser), true);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new BaseException("User not found", HttpStatus.NOT_FOUND));

        return toResponse(user);
    }

    private AuthResponse createAuthResponse(User user, boolean newUser) {
        return new AuthResponse(
                jwtService.generateToken(user),
                "Bearer",
                jwtService.getExpirationSeconds(),
                newUser,
                toResponse(user)
        );
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

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String resolveGoogleName(String name, String email) {
        if (name != null && !name.isBlank()) {
            return name.trim();
        }

        return email.substring(0, email.indexOf('@'));
    }

    private BaseException invalidCredentials() {
        return new BaseException("Invalid email or password", HttpStatus.UNAUTHORIZED);
    }
}
