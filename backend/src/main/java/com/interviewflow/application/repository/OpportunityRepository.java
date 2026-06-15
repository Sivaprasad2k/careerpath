package com.interviewflow.application.repository;

import com.interviewflow.application.entity.Opportunity;
import com.interviewflow.application.entity.OpportunityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, UUID> {

    Page<Opportunity> findAllByUserId(UUID userId, Pageable pageable);

    List<Opportunity> findAllByUserId(UUID userId);

    List<Opportunity> findAllByUserIdAndCurrentStatus(UUID userId, OpportunityStatus currentStatus);

    Optional<Opportunity> findByIdAndUserId(UUID id, UUID userId);

    long countByUserIdAndCurrentStatus(UUID userId, OpportunityStatus currentStatus);

    @Query("SELECT o FROM Opportunity o WHERE o.userId = :userId ORDER BY o.updatedAt DESC")
    List<Opportunity> findRecentByUserId(@Param("userId") UUID userId, Pageable pageable);

    boolean existsByUserIdAndCompanyNameIgnoreCaseAndRoleNameIgnoreCase(UUID userId, String companyName, String roleName);
}

