package com.smarthire.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String email;

    @Column(name = "resume_text", columnDefinition = "TEXT")
    private String resumeText;

    @Column(name = "extracted_skills", columnDefinition = "TEXT")
    private String extractedSkills;

    @Column(name = "match_score", nullable = false)
    private Double matchScore;

    @Column(name = "match_summary", columnDefinition = "TEXT")
    private String matchSummary;

    @Column(nullable = false)
    private String status; // "shortlisted" | "talent_pool" | "rejected"

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Candidate() {
    }

    public Candidate(String name, String email, String resumeText, String extractedSkills,
                     Double matchScore, String matchSummary, String status, Long jobId) {
        this.name = name;
        this.email = email;
        this.resumeText = resumeText;
        this.extractedSkills = extractedSkills;
        this.matchScore = matchScore;
        this.matchSummary = matchSummary;
        this.status = status;
        this.jobId = jobId;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getResumeText() {
        return resumeText;
    }

    public void setResumeText(String resumeText) {
        this.resumeText = resumeText;
    }

    public String getExtractedSkills() {
        return extractedSkills;
    }

    public void setExtractedSkills(String extractedSkills) {
        this.extractedSkills = extractedSkills;
    }

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }

    public String getMatchSummary() {
        return matchSummary;
    }

    public void setMatchSummary(String matchSummary) {
        this.matchSummary = matchSummary;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Candidate{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", matchScore=" + matchScore +
                ", status='" + status + '\'' +
                ", jobId=" + jobId +
                '}';
    }
}
