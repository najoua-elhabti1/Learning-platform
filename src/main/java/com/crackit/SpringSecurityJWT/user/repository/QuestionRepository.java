package com.crackit.SpringSecurityJWT.user.repository;

import com.crackit.SpringSecurityJWT.user.QuestionReponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<QuestionReponse, Integer> {
}
