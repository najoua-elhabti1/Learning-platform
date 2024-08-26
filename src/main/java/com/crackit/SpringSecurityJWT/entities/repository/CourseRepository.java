package com.crackit.SpringSecurityJWT.entities.repository;

import com.crackit.SpringSecurityJWT.entities.mongo.CoursDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends MongoRepository<CoursDocument, String> {
    boolean existsByCourseName(String courseName);

    Optional<CoursDocument> findByCourseName(String courseName);
}