package com.jalalert;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class JalalertApplication {
    public static void main(String[] args) {
        SpringApplication.run(JalalertApplication.class, args);
    }
}
