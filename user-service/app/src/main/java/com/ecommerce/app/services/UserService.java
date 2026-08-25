package com.ecommerce.app.services;

import com.ecommerce.app.dtos.AuthResponse;
import com.ecommerce.app.dtos.GoogleAuthRequest;
import com.ecommerce.app.dtos.GoogleUserInfo;
import com.ecommerce.app.dtos.UserLoginRequest;
import com.ecommerce.app.dtos.UserAddressUpdateRequest;
import com.ecommerce.app.dtos.UserProfileUpdateRequest;
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

        return createAuthResponse(userRepository.save(user), true);
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
        String email = normalizeEmail(googleUser.getEmail());

        User user = userRepository.findByGoogleSubject(googleUser.getSubject()).orElse(null);
        if (user != null) {
            return createAuthResponse(user, false);
        }

        user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        boolean newUser = user == null;

        if (newUser) {
            user = new User();
            user.setName(resolveGoogleName(googleUser.getName(), email));
            user.setEmail(email);
        } else if (user.getGoogleSubject() != null) {
            throw new BaseException("This email is linked to another Google account", HttpStatus.CONFLICT);
        }

        user.setGoogleSubject(googleUser.getSubject());

        return createAuthResponse(userRepository.save(user), newUser);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getCurrentUser(String email) {
        return toResponse(findUserByEmail(email));
    }

    @Transactional
    public UserResponse updateCurrentUser(String email, UserProfileUpdateRequest request) {
        User user = findUserByEmail(email);
        user.setName(request.getName().trim());
        user.setPhone(emptyToNull(request.getPhone()));
        user.setGender(emptyToNull(request.getGender()));
        user.setDateOfBirth(request.getDateOfBirth());

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateCurrentAddress(String email, UserAddressUpdateRequest request) {
        User user = findUserByEmail(email);
        String addressLine = request.getAddressLine().trim();
        String wardName = request.getWardName().trim();
        String provinceName = request.getProvinceName().trim();

        user.setAddressLine(addressLine);
        user.setProvinceCode(request.getProvinceCode());
        user.setProvinceName(provinceName);
        user.setWardCode(request.getWardCode());
        user.setWardName(wardName);
        user.setAddress(String.join(", ", addressLine, wardName, provinceName));

        return toResponse(userRepository.save(user));
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
                user.getAddressLine(),
                user.getProvinceCode(),
                user.getProvinceName(),
                user.getWardCode(),
                user.getWardName(),
                user.getGender(),
                user.getDateOfBirth(),
                user.getRole()
        );
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new BaseException("User not found", HttpStatus.NOT_FOUND));
    }

    private String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String resolveGoogleName(String name, String email) {
        return name == null || name.isBlank()
                ? email.substring(0, email.indexOf('@'))
                : name.trim();
    }

    private BaseException invalidCredentials() {
        return new BaseException("Invalid email or password", HttpStatus.UNAUTHORIZED);
    }
}
