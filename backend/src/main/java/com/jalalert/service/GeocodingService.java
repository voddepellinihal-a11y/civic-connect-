package com.jalalert.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeocodingService {

    @Value("${app.google.maps.key:}")
    private String apiKey;

    private final WebClient webClient;

    public GeocodingService() {
        HttpClient httpClient = HttpClient.create(
                ConnectionProvider.builder("geocoding").maxConnections(10).build()
        ).responseTimeout(Duration.ofSeconds(10));

        this.webClient = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    public double[] geocode(String address) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Google Maps API key not configured, using fallback coordinates");
            return new double[]{0.0, 0.0};
        }

        try {
            Map<?, ?> response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("maps.googleapis.com")
                            .path("/maps/api/geocode/json")
                            .queryParam("address", address)
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(Duration.ofSeconds(10));

            if (response != null && "OK".equals(response.get("status"))) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
                if (results != null && !results.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> geometry = (Map<String, Object>) results.get(0).get("geometry");
                    @SuppressWarnings("unchecked")
                    Map<String, Object> location = (Map<String, Object>) geometry.get("location");
                    double lat = ((Number) location.get("lat")).doubleValue();
                    double lng = ((Number) location.get("lng")).doubleValue();
                    log.info("Geocoded '{}' -> lat={}, lng={}", address, lat, lng);
                    return new double[]{lat, lng};
                }
            }

            log.warn("Geocoding returned status: {}", response != null ? response.get("status") : "null");
            return new double[]{0.0, 0.0};
        } catch (Exception e) {
            log.warn("Geocoding failed: {}. Using fallback coordinates.", e.getMessage());
            return new double[]{0.0, 0.0};
        }
    }
}
