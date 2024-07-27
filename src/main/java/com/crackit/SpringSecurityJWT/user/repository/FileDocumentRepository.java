package com.crackit.SpringSecurityJWT.user.repository;

import com.crackit.SpringSecurityJWT.user.FileDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface FileDocumentRepository extends MongoRepository<FileDocument, String> {
    Optional<FileDocument> findByChapter(String chapter);
}
