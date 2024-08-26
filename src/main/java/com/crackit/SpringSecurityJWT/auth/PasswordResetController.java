package com.crackit.SpringSecurityJWT.auth;

import com.crackit.SpringSecurityJWT.entities.postgres.User;
import com.crackit.SpringSecurityJWT.entities.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/crackit/v1/auth")
@RequiredArgsConstructor
public class PasswordResetController {
    @Autowired
    private  AuthService service;
    @Autowired
    private UserRepository repository;


    @PostMapping("/request")
    public ResponseEntity<String> requestPasswordReset(@RequestBody String email) {
        System.out.println(email);
        String resetToken = service.requestPasswordReset(email,"http://localhost:4200/reset-password");
        return ResponseEntity.ok(resetToken);
    }
    @PostMapping("/reset")
    public ResponseEntity<String> PasswordReset(@RequestParam("token") String token,@RequestBody String new_pass) {
        service.resetPassword(token,new_pass);
        return ResponseEntity.ok("Password reset successfully");
    }
    @PostMapping("/is-token-expired")
    public ResponseEntity<Boolean> isTokenExpired(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        Optional<User> userOptional = Optional.ofNullable(repository.findByResetToken(token));

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            boolean expired = service.isTokenExpired(user.getTokenExpiry());
            return ResponseEntity.ok(expired);
        } else {
            return ResponseEntity.ok(true);
        }
    }


}
