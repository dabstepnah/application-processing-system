package com.helpdesk.auth.service;

import com.helpdesk.auth.dto.*;
import com.helpdesk.auth.entity.Role;
import com.helpdesk.auth.entity.User;
import com.helpdesk.auth.exception.BadRequestException;
import com.helpdesk.auth.exception.NotFoundException;
import com.helpdesk.auth.exception.UnauthorizedException;
import com.helpdesk.auth.repository.UserRepository;
import com.helpdesk.auth.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    // Регистрация нового пользователя с базовыми проверками уникальности.
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Пользователь с таким username уже существует");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Пользователь с таким email уже существует");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .banned(false)
                .build();

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved.getId(), saved.getUsername(), saved.getRole());
        return new AuthResponse(token, saved.getId(), saved.getUsername(), saved.getRole());
    }

    // Авторизация по username/password и выдача JWT.
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new UnauthorizedException("Неверные учетные данные"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Неверные учетные данные");
        }
        if (user.isBanned()) {
            throw new UnauthorizedException("Пользователь заблокирован");
        }

        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getRole());
    }

    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        return map(user);
    }

    public List<UserResponse> getAll() {
        return userRepository.findAll().stream().map(this::map).toList();
    }

    public void ban(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        user.setBanned(true);
        userRepository.save(user);
    }

    public void unban(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        user.setBanned(false);
        userRepository.save(user);
    }

    private UserResponse map(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(), user.isBanned(), user.getCreatedAt());
    }
}
