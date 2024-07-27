package com.crackit.SpringSecurityJWT.auth;

import com.crackit.SpringSecurityJWT.config.JwtService;
import com.crackit.SpringSecurityJWT.user.Role;
import com.crackit.SpringSecurityJWT.user.User;
import com.crackit.SpringSecurityJWT.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
        //FirstStep
            //We need to validate our request (validate whether password & username is correct)
            //Verify whether user present in the database
            //Which AuthenticationProvider -> DaoAuthenticationProvider (Inject)
            //We need to authenticate using authenticationManager injecting this authenticationProvider
        //SecondStep
            //Verify whether userName and password is correct => UserNamePasswordAuthenticationToken
            //Verify whether user present in db
            //generateToken
            //Return the token
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        String jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder().accessToken(jwtToken)
                .role(Role.valueOf(user.getRole().toString()))
                .build();

    }

    public String requestPasswordReset(String email, String resetUrl) {
        System.out.println(email);
        Optional<User> user = userRepository.findByEmail(email);
        System.out.println(user);
        if (user != null) {
            String resetToken = UUID.randomUUID().toString();
            LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(24); // Example: Token expires after 24 hours
            user.get().setResetToken(resetToken);
            user.get().setTokenExpiry(tokenExpiry);
            userRepository.save(user.get());
            System.out.println("hy");
            System.out.println(user.get().getEmail());
            // Send email with reset token and reset URL to user
            sendPasswordResetEmail(user.get().getEmail(), resetToken, resetUrl);
            return resetToken;
        } else {
            return  "";
            // Handle case when user with given email is not found
        }
    }
    private void sendPasswordResetEmail(String email, String resetToken, String resetUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
//        message.setFrom(fromEmail);
        message.setTo(email);

        message.setSubject("Password Reset Request");
        message.setText("To reset your password, please click the link below:\n" + resetUrl + "?token=" + resetToken);
        System.out.println("before sent");
        emailSender.send(message);
        System.out.println("after sent");
    }
    public void resetPassword(String token, String newPassword) {
        System.out.println(newPassword);
        System.out.println(token);
        User user = userRepository.findByResetToken(token);
        System.out.println(user);
        if (user != null && user.getTokenExpiry().isAfter(LocalDateTime.now())) {
            System.out.println(user.getPassword());
            System.out.println("hyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
            user.setPassword(this.passwordEncoder.encode(newPassword));
            System.out.println(user.getPassword());

            user.setResetToken(null);
            user.setTokenExpiry(null);
            userRepository.save(user);
            sendPasswordResetConfirmationEmail(user.getEmail());

        } else {
            // Handle invalid or expired token
        }
    }
    private void sendPasswordResetConfirmationEmail(String email) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset Confirmation");
        message.setText("Your password has been successfully reset.");

        emailSender.send(message);
    }
}

