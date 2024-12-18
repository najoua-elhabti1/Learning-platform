package com.crackit.SpringSecurityJWT.service;

import com.crackit.SpringSecurityJWT.entities.postgres.Role;
import com.crackit.SpringSecurityJWT.entities.postgres.User;
import com.crackit.SpringSecurityJWT.entities.repository.jpa.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void registerUser(User user) {
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        user.setNeedsPasswordChange(true);
        userRepository.save(user);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public void deleteAllStudents() {
        userRepository.deleteByRole(Role.Student);


    }

}
