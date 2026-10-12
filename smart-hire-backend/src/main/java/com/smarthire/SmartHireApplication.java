package com.smarthire;

import com.smarthire.model.Job;
import com.smarthire.repository.JobRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class SmartHireApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartHireApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * Seeds initial demo jobs so the application is ready for testing immediately.
     */
    @Bean
    public CommandLineRunner initDemoData(JobRepository jobRepository) {
        return args -> {
            if (jobRepository.count() == 0) {
                jobRepository.save(new Job(
                        "Senior Java Backend Engineer",
                        "Design and build scalable microservices using Spring Boot, Hibernate, and RESTful APIs. Experience with cloud environments and distributed systems is preferred.",
                        "Java, Spring Boot, SQL, Docker, Git, REST",
                        "Senior",
                        "Engineering"
                ));

                jobRepository.save(new Job(
                        "AI & Python Software Engineer",
                        "Develop machine learning pipelines, LLM-based microservices, and NLP algorithms for automated data extraction and classification.",
                        "Python, FastAPI, Machine Learning, NLP, Docker",
                        "Mid",
                        "Data & AI"
                ));

                jobRepository.save(new Job(
                        "Full Stack Web Developer",
                        "Build interactive user interfaces with React and connect them with robust backend microservices. Focus on responsiveness and clean code.",
                        "JavaScript, React, HTML, CSS, Java, SQL",
                        "Junior",
                        "Product"
                ));
            }
        };
    }
}
