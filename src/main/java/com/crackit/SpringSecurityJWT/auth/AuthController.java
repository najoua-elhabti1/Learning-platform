package com.crackit.SpringSecurityJWT.auth;

import com.crackit.SpringSecurityJWT.config.JwtService;
import com.crackit.SpringSecurityJWT.user.User;
import com.crackit.SpringSecurityJWT.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/crackit/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final AuthService authService;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest registerRequest
    ) {
        AuthenticationResponse authResponse = authService.register(registerRequest);
        return  ResponseEntity.ok(authResponse);
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
       return ResponseEntity.ok(authService.authenticate(request));
    }
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        Map<String, String> response = null;
        try {
            // Clear the authentication context
            SecurityContextHolder.clearContext();
            System.out.println("logged out!!!!");
            response = new HashMap<>();
            response.put("message", "Logged out successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "An error occurred during logout");
            return ResponseEntity.ok(response);

        }
    }
    @GetMapping("/userinfo")
    public Optional<User> getUserInfo(@RequestHeader("Authorization") String token) {
        // Validate token and extract username (pseudo-code)
        String username = validateTokenAndGetUsername(token);
        System.out.println(userRepository.findByEmail(username));
        return userRepository.findByEmail(username);
    }
    private String validateTokenAndGetUsername(String token) {
        try {
            // Remove "Bearer " prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            // Parse the token
            Claims claims = Jwts.parser()
                    .setSigningKey(JwtService.getSecretKey().getBytes())
                    .parseClaimsJws(token)
                    .getBody();

            // Extract the username
            return claims.getSubject(); // Assuming the username is stored in the subject
        } catch (SignatureException e) {
            throw new RuntimeException("Invalid JWT signature", e);
        } catch (Exception e) {
            throw new RuntimeException("Token validation failed", e);
        }
    }
}
