package com.crackit.SpringSecurityJWT.entities.repository.mongo;

import com.crackit.SpringSecurityJWT.entities.mongo.Question;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends MongoRepository<Question, Integer> {
}
