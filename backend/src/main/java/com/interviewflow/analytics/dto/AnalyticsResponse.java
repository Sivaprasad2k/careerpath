package com.interviewflow.analytics.dto;

public record AnalyticsResponse(
        long totalApplications,
        long responsesReceived,
        long assessments,
        long interviews,
        long offers,
        long rejections,
        double responseRate,
        double interviewRate,
        double offerRate
) {}
