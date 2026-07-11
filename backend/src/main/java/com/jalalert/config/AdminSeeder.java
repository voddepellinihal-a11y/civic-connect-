package com.jalalert.config;

import com.jalalert.entity.Role;
import com.jalalert.entity.User;
import com.jalalert.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@civicconnect.gov")) {
            User admin = User.builder()
                    .fullName("System Administrator")
                    .email("admin@civicconnect.gov")
                    .phone("9000000000")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Admin user seeded: admin@civicconnect.gov / admin123");
        }
    }
}
