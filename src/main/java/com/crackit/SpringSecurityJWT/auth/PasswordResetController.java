package com.crackit.SpringSecurityJWT.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/crackit/v1/auth")
@RequiredArgsConstructor
public class PasswordResetController {
    @Autowired
    private  AuthService service;

    @PostMapping("/request")
    public ResponseEntity<String> requestPasswordReset(@RequestBody String email) {
        System.out.println(email);
        String resetToken = service.requestPasswordReset(email,"/api/v1/password-reset/reset");
        return ResponseEntity.ok(resetToken);
    }
    @PostMapping("/reset")
    public ResponseEntity<String> PasswordReset(@RequestParam("token") String token,@RequestBody String new_pass) {
        service.resetPassword(token,new_pass);
        return ResponseEntity.ok("Password reset successfully");
    }

}
