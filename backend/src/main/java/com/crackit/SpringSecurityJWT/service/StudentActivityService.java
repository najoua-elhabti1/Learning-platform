package com.crackit.SpringSecurityJWT.service;

import com.crackit.SpringSecurityJWT.entities.postgres.StudentActivity;
import com.crackit.SpringSecurityJWT.entities.repository.jpa.StudentActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StudentActivityService {

    @Autowired
    private StudentActivityRepository repository;

    public StudentActivity logActivity(StudentActivity activity) {
        activity.setTimestamp(LocalDateTime.now());
        return repository.save(activity);
    }

    public List<StudentActivity> getActivitiesByCourse(String courseId) {
        return repository.findByCourseId(courseId);
    }

    public List<StudentActivity> getActivitiesByStudent(String studentId) {
        return repository.findByStudentId(studentId);
    }

    public List<StudentActivity> getAllActivities() {
        return repository.findAll();
    }
}
