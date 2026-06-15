package com.interviewflow.common;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Base class for all integration tests.
 *
 * Uses a real PostgreSQL container (via Testcontainers) if Docker is available,
 * otherwise falls back to a local PostgreSQL test database.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(AbstractIntegrationTest.FlywayCleanConfig.class)
public abstract class AbstractIntegrationTest {

    static final PostgreSQLContainer<?> postgres;
    static final boolean isDockerAvailable;

    static {
        boolean dockerOk = false;
        PostgreSQLContainer<?> container = null;
        try {
            if (org.testcontainers.DockerClientFactory.instance().isDockerAvailable()) {
                container = new PostgreSQLContainer<>("postgres:16-alpine")
                        .withDatabaseName("interviewflow_test")
                        .withUsername("test")
                        .withPassword("test");
                container.start();
                dockerOk = true;
            }
        } catch (Throwable t) {
            System.err.println("Docker is not available. Falling back to local PostgreSQL database. Error: " + t.getMessage());
        }
        postgres = container;
        isDockerAvailable = dockerOk;
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (isDockerAvailable && postgres != null) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl);
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
        } else {
            registry.add("spring.datasource.url", () -> "jdbc:postgresql://localhost:5432/interviewflow_test");
            registry.add("spring.datasource.username", () -> "interviewflow");
            registry.add("spring.datasource.password", () -> "Siva@2k5");
        }
    }

    @TestConfiguration
    static class FlywayCleanConfig {
        @Bean
        public FlywayMigrationStrategy flywayMigrationStrategy() {
            return flyway -> {
                flyway.clean();
                flyway.migrate();
            };
        }
    }
}
