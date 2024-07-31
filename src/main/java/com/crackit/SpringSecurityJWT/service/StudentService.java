package com.crackit.SpringSecurityJWT.service;

import com.crackit.SpringSecurityJWT.user.Student;
import com.crackit.SpringSecurityJWT.user.repository.StudentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Transactional
    public void registerStudents(List<Student> students) {
        studentRepository.saveAll(students);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

}
