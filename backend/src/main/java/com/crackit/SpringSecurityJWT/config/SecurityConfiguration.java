package com.crackit.SpringSecurityJWT.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

import static com.crackit.SpringSecurityJWT.entities.postgres.Role.ADMIN;
import static org.springframework.http.HttpMethod.*;
import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfiguration {

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable()) // Disable CSRF
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.disable()) // Disable X-Frame-Options header
                        .addHeaderWriter((request, response) -> response.setHeader(
                                "Content-Security-Policy",
                                "default-src 'self'; style-src 'self' https://stackpath.bootstrapcdn.com https://cdnjs.cloudflare.com; font-src 'self' https://stackpath.bootstrapcdn.com https://cdnjs.cloudflare.com; connect-src 'self' http://localhost:8080; frame-ancestors 'self' http://localhost:4200"
                        )))
                .authorizeHttpRequests(req -> req
                        .requestMatchers("/crackit/v1/auth/**").permitAll()
                        .requestMatchers("/crackit/v1/prof/add_questions").permitAll()
                        .requestMatchers("/crackit/v1/admin/**").hasRole(ADMIN.name())
                        .requestMatchers("/crackit/v1/student/**").permitAll()
                        .requestMatchers(GET, "/crackit/v1/admin/**").hasRole(ADMIN.name())
                        .requestMatchers(POST, "/crackit/v1/admin/**").hasRole(ADMIN.name())


                        .requestMatchers(GET, "/crackit/v1/prof/**").permitAll()
                        .requestMatchers(PUT, "/crackit/v1/prof/**").permitAll()
                        .requestMatchers(DELETE, "/crackit/v1/prof/**").permitAll()
                        .requestMatchers(POST, "/crackit/v1/prof/**").permitAll()
                        .requestMatchers(DELETE, "/crackit/v1/prof/**").permitAll()

                        .requestMatchers(GET, "/crackit/v1/student/**").permitAll()
                        .requestMatchers(POST, "/crackit/v1/student/**").permitAll()

                        .requestMatchers(GET, "/crackit/v1/prof/**").permitAll()
                        .requestMatchers(PUT, "/crackit/v1/prof/**").permitAll()
                        .requestMatchers(DELETE, "/crackit/v1/prof/**").permitAll()
                        .requestMatchers(POST, "/crackit/v1/prof/**").permitAll()
                        .requestMatchers(POST, "/crackit/v1/prof/create_cours").permitAll()
                        .requestMatchers(DELETE, "/crackit/v1/prof/**").permitAll()
                        .requestMatchers(GET, "/crackit/v1/student/**").permitAll()
                        .requestMatchers(POST, "/crackit/v1/student/**").permitAll()

                        .anyRequest().authenticated())
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of("http://localhost")); // Replace with your frontend URL
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
