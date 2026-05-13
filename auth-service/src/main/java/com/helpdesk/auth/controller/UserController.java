package com.helpdesk.auth.controller;

import com.helpdesk.auth.dto.UserResponse;
import com.helpdesk.auth.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/api/users/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @GetMapping("/api/admin/users")
    public List<UserResponse> getAllUsers() {
        return userService.getAll();
    }

    @PatchMapping("/api/admin/users/{id}/ban")
    public ResponseEntity<Map<String, String>> ban(@PathVariable Long id) {
        userService.ban(id);
        return ResponseEntity.ok(Map.of("message", "Пользователь заблокирован"));
    }

    @PatchMapping("/api/admin/users/{id}/unban")
    public ResponseEntity<Map<String, String>> unban(@PathVariable Long id) {
        userService.unban(id);
        return ResponseEntity.ok(Map.of("message", "Пользователь разблокирован"));
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "auth-service");
    }
}
