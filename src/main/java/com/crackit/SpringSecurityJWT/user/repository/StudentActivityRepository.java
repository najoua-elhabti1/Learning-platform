package com.crackit.SpringSecurityJWT.user.repository;

import com.crackit.SpringSecurityJWT.user.StudentActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentActivityRepository extends JpaRepository<StudentActivity, Long> {
    List<StudentActivity> findByCourseId(String courseId);
    List<StudentActivity> findByStudentId(String studentId);
    // Add more custom queries as needed
}
