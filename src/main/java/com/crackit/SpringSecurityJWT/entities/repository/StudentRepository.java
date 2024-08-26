package com.crackit.SpringSecurityJWT.entities.repository;

import com.crackit.SpringSecurityJWT.entities.postgres.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Integer> {

    Student findByEmail(String username);


}
