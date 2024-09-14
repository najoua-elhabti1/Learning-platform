package com.crackit.SpringSecurityJWT.entities.repository.jpa;

import com.crackit.SpringSecurityJWT.entities.postgres.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {

    Student findByEmail(String username);


}
