package com.crackit.SpringSecurityJWT.entities.repository;

import com.crackit.SpringSecurityJWT.entities.postgres.Role;
import com.crackit.SpringSecurityJWT.entities.postgres.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    User findByResetToken(String token);


    boolean existsByEmail(String email);

    void deleteByRole(Role role);
}
