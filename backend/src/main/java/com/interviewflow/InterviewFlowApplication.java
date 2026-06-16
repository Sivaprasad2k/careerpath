package com.interviewflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class InterviewFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(InterviewFlowApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.ApplicationRunner diagnosticRunner() {
        return args -> {
            System.out.println("====================================================");
            System.out.println("DIAGNOSTIC: InterviewFlowApplication fully started up!");
            System.out.println("====================================================");
        };
    }
}
