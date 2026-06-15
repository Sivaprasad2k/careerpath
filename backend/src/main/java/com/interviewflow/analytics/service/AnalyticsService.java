package com.interviewflow.analytics.service;

import com.interviewflow.analytics.dto.AnalyticsResponse;
import com.interviewflow.application.entity.Opportunity;
import com.interviewflow.application.entity.OpportunityStatus;
import com.interviewflow.application.repository.OpportunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OpportunityRepository opportunityRepository;

    @Transactional(readOnly = true)
    public AnalyticsResponse getDashboardStats(UUID userId) {
        List<Opportunity> opportunities = opportunityRepository.findAllByUserId(userId);

        long totalApplications = 0;
        long responsesReceived = 0;
        long assessments = 0;
        long interviews = 0;
        long offers = 0;
        long rejections = 0;

        for (Opportunity opp : opportunities) {
            OpportunityStatus status = opp.getCurrentStatus();
            if (status == OpportunityStatus.DRAFT) {
                continue; // Drafts do not count as submitted applications
            }

            totalApplications++;

            // Responses Received (anything past APPLIED state)
            if (status != OpportunityStatus.APPLIED) {
                responsesReceived++;
            }

            // Assessments
            if (status == OpportunityStatus.ASSESSMENT_RECEIVED || status == OpportunityStatus.ASSESSMENT_COMPLETED
                    || status == OpportunityStatus.INTERVIEW_SCHEDULED || status == OpportunityStatus.INTERVIEW_COMPLETED
                    || status == OpportunityStatus.OFFER_RECEIVED || status == OpportunityStatus.ACCEPTED) {
                assessments++;
            }

            // Interviews
            if (status == OpportunityStatus.INTERVIEW_SCHEDULED || status == OpportunityStatus.INTERVIEW_COMPLETED
                    || status == OpportunityStatus.OFFER_RECEIVED || status == OpportunityStatus.ACCEPTED) {
                interviews++;
            }

            // Offers
            if (status == OpportunityStatus.OFFER_RECEIVED || status == OpportunityStatus.ACCEPTED) {
                offers++;
            }

            // Rejections
            if (status == OpportunityStatus.REJECTED) {
                rejections++;
            }
        }

        double responseRate = totalApplications > 0 ? ((double) responsesReceived / totalApplications) * 100.0 : 0.0;
        double interviewRate = totalApplications > 0 ? ((double) interviews / totalApplications) * 100.0 : 0.0;
        double offerRate = totalApplications > 0 ? ((double) offers / totalApplications) * 100.0 : 0.0;

        // Round rates to 1 decimal place
        responseRate = Math.round(responseRate * 10.0) / 10.0;
        interviewRate = Math.round(interviewRate * 10.0) / 10.0;
        offerRate = Math.round(offerRate * 10.0) / 10.0;

        return new AnalyticsResponse(
                totalApplications,
                responsesReceived,
                assessments,
                interviews,
                offers,
                rejections,
                responseRate,
                interviewRate,
                offerRate
        );
    }
}
