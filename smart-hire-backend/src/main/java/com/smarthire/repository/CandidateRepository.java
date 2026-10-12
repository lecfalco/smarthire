package com.smarthire.repository;

import com.smarthire.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    List<Candidate> findByJobIdOrderByMatchScoreDesc(Long jobId);

    List<Candidate> findByStatusOrderByMatchScoreDesc(String status);

    List<Candidate> findByStatusAndExtractedSkillsContainingIgnoreCaseOrderByMatchScoreDesc(String status, String skill);

    long countByStatus(String status);
}
