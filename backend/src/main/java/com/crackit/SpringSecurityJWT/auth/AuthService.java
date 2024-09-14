package com.crackit.SpringSecurityJWT.auth;

import com.crackit.SpringSecurityJWT.config.JwtService;
import com.crackit.SpringSecurityJWT.entities.postgres.Role;
import com.crackit.SpringSecurityJWT.entities.postgres.User;
import com.crackit.SpringSecurityJWT.entities.repository.jpa.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.mail.SimpleMailMessage;

@Service
@RequiredArgsConstructor
public class AuthService {
    private  final UserRepository userRepository;
    private  final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    @Autowired
    private JavaMailSender emailSender;

    public AuthenticationResponse register(RegisterRequest registerRequest) {
        var user = User.builder()
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(registerRequest.getRole())
                .build();
        var savedUser = userRepository.save(user);
        String jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder().accessToken(jwtToken).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // Validate credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Fetch user details
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        // Generate JWT token
        String jwtToken = jwtService.generateToken(user);

        // Return response with needsPasswordChange flag
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .role(Role.valueOf(user.getRole().toString()))
                .needsPasswordChange(user.isNeedsPasswordChange())
                .build();
    }

    public String requestPasswordReset(String email, String resetUrl) {
        System.out.println(email);
        Optional<User> user = userRepository.findByEmail(email);
        System.out.println(user);
        if (user != null) {
            String resetToken = UUID.randomUUID().toString();
            LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(1);
            user.get().setResetToken(resetToken);
            user.get().setTokenExpiry(tokenExpiry);
            System.out.println(tokenExpiry);
            userRepository.save(user.get());
            System.out.println("hy");
            System.out.println(user.get().getEmail());
            // Send email with reset token and reset URL to user
            sendPasswordResetEmail(user.get().getEmail(), resetToken, resetUrl);
            return resetToken;
        } else {
            return  "";

        }
    }
    private void sendPasswordResetEmail(String email, String resetToken, String resetUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
//        message.setFrom(fromEmail);
        message.setTo(email);

        message.setSubject("Demande de Réinitialisation de Mot de Passe");
        message.setText("Pour réinitialiser votre mot de passe, veuillez visiter le lien suivant :\n" + resetUrl + "?token=" + resetToken+"\nCe lien va expirer dans 1 heure.\n" +
                "Merci !");
        System.out.println("before sent");
        emailSender.send(message);
        System.out.println("after sent");
    }
    public String resetPassword(String token, String newPassword) {
        System.out.println(newPassword);
        System.out.println(token);
        User user = userRepository.findByResetToken(token);
        System.out.println(user);
        if (user != null && user.getTokenExpiry().isAfter(LocalDateTime.now())) {

            user.setPassword(this.passwordEncoder.encode(newPassword));

            user.setResetToken(null);
            user.setTokenExpiry(null);
            userRepository.save(user);
            sendPasswordResetConfirmationEmail(user.getEmail());
            return "mot de passe modifie";

        } else {
            return "Reset token est expire.";
        }
    }
    public boolean isTokenExpired(LocalDateTime tokenExpiry) {
        System.out.println(LocalDateTime.now().isAfter(tokenExpiry));
        return LocalDateTime.now().isAfter(tokenExpiry);
    }
    private void sendPasswordResetConfirmationEmail(String email) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Confirmation de changement de mot de passe");
        message.setText("votre mot de passe est modifiee avec succes.");

        emailSender.send(message);
    }
    public void changePassword(String email, String oldPassword, String newPassword) {
        // Authenticate the user with the old password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, oldPassword)
        );

        // Fetch the user from the database
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Update the password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setNeedsPasswordChange(false);

        // Save the updated user
        userRepository.save(user);
    }
}

