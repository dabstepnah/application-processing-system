package com.helpdesk.auth.config;

import com.helpdesk.auth.entity.Role;
import com.helpdesk.auth.entity.User;
import com.helpdesk.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrapConfig {

    @Bean
    CommandLineRunner bootstrapAdmin(UserRepository userRepository, PasswordEncoder encoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                // Создаем администратора один раз при первом запуске.
                userRepository.save(User.builder()
                        .username("admin")
                        .email("admin@helpdesk.local")
                        .passwordHash(encoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .banned(false)
                        .build());
            }
        };
    }
}
